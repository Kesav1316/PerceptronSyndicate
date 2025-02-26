import cv2
import google.generativeai as genai
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from langchain.memory import ConversationBufferMemory
from langchain.llms.base import LLM
from typing import Optional, List
from PIL import Image
import base64
from io import BytesIO
import numpy as np
import os
from ultralytics import YOLO
import json

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Allow frontend to access API

# Set up Google API Key
genai.configure(api_key="AIzaSyD7_MtufShX24UvJiY4GM3SlPESKNONWYA")

# Memory to track components & progress
memory = ConversationBufferMemory(memory_key="components_list", return_messages=True)

class GoogleGeminiVision(LLM):
    model_name: str = "gemini-1.5-flash"

    def _call(self, prompt: str, images: List[Image.Image] = None, stop: Optional[List[str]] = None) -> str:
        try:
            model = genai.GenerativeModel(self.model_name)
            image_parts = []

            if images:
                for img in images:
                    buffered = BytesIO()
                    img_format = img.format if img.format else "PNG"
                    mime_type = f"image/{img_format.lower()}"
                    img.save(buffered, format=img_format)
                    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
                    image_parts.append({"mime_type": mime_type, "data": img_base64})

            request = [{"text": prompt}] + image_parts
            response = model.generate_content(request)

            if response and response.text:
                result = response.text.strip()
            else:
                result = "No response from AI model."

            memory.save_context({"input": prompt}, {"output": result})

            return result
        except Exception as e:
            return f"Error: {str(e)}"

    @property
    def _identifying_params(self) -> dict:
        return {"model_name": self.model_name}

    @property
    def _llm_type(self) -> str:
        return "GoogleGeminiVision"

llm2 = GoogleGeminiVision()

@app.route("/find_reaction",methods=["POST"])
def find_reaction():
    try:
        data= request.json
        reaction = data.get("reaction")
        data = llm2(f"Will these elements react just say yes/no {reaction} . If yes then say their products in comma separated manner. Strictly no more than this,for every question answer in only comma separated manner no need ")
        a = data.split(",")
        if a[0].lower() == "yes" : 
            a = a[1:]
            data = a[0]
            for i in a[1:] : 
                data += ","+i
        else : data = "no"

        json_file = "reactions.json"
        try:
            with open(json_file, 'r') as file:
                data1 = json.load(file)
        except FileNotFoundError: data1 = {"elements":{},"reactions":{}}
        
        data1["reactions"][reaction] = a
        print(a)
        with open(json_file, 'w') as file: json.dump(data1, file, indent=2)

        response = make_response(jsonify({"data": data}))
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response
    except Exception as e:
        response = make_response(jsonify({"error": str(e)}), 500)
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
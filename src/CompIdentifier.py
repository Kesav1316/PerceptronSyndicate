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

# Initialize Model
llm = GoogleGeminiVision()

@app.route("/identify", methods=["POST"])
def identify_component():
    try:
        data = request.json
        image_data = data.get("image")

        if not image_data:
            return make_response(jsonify({"error": "No image provided"}), 400)

        # Decode Base64 image properly
        if "," in image_data:
            image_data = image_data.split(",")[1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))

        # Use GoogleGeminiVision for identification
        component_info = llm("Identify this electronic component and provide a detailed explanation.", images=[image])

        response = make_response(jsonify({"component_info": component_info}))
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

    except Exception as e:
        response = make_response(jsonify({"error": str(e)}), 500)
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

@app.route("/check_wiring", methods=["POST"])
def check_wiring():
    try:
        response = make_response(jsonify({"message": "Wiring check feature is under development"}))
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response
    except Exception as e:
        response = make_response(jsonify({"error": str(e)}), 500)
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

@app.route("/generate_projects", methods=["POST"])
def generate_projects():
    try:
        response = make_response(jsonify({"message": "Project suggestion feature is under development"}))
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response
    except Exception as e:
        response = make_response(jsonify({"error": str(e)}), 500)
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

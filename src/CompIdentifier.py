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

model = YOLO(r'src\aruduino_mega_v8.pt')

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

def process_image(image_data,model):
    # Decode base64 image
    encoded_data = image_data.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img = cv2.resize(img, (640, 640))
    # Run inference
    height, width, channels = img.shape
    xsc = width/640
    ysc = height/640
    results = model.predict(img)
    
    # Process results
    detections = []
    for r in results:
        boxes = r.boxes
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            name = model.names[cls]
            detections.append({
                'bbox': [x1, y1, x2, y2],
                'confidence': conf,
                'class': name
            })
    return detections

def rectify(stri):
    try:
        stri = stri.split("\n")
        rectDict = [["Component Name",stri[0].split("**")[1]]]
        for i in stri[1:]:
            if i != "":
                i = i.split("**")
                try : rectDict.append([i[1][:-1],i[2:]])
                except:pass
        return rectDict
    except : return rectDict

# Initialize Model
llm = GoogleGeminiVision()

@app.route("/identify", methods=["POST"])
def identify_component():
    try:
        data = request.json
        image_data = data.get("image")

        if not image_data:
            return make_response(jsonify({"error": "No image provided"}), 400)
        
        #abc = process_image(image_data,model)

        # Decode Base64 image properly
        if "," in image_data:
            image_data = image_data.split(",")[1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))

        # Use GoogleGeminiVision for identification
        component_info = llm("Identify this component and provide 10 activities using the component", images=[image])

        try : 
            component_info = rectify(component_info)
            for i in component_info : print("->",i)
            elements = llm(f"Tell me the chemical elements and compounds present in the {component_info[0][1]} and remember i just want the elements name and strictly nothing more than that")            
            json_file = r"src\reactions.json"
            try:
                with open(json_file, 'r') as file:
                    data = json.load(file)
            except FileNotFoundError: data = {"reactions":{},"elements":{}}
            for i in elements.split(","):
                i = i.split("(")
                try : data["elements"][i[0].replace(" ","").replace(".","")]= i[1][:-1].replace(" ","").replace(".","")
                except : data["elements"][i[0].replace(" ", "").replace(".","")] = i[0].replace(" ", "").replace(".","")
                print(data["elements"])
            with open(json_file, 'w') as file: json.dump(data, file, indent=2)
        except Exception as e: print(e)


        response = make_response(jsonify({"component_info": component_info,
                                          "detections": []}))
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

    except Exception as e:
        response = make_response(jsonify({"error": ["error",str(e)]}), 500)
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
    app.run(debug=True, host="0.0.0.0", port=5005)


# remove stars
# remo
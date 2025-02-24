# import google.generativeai as genai
# from flask import Flask, request, jsonify
# from PIL import Image
# import base64
# from io import BytesIO
# from langchain.llms.base import LLM
# from typing import Optional, List

# # Initialize Flask App
# app = Flask(__name__)

# # Configure Google Gemini AI API Key
# GOOGLE_API_KEY = "AIzaSyD7_MtufShX24UvJiY4GM3SlPESKNONWYA"
# genai.configure(api_key=GOOGLE_API_KEY)

# # Define Google Gemini Vision Class
# class GoogleGeminiVision(LLM):
#     model_name: str = "gemini-1.5-flash"

#     def _call(self, prompt: str, images: List[Image.Image] = None, stop: Optional[List[str]] = None) -> str:
#         model = genai.GenerativeModel(self.model_name)
#         image_parts = []

#         if images:
#             for img in images:
#                 buffered = BytesIO()
#                 img_format = img.format if img.format else "PNG"
#                 mime_type = f"image/{img_format.lower()}"
#                 img.save(buffered, format=img_format)
#                 img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
#                 image_parts.append({"mime_type": mime_type, "data": img_base64})

#         request = [{"text": prompt}] + image_parts
#         response = model.generate_content(request)
#         return response.text.strip() if response else ""

#     @property
#     def _identifying_params(self) -> dict:
#         return {"model_name": self.model_name}

#     @property
#     def _llm_type(self) -> str:
#         return "GoogleGeminiVision"

# # Initialize the model
# llm = GoogleGeminiVision()

# @app.route("/identify", methods=["POST"])
# def identify_component():
#     try:
#         data = request.json
#         image_data = data.get("image")
#         query = "Only name the chemical components in the image"

#         if not image_data:
#             return jsonify({"error": "No image provided"}), 400

#         # Decode Base64 image
#         if "," in image_data:
#             image_data = image_data.split(",")[1]  # Remove base64 header
#         image_bytes = base64.b64decode(image_data)
#         image = Image.open(BytesIO(image_bytes))

#         # Get AI response
#         component_info = llm(query, images=[image])

#         return jsonify({"component_info": component_info})

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(debug=True, host="0.0.0.0", port=5000)
import google.generativeai as genai
from flask import Flask, request, jsonify
from PIL import Image
import base64
from io import BytesIO
from langchain.llms.base import LLM
from typing import Optional, List
import json

# Initialize Flask App
app = Flask(__name__)

# Configure Google Gemini AI API Key
GOOGLE_API_KEY = "AIzaSyD7_MtufShX24UvJiY4GM3SlPESKNONWYA" # Replace with your API Key
genai.configure(api_key=GOOGLE_API_KEY)

# Define Google Gemini Vision Class
class GoogleGeminiVision(LLM):
    model_name: str = "gemini-1.5-flash"

    def _call(self, prompt: str, images: List[Image.Image] = None, stop: Optional[List[str]] = None) -> str:
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
        return response.text.strip() if response else ""

    @property
    def _identifying_params(self) -> dict:
        return {"model_name": self.model_name}

    @property
    def _llm_type(self) -> str:
        return "GoogleGeminiVision"

# Initialize the model
llm = GoogleGeminiVision()

@app.route("/identify", methods=["POST"])
def identify_component():
    try:
        data = request.json
        image_data = data.get("image")
        query = "List only the names of the chemical components visible in the image, separated by commas. Do not include any additional information."

        if not image_data:
            return jsonify({"error": "No image provided"}), 400

        # Decode Base64 image
        if "," in image_data:
            image_data = image_data.split(",")[1]  # Remove base64 header
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))

        # Get AI response
        component_info = llm(query, images=[image])

        # Convert comma-separated string to a list
        components_list = [component.strip() for component in component_info.split(",")]

        # Create JSON response with only the component names
        response_json = {"components": components_list}

        return jsonify(response_json)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
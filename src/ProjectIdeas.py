import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# ✅ Configure Google Gemini AI API Key
genai.configure(api_key="AIzaSyDQ2EnyfIqGKptNpUsbh04G5a_8Id9O-zQ")  # Replace with your actual key

@app.route("/generate-ideas", methods=["POST"])
def generate_ideas():
    try:
        data = request.json
        topic = data.get("topic")

        if not topic:
            return jsonify({"error": "No topic provided"}), 400

        print(f"📌 Generating ideas for: {topic}")  # Debugging

        query = f"Generate 5 innovative project ideas related to {topic} without title and filter by difficulty"
        model = genai.GenerativeModel("gemini-1.5-flash")

        # ✅ Fetch ideas from Gemini API
        response = model.generate_content(query)
        
        if not response or not hasattr(response, "text") or not response.text.strip():
            print("❌ Gemini API returned an empty response.")
            return jsonify({"error": "Gemini API returned an empty response."}), 500

        ideas = response.text.strip().split("\n")
        print("✅ Generated Project Ideas:", ideas)  # Debugging

        return jsonify({"ideas": ideas})

    except Exception as e:
        print(f"❌ Server Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5007)

from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
import google.generativeai as genai
from flask_cors import CORS

load_dotenv()

# Get API key
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("API key not found.")

genai.configure(api_key=API_KEY)
app = Flask(__name__)
CORS(app)

# Query Gemini
def query_gemini(prompt):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        # If response contains valid text, return markdown
        if response.text:
            return response.text 
        else:
            return "No response text found."
    except Exception as e:
        return f"Error: {str(e)}"

# Route for chatbot requests
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    prompt = data.get("prompt", "").strip()
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    response = query_gemini(prompt)
    return jsonify({"response": response})

if __name__ == "__main__":
    # debug=True for local testing
    app.run(host="0.0.0.0", port=5001, debug=True)

from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth

# Initialize Flask app
app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("./myovai-firebase-adminsdk-fbsvc-441f590eb8.json")
firebase_admin.initialize_app(cred)

# Route to sign up users
@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        email = data['email']
        password = data['password']

        # Create user in Firebase
        user = auth.create_user(email=email, password=password)
        return jsonify({"message": "User created successfully", "uid": user.uid}), 200
    except Exception as e:
        return jsonify({"Authentication error": str(e)}), 400

# Route to verify users (e.g., on login)
@app.route('/verify-token', methods=['POST'])
def verify_token():
    try:
        data = request.json
        token = data['token']

        # Verify Firebase token
        decoded_token = auth.verify_id_token(token)
        return jsonify({"message": "Token verified", "user": decoded_token}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Start the Flask server
if __name__ == '__main__':
    app.run(debug=True)

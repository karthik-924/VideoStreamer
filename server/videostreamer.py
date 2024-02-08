from flask import Flask, send_from_directory, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo.errors import ConnectionFailure
from flask_cors import CORS
from bson import ObjectId
import os

app = Flask(__name__)
CORS(app)
# Define the directory where HLS files are stored
hls_directory = os.path.dirname(os.path.abspath(__file__))

uri = ""

# Create a new MongoClient
client = MongoClient(uri, server_api=ServerApi('1'))

# Check if the connection was successful
try:
    # Ping the MongoDB server
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
except ConnectionFailure:
    print("Failed to connect to MongoDB. Check your connection URI.")

# Get a reference to the database
db = client['overlay_settings']
# Get a reference to the collection
collection = db['overlays']

# Serve the HLS files
@app.route('/video')
def serve_hls():
    return send_from_directory(hls_directory, "output.mp4")

@app.route('/overlay', methods=['POST'])
def create_overlay():
    data = request.json
    print(data)
    if not data:
        return jsonify({"error": "No data provided"}), 400
    overlay_id = collection.insert_one(data).inserted_id
    return jsonify({"message": "Overlay created", "overlay_id": str(overlay_id)}), 201

# Read operation
@app.route('/overlays')
def get_overlay():
    overlays = list(collection.find())
    # Convert ObjectId to string for each overlay
    overlays = [{**overlay, '_id': str(overlay['_id'])} for overlay in overlays]
    if overlays:
        return jsonify(overlays), 200
    else:
        return jsonify({"error": "Overlay not found"}), 404

# Update operation
@app.route('/overlay/<overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    data.pop('_id', None)
    print(data)
    result = collection.update_one({"_id": ObjectId(overlay_id)}, {'$set': data})
    if result.modified_count > 0:
        return jsonify({"message": "Overlay updated"}), 200
    else:
        return jsonify({"error": "Overlay not found"}), 404

# Delete operation
@app.route('/overlay/<overlay_id>', methods=['DELETE'])
def delete_overlay(overlay_id):
    result = collection.delete_one({"_id": overlay_id})
    if result.deleted_count > 0:
        return jsonify({"message": "Overlay deleted"}), 200
    else:
        return jsonify({"error": "Overlay not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)

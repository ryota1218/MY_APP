from flask import Flask, jsonify
from supabase import create_client, Client
from flask_cors import CORS

CORS(app)

app = Flask(__name__)

# Supabase情報
url = "https://ylgumuwmpnnqzrfleyoc.supabase.co"
key = "sb_publishable_iCBqRPHEWGq036pC_UXXww_a9tVqDAR"

supabase: Client = create_client(url, key)

@app.route("/")
def home():
    return "Flask + Supabase"

@app.route("/test")
def users():

    response = (
        supabase
        .table("test")
        .select("*")
        .execute()
    )

    return jsonify(response.data)

if __name__ == "__main__":
    app.run(debug=True)
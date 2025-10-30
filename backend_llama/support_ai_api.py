from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, os

app = Flask(__name__)
CORS(app)

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL_NAME = "llama3.1"

SYSTEM_PROMPT = (
    "You are ArogyaAI Support Assistant. Provide friendly, helpful, and clear responses "
    "to users about app features, privacy, AI tools, data management, and general guidance. "
    "If the user asks about a medical question, politely redirect them to professional consultation."
)

def call_llama(prompt):
    r = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "stream": False,
            "options": {"temperature": 0.65, "top_p": 0.9},
        },
        timeout=90,
    )
    return r.json().get("message", {}).get("content", "").strip()

@app.route("/api/support_ai", methods=["POST"])
def support_ai():
    data = request.get_json(force=True)
    msg = data.get("message", "")
    if not msg:
        return jsonify({"reply": "Please type a question to get help."})
    try:
        reply = call_llama(msg)
    except Exception as e:
        reply = f"⚠️ AI backend unavailable: {e}"
    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5006)

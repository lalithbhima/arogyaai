# backend_llama/chat_api.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import re

app = Flask(__name__)
CORS(app)

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434/api/chat")
MODEL = os.environ.get("AROGYAAI_MODEL", "llama3.1")

SAFETY_PREAMBLE = (
    "You are ArogyaAI, a careful health assistant. "
    "Be clear, concise, and clinically careful. "
    "Summarize evidence in plain language. "
    "Avoid diagnosis or treatment directives; suggest options to discuss with a clinician. "
    "Never provide emergency instructions; remind the user to seek emergency care when appropriate. "
    "Format with short paragraphs and bullet points when useful."
)

def needs_urgent_flag(text: str) -> bool:
    kw = [
        "chest pain", "shortness of breath", "can't breathe", "severe bleeding",
        "stroke", "suicidal", "overdose", "loss of consciousness"
    ]
    t = text.lower()
    return any(k in t for k in kw)

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True) or {}
    msgs = data.get("messages") or []
    # Normalize roles content
    convo = [{"role": "system", "content": SAFETY_PREAMBLE}]
    for m in msgs[-12:]:
        role = "user" if m.get("role") not in ("assistant", "system") else m["role"]
        content = str(m.get("content", ""))[:6000]
        convo.append({"role": role, "content": content})

    # Emergency nudge if needed (non-blocking)
    last_user = next((m["content"] for m in reversed(convo) if m["role"] == "user"), "")
    if needs_urgent_flag(last_user):
        convo.append({
            "role": "system",
            "content": "If the user may be in danger, open with a one-line safety nudge to seek urgent care."
        })

    try:
        r = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "messages": convo,
                "stream": False,
                # you can tune temperature if you like:
                "options": {"temperature": 0.6}
            },
            timeout=180,
        )
        r.raise_for_status()
        payload = r.json()
        reply = payload.get("message", {}).get("content", "").strip()
        # tiny cleanup for any fenced blocks the model might emit
        reply = re.sub(r"```(?:\w+)?\s*", "", reply).replace("```", "").strip()
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": f"⚠️ Service error: {e}"}), 500

if __name__ == "__main__":
    # Run:  python chat_api.py
    # iOS device on LAN will hit http://YOUR_LOCAL_IP:5040
    app.run(host="0.0.0.0", port=5040)

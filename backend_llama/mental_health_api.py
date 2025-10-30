# mental_health_api.py
# Runs a local mental-health chat API at http://127.0.0.1:5000/api/mental_health_chat
# - Uses Ollama (free, local) with an open model (e.g., llama3.1) if available
# - Falls back to a lightweight empathetic template if Ollama isn't running
# - Adds simple crisis-awareness + safe, supportive tone
# - CORS enabled for React Native

import os
import re
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434/api/chat")
MODEL_NAME = os.environ.get("MODEL_NAME", "llama3.1")  # try: "llama3.1" or "phi3:mini"

SYSTEM_PROMPT = (
    "You are ArogyaAI’s supportive mental-health companion. "
    "Your tone is warm, non-judgmental, and concise. Use short paragraphs and bullet points when helpful. "
    "Do not provide medical diagnoses. Encourage professional help when appropriate. "
    "If user expresses crisis (self-harm, harm to others, abuse), gently suggest urgent help and local emergency resources. "
    "Always validate feelings. Avoid generic clichés; reflect the user's words. "
)

CRISIS_PATTERNS = re.compile(
    r"(suicid|kill myself|end my life|self[- ]?harm|cutting|i want to die|homicid|hurt (?:someone|others)|abuse|assault)",
    re.IGNORECASE,
)

CRISIS_RESPONSE = (
    "I’m really glad you told me. You matter and your safety is the priority.\n\n"
    "• If you feel in immediate danger, **call your local emergency number** now.\n"
    "• You can also reach a crisis line:\n"
    "  – US & Canada: **988** (call or text)\n"
    "  – UK & ROI: Samaritans **116 123**\n"
    "  – Australia: Lifeline **13 11 14**\n"
    "  – Elsewhere: find your local helpline at <https://findahelpline.com>.\n\n"
    "If you want, tell me what’s happening right now. I’m here to listen."
)

def call_ollama(messages):
    """
    messages = [{"role":"system"|"user"|"assistant","content":"..."}]
    Returns assistant text or raises.
    """
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "stream": False,
        # You can tweak temperature/top_p for more/less creative tone:
        "options": {"temperature": 0.6, "top_p": 0.9}
    }
    r = requests.post(OLLAMA_URL, json=payload, timeout=60)
    r.raise_for_status()
    data = r.json()
    # Ollama chat response shape:
    # { "message": {"role":"assistant","content":"..."} , ... }
    return data.get("message", {}).get("content", "").strip()

def fallback_reply(user_text):
    # Lightweight empathetic fallback if Ollama isn't available
    normalized = user_text.strip()
    if not normalized:
        return "I’m here with you. Tell me a little about what’s on your mind today."

    # Reflect + gentle structure
    return (
        f"Thanks for sharing. I hear you saying: “{normalized[:300]}”.\n\n"
        "Here are a few steps that help some people:\n"
        "• Name the feeling (e.g., anxious, overwhelmed, sad)\n"
        "• Try a quick grounding exercise: 4-7-8 breaths, or noticing 5 things you see\n"
        "• Consider one tiny action you can take in the next hour\n\n"
        "If you want, share more context and I’ll tailor a plan with you 💙"
    )

@app.route("/api/mental_health_chat", methods=["POST"])
def mental_health_chat():
    try:
        data = request.get_json(force=True) or {}
        user_text = (data.get("message") or "").strip()
        history = data.get("history") or []  # Optional: [{role, content}, ...]
        if not user_text:
            return jsonify({"reply": "Tell me what’s on your mind. I’m listening."})

        # Crisis awareness
        if CRISIS_PATTERNS.search(user_text):
            return jsonify({"reply": CRISIS_RESPONSE})

        # Build messages with system + short history (keep it light to stay fast)
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        # Convert incoming history (optional) to proper format
        # Expect history items like: {"sender":"user"|"ai", "text":"..."}
        for h in history[-8:]:
            role = "assistant" if h.get("sender") == "ai" else "user"
            messages.append({"role": role, "content": h.get("text", "")})

        messages.append({"role": "user", "content": user_text})

        # Try Ollama (free, local). If it fails, fallback.
        try:
            reply = call_ollama(messages)
            if not reply:
                reply = fallback_reply(user_text)
        except Exception:
            reply = fallback_reply(user_text)

        return jsonify({"reply": reply})

    except Exception as e:
        # Never leak internals to the app; return calm + safe text
        return jsonify({
            "reply": (
                "I’m having trouble connecting right now, but I’m here with you. "
                "Could you try sending that again?"
            )
        }), 200

if __name__ == "__main__":
    # Run on port 5000 to match your React Native fetch URL
    app.run(host="0.0.0.0", port=5001, debug=False)

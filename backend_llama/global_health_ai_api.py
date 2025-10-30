# global_health_ai_api.py
# ArogyaAI Global Health Intelligence Backend
# Runs on http://127.0.0.1:5003
#   /api/global_scan         -> global outbreak summary
#   /api/global_who_insight  -> WHO/CDC data explanation
#   /api/global_alerts       -> predictive outbreak forecast
#   /api/global_prevention   -> prevention + lifestyle guidance

import os, requests, json, time
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434/api/chat")
MODEL_NAME = os.environ.get("MODEL_NAME", "llama3.1")

SYSTEM_PROMPT = (
    "You are ArogyaAI’s Global Health Intelligence assistant. "
    "You analyze worldwide health trends, WHO and CDC data, and regional alerts that are present time day. "
    "Respond with concise, human-friendly explanations using short paragraphs or bullet points. "
    "Keep a hopeful, empowering tone. Never generate fake statistics — speak in approximate, contextual language."
)

def call_llama(task_desc):
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": task_desc},
        ],
        "stream": False,
        "options": {"temperature": 0.7, "top_p": 0.9},
    }
    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=60)
        r.raise_for_status()
        return r.json().get("message", {}).get("content", "").strip()
    except Exception as e:
        return f"⚠️ AI service unavailable: {e}"

# --- Endpoints --------------------------------------------------------------

@app.route("/api/global_scan", methods=["POST"])
def global_scan():
    q = (
        "Provide a short global outbreak snapshot. "
        "List 3–5 regions currently facing infectious-disease challenges "
        "and note any declining or improving trends. Include an encouraging summary."
    )
    return jsonify({"reply": call_llama(q)})

@app.route("/api/global_who_insight", methods=["POST"])
def global_who_insight():
    q = (
        "Summarize the latest WHO global burden of disease themes — "
        "include life expectancy trends, vaccination coverage, and top prevention priorities for 2025. "
        "Keep it concise and educational."
    )
    return jsonify({"reply": call_llama(q)})

@app.route("/api/global_alerts", methods=["POST"])
def global_alerts():
    q = (
        "Simulate a predictive AI alert brief: which diseases might surge next season "
        "based on mobility, climate, and sanitation trends? Include 2–3 global zones and suggested readiness actions."
    )
    return jsonify({"reply": call_llama(q)})

@app.route("/api/global_prevention", methods=["POST"])
def global_prevention():
    q = (
        "Provide preventive health guidance tailored for global resilience — "
        "nutrition, hydration, vaccination, environmental hygiene, and digital-era stress. "
        "Keep it warm and motivating."
    )
    return jsonify({"reply": call_llama(q)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=False)

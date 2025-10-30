# pediatric_ai_api.py
# ArogyaAI Pediatrics Companion (http://127.0.0.1:5004)
# Endpoints:
#   /api/peds_triage        -> gentle triage guidance based on age + symptoms
#   /api/peds_milestones    -> age-appropriate milestones + play ideas
#   /api/peds_parent_tips   -> compassion-forward tips for caregivers

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434/api/chat")
MODEL_NAME = os.environ.get("MODEL_NAME", "llama3.1")

SYSTEM_PEDS = (
    "You are ArogyaAI’s Pediatrics Companion. You help caregivers with "
    "supportive, non-diagnostic guidance. Keep language warm and plain. "
    "Never provide medication dosing, prescriptions, or definitive diagnoses. "
    "Always suggest contacting a clinician for concerning symptoms. "
    "Use short paragraphs and bullet points."
)

def call_llama(user_text: str):
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": SYSTEM_PEDS},
            {"role": "user", "content": user_text},
        ],
        "stream": False,
        "options": {"temperature": 0.6, "top_p": 0.9},
    }
    r = requests.post(OLLAMA_URL, json=payload, timeout=90)
    r.raise_for_status()
    return r.json().get("message", {}).get("content", "").strip()

@app.route("/api/peds_triage", methods=["POST"])
def peds_triage():
    data = request.get_json(force=True) or {}
    age = data.get("age_months")
    symptoms = (data.get("symptoms") or "").strip() or "no specific symptoms provided"
    prompt = (
        f"A caregiver has a child aged ~{age} months. Symptoms: {symptoms}.\n"
        "Provide a brief triage-style note:\n"
        "• What common benign causes could fit (age-aware)?\n"
        "• Red flags to watch for (clear, concise)\n"
        "• Home-care steps that are generally safe (hydration, comfort, when to re-check)\n"
        "• When to seek in-person or urgent care\n"
        "No medication dosing. Friendly tone."
    )
    try:
        reply = call_llama(prompt)
    except Exception as e:
        reply = f"⚠️ AI service unavailable: {e}"
    return jsonify({"reply": reply})

@app.route("/api/peds_milestones", methods=["POST"])
def peds_milestones():
    data = request.get_json(force=True) or {}
    age = int(data.get("age_months") or 0)
    prompt = (
        f"Create an age-appropriate milestone coach for a child ~{age} months old. "
        "Include 3–5 likely skills across social, language, and motor domains (approximate, not absolute). "
        "Then list 5 playful activities the caregiver can try this week with simple household items. "
        "Keep it encouraging; avoid pressure; emphasize that children progress at their own pace."
    )
    try:
        reply = call_llama(prompt)
    except Exception as e:
        reply = f"⚠️ AI service unavailable: {e}"
    return jsonify({"reply": reply})

@app.route("/api/peds_parent_tips", methods=["POST"])
def peds_parent_tips():
    data = request.get_json(force=True) or {}
    context = (data.get("context") or "general fussiness").strip()
    prompt = (
        "Offer a short list of nervous-system calming ideas for caregivers and children. "
        f"Context: {context}. Include:\n"
        "• 4 quick soothing techniques for the child (non-pharmacologic)\n"
        "• 3 self-care ideas for the caregiver in under 5 minutes\n"
        "• A one-sentence reassurance\n"
        "No medical dosing or diagnoses."
    )
    try:
        reply = call_llama(prompt)
    except Exception as e:
        reply = f"⚠️ AI service unavailable: {e}"
    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004, debug=False)

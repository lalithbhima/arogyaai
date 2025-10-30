from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, json
from datetime import datetime, date

app = Flask(__name__)
CORS(app)

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL = "llama3.1"

sleep_logs = []
last_reset = date.today()

def reset_daily():
    global sleep_logs, last_reset
    today = date.today()
    if today != last_reset:
        sleep_logs.clear()
        last_reset = today


@app.route("/api/sleep/log", methods=["POST"])
def log_sleep():
    reset_daily()
    data = request.get_json(force=True)
    entry = {
        "id": len(sleep_logs) + 1,
        "timestamp": datetime.now().isoformat(),
        "bedTime": data.get("bedTime", ""),
        "wakeTime": data.get("wakeTime", ""),
        "duration": data.get("duration", ""),
        "mood": data.get("mood", ""),
        "notes": data.get("notes", ""),
    }
    sleep_logs.append(entry)
    return jsonify(entry), 200


@app.route("/api/sleep/logs", methods=["GET"])
def get_logs():
    reset_daily()
    return jsonify({"logs": sleep_logs})


@app.route("/api/sleep/ai", methods=["POST"])
def ai_sleep():
    reset_daily()
    if not sleep_logs:
        return jsonify({"reply": "No sleep data available. Please log a few nights first."})

    summary = "\n".join(
        [f"- {l['bedTime']} → {l['wakeTime']} ({l['duration']}h), mood {l['mood']}, notes: {l['notes']}"
         for l in sleep_logs[-5:]]
    )
    prompt = f"""
    You are ArogyaAI's Sleep Coach. Analyze this user's recent sleep data:
    {summary}
    
    Please identify sleep quality, circadian rhythm stability, possible issues (e.g. caffeine, blue light, stress),
    and suggest 3 personalized improvements backed by research.
    Use clear bullet points.
    """

    try:
        r = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": "You are a professional sleep health advisor."},
                    {"role": "user", "content": prompt},
                ],
                "stream": False,
            },
            timeout=180,
        )
        r.raise_for_status()
        data = r.json()
        reply = data.get("message", {}).get("content", "⚠️ No AI output received.")
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": f"⚠️ AI request failed: {e}"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5020)

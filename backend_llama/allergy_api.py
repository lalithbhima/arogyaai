from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime, date
import json

app = Flask(__name__)
CORS(app)

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL = "llama3.1"

logs = []
last_reset_date = date.today()   # Track last log reset date


def reset_logs_if_new_day():
    """Clear logs automatically at the start of each new day."""
    global last_reset_date, logs
    today = date.today()
    if today != last_reset_date:
        logs.clear()
        last_reset_date = today


@app.route("/api/allergy/log", methods=["POST"])
def log_entry():
    reset_logs_if_new_day()
    data = request.get_json(force=True)
    entry = {
        "id": len(logs) + 1,
        "timestamp": datetime.now().isoformat(),
        "symptom": data.get("symptom", ""),
        "trigger": data.get("trigger", ""),
        "severity": data.get("severity", ""),
        "notes": data.get("notes", ""),
    }
    logs.append(entry)
    return jsonify(entry), 200


@app.route("/api/allergy/logs", methods=["GET"])
def get_logs():
    reset_logs_if_new_day()
    return jsonify({"logs": logs})


@app.route("/api/allergy/ai", methods=["POST"])
def ai_coach():
    reset_logs_if_new_day()
    data = request.get_json(force=True)
    q = data.get("question", "")
    if not logs:
        return jsonify({"reply": "No recent allergy logs found."})

    summary = "\n".join(
        [f"- {l['symptom']} (Trigger: {l['trigger']}, Severity: {l['severity']})" for l in logs[-5:]]
    )
    prompt = f"""You are ArogyaAI's Respiratory Coach. 
Analyze the following allergy/asthma logs and suggest possible triggers, correlations with environment, and helpful lifestyle tips.
Recent Logs:
{summary}
Question: {q}"""

    try:
        r = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": "You are a respiratory health expert."},
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
        return jsonify({"reply": f"⚠️ Error contacting AI: {e}"})


@app.route("/api/allergy/env_ai", methods=["POST"])
def env_ai():
    """
    Takes a plain location string (e.g. "Sacramento, CA"),
    uses Open-Meteo Geocoding API to resolve coordinates,
    then generates estimated environment data through AI.
    """
    data = request.get_json(force=True)
    location = data.get("location", "").strip()

    if not location:
        return jsonify({"error": "No location provided"}), 400

    try:
        # --- 1. Convert text location → lat/lon ---
        geo_resp = requests.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": location, "count": 1, "language": "en"},
            timeout=10,
        )
        geo_data = geo_resp.json()
        if not geo_data.get("results"):
            return jsonify({"error": f"Location '{location}' not found"}), 404

        lat = geo_data["results"][0]["latitude"]
        lon = geo_data["results"][0]["longitude"]
        city_name = geo_data["results"][0].get("name", location)

        # --- 2. Generate AI-based environmental context ---
        prompt = f"""
        You are an AI environment assistant.
        Analyze environmental conditions for {city_name} (lat {lat}, lon {lon}).
        Estimate realistic values and return only JSON with:
        - aqi (0–500)
        - unitAqi ("Good", "Moderate", etc.)
        - pollen (index or count)
        - unitPollen ("Low", "Moderate", "High")
        - humidity (%)
        - temp (°C)

        Example:
        {{
          "aqi": 64,
          "unitAqi": "Moderate",
          "pollen": 175,
          "unitPollen": "High",
          "humidity": 52,
          "temp": 24
        }}
        """

        ai_resp = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": "You are an environmental AI assistant."},
                    {"role": "user", "content": prompt.strip()},
                ],
                "stream": False,
            },
            timeout=120,
        )
        ai_resp.raise_for_status()
        ai_data = ai_resp.json()
        content = ai_data.get("message", {}).get("content", "{}")

        # Parse clean JSON
        parsed = json.loads(content.replace("```json", "").replace("```", "").strip())

        return jsonify({"env": parsed, "resolved_location": city_name})

    except Exception as e:
        # Graceful fallback
        return jsonify({
            "env": {
                "aqi": 60,
                "unitAqi": "Moderate",
                "pollen": 180,
                "unitPollen": "High",
                "humidity": 55,
                "temp": 23,
            },
            "resolved_location": location,
            "error": f"AI request failed: {e}"
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5010)

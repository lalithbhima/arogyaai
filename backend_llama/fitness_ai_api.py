from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, time, uuid, math
from datetime import datetime, timedelta
import json, os

LOG_FILE = "fitness_logs.json"

def save_logs():
    path = os.path.abspath(LOG_FILE)
    print(f"🟢 Saving {len(LOGS)} logs to:", path)
    try:
        with open(LOG_FILE, "w") as f:
            json.dump(LOGS, f, indent=2)
            f.flush()
            os.fsync(f.fileno())
        print("✅ Logs saved successfully.")
    except Exception as e:
        print("❌ Failed to save logs:", e)

def load_logs():
    global LOGS
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            LOGS = json.load(f)

app = Flask(__name__)
CORS(app)

# ---- Ollama (text-only) ----
OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL_NAME = "llama3.1"

SYSTEM_PROMPT = (
    "You are ArogyaAI’s Fitness & Wellness Coach. Be encouraging, concise, and evidence-informed. "
    "Prioritize safety, progressive overload, recovery, sleep hygiene, mobility, and hydration. "
    "Do not diagnose diseases or give medical advice."
)

def call_llama(messages, temperature=0.6, top_p=0.9, timeout=90):
    r = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature, "top_p": top_p},
        },
        timeout=timeout,
    )
    r.raise_for_status()
    data = r.json()
    return data.get("message", {}).get("content", "").strip()

# ---- In-memory store (swap with DB later) ----
LOGS = []  # each: {id, timestamp, type, duration_min, intensity, notes, calories}
load_logs()

# ---- Simple calorie estimate using METs ----
MET_TABLE = {
    "Walk": {"low": 2.8, "moderate": 3.5, "high": 4.5},
    "Run": {"low": 7.0, "moderate": 9.8, "high": 11.5},
    "Cycle": {"low": 4.0, "moderate": 6.8, "high": 8.5},
    "Strength": {"low": 3.5, "moderate": 5.0, "high": 6.0},
    "Yoga": {"low": 2.5, "moderate": 3.0, "high": 3.3},
    "HIIT": {"low": 6.0, "moderate": 8.0, "high": 10.0},
}

def estimate_calories(activity, intensity, duration_min, weight_kg=75):
    mets = MET_TABLE.get(activity, MET_TABLE["Walk"]).get(intensity, 3.5)
    # kcal = MET * weight(kg) * time(hours)
    return mets * weight_kg * (duration_min / 60.0)

def start_of_day(dt=None):
    dt = dt or datetime.now()
    return datetime(dt.year, dt.month, dt.day)

# ---- Routes ----

@app.route("/api/fitness/log", methods=["POST"])
def log_activity():
    data = request.get_json(force=True)
    activity = (data.get("type") or "").strip() or "Walk"
    duration = int(data.get("duration_min") or 0)
    intensity = (data.get("intensity") or "moderate").lower()
    notes = (data.get("notes") or "").strip()

    if duration <= 0:
        return jsonify({"error": "Duration must be > 0"}), 400

    cal = estimate_calories(activity, intensity, duration)
    entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(),
        "type": activity,
        "duration_min": duration,
        "intensity": intensity,
        "notes": notes,
        "calories": cal,
    }
    LOGS.insert(0, entry)
    save_logs()
    return jsonify({"ok": True, "log": entry})  

@app.route("/api/fitness/logs", methods=["GET"])
def get_logs():
    # return last 30 logs
    return jsonify({"logs": LOGS[:30]})

@app.route("/api/fitness/summary/today", methods=["GET"])
def summary_today():
    start = start_of_day()
    total_min = 0
    total_kcal = 0.0
    workouts = 0
    for l in LOGS:
        ts = datetime.fromisoformat(l["timestamp"])
        if ts >= start:
            total_min += l["duration_min"]
            total_kcal += l["calories"]
            workouts += 1
    return jsonify({"minutes": total_min, "calories": total_kcal, "workouts": workouts})

@app.route("/api/fitness/summary/week", methods=["GET"])
def summary_week():
    start = start_of_day() - timedelta(days=6)
    daily = {}
    for i in range(7):
        d = (start + timedelta(days=i)).date().isoformat()
        daily[d] = {"minutes": 0, "calories": 0.0, "workouts": 0}

    for l in LOGS:
        ts = datetime.fromisoformat(l["timestamp"])
        if ts.date() >= start.date():
            key = ts.date().isoformat()
            daily[key]["minutes"] += l["duration_min"]
            daily[key]["calories"] += l["calories"]
            daily[key]["workouts"] += 1
    return jsonify({"daily": daily})

@app.route("/api/fitness/coach", methods=["POST"])
def coach():
    data = request.get_json(force=True)
    question = (data.get("question") or "").strip() or "Give me training and recovery advice."

    # --- new: include user’s current goals for more context ---
    goal_minutes = float(data.get("goal_minutes", 45))
    goal_calories = float(data.get("goal_calories", 300))
    goal_steps = float(data.get("goal_steps", 8000))

    # --- compile recent workout history ---
    recent = LOGS[:6]
    history_lines = []
    for l in reversed(recent):
        history_lines.append(
            f"- {l['type']} · {l['duration_min']} min · {l['intensity']} · {round(l['calories'])} kcal"
        )
    history_txt = "\n".join(history_lines) if history_lines else "No recent logs."

    # --- construct richer AI prompt ---
    user_context = (
        f"Today's goals: {goal_minutes} min activity, {goal_calories} kcal burn, {goal_steps} steps.\n"
        f"Recent logs:\n{history_txt}\n\n"
        f"User question: {question}\n\n"
        "Please respond with:\n"
        "1) Progress vs goals (mention % completed for each)\n"
        "2) What I'm doing well\n"
        "3) Risks / warnings\n"
        "4) Recommended workout plan for today (warmup, main, cooldown)\n"
        "5) Recovery & mobility suggestions\n"
        "6) Hydration & sleep reminders\n"
        "Be concise, motivational, and number-specific."
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_context},
    ]

    try:
        reply = call_llama(messages)
    except Exception as e:
        reply = f"⚠️ Coach backend error: {e}"

    return jsonify({"reply": reply})

@app.route("/api/fitness/progress", methods=["POST"])
def fitness_progress():
    """
    Calculates progress toward daily fitness goals using all logs from today.
    Optionally calls Llama for motivational feedback.
    """
    data = request.get_json(force=True)
    goal_minutes = float(data.get("goal_minutes", 45))
    goal_calories = float(data.get("goal_calories", 300))
    goal_steps = float(data.get("goal_steps", 8000))

    # 🧮 Compute today's totals automatically from saved logs
    start = start_of_day()
    total_min = 0
    total_kcal = 0.0
    workouts = 0

    for l in LOGS:
        ts = datetime.fromisoformat(l["timestamp"])
        if ts >= start:  # only count today's logs
            total_min += l["duration_min"]
            total_kcal += l["calories"]
            workouts += 1

    # ✅ Calculate progress based on these totals
    pct_minutes = min(100.0, (total_min / goal_minutes) * 100.0 if goal_minutes > 0 else 0.0)
    pct_calories = min(100.0, (total_kcal / goal_calories) * 100.0 if goal_calories > 0 else 0.0)
    pct_steps = min(100.0, (0 / goal_steps) * 100.0 if goal_steps > 0 else 0.0)  # steps optional

    overall_pct = round((pct_minutes * 0.5 + pct_calories * 0.3 + pct_steps * 0.2), 1)

    # 🧠 Generate motivational summary
    try:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Today's progress: {pct_minutes:.1f}% of minutes goal, "
                    f"{pct_calories:.1f}% of calorie goal, {pct_steps:.1f}% of step goal. "
                    f"Give me a short, motivational 2-line message summarizing overall progress "
                    f"({overall_pct:.1f}% overall)."
                ),
            },
        ]
        reply = call_llama(messages)
    except Exception as e:
        reply = f"⚠️ Progress feedback unavailable: {e}"

    return jsonify({
        "percent": overall_pct,
        "message": reply,
        "goal_minutes": goal_minutes,
        "goal_calories": goal_calories,
        "goal_steps": goal_steps,
        "minutes_done": total_min,
        "calories_done": total_kcal,
        "steps_done": 0,
        "pct_minutes": round(pct_minutes, 1),
        "pct_calories": round(pct_calories, 1),
        "pct_steps": round(pct_steps, 1),
    })

if __name__ == "__main__":
    # Run on 5008 to keep separate from your other services
    app.run(host="0.0.0.0", port=5008)

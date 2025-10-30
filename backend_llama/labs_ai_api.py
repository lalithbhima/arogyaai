# labs_ai_api.py
# ArogyaAI Labs & Diagnostics Assistant (http://127.0.0.1:5002)
# - /api/labs_ai      -> explain the pasted report (ALSO saves parsed values)
# - /api/labs_trends  -> save + return trend insights + chart-ready series
# Requirements:
#   pip install flask flask-cors requests
#   (Ollama running with: `ollama serve` and `ollama pull llama3.1`)

import os, re, json, time, requests
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

STORE_PATH = os.environ.get("LABS_STORE_PATH", "labs_store.json")

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434/api/chat")
MODEL_NAME = os.environ.get("MODEL_NAME", "llama3.1")

SYSTEM_EXPLAIN = (
    "You are ArogyaAI’s Lab & Diagnostics companion. "
    "Explain the user's lab report in warm, clear language. "
    "Highlight which values are high/low; give plain-language meaning and gentle lifestyle pointers. "
    "Do NOT diagnose or prescribe. Encourage professional confirmation."
)

SYSTEM_TREND = (
    "You are ArogyaAI’s trend analyst. Given multiple historical lab entries, "
    "summarize key movements (improving, worsening, steady). "
    "Be specific but friendly; avoid diagnoses; give 2–4 actionable tips. "
    "Prefer bullet points and short paragraphs."
)

# --- Utils: tiny JSON store ---
def _load_store():
    if not os.path.exists(STORE_PATH):
        return []
    try:
        with open(STORE_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return []

def _save_store(rows):
    with open(STORE_PATH, "w") as f:
        json.dump(rows, f, indent=2)

# --- Parser for common markers ---
MARKER_PATTERNS = [
    ("HbA1c", r"hba1c[:\s]*([\d\.]+)"),
    ("Fasting Glucose", r"(?:fasting|fbs|glucose)[^\d]{0,10}([\d\.]+)"),
    ("LDL", r"ldl[^\d]{0,10}([\d\.]+)"),
    ("HDL", r"hdl[^\d]{0,10}([\d\.]+)"),
    ("Triglycerides", r"triglycerides|tg[^\d]{0,10}([\d\.]+)"),
    ("Creatinine", r"creatinine[^\d]{0,10}([\d\.]+)"),
    ("eGFR", r"egfr[^\d]{0,10}([\d\.]+)"),
    ("ALT", r"(?:alt|sgpt)[^\d]{0,10}([\d\.]+)"),
    ("AST", r"(?:ast|sgot)[^\d]{0,10}([\d\.]+)"),
    ("CRP", r"crp[^\d]{0,10}([\d\.]+)"),
    ("Hemoglobin", r"(?:hemoglobin|hb)\b[^\d]{0,10}([\d\.]+)"),
]

def parse_markers(text: str):
    found = {}
    lower = text.lower()
    for name, pat in MARKER_PATTERNS:
        m = re.search(pat, lower)
        if m:
            try:
                val = float(m.group(1))
                found[name] = val
            except:
                pass
    return found

# --- Ollama call ---
def call_ollama(system_prompt: str, user_text: str):
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_text},
        ],
        "stream": False,
        "options": {"temperature": 0.6, "top_p": 0.9},
    }
    r = requests.post(OLLAMA_URL, json=payload, timeout=90)
    r.raise_for_status()
    data = r.json()
    return data.get("message", {}).get("content", "").strip()

def fallback_explain(text):
    snippet = text.strip()[:250]
    return (
        f"I see your report mentions: “{snippet}”.\n\n"
        "• Look for values marked high/low against reference ranges\n"
        "• Repeated tests matter more than one-off numbers\n"
        "• Consider healthy diet, movement, and hydration\n"
        "Please check with your clinician for personalized advice."
    )

def fallback_trend(series):
    # Just name the markers and whether last is > first
    lines = []
    for k, points in series.items():
        if len(points) >= 2:
            delta = points[-1]["v"] - points[0]["v"]
            dir_ = "rising" if delta > 0 else ("falling" if delta < 0 else "stable")
            lines.append(f"- **{k}** looks {dir_} across {len(points)} readings.")
    if not lines:
        lines.append("- Not enough saved data to compute trends yet.")
    lines.append("\nGeneral tips: prioritize sleep, balanced whole foods, and consistent activity.")
    return "Here’s what I’m seeing:\n" + "\n".join(lines)

# --- Save one entry to store ---
def save_entry(raw_text: str, markers: dict):
    rows = _load_store()
    rows.append({
        "ts": int(time.time()),
        "iso": datetime.utcnow().isoformat() + "Z",
        "raw": raw_text,
        "markers": markers
    })
    _save_store(rows)
    return rows

# --- Build time series from store ---
def make_series(rows):
    # series = { "LDL": [{t:'2025-01-01', v:145}, ...], ...}
    out = {}
    for r in rows:
        iso = r.get("iso")
        m = r.get("markers", {})
        for k, v in m.items():
            out.setdefault(k, []).append({"t": iso, "v": float(v)})
    # sort by time
    for k in out:
        out[k].sort(key=lambda x: x["t"])
    return out

# ------------------ ROUTES ------------------

@app.route("/api/labs_ai", methods=["POST"])
def labs_ai():
    data = request.get_json(force=True) or {}
    text = (data.get("message") or "").strip()
    if not text:
        return jsonify({"reply": "Please paste your lab values or describe your results."})

    # parse + save
    markers = parse_markers(text)
    save_entry(text, markers)

    # explain
    try:
        reply = call_ollama(SYSTEM_EXPLAIN, text)
    except Exception:
        reply = fallback_explain(text)

    return jsonify({"reply": reply, "parsed": markers})

@app.route("/api/labs_trends", methods=["POST"])
def labs_trends():
    data = request.get_json(force=True) or {}
    text = (data.get("message") or "").strip()

    # Save again (ok if duplicate) to ensure "save & view trends" always persists
    if text:
        markers = parse_markers(text)
        save_entry(text, markers)

    rows = _load_store()
    series = make_series(rows)

    # Build a compact trend summary for LLM
    summary_lines = []
    for k, pts in series.items():
        if not pts:
            continue
        first = pts[0]["v"]
        last = pts[-1]["v"]
        delta = last - first
        direction = "increased" if delta > 0 else ("decreased" if delta < 0 else "not changed")
        summary_lines.append(f"{k}: first={first}, last={last}, change={delta:.2f} ({direction}) over {len(pts)} readings.")
    trend_summary = " | ".join(summary_lines) if summary_lines else "No trend data yet."

    user_prompt = (
        "Here is a condensed time-series summary of the user's saved lab markers:\n"
        f"{trend_summary}\n\n"
        "Please provide a short, supportive trend insight."
    )

    try:
        reply = call_ollama(SYSTEM_TREND, user_prompt)
    except Exception:
        reply = fallback_trend(series)

    return jsonify({"reply": reply, "series": series})

@app.route("/api/labs_clear", methods=["POST"])
def labs_clear():
    _save_store([])
    return jsonify({"ok": True})

if __name__ == "__main__":
    # Run on 5002 to avoid your 5000/5001 usage
    app.run(host="0.0.0.0", port=5002, debug=False)

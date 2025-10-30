# backend_llama/news_api.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
import json
import math
import re

app = Flask(__name__)
CORS(app)

# Ollama chat endpoint
OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL = "llama3.1"

def words_count(text: str) -> int:
  return len(re.findall(r"\b\w+\b", text or ""))

@app.route("/api/news/generate", methods=["POST"])
def generate_article():
    data = request.get_json(force=True) or {}
    topic = (data.get("topic") or "").strip()
    if not topic:
        return jsonify({"error": "Missing topic"}), 400

    prompt = f"""
You are ArogyaAI's medical news writer. Write a balanced, evidence-informed long-form article about:
TOPIC: "{topic}"

Audience: smart laypeople and clinicians. Tone: clear, neutral, actionable.
Length target: 900–1500 words.

Return ONLY valid JSON with this exact schema (no commentary or markdown):
{{
  "title": "string",
  "teaser": "string",
  "readingMinutes": number,
  "sections": [{{"heading": "string", "body": "string"}}],
  "takeaways": ["string"],
  "disclaimer": "string"
}}
Rules:
- Use proper JSON quotes.
- Never include trailing commas.
- Do not include ```json or code fences.
"""

    try:
        r = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": "You are a careful medical writer who only outputs valid JSON."},
                    {"role": "user", "content": prompt.strip()},
                ],
                "stream": False,
            },
            timeout=180,
        )
        r.raise_for_status()
        payload = r.json()
        content = payload.get("message", {}).get("content", "{}")

        # 🧩 Cleanup section: removes stray characters, quotes, and trailing commas
        cleaned = (
            content.replace("```json", "")
            .replace("```", "")
            .replace("\n", " ")
            .replace("\r", " ")
            .strip()
        )
        cleaned = re.sub(r",\s*([\]}])", r"\1", cleaned)  # remove trailing commas
        cleaned = cleaned.strip()
        if not cleaned.startswith("{"):
            start = cleaned.find("{")
            cleaned = cleaned[start:] if start != -1 else "{}"

        try:
            article = json.loads(cleaned)
        except json.JSONDecodeError:
            # 🛟 fallback: attempt minimal JSON repair
            import json_repair
            article = json_repair.repair_json(cleaned)

        # --- Post-processing ---
        joined = " ".join([article.get("teaser", "")] + [s.get("body", "") for s in article.get("sections", [])])
        read_minutes = article.get("readingMinutes") or max(4, math.ceil(words_count(joined) / 225))
        article["readingMinutes"] = int(read_minutes)
        article["publishedAt"] = datetime.utcnow().isoformat()

        return jsonify({"article": article})
    except Exception as e:
        return jsonify({"error": f"AI generation failed: {str(e)}"}), 500

@app.route("/api/news/ask", methods=["POST"])
def ask_followup():
    data = request.get_json(force=True) or {}
    article = data.get("article")
    question = (data.get("question") or "").strip()
    if not article or not question:
        return jsonify({"error": "Missing article or question"}), 400

    packed = json.dumps(article, ensure_ascii=False)
    qprompt = f"""
User question about the article below. Answer succinctly (120–220 words), cite concepts (not URLs), and avoid personalized advice.

ARTICLE JSON:
{packed}

QUESTION:
{question}
"""
    try:
        r = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": "Give clear, accessible medical explanations without links."},
                    {"role": "user", "content": qprompt.strip()},
                ],
                "stream": False,
            },
            timeout=120,
        )
        r.raise_for_status()
        payload = r.json()
        reply = payload.get("message", {}).get("content", "No answer produced.")
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": f"Follow-up failed: {e}"}), 500

if __name__ == "__main__":
    # Run: python news_api.py
    app.run(host="0.0.0.0", port=5030)

# backend/app_nlp.py
from flask import Flask, request, jsonify
from pathlib import Path
import joblib, re, json
import numpy as np

app = Flask(__name__)
MODEL_DIR = Path(__file__).resolve().parents[1] / "nlp" / "model"

router = joblib.load(MODEL_DIR / "router.joblib")
mlb    = joblib.load(MODEL_DIR / "mlb.joblib")
LABELS = list(mlb.classes_)

# 🔹 Load label→questions mapping
QUESTIONS_PATH = MODEL_DIR / "labels_to_questions.json"
if QUESTIONS_PATH.exists():
    with open(QUESTIONS_PATH, "r") as f:
        LABEL_TO_QUESTIONS = json.load(f)
else:
    LABEL_TO_QUESTIONS = {}

def normalize_text(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

@app.post("/nlp/route")
def route_text():
    """
    Main endpoint: classify symptom text → top-k labels with scores
    and also return the mapped questions in one go.
    """
    data = request.get_json(force=True) or {}
    text = (data.get("text") or "").strip()
    top_k = int(data.get("top_k") or 6)

    if not text:
        return jsonify({"labels": [], "scores": [], "questions": []})

    X = [normalize_text(text)]

    # 🔹 Get scores from the model
    if hasattr(router, "predict_proba"):
        scores = router.predict_proba(X)[0]
    elif hasattr(router, "decision_function"):
        scores = router.decision_function(X)[0]
    else:
        preds = router.predict(X)[0]
        labels = [l for l, v in zip(LABELS, preds) if v > 0.5]
        questions = []
        for l in labels:
            questions.extend(LABEL_TO_QUESTIONS.get(l, [])[:10])
        return jsonify({"labels": labels, "scores": [1.0] * len(labels), "questions": questions})

    scores = np.array(scores, dtype=float)
    order = np.argsort(scores)[::-1]

    # 🔹 Pick top-k
    labels_sorted = [LABELS[i] for i in order[:top_k]]
    scores_sorted = [float(scores[i]) for i in order[:top_k]]

    # 🔹 Optional thresholding
    THRESH = float(data.get("threshold") or 0.0)
    filtered = [(l, s) for l, s in zip(labels_sorted, scores_sorted) if s >= THRESH]

    # 🔹 Collect questions for returned labels
    out_questions = []
    seen = set()
    for l, _ in filtered:
        for q in LABEL_TO_QUESTIONS.get(l, []):
            if q not in seen:
                seen.add(q)
                out_questions.append(q)
            if len(out_questions) >= 10:
                break
        if len(out_questions) >= 10:
            break

    return jsonify({
        "labels": [l for l, _ in filtered],
        "scores": [s for _, s in filtered],
        "questions": out_questions
    })


@app.post("/nlp/questions")
def get_questions():
    """
    Fallback endpoint: just fetch questions given labels.
    """
    data = request.get_json(force=True) or {}
    labels = data.get("labels", [])
    out_questions = []

    seen = set()
    for l in labels:
        for q in LABEL_TO_QUESTIONS.get(l, []):
            if q not in seen:
                seen.add(q)
                out_questions.append(q)
            if len(out_questions) >= 10:
                break
        if len(out_questions) >= 10:
            break

    return jsonify({"questions": out_questions})


if __name__ == "__main__":
    # Run NLP router on port 5053
    app.run(host="0.0.0.0", port=5053, debug=True)

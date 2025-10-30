# app_healthassistant.py
from flask import Flask, request, jsonify
from datetime import datetime
import joblib
import os

app = Flask(__name__)

# 🔹 Load AI router model once at startup
ROUTER_PATH = os.path.join(os.path.dirname(__file__), "../nlp/model/router.joblib")
MLB_PATH = os.path.join(os.path.dirname(__file__), "../nlp/model/mlb.joblib")

router = joblib.load(ROUTER_PATH)
mlb = joblib.load(MLB_PATH)

@app.post("/assistant/plan")
def assistant_plan():
    data = request.get_json(force=True)
    a = data.get("answers", {})
    triage = data.get("triage", "ROUTINE")

    ddx, recs, when, prev = [], [], [], []
    chief = (a.get("chief") or "").lower()

    # ---------------------- Run AI router ----------------------
    if chief.strip():
        try:
            X = [chief]
            y_pred = router.predict(X)
            labels = mlb.inverse_transform(y_pred)[0]

            # Save labels for debugging
            a["nlp_labels"] = labels

            # Map AI labels into flags your rules already use
            L = set(l.lower() for l in labels)
            if "chest_pain" in L or "cardio" in L or "heart_attack" in L:
                a["cp_flag"] = True
            if "stroke" in L or "neuro" in L or "seizure" in L:
                a["neuro_flag"] = True
            if "resp" in L or "asthma" in L or "copd" in L or "pneumonia" in L:
                a["resp_flag"] = True
            if "endocrine" in L or "diabetes" in L or "thyroid" in L:
                a["endocrine_flag"] = True
            if "id" in L or "malaria" in L or "hepatitis" in L or "dengue" in L:
                a["id_flag"] = True
            if "onc" in L or "cancer" in L or "skin_cancer" in L:
                a["onc_flag"] = True
            if "gi" in L or "gerd" in L or "ibs" in L or "ulcer" in L:
                a["gi_flag"] = True
            if "msk" in L or "back_pain" in L or "gout" in L:
                a["msk_flag"] = True
            if "mental" in L or "depression" in L or "anxiety" in L:
                a["mh_flag"] = True
            if "peds" in L:
                a["peds_flag"] = True
            if "travel" in L:
                a["travel_flag"] = True
        except Exception as e:
            print("router inference failed:", e)
    # ------------------------------------------------------------

    # Now your existing rules use both user answers + AI flags
    # ---------------------- CARDIOVASCULAR ----------------------
    if "chest" in chief or a.get("cp_flag"):
        if a.get("cp_exertion") or a.get("cp_radiation") or a.get("cp_sob") or a.get("cp_nausea"):
            ddx.append("🚨 Cardiac ischemia/heart attack (consider)")
            when.append("Worsening chest pain, fainting, radiation to arm/jaw → emergency care.")
        elif a.get("cp_type") == "burn":
            ddx.append("⚠️ Gastroesophageal reflux (GERD)")
            recs.append("Avoid late meals, elevate head of bed, trial of OTC acid reducer.")
        else:
            ddx.append("✅ Chest wall / musculoskeletal strain")
            recs.append("Rest, ice/heat, gentle stretching. Monitor symptoms.")

    # ... (keep your neuro, abdo, resp, skin, etc. rules here) ...

    return jsonify({
        "generated_at": datetime.utcnow().isoformat()+"Z",
        "triage": triage,
        "differential": ddx,
        "recommendations": recs,
        "when_to_seek_care": when,
        "prevention": prev
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5052, debug=True)

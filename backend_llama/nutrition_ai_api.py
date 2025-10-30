from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, os
import base64

app = Flask(__name__)
CORS(app)

# ---- Llama Vision Model Configuration ----
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "llama3.2-vision"

BASE_PROMPT = (
    "You are ArogyaAI’s Nutrition Coach — an AI designed to help users understand nutrition, "
    "meal balance, and healthy eating habits. "
    "Respond in a clear, friendly, and educational tone. Do not diagnose or recommend medication."
)

def call_llama(prompt, role_description, image_path=None):
    """Send text or image input to the local Ollama llama3.2-vision model using /api/generate."""
    full_prompt = BASE_PROMPT + "\n\nRole: " + role_description + "\n\nTask: " + prompt

    payload = {
        "model": MODEL_NAME,
        "prompt": full_prompt,
        "stream": False,
        "options": {"temperature": 0.6, "top_p": 0.9},
    }

    # ✅ Proper base64 encoding for image
    if image_path and os.path.exists(image_path):
        with open(image_path, "rb") as f:
            image_bytes = f.read()
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        payload["images"] = [image_b64]  # <-- Correct field

        print(f"[DEBUG] Sending image to Ollama (base64-encoded): {image_path}, {len(image_b64)} chars")
    else:
        if image_path:
            print(f"[WARNING] Image file not found or unreadable: {image_path}")

    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=180)
        r.raise_for_status()

        data = r.json()
        reply = data.get("response") or data.get("message", {}).get("content", "")
        if not reply:
            print("[WARN] Ollama returned no text response:", data)
            reply = "⚠️ No AI output received."
        return reply.strip()
    except requests.exceptions.RequestException as e:
        print("[ERROR] Ollama request failed:", e)
        return f"⚠️ Ollama request error: {e}"

# === 1️⃣ General Nutrition Chat ===
@app.route("/api/nutrition_ai", methods=["POST"])
def nutrition_ai():
    data = request.get_json(force=True)
    msg = data.get("message", "")
    if not msg:
        return jsonify({"reply": "Please describe your nutrition goal or question."})
    try:
        reply = call_llama(msg, "Focus on personalized nutrition insights and advice.")
    except Exception as e:
        reply = f"⚠️ Unable to reach AI backend: {e}"
    return jsonify({"reply": reply})


# === 2️⃣ Smart Food Scanner (Text-Based) ===
@app.route("/api/food_scanner_ai", methods=["POST"])
def food_scanner_ai():
    data = request.get_json(force=True)
    msg = data.get("message", "")
    if not msg:
        return jsonify({"reply": "Please describe or upload what was scanned."})
    try:
        role = (
            "You are an AI nutrition scanner. The user will describe a meal or ingredients. "
            "Estimate total calories, macros (protein, carbs, fats), and key nutrients. "
            "Return a concise summary with bullet points and daily value percentages if possible."
        )
        reply = call_llama(msg, role)
    except Exception as e:
        reply = f"⚠️ Smart Scanner error: {e}"
    return jsonify({"reply": reply})


# === 3️⃣ AI Meal Planner ===
@app.route("/api/meal_planner_ai", methods=["POST"])
def meal_planner_ai():
    data = request.get_json(force=True)
    msg = data.get("message", "")
    if not msg:
        return jsonify({"reply": "Please specify your calorie goal, diet type, or preferences."})
    try:
        role = (
            "You are an advanced AI diet planner for ArogyaAI. "
            "Generate a detailed, realistic 1-day meal plan aligned exactly with the user’s stated "
            "calorie (kcal), protein (g), and water (L) goals. "
            "Distribute macros proportionally across meals and snacks (e.g., breakfast 25%, lunch 35%, dinner 30%, snacks 10%). "
            "For each meal, list: meal name, foods + portions, estimated calories (kcal), and key macros (protein g / carbs g / fat g). "
            "Also summarize the full-day total at the end with kcal / protein / water intake. "
            "Ensure all numeric values preserve proper units (kcal, g, L). "
            "Keep the tone friendly, concise, and practical — like a human nutritionist explaining the plan."
        )
        reply = call_llama(msg, role)
    except Exception as e:
        reply = f"⚠️ Meal Planner AI error: {e}"
    return jsonify({"reply": reply})


# === 4️⃣ Camera-Powered Smart Food Scanner ===
@app.route("/api/food_scanner_image", methods=["POST"])
def food_scanner_image():
    if "image" not in request.files:
        return jsonify({"reply": "No image received. Please take a photo first."})
    try:
        UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        img = request.files["image"]
        img_path = os.path.join(UPLOAD_DIR, "temp_food.jpg")
        img.save(img_path)

        # ✅ Verify that the image was successfully saved
        print(f"[INFO] Saved image at: {img_path}, Size: {os.path.getsize(img_path)} bytes")

        role = (
            "You are an AI food recognition and nutrition expert. "
            "The user has provided an image of a meal. "
            "Identify all visible food items, estimate calories and macros, "
            "and discuss both positive and negative nutritional aspects clearly and kindly."
        )

        reply = call_llama("Analyze this food photo and describe it.", role, image_path=img_path)

        # Clean up
        if os.path.exists(img_path):
            os.remove(img_path)

    except Exception as e:
        reply = f"⚠️ Image analysis error: {e}"

    return jsonify({"reply": reply})


# === Run Server ===
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5007)

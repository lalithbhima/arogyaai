from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch

app = Flask(__name__)

# ✅ Choose an open model that works without authentication
MODEL_NAME = "HuggingFaceH4/zephyr-7b-beta"

# Load model + tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto"
)

# Create inference pipeline
chatbot = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=300,
    temperature=0.7,
    top_p=0.9,
)

@app.route("/api/mental_health_chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    if not user_message:
        return jsonify({"reply": "Please tell me how you’re feeling today 💬"}), 200

    # Construct conversation-style prompt
    prompt = f"""
You are ArogyaAI — a calm, kind, and empathetic mental health companion.
Be conversational, supportive, and positive. Never give diagnoses.
User: {user_message}
ArogyaAI:"""

    outputs = chatbot(prompt)
    reply = outputs[0]["generated_text"].split("ArogyaAI:")[-1].strip()

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)

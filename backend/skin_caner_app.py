import torch
import numpy as np
import cv2
from torchvision import models, transforms
from PIL import Image
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify
import json
import io
import base64

# ---- Model Setup ----
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
with open("labels.json") as f:
    idx2label = json.load(f)
model = models.resnet50(weights=None)
model.fc = torch.nn.Linear(model.fc.in_features, len(idx2label))
model.load_state_dict(torch.load("skin_cancer_resnet50.pth", map_location=device))
model.eval()
model = model.to(device)
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5]*3, [0.5]*3),
])

# ---- GradCAM Helper ----
class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self.hook_layers()
    def hook_layers(self):
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()
        def forward_hook(module, input, output):
            self.activations = output.detach()
        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_backward_hook(backward_hook)
    def generate(self, input_tensor, class_idx):
        self.model.zero_grad()
        output = self.model(input_tensor)
        score = output[:, class_idx]
        score.backward(retain_graph=True)
        gradients = self.gradients
        activations = self.activations
        weights = gradients.mean(dim=(2, 3), keepdim=True)
        cam = (weights * activations).sum(dim=1, keepdim=True)
        cam = torch.relu(cam)
        cam = cam.squeeze().cpu().numpy()
        cam = cv2.resize(cam, (input_tensor.shape[2], input_tensor.shape[3]))
        cam -= np.min(cam)
        cam /= np.max(cam)
        return cam

# ---- Flask App ----
app = Flask(__name__)

@app.route("/analyze", methods=["POST"])
def analyze():
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image provided."}), 400
    img = Image.open(file.stream).convert("RGB")
    input_tensor = preprocess(img).unsqueeze(0).to(device)
    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.softmax(outputs, dim=1)
        topk_probs, topk_indices = probs.topk(3)
    gradcam = GradCAM(model, model.layer4[-1])
    results = []
    for k in range(3):
        idx = topk_indices[0, k].item()
        prob = float(topk_probs[0, k])
        cam = gradcam.generate(input_tensor, idx)
        # Make overlay
        img_np = np.array(img.resize((224, 224))) / 255.0
        heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET) / 255.0
        overlay = np.uint8(np.clip(0.5 * img_np + 0.5 * heatmap, 0, 1) * 255)
        # Encode as base64 string
        _, buffer = cv2.imencode('.jpg', cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
        gradcam_b64 = base64.b64encode(buffer).decode("utf-8")
        results.append({
            "label": idx2label[str(idx)],
            "prob": prob,
            "gradcam": gradcam_b64
        })
    return jsonify({"topk": results})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)

# app.py
import io, base64, os
from flask import Flask, request, jsonify
from PIL import Image
import torch
import torch.nn as nn
import torchvision.transforms as T

# ---------- Model (must match training) ----------
class DoubleConv(nn.Module):
    def __init__(self, in_c, out_c):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_c, out_c, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(out_c, out_c, 3, padding=1), nn.ReLU(inplace=True)
        )
    def forward(self, x): return self.conv(x)

class ResUNet(nn.Module):
    def __init__(self, in_c=1, out_c=1, features=[64,128,256,512]):
        super().__init__()
        self.downs, self.ups = nn.ModuleList(), nn.ModuleList()
        for feat in features:
            self.downs.append(DoubleConv(in_c, feat)); in_c = feat
        self.bottleneck = DoubleConv(features[-1], features[-1]*2)
        for feat in reversed(features):
            self.ups.append(nn.ConvTranspose2d(feat*2, feat, 2, 2))
            self.ups.append(DoubleConv(feat*2, feat))
        self.final_conv = nn.Conv2d(features[0], out_c, 1)

    def forward(self, x):
        skips = []
        for down in self.downs:
            x = down(x); skips.append(x)
            x = nn.functional.max_pool2d(x, 2)
        x = self.bottleneck(x)
        skips = skips[::-1]
        for i in range(0, len(self.ups), 2):
            x = self.ups[i](x)
            skip = skips[i//2]
            if x.shape != skip.shape:
                x = nn.functional.interpolate(x, size=skip.shape[2:])
            x = torch.cat([skip, x], dim=1)
            x = self.ups[i+1](x)
        return self.final_conv(x)

# ---------- Load weights ----------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_PATH = "/Users/lalithbhima/ArogyaAI/image_enhancer_backend/resunet_xray_sr.pth"

model = ResUNet().to(device)
state = torch.load(MODEL_PATH, map_location=device)
# if trained with DataParallel or keys differ, allow non-strict:
try:
    model.load_state_dict(state, strict=True)
except Exception:
    model.load_state_dict(state, strict=False)
model.eval()

# ---------- Pre/Post ----------
# Must mirror training: grayscale(1) -> 256 -> tensor in [0,1]
preprocess = T.Compose([
    T.Grayscale(num_output_channels=1),
    T.Resize((256, 256)),
    T.ToTensor(),                 # 1xHxW, values in [0,1]
])

def tensor_gray_to_rgb_jpeg_b64(t: torch.Tensor) -> str:
    """
    t: [1,H,W] or [H,W], expected in [0,1]
    returns base64 JPEG (RGB) string
    """
    if t.ndim == 3:
        t = t.squeeze(0)
    arr = (t.clamp(0,1).cpu().numpy() * 255.0).round().astype('uint8')  # [H,W]
    pil = Image.fromarray(arr, mode='L').convert('RGB')  # force 3-channel RGB
    buf = io.BytesIO()
    pil.save(buf, format="JPEG", quality=92, optimize=True)  # JPEG avoids alpha weirdness
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')

# ---------- Flask ----------
app = Flask(__name__)

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok", "device": str(device)})

@app.route("/enhance_xray", methods=["POST"])
def enhance_xray():
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image provided"}), 400

    # Read as PIL, ensure grayscale
    img = Image.open(file.stream).convert("L")
    lr = preprocess(img).unsqueeze(0).to(device)          # [1,1,256,256]

    with torch.no_grad():
        # residual formulation from your training: output = lr + model(lr)
        residual = model(lr)
        enhanced = (lr + residual).clamp(0, 1)            # [1,1,256,256]

    # Encode BOTH as RGB JPEG base64 for RN <Image>
    low_res_b64 = tensor_gray_to_rgb_jpeg_b64(lr[0])
    enhanced_b64 = tensor_gray_to_rgb_jpeg_b64(enhanced[0])

    return jsonify({
        "low_res": low_res_b64,
        "enhanced": enhanced_b64
    })

if __name__ == "__main__":
    # Access from device on same Wi-Fi: use your LAN IP in the app
    app.run(host="0.0.0.0", port=5051)

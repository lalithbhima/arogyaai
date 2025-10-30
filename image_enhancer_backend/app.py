import io
import base64
import numpy as np
from PIL import Image, ImageOps
from flask import Flask, request, jsonify

import torch
import torch.nn as nn
import torchvision.transforms as T
import cv2  # for CLAHE + colormaps

# -----------------------
# Model (ResUNet) setup
# -----------------------
class DoubleConv(nn.Module):
    def __init__(self, in_c, out_c):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_c, out_c, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(out_c, out_c, 3, padding=1), nn.ReLU(inplace=True)
        )
    def forward(self, x):
        return self.conv(x)

class ResUNet(nn.Module):
    def __init__(self, in_c=1, out_c=1, features=[64, 128, 256, 512]):
        super().__init__()
        self.downs = nn.ModuleList()
        self.ups = nn.ModuleList()
        in_ch = in_c
        for feat in features:
            self.downs.append(DoubleConv(in_ch, feat))
            in_ch = feat
        self.bottleneck = DoubleConv(features[-1], features[-1]*2)
        for feat in reversed(features):
            self.ups.append(nn.ConvTranspose2d(feat*2, feat, 2, 2))
            self.ups.append(DoubleConv(feat*2, feat))
        self.final_conv = nn.Conv2d(features[0], out_c, 1)

    def forward(self, x):
        skips = []
        for down in self.downs:
            x = down(x)
            skips.append(x)
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

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = ResUNet().to(device)

ckpt_path = "resunet_xray_sr.pth"
try:
    state = torch.load(ckpt_path, map_location=device)
    model.load_state_dict(state, strict=False)
    print(f"[Model] Loaded checkpoint: {ckpt_path}")
except Exception as e:
    print(f"[Model] WARNING: failed to load checkpoint at {ckpt_path}: {e}\nUsing random weights.")

model.eval()

# -----------------------
# Pre/post helpers
# -----------------------
INPUT_SIZE = 256
to_tensor = T.Compose([
    T.Resize((INPUT_SIZE, INPUT_SIZE)),
    T.ToTensor()  # 0..1 float, [1,H,W] for grayscale
])

def pil_gray_to_rgb(pil_img_gray: Image.Image) -> Image.Image:
    if pil_img_gray.mode != "L":
        pil_img_gray = pil_img_gray.convert("L")
    return Image.merge("RGB", (pil_img_gray, pil_img_gray, pil_img_gray))

def np_to_jpeg_b64(np_img_uint8_gray: np.ndarray) -> str:
    pil_gray = Image.fromarray(np_img_uint8_gray, mode="L")
    pil_rgb = ImageOps.autocontrast(pil_gray_to_rgb(pil_gray))
    buf = io.BytesIO()
    pil_rgb.save(buf, format="JPEG", quality=92, optimize=True)
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def np_rgb_to_jpeg_b64(np_img_rgb_uint8: np.ndarray) -> str:
    pil_rgb = Image.fromarray(np_img_rgb_uint8, mode="RGB")
    pil_rgb = ImageOps.autocontrast(pil_rgb)
    buf = io.BytesIO()
    pil_rgb.save(buf, format="JPEG", quality=92, optimize=True)
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def tensor_to_uint8_minmax(t: torch.Tensor) -> np.ndarray:
    if t.ndim == 3 and t.shape[0] == 1:
        t = t[0]
    t = t.detach().cpu().float()
    t_min = float(t.min())
    t_max = float(t.max())
    denom = max(t_max - t_min, 1e-8)
    t_norm = (t - t_min) / denom
    print(f"[Post] enhanced min={t_min:.6f} max={t_max:.6f}")
    return (t_norm.numpy() * 255.0).round().clip(0, 255).astype(np.uint8)

def clahe_gray(img_uint8: np.ndarray, clip=1.5, tile=8) -> np.ndarray:
    clahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=(tile, tile))
    return clahe.apply(img_uint8)

# ---------- Grad-CAM-ish for U-Net ----------
class CAMHook:
    """Hooks a module to capture activations and gradients (Grad-CAM-style)."""
    def __init__(self, module):
        self.activations = None
        self.gradients = None
        module.register_forward_hook(self._forward_hook)
        # compatibility with PyTorch 1.x/2.x
        if hasattr(module, "register_full_backward_hook"):
            module.register_full_backward_hook(self._backward_hook)
        else:
            module.register_backward_hook(self._backward_hook)

    def _forward_hook(self, module, inp, out):
        self.activations = out

    def _backward_hook(self, module, grad_input, grad_output):
        # grad_output is a tuple; take grad wrt module output
        self.gradients = grad_output[0]

def make_cam_from_hook(hook: CAMHook, up_h: int, up_w: int) -> np.ndarray:
    """Return CAM in [0,1] as HxW from stored activations+gradients, or None."""
    if hook.activations is None or hook.gradients is None:
        return None
    A = hook.activations.detach()      # [B,C,h,w]
    G = hook.gradients.detach()        # [B,C,h,w]
    if A.ndim != 4 or G.ndim != 4:
        return None
    # weights: mean over spatial dims
    weights = G.mean(dim=(2, 3), keepdim=True)        # [B,C,1,1]
    cam = (weights * A).sum(dim=1, keepdim=True)      # [B,1,h,w]
    cam = torch.relu(cam)
    cam = torch.nn.functional.interpolate(cam, size=(up_h, up_w), mode="bilinear", align_corners=False)
    cam = cam[0, 0].cpu().numpy()
    cam -= cam.min()
    if cam.max() > 1e-8:
        cam /= cam.max()
    return cam  # 0..1 float

def overlay_heatmap_on_gray(gray_uint8: np.ndarray, cam01: np.ndarray, alpha=0.45) -> np.ndarray:
    """gray_uint8 HxW, cam01 HxW 0..1 -> RGB overlay uint8."""
    cam_uint8 = (cam01 * 255).astype(np.uint8)
    heat_bgr = cv2.applyColorMap(cam_uint8, cv2.COLORMAP_JET)          # BGR
    heat_rgb = cv2.cvtColor(heat_bgr, cv2.COLOR_BGR2RGB).astype(np.float32)
    gray_rgb = np.stack([gray_uint8]*3, axis=-1).astype(np.float32)
    blend = np.clip((1 - alpha) * gray_rgb + alpha * heat_rgb, 0, 255).astype(np.uint8)
    return blend

# -----------------------
# Flask app
# -----------------------
app = Flask(__name__)

@app.route("/ping_image", methods=["GET"])
def ping_image():
    H, W = 256, 256
    grad = np.tile(np.linspace(0, 255, W, dtype=np.uint8), (H, 1))
    return jsonify({"enhanced": np_to_jpeg_b64(grad)})

@app.route("/enhance_xray", methods=["POST"])
def enhance_xray():
    """
    POST form-data: image=<file>
    Optional query params:
      - alpha: residual boost (default 1.25)
      - clahe: 0/1 enable CLAHE (default 1)
    """
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image provided"}), 400

    img = Image.open(file.stream)
    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass
    img_gray = img.convert("L")
    img_gray_resized = img_gray.resize((INPUT_SIZE, INPUT_SIZE), Image.BICUBIC)

    lr_tensor = to_tensor(img_gray)      # [1,H,W]
    lr_tensor = lr_tensor.unsqueeze(0).to(device)  # [1,1,H,W]

    try:
        alpha = float(request.args.get("alpha", 1.25))
    except Exception:
        alpha = 1.25
    use_clahe = request.args.get("clahe", "1") != "0"

    print(f"[Pre] input tensor {tuple(lr_tensor.shape)} "
          f"min={float(lr_tensor.min()):.6f} max={float(lr_tensor.max()):.6f}")

    with torch.no_grad():
        residual = model(lr_tensor)
        enhanced = (lr_tensor + alpha * residual)
        mean_abs = float(residual.abs().mean()); max_abs = float(residual.abs().max())
        print(f"[SR] residual| mean_abs={mean_abs:.6f} max_abs={max_abs:.6f} alpha={alpha:.2f}")

    # low-res preview
    lr_np = np.array(img_gray_resized, dtype=np.uint8)
    low_res_b64 = np_to_jpeg_b64(lr_np)

    # enhanced
    enh_uint8 = tensor_to_uint8_minmax(enhanced[0])
    if use_clahe:
        enh_uint8 = clahe_gray(enh_uint8, clip=1.5, tile=8)
    enhanced_b64 = np_to_jpeg_b64(enh_uint8)

    return jsonify({"low_res": low_res_b64, "enhanced": enhanced_b64})

@app.route("/enhance_xray_explain", methods=["POST"])
def enhance_xray_explain():
    """
    Same as /enhance_xray, but also returns an explanation heatmap overlay:
    - 'explain': Grad-CAM–style map from the bottleneck (fallback: residual magnitude).
    """
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image provided"}), 400

    img = Image.open(file.stream)
    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass
    img_gray = img.convert("L")
    img_gray_resized = img_gray.resize((INPUT_SIZE, INPUT_SIZE), Image.BICUBIC)

    lr_tensor = to_tensor(img_gray).unsqueeze(0).to(device)

    try:
        alpha = float(request.args.get("alpha", 1.25))
    except Exception:
        alpha = 1.25
    use_clahe = request.args.get("clahe", "1") != "0"

    # Hook the bottleneck block for CAM
    hook = CAMHook(model.bottleneck.conv)

    model.zero_grad(set_to_none=True)
    # Forward with grad (no torch.no_grad here!)
    residual = model(lr_tensor)
    enhanced = lr_tensor + alpha * residual

    # Define a "detail score" to backprop through
    score = (residual.abs()).mean()
    score.backward(retain_graph=False)

    cam01 = make_cam_from_hook(hook, INPUT_SIZE, INPUT_SIZE)

    # Fallback: residual magnitude map if CAM is None for any reason
    if cam01 is None:
        print("[Explain] CAM unavailable; using residual magnitude fallback.")
        res = residual.detach().abs()[0, 0].cpu().numpy()
        res -= res.min()
        if res.max() > 1e-8:
            res /= res.max()
        cam01 = res

    # Base images
    lr_np = np.array(img_gray_resized, dtype=np.uint8)
    low_res_b64 = np_to_jpeg_b64(lr_np)

    enh_uint8 = tensor_to_uint8_minmax(enhanced[0])
    if use_clahe:
        enh_uint8 = clahe_gray(enh_uint8, clip=1.5, tile=8)
    enhanced_b64 = np_to_jpeg_b64(enh_uint8)

    # Overlay heatmap on *enhanced* (clearer) image
    overlay_rgb = overlay_heatmap_on_gray(enh_uint8, cam01, alpha=0.45)
    explain_b64 = np_rgb_to_jpeg_b64(overlay_rgb)

    return jsonify({
        "low_res": low_res_b64,
        "enhanced": enhanced_b64,
        "explain": explain_b64
    })

if __name__ == "__main__":
    # Run: python app.py
    app.run(host="0.0.0.0", port=5051)

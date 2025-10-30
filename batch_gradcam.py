import torch
import numpy as np
import cv2
from torchvision import models, transforms
from PIL import Image
import matplotlib.pyplot as plt
import os
import json
import pandas as pd

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
    
# Utitlity function to show image with heatmap overlay

def overlay_heatmap(img, cam):
    img_np = np.array(img.resize((cam.shape[1], cam.shape[0]))) / 255.0
    heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET) / 255.0
    overlay = (0.5 * img_np + 0.5 * heatmap)
    overlay = np.clip(overlay, 0, 1)
    return overlay

def batch_gradcam(
        img_paths,
        model,
        device,
        idx2label,
        preprocess_tfms,
        topk=3,
        save_dir="gradcam_results"
):
    os.makedirs(save_dir, exist_ok=True)
    model.eval()
    target_layer = model.layer4[-1]
    gradcam = GradCAM(model, target_layer)

    n = len(img_paths)
    if n == 0:
        print("No images provided!")
        return

    fig, axs = plt.subplots(n, topk+1, figsize=(5*(topk+1), 5*n))
    if n == 1:
        axs = axs.reshape(1, -1)
    
    # === 1. Add this line: ===
    results = []

    for i, img_path in enumerate(img_paths):
        img = Image.open(img_path).convert('RGB')
        input_tensor = preprocess_tfms(img).unsqueeze(0).to(device)
        with torch.no_grad():
            outputs = model(input_tensor)
            probs = torch.softmax(outputs, dim=1)
            topk_probs, topk_indices = probs.topk(topk)
        axs[i, 0].imshow(img.resize((224, 224)))
        axs[i, 0].set_title("Original")
        axs[i, 0].axis("off")

        # === 2. Prepare JSON entry for this image: ===
        entry = {
            "original": os.path.basename(img_path),
            "topk": []
        }

        for k in range(topk):
            idx = topk_indices[0, k].item()
            cam = gradcam.generate(input_tensor, idx)
            overlay = overlay_heatmap(img, cam)
            axs[i, k+1].imshow(overlay)
            axs[i, k+1].set_title(f"{idx2label[str(idx)]}: {topk_probs[0, k]:.2f}")
            axs[i, k+1].axis('off')
            save_path = os.path.join(save_dir, f"{os.path.basename(img_path)}_top{k+1}_{idx2label[str(idx)]}.jpg")
            plt.imsave(save_path, overlay)
            
            # === 3. Add Grad-CAM info for this class: ===
            entry["topk"].append({
                "label": idx2label[str(idx)],
                "prob": float(topk_probs[0, k]),
                "gradcam": os.path.basename(save_path)
            })
        
        # === 4. Add entry to results: ===
        results.append(entry)

    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, "gradcam_grid.jpg"))
    plt.show()

    # === 5. Save all results to JSON: ===
    with open(os.path.join(save_dir, "results.json"), "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    with open("labels.json") as f:
        idx2label = json.load(f)
    # Load model
    model = models.resnet50(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, len(idx2label))
    model.load_state_dict(torch.load("skin_cancer_resnet50.pth", map_location=device))
    model = model.to(device)
    preprocess_tfms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.5]*3, [0.5]*3),
    ])
    # Select test images (example: 5 random images from test set)
    import random
    meta = pd.read_csv("HAM10000_metadata.csv")
    image_dirs = ["HAM10000_images_part_1", "HAM10000_images_part_2"]
    image_paths = {}
    for dir in image_dirs:
        for fname in os.listdir(dir):
            if fname.endswith('.jpg'):
                image_paths[fname[:-4]] = os.path.join(dir, fname)
    meta['image_path'] = meta['image_id'].map(image_paths)
    test_imgs = meta.sample(5, random_state=42)['image_path'].tolist()
    batch_gradcam(test_imgs, model, device, idx2label, preprocess_tfms, topk=3)

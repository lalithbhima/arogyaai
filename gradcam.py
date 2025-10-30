import torch
import numpy as np
import cv2
from torchvision import models, transforms
from PIL import Image
import matplotlib.pyplot as plt
import json

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
        cam = cv2.resize(cam, (input_tensor.shape[3], input_tensor.shape[2]))
        cam -= np.min(cam)
        cam /= np.max(cam) + 1e-8
        return cam

def show_gradcam_on_image(img_path, model, device, idx2label, preprocess_tfms, class_idx=None, save_path="gradcam_result.jpg"):
    model.eval()
    img = Image.open(img_path).convert('RGB')
    input_tensor = preprocess_tfms(img).unsqueeze(0).to(device)

    # Predict if class_idx not provided
    with torch.no_grad():
        outputs = model(input_tensor)
        if class_idx is None:
            class_idx = outputs.argmax(dim=1).item()

    # Grad-CAM
    target_layer = model.layer4[-1]
    gradcam = GradCAM(model, target_layer)
    cam = gradcam.generate(input_tensor, class_idx)

    # Show
    img_np = np.array(img.resize((input_tensor.shape[2], input_tensor.shape[3]))) / 255.0
    heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET) / 255.0
    overlay = 0.5 * img_np + 0.5 * heatmap
    plt.figure(figsize=(8, 4))
    plt.subplot(1, 2, 1)
    plt.title("Original Image")
    plt.axis("off")
    plt.imshow(img_np)
    plt.subplot(1, 2, 2)
    plt.title(f"Grad-CAM: {idx2label[str(class_idx)]}")
    plt.axis("off")
    plt.imshow(overlay)
    plt.savefig(save_path)
    plt.show()

if __name__ == "__main__":
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    # Load label mapping
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
    img_path = "HAM10000_images_part_1/ISIC_0027419.jpg"
    show_gradcam_on_image(img_path, model, device, idx2label, preprocess_tfms, save_path="gradcam_result.jpg")

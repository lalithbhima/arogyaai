# train_skin_cancer_cnn.py

import os
import pandas as pd
from PIL import Image
from sklearn.model_selection import train_test_split
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
import torch.nn as nn
from tqdm import tqdm
import matplotlib.pyplot as plt

# 3. Prepare Metadata & Labels
meta = pd.read_csv("HAM10000_metadata.csv")
labels = meta['dx'].unique()
label2idx = {label: idx for idx, label in enumerate(labels)}
meta['label'] = meta['dx'].map(label2idx)

image_dirs = ["HAM10000_images_part_1", "HAM10000_images_part_2"]
image_paths = {}
for dir in image_dirs:
    for fname in os.listdir(dir):
        if fname.endswith('.jpg'):
            image_paths[fname[:-4]] = os.path.join(dir, fname)
meta['image_path'] = meta['image_id'].map(image_paths)

# ---- MOVE THIS CLASS OUTSIDE ----
class HAM10000Dataset(Dataset):
    def __init__(self, df, transform=None):
        self.df = df.reset_index(drop=True)
        self.transform = transform
    def __len__(self):
        return len(self.df)
    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img = Image.open(row['image_path']).convert('RGB')
        label = row['label']
        if self.transform:
            img = self.transform(img)
        return img, label

# -----------------
if __name__ == "__main__":
    # 4. Train/Val/Test Split
    train_df, test_df = train_test_split(meta, test_size=0.2, stratify=meta['label'], random_state=42)
    train_df, val_df = train_test_split(train_df, test_size=0.1, stratify=train_df['label'], random_state=42)
    print(f"Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")

    # 6. Transforms & DataLoaders
    input_size = 224
    batch_size = 32
    train_tfms = transforms.Compose([
        transforms.Resize((input_size, input_size)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.5]*3, [0.5]*3),
    ])
    val_tfms = transforms.Compose([
        transforms.Resize((input_size, input_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.5]*3, [0.5]*3),
    ])

    train_ds = HAM10000Dataset(train_df, train_tfms)
    val_ds = HAM10000Dataset(val_df, val_tfms)
    test_ds = HAM10000Dataset(test_df, val_tfms)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=2)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=2)

    # 7. Model: Transfer Learning with ResNet50
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = models.resnet50(weights="IMAGENET1K_V2")
    model.fc = nn.Linear(model.fc.in_features, len(labels))
    model = model.to(device)

    # 8. Training Loop
    epochs = 5
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
    criterion = nn.CrossEntropyLoss()

    def train_epoch(loader):
        model.train()
        total_loss = 0
        correct = 0
        for imgs, labels in tqdm(loader):
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            output = model(imgs)
            loss = criterion(output, labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item() * imgs.size(0)
            correct += (output.argmax(1) == labels).sum().item()
        return total_loss / len(loader.dataset), correct / len(loader.dataset)

    def val_epoch(loader):
        model.eval()
        total_loss = 0
        correct = 0
        with torch.no_grad():
            for imgs, labels in tqdm(loader):
                imgs, labels = imgs.to(device), labels.to(device)
                output = model(imgs)
                loss = criterion(output, labels)
                total_loss += loss.item() * imgs.size(0)
                correct += (output.argmax(1) == labels).sum().item()
        return total_loss / len(loader.dataset), correct / len(loader.dataset)

    for epoch in range(epochs):
        train_loss, train_acc = train_epoch(train_loader)
        val_loss, val_acc = val_epoch(val_loader)
        print(f"Epoch {epoch+1}/{epochs} - Train Loss: {train_loss:.4f}, Acc: {train_acc:.4f} | Val Loss: {val_loss:.4f}, Acc: {val_acc:.4f}")

    # Save model
    torch.save(model.state_dict(), "skin_cancer_resnet50.pth")

    # 9. Evaluate on Test Set
    test_loss, test_acc = val_epoch(test_loader)
    print(f"Test Loss: {test_loss:.4f}, Test Accuracy: {test_acc:.4f}")

    # 10. [Optional] Grad-CAM for Explainability (Let me know if you want this section)

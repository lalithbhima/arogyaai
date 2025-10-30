import os
from PIL import Image

high_res_base_dir = "/Users/lalithbhima/ArogyaAI/image_enhancer_backend/images"
low_res_base_dir = "/Users/lalithbhima/ArogyaAI/image_enhancer_backend/images_low_res"

os.makedirs(low_res_base_dir, exist_ok=True)

for subfolder in sorted(os.listdir(high_res_base_dir)):
    subfolder_path = os.path.join(high_res_base_dir, subfolder)
    if not os.path.isdir(subfolder_path):
        continue  # Skip files like .DS_Store
    # Make matching low-res subfolder
    low_res_subfolder = os.path.join(low_res_base_dir, subfolder)
    os.makedirs(low_res_subfolder, exist_ok=True)
    for fname in os.listdir(subfolder_path):
        file_path = os.path.join(subfolder_path, fname)
        if not os.path.isfile(file_path):
            continue  # Skip directories or weird items
        if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
            img = Image.open(file_path)
            # Downscale, e.g. by 2x
            img_lr = img.resize((img.width // 2, img.height // 2), Image.BICUBIC)
            img_lr.save(os.path.join(low_res_subfolder, fname))

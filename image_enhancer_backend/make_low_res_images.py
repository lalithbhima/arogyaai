import os
from PIL import Image, ImageFilter

def make_low_res_superres(img_path, out_path, downscale=4, blur_radius=0):
    """
    Makes a 'low-res' version: downsample/upsample, with optional blur.
    - downscale: e.g. 4 means 256x256 → 64x64 → 256x256
    - blur_radius: 0 means no blur, >0 adds Gaussian blur after downsample
    """
    img = Image.open(img_path).convert("L")
    w, h = img.size

    # Downsample (reduce resolution)
    img_lr = img.resize((w // downscale, h // downscale), resample=Image.BICUBIC)

    # Optional: add blur
    if blur_radius > 0:
        img_lr = img_lr.filter(ImageFilter.GaussianBlur(radius=blur_radius))

    # Upsample back to original size (still blurry/low-res)
    img_lr_up = img_lr.resize((w, h), resample=Image.BICUBIC)
    img_lr_up.save(out_path)

# ---- Main config ----
high_res_root = "images"         # input
low_res_root = "images_low_res"  # output
downscale = 4                    # 4x downsampling (classic for super-res)
blur_radius = 0                  # 0 = no blur; set >0 to add blur as well

num_done = 0
for subdir, _, files in os.walk(high_res_root):
    for file in files:
        if file.lower().endswith(('.png', '.jpg', '.jpeg')):
            in_path = os.path.join(subdir, file)
            rel_subdir = os.path.relpath(subdir, high_res_root)
            out_dir = os.path.join(low_res_root, rel_subdir)
            os.makedirs(out_dir, exist_ok=True)
            out_path = os.path.join(out_dir, file)
            make_low_res_superres(in_path, out_path, downscale=downscale, blur_radius=blur_radius)
            num_done += 1
            if num_done % 1000 == 0:
                print(f"Processed {num_done} images...")

print(f"All done! Processed {num_done} images from '{high_res_root}' into '{low_res_root}'")

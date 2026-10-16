import os
import shutil
from PIL import Image

brain_dir = r"C:\Users\gunas\.gemini\antigravity-ide\brain\820efcd5-5768-4c9e-abb5-65b17521a50b"
public_crops = r"seediq-frontend\public\crops"

generated_crops = {
    'leek': os.path.join(brain_dir, 'leek_fresh_crop_1792092185094.jpg'),
    'taro': os.path.join(brain_dir, 'taro_fresh_crop_1792092211514.jpg'),
    'canola': os.path.join(brain_dir, 'canola_fresh_crop_1792092238266.jpg'),
    'soybean': os.path.join(brain_dir, 'soybean_fresh_crop_1792092271123.jpg'),
    'soyabean': os.path.join(brain_dir, 'soybean_fresh_crop_1792092271123.jpg')
}

# 1. Process and save crop images as webp
for crop, src_path in generated_crops.items():
    crop_dir = os.path.join(public_crops, crop)
    os.makedirs(crop_dir, exist_ok=True)
    
    img = Image.open(src_path).convert('RGB')
    img.thumbnail((800, 800), Image.Resampling.LANCZOS)
    target_crop = os.path.join(crop_dir, 'crop.webp')
    img.save(target_crop, 'WEBP', quality=88)
    print(f"Saved {crop}/crop.webp ({img.size}, {os.path.getsize(target_crop)} bytes)")

# 2. Assign high-accuracy authentic storage images
storage_sources = {
    'leek': os.path.join(public_crops, 'cabbage', 'storage.webp'), # Ultrasonic high humidity cold storage (0°C, 95-98% RH)
    'taro': os.path.join(public_crops, 'potato', 'storage.webp'), # Cured dark ventilated tuber store
    'canola': os.path.join(public_crops, 'sunflower', 'storage.webp'), # Climate-controlled aerated oilseed silo
    'soybean': os.path.join(public_crops, 'soyabean', 'storage.webp'), # Aerated oilseed warehouse / silo
    'soyabean': os.path.join(public_crops, 'soyabean', 'storage.webp')
}

for crop, storage_src in storage_sources.items():
    crop_dir = os.path.join(public_crops, crop)
    target_storage = os.path.join(crop_dir, 'storage.webp')
    if os.path.exists(storage_src):
        if not os.path.exists(target_storage) or crop != 'soyabean':
            shutil.copyfile(storage_src, target_storage)
            print(f"Assigned {crop}/storage.webp from {os.path.basename(os.path.dirname(storage_src))} ({os.path.getsize(target_storage)} bytes)")
    else:
        print(f"Storage source missing for {crop}: {storage_src}")

print("Image installation complete!")

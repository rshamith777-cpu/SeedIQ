import requests
from PIL import Image
import io
import os

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

retry_targets = {
    'zucchini': 'Cucurbita_pepo',
    'squash': 'Winter_squash',
    'sponge-guard': 'Luffa',
    'sponge-gourd': 'Luffa',
    'ash-gourd': 'Wax_gourd',
    'asparagus': 'Asparagus_officinalis',
    'aspargus': 'Asparagus_officinalis'
}

for slug, title in retry_targets.items():
    crop_path = f"seediq-frontend/public/crops/{slug}/crop.webp"
    if os.path.exists(crop_path) and os.path.getsize(crop_path) > 1000:
        print(f"{slug} already has crop image ({os.path.getsize(crop_path)} bytes)")
        continue
    
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code == 200:
            data = r.json()
            img_url = (data.get('thumbnail') or {}).get('source') or (data.get('originalimage') or {}).get('source')
            if img_url:
                resp = requests.get(img_url, headers=HEADERS, timeout=20)
                if resp.status_code == 200:
                    img = Image.open(io.BytesIO(resp.content)).convert('RGB')
                    img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                    os.makedirs(f"seediq-frontend/public/crops/{slug}", exist_ok=True)
                    img.save(crop_path, 'WEBP', quality=85)
                    print(f"SUCCESS: {slug} saved from {title} ({img.size})")
                else:
                    print(f"Failed image download for {slug}: HTTP {resp.status_code}")
            else:
                print(f"No image found for {slug} in {title}")
        else:
            print(f"HTTP {r.status_code} for {slug} ({title})")
    except Exception as e:
        print(f"Error for {slug}: {e}")

# Also ensure chilli and chili share the image
if os.path.exists("seediq-frontend/public/crops/chilli/crop.webp") and not os.path.exists("seediq-frontend/public/crops/chili/crop.webp"):
    os.makedirs("seediq-frontend/public/crops/chili", exist_ok=True)
    with open("seediq-frontend/public/crops/chilli/crop.webp", "rb") as fsrc, open("seediq-frontend/public/crops/chili/crop.webp", "wb") as fdst:
        fdst.write(fsrc.read())
    print("Copied chili crop from chilli!")

if os.path.exists("seediq-frontend/public/crops/pigeon-pea/crop.webp") and not os.path.exists("seediq-frontend/public/crops/piegon-pea/crop.webp"):
    os.makedirs("seediq-frontend/public/crops/piegon-pea", exist_ok=True)
    with open("seediq-frontend/public/crops/pigeon-pea/crop.webp", "rb") as fsrc, open("seediq-frontend/public/crops/piegon-pea/crop.webp", "wb") as fdst:
        fdst.write(fsrc.read())

if os.path.exists("seediq-frontend/public/crops/cowpea/crop.webp") and not os.path.exists("seediq-frontend/public/crops/cow-pea/crop.webp"):
    os.makedirs("seediq-frontend/public/crops/cow-pea", exist_ok=True)
    with open("seediq-frontend/public/crops/cowpea/crop.webp", "rb") as fsrc, open("seediq-frontend/public/crops/cow-pea/crop.webp", "wb") as fdst:
        fdst.write(fsrc.read())

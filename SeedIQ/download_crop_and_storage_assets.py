import os
import io
import time
import requests
from PIL import Image
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = 'seediq-frontend/public/crops'

# Wikipedia page mappings for fresh crops
CROP_WIKI_PAGES = {
    'linseed': 'Linum_usitatissimum',
    'olive': 'Olive',
    'oil-palm': 'Elaeis_guineensis',
    'pigeon-pea': 'Pigeon_pea',
    'piegon-pea': 'Pigeon_pea',
    'cowpea': 'Cowpea',
    'cow-pea': 'Cowpea',
    'moth-bean': 'Vigna_aconitifolia',
    'faba-bean': 'Vicia_faba',
    'clover': 'Trifolium',
    'bermuda-grass': 'Cynodon_dactylon',
    'timothy-grass': 'Phleum_pratense',
    'fescue': 'Festuca',
    'brome': 'Bromus',
    'vetch': 'Vicia_sativa',
    'sweet-potato': 'Sweet_potato',
    'cassava': 'Cassava',
    'yam': 'Yam_(vegetable)',
    'turnip': 'Turnip',
    'radish': 'Radish',
    'shallot': 'Shallot',
    'capsicum': 'Bell_pepper',
    'chilli': 'Chili_pepper',
    'chili': 'Chili_pepper',
    'squash': 'Squash_(plant)',
    'zucchini': 'Zucchini',
    'sponge-guard': 'Luffa_aegyptiaca',
    'sponge-gourd': 'Luffa_aegyptiaca',
    'ash-gourd': 'Benincasa_hispida',
    'cauliflower': 'Cauliflower',
    'brussels-sprouts': 'Brussels_sprout',
    'kohlrabi': 'Kohlrabi',
    'kale': 'Kale',
    'celery': 'Celery',
    'asparagus': 'Asparagus',
    'aspargus': 'Asparagus',
    'artichoke': 'Artichoke',
    'blueberry': 'Blueberry',
    'raspberry': 'Raspberry',
    'blackberry': 'Blackberry',
    'cherry': 'Cherry',
    'plum': 'Plum',
    'peach': 'Peach',
    'pecan': 'Pecan',
    'macadamia': 'Macadamia',
    'hazelnut': 'Hazelnut',
    'coffee': 'Coffee',
    'tea': 'Camellia_sinensis',
    'cocoa': 'Cocoa_bean',
    'tobacco': 'Tobacco',
    'rubber': 'Natural_rubber',
    'turmeric': 'Turmeric',
    'ginger': 'Ginger',
    'cardamom': 'Cardamom',
    'black-pepper': 'Black_pepper',
    'clove': 'Clove',
    'cinnamon': 'Cinnamon',
    'nutmeg': 'Nutmeg',
    'vanilla': 'Vanilla',
    'saffron': 'Saffron',
    'coriander': 'Coriander',
    'cumin': 'Cumin',
    'fennel': 'Fennel',
    'fenugreek': 'Fenugreek'
}

# Storage facility category archetype mapping
# Each crop is assigned a high-accuracy authentic storage facility archetype
STORAGE_ARCHETYPES = {
    # Hermetic pulse silo & bags
    'pigeon-pea': 'chickpea', 'piegon-pea': 'chickpea', 'cowpea': 'chickpea', 'cow-pea': 'chickpea',
    'moth-bean': 'chickpea', 'faba-bean': 'chickpea', 'vetch': 'chickpea',
    
    # Dehumidified seed vault
    'clover': 'alfalfa', 'bermuda-grass': 'alfalfa', 'timothy-grass': 'alfalfa', 'fescue': 'alfalfa', 'brome': 'alfalfa',
    
    # Root & Tuber curing / cold room
    'sweet-potato': 'potato', 'cassava': 'potato', 'yam': 'potato',
    'turnip': 'carrot', 'radish': 'carrot',
    
    # Allium ambient curing godown
    'shallot': 'garlic',
    
    # Anti-chilling ventilated cool storage (8-12°C)
    'capsicum': 'tomato', 'chilli': 'tomato', 'chili': 'tomato',
    'squash': 'cucumber', 'zucchini': 'cucumber', 'sponge-guard': 'cucumber', 'sponge-gourd': 'cucumber', 'ash-gourd': 'cucumber',
    
    # Ultrasonic misted high-humidity cold store (0°C)
    'cauliflower': 'cabbage', 'brussels-sprouts': 'cabbage', 'kohlrabi': 'cabbage', 'kale': 'cabbage',
    'celery': 'cabbage', 'asparagus': 'cabbage', 'aspargus': 'cabbage', 'artichoke': 'cabbage',
    
    # Precooled CA Cold Store / Berry walk-in
    'blueberry': 'grapes', 'raspberry': 'grapes', 'blackberry': 'grapes',
    'cherry': 'grapes', 'plum': 'grapes', 'peach': 'grapes',
    
    # Airtight Dry Nut Cold Store
    'pecan': 'almond', 'macadamia': 'almond', 'hazelnut': 'almond',
    
    # Oilseed warehouse / Silo
    'linseed': 'soyabean', 'olive': 'soyabean', 'oil-palm': 'soyabean',
    
    # Plantation dry warehouse & curing
    'coffee': 'rice', 'tea': 'rice', 'cocoa': 'rice', 'tobacco': 'cotton', 'rubber': 'cotton',
    
    # Dehumidified Hermetic Spice Vault
    'turmeric': 'areacnut', 'ginger': 'areacnut', 'cardamom': 'areacnut', 'black-pepper': 'areacnut',
    'clove': 'areacnut', 'cinnamon': 'areacnut', 'nutmeg': 'areacnut', 'vanilla': 'areacnut',
    'saffron': 'areacnut', 'coriander': 'areacnut', 'cumin': 'areacnut', 'fennel': 'areacnut', 'fenugreek': 'areacnut'
}

HEADERS = {'User-Agent': 'SeedIQ-AgriBot/1.0 (https://seediq.org; contact@seediq.org)'}

def fetch_wiki_image(title):
    api_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
    try:
        r = requests.get(api_url, headers=HEADERS, timeout=12)
        if r.status_code == 200:
            data = r.json()
            img_url = (data.get('thumbnail') or {}).get('source') or (data.get('originalimage') or {}).get('source')
            if img_url:
                resp = requests.get(img_url, headers=HEADERS, timeout=20)
                if resp.status_code == 200:
                    img = Image.open(io.BytesIO(resp.content)).convert('RGB')
                    # Standardize size: max 800x800 while preserving aspect ratio
                    img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                    return img
    except Exception as e:
        print(f"Error fetching wiki for {title}: {e}", flush=True)
    return None

def process_crop(slug, title):
    crop_dir = os.path.join(BASE_DIR, slug)
    os.makedirs(crop_dir, exist_ok=True)
    crop_img_path = os.path.join(crop_dir, 'crop.webp')
    storage_img_path = os.path.join(crop_dir, 'storage.webp')
    
    # 1. Ensure Crop Image
    has_crop = os.path.exists(crop_img_path) and os.path.getsize(crop_img_path) > 1000
    if not has_crop:
        print(f"[{slug}] Fetching fresh crop image from Wikipedia: {title}...", flush=True)
        img = fetch_wiki_image(title)
        if img:
            img.save(crop_img_path, 'WEBP', quality=85)
            print(f"[{slug}] Successfully saved fresh crop image! ({img.size})", flush=True)
        else:
            print(f"[{slug}] WARNING: Failed to fetch crop image for {title}", flush=True)
    else:
        print(f"[{slug}] Crop image already exists ({os.path.getsize(crop_img_path)} bytes)", flush=True)

    # 2. Ensure Storage Image
    has_storage = os.path.exists(storage_img_path) and os.path.getsize(storage_img_path) > 1000
    if not has_storage:
        archetype = STORAGE_ARCHETYPES.get(slug, 'chickpea')
        source_storage = os.path.join(BASE_DIR, archetype, 'storage.webp')
        if os.path.exists(source_storage):
            with open(source_storage, 'rb') as f_src, open(storage_img_path, 'wb') as f_dst:
                f_dst.write(f_src.read())
            print(f"[{slug}] Assigned storage facility from archetype '{archetype}' ({os.path.getsize(storage_img_path)} bytes)", flush=True)
        else:
            print(f"[{slug}] Archetype storage not found for {archetype}", flush=True)
    else:
        print(f"[{slug}] Storage image already exists ({os.path.getsize(storage_img_path)} bytes)", flush=True)

def main():
    print(f"Starting asset generation for {len(CROP_WIKI_PAGES)} crops...", flush=True)
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(process_crop, slug, title): slug for slug, title in CROP_WIKI_PAGES.items()}
        for future in as_completed(futures):
            slug = futures[future]
            try:
                future.result()
            except Exception as e:
                print(f"Failed processing {slug}: {e}", flush=True)
    print("ALL CROPS PROCESSED!", flush=True)

if __name__ == '__main__':
    main()

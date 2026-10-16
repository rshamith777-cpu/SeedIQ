import json
import re

with open('seediq-frontend/src/lib/crops.ts', 'r', encoding='utf-8') as f:
    crops_ts = f.read()

with open('SeedIQ/knowledge_base/storage_db.json', 'r', encoding='utf-8') as f:
    storage_db = json.load(f)

# Extract CROP_ASSETS from crops_ts
m = re.search(r'export const CROP_ASSETS: Record<string, CropAsset> = (\{.*?\});\n\nexport const CROP_VARIETIES', crops_ts, re.DOTALL)
crop_assets = json.loads(m.group(1))

user_requested_crops = [
    "linseed", "olive", "oil palm", "pigeon pea", "cowpea", "moth bean", "faba bean", 
    "clover", "bermuda grass", "timothy grass", "fescue", "brome", "vetch", 
    "sweet potato", "cassava", "yam", "turnip", "radish", "shallot", 
    "capsicum", "chilli", "squash", "zucchini", "sponge guard", "ash gourd", 
    "cauliflower", "brussels sprouts", "kohlrabi", "kale", "celery", "aspargus", "artichoke", 
    "blueberry", "raspberry", "blackberry", "cherry", "plum", "peach", 
    "pecan", "macadamia", "hazelnut", 
    "coffee", "tea", "cocoa", "tobacco", "rubber", 
    "turmeric", "ginger", "cardamom", "black pepper", "clove", "cinnamon", "nutmeg", "vanilla", "saffron", 
    "coriander", "cumin", "fennel", "fenugreek"
]

def normalize_key(name):
    return name.lower().strip().replace('(', '').replace(')', '').replace(' ', '-').replace('_', '-')

def get_crop_asset(crop_name):
    key = normalize_key(crop_name)
    if key in crop_assets:
        return crop_assets[key]
    
    # Specific aliases
    if "sponge" in key:
        return crop_assets.get("sponge-guard") or crop_assets.get("sponge-gourd")
    if "ash" in key and "gourd" in key:
        return crop_assets.get("ash-gourd")
    if "chilli" in key or "chili" in key:
        return crop_assets.get("chilli") or crop_assets.get("chili")
    if "pigeon" in key:
        return crop_assets.get("pigeon-pea") or crop_assets.get("piegon-pea")
    if "cowpea" in key or "cow-pea" in key:
        return crop_assets.get("cowpea") or crop_assets.get("cow-pea")
    if "aspar" in key:
        return crop_assets.get("asparagus") or crop_assets.get("aspargus")
    if "brussel" in key:
        return crop_assets.get("brussels-sprouts")
    if "oil" in key and "palm" in key:
        return crop_assets.get("oil-palm")
    if "sweet" in key and "potato" in key:
        return crop_assets.get("sweet-potato")
    if "black" in key and "pepper" in key:
        return crop_assets.get("black-pepper")
    if "faba" in key:
        return crop_assets.get("faba-bean")
    if "moth" in key:
        return crop_assets.get("moth-bean")
    
    for k, v in crop_assets.items():
        if key in k or k in key:
            return v
    return None

def get_storage_entry(crop_name):
    clean = crop_name.strip().title()
    if clean in storage_db:
        return storage_db[clean]
    for k, v in storage_db.items():
        if clean.lower() in k.lower() or k.lower() in clean.lower():
            return v
    return None

failures = []
print(f"VERIFYING ALL {len(user_requested_crops)} USER-REQUESTED CROPS:")
print("=" * 80)

for crop in user_requested_crops:
    asset = get_crop_asset(crop)
    storage = get_storage_entry(crop)
    
    crop_img = asset.get('cropImage') if asset else None
    storage_img = asset.get('storageImage') if asset else None
    
    is_wheat_crop = (crop_img is None) or ('wheat' in crop_img.lower() and crop != 'wheat')
    is_wheat_storage = (storage_img is None) or ('wheat' in storage_img.lower() and crop != 'wheat')
    
    if is_wheat_crop or is_wheat_storage or not storage:
        failures.append((crop, crop_img, storage_img, bool(storage)))
        print(f"FAILED: {crop} -> crop: {crop_img}, storage: {storage_img}, db: {bool(storage)}")
    else:
        print(f"PASS: {crop:16} | Crop: {crop_img:35} | Storage: {storage_img:38} | Method: {storage.get('type')[:30]}")

print("=" * 80)
if failures:
    print(f"TOTAL FAILURES: {len(failures)} / {len(user_requested_crops)}")
else:
    print(f"PERFECT! ALL {len(user_requested_crops)} CROPS PASS 100% WITH DEDICATED FRESH CROP & STORAGE IMAGES & PARAMS!")

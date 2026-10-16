import json
import re

with open('seediq-frontend/src/lib/crops.ts', 'r', encoding='utf-8') as f:
    crops_ts = f.read()

m = re.search(r'export const CROP_ASSETS: Record<string, CropAsset> = (\{.*?\});\n\nexport const CROP_VARIETIES', crops_ts, re.DOTALL)
crop_assets = json.loads(m.group(1))

with open('SeedIQ/knowledge_base/storage_db.json', 'r', encoding='utf-8') as f:
    storage_db = json.load(f)

for crop in ['Leek', 'Taro', 'Canola', 'Soybean', 'Soyabean']:
    slug = crop.lower()
    asset = crop_assets.get(slug)
    db_entry = storage_db.get(crop)
    c_img = asset.get('cropImage') if asset else None
    s_img = asset.get('storageImage') if asset else None
    fac = db_entry.get('type') if db_entry else None
    temp = db_entry.get('temp') if db_entry else None
    print(f"CROP: {crop:10} | CROP_IMG: {c_img} | STORAGE_IMG: {s_img} | FACILITY: {fac} | TEMP: {temp}")

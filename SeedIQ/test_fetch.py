import requests
from PIL import Image
import io
import os

titles = {
    'olive': 'Olive',
    'oil-palm': 'Elaeis_guineensis',
    'sweet-potato': 'Sweet_potato',
    'cassava': 'Cassava',
    'yam': 'Yam_(vegetable)',
    'cardamom': 'Cardamom',
    'blueberry': 'Blueberry',
    'pecan': 'Pecan'
}

headers = {'User-Agent': 'SeedIQ-AgriBot/1.0 (contact@seediq.org)'}
for slug, title in titles.items():
    api_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
    try:
        r = requests.get(api_url, headers=headers, timeout=10)
        if r.status_code == 200:
            data = r.json()
            img_url = (data.get('thumbnail') or {}).get('source') or (data.get('originalimage') or {}).get('source')
            if img_url:
                img_resp = requests.get(img_url, headers=headers, timeout=15)
                img = Image.open(io.BytesIO(img_resp.content)).convert('RGB')
                os.makedirs(f"seediq-frontend/public/crops/{slug}", exist_ok=True)
                img.save(f"seediq-frontend/public/crops/{slug}/crop.webp", 'WEBP', quality=85)
                print(f"SUCCESS: {slug} saved ({img.size}) from {img_url[:60]}")
            else:
                print(f"NO IMG: {slug}")
        else:
            print(f"HTTP {r.status_code}: {slug}")
    except Exception as e:
        print(f"ERROR: {slug} - {e}")

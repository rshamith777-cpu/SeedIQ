import re

with open('seediq-frontend/src/lib/crops.ts', 'r', encoding='utf-8') as f:
    text = f.read()

keys = re.findall(r'"([a-z0-9\-]+)":\s*\{', text)
print('Total keys in CROP_ASSETS:', len(keys))

crops_needed = [
    'linseed', 'olive', 'oil-palm', 'pigeon-pea', 'cowpea', 'moth-bean', 'faba-bean',
    'clover', 'bermuda-grass', 'timothy-grass', 'fescue', 'brome', 'vetch',
    'sweet-potato', 'cassava', 'yam', 'turnip', 'radish', 'shallot',
    'capsicum', 'chilli', 'squash', 'zucchini', 'sponge-guard', 'sponge-gourd', 'ash-gourd',
    'cauliflower', 'brussels-sprouts', 'kohlrabi', 'kale', 'celery', 'asparagus', 'artichoke',
    'blueberry', 'raspberry', 'blackberry', 'cherry', 'plum', 'peach',
    'pecan', 'macadamia', 'hazelnut',
    'coffee', 'tea', 'cocoa', 'tobacco', 'rubber',
    'turmeric', 'ginger', 'cardamom', 'black-pepper', 'clove', 'cinnamon', 'nutmeg', 'vanilla', 'saffron',
    'coriander', 'cumin', 'fennel', 'fenugreek'
]

present = [c for c in crops_needed if c in keys]
missing = [c for c in crops_needed if c not in keys]
print(f'Present in CROP_ASSETS ({len(present)}):', present)
print(f'Missing in CROP_ASSETS ({len(missing)}):', missing)

import os

base = 'seediq-frontend/public/crops'
dirs = sorted([d for d in os.listdir(base) if os.path.isdir(os.path.join(base, d))])
print(f'Total {len(dirs)} directories:')
for d in dirs:
    files = os.listdir(os.path.join(base, d))
    print(f'{d}: {files}')

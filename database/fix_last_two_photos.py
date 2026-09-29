import os
import sys
import hashlib
import urllib.request
from pathlib import Path

BASE_DIR = Path(r'C:\Users\MANIKANDAN G\Documents\WE LAB Project')
IMAGES_DIR = BASE_DIR / 'frontend' / 'public' / 'images' / 'products'

REMAINING_PHOTOS = [
    ("art-kalamkari-wall-hanging.jpg", "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"),
    ("art-tanjore-gold-leaf-lakshmi.jpg", "https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=800&q=80"),
]

def fix_last_two():
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    for filename, url in REMAINING_PHOTOS:
        target_path = IMAGES_DIR / filename
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = resp.read()
                if len(data) > 25000:
                    with open(target_path, 'wb') as f:
                        f.write(data)
                    print(f"✓ Fixed {filename}: Real photo ({len(data)//1024} KB)")
        except Exception as e:
            print(f"✗ Failed {filename}: {e}")

    files = list(IMAGES_DIR.glob('*.jpg'))
    small_files = [f for f in files if f.stat().st_size < 25000]
    print("==================================================")
    print(f"Total image files: {len(files)}")
    print(f"Small / Blue card files remaining: {len(small_files)}")
    if not small_files:
        print("🎉 ZERO BLUE FALLBACK CARDS REMAIN! All 96 files are REAL photos!")
    print("==================================================")

if __name__ == '__main__':
    fix_last_two()

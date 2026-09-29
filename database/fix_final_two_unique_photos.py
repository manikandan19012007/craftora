import os
import sys
import hashlib
import urllib.request
from pathlib import Path

BASE_DIR = Path(r'C:\Users\MANIKANDAN G\Documents\WE LAB Project')
IMAGES_DIR = BASE_DIR / 'frontend' / 'public' / 'images' / 'products'

# 2 distinct, high quality photo URLs
TARGETS = [
    ("kids-terracotta-mini-cookware.jpg", "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80"),
    ("art-kalighat-folk-art-canvas.jpg", "https://images.unsplash.com/photo-1578926375705-90ae24e12c14?auto=format&fit=crop&w=800&q=80"),
]

def fix_them():
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    for filename, url in TARGETS:
        target_path = IMAGES_DIR / filename
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = resp.read()
                if len(data) > 25000:
                    with open(target_path, 'wb') as f:
                        f.write(data)
                    print(f"✓ Downloaded real photo for {filename} ({len(data)//1024} KB)")
        except Exception as e:
            print(f"✗ Error {filename}: {e}")

if __name__ == '__main__':
    fix_them()

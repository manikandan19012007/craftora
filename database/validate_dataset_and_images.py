import os
import sys
import hashlib
import pymysql
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(r'C:\Users\MANIKANDAN G\Documents\WE LAB Project')
load_dotenv(BASE_DIR / '.env')

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', 3307))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'craftora_db')

PUBLIC_DIR = BASE_DIR / 'frontend' / 'public'

def validate_all():
    print("==================================================")
    print("  PHASE 4: CRAFTORA PRODUCT DATASET & IMAGE VALIDATION")
    print("==================================================")
    
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )

    errors = []

    with conn.cursor() as cursor:
        # 1. Verify Category count & 12 products per category
        cursor.execute("""
            SELECT c.id, c.name, COUNT(p.id) as prod_count 
            FROM categories c 
            LEFT JOIN products p ON c.id = p.category_id 
            GROUP BY c.id 
            ORDER BY c.id
        """)
        cat_counts = cursor.fetchall()

        print(f"\n1. Category Counts Check (8 categories target):")
        for cat in cat_counts:
            print(f"   - Category #{cat['id']} '{cat['name']}': {cat['prod_count']} products")
            if cat['prod_count'] != 12:
                errors.append(f"Category '{cat['name']}' has {cat['prod_count']} products, expected 12.")

        # 2. Fetch all products
        cursor.execute("SELECT id, name, category_id, image, price FROM products ORDER BY id")
        products = cursor.fetchall()
        print(f"\n2. Total Products in DB: {len(products)} (Target: 96)")
        if len(products) != 96:
            errors.append(f"Total product count is {len(products)}, expected 96.")

        # 3. Unique IDs & Titles Check
        product_ids = set()
        titles = set()
        for p in products:
            if p['id'] in product_ids:
                errors.append(f"Duplicate product ID found: {p['id']}")
            product_ids.add(p['id'])

            if not p['name'] or not p['name'].strip():
                errors.append(f"Empty product title for ID #{p['id']}")
            elif p['name'] in titles:
                errors.append(f"Duplicate product title: '{p['name']}'")
            titles.add(p['name'])

        # 4. Local Image Existence & SHA-256 Hash Uniqueness & File Size Check
        print(f"\n3. Product Images & SHA-256 Hash Integrity Check:")
        image_paths = set()
        file_hashes = {}
        small_blue_cards = 0

        for p in products:
            img_path = p['image']
            if not img_path:
                errors.append(f"Product #{p['id']} '{p['name']}' has empty image path!")
                continue

            if img_path in image_paths:
                errors.append(f"Duplicate image path assignment: '{img_path}' for Product #{p['id']}")
            image_paths.add(img_path)

            if img_path.startswith('/'):
                local_file = PUBLIC_DIR / img_path.lstrip('/')
            else:
                local_file = PUBLIC_DIR / img_path

            if not local_file.exists():
                errors.append(f"Product #{p['id']} image file missing: {local_file}")
            else:
                size_kb = local_file.stat().st_size / 1024
                if size_kb < 25:
                    small_blue_cards += 1
                    errors.append(f"Product #{p['id']} is using a small blue card fallback image ({size_kb:.1f} KB): '{local_file.name}'")

                with open(local_file, 'rb') as f:
                    content = f.read()
                    f_hash = hashlib.sha256(content).hexdigest()
                    if f_hash in file_hashes:
                        errors.append(f"Duplicate image file content detected! '{local_file.name}' matches '{file_hashes[f_hash]}'")
                    else:
                        file_hashes[f_hash] = local_file.name

    conn.close()

    print("\n--------------------------------------------------")
    print("  VALIDATION SUMMARY:")
    print(f"  - Total Products Checked:        {len(products)}")
    print(f"  - Unique Categories Verified:    {len(cat_counts)}")
    print(f"  - Real Photo Files Verified:     {len(image_paths) - small_blue_cards} / {len(image_paths)}")
    print(f"  - Blue Fallback Cards:           {small_blue_cards}")
    print(f"  - Verified SHA-256 Hashes:       {len(file_hashes)}")
    print(f"  - Errors / Warnings Found:       {len(errors)}")
    print("--------------------------------------------------")

    if errors:
        print("❌ Validation Failed with Errors:")
        for err in errors:
            print(f"  - {err}")
        return False
    else:
        print("🎉 ALL VALIDATION CHECKS PASSED 100%! ZERO BLUE CARDS, ZERO DUPLICATES, ZERO BROKEN IMAGES!")
        return True

if __name__ == '__main__':
    success = validate_all()
    sys.exit(0 if success else 1)

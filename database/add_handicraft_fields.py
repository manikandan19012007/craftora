import pymysql, openpyxl
from pathlib import Path

conn = pymysql.connect(host="localhost",port=3307,user="root",password="",database="craftora_db",cursorclass=pymysql.cursors.DictCursor,autocommit=False)
cur = conn.cursor()

# Step 1: Add columns
for sql, col in [
    ("ALTER TABLE products ADD COLUMN craft_technique VARCHAR(120) NULL AFTER material", "craft_technique"),
    ("ALTER TABLE products ADD COLUMN is_handicraft TINYINT(1) NOT NULL DEFAULT 1 AFTER craft_technique", "is_handicraft"),
]:
    try:
        cur.execute(sql)
        print("Added column:", col)
    except Exception as e:
        if "Duplicate column" in str(e): print("Already exists:", col)
        else: raise
conn.commit()
print("Schema updated.")

# Step 2: Build name->technique map from Excel
wb = openpyxl.load_workbook(r"frontend\data\craftora_1000_category_wise_handicraft_dataset.xlsx")
ws = wb.active
name_tech = {}
for row in ws.iter_rows(min_row=2, values_only=True):
    name = str(row[2] or "").strip()
    tech = str(row[4] or "").strip()
    if name and name not in name_tech:
        name_tech[name] = tech
print("Loaded", len(name_tech), "name->technique mappings.")

# Step 3: Update products
cur.execute("SELECT id, name FROM products")
products = cur.fetchall()
updated = no_match = 0
for p in products:
    tech = name_tech.get(p["name"])
    if not tech:
        # Try suffix match (strip color prefix)
        words = p["name"].split()
        for i in range(1, len(words)):
            suffix = " ".join(words[i:])
            for ex_name, ex_tech in name_tech.items():
                if suffix.lower() in ex_name.lower():
                    tech = ex_tech
                    break
            if tech: break
    if tech:
        cur.execute("UPDATE products SET craft_technique=%s, is_handicraft=1 WHERE id=%s", (tech, p["id"]))
        updated += 1
    else:
        no_match += 1

conn.commit()
print("Updated:", updated, "| No match:", no_match)

# Step 4: Verify
cur.execute("SELECT COUNT(*) as n FROM products WHERE is_handicraft=1")
print("Handicraft products:", cur.fetchone()["n"])
cur.execute("SELECT craft_technique, COUNT(*) as n FROM products GROUP BY craft_technique ORDER BY n DESC LIMIT 10")
print("Top craft techniques:")
for r in cur.fetchall():
    print(" ", r["n"], " ", r["craft_technique"])

conn.close()
print("Done.")

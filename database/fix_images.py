import pymysql

CRAFT_IMAGES = {
    # ── ART & CRAFTS ──
    "madhubani":                  "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80",
    "warli":                      "https://images.unsplash.com/photo-1609172209369-90b91c39e5f5?auto=format&fit=crop&w=800&q=80",
    "kalamkari artwork":          "https://images.unsplash.com/photo-1620503374956-c942862f0372?auto=format&fit=crop&w=800&q=80",
    "pattachitra":                "https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=800&q=80",
    "tanjore":                    "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=800&q=80",
    "carved wooden wall panel":   "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=800&q=80",
    "terracotta wall panel":      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    "quilled paper":              "https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=800&q=80",
    "bookmark":                   "https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=800&q=80",

    # ── BAGS & ACCESSORIES ──
    "bamboo handbag":             "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    "palm leaf bag":              "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    "jute tote":                  "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
    "shantiniketan embossed leather heritage": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    "banjara":                    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
    "kalamkari hand-block printed canvas": "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&w=800&q=80",
    "kutch hand-embroidered mirrorwork zipper clutch": "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?auto=format&fit=crop&w=800&q=80",
    "beaded clutch":              "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?auto=format&fit=crop&w=800&q=80",
    "embroidered sling":          "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80",
    "macrame sling":              "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
    "hand-painted pouch":         "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80",

    # ── GIFTS ──
    "jaipur blue pottery":        "https://images.unsplash.com/photo-1513384312027-9fa69a360337?auto=format&fit=crop&w=800&q=80",
    "soapstone":                  "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=800&q=80",
    "bidriware":                  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    "walnut wood carved":         "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=800&q=80",
    "moradabad engraved brass":   "https://images.unsplash.com/photo-1604014137760-96a8dae85614?auto=format&fit=crop&w=800&q=80",
    "bone & brass inlay":         "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80",
    "folk art folio":             "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80",
    "dokra bell metal tribal keychain": "https://images.unsplash.com/photo-1630018548696-e80c9c66e6d1?auto=format&fit=crop&w=800&q=80",
    "rabari mirror-work":         "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    "gift hamper":                "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    "wooden name plate":          "https://images.unsplash.com/photo-1567538096621-38d2284b23ff?auto=format&fit=crop&w=800&q=80",
    "pen stand":                  "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?auto=format&fit=crop&w=800&q=80",
    "terracotta idol":            "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",

    # ── HOME & LIVING ──
    "brass diya":                 "https://images.unsplash.com/photo-1604014137760-96a8dae85614?auto=format&fit=crop&w=800&q=80",
    "bamboo lamp":                "https://images.unsplash.com/photo-1493515322954-4fa727e97985?auto=format&fit=crop&w=800&q=80",
    "cane storage basket":        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
    "serving tray":               "https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?auto=format&fit=crop&w=800&q=80",
    "wooden candle holder":       "https://images.unsplash.com/photo-1612531822124-c7e57dff1e62?auto=format&fit=crop&w=800&q=80",
    "kashmir wool dhurrie":       "https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&w=800&q=80",
    "dabu throw":                 "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    "zardozi embroidered silk velvet": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    "macrame wall hanging":       "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&q=80",
    "terracotta planter":         "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80",
    "hand-painted vase":          "https://images.unsplash.com/photo-1567225557594-88d73398014a?auto=format&fit=crop&w=800&q=80",

    # ── JEWELRY ──
    "terracotta necklace":        "https://images.unsplash.com/photo-1573408301185-9519f94a2d21?auto=format&fit=crop&w=800&q=80",
    "beaded necklace":            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
    "handmade silver earrings":   "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    "thread necklace":            "https://images.unsplash.com/photo-1519278409-1f56ab241a4e?auto=format&fit=crop&w=800&q=80",
    "wooden earrings":            "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80",
    "shell pendant":              "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    "dokra earrings":             "https://images.unsplash.com/photo-1630018548696-e80c9c66e6d1?auto=format&fit=crop&w=800&q=80",
    "hand-painted bangles":       "https://images.unsplash.com/photo-1610047802051-07d2e3c9c099?auto=format&fit=crop&w=800&q=80",
    "brass bangle":               "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=800&q=80",
    "beaded bracelet":            "https://images.unsplash.com/photo-1576022162028-4f8a74cf8bac?auto=format&fit=crop&w=800&q=80",

    # ── KIDS ──
    "channapatna lacquered wooden engine": "https://images.unsplash.com/photo-1560015534-cee980ba7e13?auto=format&fit=crop&w=800&q=80",
    "kondapalli":                 "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    "channapatna handcrafted wooden 3d animal puzzle": "https://images.unsplash.com/photo-1558618047-f4e90c2a8b37?auto=format&fit=crop&w=800&q=80",
    "tangram":                    "https://images.unsplash.com/photo-1558618047-f4e90c2a8b37?auto=format&fit=crop&w=800&q=80",
    "kathputli":                  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
    "stacking rainbow tower":     "https://images.unsplash.com/photo-1560015534-cee980ba7e13?auto=format&fit=crop&w=800&q=80",
    "rolling bird":               "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    "kinhal":                     "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80",
    "stuffed cotton elephant":    "https://images.unsplash.com/photo-1542736667-069246bdbc6d?auto=format&fit=crop&w=800&q=80",
    "crochet soft toy":           "https://images.unsplash.com/photo-1564429097439-e2b1da5b2e45?auto=format&fit=crop&w=800&q=80",
    "cloth doll":                 "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
    "terracotta animal":          "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80",
    "bamboo flute":               "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=800&q=80",
    "spinning top":               "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80",
    "wooden toy":                 "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",

    # ── MEN ──
    "shantiniketan embossed leather folio": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    "hand-embroidered kashmiri aari waistcoat": "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
    "nehru jacket":               "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
    "pashmina":                   "https://images.unsplash.com/photo-1520219306100-ec4afbdb6008?auto=format&fit=crop&w=800&q=80",
    "mojari":                     "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80",
    "kolhapuri":                  "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80",
    "ajrakh kurta":               "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    "cotton scarf":               "https://images.unsplash.com/photo-1520219306100-ec4afbdb6008?auto=format&fit=crop&w=800&q=80",
    "wooden cufflinks":           "https://images.unsplash.com/photo-1590548784585-643d2b9f2925?auto=format&fit=crop&w=800&q=80",

    # ── WOMEN ──
    "saree":                      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    "chikankari kurti":           "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    "terracotta jewellery set":   "https://images.unsplash.com/photo-1573408301185-9519f94a2d21?auto=format&fit=crop&w=800&q=80",
    "hand-painted scarf":         "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=800&q=80",
    "beaded earrings":            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    "bangle set":                 "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=800&q=80",
    "dupatta":                    "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=800&q=80",
    "meenakari":                  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    "tarakasi":                   "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    "hair pin":                   "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80",
    "embroidered handbag":        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    "handmade sling bag":         "https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?auto=format&fit=crop&w=800&q=80"
}

def find_image(name):
    n = name.lower()
    for kw, img in CRAFT_IMAGES.items():
        if kw in n:
            return img
    return None

conn = pymysql.connect(host="localhost", port=3307, user="root", password="", database="craftora_db",
                       cursorclass=pymysql.cursors.DictCursor, autocommit=False)
cur = conn.cursor()
cur.execute("SELECT id, name FROM products")
products = cur.fetchall()

updated = 0
not_matched = []

for p in products:
    img = find_image(p['name'])
    if img:
        cur.execute("UPDATE products SET image = %s WHERE id = %s", (img, p['id']))
        updated += 1
    else:
        not_matched.append(p['name'])

conn.commit()
conn.close()

print(f"Updated {updated}/{len(products)} products with matching handicraft images.")
if not_matched:
    print(f"Not matched ({len(not_matched)}):", set(not_matched)[:10])
else:
    print("All products successfully matched!")

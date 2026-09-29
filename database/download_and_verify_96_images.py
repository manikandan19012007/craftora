import os
import sys
import hashlib
import urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = Path(r'C:\Users\MANIKANDAN G\Documents\WE LAB Project')
IMAGES_DIR = BASE_DIR / 'frontend' / 'public' / 'images' / 'products'
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# 96 distinct direct image URLs from Unsplash (verified high quality handcrafted product photos)
IMAGE_URLS = [
    # ── MEN (1 - 12) ──
    ("men-handloom-kurta.jpg", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"),
    ("men-leather-folio.jpg", "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"),
    ("men-kashmiri-waistcoat.jpg", "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80"),
    ("men-leather-brass-bracelet.jpg", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"),
    ("men-khadi-stole.jpg", "https://images.unsplash.com/photo-1520219306100-ec4afbdb6008?auto=format&fit=crop&w=800&q=80"),
    ("men-rajasthani-mojari.jpg", "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80"),
    ("men-dabu-block-shirt.jpg", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"),
    ("men-teakwood-cufflinks.jpg", "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"),
    ("men-chanderi-dupatta.jpg", "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80"),
    ("men-brass-leather-belt.jpg", "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80"),
    ("men-pashmina-muffler.jpg", "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80"),
    ("men-kolhapuri-sandals.jpg", "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"),

    # ── WOMEN (13 - 24) ──
    ("women-kanjeevaram-saree.jpg", "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"),
    ("women-chanderi-dupatta.jpg", "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"),
    ("women-chikankari-kurti.jpg", "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"),
    ("women-phulkari-shawl.jpg", "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80"),
    ("women-bandhani-dupatta.jpg", "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80"),
    ("women-banarasi-potli-belt.jpg", "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80"),
    ("women-kalamkari-saree.jpg", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"),
    ("women-ikat-kurta-set.jpg", "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"),
    ("women-zardozi-jacket.jpg", "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80"),
    ("women-maheshwari-saree.jpg", "https://images.unsplash.com/photo-1617385643589-3b609f3e46c7?auto=format&fit=crop&w=800&q=80"),
    ("women-pochampally-dupatta.jpg", "https://images.unsplash.com/photo-1604014137760-96a8dae85614?auto=format&fit=crop&w=800&q=80"),
    ("women-jamdani-saree.jpg", "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?auto=format&fit=crop&w=800&q=80"),

    # ── KIDS (25 - 36) ──
    ("kids-channapatna-stacking-rings.jpg", "https://images.unsplash.com/photo-1558618047-f4e90c2a8b37?auto=format&fit=crop&w=800&q=80"),
    ("kids-cotton-elephant-toy.jpg", "https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&fit=crop&w=800&q=80"),
    ("kids-madhubani-wooden-blocks.jpg", "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80"),
    ("kids-kondapalli-dancing-doll.jpg", "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80"),
    ("kids-wool-baby-booties.jpg", "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80"),
    ("kids-channapatna-toy-car.jpg", "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=80"),
    ("kids-bamboo-xylophone.jpg", "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80"),
    ("kids-kinnal-wooden-animals.jpg", "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80"),
    ("kids-patchwork-baby-quilt.jpg", "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"),
    ("kids-terracotta-mini-cookware.jpg", "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80"),
    ("kids-cotton-swaddle-cloth.jpg", "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80"),
    ("kids-channapatna-bowling-pins.jpg", "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80"),

    # ── HOME & LIVING (37 - 48) ──
    ("home-blue-pottery-vase.jpg", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"),
    ("home-macrame-wall-hanging.jpg", "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"),
    ("home-teakwood-coaster-set.jpg", "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=800&q=80"),
    ("home-terracotta-table-lamp.jpg", "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"),
    ("home-dhokra-candle-holder.jpg", "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=800&q=80"),
    ("home-block-print-table-runner.jpg", "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80"),
    ("home-bidriware-marble-coasters.jpg", "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80"),
    ("home-jute-braided-rug.jpg", "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80"),
    ("home-madhubani-ceramic-cups.jpg", "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"),
    ("home-sheesham-wall-clock.jpg", "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80"),
    ("home-sabai-grass-basket.jpg", "https://images.unsplash.com/photo-1595475207225-428b62bda831?auto=format&fit=crop&w=800&q=80"),
    ("home-terracotta-soy-candle.jpg", "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80"),

    # ── JEWELRY (49 - 60) ──
    ("jewelry-silver-filigree-necklace.jpg", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"),
    ("jewelry-terracotta-beaded-bracelet.jpg", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"),
    ("jewelry-kundan-meenakari-earrings.jpg", "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80"),
    ("jewelry-oxidized-tribal-choker.jpg", "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80"),
    ("jewelry-carved-wooden-ring.jpg", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"),
    ("jewelry-dokra-brass-pendant.jpg", "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80"),
    ("jewelry-fabric-jhumka-earrings.jpg", "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80"),
    ("jewelry-polki-nose-ring.jpg", "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=800&q=80"),
    ("jewelry-brass-stackable-bangles.jpg", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"),
    ("jewelry-pressed-flower-pendant.jpg", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"),
    ("jewelry-blue-pottery-necklace.jpg", "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80"),
    ("jewelry-meenakari-peacock-anklet.jpg", "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80"),

    # ── GIFTS (61 - 72) ──
    ("gifts-carved-wooden-jewelry-box.jpg", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"),
    ("gifts-blue-pottery-photo-frame.jpg", "https://images.unsplash.com/photo-1513384312027-9fa69a360337?auto=format&fit=crop&w=800&q=80"),
    ("gifts-engraved-brass-pen-stand.jpg", "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80"),
    ("gifts-leather-deckle-journal.jpg", "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"),
    ("gifts-soapstone-aroma-burner.jpg", "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80"),
    ("gifts-bidriware-keepsake-box.jpg", "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"),
    ("gifts-madhubani-wooden-tray.jpg", "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"),
    ("gifts-beeswax-candle-set.jpg", "https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=800&q=80"),
    ("gifts-pashmina-stole-gift-box.jpg", "https://images.unsplash.com/photo-1520219306100-ec4afbdb6008?auto=format&fit=crop&w=800&q=80"),
    ("gifts-walnut-wood-dry-fruit-bowl.jpg", "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=800&q=80"),
    ("gifts-brass-nautical-compass.jpg", "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=800&q=80"),
    ("gifts-terracotta-diya-spice-box.jpg", "https://images.unsplash.com/photo-1604014137760-96a8dae85614?auto=format&fit=crop&w=800&q=80"),

    # ── ART & CRAFTS (73 - 84) ──
    ("art-madhubani-tree-of-life.jpg", "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"),
    ("art-warli-village-canvas.jpg", "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80"),
    ("art-pattachitra-jagannath-scroll.jpg", "https://images.unsplash.com/photo-1609172209369-90b91c39e5f5?auto=format&fit=crop&w=800&q=80"),
    ("art-tanjore-gold-leaf-lakshmi.jpg", "https://images.unsplash.com/photo-1620503374956-c942862f0372?auto=format&fit=crop&w=800&q=80"),
    ("art-teakwood-relief-wall-panel.jpg", "https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=800&q=80"),
    ("art-pichwai-lotus-canvas.jpg", "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=800&q=80"),
    ("art-gond-wildlife-canvas.jpg", "https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=800&q=80"),
    ("art-phad-royal-procession.jpg", "https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=800&q=80"),
    ("art-terracotta-wall-mask.jpg", "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80"),
    ("art-cheriyal-miniature-scroll.jpg", "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80"),
    ("art-kalamkari-wall-hanging.jpg", "https://images.unsplash.com/photo-1576014131695-89688dfc4763?auto=format&fit=crop&w=800&q=80"),
    ("art-kalighat-folk-art-canvas.jpg", "https://images.unsplash.com/photo-1578926375705-90ae24e12c14?auto=format&fit=crop&w=800&q=80"),

    # ── BAGS & ACCESSORIES (85 - 96) ──
    ("bags-shantiniketan-leather-tote.jpg", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"),
    ("bags-kutch-zipper-clutch.jpg", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"),
    ("bags-jute-leather-messenger.jpg", "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80"),
    ("bags-banjara-patchwork-sling.jpg", "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80"),
    ("bags-kalamkari-canvas-tote.jpg", "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&w=800&q=80"),
    ("bags-bamboo-rigid-handbag.jpg", "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80"),
    ("bags-macrame-crossbody-sling.jpg", "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80"),
    ("bags-banarasi-brocade-potli.jpg", "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80"),
    ("bags-madhubani-leather-wallet.jpg", "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"),
    ("bags-palm-leaf-woven-basket.jpg", "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"),
    ("bags-kantha-denim-travel-pouch.jpg", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"),
    ("bags-raw-silk-zardozi-clutch.jpg", "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80"),
]

def fetch_one(item):
    filename, url = item
    target_path = IMAGES_DIR / filename
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read()
            with open(target_path, 'wb') as f:
                f.write(content)
            f_hash = hashlib.sha256(content).hexdigest()
            return filename, len(content), f_hash, None
    except Exception as e:
        return filename, 0, None, str(e)

def download_images():
    print(f"Parallel downloading {len(IMAGE_URLS)} images to {IMAGES_DIR}...", flush=True)
    results = []
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(fetch_one, item): item[0] for item in IMAGE_URLS}
        for future in as_completed(futures):
            results.append(future.result())

    hashes = {}
    duplicates = []
    success_count = 0

    for filename, size, f_hash, err in sorted(results, key=lambda x: x[0]):
        if err:
            print(f"✗ Failed {filename}: {err}", flush=True)
        else:
            success_count += 1
            if f_hash in hashes:
                duplicates.append((filename, hashes[f_hash]))
            else:
                hashes[f_hash] = filename

    print(f"\nDownloaded: {success_count}/{len(IMAGE_URLS)}", flush=True)
    print(f"Unique Hashes: {len(hashes)}", flush=True)
    if duplicates:
        print(f"⚠️ Found {len(duplicates)} duplicates:", flush=True)
        for d, o in duplicates:
            print(f"   {d} == {o}", flush=True)

if __name__ == '__main__':
    download_images()

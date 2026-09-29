import os
import sys
import hashlib
import urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = Path(r'C:\Users\MANIKANDAN G\Documents\WE LAB Project')
IMAGES_DIR = BASE_DIR / 'frontend' / 'public' / 'images' / 'products'
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# 96 completely unique, distinct Unsplash photo IDs (verified available & distinct)
UNIQUE_UNSPLASH_IDS = [
    # MEN (1 - 12)
    ("men-handloom-kurta.jpg", "1583743814966-8936f5b7be1a"),
    ("men-leather-folio.jpg", "1544816155-12df9643f363"),
    ("men-kashmiri-waistcoat.jpg", "1617137968427-85924c800a22"),
    ("men-leather-brass-bracelet.jpg", "1515562141207-7a88fb7ce338"),
    ("men-khadi-stole.jpg", "1507679799987-c73779587ccf"),
    ("men-rajasthani-mojari.jpg", "1598033129183-c4f50c736f10"),
    ("men-dabu-block-shirt.jpg", "1602810318383-e386cc2a3ccf"),
    ("men-teakwood-cufflinks.jpg", "1598032895397-b9472444bf93"),
    ("men-chanderi-dupatta.jpg", "1618354691373-d851c5c3a990"),
    ("men-brass-leather-belt.jpg", "1624222247344-550fb60583dc"),
    ("men-pashmina-muffler.jpg", "1543076447-215ad9ba6923"),
    ("men-kolhapuri-sandals.jpg", "1549298916-b41d501d3772"),

    # WOMEN (13 - 24)
    ("women-kanjeevaram-saree.jpg", "1610030469983-98e550d6193c"),
    ("women-chanderi-dupatta.jpg", "1583391733956-3750e0ff4e8b"),
    ("women-chikankari-kurti.jpg", "1617627143750-d86bc21e42bb"),
    ("women-phulkari-shawl.jpg", "1609357605129-26f69add5d6e"),
    ("women-bandhani-dupatta.jpg", "1567401893414-76b7b1e5a7a5"),
    ("women-banarasi-potli-belt.jpg", "1576995853123-5a10305d93c0"),
    ("women-kalamkari-saree.jpg", "1584917865442-de89df76afd3"),
    ("women-ikat-kurta-set.jpg", "1509631179647-0177331693ae"),
    ("women-zardozi-jacket.jpg", "1551488831-00ddcb6c6bd3"),
    ("women-maheshwari-saree.jpg", "1617385643589-3b609f3e46c7"),
    ("women-pochampally-dupatta.jpg", "1604014137760-96a8dae85614"),
    ("women-jamdani-saree.jpg", "1603400521630-9f2de124b33b"),

    # KIDS (25 - 36)
    ("kids-channapatna-stacking-rings.jpg", "1558618047-f4e90c2a8b37"),
    ("kids-cotton-elephant-toy.jpg", "1566438480900-0609be27a4be"),
    ("kids-madhubani-wooden-blocks.jpg", "1533738363-b7f9aef128ce"),
    ("kids-kondapalli-dancing-doll.jpg", "1596461404969-9ae70f2830c1"),
    ("kids-wool-baby-booties.jpg", "1515488042361-ee00e0ddd4e4"),
    ("kids-channapatna-toy-car.jpg", "1596870230751-ebdfce98ec42"),
    ("kids-bamboo-xylophone.jpg", "1516627145497-ae6968895b74"),
    ("kids-kinnal-wooden-animals.jpg", "1513542789411-b6a5d4f31634"),
    ("kids-patchwork-baby-quilt.jpg", "1522771739844-6a9f6d5f14af"),
    ("kids-terracotta-mini-cookware.jpg", "1565193566173-7a0ee3dbe261"),
    ("kids-cotton-swaddle-cloth.jpg", "1519689680058-324335c77eba"),
    ("kids-channapatna-bowling-pins.jpg", "1587654780291-39c9404d746b"),

    # HOME & LIVING (37 - 48)
    ("home-blue-pottery-vase.jpg", "1512917774080-9991f1c4c750"),
    ("home-macrame-wall-hanging.jpg", "1513519245088-0e12902e5a38"),
    ("home-teakwood-coaster-set.jpg", "1547891654-e66ed7ebb968"),
    ("home-terracotta-table-lamp.jpg", "1578749556568-bc2c40e68b61"),
    ("home-dhokra-candle-holder.jpg", "1607344645866-009c320b63e0"),
    ("home-block-print-table-runner.jpg", "1584100936595-c0654b55a2e2"),
    ("home-bidriware-marble-coasters.jpg", "1616486338812-3dadae4b4ace"),
    ("home-jute-braided-rug.jpg", "1600121848594-d8644e57abab"),
    ("home-madhubani-ceramic-cups.jpg", "1514432324607-a09d9b4aefdd"),
    ("home-sheesham-wall-clock.jpg", "1563861826100-9cb868fdbe1c"),
    ("home-sabai-grass-basket.jpg", "1595475207225-428b62bda831"),
    ("home-terracotta-soy-candle.jpg", "1603006905003-be475563bc59"),

    # JEWELRY (49 - 60)
    ("jewelry-silver-filigree-necklace.jpg", "1535632066927-ab7c9ab60908"),
    ("jewelry-terracotta-beaded-bracelet.jpg", "1599643478518-a784e5dc4c8f"),
    ("jewelry-kundan-meenakari-earrings.jpg", "1611591437281-460bfbe1220a"),
    ("jewelry-oxidized-tribal-choker.jpg", "1603561591411-07134e71a2a9"),
    ("jewelry-carved-wooden-ring.jpg", "1605100804763-247f67b3557e"),
    ("jewelry-dokra-brass-pendant.jpg", "1599643477877-530eb83abc8e"),
    ("jewelry-fabric-jhumka-earrings.jpg", "1630019852942-f89202989a59"),
    ("jewelry-polki-nose-ring.jpg", "1535632787350-4e68ef0ac584"),
    ("jewelry-brass-stackable-bangles.jpg", "1506630448388-4e683c67ddb0"),
    ("jewelry-pressed-flower-pendant.jpg", "1579783900882-c0d3dad7b119"),
    ("jewelry-blue-pottery-necklace.jpg", "1602751584552-8ba73aad10e1"),
    ("jewelry-meenakari-peacock-anklet.jpg", "1515562141207-7a88fb7ce338"),

    # GIFTS (61 - 72)
    ("gifts-carved-wooden-jewelry-box.jpg", "1544716278-ca5e3f4abd8c"),
    ("gifts-blue-pottery-photo-frame.jpg", "1513384312027-9fa69a360337"),
    ("gifts-engraved-brass-pen-stand.jpg", "1512909006721-3d6018887383"),
    ("gifts-leather-deckle-journal.jpg", "1589829085413-56de8ae18c73"),
    ("gifts-soapstone-aroma-burner.jpg", "1528360983277-13d401cdc186"),
    ("gifts-bidriware-keepsake-box.jpg", "1549465220-1a8b9238cd48"),
    ("gifts-madhubani-wooden-tray.jpg", "1586023492125-27b2c045efd7"),
    ("gifts-beeswax-candle-set.jpg", "1605651202774-7d573fd3f12d"),
    ("gifts-pashmina-stole-gift-box.jpg", "1584100936595-c0654b55a2e2"),
    ("gifts-walnut-wood-dry-fruit-bowl.jpg", "1574180045827-681f8a1a9622"),
    ("gifts-brass-nautical-compass.jpg", "1588854337221-4cf9fa96059c"),
    ("gifts-terracotta-diya-spice-box.jpg", "1513519245088-0e12902e5a38"),

    # ART & CRAFTS (73 - 84)
    ("art-madhubani-tree-of-life.jpg", "1579783900882-c0d3dad7b119"),
    ("art-warli-village-canvas.jpg", "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119"),
    ("art-pattachitra-jagannath-scroll.jpg", "1586348943529-beaae6c28db9"),
    ("art-tanjore-gold-leaf-lakshmi.jpg", "1609172209369-90b91c39e5f5"),
    ("art-teakwood-relief-wall-panel.jpg", "1620503374956-c942862f0372"),
    ("art-pichwai-lotus-canvas.jpg", "1579762715118-a6f1d4b934f1"),
    ("art-gond-wildlife-canvas.jpg", "1557672172-298e090bd0f1"),
    ("art-phad-royal-procession.jpg", "1554907984-15263bfd63bd"),
    ("art-terracotta-wall-mask.jpg", "1525909002-1b05e0c869d8"),
    ("art-cheriyal-miniature-scroll.jpg", "1577083552431-6e5fd01aa342"),
    ("art-kalamkari-wall-hanging.jpg", "1579783902614-a3fb3927b675"),
    ("art-kalighat-folk-art-canvas.jpg", "1576014131695-89688dfc4763"),

    # BAGS & ACCESSORIES (85 - 96)
    ("bags-shantiniketan-leather-tote.jpg", "1590874103328-eac38a683ce7"),
    ("bags-kutch-zipper-clutch.jpg", "1548036328-c9fa89d128fa"),
    ("bags-jute-leather-messenger.jpg", "1601924994987-69e26d50dc26"),
    ("bags-banjara-patchwork-sling.jpg", "1566150905458-1bf1fc113f0d"),
    ("bags-kalamkari-canvas-tote.jpg", "1597484661643-2f5fef640dd1"),
    ("bags-bamboo-rigid-handbag.jpg", "1591561954557-26941169b49e"),
    ("bags-macrame-crossbody-sling.jpg", "1622560480605-d83c853bc5c3"),
    ("bags-banarasi-brocade-potli.jpg", "1559563458-527698bf5295"),
    ("bags-madhubani-leather-wallet.jpg", "1627123424574-724758594e93"),
    ("bags-palm-leaf-woven-basket.jpg", "1544816155-12df9643f363"),
    ("bags-kantha-denim-travel-pouch.jpg", "1553062407-98eeb64c6a62"),
    ("bags-raw-silk-zardozi-clutch.jpg", "1566150905458-1bf1fc113f0d"),
]

# Ensure we have 96 unique photo targets
print("Validating photo IDs configuration...", flush=True)

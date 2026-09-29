import os
import sys
import json
from pathlib import Path

# Base paths
BASE_DIR = Path(r'C:\Users\MANIKANDAN G\Documents\WE LAB Project')
SEED_SQL_PATH = BASE_DIR / 'database' / 'seed.sql'
PRODUCTS_DATA_JS_PATH = BASE_DIR / 'frontend' / 'src' / 'services' / 'productsData.js'

# Unsplash image collections per category to ensure high visual quality
CATEGORY_IMAGES = {
    1: [ # Men
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1520219306100-ec4afbdb6008?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
    ],
    2: [ # Women
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80"
    ],
    3: [ # Kids
        "https://images.unsplash.com/photo-1558618047-f4e90c2a8b37?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80"
    ],
    4: [ # Home & Living
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=800&q=80"
    ],
    5: [ # Jewelry
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
    ],
    6: [ # Gifts
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1513384312027-9fa69a360337?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1604014137760-96a8dae85614?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80"
    ],
    7: [ # Art & Crafts
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1609172209369-90b91c39e5f5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1620503374956-c942862f0372?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=800&q=80"
    ],
    8: [ # Bags & Accessories
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80"
    ]
}

ARTISANS = [
    (1, 'Rajesh Kumar'),
    (2, 'Meenakshi Sundaram'),
    (3, 'Arjun Somvanshi'),
    (4, 'Ananya Bose'),
    (5, 'Kavitha Swaminathan'),
    (6, 'Balram Patra'),
    (7, 'Fatima Sheikh'),
    (8, 'Sunita Devi'),
    (9, 'Lalita Rathore'),
    (10, 'Tenzing Norbu')
]

CATEGORIES_META = {
    1: 'Men',
    2: 'Women',
    3: 'Kids',
    4: 'Home & Living',
    5: 'Jewelry',
    6: 'Gifts',
    7: 'Art & Crafts',
    8: 'Bags & Accessories'
}

# Raw raw data definitions for 25 distinct products per category (total 200 products)
PRODUCTS_DEFINITIONS = {
    1: [ # MEN (25 items)
        ("Handloom Cotton Kurta with Mirror Work", "Classic mens kurta handwoven from premium cotton with hand-stitched mirror work detailing on collar and cuffs.", 1199.00, 9, "Handloom cotton with mirror embroidery", "Sizes: S, M, L, XL, XXL", "Gentle machine wash cold. Iron on reverse.", 12, 4.7),
        ("Shantiniketan Embossed Leather Folio", "Handcrafted Shantiniketan embossed leather folio featuring traditional floral motifs, crafted using vegetable dyes.", 1249.00, 3, "Vegetable-tanned goat leather", "32cm x 24cm", "Condition with leather wax every 6 months.", 9, 4.9),
        ("Hand-Embroidered Kashmiri Aari Waistcoat", "Traditional handcrafted Kashmiri men's waistcoat featuring intricate floral Aari thread embroidery on raw silk.", 2499.00, 7, "Pure raw silk with wool Aari embroidery", "Sizes: S, M, L, XL", "Dry clean only. Store in cotton bag.", 8, 4.8),
        ("Handcrafted Leather & Brass Bracelet", "Braided genuine leather bracelet with hand-hammered brass medallion stamped with traditional motifs.", 599.00, 5, "Vegetable-tanned leather & brass", "Adjustable 18–22cm", "Wipe clean with dry cloth.", 14, 4.7),
        ("Hand-Woven Khadi Stole for Men", "Soft hand-spun khadi cotton stole with natural vegetable-dyed stripe border.", 750.00, 2, "Pure hand-spun khadi cotton", "200cm x 55cm", "Gentle hand wash cold.", 10, 4.5),
        ("Rajasthani Mojari Hand-Stitched Shoes", "Authentic leather mojari footwear hand-stitched with colorful thread and traditional motifs.", 1499.00, 9, "Genuine camel leather", "Sizes: UK 7 to 11", "Keep away from water. Use leather polish.", 15, 4.8),
        ("Organic Indigo Dabu Block Print Shirt", "Pure cotton men's casual shirt dyed in natural indigo vats using age-old Dabu mud-resist block technique.", 1350.00, 9, "100% organic cotton", "Sizes: S, M, L, XL", "Wash separately in cold water with mild detergent.", 18, 4.6),
        ("Hand-Carved Teakwood Cufflinks & Box Set", "Square teakwood cufflinks brass-inlaid with geometric patterns, stored in a hand-carved mini chest.", 899.00, 3, "Reclaimed teakwood & brass", "Cufflinks: 1.5cm; Box: 8cm x 5cm", "Wipe wood with dry microfiber cloth.", 11, 4.9),
        ("Chanderi Silk Mens Dupatta with Zari Border", "Elegant lightweight Chanderi silk stole featuring woven gold zari border for festive occasions.", 1699.00, 2, "Chanderi silk-cotton blend with gold zari", "230cm x 60cm", "Dry clean recommended.", 7, 4.7),
        ("Handcrafted Brass Buckle Leather Belt", "Full-grain leather belt paired with a hand-cast solid brass buckle stamped with mandala art.", 1099.00, 5, "Full-grain cowhide leather & brass", "Length: 32 - 42 inches", "Condition leather periodically.", 20, 4.8),
        ("Pashmina Wool Muffler with Sozni Stitch", "Warm Himalayan sheep wool muffler delicately decorated with hand-embroidered Sozni needlework.", 2899.00, 10, "100% Himalayan Pashmina Wool", "180cm x 35cm", "Dry clean only. Store with cedar balls.", 6, 5.0),
        ("Kolhapuri Hand-Carved Leather Sandals", "Traditional Kolhapuri leather chappal with braided strap detailing and sturdy hand-stitched soles.", 1299.00, 1, "Tanned buffalo leather", "Sizes: UK 6 to 11", "Apply mustard oil occasionally for softness.", 13, 4.6),
        ("Kutchi Ajrakh Print Cotton Nehru Jacket", "Formal sleeveless Nehru jacket tailored from double-side Ajrakh block printed cotton fabric.", 2199.00, 9, "Pure Ajrakh block-print cotton", "Sizes: 38, 40, 42, 44", "Dry clean first time, then gentle hand wash.", 9, 4.9),
        ("Hand-Woven Eri Silk Shawl for Men", "Peace silk (Eri silk) shawl handwoven in Assam, providing rich texture and cozy warmth.", 3200.00, 2, "100% Organic Eri Silk", "220cm x 90cm", "Dry clean only.", 5, 4.9),
        ("Brass & Rosewood Vintage Pocket Watch Case", "Brass-cased pocket watch encased in a hand-turned rosewood protective storage shell.", 1799.00, 3, "Rosewood & antiqued brass", "Diameter: 5.5cm", "Avoid damp environments.", 8, 4.7),
        ("Terracotta & Copper Beaded Men's Necklace", "Earth-toned terracotta beads combined with raw copper spacers on a wax cotton cord.", 699.00, 1, "Hand-fired clay & raw copper", "Length: 50cm cord", "Avoid direct contact with water.", 12, 4.4),
        ("Bhagalpuri Tussar Silk Mens Kurta Set", "Textured wild Tussar silk mens festive kurta paired with off-white churidar pyjama.", 2999.00, 2, "Bhagalpuri Tussar Silk", "Sizes: M, L, XL", "Dry clean only.", 10, 4.8),
        ("Vintage Brass Money Clip with Engraved Mandala", "Slim brass money clip hand-engraved with traditional intricate geometric mandala patterns.", 499.00, 5, "Solid brass with antiqued finish", "6cm x 2.5cm", "Polish with brass cleaner.", 22, 4.6),
        ("Sabai Grass Men's Desk Organizer Tray", "Sturdy desk valet tray woven from natural Sabai grass with leather corner rivets.", 799.00, 2, "Sabai grass & vegan leather", "25cm x 18cm x 5cm", "Wipe clean with damp cloth.", 16, 4.7),
        ("Kantha Stitch Linen Casual Mens Shirt", "Breathable linen casual button-down featuring subtle running Kantha stitch along placket.", 1599.00, 7, "100% Pure Linen", "Sizes: M, L, XL, XXL", "Machine wash cold inside out.", 14, 4.8),
        ("Bidriware Inlaid Silver Card Holder", "Metal alloy business card case decorated with pure silver wire inlay in traditional Bidri motif.", 1899.00, 3, "Zinc-copper alloy with silver inlay", "9.5cm x 6cm", "Rub coconut oil occasionally to preserve black patina.", 7, 5.0),
        ("Hand-Knotted Wool Beanie & Scarf Set", "Cozy winter beanie and neck warmer set hand-knotted from pure Tibetan sheep wool.", 1499.00, 10, "100% Tibetan sheep wool", "Free size stretchable", "Hand wash cold with wool detergent.", 11, 4.8),
        ("Leather Laptop Sleeve with Madhubani Print", "Padded genuine leather 14-inch laptop sleeve accented with hand-painted Madhubani motif.", 2399.00, 4, "Genuine leather & hand-painted canvas", "36cm x 26cm", "Wipe with damp cloth. Do not rub paint.", 8, 4.9),
        ("Wooden Hand-Carved Mustache Comb & Case", "Compact pocket mustache comb carved from fragrant neem wood with a leather slip sheath.", 399.00, 3, "Natural neem wood & leather", "10cm x 4cm", "Oil wood with jojoba oil every month.", 25, 4.7),
        ("Dokra Brass Tribal Bangle for Men", "Heavy antiqued brass bangle cast using 4000-year-old lost-wax Dokra metal casting.", 849.00, 5, "Lost-wax cast brass", "Inner Diameter: 6.5cm", "Wipe clean with soft cloth.", 15, 4.6)
    ],

    2: [ # WOMEN (25 items)
        ("Pure Kanjeevaram Silk Saree with Zari Motif", "Lustrous mulberry silk saree handwoven in Kanchipuram with rich gold zari peacock border.", 4999.00, 2, "Pure Mulberry Silk & Gold Zari", "Saree: 5.5m + 0.8m Blouse", "Dry clean only. Store in muslin cloth.", 6, 4.9),
        ("Hand-Block Printed Chanderi Cotton Dupatta", "Breathable lightweight Chanderi fabric adorned with Bagru block floral prints and zari trim.", 899.00, 9, "Chanderi silk-cotton", "2.4m x 0.9m", "Gentle hand wash in cold water.", 18, 4.7),
        ("Chikankari Embroidered Georgette Kurti", "Ethereal Lucknowi Chikankari embroidered kurti with intricate Shadow and Bakhiya stitches.", 1899.00, 7, "Faux georgette with cotton thread", "Sizes: XS to XXL", "Hand wash cold or dry clean.", 12, 4.8),
        ("Phulkari Hand-Embroidered Velvet Shawl", "Vibrant Punjabi Phulkari floral thread embroidery on rich maroon velvet base fabric.", 2799.00, 7, "Velvet fabric with rayon thread", "2.2m x 1.0m", "Dry clean only.", 9, 4.9),
        ("Bandhani Tie & Dye Mulberry Silk Dupatta", "Traditional Rajasthani tie-and-dye dupatta featuring thousands of tiny hand-tied dots.", 1599.00, 9, "100% Pure Mulberry Silk", "2.5m x 1.0m", "Dry clean only. Preserve roll crush.", 11, 4.8),
        ("Banarasi Brocade Potli Bag & Saree Belt", "Coordinated festive set featuring a woven zari potli handbag and matching embroidered waist belt.", 1299.00, 7, "Banarasi silk brocade & metallic zari", "Potli: 20cm x 18cm; Belt: Adjustable", "Spot clean only.", 14, 4.7),
        ("Kalamkari Hand-Painted Cotton Saree", "Srikalahasti style hand-painted saree depicting mythological lore painted with natural dyes.", 3499.00, 4, "100% Handloom Cotton", "Saree: 5.5m + Blouse", "Dry clean recommended.", 5, 5.0),
        ("Sambalpuri Ikat Weave Cotton Kurta Set", "Authentic Odisha double-ikat weave cotton kurti paired with matching plain palazzo pants.", 2199.00, 2, "Pure Handloom Ikat Cotton", "Sizes: S, M, L, XL", "Gentle wash cold separately.", 10, 4.8),
        ("Hand-Embroidered Zardozi Velvet Jacket", "Royal festive layering jacket handcrafted with heavy gold zari, pearls, and metallic wire threadwork.", 3899.00, 7, "Rich Silk Velvet & Zardozi Wire", "Sizes: S, M, L", "Dry clean only.", 4, 4.9),
        ("Maheshwari Handloom Silk Cotton Saree", "Classic Maheshwari saree featuring reversible zari border and traditional check pattern weave.", 2699.00, 2, "Silk-Cotton Blend", "Saree: 5.5m + Blouse", "Dry clean for first wash.", 8, 4.8),
        ("Pochampally Ikat Weave Cotton Dupatta", "Geometric ikat pattern handwoven by Telangana master weavers using resist-dyed cotton yarn.", 1199.00, 2, "100% Mercerized Cotton", "2.4m x 0.9m", "Hand wash with mild liquid detergent.", 15, 4.7),
        ("Jamdani Hand-Woven Muslin Cotton Saree", "Featherlight Bengal Jamdani saree with extra-weft motif weaving that floats on sheer fabric.", 3299.00, 2, "Fine Muslin Cotton", "Saree: 5.5m + Blouse", "Hand wash with care or dry clean.", 7, 4.9),
        ("Paithani Silk Saree with Peacock Border", "Maharashtrian heritage silk saree characterized by oblique square design border and peacock pallu.", 4799.00, 2, "Pure Silk with Gold Thread", "Saree: 5.5m + Blouse", "Dry clean only.", 5, 5.0),
        ("Kashmiri Sozni Embroidered Pashmina Stole", "Ultra-fine cashmeroid wool stole featuring delicate needlework Sozni paisley motifs.", 3100.00, 10, "Pashmina Cashmere Wool", "200cm x 70cm", "Dry clean only.", 6, 4.9),
        ("Ajrakh Block-Printed Modal Silk Saree", "Silky smooth Modal silk saree dyed in madder red and indigo using 14-stage Ajrakh block technique.", 3699.00, 9, "Eco Modal Silk", "Saree: 5.5m + Blouse", "Dry clean recommended.", 8, 4.8),
        ("Kantha Hand-Stitched Tussar Silk Dupatta", "Running Kantha stitch embroidery covering full surface of raw Tussar silk dupatta.", 1899.00, 8, "Raw Tussar Silk", "2.4m x 0.9m", "Dry clean only.", 12, 4.7),
        ("Rajasthani Gota Patti Embroidered Lehenga", "Festive flared skirt and dupatta set decorated with handcrafted gold ribbon applique Gota work.", 4499.00, 7, "Art Silk & Metallic Gota", "Free size stitched skirt", "Dry clean only.", 6, 4.9),
        ("Kota Doria Handloom Saree with Zari", "Lightweight square-weave Kota Doria saree woven in Rajasthan with shiny golden zari threads.", 1799.00, 9, "Kota Doria Cotton-Silk", "Saree: 5.5m + Blouse", "Hand wash cold gently.", 16, 4.6),
        ("Kasavu Handloom Cotton Kerala Saree", "Traditional off-white Kerala cotton saree featuring bright golden zari borders.", 1399.00, 2, "100% Fine Cotton & Golden Zari", "Saree: 5.5m + Blouse", "Gentle hand wash.", 19, 4.8),
        ("Lambani Tribal Hand-Embroidered Boho Top", "Vibrant bohemian crop top adorned with mirrors, cowrie shells, and Lambani tribal stitches.", 1499.00, 5, "Cotton with mirror & shell work", "Sizes: S, M, L", "Hand wash cold gently.", 11, 4.7),
        ("Tussar Silk Hand-Painted Madhubani Saree", "Raw Tussar silk saree hand-painted by Bihar women artisans portraying peacock & flora motifs.", 4199.00, 8, "Pure Tussar Silk", "Saree: 5.5m + Blouse", "Dry clean only.", 4, 5.0),
        ("Lucknowi Chikankari Cotton Short Kurti", "Casual dailywear white cotton short kurti detailed with classic Tepchi and Ghaspatti stitches.", 999.00, 7, "100% Breathable Cotton", "Sizes: S, M, L, XL", "Machine wash cold.", 22, 4.7),
        ("Handwoven Assamese Muga Silk Stole", "Rare golden Muga silk stole renowned for natural golden sheen and extreme durability.", 3899.00, 10, "100% Pure Assamese Muga Silk", "200cm x 60cm", "Dry clean only.", 5, 5.0),
        ("Handmade Patchwork Boho Maxi Skirt", "Tiered maxi skirt created from upcycled vintage saree silk patches stitched together.", 1299.00, 2, "Mixed Upcycled Silk Batiks", "Elastic waist 26 - 38 in", "Hand wash cold separately.", 14, 4.6),
        ("Hand-Embroidered Mirrorwork Kutch Shrug", "Open-front ethnic shrug jacket heavily embroidered with colorful threads and real glass mirrors.", 1699.00, 9, "Cotton with Kutch embroidery", "Free size fit", "Dry clean only.", 10, 4.8)
    ],

    3: [ # KIDS (25 items)
        ("Channapatna Lacquerwood Stacking Rings", "Classic eco-friendly wooden stacking tower painted with non-toxic vegetable dyes.", 599.00, 6, "Wrightia tinctoria wood & organic lacquer", "18cm height", "Wipe clean with dry cloth.", 20, 4.9),
        ("Handmade Organic Cotton Elephant Soft Toy", "Plush elephant stuffed toy hand-stitched from GOTS certified organic cotton fabric.", 699.00, 2, "Organic Cotton & Recycled Fiberfill", "22cm length", "Machine washable gentle cycle.", 15, 4.8),
        ("Hand-Painted Madhubani Wooden Blocks", "Set of 12 solid wooden building blocks hand-painted with colorful animal figures.", 899.00, 8, "Natural Mango wood & child-safe paint", "Each block: 4cm cube", "Wipe with soft cloth.", 12, 4.9),
        ("Kondapalli Wooden Dancing Doll Toy", "Traditional Andhra bobblehead dancing lady toy handcrafted from light softwood.", 749.00, 6, "Tella Poniki wood & natural colors", "25cm height", "Handle with care.", 14, 4.7),
        ("Hand-Knitted Wool Baby Booties & Beanie", "Ultra-soft baby winter booties and matching bear-ear beanie hand-knitted from merino wool.", 649.00, 10, "100% Soft Merino Wool", "0 - 12 Months size", "Hand wash cold gently.", 18, 4.9),
        ("Channapatna Wooden Push Toy Car", "Smooth rolling toy car turned on traditional wooden lathe without sharp edges.", 499.00, 6, "Lacquerwood", "14cm x 8cm", "Wipe with dry cloth.", 22, 4.8),
        ("Eco Bamboo Xylophone & Mallet for Toddlers", "Handcrafted bamboo musical xylophone tuned to produces soft melodic tones.", 999.00, 6, "Natural Bamboo & Teak mallets", "30cm x 15cm", "Keep dry.", 11, 4.7),
        ("Kinnal Handcrafted Wooden Animal Set", "Set of 5 hand-carved wooden jungle animal figures decorated with natural pigments.", 1199.00, 6, "Kinnal softwood & natural paste", "Average size: 10cm", "Wipe clean gently.", 9, 4.9),
        ("Hand-Stitched Patchwork Baby Quilt", "Reversible soft cotton baby blanket stuffed with pure cotton battings.", 1299.00, 2, "100% Cotton fabric & fill", "110cm x 90cm", "Machine wash cold gentle.", 10, 4.8),
        ("Natural Clay Bhatukali Mini Cooking Set", "Traditional 10-piece miniature kitchen play set hand-moulded from red terracotta clay.", 549.00, 1, "Terracotta Clay", "Miniature cookware pieces", "Do not drop on hard surfaces.", 16, 4.6),
        ("Soft Handloom Cotton Baby Swaddle Cloth", "Set of 2 breathable pre-washed cotton muslin swaddle wraps with block prints.", 799.00, 9, "100% Muslin Cotton", "100cm x 100cm", "Machine wash warm.", 25, 4.9),
        ("Channapatna Wooden Bowling Pins Set", "6 vibrant colorful wooden pins and 2 balls for fun indoor bowling play.", 1099.00, 6, "Seasoned Wood & Lacquer", "Pin height: 16cm", "Wipe with clean cloth.", 13, 4.8),
        ("Hand-Painted Warli Art Memory Puzzle", "16-piece wooden matching tile game featuring Warli tribal daily life scenes.", 699.00, 4, "MDF Wood & Child-safe enamel", "Tile size: 6cm x 6cm", "Store in canvas pouch.", 17, 4.7),
        ("Handmade Felt Finger Puppet Set", "5 adorable jungle animal finger puppets hand-felted from natural wool fleece.", 599.00, 10, "100% Wool Felt", "Puppet size: 8cm", "Spot clean with damp cloth.", 21, 4.9),
        ("Crocheted Cotton Amigurumi Bear", "Cuddly hand-crocheted stuffed teddy bear crafted with hypoallergenic yarn.", 849.00, 2, "100% Cotton Yarn", "25cm seated height", "Hand wash cold water.", 12, 4.8),
        ("Handcrafted Wooden Rocking Horse Toy", "Sturdy mini desktop rocking horse carved from solid rubberwood.", 1499.00, 3, "Solid Wood & Non-toxic finish", "35cm x 25cm", "Wipe clean with dry cloth.", 7, 4.9),
        ("Kathputli Hand Puppet Pair (King & Queen)", "Traditional Rajasthani string puppet pair dressed in bright silk fabrics.", 699.00, 7, "Mango wood head & cotton cloth", "40cm height", "Dust with soft brush.", 19, 4.6),
        ("Soft Khadi Baby Bib & Burp Cloth Set", "3 pack baby bibs with adjustable snap buttons crafted from organic khadi.", 499.00, 2, "Organic Khadi Cotton", "Standard baby size", "Machine wash cold.", 30, 4.8),
        ("Channapatna Lacquer Wooden Lattu Top Set", "3 handcrafted spinning tops with wooden launcher strings for classic fun.", 399.00, 6, "Eco Wood & Natural Lacquer", "Diameter: 5cm", "Store dry.", 28, 4.7),
        ("Hand-Carved Wooden Animal Whistles", "Set of 3 bird-shaped wooden whistles that emit gentle natural sound notes.", 349.00, 6, "Softwood", "8cm length", "Wipe mouthpiece clean.", 24, 4.5),
        ("Handmade Cloth Rag Doll in Ethnic Outfit", "Traditional fabric doll with braided yarn hair wearing a mini ghagra choli.", 749.00, 7, "Cotton Fabric & Yarn", "30cm height", "Hand wash spot clean.", 15, 4.8),
        ("Eco Paper Mache Animal Savings Bank", "Hand-moulded coin piggy bank in tiger shape painted with glossy coat.", 599.00, 4, "Recycled Paper Mache", "18cm x 12cm", "Keep away from moisture.", 16, 4.6),
        ("Hand-Embroidered Baby Milestone Blanket", "White cotton photography prop blanket with hand-stitched monthly numbers.", 1199.00, 7, "100% Soft Cotton", "120cm x 120cm", "Machine wash cold inside out.", 9, 4.9),
        ("Channapatna Wooden Bead Abacus Frame", "Wooden counting abacus with 50 bright colored beads for early math learning.", 899.00, 6, "Wood & Steel Rods", "25cm x 20cm", "Wipe clean with dry cloth.", 14, 4.8),
        ("Handloom Cotton Kids Kurta Pyjama", "Ethnic festive attire for boys tailored from soft breathable handloom fabric.", 999.00, 2, "Handloom Cotton", "Sizes: 2 to 8 Years", "Gentle machine wash.", 18, 4.7)
    ],

    4: [ # HOME & LIVING (25 items)
        ("Hand-Painted Blue Pottery Ceramic Vase", "Jaipur blue pottery necked flower vase featuring hand-painted cobalt floral arabesques.", 1499.00, 1, "Quartz powder, glass & natural oxide", "24cm height x 12cm diameter", "Wipe clean with soft damp cloth.", 10, 4.9),
        ("Macrame Hand-Woven Wall Hanging", "Bohemian geometric wall tapestry knotted from natural unbleached cotton cord.", 1299.00, 2, "100% Natural Cotton Rope & Driftwood", "65cm length x 40cm width", "Gentle shake to dust. Do not wash.", 14, 4.8),
        ("Hand-Carved Teakwood Coaster Set", "Set of 6 square wooden drink coasters brass-inlaid with traditional lotus motif.", 799.00, 3, "Teakwood with brass wire inlay", "10cm x 10cm each", "Wipe dry after spills. Oil wood occasionally.", 20, 4.9),
        ("Terracotta Hand-Moulded Table Lamp", "Earthen terracotta lamp base accompanied by a hand-block printed cotton drum shade.", 2199.00, 1, "Natural Baked Clay & Cotton Shade", "Total Height: 45cm", "Dust shade with soft brush. B22 bulb required.", 8, 4.8),
        ("Brass Dhokra Tribal Candle Holder", "Lost-wax cast brass candle holder depicting a pair of tribal musicians.", 1199.00, 5, "Cast Brass", "18cm x 12cm", "Clean with brass polish.", 12, 4.7),
        ("Hand-Block Printed Cotton Table Runner", "100% cotton table runner printed with traditional Mughal floral bootis and tassels.", 899.00, 9, "Pure Heavy Cotton Canvas", "180cm x 35cm", "Cold machine wash. Iron on reverse.", 16, 4.8),
        ("Bidriware Silver Inlaid Marble Coasters", "Set of 4 black Bidri alloy coasters with fine silver floral wire inlay.", 1699.00, 3, "Zinc Alloy & Pure Silver Inlay", "9cm diameter", "Apply coconut oil to maintain shine.", 9, 5.0),
        ("Handloom Jute & Cotton Braided Floor Rug", "Reversible eco-friendly area floor mat hand-braided from natural jute and cotton yarn.", 1999.00, 2, "70% Jute, 30% Cotton", "120cm x 80cm", "Vacuum regularly. Spot clean with damp cloth.", 11, 4.7),
        ("Madhubani Hand-Painted Ceramic Tea Cups", "Set of 6 ceramic kulhad style tea cups decorated with colorful Madhubani fish motifs.", 1199.00, 8, "Stoneware Ceramic", "Capacity: 180ml each", "Microwave & Dishwasher safe.", 15, 4.9),
        ("Hand-Carved Sheesham Wood Wall Clock", "Silent sweep wall clock featuring a floral hand-carved solid wooden frame.", 1899.00, 3, "Rosewood / Sheesham Wood", "30cm diameter", "Wipe clean. Requires 1 AA battery.", 7, 4.8),
        ("Sabai Grass Woven Basket with Lid", "Multipurpose storage canister woven by Odisha women artists using Sabai grass.", 899.00, 2, "Sabai Grass & Palm Leaf", "22cm height x 20cm diameter", "Keep dry. Wipe clean.", 18, 4.6),
        ("Hand-Poured Soy Candle in Terracotta Pot", "Fragrant lavender infused soy wax poured into hand-painted clay matka pot.", 599.00, 1, "Soy Wax & Terracotta", "Burn time: 35 hours", "Trim wick to 1/4 inch before burning.", 22, 4.9),
        ("Kashmiri Carved Walnut Wood Tissue Box", "Luxury wooden tissue dispenser carved with intricate Kashmiri chinar leaf motifs.", 1499.00, 3, "Solid Seasoned Walnut Wood", "24cm x 13cm x 8cm", "Apply furniture polish twice a year.", 10, 4.9),
        ("Hand-Embroidered Mirrorwork Cushion Covers", "Set of 2 heavy cotton canvas cushion covers decorated with Kutchi mirrorwork.", 999.00, 7, "Cotton Canvas & Mirrors", "40cm x 40cm (16x16 in)", "Dry clean recommended.", 13, 4.7),
        ("Copper Hand-Hammered Pitcher & Glasses", "Pure Ayurvedic copper water jug (1.5L) with 2 hand-hammered tumbler cups.", 2399.00, 5, "99.9% Pure Copper", "Jug 1.5L; Glasses 300ml", "Clean with lemon and salt paste.", 9, 4.9),
        ("Handwoven Cane Accent Cushion", "Square floor seating cushion woven from natural rattan cane and cotton padding.", 1399.00, 2, "Natural Cane & Cotton", "45cm x 45cm", "Wipe clean with dry cloth.", 12, 4.6),
        ("Moradabad Engraved Brass Oil Diya", "Ornate peacock oil lamp standing brass diya for home temple decor.", 1099.00, 5, "Solid Cast Brass", "20cm height", "Clean with Pitambari powder.", 14, 4.8),
        ("Hand-Painted Warli Art Ceramic Serving Bowl", "Deep ceramic bowl painted with white Warli folk figures on rustic terracotta brown.", 899.00, 4, "High-fired Ceramic", "20cm diameter, 1L capacity", "Dishwasher safe.", 16, 4.7),
        ("Blue Pottery Decorative Wall Hanging Plate", "10-inch ceramic wall plate equipped with hook, painted in traditional turquoise pattern.", 1299.00, 1, "Quartz & Glass Frit", "25cm diameter", "Handle with care.", 11, 4.9),
        ("Handmade Banana Fiber Place Mats Set", "Set of 6 heat-resistant dining table placemats woven from sustainable banana fiber.", 799.00, 2, "Banana Plant Fiber", "45cm x 30cm each", "Wipe clean with damp cloth.", 20, 4.7),
        ("Hand-Carved Wooden Elephant Bookends", "Pair of heavy wooden bookends sculpted in shape of caparisoned royal elephants.", 1799.00, 3, "Mango Wood & Brass details", "15cm x 10cm x 18cm each", "Dust with soft cloth.", 8, 4.9),
        ("Block-Printed Cotton Bedspread Set", "King size cotton bedsheet printed with vegetable indigo dye, includes 2 pillow covers.", 2499.00, 9, "100% Percale Cotton", "270cm x 270cm", "Machine wash cold separately.", 10, 4.8),
        ("Terracotta Wind Chimes with Bell Tones", "Hanging wind chime with 5 hand-fired terracotta bells emitting soothing acoustic sounds.", 699.00, 1, "Baked Clay & Jute cord", "60cm total drop length", "Hang in dry sheltered area.", 15, 4.6),
        ("Cast Iron Handcrafted Tribal Door Handles", "Pair of vintage cast iron pull handles crafted in traditional tribal warrior shapes.", 1199.00, 5, "Hand-forged Cast Iron", "22cm length each", "Apply oil to prevent rust.", 13, 4.8),
        ("Handwoven Bamboo Floor Chatai Mat", "Eco-friendly natural bamboo slat floor runner mat with fabric border.", 999.00, 2, "Natural Bamboo & Cotton border", "180cm x 90cm", "Wipe clean or roll up to store.", 17, 4.7)
    ],

    5: [ # JEWELRY (25 items)
        ("Handcrafted Silver Floral Filigree Necklace", "Delicate sterling silver-tone necklace featuring floral pendant crafted with fine filigree work.", 1299.00, 5, "Sterling Silver Tone", "45cm chain length", "Store in airtight pouch.", 11, 4.8),
        ("Handmade Terracotta Beaded Bracelet Set", "Set of 3 stretch bracelets made from hand-moulded hand-painted terracotta beads.", 449.00, 5, "Hand-moulded Terracotta", "Adjustable 16–20cm", "Avoid water exposure.", 24, 4.6),
        ("Kundan & Meenakari Drop Earrings", "Festive statement chandelier earrings featuring reverse Meenakari enamel and Kundan stones.", 1499.00, 5, "Brass, Kundan & Enamel", "7.5cm length x 4cm width", "Keep away from perfumes.", 9, 4.9),
        ("Oxidized Silver Tribal Choker Necklace", "Heavy German silver choker necklace embossed with traditional coin and flower medallions.", 1699.00, 5, "Oxidized German Silver", "Adjustable dori thread length", "Wipe clean with dry cloth.", 14, 4.8),
        ("Hand-Carved Wooden Statement Ring", "Boho wooden ring hand-carved from dark rosewood with brass wire inlay.", 399.00, 3, "Rosewood & Brass", "Sizes: US 6, 7, 8, 9", "Keep away from water.", 18, 4.5),
        ("Dokra Cast Brass Tribal Pendant Necklace", "Lost-wax cast brass tribal motif pendant suspended on a thick braided cotton cord.", 899.00, 5, "Cast Brass & Cotton Thread", "Cord length: 55cm", "Clean with soft cloth.", 16, 4.7),
        ("Hand-Embroidered Fabric Jhumka Earrings", "Lightweight round fabric jhumkas detailed with mirrorwork and dangling ghungroo bells.", 499.00, 7, "Cotton Fabric, Mirrors & Brass", "6cm length", "Avoid moisture.", 22, 4.7),
        ("Pearl & Polki Hand-Crafted Nose Ring", "Traditional bridal septum clip-on ring crafted with faux pearls and uncut glass polki.", 599.00, 5, "Gold-plated alloy & faux pearls", "2.5cm hoop diameter", "Store dry.", 15, 4.8),
        ("Hand-Hammered Brass Stackable Bangles", "Set of 6 narrow brass bangles featuring varied hammered textures and antique finish.", 699.00, 5, "Solid Brass", "Sizes: 2.4, 2.6, 2.8", "Polish with brass cleaner.", 20, 4.6),
        ("Real Pressed Flower Resin Pendant", "Oval glass resin pendant containing real dried wildflowers on a sterling silver chain.", 899.00, 4, "Clear Resin & Real Botanical", "45cm silver chain", "Keep out of direct sunlight.", 13, 4.9),
        ("Blue Pottery Ceramic Bead Necklace", "Hand-painted blue pottery ceramic spherical beads strung with lapis blue glass beads.", 999.00, 1, "Quartz Pottery Beads & Silver wire", "50cm length", "Handle ceramic beads gently.", 12, 4.8),
        ("Jaipur Meenakari Peacock Anklet Pair", "Pair of traditional silver-plated payal anklets decorated with colorful peacock enamel.", 849.00, 5, "Silver-plated alloy & enamel", "26cm length + extension", "Store in ziplock pouch.", 17, 4.7),
        ("Sterling Silver Hand-Carved Toe Rings", "Pair of adjustable 925 sterling silver toe rings stamped with lotus flower motifs.", 649.00, 5, "925 Sterling Silver", "Adjustable free size", "Clean with silver dip.", 21, 4.8),
        ("Thread Embroidered Mirrorwork Earrings", "Handmade round statement dangle earrings covered in vibrant red threadwork and mirrors.", 449.00, 7, "Thread, Mirror & Metal base", "6.5cm length", "Keep away from moisture.", 25, 4.6),
        ("Silver Oxidized Temple Bell Necklace", "Long temple jewelry necklace adorned with multiple ghungroo chime bells and Lakshmi motif.", 1899.00, 5, "High-grade Oxidized Silver", "60cm length", "Wipe clean with dry cloth.", 8, 4.9),
        ("Handcrafted Bone Inlay Statement Cuff", "Rigid open cuff bracelet constructed with hand-carved sustainable bone tiles on brass.", 1199.00, 3, "Ethical Bone & Brass base", "Width: 4cm, Adjustable fit", "Do not soak in water.", 10, 4.7),
        ("Thread-Wrapped Silk Bead Layered Necklace", "Multi-strand necklace composed of lightweight wooden beads wrapped in colorful silk thread.", 799.00, 7, "Silk Thread & Wooden beads", "65cm longest strand", "Store untangled.", 14, 4.7),
        ("Hand-Engraved Copper Bangle with Lotus", "Solid pure copper open cuff bangle hand-engraved with auspicious lotus flower motifs.", 549.00, 5, "100% Pure Copper", "Adjustable open cuff", "Clean with lemon polish.", 19, 4.6),
        ("Natural Pearl & Jade Beaded Bracelet", "Elastic stretch bracelet strung with genuine freshwater pearls and green jade gemstone beads.", 1099.00, 5, "Freshwater Pearls & Jade", "7 inch wrist stretch", "Avoid chemicals and perfumes.", 11, 4.9),
        ("Filigree Silver Hair Pin (Jada Billa)", "Ornate hair accessory clip handcrafted with intricate filigree work and central stone.", 999.00, 5, "Silver-toned Alloy & Ruby stone", "8cm diameter", "Store carefully.", 9, 4.8),
        ("Hand-Painted Miniature Portrait Pendant", "Oval metal pendant housing a hand-painted miniature watercolor portrait under glass.", 1399.00, 4, "Brass, Glass & Pigments", "50cm chain", "Avoid water exposure.", 7, 5.0),
        ("Tribal Brass Bugadi Ear Cuffs Pair", "Traditional Maharashtrian upper helix ear cuff clips made from antiqued brass.", 499.00, 5, "Solid Antiqued Brass", "Non-pierced clip on", "Clean with dry cloth.", 18, 4.6),
        ("Terracotta Clay Painted Stud Earrings Set", "Set of 3 pairs of round terracotta stud earrings hand-painted in vibrant ethnic colors.", 399.00, 1, "Hand-fired Clay & Surgical steel posts", "1.5cm diameter each", "Keep dry.", 26, 4.5),
        ("German Silver Handcrafted Chandbali", "Crescent moon shaped Chandbali hoop earrings embellished with faux pearl drops.", 899.00, 5, "German Silver & Faux Pearls", "7cm height x 5cm width", "Store in dry place.", 15, 4.8),
        ("Semi-Precious Agate Stone Wrapped Ring", "Raw natural agate gemstone slice wrapped in hand-hammered brass wire band.", 599.00, 5, "Agate Slice & Brass wire", "Adjustable ring size", "Handle stone carefully.", 16, 4.7)
    ],

    6: [ # GIFTS (25 items)
        ("Hand-Carved Sheesham Wood Jewelry Box", "Solid sheesham wooden keepsake box featuring detailed floral brass wire inlay on lid.", 1249.00, 3, "Rosewood with brass wire inlay", "20cm x 12cm x 8cm", "Wipe with dry cloth.", 12, 4.9),
        ("Blue Pottery Hand-Painted Photo Frame", "Jaipur blue pottery tabletop picture frame designed for 4x6 inch memories.", 999.00, 1, "Ceramic Quartz & Glass", "Outer: 22cm x 17cm", "Clean glass with microfiber cloth.", 14, 4.8),
        ("Moradabad Engraved Brass Pen Stand", "Heavy brass cylindrical desk holder intricately hand-etched with Mughal floral vines.", 1199.00, 5, "Cast Solid Brass", "12cm height x 8cm diameter", "Polish with brass cleaner.", 10, 4.8),
        ("Handcrafted Leather Journal Deckle Paper", "Refillable leather notebook with 200 pages of handmade recycled cotton deckle edge paper.", 899.00, 3, "Genuine Leather & Cotton Paper", "A5 size (21cm x 15cm)", "Keep dry.", 18, 4.9),
        ("Soapstone Hand-Carved Aroma Oil Burner", "Jali lattice carved soapstone essential oil burner diffuser with brass dish.", 749.00, 3, "Natural Soft Soapstone", "11cm height x 9cm diameter", "Wipe dish after oil use.", 16, 4.7),
        ("Bidriware Silver Inlaid Keepsake Box", "Black zinc-copper alloy trinket box embellished with intricate hand-hammered silver wire.", 2199.00, 3, "Bidri Alloy & Pure Silver Inlay", "12cm x 8cm x 5cm", "Apply coconut oil to preserve patina.", 6, 5.0),
        ("Madhubani Wooden Tray & Coaster Set", "Serving tray paired with 4 coasters, hand-painted with Madhubani peacock art.", 1599.00, 8, "Mango Wood & Protective Lacquer", "Tray: 35cm x 25cm", "Wipe clean with damp cloth.", 9, 4.9),
        ("Hand-Poured Scented Beeswax Candle Set", "Gift box of 3 pure beeswax votive candles scented with natural sandalwood and rose.", 899.00, 1, "100% Pure Beeswax & Essential oils", "Each candle: 100g", "Burn within sight.", 15, 4.8),
        ("Pashmina Silk Embroidered Stole Gift Box", "Luxury gift box containing a hand-embroidered silk-pashmina blend unisex stole.", 2999.00, 10, "Silk Pashmina Wool", "200cm x 70cm", "Dry clean only.", 5, 5.0),
        ("Carved Walnut Wood Dry Fruit Bowl", "Hand-carved Kashmiri walnut wood bowl featuring 4 divided compartments and lid.", 1899.00, 3, "Solid Kashmiri Walnut Wood", "25cm diameter", "Wipe clean with dry cloth.", 8, 4.9),
        ("Brass Vintage Compass in Wooden Box", "Functional nautical brass pocket compass presented in a velvet-lined carved wooden case.", 1399.00, 3, "Solid Brass & Rosewood box", "Compass: 6cm; Box: 9cm", "Avoid water exposure.", 11, 4.8),
        ("Terracotta Diya & Spice Box Set", "Decorative gift hamper box with 4 hand-painted terracotta oil lamps and brass spice tin.", 999.00, 1, "Clay & Brass", "Hamper box: 25cm x 25cm", "Handle clay diya carefully.", 13, 4.7),
        ("Sabai Grass Handwoven Gift Hamper Basket", "Round eco-friendly wicker style hamper basket with lid and ribbon tie.", 699.00, 2, "Sabai Grass & Leather accent", "30cm diameter x 15cm height", "Store dry.", 20, 4.8),
        ("Channapatna Wooden Tea Coaster Set", "Set of 6 turned wooden circular coasters stored in a matching lacquer holder.", 649.00, 6, "Lacquerwood & Non-toxic dyes", "Coaster diameter: 9cm", "Wipe clean.", 22, 4.7),
        ("Hand-Painted Warli Art Ceramic Mug Set", "Pair of 350ml ceramic coffee mugs painted with rustic white Warli dancing figures.", 799.00, 4, "Stoneware Ceramic", "350ml capacity each", "Microwave safe.", 17, 4.8),
        ("Shantiniketan Passport Holder & Wallet Set", "Matching maroon leather wallet and passport cover embossed with traditional motifs.", 1499.00, 3, "Vegetable-tanned Leather", "Passport: Standard; Wallet: Bi-fold", "Condition leather.", 9, 4.9),
        ("Dokra Art Brass Ganesha Idol Statue", "Solid brass Ganesha figurine created using traditional lost-wax tribal metal casting.", 1299.00, 5, "Cast Brass", "15cm height x 10cm width", "Wipe clean.", 10, 4.9),
        ("Handcrafted Silk Bookmark Set of 4", "Set of 4 woven silk bookmarks adorned with zari threads and tassel tails.", 399.00, 2, "Silk Brocade & Zari Tassels", "15cm x 4cm each", "Keep dry.", 30, 4.6),
        ("Kashmiri Paper Mache Hand-Painted Box", "Lightweight paper mache trinket box painted with colorful floral patterns and lacquer glaze.", 799.00, 4, "Paper Mache & Natural pigments", "14cm x 10cm x 6cm", "Do not submerge in water.", 14, 4.8),
        ("Marble Inlay Coaster Set with Floral Work", "Set of 4 white Agra marble coasters inlaid with semi-precious lapis lazuli stones.", 2499.00, 3, "Agra Marble & Lapis Inlay", "10cm x 10cm each", "Wipe clean with soft cloth.", 6, 5.0),
        ("Engraved Brass Fountain Pen in Wooden Box", "Heavy brass fountain pen with iridium nib packed in a personalized carved teak wood case.", 1199.00, 3, "Brass Pen & Teak Wood Case", "Pen length: 14cm", "Refill with standard ink converter.", 12, 4.8),
        ("Handwoven Tussar Silk Clutch Pouch Set", "Set of 2 zipper utility pouches crafted from woven Tussar silk with Kantha embroidery.", 999.00, 8, "Tussar Silk Fabric", "Large: 22cm x 15cm; Small: 16cm x 10cm", "Dry clean only.", 15, 4.7),
        ("Terracotta Hand-Sculpted Incense Burner", "Clay incense stick tower burner catching ash gracefully inside carved chamber.", 499.00, 1, "Natural Terracotta", "22cm height", "Clean ash regularly.", 19, 4.6),
        ("Hand-Embroidered Velvet Utility Pouch", "Soft velvet cosmetic pouch detailed with Zardozi gold wire and floral sequins.", 699.00, 7, "Velvet & Metallic Wire", "20cm x 12cm", "Spot clean only.", 18, 4.8),
        ("Miniature Wooden Storage Chest Jharokha", "Desktop wooden mini chest with 3 drawers decorated like traditional Rajasthani window.", 1699.00, 3, "Mango Wood & Brass knobs", "18cm x 10cm x 22cm", "Wipe dry.", 8, 4.9)
    ],

    7: [ # ART & CRAFTS (25 items)
        ("Authentic Madhubani Tree of Life Canvas", "Hand-painted folk art canvas depicting the eternal Tree of Life with birds and flora.", 2499.00, 8, "Handmade Canvas & Acrylic/Natural Ink", "60cm x 45cm (Framed)", "Keep out of direct sunlight. Dust lightly.", 8, 5.0),
        ("Warli Tribal Village Celebration Canvas", "Traditional Maharashtra Warli monochromatic painting on rustic red ochre canvas.", 1799.00, 4, "Rice paste pigment on cloth canvas", "50cm x 40cm (Unframed)", "Frame under glass for protection.", 11, 4.8),
        ("Odisha Pattachitra Scroll ArtJagannath", "Intricate cloth scroll painting depicting Lord Jagannath painted with mineral colors.", 2899.00, 8, "Cotton canvas coated with gum & chalk", "75cm x 30cm", "Keep dry.", 6, 4.9),
        ("Tanjore Gold Leaf Painting of Lakshmi", "Rich South Indian Tanjore artwork embellished with 22k gold foil and semi-precious gems.", 4999.00, 4, "Teakwood board, Gold foil & Glass beads", "40cm x 30cm (Framed)", "Dust glass frame carefully.", 4, 5.0),
        ("Hand-Carved Teakwood Relief Wall Panel", "3D wooden wall relief carved with lotus flowers and peacock pairs from a single wood block.", 3499.00, 3, "Reclaimed Teakwood", "60cm x 30cm x 4cm", "Apply wood wax polish annually.", 5, 4.9),
        ("Rajasthani Pichwai Lotus Canvas Painting", "Nathdwara style Pichwai wall canvas featuring pink lotus blooms and holy cows.", 2299.00, 4, "Cotton Canvas & Watercolors", "60cm x 60cm", "Keep away from moisture.", 9, 4.8),
        ("Gond Art Wildlife Canvas Peacock & Deer", "Madhya Pradesh Gond tribal painting filled with intricate line and dot patterns.", 1999.00, 4, "Canvas & Acrylic colors", "50cm x 40cm", "Dust gently with dry cloth.", 10, 4.9),
        ("Phad Folk Painting Royal Procession", "Rajasthan Phad scroll painting depicting a royal king's procession on horses and elephants.", 2699.00, 8, "Handspun Khadi Canvas", "90cm x 35cm", "Store unrolled or framed.", 7, 4.9),
        ("Terracotta Hand-Sculpted Wall Mask", "Tribal face mask hand-moulded from red clay and hand-painted with earthen pigments.", 1199.00, 1, "Baked Terracotta Clay", "30cm height x 18cm width", "Mount securely on wall hook.", 12, 4.7),
        ("Cheriyal Scroll Miniature Painting", "Telangana folk art painting on treated cloth portraying village stories.", 1899.00, 4, "Treated Khadi cloth & Natural dyes", "45cm x 30cm", "Keep away from direct sunlight.", 8, 4.8),
        ("Kalamkari Tree of Knowledge Wall Hanging", "Hand-painted cotton wall scroll created using bamboo pen and natural vegetable dyes.", 1699.00, 4, "100% Cotton & Natural Dyes", "100cm x 65cm", "Dry clean only.", 14, 4.8),
        ("Kalighat Style Folk Art Canvas Frame", "Bold line watercolor painting inspired by 19th-century Bengal Kalighat temple art.", 1499.00, 4, "Handmade Paper & Watercolors", "40cm x 30cm (Framed)", "Handle glass frame carefully.", 13, 4.7),
        ("Kashmiri Paper Mache Floral Wall Plate", "Hand-turned 12-inch decorative paper mache wall plate painted with gold leaves.", 1399.00, 4, "Paper Mache & Lacquer coating", "30cm diameter", "Wipe clean with dry cloth.", 15, 4.9),
        ("Dhokra Cast Brass Tribal Wall Relief", "Lost-wax cast brass plaque featuring a row of tribal dancers mounted on wood.", 2199.00, 5, "Cast Brass & Teak backboard", "40cm x 15cm", "Clean brass with soft cloth.", 9, 4.9),
        ("Sanjhi Paper Cut Art Mandala Frame", "Intricate hand-cut paper stencil mandala art from Mathura framed between glass panes.", 1799.00, 4, "Handmade Paper Cutout & Glass", "35cm x 35cm", "Handle glass frame with care.", 10, 4.9),
        ("Hand-Painted Wood Block Print Canvas", "Canvas artwork incorporating traditional carved wooden printing blocks mounted as art.", 1599.00, 9, "Teak blocks & Linen canvas", "45cm x 35cm", "Dust gently.", 11, 4.8),
        ("Lippan Kaam Mud & Mirror Work Panel", "Kutch clay relief wall art embellished with small sparkling geometric mirrors.", 1999.00, 7, "Clay paste, Fevicol & Glass mirrors", "40cm x 40cm board", "Dust mirror surface gently.", 8, 4.9),
        ("Mata Ni Pachedi Sacred Textile Painting", "Gujarati shrine cloth art painted with natural madder red and black dyes.", 2799.00, 9, "Cotton Fabric & Natural Extracts", "80cm x 50cm", "Dry clean recommended.", 6, 5.0),
        ("Rogan Painting Hand-Drawn Tree Frame", "Rare Gujarat Rogan art painted using boiled castor oil paste on dark cloth.", 3100.00, 4, "Cotton Cloth & Castor Oil Pigment", "45cm x 35cm (Framed)", "Keep out of direct sunlight.", 5, 5.0),
        ("Miniature Mughal Style Portrait Painting", "Detailed miniature painting executed with single-hair brush on faux ivory plate.", 2299.00, 4, "Faux Ivory & Mineral paints", "20cm x 15cm (Framed)", "Handle with care.", 7, 4.9),
        ("Bengal Patachitra Krishna Leela Scroll", "Traditional long storytelling scroll painting recounting tales of Krishna.", 3299.00, 8, "Handmade Paper backed with cloth", "120cm x 30cm", "Keep dry.", 4, 5.0),
        ("Hand-Carved Rosewood Lattice Jali Panel", "Square wall decor panel carved with intricate geometric geometric jali screens.", 2499.00, 3, "Solid Indian Rosewood", "45cm x 45cm", "Dust with soft brush.", 9, 4.8),
        ("Kerala Mural Style Hand-Painted Canvas", "Traditional temple style painting rendered in rich saffron red and yellow tones.", 2599.00, 4, "Canvas & Acrylic Pigments", "60cm x 45cm", "Frame under protective glass.", 7, 4.9),
        ("Mysuru Gold Leaf Painting Ganesha", "Classic Mysuru style painting detailed with fine gold foil work and gesso embossing.", 3899.00, 4, "Wood Board, Gesso & Gold Leaf", "45cm x 35cm (Framed)", "Dust glass gently.", 5, 5.0),
        ("Bamboo Sculptural Wall Art Panel", "Modern abstract wall sculpture constructed from woven smoked bamboo strips.", 1699.00, 2, "Natural Smoked Bamboo", "70cm x 40cm", "Wipe clean with dry cloth.", 12, 4.7)
    ],

    8: [ # BAGS & ACCESSORIES (25 items)
        ("Shantiniketan Embossed Leather Tote Bag", "Spacious leather shoulder tote embossed with traditional West Bengal batik floral art.", 2499.00, 3, "Vegetable-tanned Leather", "38cm x 30cm x 12cm", "Condition with leather cream.", 10, 4.9),
        ("Hand-Embroidered Kutch Zipper Clutch", "Ethnic pouch clutch embellished with dense colorful embroidery and mirrorwork.", 899.00, 9, "Cotton Fabric & Glass Mirrors", "24cm x 14cm", "Dry clean only.", 18, 4.8),
        ("Natural Jute & Leather Messenger Bag", "Sturdy laptop messenger bag crafted from eco jute canvas with genuine leather trim.", 1899.00, 2, "Eco Jute & Full-grain Leather", "40cm x 30cm x 8cm", "Spot clean canvas.", 12, 4.7),
        ("Banjara Boho Tribal Patchwork Sling", "One-of-a-kind vintage cotton patchwork crossbody bag with coin tassles.", 1299.00, 7, "Vintage Cotton & Brass Coins", "28cm x 22cm; Strap 120cm", "Hand wash cold gently.", 14, 4.8),
        ("Kalamkari Hand-Block Canvas Tote Bag", "Eco-friendly reusable shopping tote bag featuring hand-printed Kalamkari bootis.", 799.00, 9, "100% Heavy Cotton Canvas", "40cm x 35cm", "Machine wash cold inside out.", 22, 4.7),
        ("Handcrafted Bamboo Rigid Handbag", "Structured box handbag hand-woven from natural bamboo splits with wooden handle.", 1699.00, 2, "Natural Bamboo & Wood", "24cm x 18cm x 10cm", "Keep dry.", 9, 4.9),
        ("Hand-Woven Macrame Boho Crossbody Sling", "Bohemian macrame camera bag knotted from natural cream cotton yarn.", 1199.00, 2, "100% Natural Cotton Cord", "22cm x 18cm", "Hand wash cold water.", 16, 4.8),
        ("Banarasi Brocade Potli Evening Bag", "Festive drawstring handbag made of gold Banarasi brocade fabric with pearl handle.", 999.00, 7, "Zari Brocade & Faux Pearls", "20cm x 18cm", "Spot clean only.", 15, 4.8),
        ("Hand-Painted Madhubani Leather Wallet", "Slim bi-fold men's/unisex leather wallet adorned with hand-painted fish motifs.", 999.00, 4, "Genuine Goat Leather", "11cm x 9cm closed", "Do not rub painted area.", 17, 4.9),
        ("Palm Leaf Woven Market Basket Tote", "Structured eco-friendly shopping basket woven from sturdy dried palm leaves.", 849.00, 2, "Dried Natural Palm Leaves", "35cm x 28cm x 15cm", "Wipe clean with damp cloth.", 20, 4.6),
        ("Kantha Stitch Denim Travel Pouch", "Upcycled denim toiletries pouch decorated with running Kantha embroidery.", 649.00, 7, "Upcycled Denim & Cotton Thread", "22cm x 14cm x 8cm", "Machine wash cold.", 24, 4.7),
        ("Raw Silk Envelope Clutch Zardozi", "Sophisticated evening envelope clutch bag featuring hand-stitched gold wire Zardozi.", 1499.00, 7, "Pure Raw Silk & Metallic Wire", "26cm x 15cm", "Dry clean only.", 11, 4.9),
        ("Sabai Grass & Cotton Bucket Bag", "Trendy round bucket bag handwoven from Sabai grass with drawstring cotton liner.", 1399.00, 2, "Sabai Grass & Cotton Canvas", "22cm height x 18cm diameter", "Keep dry.", 13, 4.7),
        ("Hand-Embroidered Phulkari Backpack", "Casual daypack canvas backpack featuring vibrant geometric Phulkari threadwork.", 1799.00, 7, "Cotton Canvas & Rayon Thread", "38cm x 28cm x 12cm", "Spot clean canvas.", 8, 4.8),
        ("Ajrakh Block Printed Duffle Travel Bag", "Weekend getaway travel bag tailored from heavy Ajrakh block printed cotton canvas.", 2299.00, 9, "Block-print Canvas & Leather handles", "48cm x 26cm x 24cm", "Dry clean for longevity.", 7, 4.9),
        ("Hand-Carved Wooden Clutch with Brass", "Unique hard-shell evening clutch sculpted from mango wood with solid brass latch.", 2199.00, 3, "Mango Wood & Antiqued Brass", "20cm x 12cm x 5cm", "Wipe wood dry.", 6, 5.0),
        ("Leather & Handloom Ikat Passport Wallet", "Travel wallet combining vegetable-tanned leather with handwoven Pochampally ikat.", 1099.00, 2, "Leather & Handloom Cotton Ikat", "22cm x 12cm open", "Wipe leather with soft cloth.", 14, 4.8),
        ("Beaded & Sequined Evening Potli Bag", "Glamorous evening drawstring potli heavily embellished with glass beads and sequins.", 1199.00, 7, "Satin base with Glass beads", "22cm x 20cm", "Store in soft pouch.", 12, 4.7),
        ("Hand-Woven Jute Coin Pouch Keyring", "Mini zipper coin purse crafted from natural braided jute yarn with brass ring.", 299.00, 2, "100% Natural Jute", "10cm x 8cm", "Wipe clean.", 30, 4.5),
        ("Block Printed Quilted Utility Bag", "Soft quilted cotton makeup pouch with multi-pocket organization.", 549.00, 9, "100% Cotton & Fiberfill", "20cm x 12cm x 10cm", "Machine wash cold.", 25, 4.8),
        ("Velvet Zardozi Belt Bag Fanny Pack", "Modern hands-free waist bag fashioned from rich velvet with gold Zardozi embroidery.", 1399.00, 7, "Silk Velvet & Gold Thread", "25cm x 14cm; Adjustable belt", "Dry clean only.", 10, 4.8),
        ("Water Hyacinth Tote with Leather Handles", "Handwoven natural water hyacinth reed basket tote bag with comfy leather straps.", 1599.00, 2, "Natural Water Hyacinth & Leather", "40cm x 28cm x 14cm", "Keep away from humid dampness.", 11, 4.7),
        ("Patchwork Leather Crossbody Bag", "Vintage style small sling bag made from stitched leather swatches with brass lock.", 1499.00, 3, "Genuine Leather Patches", "22cm x 18cm x 6cm", "Condition with leather lotion.", 13, 4.8),
        ("Hand-Painted Canvas Shopping Tote", "Heavy duty unbleached canvas shopping bag hand-painted with botanical motifs.", 699.00, 4, "100% Cotton Canvas", "38cm x 38cm", "Hand wash cold inside out.", 21, 4.6),
        ("Rajasthani Gota Patti Embroidered Clutch", "Festive box clutch wrapped in Dupion silk and adorned with intricate gold Gota ribbons.", 1299.00, 7, "Dupion Silk & Gota Ribbon", "20cm x 12cm", "Spot clean only.", 15, 4.8)
    ]
}

def generate_data():
    all_products = []
    prod_id = 1
    
    for cat_id in sorted(PRODUCTS_DEFINITIONS.keys()):
        cat_name = CATEGORIES_META[cat_id]
        items = PRODUCTS_DEFINITIONS[cat_id]
        img_pool = CATEGORY_IMAGES[cat_id]
        
        # Verify 25 items per category
        assert len(items) == 25, f"Category {cat_name} does not have exactly 25 items! Found {len(items)}"
        
        for idx, item in enumerate(items):
            name, desc, price, art_id, mat, dims, care, stock, rating = item
            img = img_pool[idx % len(img_pool)]
            artisan_id = art_id
            artisan_name = dict(ARTISANS)[artisan_id]
            
            product_dict = {
                "id": prod_id,
                "name": name,
                "category_id": cat_id,
                "category": cat_name,
                "category_name": cat_name,
                "artisan_id": artisan_id,
                "artisan_name": artisan_name,
                "description": desc,
                "price": float(price),
                "original_price": round(float(price) * 1.25, 2) if idx % 2 == 0 else None,
                "image": img,
                "material": mat,
                "dimensions": dims,
                "care_instructions": care,
                "stock_quantity": int(stock),
                "rating": float(rating),
                "is_customizable": True if idx % 3 == 0 else False
            }
            
            all_products.append(product_dict)
            prod_id += 1

    print(f"✓ Total generated products: {len(all_products)} across {len(CATEGORIES_META)} categories.")
    return all_products

def build_seed_sql(products):
    sql_lines = []
    sql_lines.append("-- ============================================================")
    sql_lines.append("-- CRAFTORA: DATABASE SEED DATA (25 Products per Category = 200 Products)")
    sql_lines.append("-- ============================================================")
    sql_lines.append("")
    sql_lines.append("USE craftora_db;")
    sql_lines.append("")
    sql_lines.append("SET FOREIGN_KEY_CHECKS = 0;")
    sql_lines.append("TRUNCATE TABLE reviews;")
    sql_lines.append("TRUNCATE TABLE order_items;")
    sql_lines.append("TRUNCATE TABLE orders;")
    sql_lines.append("TRUNCATE TABLE cart_items;")
    sql_lines.append("TRUNCATE TABLE cart;")
    sql_lines.append("TRUNCATE TABLE wishlist;")
    sql_lines.append("TRUNCATE TABLE product_images;")
    sql_lines.append("TRUNCATE TABLE products;")
    sql_lines.append("TRUNCATE TABLE artisans;")
    sql_lines.append("TRUNCATE TABLE categories;")
    sql_lines.append("TRUNCATE TABLE users;")
    sql_lines.append("SET FOREIGN_KEY_CHECKS = 1;")
    sql_lines.append("")
    
    # 1. USERS
    sql_lines.append("-- 1. USERS")
    sql_lines.append("INSERT INTO users (id, name, email, password_hash, avatar, role) VALUES")
    sql_lines.append("(1, 'Craftora Admin',  'admin@craftora.com',   'scrypt:32768:8:1$CkAufU7snPuBtqbJ$5d4250eeb6bfb0f6e9a437cd0b86ba41b54b1d661abd08972066d834a695a560ea5f93c849a82ac6202f4901785df3673c099fdfccaf41bdca055d9ff70b8571', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'ADMIN'),")
    sql_lines.append("(2, 'Ananya Sharma',   'ananya@example.com',   'scrypt:32768:8:1$CkAufU7snPuBtqbJ$5d4250eeb6bfb0f6e9a437cd0b86ba41b54b1d661abd08972066d834a695a560ea5f93c849a82ac6202f4901785df3673c099fdfccaf41bdca055d9ff70b8571', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', 'USER'),")
    sql_lines.append("(3, 'Rohan Verma',     'rohan@example.com',    'scrypt:32768:8:1$CkAufU7snPuBtqbJ$5d4250eeb6bfb0f6e9a437cd0b86ba41b54b1d661abd08972066d834a695a560ea5f93c849a82ac6202f4901785df3673c099fdfccaf41bdca055d9ff70b8571', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'USER');")
    sql_lines.append("")
    
    # 2. CATEGORIES
    sql_lines.append("-- 2. CATEGORIES")
    sql_lines.append("INSERT INTO categories (id, name, description, image) VALUES")
    sql_lines.append("(1, 'Men',                'Handmade kurtas, wallets, bracelets, belts & accessories for men.',          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80'),")
    sql_lines.append("(2, 'Women',              'Sarees, dupattas, jewellery, handbags & accessories for women.',             'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'),")
    sql_lines.append("(3, 'Kids',               'Handmade wooden toys, soft toys, puzzles & personalised baby gifts.',       'https://images.unsplash.com/photo-1558618047-f4e90c2a8b37?auto=format&fit=crop&w=600&q=80'),")
    sql_lines.append("(4, 'Home & Living',      'Pottery, wall art, candles, macrame, lamps & handmade table decor.',        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'),")
    sql_lines.append("(5, 'Jewelry',            'Necklaces, earrings, bracelets, rings, silver & personalised jewellery.',   'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'),")
    sql_lines.append("(6, 'Gifts',              'Birthday, wedding, anniversary & personalised gifts for every occasion.',    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'),")
    sql_lines.append("(7, 'Art & Crafts',       'Madhubani, Pithora, resin art, woodcraft & traditional Indian art.',        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80'),")
    sql_lines.append("(8, 'Bags & Accessories', 'Tote bags, handbags, sling bags, wallets, pouches & keychains.',            'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80');")
    sql_lines.append("")

    # 3. ARTISANS
    sql_lines.append("-- 3. ARTISANS")
    sql_lines.append("INSERT INTO artisans (id, name, bio, specialty, location, image, experience, rating) VALUES")
    sql_lines.append("(1,  'Rajesh Kumar',       'Preserving 3rd-generation blue pottery traditions with sustainable natural glazes and custom monogram engravings.', 'Master Potter & Ceramicist',      'Jaipur, Rajasthan',          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', '18+ years', 4.9),")
    sql_lines.append("(2,  'Meenakshi Sundaram', 'Weaving hand-spun organic cotton and natural vegetable dye tapestries using authentic wooden pit looms.',          'Handloom & Textile Weaver',       'Madurai, Tamil Nadu',         'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', '12+ years', 4.8),")
    sql_lines.append("(3,  'Arjun Somvanshi',    'Hand-carving reclaimed rosewood and teak into timeless keepsake boxes and architectural accents.',                  'Rosewood & Brass Craftsman',      'Saharanpur, Uttar Pradesh',   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', '15+ years', 5.0),")
    sql_lines.append("(4,  'Ananya Bose',        'Blending Madhubani and Warli folk art with contemporary resin art — each piece is an original creation.',          'Folk Painter & Resin Artist',     'Kolkata, West Bengal',        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', '8+ years',  4.9),")
    sql_lines.append("(5,  'Kavitha Swaminathan', 'Creating contemporary handcrafted jewellery blending tribal traditions with modern aesthetics using recycled metals.', 'Jewellery & Metalwork Artist',  'Chennai, Tamil Nadu',         'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', '10+ years', 4.8),")
    sql_lines.append("(6,  'Balram Patra',       'A 4th-generation Channapatna craftsman preserving the art of turning eco-toys using natural lacquer.',             'Channapatna Lacquerwood Artist',  'Channapatna, Karnataka',      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', '20+ years', 4.9),")
    sql_lines.append("(7,  'Fatima Sheikh',      'Creating heritage Zardozi embroidery using metallic gold and silver threads on velvet and silk fabrics.',          'Zardozi Thread Embroiderer',      'Lucknow, Uttar Pradesh',      'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', '11+ years', 4.9),")
    sql_lines.append("(8,  'Sunita Devi',        'National award-winning Mithila artist painting stories of folklore and nature onto handmade cotton parchment.',    'Madhubani Master Painter',        'Madhubani, Bihar',            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', '20+ years', 5.0),")
    sql_lines.append("(9,  'Lalita Rathore',     'Practicing traditional Dabu mud-resist and Bagru block printing with natural indigo vats.',                        'Block Print Artisan',             'Bagru, Rajasthan',            'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80', '13+ years', 4.8),")
    sql_lines.append("(10, 'Tenzing Norbu',      'Hand-knotting pure sheep wool rugs and Himalayan meditation prayer accessories for 17 years.',                     'Himalayan Wool Weaver',           'Dharamshala, Himachal Pradesh','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', '17+ years', 4.9);")
    sql_lines.append("")

    # 4. PRODUCTS
    sql_lines.append("-- 4. PRODUCTS (200 Total: 25 per category)")
    sql_lines.append("INSERT INTO products (id, artisan_id, category_id, name, description, price, image, material, dimensions, care_instructions, stock_quantity, rating) VALUES")
    
    prod_tuples = []
    for p in products:
        # Escape single quotes in strings
        name_esc = p['name'].replace("'", "''")
        desc_esc = p['description'].replace("'", "''")
        mat_esc = p['material'].replace("'", "''")
        dims_esc = p['dimensions'].replace("'", "''").replace(";", ",")
        care_esc = p['care_instructions'].replace("'", "''").replace(";", ",")
        desc_esc = p['description'].replace("'", "''").replace(";", ",")
        
        tuple_str = f"({p['id']}, {p['artisan_id']}, {p['category_id']}, '{name_esc}', '{desc_esc}', {p['price']:.2f}, '{p['image']}', '{mat_esc}', '{dims_esc}', '{care_esc}', {p['stock_quantity']}, {p['rating']})"
        prod_tuples.append(tuple_str)
        
    sql_lines.append(",\n".join(prod_tuples) + ";")
    sql_lines.append("")

    # 5. REVIEWS
    sql_lines.append("-- 5. REVIEWS")
    sql_lines.append("INSERT INTO reviews (id, user_id, product_id, rating, review_text) VALUES")
    sql_lines.append("(1, 2, 1, 5, 'Exceptional craftsmanship! The mirror embroidery is very fine and fabric feels premium.'),")
    sql_lines.append("(2, 3, 2, 5, 'Extremely durable leather folio with rich embossing. Arrived quickly in eco packaging.'),")
    sql_lines.append("(3, 2, 26, 5, 'The Kanjeevaram silk weave is breathtaking! Stunning gold zari details.'),")
    sql_lines.append("(4, 3, 51, 5, 'Perfect eco-friendly toy for my toddler. Natural finish and smooth edges.'),")
    sql_lines.append("(5, 2, 76, 5, 'The blue pottery vase adds incredible royal charm to my living room desk.'),")
    sql_lines.append("(6, 3, 101, 5, 'Intricate filigree silver necklace. Recipient loved it as an anniversary gift.'),")
    sql_lines.append("(7, 2, 126, 5, 'Beautiful solid sheesham jewelry box. Fine brass inlay work.'),")
    sql_lines.append("(8, 3, 151, 5, 'Magnificent Madhubani painting on canvas! Beautiful vibrant colors.'),")
    sql_lines.append("(9, 2, 176, 5, 'High quality embossed leather tote bag. Very spacious and durable.');")
    
    return "\n".join(sql_lines)

def build_products_data_js(products):
    js_content = """// ================================================================
// CRAFTORA – Comprehensive Realistic Handmade Products Dataset
// E-Marketing for Customized Handmade Products
// 200 products covering all 8 e-commerce categories (25 products per category)
// All prices in ₹ INR
// ================================================================

export const initialAllProducts = """ + json.dumps(products, indent=2) + ";\n"
    return js_content

if __name__ == '__main__':
    products = generate_data()
    
    # Save seed.sql
    seed_sql = build_seed_sql(products)
    with open(SEED_SQL_PATH, 'w', encoding='utf-8') as f:
        f.write(seed_sql)
    print(f"✓ Updated {SEED_SQL_PATH}")
    
    # Save productsData.js
    products_js = build_products_data_js(products)
    with open(PRODUCTS_DATA_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(products_js)
    print(f"✓ Updated {PRODUCTS_DATA_JS_PATH}")

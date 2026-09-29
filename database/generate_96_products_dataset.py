import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(r'C:\Users\MANIKANDAN G\Documents\WE LAB Project')
SEED_SQL_PATH = BASE_DIR / 'database' / 'seed.sql'
PRODUCTS_DATA_JS_PATH = BASE_DIR / 'frontend' / 'src' / 'services' / 'productsData.js'

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

# 12 Sample Products per category (Exactly 96 products total)
PRODUCTS_DEFINITIONS = {
    1: [ # MEN (12 items)
        ("men-handloom-kurta.jpg", "Handloom Cotton Kurta with Mirror Work", "Classic mens kurta handwoven from premium cotton with hand-stitched mirror work detailing on collar and cuffs.", 1199.00, 9, "Handloom cotton with mirror embroidery", "Sizes: S, M, L, XL, XXL", "Gentle machine wash cold. Iron on reverse.", 12, 4.7),
        ("men-leather-folio.jpg", "Shantiniketan Embossed Leather Folio", "Handcrafted Shantiniketan embossed leather folio featuring traditional floral motifs, crafted using vegetable dyes.", 1249.00, 3, "Vegetable-tanned goat leather", "32cm x 24cm", "Condition with leather wax every 6 months.", 9, 4.9),
        ("men-kashmiri-waistcoat.jpg", "Hand-Embroidered Kashmiri Aari Waistcoat", "Traditional handcrafted Kashmiri men's waistcoat featuring intricate floral Aari thread embroidery on raw silk.", 2499.00, 7, "Pure raw silk with wool Aari embroidery", "Sizes: S, M, L, XL", "Dry clean only. Store in cotton bag.", 8, 4.8),
        ("men-leather-brass-bracelet.jpg", "Handcrafted Leather & Brass Bracelet", "Braided genuine leather bracelet with hand-hammered brass medallion stamped with traditional motifs.", 599.00, 5, "Vegetable-tanned leather & brass", "Adjustable 18–22cm", "Wipe clean with dry cloth.", 14, 4.7),
        ("men-khadi-stole.jpg", "Hand-Woven Khadi Stole for Men", "Soft hand-spun khadi cotton stole with natural vegetable-dyed stripe border.", 750.00, 2, "Pure hand-spun khadi cotton", "200cm x 55cm", "Gentle hand wash cold.", 10, 4.5),
        ("men-rajasthani-mojari.jpg", "Rajasthani Mojari Hand-Stitched Leather Shoes", "Authentic leather mojari footwear hand-stitched with colorful thread and traditional motifs.", 1499.00, 9, "Genuine camel leather", "Sizes: UK 7 to 11", "Keep away from water. Use leather polish.", 15, 4.8),
        ("men-dabu-block-shirt.jpg", "Organic Indigo Dabu Block Print Shirt", "Pure cotton men's casual shirt dyed in natural indigo vats using age-old Dabu mud-resist block technique.", 1350.00, 9, "100% organic cotton", "Sizes: S, M, L, XL", "Wash separately in cold water with mild detergent.", 18, 4.6),
        ("men-teakwood-cufflinks.jpg", "Hand-Carved Teakwood Cufflinks & Box Set", "Square teakwood cufflinks brass-inlaid with geometric patterns, stored in a hand-carved mini chest.", 899.00, 3, "Reclaimed teakwood & brass", "Cufflinks: 1.5cm, Box: 8cm x 5cm", "Wipe wood with dry microfiber cloth.", 11, 4.9),
        ("men-chanderi-dupatta.jpg", "Chanderi Silk Men's Dupatta with Zari Border", "Elegant lightweight Chanderi silk stole featuring woven gold zari border for festive occasions.", 1699.00, 2, "Chanderi silk-cotton blend with gold zari", "230cm x 60cm", "Dry clean recommended.", 7, 4.7),
        ("men-brass-leather-belt.jpg", "Handcrafted Brass Buckle Leather Belt", "Full-grain leather belt paired with a hand-cast solid brass buckle stamped with mandala art.", 1099.00, 5, "Full-grain cowhide leather & brass", "Length: 32 - 42 inches", "Condition leather periodically.", 20, 4.8),
        ("men-pashmina-muffler.jpg", "Pashmina Wool Muffler with Sozni Stitch", "Warm Himalayan sheep wool muffler delicately decorated with hand-embroidered Sozni needlework.", 2899.00, 10, "100% Himalayan Pashmina Wool", "180cm x 35cm", "Dry clean only. Store with cedar balls.", 6, 5.0),
        ("men-kolhapuri-sandals.jpg", "Kolhapuri Hand-Carved Leather Sandals", "Traditional Kolhapuri leather chappal with braided strap detailing and sturdy hand-stitched soles.", 1299.00, 1, "Tanned buffalo leather", "Sizes: UK 6 to 11", "Apply mustard oil occasionally for softness.", 13, 4.6)
    ],

    2: [ # WOMEN (12 items)
        ("women-kanjeevaram-saree.jpg", "Pure Kanjeevaram Silk Saree with Zari Motif", "Lustrous mulberry silk saree handwoven in Kanchipuram with rich gold zari peacock border.", 4999.00, 2, "Pure Mulberry Silk & Gold Zari", "Saree: 5.5m + 0.8m Blouse", "Dry clean only. Store in muslin cloth.", 6, 4.9),
        ("women-chanderi-dupatta.jpg", "Hand-Block Printed Chanderi Cotton Dupatta", "Breathable lightweight Chanderi fabric adorned with Bagru block floral prints and zari trim.", 899.00, 9, "Chanderi silk-cotton", "2.4m x 0.9m", "Gentle hand wash in cold water.", 18, 4.7),
        ("women-chikankari-kurti.jpg", "Chikankari Embroidered Georgette Kurti", "Ethereal Lucknowi Chikankari embroidered kurti with intricate Shadow and Bakhiya stitches.", 1899.00, 7, "Faux georgette with cotton thread", "Sizes: XS to XXL", "Hand wash cold or dry clean.", 12, 4.8),
        ("women-phulkari-shawl.jpg", "Phulkari Hand-Embroidered Velvet Shawl", "Vibrant Punjabi Phulkari floral thread embroidery on rich maroon velvet base fabric.", 2799.00, 7, "Velvet fabric with rayon thread", "2.2m x 1.0m", "Dry clean only.", 9, 4.9),
        ("women-bandhani-dupatta.jpg", "Bandhani Tie & Dye Mulberry Silk Dupatta", "Traditional Rajasthani tie-and-dye dupatta featuring thousands of tiny hand-tied dots.", 1599.00, 9, "100% Pure Mulberry Silk", "2.5m x 1.0m", "Dry clean only. Preserve roll crush.", 11, 4.8),
        ("women-banarasi-potli-belt.jpg", "Banarasi Brocade Potli Bag & Saree Belt", "Coordinated festive set featuring a woven zari potli handbag and matching embroidered waist belt.", 1299.00, 7, "Banarasi silk brocade & metallic zari", "Potli: 20cm x 18cm, Belt: Adjustable", "Spot clean only.", 14, 4.7),
        ("women-kalamkari-saree.jpg", "Kalamkari Hand-Painted Cotton Saree", "Srikalahasti style hand-painted saree depicting mythological lore painted with natural dyes.", 3499.00, 4, "100% Handloom Cotton", "Saree: 5.5m + Blouse", "Dry clean recommended.", 5, 5.0),
        ("women-ikat-kurta-set.jpg", "Sambalpuri Ikat Weave Cotton Kurta Set", "Authentic Odisha double-ikat weave cotton kurti paired with matching plain palazzo pants.", 2199.00, 2, "Pure Handloom Ikat Cotton", "Sizes: S, M, L, XL", "Gentle wash cold separately.", 10, 4.8),
        ("women-zardozi-jacket.jpg", "Hand-Embroidered Zardozi Velvet Jacket", "Royal festive layering jacket handcrafted with heavy gold zari, pearls, and metallic wire threadwork.", 3899.00, 7, "Rich Silk Velvet & Zardozi Wire", "Sizes: S, M, L", "Dry clean only.", 4, 4.9),
        ("women-maheshwari-saree.jpg", "Maheshwari Handloom Silk Cotton Saree", "Classic Maheshwari saree featuring reversible zari border and traditional check pattern weave.", 2699.00, 2, "Silk-Cotton Blend", "Saree: 5.5m + Blouse", "Dry clean for first wash.", 8, 4.8),
        ("women-pochampally-dupatta.jpg", "Pochampally Ikat Weave Cotton Dupatta", "Geometric ikat pattern handwoven by Telangana master weavers using resist-dyed cotton yarn.", 1199.00, 2, "100% Mercerized Cotton", "2.4m x 0.9m", "Hand wash with mild liquid detergent.", 15, 4.7),
        ("women-jamdani-saree.jpg", "Jamdani Hand-Woven Muslin Cotton Saree", "Featherlight Bengal Jamdani saree with extra-weft motif weaving that floats on sheer fabric.", 3299.00, 2, "Fine Muslin Cotton", "Saree: 5.5m + Blouse", "Hand wash with care or dry clean.", 7, 4.9)
    ],

    3: [ # KIDS (12 items)
        ("kids-channapatna-stacking-rings.jpg", "Channapatna Lacquerwood Stacking Rings", "Classic eco-friendly wooden stacking tower painted with non-toxic vegetable dyes.", 599.00, 6, "Wrightia tinctoria wood & organic lacquer", "18cm height", "Wipe clean with dry cloth.", 20, 4.9),
        ("kids-cotton-elephant-toy.jpg", "Handmade Organic Cotton Elephant Soft Toy", "Plush elephant stuffed toy hand-stitched from GOTS certified organic cotton fabric.", 699.00, 2, "Organic Cotton & Recycled Fiberfill", "22cm length", "Machine washable gentle cycle.", 15, 4.8),
        ("kids-madhubani-wooden-blocks.jpg", "Hand-Painted Madhubani Wooden Blocks", "Set of 12 solid wooden building blocks hand-painted with colorful animal figures.", 899.00, 8, "Natural Mango wood & child-safe paint", "Each block: 4cm cube", "Wipe with soft cloth.", 12, 4.9),
        ("kids-kondapalli-dancing-doll.jpg", "Kondapalli Wooden Dancing Doll Toy", "Traditional Andhra bobblehead dancing lady toy handcrafted from light softwood.", 749.00, 6, "Tella Poniki wood & natural colors", "25cm height", "Handle with care.", 14, 4.7),
        ("kids-wool-baby-booties.jpg", "Hand-Knitted Wool Baby Booties & Beanie", "Ultra-soft baby winter booties and matching bear-ear beanie hand-knitted from merino wool.", 649.00, 10, "100% Soft Merino Wool", "0 - 12 Months size", "Hand wash cold gently.", 18, 4.9),
        ("kids-channapatna-toy-car.jpg", "Channapatna Wooden Push Toy Car", "Smooth rolling toy car turned on traditional wooden lathe without sharp edges.", 499.00, 6, "Lacquerwood", "14cm x 8cm", "Wipe with dry cloth.", 22, 4.8),
        ("kids-bamboo-xylophone.jpg", "Eco Bamboo Xylophone & Mallet for Toddlers", "Handcrafted bamboo musical xylophone tuned to produces soft melodic tones.", 999.00, 6, "Natural Bamboo & Teak mallets", "30cm x 15cm", "Keep dry.", 11, 4.7),
        ("kids-kinnal-wooden-animals.jpg", "Kinnal Handcrafted Wooden Animal Set", "Set of 5 hand-carved wooden jungle animal figures decorated with natural pigments.", 1199.00, 6, "Kinnal softwood & natural paste", "Average size: 10cm", "Wipe clean gently.", 9, 4.9),
        ("kids-patchwork-baby-quilt.jpg", "Hand-Stitched Patchwork Baby Quilt", "Reversible soft cotton baby blanket stuffed with pure cotton battings.", 1299.00, 2, "100% Cotton fabric & fill", "110cm x 90cm", "Machine wash cold gentle.", 10, 4.8),
        ("kids-terracotta-mini-cookware.jpg", "Natural Clay Bhatukali Mini Cooking Set", "Traditional 10-piece miniature kitchen play set hand-moulded from red terracotta clay.", 549.00, 1, "Terracotta Clay", "Miniature cookware pieces", "Do not drop on hard surfaces.", 16, 4.6),
        ("kids-cotton-swaddle-cloth.jpg", "Soft Handloom Cotton Baby Swaddle Cloth", "Set of 2 breathable pre-washed cotton muslin swaddle wraps with block prints.", 799.00, 9, "100% Muslin Cotton", "100cm x 100cm", "Machine wash warm.", 25, 4.9),
        ("kids-channapatna-bowling-pins.jpg", "Channapatna Wooden Bowling Pins Set", "6 vibrant colorful wooden pins and 2 balls for fun indoor bowling play.", 1099.00, 6, "Seasoned Wood & Lacquer", "Pin height: 16cm", "Wipe with clean cloth.", 13, 4.8)
    ],

    4: [ # HOME & LIVING (12 items)
        ("home-blue-pottery-vase.jpg", "Hand-Painted Blue Pottery Ceramic Vase", "Jaipur blue pottery necked flower vase featuring hand-painted cobalt floral arabesques.", 1499.00, 1, "Quartz powder, glass & natural oxide", "24cm height x 12cm diameter", "Wipe clean with soft damp cloth.", 10, 4.9),
        ("home-macrame-wall-hanging.jpg", "Macrame Hand-Woven Wall Hanging", "Bohemian geometric wall tapestry knotted from natural unbleached cotton cord.", 1299.00, 2, "100% Natural Cotton Rope & Driftwood", "65cm length x 40cm width", "Gentle shake to dust. Do not wash.", 14, 4.8),
        ("home-teakwood-coaster-set.jpg", "Hand-Carved Teakwood Coaster Set", "Set of 6 square wooden drink coasters brass-inlaid with traditional lotus motif.", 799.00, 3, "Teakwood with brass wire inlay", "10cm x 10cm each", "Wipe dry after spills. Oil wood occasionally.", 20, 4.9),
        ("home-terracotta-table-lamp.jpg", "Terracotta Hand-Moulded Table Lamp", "Earthen terracotta lamp base accompanied by a hand-block printed cotton drum shade.", 2199.00, 1, "Natural Baked Clay & Cotton Shade", "Total Height: 45cm", "Dust shade with soft brush. B22 bulb required.", 8, 4.8),
        ("home-dhokra-candle-holder.jpg", "Brass Dhokra Tribal Candle Holder", "Lost-wax cast brass candle holder depicting a pair of tribal musicians.", 1199.00, 5, "Cast Brass", "18cm x 12cm", "Clean with brass polish.", 12, 4.7),
        ("home-block-print-table-runner.jpg", "Hand-Block Printed Cotton Table Runner", "100% cotton table runner printed with traditional Mughal floral bootis and tassels.", 899.00, 9, "Pure Heavy Cotton Canvas", "180cm x 35cm", "Cold machine wash. Iron on reverse.", 16, 4.8),
        ("home-bidriware-marble-coasters.jpg", "Bidriware Silver Inlaid Marble Coasters", "Set of 4 black Bidri alloy coasters with fine silver floral wire inlay.", 1699.00, 3, "Zinc Alloy & Pure Silver Inlay", "9cm diameter", "Apply coconut oil to maintain shine.", 9, 5.0),
        ("home-jute-braided-rug.jpg", "Handloom Jute & Cotton Braided Floor Rug", "Reversible eco-friendly area floor mat hand-braided from natural jute and cotton yarn.", 1999.00, 2, "70% Jute, 30% Cotton", "120cm x 80cm", "Vacuum regularly. Spot clean with damp cloth.", 11, 4.7),
        ("home-madhubani-ceramic-cups.jpg", "Madhubani Hand-Painted Ceramic Tea Cups", "Set of 6 ceramic kulhad style tea cups decorated with colorful Madhubani fish motifs.", 1199.00, 8, "Stoneware Ceramic", "Capacity: 180ml each", "Microwave & Dishwasher safe.", 15, 4.9),
        ("home-sheesham-wall-clock.jpg", "Hand-Carved Sheesham Wood Wall Clock", "Silent sweep wall clock featuring a floral hand-carved solid wooden frame.", 1899.00, 3, "Rosewood / Sheesham Wood", "30cm diameter", "Wipe clean. Requires 1 AA battery.", 7, 4.8),
        ("home-sabai-grass-basket.jpg", "Sabai Grass Woven Basket with Lid", "Multipurpose storage canister woven by Odisha women artists using Sabai grass.", 899.00, 2, "Sabai Grass & Palm Leaf", "22cm height x 20cm diameter", "Keep dry. Wipe clean.", 18, 4.6),
        ("home-terracotta-soy-candle.jpg", "Hand-Poured Soy Candle in Terracotta Pot", "Fragrant lavender infused soy wax poured into hand-painted clay matka pot.", 599.00, 1, "Soy Wax & Terracotta", "Burn time: 35 hours", "Trim wick to 1/4 inch before burning.", 22, 4.9)
    ],

    5: [ # JEWELRY (12 items)
        ("jewelry-silver-filigree-necklace.jpg", "Handcrafted Silver Floral Filigree Necklace", "Delicate sterling silver-tone necklace featuring floral pendant crafted with fine filigree work.", 1299.00, 5, "Sterling Silver Tone", "45cm chain length", "Store in airtight pouch.", 11, 4.8),
        ("jewelry-terracotta-beaded-bracelet.jpg", "Handmade Terracotta Beaded Bracelet Set", "Set of 3 stretch bracelets made from hand-moulded hand-painted terracotta beads.", 449.00, 5, "Hand-moulded Terracotta", "Adjustable 16–20cm", "Avoid water exposure.", 24, 4.6),
        ("jewelry-kundan-meenakari-earrings.jpg", "Kundan & Meenakari Drop Earrings", "Festive statement chandelier earrings featuring reverse Meenakari enamel and Kundan stones.", 1499.00, 5, "Brass, Kundan & Enamel", "7.5cm length x 4cm width", "Keep away from perfumes.", 9, 4.9),
        ("jewelry-oxidized-tribal-choker.jpg", "Oxidized Silver Tribal Choker Necklace", "Heavy German silver choker necklace embossed with traditional coin and flower medallions.", 1699.00, 5, "Oxidized German Silver", "Adjustable dori thread length", "Wipe clean with dry cloth.", 14, 4.8),
        ("jewelry-carved-wooden-ring.jpg", "Hand-Carved Wooden Statement Ring", "Boho wooden ring hand-carved from dark rosewood with brass wire inlay.", 399.00, 3, "Rosewood & Brass", "Sizes: US 6, 7, 8, 9", "Keep away from water.", 18, 4.5),
        ("jewelry-dokra-brass-pendant.jpg", "Dokra Cast Brass Tribal Pendant Necklace", "Lost-wax cast brass tribal motif pendant suspended on a thick braided cotton cord.", 899.00, 5, "Cast Brass & Cotton Thread", "Cord length: 55cm", "Clean with soft cloth.", 16, 4.7),
        ("jewelry-fabric-jhumka-earrings.jpg", "Hand-Embroidered Fabric Jhumka Earrings", "Lightweight round fabric jhumkas detailed with mirrorwork and dangling ghungroo bells.", 499.00, 7, "Cotton Fabric, Mirrors & Brass", "6cm length", "Avoid moisture.", 22, 4.7),
        ("jewelry-polki-nose-ring.jpg", "Pearl & Polki Hand-Crafted Nose Ring", "Traditional bridal septum clip-on ring crafted with faux pearls and uncut glass polki.", 599.00, 5, "Gold-plated alloy & faux pearls", "2.5cm hoop diameter", "Store dry.", 15, 4.8),
        ("jewelry-brass-stackable-bangles.jpg", "Hand-Hammered Brass Stackable Bangles", "Set of 6 narrow brass bangles featuring varied hammered textures and antique finish.", 699.00, 5, "Solid Brass", "Sizes: 2.4, 2.6, 2.8", "Polish with brass cleaner.", 20, 4.6),
        ("jewelry-pressed-flower-pendant.jpg", "Real Pressed Flower Resin Pendant", "Oval glass resin pendant containing real dried wildflowers on a sterling silver chain.", 899.00, 4, "Clear Resin & Real Botanical", "45cm silver chain", "Keep out of direct sunlight.", 13, 4.9),
        ("jewelry-blue-pottery-necklace.jpg", "Blue Pottery Ceramic Bead Necklace", "Hand-painted blue pottery ceramic spherical beads strung with lapis blue glass beads.", 999.00, 1, "Quartz Pottery Beads & Silver wire", "50cm length", "Handle ceramic beads gently.", 12, 4.8),
        ("jewelry-meenakari-peacock-anklet.jpg", "Jaipur Meenakari Peacock Anklet Pair", "Pair of traditional silver-plated payal anklets decorated with colorful peacock enamel.", 849.00, 5, "Silver-plated alloy & enamel", "26cm length + extension", "Store in ziplock pouch.", 17, 4.7)
    ],

    6: [ # GIFTS (12 items)
        ("gifts-carved-wooden-jewelry-box.jpg", "Hand-Carved Sheesham Wood Jewelry Box", "Solid sheesham wooden keepsake box featuring detailed floral brass wire inlay on lid.", 1249.00, 3, "Rosewood with brass wire inlay", "20cm x 12cm x 8cm", "Wipe with dry cloth.", 12, 4.9),
        ("gifts-blue-pottery-photo-frame.jpg", "Blue Pottery Hand-Painted Photo Frame", "Jaipur blue pottery tabletop picture frame designed for 4x6 inch memories.", 999.00, 1, "Ceramic Quartz & Glass", "Outer: 22cm x 17cm", "Clean glass with microfiber cloth.", 14, 4.8),
        ("gifts-engraved-brass-pen-stand.jpg", "Moradabad Engraved Brass Pen Stand", "Heavy brass cylindrical desk holder intricately hand-etched with Mughal floral vines.", 1199.00, 5, "Cast Solid Brass", "12cm height x 8cm diameter", "Polish with brass cleaner.", 10, 4.8),
        ("gifts-leather-deckle-journal.jpg", "Handcrafted Leather Journal Deckle Paper", "Refillable leather notebook with 200 pages of handmade recycled cotton deckle edge paper.", 899.00, 3, "Genuine Leather & Cotton Paper", "A5 size (21cm x 15cm)", "Keep dry.", 18, 4.9),
        ("gifts-soapstone-aroma-burner.jpg", "Soapstone Hand-Carved Aroma Oil Burner", "Jali lattice carved soapstone essential oil burner diffuser with brass dish.", 749.00, 3, "Natural Soft Soapstone", "11cm height x 9cm diameter", "Wipe dish after oil use.", 16, 4.7),
        ("gifts-bidriware-keepsake-box.jpg", "Bidriware Silver Inlaid Keepsake Box", "Black zinc-copper alloy trinket box embellished with intricate hand-hammered silver wire.", 2199.00, 3, "Bidri Alloy & Pure Silver Inlay", "12cm x 8cm x 5cm", "Apply coconut oil to preserve patina.", 6, 5.0),
        ("gifts-madhubani-wooden-tray.jpg", "Madhubani Wooden Tray & Coaster Set", "Serving tray paired with 4 coasters, hand-painted with Madhubani peacock art.", 1599.00, 8, "Mango Wood & Protective Lacquer", "Tray: 35cm x 25cm", "Wipe clean with damp cloth.", 9, 4.9),
        ("gifts-beeswax-candle-set.jpg", "Hand-Poured Scented Beeswax Candle Set", "Gift box of 3 pure beeswax votive candles scented with natural sandalwood and rose.", 899.00, 1, "100% Pure Beeswax & Essential oils", "Each candle: 100g", "Burn within sight.", 15, 4.8),
        ("gifts-pashmina-stole-gift-box.jpg", "Pashmina Silk Embroidered Stole Gift Box", "Luxury gift box containing a hand-embroidered silk-pashmina blend unisex stole.", 2999.00, 10, "Silk Pashmina Wool", "200cm x 70cm", "Dry clean only.", 5, 5.0),
        ("gifts-walnut-wood-dry-fruit-bowl.jpg", "Carved Walnut Wood Dry Fruit Bowl", "Hand-carved Kashmiri walnut wood bowl featuring 4 divided compartments and lid.", 1899.00, 3, "Solid Kashmiri Walnut Wood", "25cm diameter", "Wipe clean with dry cloth.", 8, 4.9),
        ("gifts-brass-nautical-compass.jpg", "Brass Vintage Compass in Wooden Box", "Functional nautical brass pocket compass presented in a velvet-lined carved wooden case.", 1399.00, 3, "Solid Brass & Rosewood box", "Compass: 6cm, Box: 9cm", "Avoid water exposure.", 11, 4.8),
        ("gifts-terracotta-diya-spice-box.jpg", "Terracotta Diya & Spice Box Set", "Decorative gift hamper box with 4 hand-painted terracotta oil lamps and brass spice tin.", 999.00, 1, "Clay & Brass", "Hamper box: 25cm x 25cm", "Handle clay diya carefully.", 13, 4.7)
    ],

    7: [ # ART & CRAFTS (12 items)
        ("art-madhubani-tree-of-life.jpg", "Authentic Madhubani Tree of Life Canvas", "Hand-painted folk art canvas depicting the eternal Tree of Life with birds and flora.", 2499.00, 8, "Handmade Canvas & Acrylic/Natural Ink", "60cm x 45cm (Framed)", "Keep out of direct sunlight. Dust lightly.", 8, 5.0),
        ("art-warli-village-canvas.jpg", "Warli Tribal Village Celebration Canvas", "Traditional Maharashtra Warli monochromatic painting on rustic red ochre canvas.", 1799.00, 4, "Rice paste pigment on cloth canvas", "50cm x 40cm (Unframed)", "Frame under glass for protection.", 11, 4.8),
        ("art-pattachitra-jagannath-scroll.jpg", "Odisha Pattachitra Scroll Art Jagannath", "Intricate cloth scroll painting depicting Lord Jagannath painted with mineral colors.", 2899.00, 8, "Cotton canvas coated with gum & chalk", "75cm x 30cm", "Keep dry.", 6, 4.9),
        ("art-tanjore-gold-leaf-lakshmi.jpg", "Tanjore Gold Leaf Painting of Lakshmi", "Rich South Indian Tanjore artwork embellished with 22k gold foil and semi-precious gems.", 4999.00, 4, "Teakwood board, Gold foil & Glass beads", "40cm x 30cm (Framed)", "Dust glass frame carefully.", 4, 5.0),
        ("art-teakwood-relief-wall-panel.jpg", "Hand-Carved Teakwood Relief Wall Panel", "3D wooden wall relief carved with lotus flowers and peacock pairs from a single wood block.", 3499.00, 3, "Reclaimed Teakwood", "60cm x 30cm x 4cm", "Apply wood wax polish annually.", 5, 4.9),
        ("art-pichwai-lotus-canvas.jpg", "Rajasthani Pichwai Lotus Canvas Painting", "Nathdwara style Pichwai wall canvas featuring pink lotus blooms and holy cows.", 2299.00, 4, "Cotton Canvas & Watercolors", "60cm x 60cm", "Keep away from moisture.", 9, 4.8),
        ("art-gond-wildlife-canvas.jpg", "Gond Art Wildlife Canvas Peacock & Deer", "Madhya Pradesh Gond tribal painting filled with intricate line and dot patterns.", 1999.00, 4, "Canvas & Acrylic colors", "50cm x 40cm", "Dust gently with dry cloth.", 10, 4.9),
        ("art-phad-royal-procession.jpg", "Phad Folk Painting Royal Procession", "Rajasthan Phad scroll painting depicting a royal king's procession on horses and elephants.", 2699.00, 8, "Handspun Khadi Canvas", "90cm x 35cm", "Store unrolled or framed.", 7, 4.9),
        ("art-terracotta-wall-mask.jpg", "Terracotta Hand-Sculpted Wall Mask", "Tribal face mask hand-moulded from red clay and hand-painted with earthen pigments.", 1199.00, 1, "Baked Terracotta Clay", "30cm height x 18cm width", "Mount securely on wall hook.", 12, 4.7),
        ("art-cheriyal-miniature-scroll.jpg", "Cheriyal Scroll Miniature Painting", "Telangana folk art painting on treated cloth portraying village stories.", 1899.00, 4, "Treated Khadi cloth & Natural dyes", "45cm x 30cm", "Keep away from direct sunlight.", 8, 4.8),
        ("art-kalamkari-wall-hanging.jpg", "Kalamkari Tree of Knowledge Wall Hanging", "Hand-painted cotton wall scroll created using bamboo pen and natural vegetable dyes.", 1699.00, 4, "100% Cotton & Natural Dyes", "100cm x 65cm", "Dry clean only.", 14, 4.8),
        ("art-kalighat-folk-art-canvas.jpg", "Kalighat Style Folk Art Canvas Frame", "Bold line watercolor painting inspired by 19th-century Bengal Kalighat temple art.", 1499.00, 4, "Handmade Paper & Watercolors", "40cm x 30cm (Framed)", "Handle glass frame carefully.", 13, 4.7)
    ],

    8: [ # BAGS & ACCESSORIES (12 items)
        ("bags-shantiniketan-leather-tote.jpg", "Shantiniketan Embossed Leather Tote Bag", "Spacious leather shoulder tote embossed with traditional West Bengal batik floral art.", 2499.00, 3, "Vegetable-tanned Leather", "38cm x 30cm x 12cm", "Condition with leather cream.", 10, 4.9),
        ("bags-kutch-zipper-clutch.jpg", "Hand-Embroidered Kutch Zipper Clutch", "Ethnic pouch clutch embellished with dense colorful embroidery and mirrorwork.", 899.00, 9, "Cotton Fabric & Glass Mirrors", "24cm x 14cm", "Dry clean only.", 18, 4.8),
        ("bags-jute-leather-messenger.jpg", "Natural Jute & Leather Messenger Bag", "Sturdy laptop messenger bag crafted from eco jute canvas with genuine leather trim.", 1899.00, 2, "Eco Jute & Full-grain Leather", "40cm x 30cm x 8cm", "Spot clean canvas.", 12, 4.7),
        ("bags-banjara-patchwork-sling.jpg", "Banjara Boho Tribal Patchwork Sling", "One-of-a-kind vintage cotton patchwork crossbody bag with coin tassles.", 1299.00, 7, "Vintage Cotton & Brass Coins", "28cm x 22cm, Strap 120cm", "Hand wash cold gently.", 14, 4.8),
        ("bags-kalamkari-canvas-tote.jpg", "Kalamkari Hand-Block Canvas Tote Bag", "Eco-friendly reusable shopping tote bag featuring hand-printed Kalamkari bootis.", 799.00, 9, "100% Heavy Cotton Canvas", "40cm x 35cm", "Machine wash cold inside out.", 22, 4.7),
        ("bags-bamboo-rigid-handbag.jpg", "Handcrafted Bamboo Rigid Handbag", "Structured box handbag hand-woven from natural bamboo splits with wooden handle.", 1699.00, 2, "Natural Bamboo & Wood", "24cm x 18cm x 10cm", "Keep dry.", 9, 4.9),
        ("bags-macrame-crossbody-sling.jpg", "Hand-Woven Macrame Boho Crossbody Sling", "Bohemian macrame camera bag knotted from natural cream cotton yarn.", 1199.00, 2, "100% Natural Cotton Cord", "22cm x 18cm", "Hand wash cold water.", 16, 4.8),
        ("bags-banarasi-brocade-potli.jpg", "Banarasi Brocade Potli Evening Bag", "Festive drawstring handbag made of gold Banarasi brocade fabric with pearl handle.", 999.00, 7, "Zari Brocade & Faux Pearls", "20cm x 18cm", "Spot clean only.", 15, 4.8),
        ("bags-madhubani-leather-wallet.jpg", "Hand-Painted Madhubani Leather Wallet", "Slim bi-fold men's/unisex leather wallet adorned with hand-painted fish motifs.", 999.00, 4, "Genuine Goat Leather", "11cm x 9cm closed", "Do not rub painted area.", 17, 4.9),
        ("bags-palm-leaf-woven-basket.jpg", "Palm Leaf Woven Market Basket Tote", "Structured eco-friendly shopping basket woven from sturdy dried palm leaves.", 849.00, 2, "Dried Natural Palm Leaves", "35cm x 28cm x 15cm", "Wipe clean with damp cloth.", 20, 4.6),
        ("bags-kantha-denim-travel-pouch.jpg", "Kantha Stitch Denim Travel Pouch", "Upcycled denim toiletries pouch decorated with running Kantha embroidery.", 649.00, 7, "Upcycled Denim & Cotton Thread", "22cm x 14cm x 8cm", "Machine wash cold.", 24, 4.7),
        ("bags-raw-silk-zardozi-clutch.jpg", "Raw Silk Envelope Clutch Zardozi", "Sophisticated evening envelope clutch bag featuring hand-stitched gold wire Zardozi.", 1499.00, 7, "Pure Raw Silk & Metallic Wire", "26cm x 15cm", "Dry clean only.", 11, 4.9)
    ]
}

def generate_data():
    all_products = []
    prod_id = 1
    
    for cat_id in sorted(PRODUCTS_DEFINITIONS.keys()):
        cat_name = CATEGORIES_META[cat_id]
        items = PRODUCTS_DEFINITIONS[cat_id]
        
        assert len(items) == 12, f"Category {cat_name} must have exactly 12 items! Found {len(items)}"
        
        for idx, item in enumerate(items):
            img_file, name, desc, price, art_id, mat, dims, care, stock, rating = item
            img_path = f"/images/products/{img_file}"
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
                "image": img_path,
                "material": mat,
                "dimensions": dims,
                "care_instructions": care,
                "stock_quantity": int(stock),
                "rating": float(rating),
                "is_customizable": True if idx % 3 == 0 else False
            }
            
            all_products.append(product_dict)
            prod_id += 1

    print(f"✓ Generated {len(all_products)} sample products across {len(CATEGORIES_META)} categories (12 per category).")
    return all_products

def build_seed_sql(products):
    sql_lines = []
    sql_lines.append("-- ============================================================")
    sql_lines.append("-- CRAFTORA: DATABASE SEED DATA (12 Products per Category = 96 Sample Products)")
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
    sql_lines.append("(1, 'Men',                'Handmade kurtas, wallets, bracelets, belts & accessories for men.',          '/images/products/men-handloom-kurta.jpg'),")
    sql_lines.append("(2, 'Women',              'Sarees, dupattas, jewellery, handbags & accessories for women.',             '/images/products/women-kanjeevaram-saree.jpg'),")
    sql_lines.append("(3, 'Kids',               'Handmade wooden toys, soft toys, puzzles & personalised baby gifts.',       '/images/products/kids-channapatna-stacking-rings.jpg'),")
    sql_lines.append("(4, 'Home & Living',      'Pottery, wall art, candles, macrame, lamps & handmade table decor.',        '/images/products/home-blue-pottery-vase.jpg'),")
    sql_lines.append("(5, 'Jewelry',            'Necklaces, earrings, bracelets, rings, silver & personalised jewellery.',   '/images/products/jewelry-silver-filigree-necklace.jpg'),")
    sql_lines.append("(6, 'Gifts',              'Birthday, wedding, anniversary & personalised gifts for every occasion.',    '/images/products/gifts-carved-wooden-jewelry-box.jpg'),")
    sql_lines.append("(7, 'Art & Crafts',       'Madhubani, Pithora, resin art, woodcraft & traditional Indian art.',        '/images/products/art-madhubani-tree-of-life.jpg'),")
    sql_lines.append("(8, 'Bags & Accessories', 'Tote bags, handbags, sling bags, wallets, pouches & keychains.',            '/images/products/bags-shantiniketan-leather-tote.jpg');")
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
    sql_lines.append("-- 4. PRODUCTS (96 Total: 12 per category)")
    sql_lines.append("INSERT INTO products (id, artisan_id, category_id, name, description, price, image, material, dimensions, care_instructions, stock_quantity, rating) VALUES")
    
    prod_tuples = []
    for p in products:
        name_esc = p['name'].replace("'", "''")
        desc_esc = p['description'].replace("'", "''").replace(";", ",")
        mat_esc = p['material'].replace("'", "''")
        dims_esc = p['dimensions'].replace("'", "''").replace(";", ",")
        care_esc = p['care_instructions'].replace("'", "''").replace(";", ",")
        
        tuple_str = f"({p['id']}, {p['artisan_id']}, {p['category_id']}, '{name_esc}', '{desc_esc}', {p['price']:.2f}, '{p['image']}', '{mat_esc}', '{dims_esc}', '{care_esc}', {p['stock_quantity']}, {p['rating']})"
        prod_tuples.append(tuple_str)
        
    sql_lines.append(",\n".join(prod_tuples) + ";")
    sql_lines.append("")

    # 5. REVIEWS
    sql_lines.append("-- 5. REVIEWS")
    sql_lines.append("INSERT INTO reviews (id, user_id, product_id, rating, review_text) VALUES")
    sql_lines.append("(1, 2, 1, 5, 'Exceptional craftsmanship! The mirror embroidery is very fine and fabric feels premium.'),")
    sql_lines.append("(2, 3, 2, 5, 'Extremely durable leather folio with rich embossing. Arrived quickly in eco packaging.'),")
    sql_lines.append("(3, 2, 13, 5, 'The Kanjeevaram silk weave is breathtaking! Stunning gold zari details.'),")
    sql_lines.append("(4, 3, 25, 5, 'Perfect eco-friendly toy for my toddler. Natural finish and smooth edges.'),")
    sql_lines.append("(5, 2, 37, 5, 'The blue pottery vase adds incredible royal charm to my living room desk.'),")
    sql_lines.append("(6, 3, 49, 5, 'Intricate filigree silver necklace. Recipient loved it as an anniversary gift.'),")
    sql_lines.append("(7, 2, 61, 5, 'Beautiful solid sheesham jewelry box. Fine brass inlay work.'),")
    sql_lines.append("(8, 3, 73, 5, 'Magnificent Madhubani painting on canvas! Beautiful vibrant colors.'),")
    sql_lines.append("(9, 2, 85, 5, 'High quality embossed leather tote bag. Very spacious and durable.');")
    
    return "\n".join(sql_lines)

def build_products_data_js(products):
    js_content = """// ================================================================
// CRAFTORA – Comprehensive Realistic Handmade Products Dataset
// 96 products covering all 8 e-commerce categories (12 products per category)
// All images hosted locally under /images/products/ with 100% unique hashes
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

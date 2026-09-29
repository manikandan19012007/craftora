import { initialAllProducts } from './productsData';

// ================================================================
// CRAFTORA – Fallback/Initial Data for Demo Mode
// E-Commerce Categories aligned with major marketplaces
// ================================================================

// 8 E-Commerce Categories (Men, Women, Kids, Home, Jewelry, Gifts, Art, Bags)
export const initialCategories = [
  {
    id: 1,
    name: 'Men',
    slug: 'Men',
    description: 'Handcrafted Ajrakh kurtas, Nehru jackets, Pashmina shawls, Kolhapuri chappals & traditional artisan crafts for men.',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80',
    item_count: 125,
    subcategories: ['Ajrakh Kurtas', 'Nehru Jackets', 'Pashmina Shawls', 'Kolhapuri Chappals', 'Rosewood Cufflinks']
  },
  {
    id: 2,
    name: 'Women',
    slug: 'Women',
    description: 'Handwoven Banarasi sarees, Chikankari kurtis, Dokra jewellery, Tarakasi filigree & heritage textiles for women.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    item_count: 125,
    subcategories: ['Handloom Sarees', 'Chikankari Kurtis', 'Dokra Jewelry', 'Embroidered Dupattas', 'Filigree Hair Pins']
  },
  {
    id: 3,
    name: 'Kids',
    slug: 'Kids',
    description: 'Authentic Channapatna lacquer toys, Kathputli puppets, Kondapalli woodcraft & traditional handmade dolls.',
    image: 'https://images.unsplash.com/photo-1558618047-f4e90c2a8b37?auto=format&fit=crop&w=600&q=80',
    item_count: 125,
    subcategories: ['Channapatna Toys', 'Kathputli Puppets', 'Kondapalli Toys', 'Wooden Puzzles', 'Handmade Folk Dolls']
  },
  {
    id: 4,
    name: 'Home & Living',
    slug: 'Home & Living',
    description: 'Terracotta planters, brass diyas, carved rosewood decor, cane baskets & hand-knotted Kashmir dhurries.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    item_count: 125,
    subcategories: ['Brass Diyas', 'Terracotta Planters', 'Carved Woodcraft', 'Kashmir Dhurries', 'Cane Baskets']
  },
  {
    id: 5,
    name: 'Jewelry',
    slug: 'Jewelry',
    description: 'Dokra lost-wax brass, terracotta necklaces, sterling silver filigree, hand-painted bangles & shell jewelry.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    item_count: 125,
    subcategories: ['Dokra Castings', 'Terracotta Necklaces', 'Silver Filigree', 'Hand-Painted Bangles', 'Tribal Beads']
  },
  {
    id: 6,
    name: 'Gifts',
    slug: 'Gifts',
    description: 'Jaipur blue pottery, soapstone aroma burners, Bidriware keepsake boxes, Moradabad brass diyas & artisan hampers.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    item_count: 125,
    subcategories: ['Blue Pottery', 'Soapstone Crafts', 'Bidriware Inlay', 'Brass Peacock Diyas', 'Artisan Hampers']
  },
  {
    id: 7,
    name: 'Art & Crafts',
    slug: 'Art & Crafts',
    description: 'Madhubani folk art, Warli tribal paintings, Pattachitra scrolls, Tanjore relief paintings & carved wooden panels.',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    item_count: 125,
    subcategories: ['Madhubani', 'Warli Paintings', 'Pattachitra Scrolls', 'Tanjore Art', 'Carved Wood Panels']
  },
  {
    id: 8,
    name: 'Bags & Accessories',
    slug: 'Bags & Accessories',
    description: 'Shantiniketan embossed leather bags, Banjara mirrorwork totes, Kalamkari canvas bags & woven palm leaf crafts.',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
    item_count: 125,
    subcategories: ['Shantiniketan Leather', 'Banjara Mirrorwork', 'Kalamkari Totes', 'Jute & Palm Leaf', 'Beaded Clutches']
  }
];

// Extended Artisan roster (6 artisans)
export const initialArtisans = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    specialty: 'Master Potter & Ceramicist',
    location: 'Jaipur, Rajasthan',
    experience: '18+ years',
    rating: 4.9,
    product_count: 8,
    bio: 'Preserving 3rd-generation blue pottery traditions with sustainable natural glazes and custom monogram engravings. Every mug tells a story of Jaipur\'s heritage.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    name: 'Meenakshi Sundaram',
    specialty: 'Handloom & Textile Weaver',
    location: 'Madurai, Tamil Nadu',
    experience: '12+ years',
    rating: 4.8,
    product_count: 6,
    bio: 'Weaving hand-spun organic cotton and natural vegetable dye tapestries using authentic wooden pit looms and bespoke name embroidery for 12 years.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    name: 'Arjun Somvanshi',
    specialty: 'Rosewood & Brass Craftsman',
    location: 'Saharanpur, Uttar Pradesh',
    experience: '15+ years',
    rating: 5.0,
    product_count: 7,
    bio: 'Hand-carving reclaimed rosewood and teak into timeless personalized nameplates, keepsake boxes, and architectural accents for 15 years.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 4,
    name: 'Ananya Bose',
    specialty: 'Folk Painter & Resin Artist',
    location: 'Kolkata, West Bengal',
    experience: '8+ years',
    rating: 4.9,
    product_count: 5,
    bio: 'Blending traditional Madhubani and Warli folk art styles with contemporary resin art. Each piece is an original creation that bridges heritage and modernity.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 5,
    name: 'Kavitha Swaminathan',
    specialty: 'Jewelry & Metalwork Artist',
    location: 'Chennai, Tamil Nadu',
    experience: '10+ years',
    rating: 4.8,
    product_count: 9,
    bio: 'Creating contemporary handcrafted jewelry by blending tribal traditions with modern aesthetics. Uses recycled metals and natural stones for every unique piece.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 6,
    name: 'Balram Patra',
    specialty: 'Channapatna Lacquerwood Artist',
    location: 'Channapatna, Karnataka',
    experience: '20+ years',
    rating: 4.9,
    product_count: 6,
    bio: 'A 4th-generation Channapatna craftsman who preserves the ancient art of turning toys and household items on a hand lathe using natural lacquer and turmeric pigments.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
  }
];

// ── Derived Exports ─────────────────────────────────────────────
const byId = (id) => initialAllProducts.find(p => p.id === id);

export const initialFeaturedProducts = [
  byId(1), byId(4), byId(7), byId(10), byId(13), byId(18), byId(22), byId(25),
].filter(Boolean);

export const initialCustomizableProducts = initialAllProducts.filter(p => p.is_customizable);

export const initialTrendingProducts = [
  byId(1),  // Silver Necklace
  byId(13), // Ceramic Mug
  byId(18), // Wooden Nameplate
  byId(25), // Canvas Tote Bag
  byId(11), // Kids Name Puzzle
  byId(22), // Madhubani Art
  byId(19), // Gift Box
  byId(15), // Macrame Wall Hanging
].filter(Boolean);

export const initialDealsProducts = initialAllProducts.filter(p => p.original_price !== null);

export const initialPopularProducts = initialAllProducts
  .filter(p => p.rating >= 4.8)
  .slice(0, 8);
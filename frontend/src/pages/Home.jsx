
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  Gem,
  ShoppingBag,
  Palette,
  Truck,
  HeartHandshake,
  Star,
  Zap,
  Tag,
  TrendingUp,
  Brush
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ArtisanCard from '../components/ArtisanCard';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getProducts, getCategories, getArtisans } from '../services/api';
import {
  initialCategories,
  initialArtisans,
  initialFeaturedProducts,
  initialCustomizableProducts,
  initialTrendingProducts,
  initialDealsProducts,
  initialPopularProducts
} from '../services/initialData';
import './Home.css';

const CATEGORY_ICONS = {
  'Women': '👗',
  'Men': '👔',
  'Kids': '🧸',
  'Home & Living': '🏠',
  'Jewelry': '💍',
  'Gifts': '🎁',
  'Art & Crafts': '🎨',
  'Bags & Accessories': '👜',
};

export default function Home() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState(initialFeaturedProducts.slice(0, 8));
  const [trendingProducts, setTrendingProducts] = useState(initialTrendingProducts.slice(0, 8));
  const [dealsProducts, setDealsProducts] = useState(initialDealsProducts.slice(0, 6));
  const [artisans, setArtisans] = useState(initialArtisans.slice(0, 4));
  const [categories, setCategories] = useState(initialCategories);

  // Try to load live data, fallback gracefully to initialData
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [prodRes, artRes] = await Promise.all([
          getProducts({ sort_by: 'popular' }).catch(() => ({ products: [] })),
          getArtisans().catch(() => ({ artisans: [] }))
        ]);
        if (prodRes.products?.length > 0) setFeaturedProducts(prodRes.products.slice(0, 8));
        if (artRes.artisans?.length > 0) setArtisans(artRes.artisans.slice(0, 4));
      } catch (err) {
        console.warn('Demo mode active:', err.message);
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1, null);
    addToast(`"${product.name}" added to cart!`, 'success');
  };

  const handleToggleWishlist = (product) => {
    toggleWishlist(product);
    const already = isWishlisted(product.id);
    addToast(already ? `Removed from wishlist` : `Added to wishlist!`, already ? 'info' : 'success');
  };

  return (
    <main className="home-page">

      {/* ═══════════════════════════════════════════════
          1. HERO BANNER
      ═══════════════════════════════════════════════ */}
      <section className="hero-banner" aria-label="CRAFTORA hero">
        {/* Decorative background pattern */}
        <div className="hero-bg-pattern" aria-hidden="true" />

        <div className="container hero-inner">
          {/* Left: Content */}
          <div className="hero-content">
            <span className="hero-badge">
              <Sparkles size={13} />
              &nbsp;SIH 2025 Finalist Project – CRAFTORA
            </span>

            <h1 className="hero-title">
              Discover India's
              <span className="hero-highlight"> Finest </span>
              Handmade &amp; Customized Products
            </h1>

            <p className="hero-subtitle">
              Shop authentic handcrafted pieces from 500+ certified Indian artisans.
              Every product tells a story of heritage, skill, and passion.
            </p>

            {/* Search Bar */}
            <form className="hero-search-form" onSubmit={handleSearchSubmit} role="search">
              <Search size={18} className="hero-search-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search ceramic mugs, sarees, wooden nameplates..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                aria-label="Search handmade products"
              />
              <button type="submit" className="hero-search-btn" aria-label="Search">
                Search
              </button>
            </form>

            {/* Hero CTAs */}
            <div className="hero-cta-row">
              <Link to="/products" className="btn btn-primary hero-cta-primary">
                <ShoppingBag size={16} />
                Shop All Products
              </Link>
              <Link to="/artisans" className="btn btn-outline hero-cta-outline">
                <Users size={16} />
                Meet Artisans
              </Link>
            </div>

            {/* Social Proof Row */}
            <div className="hero-social-proof">
              <div className="proof-item">
                <span className="proof-num">500+</span>
                <span className="proof-label">Verified Artisans</span>
              </div>
              <div className="proof-divider" />
              <div className="proof-item">
                <span className="proof-num">12,000+</span>
                <span className="proof-label">Happy Patrons</span>
              </div>
              <div className="proof-divider" />
              <div className="proof-item">
                <span className="proof-num">4.9★</span>
                <span className="proof-label">Avg. Rating</span>
              </div>
            </div>
          </div>

          {/* Right: Feature Cards */}
          <div className="hero-right-panel">
            <div className="hero-feature-card hero-card-main">
              <img
                src="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=500&q=80"
                alt="Handcrafted pottery by Indian artisan"
                loading="eager"
              />
              <div className="hero-card-label">
                <span>🏺 Handmade Pottery</span>
                <span>from ₹449</span>
              </div>
            </div>
            <div className="hero-feature-card hero-card-sm hero-card-sm-1">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"
                alt="Personalized wooden nameplate"
                loading="eager"
              />
              <div className="hero-card-label">
                <Sparkles size={11} /> Personalised Gifts
              </div>
            </div>
            <div className="hero-feature-card hero-card-sm hero-card-sm-2">
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80"
                alt="Artisan jewelry"
                loading="eager"
              />
              <div className="hero-card-label">
                <Gem size={11} /> Artisan Jewelry
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          2. CATEGORIES QUICK-ACCESS
      ═══════════════════════════════════════════════ */}
      <section className="categories-quickaccess" aria-label="Shop by category">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-badge">Shop by Category</span>
              <h2 className="section-title">Find What You're Looking For</h2>
            </div>
            <Link to="/categories" className="view-all-link">
              All Categories <ArrowRight size={14} />
            </Link>
          </div>

          <div className="category-icon-grid">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="category-icon-card"
                aria-label={`Browse ${cat.name}`}
              >
                <div className="cat-icon-circle">
                  <span className="cat-emoji">{CATEGORY_ICONS[cat.name] || '🛍️'}</span>
                </div>
                <span className="cat-icon-name">{cat.name}</span>
                <span className="cat-icon-count">{cat.item_count}+ items</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          3. DEALS & OFFERS SECTION
      ═══════════════════════════════════════════════ */}
      <section className="deals-section" aria-label="Deals and offers">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-badge" style={{ background: '#FFF3E0', color: '#E65100', borderColor: '#FFCC80' }}>
                🔥 Hot Deals
              </span>
              <h2 className="section-title">Artisan Finds on Sale</h2>
              <p className="section-subtitle">Limited time offers on handpicked handmade products</p>
            </div>
            <Link to="/products?has_discount=true" className="view-all-link">
              View All Deals <ArrowRight size={14} />
            </Link>
          </div>

          <div className="deals-banner-grid">
            {/* Big Deals Banner */}
            <div className="deals-hero-banner">
              <img
                src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=700&q=80"
                alt="Handmade textile deals"
              />
              <div className="deals-hero-overlay">
                <span className="deals-hero-badge">UP TO 30% OFF</span>
                <h3>Handmade Textiles &amp; Clothing</h3>
                <p>Sarees, Kurtas, Dupattas by master weavers</p>
                <Link to="/products?category=Women" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  Shop Textiles
                </Link>
              </div>
            </div>

            {/* Small Deal Cards */}
            <div className="deals-products-grid">
              {dealsProducts.slice(0, 4).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={isWishlisted(product.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          4. TRENDING PRODUCTS
      ═══════════════════════════════════════════════ */}
      <section className="trending-section" aria-label="Trending handmade products">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-badge">
                <TrendingUp size={11} /> Trending Now
              </span>
              <h2 className="section-title">Most Loved by Patrons</h2>
              <p className="section-subtitle">Handpicked bestsellers from our artisan community</p>
            </div>
            <Link to="/products?sort=popular" className="view-all-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="products-4col-grid">
            {trendingProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={isWishlisted(product.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          5. "MAKE IT YOURS" — PERSONALIZATION BANNER
      ═══════════════════════════════════════════════ */}
      <section className="make-it-yours-section" aria-label="Personalization feature">
        <div className="container make-it-yours-inner">
          <div className="miy-content">
            <span className="miy-badge">
              <Brush size={13} /> Made-to-Order
            </span>
            <h2 className="miy-title">Make It <em>Yours</em></h2>
            <p className="miy-desc">
              Go beyond off-the-shelf. Add your name, choose your colors, personalize your text —
              every customized piece is hand-crafted specifically for you by certified Indian artisans.
            </p>

            <ul className="miy-features">
              <li>
                <Sparkles size={16} />
                Custom text, monograms &amp; engravings
              </li>
              <li>
                <Palette size={16} />
                Choose colors, materials &amp; finishes
              </li>
              <li>
                <ShieldCheck size={16} />
                Artisan quality guaranteed on every piece
              </li>
              <li>
                <Truck size={16} />
                Made &amp; dispatched within 5–7 business days
              </li>
            </ul>

            <div className="miy-cta-row">
              <Link to="/products?customizable=true" className="btn btn-primary">
                <Sparkles size={16} />
                Browse Customizable Products
              </Link>
              <Link to="/artisans" className="btn btn-outline">
                <Users size={16} />
                Talk to an Artisan
              </Link>
            </div>
          </div>

          <div className="miy-visual">
            <div className="miy-card-stack">
              <div className="miy-card miy-card-1">
                <img
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80"
                  alt="Custom ceramic mug with initials"
                />
                <span className="miy-card-label">Custom Mug with Initials</span>
              </div>
              <div className="miy-card miy-card-2">
                <img
                  src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80"
                  alt="Embroidered canvas tote"
                />
                <span className="miy-card-label">Embroidered Tote Bag</span>
              </div>
              <div className="miy-card miy-card-3">
                <img
                  src="https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80"
                  alt="Personalized wooden nameplate"
                />
                <span className="miy-card-label">Engraved Wooden Nameplate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          6. FEATURED PRODUCTS
      ═══════════════════════════════════════════════ */}
      <section className="featured-section" aria-label="Featured handmade products">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-badge">Curated for You</span>
              <h2 className="section-title">Featured Handmade Products</h2>
              <p className="section-subtitle">Handpicked authentic pieces from our artisan community</p>
            </div>
            <Link to="/products" className="view-all-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="products-4col-grid">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={isWishlisted(product.id)}
              />
            ))}
          </div>

          <div className="view-all-cta-row">
            <Link to="/products" className="btn btn-outline">
              Explore All 30+ Handmade Products
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          7. MEET THE ARTISANS
      ═══════════════════════════════════════════════ */}
      <section className="artisans-section" aria-label="Meet our artisans">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-badge">The Creators</span>
              <h2 className="section-title">Master Artisans Behind the Craft</h2>
              <p className="section-subtitle">Real people, authentic skills, generational traditions</p>
            </div>
            <Link to="/artisans" className="view-all-link">
              All Artisans <ArrowRight size={14} />
            </Link>
          </div>

          <div className="artisans-4col-grid">
            {artisans.map(artisan => (
              <ArtisanCard key={artisan.id} artisan={artisan} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          8. WHY CRAFTORA — VALUE PROPS
      ═══════════════════════════════════════════════ */}
      <section className="why-craftora-section" aria-label="Why choose CRAFTORA">
        <div className="container">
          <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <span className="section-badge">Our Promise</span>
              <h2 className="section-title">Why Choose CRAFTORA?</h2>
            </div>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon-wrap">
                <ShieldCheck size={24} />
              </div>
              <h3>100% Verified Artisans</h3>
              <p>Every creator on CRAFTORA is hand-vetted for quality, authenticity, and ethical practices.</p>
            </div>
            <div className="why-card">
              <div className="why-icon-wrap">
                <Sparkles size={24} />
              </div>
              <h3>Bespoke Customization</h3>
              <p>Personalize any product with your name, date, color, or message at no extra cost.</p>
            </div>
            <div className="why-card">
              <div className="why-icon-wrap">
                <HeartHandshake size={24} />
              </div>
              <h3>Direct from Creator</h3>
              <p>85% of every purchase goes directly to the artisan who made your product.</p>
            </div>
            <div className="why-card">
              <div className="why-icon-wrap">
                <Truck size={24} />
              </div>
              <h3>Eco-Conscious Delivery</h3>
              <p>All orders packed in biodegradable honeycomb paper and shipped pan-India.</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
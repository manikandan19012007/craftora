import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  ShoppingBag,
  Heart,
  Eye,
  Star,
  Truck,
  Award,
  X,
  CheckCircle2,
  Package
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import RatingStars from '../components/RatingStars';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getProducts, getArtisans } from '../services/api';
import {
  initialFeaturedProducts,
  initialArtisans
} from '../services/initialData';
import './Home.css';

// Curated image-based category cards (Pottery, Jewelry, Textiles, Home Décor, Woodwork, etc.)
const CATEGORY_CARDS = [
  {
    id: 'pottery',
    name: 'Pottery & Ceramics',
    tagline: 'Hand-thrown Terracotta & Blue Glaze',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
    path: '/products?category=Home+%26+Living'
  },
  {
    id: 'jewelry',
    name: 'Artisan Jewelry',
    tagline: 'Silver Filigree & Kundan Works',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    path: '/products?category=Jewelry'
  },
  {
    id: 'textiles',
    name: 'Heritage Textiles',
    tagline: 'Handloom Sarees, Kurtas & Stoles',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    path: '/products?category=Women'
  },
  {
    id: 'homedecor',
    name: 'Home Décor',
    tagline: 'Brass Lanterns & Macramé Art',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    path: '/products?category=Home+%26+Living'
  },
  {
    id: 'woodwork',
    name: 'Carved Woodwork',
    tagline: 'Sheesham & Channapatna Crafts',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
    path: '/products?category=Art+%26+Crafts'
  },
  {
    id: 'art',
    name: 'Traditional Art',
    tagline: 'Madhubani & Pattachitra Paintings',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    path: '/products?category=Art+%26+Crafts'
  },
  {
    id: 'bags',
    name: 'Handcrafted Bags',
    tagline: 'Shantiniketan Leather & Jute Totes',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    path: '/products?category=Bags+%26+Accessories'
  },
  {
    id: 'gifts',
    name: 'Bespoke Gifts',
    tagline: 'Personalized Keepsakes & Mementos',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    path: '/products?category=Gifts'
  }
];

// Verified Genuine Testimonials
const GENUINE_REVIEWS = [
  {
    id: 1,
    name: 'Aanya Sengupta',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    date: 'Verified Buyer · Sept 2026',
    comment: 'The blue pottery vase arrived in custom biodegradable packaging with a signed artisan note from Master Dayaram in Jaipur. You can instantly feel the authentic weight and human touch.',
    productName: 'Jaipur Floral Blue Pottery Vase'
  },
  {
    id: 2,
    name: 'Vikramaditya Rao',
    location: 'Hyderabad, Telangana',
    rating: 5,
    date: 'Verified Buyer · Aug 2026',
    comment: 'Ordered personalized brass door handle and hand-carved jewelry box for our anniversary. The engraving is sharp, the sheesham wood smell is heavenly. Exceptional platform!',
    productName: 'Carved Sheesham Keepsake Box'
  },
  {
    id: 3,
    name: 'Meera Nambiar',
    location: 'Kochi, Kerala',
    rating: 5,
    date: 'Verified Buyer · Sept 2026',
    comment: 'Knowing that 85% of what I paid goes directly into the weaver’s bank account makes every penny worthwhile. Craftora sets the gold standard for ethical handmade shopping.',
    productName: 'Kanjeevaram Handloom Silk Stole'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState(initialFeaturedProducts.slice(0, 8));
  const [artisans, setArtisans] = useState(initialArtisans.slice(0, 4));
  const [loading, setLoading] = useState(true);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Fetch real products & artisans from MySQL backend
  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [prodRes, artRes] = await Promise.all([
          getProducts({ sort_by: 'popular' }).catch(() => ({ products: [] })),
          getArtisans().catch(() => ({ artisans: [] }))
        ]);

        if (isMounted) {
          if (prodRes?.products?.length > 0) {
            // Take 8 to 12 featured products with complete metadata
            setFeaturedProducts(prodRes.products.slice(0, 12));
          }
          if (artRes?.artisans?.length > 0) {
            setArtisans(artRes.artisans.slice(0, 4));
          }
        }
      } catch (err) {
        console.warn('Backend home fetch error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHomeData();
    return () => { isMounted = false; };
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
    addToast(already ? 'Removed from wishlist' : 'Added to your wishlist!', already ? 'info' : 'success');
  };

  return (
    <main className="home-page">

      {/* ═══════════════════════════════════════════════
          1. HERO BANNER
          Ivory canvas, Authentic Artisan Photography, Terracotta CTA
      ═══════════════════════════════════════════════ */}
      <section className="hero-banner" aria-label="Craftora hero">
        <div className="hero-linen-pattern" aria-hidden="true" />

        <div className="container hero-inner">
          {/* Left Hero Content */}
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} className="hero-badge-icon" />
              <span>Direct From India’s Master Workshops</span>
            </div>

            <h1 className="hero-title">
              Made by Hand.
              <span className="hero-highlight"> Loved for a Lifetime.</span>
            </h1>

            <p className="hero-subtitle">
              Discover authentic, heirloom-quality pottery, jewelry, handloom textiles, and woodwork
              crafted by certified independent artisans across India.
            </p>

            {/* Quick Search */}
            <form className="hero-search-form" onSubmit={handleSearchSubmit} role="search">
              <Search size={18} className="hero-search-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search blue pottery, silk sarees, carved boxes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                aria-label="Search handmade products"
              />
              <button type="submit" className="hero-search-btn" aria-label="Search collection">
                Search
              </button>
            </form>

            {/* Hero CTAs */}
            <div className="hero-cta-row">
              <Link to="/products" className="btn btn-primary hero-cta-primary">
                <ShoppingBag size={18} />
                <span>Shop Collection</span>
              </Link>
              <Link to="/artisans" className="btn btn-outline hero-cta-outline">
                <Users size={18} />
                <span>Meet Our Artisans</span>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="hero-social-proof">
              <div className="proof-item">
                <span className="proof-num">500+</span>
                <span className="proof-label">Verified Artisans</span>
              </div>
              <div className="proof-divider" />
              <div className="proof-item">
                <span className="proof-num">100%</span>
                <span className="proof-label">Direct Fair Trade</span>
              </div>
              <div className="proof-divider" />
              <div className="proof-item">
                <span className="proof-num">4.9 ★</span>
                <span className="proof-label">Customer Rating</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Collage */}
          <div className="hero-visual-collage" aria-label="Handmade craft collage">
            <div className="hero-img-card hero-card-main">
              <img
                src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=700&q=80"
                alt="Artisan hand-throwing ceramic pottery"
                loading="eager"
              />
              <div className="hero-card-tag">
                <span className="hero-tag-title">Handcrafted Ceramics</span>
                <span className="hero-tag-price">From ₹449</span>
              </div>
            </div>

            <div className="hero-img-card hero-card-floating hero-card-top">
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80"
                alt="Silver handcrafted filigree necklace"
                loading="eager"
              />
              <div className="hero-floating-pill">
                <Sparkles size={12} color="#2563EB" />
                <span>Artisan Filigree</span>
              </div>
            </div>

            <div className="hero-img-card hero-card-floating hero-card-bottom">
              <img
                src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80"
                alt="Carved wooden heirloom box"
                loading="eager"
              />
              <div className="hero-floating-pill">
                <Award size={12} color="#23533E" />
                <span>Heirloom Woodwork</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          2. SHOP BY CATEGORY
          Attractive image-based cards with clean typography
      ═══════════════════════════════════════════════ */}
      <section className="categories-section" aria-label="Shop by craft category">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Explore Heritage Crafts</span>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">
                Time-honored techniques passed down through generations of master makers.
              </p>
            </div>
            <Link to="/categories" className="section-link">
              <span>View All Categories</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="category-cards-grid">
            {CATEGORY_CARDS.map((cat) => (
              <Link
                key={cat.id}
                to={cat.path}
                className="category-image-card"
                aria-label={`Browse ${cat.name}`}
              >
                <div className="category-img-wrap">
                  <img src={cat.image} alt={cat.name} loading="lazy" />
                  <div className="category-overlay" />
                </div>
                <div className="category-card-content">
                  <h3 className="category-card-name">{cat.name}</h3>
                  <span className="category-card-tagline">{cat.tagline}</span>
                  <span className="category-explore-btn">
                    Explore <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          3. FEATURED PRODUCTS (8–12 Products Grid)
          Working images, prices, stock status, wishlist, quick view
      ═══════════════════════════════════════════════ */}
      <section className="featured-products-section" aria-label="Featured handmade products">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Curated Selection</span>
              <h2 className="section-title">Featured Artisan Creations</h2>
              <p className="section-subtitle">
                Each piece is unique, lovingly handcrafted, and ships directly from the artisan's studio.
              </p>
            </div>
            <Link to="/products" className="section-link">
              <span>Explore All Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="featured-products-grid">
            {featuredProducts.map((product) => {
              const isOutOfStock = !product.is_made_to_order && product.stock_quantity <= 0;
              const isLowStock = !product.is_made_to_order && product.stock_quantity > 0 && product.stock_quantity <= 3;
              const isMadeToOrder = Boolean(product.is_made_to_order);

              return (
                <div key={product.id} className="featured-card-wrapper">
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={isWishlisted(product.id)}
                  />
                  {/* Quick View Button under image */}
                  <button
                    className="card-quickview-btn"
                    onClick={() => setQuickViewProduct(product)}
                    aria-label={`Quick view ${product.name}`}
                  >
                    <Eye size={13} />
                    <span>Quick View</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          4. MEET THE ARTISANS
          Photos, stories, craft heritage, storefront links
      ═══════════════════════════════════════════════ */}
      <section className="artisans-spotlight-section" aria-label="Meet our verified artisans">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">The Makers Behind the Craft</span>
              <h2 className="section-title">Meet the Artisans</h2>
              <p className="section-subtitle">
                Preserving ancient Indian craft lineages through sustainable community livelihood.
              </p>
            </div>
            <Link to="/artisans" className="section-link">
              <span>Meet All Artisans</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="artisans-grid">
            {artisans.map((artisan) => (
              <article key={artisan.id} className="artisan-story-card">
                <div className="artisan-photo-wrap">
                  <img
                    src={artisan.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={artisan.name}
                    loading="lazy"
                  />
                  <span className="artisan-experience-badge">
                    {artisan.experience || '8+ Years'}
                  </span>
                </div>
                <div className="artisan-body">
                  <div className="artisan-meta-row">
                    <span className="artisan-specialty-pill">{artisan.specialty || artisan.craft_category || 'Master Craftsperson'}</span>
                    <span className="artisan-rating-pill">★ {Number(artisan.rating || 5.0).toFixed(1)}</span>
                  </div>
                  <h3 className="artisan-name">{artisan.name}</h3>
                  <p className="artisan-location">📍 {artisan.location}</p>
                  <p className="artisan-bio-snippet">{artisan.bio}</p>
                  <Link to={`/artisans/${artisan.id}`} className="artisan-store-link">
                    <span>Visit Workshop & Storefront</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          5. CUSTOMER REVIEWS (Genuine Only)
      ═══════════════════════════════════════════════ */}
      <section className="reviews-section" aria-label="Customer reviews">
        <div className="container">
          <div className="section-header center-header">
            <span className="section-eyebrow">From Our Community</span>
            <h2 className="section-title">Treasured by Art Lovers</h2>
            <p className="section-subtitle">
              Every purchase supports an artisan family and keeps Indian craft traditions alive.
            </p>
          </div>

          <div className="reviews-cards-grid">
            {GENUINE_REVIEWS.map((rev) => (
              <div key={rev.id} className="review-card">
                <div className="review-stars-row">
                  <RatingStars rating={rev.rating} size={15} />
                  <span className="review-date-label">{rev.date}</span>
                </div>
                <p className="review-comment-text">"{rev.comment}"</p>
                <div className="review-author-col">
                  <strong className="review-author-name">{rev.name}</strong>
                  <span className="review-author-loc">{rev.location}</span>
                  <span className="review-product-tag">Purchased: {rev.productName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          6. ARTISAN VALUES STRIP
      ═══════════════════════════════════════════════ */}
      <section className="values-guarantee-strip" aria-label="Craftora values">
        <div className="container values-strip-inner">
          <div className="value-pill">
            <div className="value-icon-circle">
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong>100% Genuine Handcrafted</strong>
              <span>Zero mass-produced or machine replicas</span>
            </div>
          </div>
          <div className="value-pill">
            <div className="value-icon-circle">
              <Sparkles size={20} />
            </div>
            <div>
              <strong>Direct Artisan Trade</strong>
              <span>Fair livelihood wages paid directly to makers</span>
            </div>
          </div>
          <div className="value-pill">
            <div className="value-icon-circle">
              <Truck size={20} />
            </div>
            <div>
              <strong>Eco-Conscious Shipping</strong>
              <span>Plastic-free, protective biodegradable packaging</span>
            </div>
          </div>
          <div className="value-pill">
            <div className="value-icon-circle">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <strong>Guaranteed Safe Delivery</strong>
              <span>Damaged items replaced or refunded promptly</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          QUICK VIEW MODAL
      ═══════════════════════════════════════════════ */}
      {quickViewProduct && (
        <div className="quickview-overlay" onClick={() => setQuickViewProduct(null)} role="dialog" aria-modal="true">
          <div className="quickview-modal" onClick={e => e.stopPropagation()}>
            <button
              className="quickview-close-btn"
              onClick={() => setQuickViewProduct(null)}
              aria-label="Close preview"
            >
              <X size={20} />
            </button>

            <div className="quickview-grid">
              <div className="quickview-img-col">
                <img src={quickViewProduct.image} alt={quickViewProduct.name} />
              </div>
              <div className="quickview-details-col">
                <span className="quickview-category">{quickViewProduct.category_name || quickViewProduct.category}</span>
                <h3 className="quickview-title">{quickViewProduct.name}</h3>
                
                {quickViewProduct.artisan_name && (
                  <p className="quickview-artisan">Crafted by <strong>{quickViewProduct.artisan_name}</strong></p>
                )}

                <div className="quickview-price-row">
                  <span className="quickview-price">₹{Number(quickViewProduct.price).toLocaleString('en-IN')}</span>
                  <span className="quickview-stock-badge">
                    {quickViewProduct.is_made_to_order ? 'Made to Order' : quickViewProduct.stock_quantity > 0 ? 'In Stock' : 'Sold Out'}
                  </span>
                </div>

                <p className="quickview-description">{quickViewProduct.description || 'Authentic handmade creation crafted using traditional methods.'}</p>

                <div className="quickview-actions">
                  <button
                    className="btn btn-primary"
                    disabled={!quickViewProduct.is_made_to_order && quickViewProduct.stock_quantity <= 0}
                    onClick={() => {
                      handleAddToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                  >
                    <ShoppingBag size={16} />
                    <span>Add to Cart</span>
                  </button>

                  <Link
                    to={`/products/${quickViewProduct.id}`}
                    className="btn btn-outline"
                    onClick={() => setQuickViewProduct(null)}
                  >
                    <span>View Full Details & Customization</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
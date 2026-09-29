import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShoppingBag, Eye, Heart, Zap, Check } from 'lucide-react';
import { initialCategories } from '../services/initialData';
import { initialAllProducts } from '../services/productsData';
import { getProducts, getCategories } from '../services/api';
import { useToast } from '../context/ToastContext';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';
import './Categories.css';

const CATEGORY_ICONS = {
  'Men': '👔',
  'Women': '👗',
  'Kids': '🧸',
  'Home & Living': '🏠',
  'Jewelry': '💍',
  'Gifts': '🎁',
  'Art & Crafts': '🎨',
  'Bags & Accessories': '👜',
};

/* ─── Color Swatch Component ─────────────────────────────────── */
function ColorSwatches({ colors, selectedIndex, onSelect }) {
  if (!colors || colors.length === 0) return null;
  return (
    <div className="cat-color-swatches" role="group" aria-label="Select color">
      {colors.slice(0, 6).map((color, i) => (
        <button
          key={i}
          className={`cat-color-dot ${selectedIndex === i ? 'active' : ''}`}
          style={{ backgroundColor: color.hex, borderColor: color.hex }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(i); }}
          title={color.label}
          aria-label={`Color: ${color.label}`}
          aria-pressed={selectedIndex === i}
        >
          {selectedIndex === i && (
            <Check size={8} color={isLightColor(color.hex) ? '#333' : '#fff'} strokeWidth={3} />
          )}
        </button>
      ))}
      {colors.length > 6 && (
        <span className="cat-color-more">+{colors.length - 6}</span>
      )}
    </div>
  );
}

function isLightColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

/* ─── Mini Product Card ──────────────────────────────────────── */
function MiniProductCard({ product, onAddToCart, wishlistIds, onToggleWishlist }) {
  const navigate = useNavigate();
  const {
    id, name, artisan_name, price, original_price,
    rating = 4.8, image, stock_quantity = 0,
    is_customizable = false, colors = [],
  } = product;

  const [selectedColor, setSelectedColor] = useState(0);

  const isOutOfStock = stock_quantity <= 0;
  const hasDiscount = original_price && original_price > price;
  const discountPercent = hasDiscount
    ? Math.round(((original_price - price) / original_price) * 100)
    : null;
  const isWishlisted = wishlistIds.includes(id);

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/checkout', {
      state: {
        buyNowItem: {
          cart_item_id: `buynow-${id}-${Date.now()}`,
          product_id: id,
          name, price, image,
          artisan_name, stock_quantity,
          quantity: 1,
          selected_color: colors[selectedColor]?.label || null,
          customization: null,
        },
      },
    });
  };

  return (
    <article className={`cat-product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      {/* Image */}
      <div className="cat-prod-img-wrap">
        <Link to={`/products/${id}`} tabIndex={-1}>
          <img
            src={image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'}
            alt={name}
            loading="lazy"
          />
        </Link>

        {/* Wishlist btn */}
        <button
          className={`cat-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onToggleWishlist(product); }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={15} fill={isWishlisted ? '#FF5E3A' : 'none'} color={isWishlisted ? '#FF5E3A' : 'currentColor'} />
        </button>

        {/* Badges */}
        <div className="cat-prod-badges">
          {hasDiscount && <span className="cat-badge-discount">-{discountPercent}%</span>}
          {is_customizable && <span className="cat-badge-custom"><Sparkles size={9} /> Custom</span>}
        </div>

        {isOutOfStock && <span className="cat-badge-stock out">Sold Out</span>}

        {/* Hover overlay */}
        <div className="cat-prod-hover">
          <Link to={`/products/${id}`} className="cat-view-btn">
            <Eye size={13} /> View Details
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="cat-prod-info">
        {artisan_name && <span className="cat-prod-artisan">by {artisan_name}</span>}
        <h3 className="cat-prod-name">
          <Link to={`/products/${id}`}>{name}</Link>
        </h3>

        {/* ── Color Swatches ── */}
        {colors.length > 0 && (
          <div className="cat-color-row">
            <ColorSwatches
              colors={colors}
              selectedIndex={selectedColor}
              onSelect={setSelectedColor}
            />
            <span className="cat-selected-color">{colors[selectedColor]?.label}</span>
          </div>
        )}

        <div className="cat-prod-rating">
          <RatingStars rating={rating} size={11} />
          <span>({Number(rating).toFixed(1)})</span>
        </div>
        <div className="cat-prod-price">
          <span className="cat-price-main">₹{Number(price).toLocaleString('en-IN')}</span>
          {hasDiscount && (
            <span className="cat-price-orig">₹{Number(original_price).toLocaleString('en-IN')}</span>
          )}
          {hasDiscount && (
            <span className="cat-price-save">{discountPercent}% off</span>
          )}
        </div>

        {/* Actions */}
        <div className="cat-prod-actions">
          <button
            className="cat-btn-cart"
            disabled={isOutOfStock}
            onClick={(e) => { e.preventDefault(); onAddToCart(product, colors[selectedColor]); }}
          >
            <ShoppingBag size={12} />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
          </button>
          <button
            className="cat-btn-buy"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
          >
            <Zap size={12} />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── Main Categories Page ───────────────────────────────────── */
export default function Categories() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState(initialCategories);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);

  const PREVIEW_COUNT = 4;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch categories
      try {
        const catRes = await getCategories();
        if (catRes.categories && catRes.categories.length > 0) {
          setCategories(catRes.categories.map((c, i) => ({
            ...initialCategories[i % initialCategories.length],
            ...c,
          })));
        }
      } catch {
        // keep initialCategories
      }

      // Fetch all products
      try {
        const prodRes = await getProducts({ limit: 200 });
        if (prodRes.products && prodRes.products.length > 0) {
          setAllProducts(prodRes.products);
        } else {
          setAllProducts(initialAllProducts);
        }
      } catch {
        setAllProducts(initialAllProducts);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  /* Fixed filter — use exact category match only */
  const getProductsForCategory = (catName) =>
    allProducts.filter((p) => p.category === catName);

  const handleAddToCart = (product, selectedColor) => {
    const colorLabel = selectedColor ? ` (${selectedColor.label})` : '';
    addToast(`Added "${product.name}"${colorLabel} to cart!`, 'success');
  };

  const handleToggleWishlist = (product) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        addToast(`Removed "${product.name}" from wishlist`, 'info');
        return prev.filter((id) => id !== product.id);
      } else {
        addToast(`Added "${product.name}" to wishlist!`, 'success');
        return [...prev, product.id];
      }
    });
  };

  if (loading) {
    return (
      <div className="categories-page">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6rem' }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="container">

        {/* ── Page Header ──────────────────────────────── */}
        <div className="categories-page-header">
          <span className="section-badge">Shop by Category</span>
          <h1 className="categories-page-title">Browse All Categories</h1>
          <p className="categories-page-subtitle">
            Discover {allProducts.length}+ authentic handmade products across {categories.length} curated categories,
            crafted by certified Indian artisans.
          </p>
        </div>

        {/* ── Category Overview Grid ───────────────────── */}
        <div className="categories-showcase-grid">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`#cat-${cat.id}`}
              className="category-showcase-card"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <div className="cat-showcase-img-wrap">
                <img src={cat.image} alt={`${cat.name} handmade products`} loading="lazy" />
                <div className="cat-showcase-overlay" />
                <span className="cat-emoji-badge">{CATEGORY_ICONS[cat.name] || '🛍️'}</span>
              </div>
              <div className="cat-showcase-body">
                <div className="cat-showcase-meta">
                  <span className="cat-item-count">
                    {getProductsForCategory(cat.name).length || cat.item_count}+ Products
                  </span>
                </div>
                <h2 className="cat-showcase-name">{cat.name}</h2>
                <p className="cat-showcase-desc">{cat.description}</p>
                {cat.subcategories && (
                  <div className="cat-subcategory-chips">
                    {cat.subcategories.slice(0, 3).map(sub => (
                      <span key={sub} className="cat-subchip">{sub}</span>
                    ))}
                    {cat.subcategories.length > 3 && (
                      <span className="cat-subchip cat-subchip-more">+{cat.subcategories.length - 3} more</span>
                    )}
                  </div>
                )}
                <div className="cat-explore-link">
                  <span>View Products</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Per-Category Product Sections ──────────── */}
        {categories.map((cat) => {
          const catProducts = getProductsForCategory(cat.name);
          const preview = catProducts.slice(0, PREVIEW_COUNT);
          if (catProducts.length === 0) return null;

          return (
            <section key={cat.id} id={`cat-${cat.id}`} className="cat-products-section">
              {/* Section Header */}
              <div className="cat-section-header">
                <div className="cat-section-title-wrap">
                  <span className="cat-section-icon">{CATEGORY_ICONS[cat.name] || '🛍️'}</span>
                  <div>
                    <h2 className="cat-section-title">{cat.name}</h2>
                    <p className="cat-section-subtitle">{cat.description}</p>
                  </div>
                </div>
                <Link
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="cat-view-all-btn"
                >
                  View All {catProducts.length} Products <ArrowRight size={14} />
                </Link>
              </div>

              {/* Products Grid */}
              <div className="cat-products-grid">
                {preview.map((product) => (
                  <MiniProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    wishlistIds={wishlistIds}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>

              {catProducts.length > PREVIEW_COUNT && (
                <div className="cat-show-more-wrap">
                  <Link
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="cat-show-more-link"
                  >
                    + {catProducts.length - PREVIEW_COUNT} more products in {cat.name}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </section>
          );
        })}

        {/* ── Customization CTA Banner ──────────────────── */}
        <div className="categories-promo-banner">
          <Sparkles size={22} />
          <div>
            <strong>Looking for something personalized?</strong>
            <span>All our products can be customized with your name, text, or colors.</span>
          </div>
          <Link to="/products?customizable=true" className="btn btn-primary" style={{ fontSize: '0.95rem' }}>
            Shop Customizable
          </Link>
        </div>
      </div>
    </div>
  );
}

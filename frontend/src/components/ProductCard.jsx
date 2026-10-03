import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Sparkles, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import RatingStars from './RatingStars';
import './ProductCard.css';

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false
}) {
  if (!product) return null;
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const {
    id,
    name,
    category,
    category_name,
    gender,
    artisan_name,
    price,
    original_price = null,
    rating = 4.8,
    image,
    stock_quantity = 0,
    is_customizable = false
  } = product;

  const isMadeToOrder = Boolean(product.is_made_to_order);
  const isOutOfStock = !isMadeToOrder && stock_quantity <= 0;
  const isLowStock = !isMadeToOrder && stock_quantity > 0 && stock_quantity <= 3;
  const hasDiscount = original_price && original_price > price;
  const discountPercent = hasDiscount
    ? Math.round(((original_price - price) / original_price) * 100)
    : null;

  const displayCategory = category || category_name || 'Handmade';

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Sync product into cart option
    if (onAddToCart) {
      await onAddToCart(product);
    } else if (addToCart) {
      await addToCart(product, 1);
    }

    // Navigate directly to checkout with this product
    navigate('/checkout', {
      state: {
        buyNowItem: {
          cart_item_id: `buynow-${id}-${Date.now()}`,
          product_id: id,
          name,
          price,
          image,
          category_name: displayCategory,
          artisan_name,
          stock_quantity: isMadeToOrder ? 999 : stock_quantity,
          is_made_to_order: isMadeToOrder,
          quantity: 1,
          customization: null
        }
      }
    });
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else if (addToCart) {
      addToCart(product, 1);
    }
  };

  return (
    <article className={`craftora-product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      {/* ─── IMAGE SECTION ─────────────────────────────── */}
      <div className="product-image-wrap">
        <Link to={`/products/${id}`} tabIndex={-1} aria-label={`View ${name}`}>
          <img
            src={image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'}
            alt={name}
            loading="lazy"
            className="product-card-img"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          className={`wishlist-icon-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onToggleWishlist) onToggleWishlist(product);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={isWishlisted ? '#EF4444' : 'none'} color={isWishlisted ? '#EF4444' : 'currentColor'} />
        </button>

        {/* Top Badges */}
        <div className="card-top-badges">
          {hasDiscount && (
            <span className="badge-discount" aria-label={`${discountPercent}% discount`}>
              -{discountPercent}%
            </span>
          )}
          {is_customizable && (
            <span className="badge-customizable" aria-label="Customizable product">
              <Sparkles size={10} /> Custom
            </span>
          )}
        </div>

        {/* Stock status pill */}
        {isMadeToOrder ? (
          <span className="badge-stock made-to-order" style={{ background: '#7c3aed', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', position: 'absolute', bottom: '8px', left: '8px' }}>Made to Order</span>
        ) : isOutOfStock ? (
          <span className="badge-stock out">Sold Out</span>
        ) : isLowStock ? (
          <span className="badge-stock low">Only {stock_quantity} left</span>
        ) : null}

        {/* Hover Quick View */}
        <div className="card-hover-actions">
          <Link to={`/products/${id}`} className="hover-action-btn" aria-label={`View details for ${name}`}>
            <Eye size={14} />
            {is_customizable ? 'Customize & View' : 'View Details'}
          </Link>
        </div>
      </div>

      {/* ─── PRODUCT INFO ───────────────────────────────── */}
      <div className="product-info-wrap">
        <div className="card-meta-row">
          <span className="card-category">{displayCategory}</span>
          {gender && gender !== 'Unisex' && (
            <span className="card-gender">{gender}</span>
          )}
        </div>

        {artisan_name && (
          <span className="card-artisan">by {artisan_name}</span>
        )}

        <h3 className="card-product-title">
          <Link to={`/products/${id}`} title={name}>
            {name}
          </Link>
        </h3>

        <div className="card-rating-row">
          <RatingStars rating={rating} size={12} />
          <span className="rating-num-label">({Number(rating).toFixed(1)})</span>
        </div>

        {/* Price row */}
        <div className="card-price-row">
          <div className="card-price-wrap">
            <span className="price-amount">₹{Number(price).toLocaleString('en-IN')}</span>
            {hasDiscount && (
              <span className="price-original">₹{Number(original_price).toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>

        {/* ─── DUAL ACTION BUTTONS ────────────────────── */}
        <div className="card-action-buttons">
          <button
            className="card-btn card-btn-cart"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            aria-label={isOutOfStock ? 'Out of stock' : `Add ${name} to cart`}
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
          >
            <ShoppingBag size={13} />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
          </button>

          <button
            className="card-btn card-btn-buynow"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            aria-label={`Buy ${name} now`}
            title={is_customizable ? 'Customize & buy now' : 'Buy now'}
          >
            <Zap size={13} />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </article>
  );
}
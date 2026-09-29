import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Wishlist.css';

export default function Wishlist() {
  const { wishlistItems, loading, removeItem } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleMoveToCart = (product) => {
    if (product.stock_quantity <= 0) {
      addToast(`"${product.name}" is currently out of stock`, 'error');
      return;
    }
    // Remove from wishlist & add to cart
    removeItem(product.id, product.name);
    addToast(`Moved "${product.name}" to shopping cart!`, 'success');
  };

  if (!isAuthenticated) {
    return (
      <div className="container wishlist-auth-guard">
        <div className="guard-card">
          <Heart size={48} className="guard-heart" />
          <h2>Your Wishlist Awaits</h2>
          <p>Please log in to your Craftora account to view and save your handcrafted favorites.</p>
          <Link to="/login" className="btn btn-primary">
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        {/* Header */}
        <div className="wishlist-header">
          <div>
            <span className="wishlist-badge">Saved Treasures</span>
            <h1 className="wishlist-title">My Wishlist</h1>
            <p className="wishlist-subtitle">
              Handcrafted artisan pieces you've saved to purchase or cherish.
            </p>
          </div>
          <span className="wishlist-counter-tag">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'Saved Item' : 'Saved Items'}
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner message="Fetching your saved artisan pieces from database..." />
        ) : wishlistItems.length === 0 ? (
          <div className="empty-wishlist-card">
            <div className="empty-heart-icon">🧶</div>
            <h3>Your Wishlist is Empty</h3>
            <p>Explore our master artisans and tap the heart icon to save products you love.</p>
            <Link to="/products" className="btn btn-primary">
              Explore Handcrafted Catalog <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => {
              const isOut = item.stock_quantity <= 0;
              return (
                <div key={item.id} className={`wishlist-item-card ${isOut ? 'out-of-stock' : ''}`}>
                  <div className="wishlist-img-box">
                    <img src={item.image} alt={item.name} />
                    {isOut && <span className="wishlist-stock-tag">Out of Stock</span>}
                  </div>

                  <div className="wishlist-item-body">
                    <div className="wishlist-meta-row">
                      <span className="wishlist-cat">{item.category_name}</span>
                      {item.artisan_name && (
                        <span className="wishlist-artisan">by {item.artisan_name}</span>
                      )}
                    </div>

                    <h3 className="wishlist-item-title">
                      <Link to={`/products/${item.id}`}>{item.name}</Link>
                    </h3>

                    <div className="wishlist-rating-row">
                      <RatingStars rating={item.rating || 5.0} size={14} />
                    </div>

                    <div className="wishlist-price-row">
                      <span className="wishlist-currency">₹</span>
                      <span className="wishlist-price">{Number(item.price).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="wishlist-actions-footer">
                      <button 
                        className="btn btn-primary wishlist-cart-btn"
                        disabled={isOut}
                        onClick={() => handleMoveToCart(item)}
                      >
                        <ShoppingBag size={16} />
                        <span>{isOut ? 'Sold Out' : 'Move to Cart'}</span>
                      </button>

                      <button 
                        className="wishlist-delete-btn"
                        onClick={() => removeItem(item.id, item.name)}
                        title="Remove from wishlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
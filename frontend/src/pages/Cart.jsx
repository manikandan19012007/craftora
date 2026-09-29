import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck, AlertCircle, Sparkles } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

export default function Cart() {
  const { cartItems, subtotal, shippingFee, grandTotal, loading, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="cart-page">
      <div className="container">
        {/* Header */}
        <div className="cart-header">
          <div>
            <span className="cart-badge">Direct From Artisan Workshops</span>
            <h1 className="cart-title">Your Shopping Bag</h1>
            <p className="cart-subtitle">Review your handcrafted creations and personalized treasures before order placement.</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Calculating cart subtotals and custom items..." />
        ) : cartItems.length === 0 ? (
          <div className="empty-cart-card">
            <div className="empty-cart-icon">🛍️</div>
            <h3>Your Shopping Bag is Empty</h3>
            <p>You haven't added any handcrafted items or personalized gifts yet.</p>
            <Link to="/products" className="btn btn-primary">
              Discover Handmade Crafts <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="cart-layout-grid">
            {/* 1. CART ITEMS LIST */}
            <div className="cart-items-table-wrap">
              <div className="cart-table-header">
                <span className="col-product">Handcrafted Product</span>
                <span className="col-price">Unit Price</span>
                <span className="col-qty">Quantity</span>
                <span className="col-total">Subtotal</span>
                <span className="col-action"></span>
              </div>

              <div className="cart-items-list">
                {cartItems.map((item) => {
                  const custFee = Number(item.customization_fee || 0);
                  const basePrice = Number(item.price || 0);
                  const effectiveUnitPrice = basePrice + custFee;
                  const itemRowTotal = effectiveUnitPrice * item.quantity;
                  const maxQty = item.is_made_to_order ? 99 : (item.stock_quantity || 10);

                  return (
                    <div key={item.cart_item_id || item.id} className="cart-item-row">
                      {/* Image & Product Info */}
                      <div className="col-product item-product-info">
                        <img src={item.image} alt={item.name} className="cart-item-img" />
                        <div className="item-meta-col">
                          <span className="cart-item-cat">{item.category_name}</span>
                          <h4 className="cart-item-name">
                            <Link to={`/products/${item.product_id}`}>{item.name}</Link>
                          </h4>
                          {item.artisan_name && (
                            <span className="cart-item-artisan">Crafted by {item.artisan_name}</span>
                          )}

                          {/* VARIANT & CUSTOMIZATION DISPLAY */}
                          <div className="cart-customization-pill" style={{ background: '#FAF5EE', padding: '6px 10px', borderRadius: '6px', marginTop: '6px', fontSize: '0.82rem' }}>
                            <div className="custom-specs" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {item.selected_color && (
                                <span><strong>Color:</strong> {item.selected_color}</span>
                              )}
                              {item.selected_size && (
                                <span><strong>Size:</strong> {item.selected_size}</span>
                              )}
                              {item.selected_material && (
                                <span><strong>Material:</strong> {item.selected_material}</span>
                              )}
                              {item.custom_text && (
                                <span style={{ color: '#B86F52' }}><Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /><strong>Text:</strong> "{item.custom_text}"</span>
                              )}
                              {custFee > 0 && (
                                <span style={{ fontStyle: 'italic', color: '#666' }}>Customization Charge: +₹{custFee}</span>
                              )}
                            </div>
                          </div>

                          <div className="stock-info-label" style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                            {item.is_made_to_order ? (
                              <span style={{ color: '#7c3aed', fontWeight: 500 }}>Made to Order</span>
                            ) : (
                              <span style={{ color: '#16a34a' }}>Available Stock: {item.stock_quantity}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="col-price item-unit-price">
                        <span>₹{effectiveUnitPrice.toLocaleString('en-IN')}</span>
                      </div>

                      {/* Quantity Selector */}
                      <div className="col-qty item-qty-control">
                        <div className="qty-picker-small">
                          <button
                            onClick={() => updateQuantity(item.cart_item_id || item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cart_item_id || item.id, item.quantity + 1)}
                            disabled={item.quantity >= maxQty}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="col-total item-total-price">
                        <span>₹{itemRowTotal.toLocaleString('en-IN')}</span>
                      </div>

                      {/* Remove Action */}
                      <div className="col-action">
                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item.cart_item_id || item.id, item.name)}
                          title="Remove from cart"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. ORDER SUMMARY */}
            <div className="cart-summary-col">
              <div className="cart-summary-card">
                <h3>Order Summary</h3>

                <div className="summary-line">
                  <span>Bag Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="summary-line">
                  <span>Artisan Shipping & Handling</span>
                  <span>{shippingFee === 0 ? <strong className="free-shipping">FREE</strong> : `₹${shippingFee}`}</span>
                </div>

                {shippingFee > 0 && (
                  <p className="shipping-upsell-hint">
                    Add ₹{(1000 - subtotal).toLocaleString('en-IN')} more to unlock <strong>FREE Shipping</strong> across India!
                  </p>
                )}

                <div className="summary-line grand-total">
                  <span>Estimated Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                <Link to="/checkout" className="btn btn-primary checkout-btn-full">
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </Link>

                <div className="summary-trust-badges">
                  <div className="trust-item">
                    <ShieldCheck size={16} />
                    <span>Fair-trade artisan verified guarantee</span>
                  </div>
                  <div className="trust-item">
                    <Truck size={16} />
                    <span>Direct dispatch from regional Indian studios</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
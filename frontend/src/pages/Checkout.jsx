import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, AlertCircle, Info, Lock, Sparkles, Plus, CreditCard, QrCode, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createOrderApi, getUserAddresses, createAddress } from '../services/api';
import './Checkout.css';

export default function Checkout() {
  const { cartItems, subtotal, shippingFee, grandTotal, reloadCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Buy Now flow: item passed via navigation state
  const buyNowItem = location.state?.buyNowItem || null;
  const isBuyNow = Boolean(buyNowItem);

  // Determine which items to show and compute totals
  const displayItems = isBuyNow ? [buyNowItem] : cartItems;
  const displaySubtotal = displayItems.reduce((acc, item) => {
    const unitPrice = Number(item.price || 0) + Number(item.customization_fee || 0);
    return acc + (unitPrice * item.quantity);
  }, 0);
  const displayShipping = displaySubtotal >= 1000 ? 0 : 99;
  const displayTotal = displaySubtotal + displayShipping;

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');

  // Address Form State
  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    phone: '',
    house_street: '',
    area_city: '',
    state: '',
    pincode: '',
    delivery_instructions: '',
    save_address: true
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'cod'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch saved addresses on mount
  useEffect(() => {
    if (isAuthenticated) {
      getUserAddresses()
        .then(res => {
          if (res.addresses && res.addresses.length > 0) {
            setSavedAddresses(res.addresses);
            const def = res.addresses.find(a => a.is_default) || res.addresses[0];
            setSelectedAddressId(def.id);
            setFormData({
              full_name: def.full_name,
              phone: def.phone,
              house_street: def.house_street,
              area_city: def.area_city,
              state: def.state,
              pincode: def.pincode,
              delivery_instructions: def.delivery_instructions || '',
              save_address: false
            });
          }
        })
        .catch(err => console.warn("Saved addresses notice:", err));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container checkout-guard">
        <div className="guard-card">
          <Lock size={48} className="guard-icon" />
          <h2>Authentication Required</h2>
          <p>Please log in to complete your artisan order checkout.</p>
          <Link to="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (!isBuyNow && cartItems.length === 0) {
    return (
      <div className="container checkout-guard">
        <div className="guard-card">
          <AlertCircle size={48} className="guard-icon" />
          <h2>Your Cart is Empty</h2>
          <p>Please add handcrafted artisan items before checking out.</p>
          <Link to="/products" className="btn btn-primary">Browse Catalog</Link>
        </div>
      </div>
    );
  }

  const handleAddressSelect = (addrId) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setFormData({
        full_name: user?.name || '',
        phone: '',
        house_street: '',
        area_city: '',
        state: '',
        pincode: '',
        delivery_instructions: '',
        save_address: true
      });
    } else {
      const addr = savedAddresses.find(a => a.id === addrId);
      if (addr) {
        setFormData({
          full_name: addr.full_name,
          phone: addr.phone,
          house_street: addr.house_street,
          area_city: addr.area_city,
          state: addr.state,
          pincode: addr.pincode,
          delivery_instructions: addr.delivery_instructions || '',
          save_address: false
        });
      }
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!formData.full_name.trim() || !formData.phone.trim() || !formData.house_street.trim() || !formData.area_city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
      setErrorMsg('Please fill in all required delivery address fields (Full Name, Phone, Street Address, City, State, PIN Code).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const phoneClean = formData.phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(phoneClean)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const pincodeClean = formData.pincode.trim();
    if (!/^\d{6}$/.test(pincodeClean)) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      // Save address if requested and new
      if (selectedAddressId === 'new' && formData.save_address) {
        try {
          await createAddress({
            full_name: formData.full_name,
            phone: phoneClean,
            house_street: formData.house_street,
            area_city: formData.area_city,
            state: formData.state,
            pincode: pincodeClean,
            delivery_instructions: formData.delivery_instructions
          });
        } catch (addrErr) {}
      }

      const paymentDetailsObj = {};
      if (paymentMethod === 'upi') {
        paymentDetailsObj.upi_id = upiId.trim() || 'patron@upi';
        paymentDetailsObj.upi_app = 'UPI App';
      } else if (paymentMethod === 'card') {
        paymentDetailsObj.card_number = cardNumber.trim() || '4111222233334444';
        paymentDetailsObj.card_network = 'Visa/Mastercard';
      }

      const orderPayload = {
        full_name: formData.full_name,
        phone: phoneClean,
        house_street: formData.house_street,
        shipping_address: formData.house_street,
        area_city: formData.area_city,
        city: formData.area_city,
        state: formData.state,
        pincode: pincodeClean,
        delivery_instructions: formData.delivery_instructions,
        payment_method: paymentMethod,
        payment_service: 'demo',
        payment_details: paymentDetailsObj,
        transaction_id: `DEMO-TXN-${Date.now()}`,
        ...(isBuyNow ? { buy_now_item: buyNowItem } : {})
      };

      const res = await createOrderApi(orderPayload);
      addToast(res.message || 'Order placed successfully! Your order code is ' + (res.order_code || 'ORD'), 'success');
      
      // Reload cart context to sync state after order placement
      await reloadCart();
      
      // Direct navigation to user's Orders page
      navigate('/orders');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process order. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className="checkout-breadcrumbs">
          <Link to="/cart" className="back-to-cart-link">
            <ArrowLeft size={16} />
            <span>Return to Cart</span>
          </Link>
        </div>

        <div className="checkout-title-wrap">
          <span className="checkout-badge">Direct Artisan Checkout</span>
          <h1 className="checkout-heading">Complete Your Order</h1>
          <p className="checkout-sub">Enter shipping address and select payment method for your handcrafted treasures.</p>
        </div>

        {errorMsg && (
          <div className="checkout-error-banner" role="alert" style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="checkout-grid-layout">
          {/* 1. DELIVERY INFORMATION FORM & PAYMENT */}
          <div className="checkout-form-container">
            {/* SAVED ADDRESS SELECTOR */}
            {savedAddresses.length > 0 && (
              <div className="saved-addresses-block" style={{ marginBottom: '24px', background: '#FDFBF7', padding: '16px', borderRadius: '12px', border: '1px solid #E6D7C3' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#4A2C24' }}>Select Delivery Address</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleAddressSelect(addr.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: selectedAddressId === addr.id ? '2px solid #B86F52' : '1px solid #ddd',
                        background: selectedAddressId === addr.id ? '#FFF8F5' : '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{addr.full_name}</strong>
                      <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#555' }}>{addr.house_street}, {addr.area_city}, {addr.state} - {addr.pincode}</p>
                      <span style={{ fontSize: '0.78rem', color: '#888' }}>📞 {addr.phone}</span>
                    </div>
                  ))}
                  <div
                    onClick={() => handleAddressSelect('new')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: selectedAddressId === 'new' ? '2px solid #B86F52' : '1px dashed #bbb',
                      background: selectedAddressId === 'new' ? '#FFF8F5' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      color: '#B86F52',
                      fontWeight: 600,
                      fontSize: '0.88rem'
                    }}
                  >
                    <Plus size={16} /> Enter New Address
                  </div>
                </div>
              </div>
            )}

            <div className="form-card-header">
              <Truck size={22} className="card-icon" />
              <div>
                <h3>Delivery Address Details</h3>
                <p>Where should our independent artisans ship your parcel?</p>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="checkout-form">
              <div className="form-two-cols">
                <div className="form-row">
                  <label htmlFor="full_name">Recipient Full Name *</label>
                  <input
                    id="full_name"
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Ananya Sharma"
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="phone">Mobile Number (10 digits) *</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              <div className="form-row full-width">
                <label htmlFor="house_street">House No., Building, Street Address *</label>
                <textarea
                  id="house_street"
                  name="house_street"
                  rows="2"
                  value={formData.house_street}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Flat 302, Heritage Craft Apartments, MG Road"
                />
              </div>

              <div className="form-two-cols">
                <div className="form-row">
                  <label htmlFor="area_city">Area / City *</label>
                  <input
                    id="area_city"
                    type="text"
                    name="area_city"
                    value={formData.area_city}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Jaipur"
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="state">State *</label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Rajasthan"
                  />
                </div>
              </div>

              <div className="form-two-cols">
                <div className="form-row">
                  <label htmlFor="pincode">PIN Code (6 digits) *</label>
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 302001"
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="delivery_instructions">Delivery Instructions (Optional)</label>
                  <input
                    id="delivery_instructions"
                    type="text"
                    name="delivery_instructions"
                    value={formData.delivery_instructions}
                    onChange={handleChange}
                    placeholder="e.g. Leave with gate security"
                  />
                </div>
              </div>

              {selectedAddressId === 'new' && (
                <div className="form-row full-width" style={{ marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="save_address"
                      checked={formData.save_address}
                      onChange={handleChange}
                    />
                    <span>Save this address for future orders</span>
                  </label>
                </div>
              )}

              {/* ==================================================== */}
              {/* PAYMENT SELECTION SECTION                            */}
              {/* ==================================================== */}
              <div className="payment-options-section" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <h3 style={{ marginBottom: '16px', color: '#2C1810', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={20} color="#B86F52" /> Select Payment Method
                </h3>

                {/* DEMO PAYMENT MODE NOTICE */}
                <div className="demo-payment-banner" style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', fontWeight: 600 }}>
                    <Info size={18} /> DEMO PAYMENT MODE
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#B45309' }}>
                    This application operates in simulated payment mode for project demonstration. No real financial transaction or debit will occur.
                  </p>
                </div>

                <div className="payment-tabs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: paymentMethod === 'upi' ? '2px solid #B86F52' : '1px solid #ccc',
                      background: paymentMethod === 'upi' ? '#FFF8F5' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <QrCode size={24} color={paymentMethod === 'upi' ? '#B86F52' : '#666'} />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: paymentMethod === 'card' ? '2px solid #B86F52' : '1px solid #ccc',
                      background: paymentMethod === 'card' ? '#FFF8F5' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CreditCard size={24} color={paymentMethod === 'card' ? '#B86F52' : '#666'} />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Card Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: paymentMethod === 'cod' ? '2px solid #B86F52' : '1px solid #ccc',
                      background: paymentMethod === 'cod' ? '#FFF8F5' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Banknote size={24} color={paymentMethod === 'cod' ? '#B86F52' : '#666'} />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Cash on Delivery</span>
                  </button>
                </div>

                {/* Sub-inputs for UPI */}
                {paymentMethod === 'upi' && (
                  <div className="upi-details-box" style={{ background: '#F9FAFB', padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>UPI ID (e.g. mobile@upi / gpay / paytm)</label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: '#6B7280' }}>
                      ⚡ Simulated Instant UPI Verification supported (Google Pay, PhonePe, Paytm).
                    </p>
                  </div>
                )}

                {/* Sub-inputs for Card */}
                {paymentMethod === 'card' && (
                  <div className="card-details-box" style={{ background: '#F9FAFB', padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Demo Card Number (Any 16 digits)</label>
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '8px' }}
                    />
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#6B7280' }}>
                      🔒 Zero real card numbers or CVVs are recorded or saved.
                    </p>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary place-order-submit-btn" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: '20px' }}>
                <CheckCircle2 size={20} />
                <span>{loading ? 'Confirming & Creating Order...' : `Pay & Place Order (₹${Number(displayTotal).toLocaleString('en-IN')})`}</span>
              </button>
            </form>
          </div>

          {/* 2. ORDER SUMMARY SIDEBAR */}
          <div className="checkout-summary-container">
            <div className="checkout-summary-card">
              {isBuyNow && (
                <div className="buy-now-mode-badge" style={{ background: '#7c3aed', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                  <Sparkles size={13} /> Buy Now Item
                </div>
              )}
              <h3>Order Summary ({displayItems.length} {displayItems.length === 1 ? 'item' : 'items'})</h3>

              <div className="checkout-items-preview">
                {displayItems.map((item) => {
                  const custFee = Number(item.customization_fee || 0);
                  const basePrice = Number(item.price || 0);
                  const effectiveUnitPrice = basePrice + custFee;

                  return (
                    <div key={item.cart_item_id || item.id} className="preview-item-row" style={{ display: 'flex', gap: '10px', margin: '12px 0' }}>
                      <img src={item.image} alt={item.name} className="preview-item-img" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                      <div className="preview-item-info" style={{ flex: 1 }}>
                        <span className="preview-item-name" style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>{item.name}</span>
                        <span className="preview-item-qty" style={{ fontSize: '0.8rem', color: '#666' }}>
                          Qty: {item.quantity} × ₹{effectiveUnitPrice.toLocaleString('en-IN')}
                        </span>
                        
                        {/* Show customization details */}
                        {(item.selected_color || item.selected_size || item.custom_text) && (
                          <div className="preview-item-custom" style={{ fontSize: '0.78rem', color: '#854d0e', background: '#fef9c3', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>
                            {item.selected_color && <span>Color: {item.selected_color} </span>}
                            {item.selected_size && <span>Size: {item.selected_size} </span>}
                            {item.custom_text && <span>"{item.custom_text}"</span>}
                          </div>
                        )}
                      </div>
                      <strong className="preview-item-total" style={{ fontSize: '0.9rem' }}>₹{(effectiveUnitPrice * item.quantity).toLocaleString('en-IN')}</strong>
                    </div>
                  );
                })}
              </div>

              <div className="summary-divider" style={{ borderTop: '1px solid #eee', margin: '12px 0' }} />

              <div className="calc-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0' }}>
                <span>Subtotal</span>
                <span>₹{Number(displaySubtotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="calc-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0' }}>
                <span>Shipping Fee</span>
                <span>{displayShipping === 0 ? <strong className="free-tag" style={{ color: '#16a34a' }}>FREE</strong> : `₹${displayShipping}`}</span>
              </div>

              <div className="summary-divider" style={{ borderTop: '1px solid #eee', margin: '12px 0' }} />

              <div className="calc-row grand-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', fontSize: '1.1rem', fontWeight: 700 }}>
                <span>Final Amount</span>
                <strong className="grand-val" style={{ color: '#B86F52' }}>₹{Number(displayTotal).toLocaleString('en-IN')}</strong>
              </div>

              <div className="checkout-guarantees" style={{ marginTop: '16px', fontSize: '0.82rem', color: '#666' }}>
                <div className="guarantee-point" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#B86F52" />
                  <span>Fair-trade direct artisan payment guarantee.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
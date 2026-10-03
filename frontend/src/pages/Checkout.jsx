import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Sparkles, 
  Plus, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Package, 
  Check, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createOrderApi, getUserAddresses, createAddress } from '../services/api';
import './Checkout.css';

const STEPS = [
  { id: 1, key: 'cart', label: 'Cart' },
  { id: 2, key: 'address', label: 'Address' },
  { id: 3, key: 'payment', label: 'Payment' },
  { id: 4, key: 'confirmation', label: 'Confirmation' }
];

export default function Checkout() {
  const { cartItems, subtotal, shippingFee, grandTotal, reloadCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Buy Now flow: item passed via navigation state
  const buyNowItem = location.state?.buyNowItem || null;
  const isBuyNow = Boolean(buyNowItem);

  // Active step: 1 (Cart), 2 (Address), 3 (Payment), 4 (Confirmation)
  const [currentStep, setCurrentStep] = useState(1);
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  // Determine items and totals
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
          <h2>Sign In to Proceed to Checkout</h2>
          <p>Please log in with your registered Craftora account to complete your artisan order.</p>
          <Link to="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (!isBuyNow && cartItems.length === 0 && currentStep !== 4) {
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

  // Step 2 Validation before moving to Payment
  const validateAddressStep = () => {
    setErrorMsg('');
    const { full_name, phone, house_street, area_city, state, pincode } = formData;
    if (!full_name.trim() || !phone.trim() || !house_street.trim() || !area_city.trim() || !state.trim() || !pincode.trim()) {
      setErrorMsg('Please fill in all required shipping address fields.');
      return false;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (starts with 6-9).');
      return false;
    }
    const cleanPincode = pincode.replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN Code.');
      return false;
    }
    return true;
  };

  // Place Order (Triggered on Step 3 Payment)
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateAddressStep()) {
      setCurrentStep(2);
      return;
    }

    if (paymentMethod === 'upi' && upiId.trim() && !upiId.includes('@')) {
      setErrorMsg('Please enter a valid UPI ID (e.g. yourname@upi).');
      return;
    }

    setLoading(true);

    try {
      const phoneClean = formData.phone.replace(/\D/g, '');
      const pincodeClean = formData.pincode.replace(/\D/g, '');

      // Optional: Save address to database
      if (formData.save_address && selectedAddressId === 'new') {
        try {
          await createAddress({
            full_name: formData.full_name,
            phone: phoneClean,
            house_street: formData.house_street,
            area_city: formData.area_city,
            state: formData.state,
            pincode: pincodeClean,
            delivery_instructions: formData.delivery_instructions || ''
          });
        } catch (addrErr) {}
      }

      const paymentDetailsObj = {};
      if (paymentMethod === 'upi') {
        paymentDetailsObj.upi_id = upiId.trim() || 'demo@upi';
        paymentDetailsObj.upi_app = 'Simulated UPI Gateway';
      } else if (paymentMethod === 'card') {
        paymentDetailsObj.card_number = cardNumber.trim() || '4111222233334444';
        paymentDetailsObj.card_network = 'Demo Visa/Mastercard';
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
      
      // Sync local cart
      await reloadCart();

      // Transition to Step 4: Confirmation screen
      setOrderConfirmation({
        order_id: res.order_id,
        order_code: res.order_code || `ORD-${res.order_id}`,
        total_amount: res.total_amount || displayTotal,
        order_status: res.order_status || 'Confirmed',
        payment_status: res.payment_status || (paymentMethod === 'cod' ? 'Pending COD' : 'Verified (Demo)'),
        payment_method: paymentMethod.toUpperCase(),
        transaction_id: res.transaction_id,
        recipient_name: formData.full_name,
        shipping_address: `${formData.house_street}, ${formData.area_city}, ${formData.state} - ${pincodeClean}`,
        phone: phoneClean,
        items: [...displayItems]
      });

      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });

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
        {currentStep < 4 && (
          <div className="checkout-breadcrumbs">
            <Link to="/cart" className="back-to-cart-link">
              <ArrowLeft size={16} />
              <span>Return to Shopping Bag</span>
            </Link>
          </div>
        )}

        {/* ─── MULTI-STEP PROGRESS BAR: (Cart) (Address) (Payment) (Confirmation) ─── */}
        <div className="checkout-steps-bar" role="navigation" aria-label="Checkout steps">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <div className={`step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <div className="step-circle">
                    {isCompleted ? <Check size={14} /> : step.id}
                  </div>
                  <span className="step-label">{step.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`step-connector ${currentStep > step.id ? 'active' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {errorMsg && (
          <div className="checkout-error-banner" role="alert">
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 4: CONFIRMATION SCREEN
        ═══════════════════════════════════════════════ */}
        {currentStep === 4 && orderConfirmation && (
          <div className="confirmation-card">
            <div className="confirmation-header">
              <div className="success-icon-badge">
                <CheckCircle2 size={42} />
              </div>
              <span className="conf-eyebrow">Thank You for Supporting Master Artisans</span>
              <h1 className="conf-title">Your Order is Confirmed!</h1>
              <p className="conf-code-banner">
                Order Reference: <strong>{orderConfirmation.order_code}</strong>
              </p>
              <p className="conf-desc">
                We have notified our artisan workshop. Your handcrafted items will be lovingly prepared and dispatched with eco-conscious protective packaging.
              </p>
            </div>

            <div className="conf-details-grid">
              {/* Order Status & Payment Meta */}
              <div className="conf-meta-box">
                <h4>Order Summary</h4>
                <div className="meta-row">
                  <span>Order Status</span>
                  <span className="conf-status-pill">{orderConfirmation.order_status}</span>
                </div>
                <div className="meta-row">
                  <span>Payment Method</span>
                  <strong>{orderConfirmation.payment_method}</strong>
                </div>
                <div className="meta-row">
                  <span>Payment Status</span>
                  <span className="conf-payment-pill">{orderConfirmation.payment_status}</span>
                </div>
                <div className="meta-row">
                  <span>Total Amount</span>
                  <strong className="conf-total">₹{Number(orderConfirmation.total_amount).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="conf-meta-box">
                <h4>Delivery Address</h4>
                <div className="address-display">
                  <strong>{orderConfirmation.recipient_name}</strong>
                  <p>{orderConfirmation.shipping_address}</p>
                  <span>📞 {orderConfirmation.phone}</span>
                </div>
                <div className="conf-shipping-estimate">
                  <Clock size={16} />
                  <span>Estimated dispatch in 2–4 business days.</span>
                </div>
              </div>
            </div>

            {/* Items Purchased with Customizations */}
            <div className="conf-items-section">
              <h4>Ordered Creations ({orderConfirmation.items.length})</h4>
              <div className="conf-items-list">
                {orderConfirmation.items.map((it, idx) => (
                  <div key={idx} className="conf-item-row">
                    <img src={it.image} alt={it.name} className="conf-item-thumb" />
                    <div className="conf-item-info">
                      <strong className="conf-item-name">{it.name}</strong>
                      <span className="conf-item-artisan">by {it.artisan_name || 'Master Artisan'}</span>
                      
                      {/* Variants & Custom text */}
                      {(it.selected_color || it.selected_size || it.custom_text) && (
                        <div className="conf-item-variants">
                          {it.selected_color && <span>Color: {it.selected_color}</span>}
                          {it.selected_size && <span>Size: {it.selected_size}</span>}
                          {it.custom_text && <span>Personalized: "{it.custom_text}"</span>}
                        </div>
                      )}
                    </div>
                    <div className="conf-item-total">
                      <span>Qty: {it.quantity}</span>
                      <strong>₹{Number((Number(it.price) + Number(it.customization_fee || 0)) * it.quantity).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps CTA */}
            <div className="conf-actions-row">
              <Link to="/orders" className="btn btn-primary conf-track-btn">
                <Package size={18} />
                <span>Track Order in My Orders</span>
              </Link>
              <Link to="/products" className="btn btn-outline conf-shop-btn">
                <span>Explore More Crafts</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEPS 1, 2, 3: CHECKOUT WORKFLOW
        ═══════════════════════════════════════════════ */}
        {currentStep < 4 && (
          <div className="checkout-grid-layout">
            
            {/* LEFT: STEP CONTENT */}
            <div className="checkout-main-col">
              
              {/* ──────────────────────────────────────────
                  STEP 1: REVIEW CART ITEMS
              ────────────────────────────────────────── */}
              {currentStep === 1 && (
                <div className="checkout-step-card">
                  <div className="step-card-header">
                    <Package size={22} className="card-icon" />
                    <div>
                      <h3>Step 1: Review Your Items & Customization</h3>
                      <p>Check selected variants, personalization engravings, and quantities.</p>
                    </div>
                  </div>

                  <div className="step-items-list">
                    {displayItems.map((item) => {
                      const custFee = Number(item.customization_fee || 0);
                      const basePrice = Number(item.price || 0);
                      const unitPrice = basePrice + custFee;

                      return (
                        <div key={item.cart_item_id || item.id} className="step-item-card">
                          <img src={item.image} alt={item.name} className="step-item-img" />
                          <div className="step-item-details">
                            <span className="step-item-cat">{item.category_name}</span>
                            <h4 className="step-item-title">{item.name}</h4>
                            {item.artisan_name && (
                              <span className="step-item-artisan">Crafted by {item.artisan_name}</span>
                            )}

                            {/* Chosen Variants */}
                            <div className="step-variants-pill">
                              {item.selected_color && <span><strong>Color:</strong> {item.selected_color}</span>}
                              {item.selected_size && <span><strong>Size:</strong> {item.selected_size}</span>}
                              {item.selected_material && <span><strong>Material:</strong> {item.selected_material}</span>}
                              {item.custom_text && (
                                <span className="custom-text-highlight">
                                  <Sparkles size={12} />
                                  <strong>Custom:</strong> "{item.custom_text}"
                                </span>
                              )}
                              {custFee > 0 && <span className="cust-fee">(+₹{custFee} customization)</span>}
                            </div>
                          </div>

                          <div className="step-item-pricing">
                            <span className="step-item-qty">Qty: {item.quantity}</span>
                            <strong className="step-item-amount">₹{(unitPrice * item.quantity).toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="step-action-bar">
                    <button 
                      type="button" 
                      className="btn btn-primary step-next-btn"
                      onClick={() => setCurrentStep(2)}
                    >
                      <span>Proceed to Delivery Address</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────
                  STEP 2: DELIVERY ADDRESS
              ────────────────────────────────────────── */}
              {currentStep === 2 && (
                <div className="checkout-step-card">
                  <div className="step-card-header">
                    <MapPin size={22} className="card-icon" />
                    <div>
                      <h3>Step 2: Shipping & Delivery Details</h3>
                      <p>Where should our independent artisans ship your parcel?</p>
                    </div>
                  </div>

                  {/* Saved Address Selector */}
                  {savedAddresses.length > 0 && (
                    <div className="saved-addresses-block">
                      <h4>Saved Delivery Addresses</h4>
                      <div className="saved-addr-grid">
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`saved-addr-card ${selectedAddressId === addr.id ? 'active' : ''}`}
                            onClick={() => handleAddressSelect(addr.id)}
                          >
                            <strong>{addr.full_name}</strong>
                            <p>{addr.house_street}, {addr.area_city}, {addr.state} - {addr.pincode}</p>
                            <span>📞 {addr.phone}</span>
                          </div>
                        ))}
                        <div
                          className={`saved-addr-card new-addr ${selectedAddressId === 'new' ? 'active' : ''}`}
                          onClick={() => handleAddressSelect('new')}
                        >
                          <Plus size={16} />
                          <span>Enter New Address</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="checkout-form-fields">
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
                      <label htmlFor="house_street">Flat / House No., Building, Street Address *</label>
                      <textarea
                        id="house_street"
                        name="house_street"
                        rows="2"
                        value={formData.house_street}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Flat 302, Craftora Heritage Apartments, MG Road"
                      />
                    </div>

                    <div className="form-two-cols">
                      <div className="form-row">
                        <label htmlFor="area_city">City / Area *</label>
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
                        <label htmlFor="state">State / Region *</label>
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
                        <label htmlFor="pincode">6-digit PIN Code *</label>
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
                        <label htmlFor="delivery_instructions">Special Delivery Instructions (Optional)</label>
                        <input
                          id="delivery_instructions"
                          type="text"
                          name="delivery_instructions"
                          value={formData.delivery_instructions}
                          onChange={handleChange}
                          placeholder="e.g. Leave with security / Ring bell twice"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="step-action-bar flex-between">
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft size={16} />
                      <span>Back to Review</span>
                    </button>

                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => {
                        if (validateAddressStep()) setCurrentStep(3);
                      }}
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────
                  STEP 3: PAYMENT METHOD
              ────────────────────────────────────────── */}
              {currentStep === 3 && (
                <div className="checkout-step-card">
                  <div className="step-card-header">
                    <CreditCard size={22} className="card-icon" />
                    <div>
                      <h3>Step 3: Select Payment Option</h3>
                      <p>Complete your payment securely. Verified artisan escrow gateway.</p>
                    </div>
                  </div>

                  {/* College Demo Mode Notice */}
                  <div className="demo-gateway-banner">
                    <Sparkles size={18} className="demo-icon" />
                    <div>
                      <strong>Demonstration Payment Gateway</strong>
                      <p>Simulated instant verification is enabled. No real charges or credentials are processed.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitOrder} className="payment-options-form">
                    <div className="payment-methods-grid">
                      
                      {/* UPI Option */}
                      <label className={`payment-method-card ${paymentMethod === 'upi' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="upi"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                        />
                        <div className="method-info">
                          <div className="method-title-row">
                            <QrCode size={18} />
                            <strong>Instant UPI / QR</strong>
                          </div>
                          <span>Google Pay, PhonePe, Paytm, BHIM</span>
                        </div>
                      </label>

                      {/* Card Option */}
                      <label className={`payment-method-card ${paymentMethod === 'card' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                        />
                        <div className="method-info">
                          <div className="method-title-row">
                            <CreditCard size={18} />
                            <strong>Credit / Debit Card</strong>
                          </div>
                          <span>Visa, Mastercard, RuPay Cards</span>
                        </div>
                      </label>

                      {/* Cash on Delivery */}
                      <label className={`payment-method-card ${paymentMethod === 'cod' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                        />
                        <div className="method-info">
                          <div className="method-title-row">
                            <Banknote size={18} />
                            <strong>Cash on Delivery (COD)</strong>
                          </div>
                          <span>Pay in cash at doorstep upon inspection</span>
                        </div>
                      </label>
                    </div>

                    {/* UPI Sub-fields */}
                    {paymentMethod === 'upi' && (
                      <div className="payment-subpanel">
                        <label htmlFor="upi_id">Enter UPI ID (Optional in Demo Mode)</label>
                        <input
                          id="upi_id"
                          type="text"
                          placeholder="e.g. 9876543210@paytm"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                        <span className="subpanel-tip">Instant simulated UPI payment approval</span>
                      </div>
                    )}

                    {/* Card Sub-fields */}
                    {paymentMethod === 'card' && (
                      <div className="payment-subpanel">
                        <label htmlFor="card_no">Demo Card Number (Any 16 digits)</label>
                        <input
                          id="card_no"
                          type="text"
                          maxLength={16}
                          placeholder="4111 2222 3333 4444"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                        <span className="subpanel-tip">Zero real card data is collected or saved</span>
                      </div>
                    )}

                    {/* Delivery summary recap */}
                    <div className="payment-address-recap">
                      <MapPin size={16} />
                      <span>Delivering to: <strong>{formData.full_name}</strong>, {formData.house_street}, {formData.area_city}, {formData.state} - {formData.pincode}</span>
                    </div>

                    <div className="step-action-bar flex-between">
                      <button 
                        type="button" 
                        className="btn btn-outline"
                        onClick={() => setCurrentStep(2)}
                      >
                        <ArrowLeft size={16} />
                        <span>Edit Address</span>
                      </button>

                      <button 
                        type="submit" 
                        className="btn btn-primary pay-order-btn" 
                        disabled={loading}
                      >
                        <CheckCircle2 size={18} />
                        <span>
                          {loading ? 'Processing Order...' : `Pay & Place Order (₹${Number(displayTotal).toLocaleString('en-IN')})`}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* RIGHT: ORDER SUMMARY SIDEBAR */}
            <aside className="checkout-summary-col">
              <div className="checkout-summary-box">
                <h3 className="summary-heading">
                  Order Summary ({displayItems.length} {displayItems.length === 1 ? 'item' : 'items'})
                </h3>

                <div className="summary-items-list">
                  {displayItems.map((item) => {
                    const custFee = Number(item.customization_fee || 0);
                    const unitPrice = Number(item.price || 0) + custFee;

                    return (
                      <div key={item.cart_item_id || item.id} className="summary-item-tile">
                        <img src={item.image} alt={item.name} className="summary-item-img" />
                        <div className="summary-item-text">
                          <span className="summary-item-name">{item.name}</span>
                          <span className="summary-item-qty">Qty: {item.quantity} × ₹{unitPrice.toLocaleString('en-IN')}</span>
                          {(item.selected_color || item.custom_text) && (
                            <span className="summary-item-custom">
                              {item.selected_color && `Color: ${item.selected_color} `}
                              {item.custom_text && `"${item.custom_text}"`}
                            </span>
                          )}
                        </div>
                        <strong className="summary-item-subtotal">₹{(unitPrice * item.quantity).toLocaleString('en-IN')}</strong>
                      </div>
                    );
                  })}
                </div>

                <div className="summary-calc-divider" />

                <div className="calc-line">
                  <span>Subtotal</span>
                  <span>₹{Number(displaySubtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="calc-line">
                  <span>Delivery Charges</span>
                  <span>
                    {displayShipping === 0 ? <strong className="free-shipping">FREE</strong> : `₹${displayShipping}`}
                  </span>
                </div>

                <div className="summary-calc-divider" />

                <div className="calc-line total-line">
                  <span>Final Total</span>
                  <strong className="total-amount">₹{Number(displayTotal).toLocaleString('en-IN')}</strong>
                </div>

                <div className="checkout-trust-badges">
                  <div className="trust-badge-row">
                    <ShieldCheck size={16} color="#B85D35" />
                    <span>Fair-trade artisan direct payment</span>
                  </div>
                  <div className="trust-badge-row">
                    <Truck size={16} color="#23533E" />
                    <span>Free shipping on all orders over ₹1,000</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
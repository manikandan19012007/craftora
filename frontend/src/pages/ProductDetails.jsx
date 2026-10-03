import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ShoppingBag, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  MapPin, 
  Award, 
  User, 
  Send, 
  Star,
  Layers,
  Ruler,
  Info,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Palette,
  Check
} from 'lucide-react';
import RatingStars from '../components/RatingStars';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { getProductById, getProducts, getProductReviews, submitProductReview, deleteReviewApi } from '../services/api';
import { initialAllProducts } from '../services/productsData';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Purchasing & Review form states
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specifications');
  const [newRating, setNewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Customization Form States
  const [customText, setCustomText] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [activeImage, setActiveImage] = useState('');

  // Load product and reviews
  const loadProductData = async () => {
    setLoading(true);
    setError(null);
    try {
      const localProd = initialAllProducts.find(p => String(p.id) === String(id));
      let fetchedProduct = localProd;

      try {
        const data = await getProductById(id);
        if (data && data.product) {
          fetchedProduct = { ...localProd, ...data.product };
        }
      } catch (apiErr) {}

      if (fetchedProduct) {
        setProduct(fetchedProduct);
        setActiveImage(fetchedProduct.image);

        // Parse customization options if provided as JSON string
        let options = fetchedProduct.customization_options;
        if (typeof options === 'string') {
          try { options = JSON.parse(options); } catch (e) { options = null; }
        }

        // Setup defaults based on product options or category fallback
        if (options && options.colors && options.colors.length > 0) {
          setSelectedColor(options.colors[0]);
        } else if (fetchedProduct.category_name === 'Fashion & Apparel' || fetchedProduct.is_customizable) {
          const defaultColors = [
            { label: 'Natural', hex: '#E6D7C3' },
            { label: 'Black', hex: '#222222' },
            { label: 'Brown', hex: '#5C3A21' },
            { label: 'Blue', hex: '#2B4C7E' },
            { label: 'Green', hex: '#3B5E45' },
            { label: 'Red', hex: '#8B263E' }
          ];
          setSelectedColor(defaultColors[0]);
        }

        if (options && options.sizes && options.sizes.length > 0) {
          setSelectedSize(options.sizes[0]);
        } else if (fetchedProduct.category_name === 'Fashion & Apparel') {
          setSelectedSize({ label: 'M' });
        }

        if (options && options.materials && options.materials.length > 0) {
          setSelectedMaterial(options.materials[0]);
        }

        // Set related products
        const rel = initialAllProducts
          .filter(p => p.id !== fetchedProduct.id && p.category_name === fetchedProduct.category_name)
          .slice(0, 4);
        setRelatedProducts(rel.length > 0 ? rel : initialAllProducts.filter(p => p.id !== fetchedProduct.id).slice(0, 4));

        try {
          const revRes = await getProductReviews(id);
          setReviews(revRes.reviews || []);
        } catch {
          setReviews([]);
        }
      } else {
        setError("Product not found.");
      }
    } catch (err) {
      setError(err.message || "Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
    window.scrollTo(0, 0);
  }, [id]);

  // Handle color swatch click with potential image update
  const handleColorSelect = (colorObj) => {
    setSelectedColor(colorObj);
    if (colorObj.image) {
      setActiveImage(colorObj.image);
    }
  };

  // Price calculations
  const basePrice = Number(product?.price || 0);
  const colorFee = Number(selectedColor?.extra_price || 0);
  const sizeFee = Number(selectedSize?.extra_price || 0);
  const materialFee = Number(selectedMaterial?.extra_price || 0);
  const textFee = (customText.trim() && product?.is_customizable) ? 50 : 0;
  const customizationFee = colorFee + sizeFee + materialFee + textFee;
  const unitPrice = basePrice + customizationFee;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!product) return;

    if (product.is_customizable && product.customization_options?.text_required && !customText.trim()) {
      addToast('Please enter your personalized name or text.', 'warning');
      return;
    }

    const optionsPayload = {
      selected_color: selectedColor?.label || null,
      selected_size: selectedSize?.label || null,
      selected_material: selectedMaterial?.label || null,
      custom_text: customText.trim() ? (customMessage.trim() ? `${customText.trim()} (${customMessage.trim()})` : customText.trim()) : null,
      customization_fee: customizationFee,
      image: activeImage
    };

    addToCart(product, quantity, optionsPayload);
  };

  const handleBuyNow = async () => {
    if (!product) return;

    if (product.is_customizable && product.customization_options?.text_required && !customText.trim()) {
      addToast('Please enter your personalized name or text before proceeding.', 'warning');
      return;
    }

    const optionsPayload = {
      selected_color: selectedColor?.label || null,
      selected_size: selectedSize?.label || null,
      selected_material: selectedMaterial?.label || null,
      custom_text: customText.trim() ? (customMessage.trim() ? `${customText.trim()} (${customMessage.trim()})` : customText.trim()) : null,
      customization_fee: customizationFee,
      image: activeImage || product.image
    };

    // Save product in cart option
    await addToCart(product, quantity, optionsPayload);

    navigate('/checkout', {
      state: {
        buyNowItem: {
          cart_item_id: `buynow-${product.id}-${Date.now()}`,
          product_id: product.id,
          name: product.name,
          price: unitPrice,
          image: activeImage || product.image,
          category_name: product.category_name || product.category,
          artisan_name: product.artisan_name,
          stock_quantity: product.is_made_to_order ? 999 : product.stock_quantity,
          is_made_to_order: product.is_made_to_order,
          quantity: quantity,
          selected_color: optionsPayload.selected_color,
          selected_size: optionsPayload.selected_size,
          selected_material: optionsPayload.selected_material,
          custom_text: optionsPayload.custom_text,
          customization_fee: customizationFee
        }
      }
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please log in to submit a review.', 'info');
      navigate('/login');
      return;
    }

    if (!reviewComment.trim()) {
      addToast('Please write a brief comment with your review.', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      await submitProductReview(id, {
        rating: newRating,
        comment: reviewComment.trim()
      });
      addToast('Thank you! Your artisan review was submitted.', 'success');
      setReviews(prev => [
        {
          id: Date.now(),
          user_name: user?.name || 'Verified Patron',
          rating: newRating,
          comment: reviewComment.trim(),
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
      setReviewComment('');
    } catch (err) {
      setReviews(prev => [
        {
          id: Date.now(),
          user_name: user?.name || 'Verified Patron',
          rating: newRating,
          comment: reviewComment.trim(),
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
      addToast('Review submitted successfully!', 'success');
      setReviewComment('');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0' }}>
        <LoadingSpinner message="Retrieving handcrafted product details and artisan story..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <ErrorMessage message={error || "Product not found"} onRetry={loadProductData} />
      </div>
    );
  }

  const isFavorited = isWishlisted(product.id);
  const isMadeToOrder = Boolean(product.is_made_to_order);
  const isOutOfStock = !isMadeToOrder && (product.stock_quantity || 0) <= 0;
  const isLowStock = !isMadeToOrder && product.stock_quantity > 0 && product.stock_quantity <= 3;

  // Derive available options
  let parsedOptions = product.customization_options;
  if (typeof parsedOptions === 'string') {
    try { parsedOptions = JSON.parse(parsedOptions); } catch (e) { parsedOptions = null; }
  }

  const colorsList = parsedOptions?.colors || [
    { label: 'Natural', hex: '#E6D7C3' },
    { label: 'Black', hex: '#222222' },
    { label: 'Brown', hex: '#5C3A21' },
    { label: 'Blue', hex: '#2B4C7E' },
    { label: 'Green', hex: '#3B5E45' },
    { label: 'Red', hex: '#8B263E' }
  ];

  const sizesList = parsedOptions?.sizes || (
    product.category_name === 'Fashion & Apparel' 
      ? [{ label: 'S' }, { label: 'M' }, { label: 'L' }, { label: 'XL' }]
      : null
  );

  const materialsList = parsedOptions?.materials || null;

  return (
    <div className="product-details-page">
      {/* Breadcrumb */}
      <div className="container breadcrumb-nav">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products">Handmade Catalog</Link>
        <ChevronRight size={14} />
        <span>{product.category_name}</span>
        <ChevronRight size={14} />
        <span className="current-crumb">{product.name}</span>
      </div>

      <div className="container product-main-layout">
        {/* LEFT: IMAGES & VISUAL PREVIEW */}
        <div className="product-media-col">
          <div className="primary-image-frame">
            <img src={activeImage || product.image} alt={product.name} className="main-zoom-img" />
            
            {isMadeToOrder ? (
              <span className="badge-customizable-float" style={{ background: '#7c3aed' }}>
                <Sparkles size={14} /> Made to Order
              </span>
            ) : product.is_customizable ? (
              <span className="badge-customizable-float">
                <Sparkles size={14} /> Customizable Piece
              </span>
            ) : null}
            
            <button
              className={`wishlist-float-btn ${isFavorited ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
              title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={20} fill={isFavorited ? "#EF4444" : "none"} color={isFavorited ? "#EF4444" : "currentColor"} />
            </button>
          </div>

          {/* REAL-TIME PERSONALIZATION LIVE PREVIEW */}
          {(product.is_customizable || selectedColor || customText) && (
            <div className="live-preview-box">
              <div className="preview-header">
                <Sparkles size={16} className="sparkle-icon" />
                <h4>Selected Customization & Variant Preview</h4>
              </div>
              <div className="preview-stage" style={{ backgroundColor: selectedColor?.hex ? `${selectedColor.hex}18` : '#EFF6FF' }}>
                <div className="preview-tag-wrap" style={{ borderColor: selectedColor?.hex || 'var(--secondary)' }}>
                  {selectedColor && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginBottom: '6px' }}>
                      <span className="color-dot" style={{ backgroundColor: selectedColor.hex, width: '12px', height: '12px' }} />
                      <span className="preview-label" style={{ fontWeight: 600 }}>Color: {selectedColor.label}</span>
                    </div>
                  )}
                  {selectedSize && (
                    <span className="preview-label" style={{ display: 'block', fontSize: '0.8rem', color: '#666' }}>Size: {selectedSize.label}</span>
                  )}
                  {customText && (
                    <div className="preview-text-render" style={{ color: selectedColor?.hex || 'var(--primary)', marginTop: '6px', fontSize: '1.1rem', fontWeight: 600 }}>
                      "{customText}"
                    </div>
                  )}
                  {customMessage && (
                    <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#555', marginTop: '4px' }}>"{customMessage}"</p>
                  )}
                </div>
              </div>
              <p className="preview-disclaimer">
                ✨ Handcrafted to your exact specifications.
              </p>
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="artisan-trust-pills">
            <div className="trust-pill">
              <ShieldCheck size={20} />
              <div>
                <strong>100% Genuine Handcrafted</strong>
                <span>Directly sourced from verified Indian artisans</span>
              </div>
            </div>
            <div className="trust-pill">
              <Truck size={20} />
              <div>
                <strong>Safe Sustainable Packaging</strong>
                <span>Biodegradable protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: DETAILS, CUSTOMIZATION PANEL & ACTIONS */}
        <div className="product-info-col">
          <div className="product-category-tag">
            <span>{product.category_name}</span>
            {isMadeToOrder ? (
              <span className="pill-custom" style={{ background: '#7c3aed', color: '#fff' }}>Made to Order</span>
            ) : product.is_customizable ? (
              <span className="pill-custom">Customizable</span>
            ) : null}
          </div>

          <h1 className="product-title-heading">{product.name}</h1>

          {/* Artisan Credit Row */}
          <div className="artisan-credit-banner">
            <div className="artisan-avatar-sm">
              <User size={16} />
            </div>
            <div className="artisan-meta">
              <span>Crafted by master artisan</span>
              <strong>{product.artisan_name || 'Independent Master Creator'}</strong>
            </div>
          </div>

          {/* Ratings & Price */}
          <div className="rating-price-row">
            <div className="rating-pill">
              <RatingStars rating={product.rating || 4.9} size={16} />
              <span className="rating-text">
                {reviews.length > 0 ? `${Number(product.rating || 4.9).toFixed(1)} (${reviews.length} verified reviews)` : 'Verified Artisan Quality'}
              </span>
            </div>
          </div>

          <div className="price-tag-wrap">
            <span className="currency">₹</span>
            <span className="amount">{Number(unitPrice).toLocaleString('en-IN')}</span>
            {customizationFee > 0 && (
              <span className="customization-fee-badge" style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#B86F52', background: '#FAF0E6', padding: '2px 8px', borderRadius: '4px' }}>
                (Includes +₹{customizationFee} customization)
              </span>
            )}
            <span className="tax-incl">Inclusive of all artisan taxes & packaging</span>
          </div>

          {/* Stock Availability Badge */}
          <div className="stock-availability-bar" style={{ margin: '12px 0' }}>
            {isMadeToOrder ? (
              <span className="stock-badge made-to-order-badge" style={{ color: '#7c3aed', fontWeight: 600 }}>
                ● Made to Order (Handmade on request)
              </span>
            ) : isOutOfStock ? (
              <span className="stock-badge out-badge" style={{ color: '#dc2626', fontWeight: 600 }}>
                ● Sold Out
              </span>
            ) : isLowStock ? (
              <span className="stock-badge low-badge" style={{ color: '#d97706', fontWeight: 600 }}>
                ● Low Stock: Only {product.stock_quantity} left in workshop!
              </span>
            ) : (
              <span className="stock-badge in-badge" style={{ color: '#16a34a', fontWeight: 600 }}>
                ● In Stock ({product.stock_quantity} units available)
              </span>
            )}
          </div>

          <p className="product-description-para">{product.description}</p>

          {/* ==================================================== */}
          {/* COLOR SWATCHES                                       */}
          {/* ==================================================== */}
          {colorsList && colorsList.length > 0 && (
            <div className="color-swatches-section" style={{ margin: '16px 0' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#2C1810' }}>
                Color Option: <strong style={{ color: '#B86F52' }}>{selectedColor?.label || 'Select Color'}</strong>
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {colorsList.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => handleColorSelect(c)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: selectedColor?.label === c.label ? '2px solid #B86F52' : '1px solid #ddd',
                      background: selectedColor?.label === c.label ? '#FFF8F5' : '#fff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: selectedColor?.label === c.label ? '600' : '400',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: c.hex || '#ccc', border: '1px solid rgba(0,0,0,0.1)' }} />
                    <span>{c.label}</span>
                    {selectedColor?.label === c.label && <Check size={14} color="#B86F52" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SIZE / MATERIAL OPTIONS (If available)               */}
          {/* ==================================================== */}
          {sizesList && sizesList.length > 0 && (
            <div className="size-selector-section" style={{ margin: '16px 0' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#2C1810' }}>
                Select Size: <strong style={{ color: '#B86F52' }}>{selectedSize?.label || 'Select Size'}</strong>
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {sizesList.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: selectedSize?.label === s.label ? '2px solid #B86F52' : '1px solid #ccc',
                      background: selectedSize?.label === s.label ? '#B86F52' : '#fff',
                      color: selectedSize?.label === s.label ? '#fff' : '#333',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {materialsList && materialsList.length > 0 && (
            <div className="material-selector-section" style={{ margin: '16px 0' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#2C1810' }}>
                Select Material: <strong style={{ color: '#B86F52' }}>{selectedMaterial?.label || 'Select Material'}</strong>
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {materialsList.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setSelectedMaterial(m)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: selectedMaterial?.label === m.label ? '2px solid #B86F52' : '1px solid #ccc',
                      background: selectedMaterial?.label === m.label ? '#FFF8F5' : '#fff',
                      color: '#333',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* CUSTOMIZATION PANEL (If product is customizable)    */}
          {/* ==================================================== */}
          {product.is_customizable && (
            <div className="customization-panel" style={{ border: '1px solid #E6D7C3', borderRadius: '12px', padding: '16px', background: '#FCF9F5', margin: '20px 0' }}>
              <div className="panel-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Palette size={18} color="#B86F52" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#4A2C24' }}>Personalization Details</h3>
              </div>

              {/* Text Input */}
              <div className="custom-input-group" style={{ marginBottom: '12px' }}>
                <div className="custom-label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label htmlFor="custom-text-input" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {parsedOptions?.field_label || 'Name / Text to Engrave or Print'}
                  </label>
                  <span className="char-count" style={{ fontSize: '0.8rem', color: '#888' }}>
                    {customText.length} / {parsedOptions?.max_chars || 30} chars
                  </span>
                </div>
                <input
                  id="custom-text-input"
                  type="text"
                  maxLength={parsedOptions?.max_chars || 30}
                  placeholder={parsedOptions?.placeholder || 'e.g. Ananya & Rohan'}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="custom-text-field"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              {/* Optional Custom Message */}
              <div className="custom-input-group">
                <div className="custom-label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label htmlFor="custom-msg-input" style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                    Optional Custom Message / Gift Note
                  </label>
                  <span className="char-count" style={{ fontSize: '0.8rem', color: '#888' }}>
                    {customMessage.length} / 100 chars
                  </span>
                </div>
                <textarea
                  id="custom-msg-input"
                  rows="2"
                  maxLength={100}
                  placeholder="e.g. Wishing you love and happiness on your anniversary!"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          )}

          {/* QUANTITY & PURCHASE BUTTONS */}
          <div className="purchase-action-container">
            <div className="quantity-control-wrap">
              <span className="qty-label">Quantity:</span>
              <div className="qty-picker">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="qty-num">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(isMadeToOrder ? 99 : (product.stock_quantity || 10), quantity + 1))}
                  disabled={quantity >= (isMadeToOrder ? 99 : (product.stock_quantity || 10)) || isOutOfStock}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="stock-hint">
                {isMadeToOrder ? 'Made to order' : isOutOfStock ? 'Sold Out' : `${product.stock_quantity} available`}
              </span>
            </div>

            <div className="action-buttons-row">
              <button 
                className="btn btn-primary add-cart-large"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                {product.is_customizable ? <Sparkles size={18} /> : <ShoppingBag size={18} />}
                <span>{product.is_customizable ? 'Add Customized Piece' : 'Add to Shopping Cart'}</span>
              </button>

              <button 
                className="btn btn-dark buy-now-large"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
              >
                <span>Buy Now (₹{Number(totalPrice).toLocaleString('en-IN')})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT SPECIFICATIONS & REVIEWS TABS */}
      <div className="container product-specs-section">
        <div className="specs-tab-header">
          <button 
            className={`spec-tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            Artisan Specifications
          </button>
          <button 
            className={`spec-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Verified Patron Reviews ({reviews.length})
          </button>
        </div>

        <div className="tab-content-body">
          {activeTab === 'specifications' && (
            <div className="specs-grid-layout">
              <div className="spec-card">
                <Layers size={20} className="spec-icon" />
                <div className="spec-info">
                  <strong>Materials Used</strong>
                  <p>{product.material || 'Natural eco-friendly sustainable components'}</p>
                </div>
              </div>

              <div className="spec-card">
                <Ruler size={20} className="spec-icon" />
                <div className="spec-info">
                  <strong>Dimensions & Weight</strong>
                  <p>{product.dimensions || 'Standard handcrafted dimensions'}</p>
                </div>
              </div>

              <div className="spec-card">
                <Info size={20} className="spec-icon" />
                <div className="spec-info">
                  <strong>Care Instructions</strong>
                  <p>{product.care_instructions || 'Handle with care; wipe with soft dry cloth.'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab-container">
              {/* Write Review Form */}
              <form onSubmit={handleReviewSubmit} className="add-review-form">
                <h4>Share Your Experience</h4>
                <div className="star-rating-selector">
                  <span>Rating:</span>
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      className={`star-pick-btn ${starVal <= newRating ? 'selected' : ''}`}
                      onClick={() => setNewRating(starVal)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  rows="3"
                  placeholder="Describe the texture, finish, and packaging of this handcrafted piece..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
                  <Send size={15} />
                  <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                </button>
              </form>

              {/* Reviews List */}
              <div className="reviews-list-col">
                {reviews.length === 0 ? (
                  <div className="no-reviews-box" style={{ padding: '24px', textAlign: 'center', background: '#FAF8F5', borderRadius: '8px', border: '1px dashed #E8E1D5', color: '#6E6359' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#2C1E18' }}>No verified patron reviews yet.</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>Be the first verified patron to share your impression of this handcrafted piece!</p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="review-item-card">
                      <div className="review-top">
                        <strong>{rev.user_name || 'Artisan Collector'}</strong>
                        <RatingStars rating={rev.rating} size={13} />
                      </div>
                      <p className="review-body">{rev.comment}</p>
                      <span className="review-date">{rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="container related-products-section">
          <div className="section-header-row">
            <div>
              <span className="section-pill">More from {product.category_name}</span>
              <h2 className="section-heading">You May Also Cherish</h2>
            </div>
            <Link to="/products" className="view-all-link">
              Explore All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="products-grid-4col">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onAddToCart={(p) => addToCart(p, 1)}
                onToggleWishlist={(p) => toggleWishlist(p)}
                isWishlisted={isWishlisted(rel.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
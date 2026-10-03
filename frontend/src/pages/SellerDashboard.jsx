import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Palette, 
  Package, 
  ShoppingBag, 
  IndianRupee, 
  Plus, 
  Sparkles, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  getProducts, 
  updateProductApi, 
  deleteProductApi, 
  getSellerOrdersApi, 
  updateOrderStatusApi, 
  createProductApi 
} from '../services/api';
import './SellerDashboard.css';

export default function SellerDashboard() {
  const { user, isAuthenticated, isSeller, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products');
  const [artisanProducts, setArtisanProducts] = useState([]);
  const [artisanOrders, setArtisanOrders] = useState([]);
  const [salesSummary, setSalesSummary] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_items_sold: 0
  });
  const [loading, setLoading] = useState(true);

  // Access guard — redirect non-sellers
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: { pathname: '/seller' } } });
      } else if (!isSeller) {
        navigate('/');
        addToast('Access denied: Seller privileges required.', 'error');
      }
    }
  }, [isAuthenticated, isSeller, authLoading]);

  // Load seller data
  const loadSellerData = async () => {
    setLoading(true);
    try {
      const artisanParam = user?.artisan_id || user?.id;
      const prodRes = await getProducts(artisanParam ? { artisan_id: artisanParam } : {});
      setArtisanProducts(prodRes.products || []);

      const orderRes = await getSellerOrdersApi();
      setArtisanOrders(orderRes.orders || []);
      if (orderRes.sales_summary) {
        setSalesSummary(orderRes.sales_summary);
      }
    } catch (err) {
      console.warn("Seller data fetch warning:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isSeller) {
      loadSellerData();
    }
  }, [isAuthenticated, isSeller]);

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Pottery & Ceramics');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdCustomizable, setNewProdCustomizable] = useState(true);
  const [newProdMadeToOrder, setNewProdMadeToOrder] = useState(false);
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80');

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      setArtisanOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
      addToast(`Order #${orderId} status updated to "${newStatus}"`, 'success');
    } catch (err) {
      addToast(err.message || "Failed to update order status", 'error');
    }
  };

  const handleStockUpdate = async (product, newStock) => {
    try {
      const qty = Math.max(0, parseInt(newStock) || 0);
      await updateProductApi(product.id, { stock_quantity: qty });
      setArtisanProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock_quantity: qty } : p));
      addToast(`Stock for "${product.name}" updated to ${qty}`, 'success');
    } catch (err) {
      addToast(err.message || "Failed to update stock", 'error');
    }
  };

  const handleToggleMadeToOrder = async (product) => {
    try {
      const nextVal = !product.is_made_to_order;
      await updateProductApi(product.id, { is_made_to_order: nextVal ? 1 : 0 });
      setArtisanProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_made_to_order: nextVal } : p));
      addToast(`Updated "${product.name}" to ${nextVal ? 'Made to Order' : 'Standard In-Stock'}`, 'info');
    } catch (err) {
      addToast(err.message || "Failed to update availability mode", 'error');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    try {
      const payload = {
        name: newProdName,
        category_name: newProdCategory,
        price: Number(newProdPrice),
        stock_quantity: parseInt(newProdStock) || 10,
        image: newProdImage,
        description: 'Handmade creation directly crafted in our artisan workshop.',
        is_customizable: newProdCustomizable,
        is_made_to_order: newProdMadeToOrder,
        artisan_id: user?.artisan_id || user?.id || 1
      };
      await createProductApi(payload);
      addToast('New handcrafted product published to the marketplace!', 'success');
      setShowAddModal(false);
      setNewProdName('');
      setNewProdPrice('');
      loadSellerData();
    } catch (err) {
      addToast(err.message || "Failed to create product listing", 'error');
    }
  };

  const handleDeleteProduct = async (prodId, prodName) => {
    if (!window.confirm(`Are you sure you want to remove "${prodName}" from your active catalog?`)) return;
    try {
      await deleteProductApi(prodId);
      setArtisanProducts(prev => prev.filter(p => p.id !== prodId));
      addToast(`Removed "${prodName}" from your active catalog`, 'info');
    } catch (err) {
      addToast(err.message || "Failed to delete product", 'error');
    }
  };

  return (
    <div className="seller-dashboard-page">
      <div className="container">
        {/* Studio Header Banner */}
        <div className="seller-hero-card">
          <div className="seller-meta-row">
            <div className="seller-avatar-large">
              <Palette size={32} />
            </div>
            <div>
              <div className="badge-seller-tag">Verified Artisan Studio</div>
              <h1 className="seller-name">{user?.name}</h1>
              <p className="seller-craft-sub">
                {user?.craft_name || 'Artisan Studio'}{user?.location ? ` • ${user.location}` : ''}
              </p>
            </div>
          </div>

          <button className="btn btn-primary add-product-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Add New Craft Listing</span>
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="seller-metrics-grid">
          <div className="metric-box">
            <span className="metric-icon-wrap bg-terracotta"><Package size={20} /></span>
            <div className="metric-data">
              <span className="metric-val">{artisanProducts.length}</span>
              <span className="metric-label">Active Craft Listings</span>
            </div>
          </div>

          <div className="metric-box">
            <span className="metric-icon-wrap bg-sage"><ShoppingBag size={20} /></span>
            <div className="metric-data">
              <span className="metric-val">{salesSummary.total_orders || artisanOrders.length}</span>
              <span className="metric-label">Custom Orders Queue</span>
            </div>
          </div>

          <div className="metric-box">
            <span className="metric-icon-wrap bg-gold"><IndianRupee size={20} /></span>
            <div className="metric-data">
              <span className="metric-val">
                ₹{Number(salesSummary.total_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="metric-label">Actual Revenue</span>
            </div>
          </div>

          <div className="metric-box">
            <span className="metric-icon-wrap bg-espresso"><Sparkles size={20} /></span>
            <div className="metric-data">
              <span className="metric-val">{salesSummary.total_items_sold || 0}</span>
              <span className="metric-label">Handcrafted Items Sold</span>
            </div>
          </div>
        </div>

        {/* DASHBOARD TABS */}
        <div className="seller-nav-tabs">
          <button 
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            My Handcrafted Products ({artisanProducts.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Custom Orders & Commissions ({artisanOrders.length})
          </button>
        </div>

        {/* TAB 1: PRODUCTS LIST */}
        {activeTab === 'products' && (
          <div className="seller-products-table-wrap">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Mode</th>
                  <th>Stock Quantity</th>
                  <th>Customizable</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {artisanProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="product-col">
                      <img src={p.image} alt={p.name} className="table-thumb" />
                      <div>
                        <strong>{p.name}</strong>
                        <span className="text-muted text-xs" style={{ display: 'block' }}>ID: #{p.id}</span>
                      </div>
                    </td>
                    <td><span className="badge-cat">{p.category_name}</span></td>
                    <td><strong>₹{p.price}</strong></td>
                    <td>
                      <button
                        onClick={() => handleToggleMadeToOrder(p)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          background: p.is_made_to_order ? '#ede9fe' : '#e0f2fe',
                          color: p.is_made_to_order ? '#6d28d9' : '#0369a1'
                        }}
                      >
                        {p.is_made_to_order ? '✨ Made to Order' : '📦 In-Stock'}
                      </button>
                    </td>
                    <td>
                      {p.is_made_to_order ? (
                        <span style={{ color: '#6d28d9', fontStyle: 'italic', fontSize: '0.85rem' }}>Made on order</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="number"
                            min="0"
                            defaultValue={p.stock_quantity}
                            onBlur={(e) => handleStockUpdate(p, e.target.value)}
                            style={{ width: '60px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: p.stock_quantity === 0 ? '#dc2626' : p.stock_quantity <= 3 ? '#d97706' : '#16a34a' }}>
                            {p.stock_quantity === 0 ? 'Sold Out' : p.stock_quantity <= 3 ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      {p.is_customizable ? (
                        <span className="badge-custom-yes">✨ Yes</span>
                      ) : (
                        <span className="badge-custom-no">Standard</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="action-icon-btn delete"
                        title="Delete product"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: CUSTOM ORDERS */}
        {activeTab === 'orders' && (
          <div className="seller-orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {artisanOrders.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>No orders found.</div>
            ) : artisanOrders.map((ord) => (
              <div key={ord.id} className="artisan-order-card" style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', background: '#fff' }}>
                <div className="order-top-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <strong className="order-id" style={{ color: 'var(--secondary)', fontSize: '1rem' }}>{ord.order_code || `#ORD-${ord.id}`}</strong>
                    <span className="order-date" style={{ color: '#888', fontSize: '0.85rem', marginLeft: '10px' }}>
                      • {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="order-amount" style={{ fontWeight: 700, fontSize: '1.05rem' }}>₹{Number(ord.total_amount).toLocaleString('en-IN')}</div>
                </div>

                <div className="order-details-body" style={{ marginBottom: '12px' }}>
                  <p className="patron-info" style={{ fontSize: '0.88rem', color: '#444', margin: '4px 0' }}>
                    Patron: <strong>{ord.full_name || 'Customer'}</strong> (Tel: {ord.phone})
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#666', margin: '2px 0' }}>
                    Address: {ord.house_street || ord.shipping_address}, {ord.area_city || ord.city}, {ord.state} - {ord.pincode}
                  </p>

                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ord.items?.map((it) => (
                      <div key={it.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg-muted)', padding: '8px', borderRadius: '6px' }}>
                        <img src={it.image} alt={it.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div style={{ flex: 1, fontSize: '0.85rem' }}>
                          <strong>{it.name}</strong> × {it.quantity}
                          {(it.selected_color || it.selected_size || it.custom_text) && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', marginTop: '2px' }}>
                              {it.selected_color && <span>Color: {it.selected_color} | </span>}
                              {it.selected_size && <span>Size: {it.selected_size} | </span>}
                              {it.custom_text && <span>Text: "{it.custom_text}"</span>}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{(Number(it.price) * it.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-footer-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                  <div className="status-badge-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Status: </span>
                    <strong style={{ textTransform: 'capitalize', color: 'var(--secondary)' }}>{ord.order_status || 'Pending'}</strong>
                  </div>

                  <div className="status-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 500 }}>Update Status:</label>
                    <select
                      value={ord.order_status || 'Pending'}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.82rem' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD CRAFT MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Publish New Handcrafted Creation</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="modal-form">
              <div className="form-group">
                <label>Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted Terracotta Tea Service"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discipline</label>
                  <select value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)}>
                    <option value="Pottery & Ceramics">Pottery & Ceramics</option>
                    <option value="Wood Crafts">Wood Crafts</option>
                    <option value="Handmade Jewelry">Handmade Jewelry</option>
                    <option value="Handmade Bags">Handmade Bags</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Gifts">Gifts & Keepsakes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (₹ INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 799"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  required
                />
              </div>

              <div className="form-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={newProdCustomizable}
                    onChange={(e) => setNewProdCustomizable(e.target.checked)}
                  />
                  <span>Offer Personalization (Custom Text, Monograms, or Color Options)</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary modal-submit">
                Publish Product to Marketplace
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

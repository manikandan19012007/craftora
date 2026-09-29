import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, Users, ShoppingBag, Star, FolderTree, Plus, 
  Trash2, Edit, CheckCircle, Clock, Truck, Check, X, 
  Search, ShieldAlert, Sparkles, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getProducts, getCategories, getArtisans, getAllOrdersAdmin, 
  getAllUsersAdmin, getAllReviewsAdmin, updateOrderStatusApi, 
  deleteProductApi, createProductApi, deleteReviewApi, deleteArtisanApi 
} from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import RatingStars from '../components/RatingStars';
import './Admin.css';

export default function Admin() {
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('orders'); // orders | products | artisans | users | reviews
  const [loading, setLoading] = useState(true);

  // Data states
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  // New product modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: 10,
    category_id: '',
    artisan_id: '',
    image: '',
    is_featured: false
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login?redirect=/admin');
      } else if (!isAdmin) {
        navigate('/');
        showToast('Access denied: Administrator privileges required.', 'error');
      } else {
        fetchAllAdminData();
      }
    }
  }, [isAuthenticated, isAdmin, authLoading]);

  const fetchAllAdminData = async () => {
    try {
      setLoading(true);
      const [ordersRes, prodsRes, catsRes, artsRes, usersRes, revsRes] = await Promise.all([
        getAllOrdersAdmin().catch(() => ({ orders: [] })),
        getProducts({ limit: 100 }).catch(() => ({ products: [] })),
        getCategories().catch(() => ({ categories: [] })),
        getArtisans().catch(() => ({ artisans: [] })),
        getAllUsersAdmin().catch(() => ({ users: [] })),
        getAllReviewsAdmin().catch(() => ({ reviews: [] }))
      ]);

      setOrders(ordersRes.orders || []);
      setProducts(prodsRes.products || []);
      setCategories(catsRes.categories || []);
      setArtisans(artsRes.artisans || []);
      setUsers(usersRes.users || []);
      setReviews(revsRes.reviews || []);

      if (catsRes.categories?.length > 0) {
        setNewProduct(prev => ({ ...prev, category_id: String(catsRes.categories[0].id) }));
      }
      if (artsRes.artisans?.length > 0) {
        setNewProduct(prev => ({ ...prev, artisan_id: String(artsRes.artisans[0].id) }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to load admin metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
      showToast(`Order #${orderId} changed to ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update order status.', 'error');
    }
  };

  const handleDeleteProduct = async (productId, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the catalog?`)) return;
    try {
      await deleteProductApi(productId);
      setProducts(products.filter(p => p.id !== productId));
      showToast(`Product "${name}" deleted.`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete product.', 'error');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this patron review permanently?')) return;
    try {
      await deleteReviewApi(reviewId);
      setReviews(reviews.filter(r => r.id !== reviewId));
      showToast('Review removed.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete review.', 'error');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category_id || !newProduct.artisan_id) {
      showToast('Please fill in required fields.', 'warning');
      return;
    }

    try {
      setSubmittingProduct(true);
      await createProductApi({
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock_quantity: parseInt(newProduct.stock_quantity, 10),
        category_id: parseInt(newProduct.category_id, 10),
        artisan_id: parseInt(newProduct.artisan_id, 10)
      });
      showToast('New product added to catalog successfully!', 'success');
      setShowAddModal(false);
      // Refresh products list
      const refreshed = await getProducts({ limit: 100 });
      setProducts(refreshed.products || []);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock_quantity: 10,
        category_id: categories[0]?.id ? String(categories[0].id) : '',
        artisan_id: artisans[0]?.id ? String(artisans[0].id) : '',
        image: '',
        is_featured: false
      });
    } catch (err) {
      showToast(err.message || 'Failed to add product.', 'error');
    } finally {
      setSubmittingProduct(false);
    }
  };

  if (authLoading || (loading && !orders.length)) {
    return (
      <div className="container" style={{ padding: '5rem 0' }}>
        <LoadingSpinner text="Loading Craftora Admin Operations Center..." />
      </div>
    );
  }

  // Calculate platform totals
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

  return (
    <div className="craftora-admin-page">
      {/* Top Banner */}
      <div className="admin-header-banner">
        <div className="container">
          <div className="admin-header-inner">
            <div>
              <span className="admin-badge">
                <ShieldAlert size={14} /> Platform Administrator
              </span>
              <h1 className="admin-title">Admin Operations Center</h1>
              <p className="admin-subtitle">
                Comprehensive store controls: live order management, catalog inventory, artisans, and reviews.
              </p>
            </div>
            <button className="refresh-btn" onClick={fetchAllAdminData} title="Refresh Live Data">
              <RefreshCw size={16} /> Refresh Metrics
            </button>
          </div>
        </div>
      </div>

      <div className="container admin-main-container">
        {/* Metric Cards Row */}
        <div className="admin-kpi-grid">
          <div className="kpi-card revenue">
            <span className="kpi-label">Gross Platform Volume</span>
            <span className="kpi-value">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            <span className="kpi-sub">{orders.length} total transactions</span>
          </div>

          <div className="kpi-card orders">
            <span className="kpi-label">Active Orders</span>
            <span className="kpi-value">{orders.length}</span>
            <span className="kpi-sub">
              {orders.filter(o => o.order_status === 'Confirmed' || o.order_status === 'Pending').length} pending dispatch
            </span>
          </div>

          <div className="kpi-card products">
            <span className="kpi-label">Catalog Products</span>
            <span className="kpi-value">{products.length}</span>
            <span className="kpi-sub">Across {categories.length} traditional crafts</span>
          </div>

          <div className="kpi-card patrons">
            <span className="kpi-label">Verified Patrons</span>
            <span className="kpi-value">{users.length}</span>
            <span className="kpi-sub">{artisans.length} master artisans</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs-bar">
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={17} />
            <span>Orders ({orders.length})</span>
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={17} />
            <span>Products ({products.length})</span>
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'artisans' ? 'active' : ''}`}
            onClick={() => setActiveTab('artisans')}
          >
            <Sparkles size={17} />
            <span>Artisans ({artisans.length})</span>
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <Star size={17} />
            <span>Reviews ({reviews.length})</span>
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={17} />
            <span>Patrons ({users.length})</span>
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="admin-tab-content">
            <div className="tab-section-header">
              <h3>All Platform Orders</h3>
              <span className="tab-count-pill">{orders.length} Orders Recorded</span>
            </div>

            {orders.length === 0 ? (
              <div className="admin-empty">No orders found.</div>
            ) : (
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Patron Details</th>
                      <th>Items</th>
                      <th>Total Amount</th>
                      <th>Date</th>
                      <th>Current Status</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td><strong>#{o.id}</strong></td>
                        <td>
                          <div className="customer-cell">
                            <strong>{o.customer_name}</strong>
                            <span>{o.customer_email}</span>
                            <small>{o.city}, {o.state}</small>
                          </div>
                        </td>
                        <td>{o.total_items} items</td>
                        <td><strong className="amount-highlight">₹{Number(o.total_amount).toLocaleString('en-IN')}</strong></td>
                        <td>{new Date(o.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-pill status-${o.order_status.toLowerCase()}`}>
                            {o.order_status}
                          </span>
                        </td>
                        <td>
                          <select 
                            className="status-select"
                            value={o.order_status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="admin-tab-content">
            <div className="tab-section-header">
              <div>
                <h3>Catalog Products Management</h3>
                <p className="tab-sub">View inventory, add new handmade pieces, and manage listings.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                <Plus size={16} /> Add New Product
              </button>
            </div>

            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="product-table-cell">
                          <img src={p.image} alt={p.name} className="product-mini-thumb" />
                          <div>
                            <strong>{p.name}</strong>
                            <Link to={`/products/${p.id}`} className="view-product-link" target="_blank">
                              View in Store
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td>{p.category_name}</td>
                      <td><strong>₹{Number(p.price).toLocaleString('en-IN')}</strong></td>
                      <td>
                        <span className={`stock-indicator ${p.stock_quantity < 5 ? 'low' : ''}`}>
                          {p.stock_quantity} units
                        </span>
                      </td>
                      <td>★ {Number(p.rating || 5).toFixed(1)}</td>
                      <td>
                        <button 
                          className="table-action-btn delete"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ARTISANS */}
        {activeTab === 'artisans' && (
          <div className="admin-tab-content">
            <div className="tab-section-header">
              <h3>Registered Master Artisans</h3>
              <span className="tab-count-pill">{artisans.length} Artisans</span>
            </div>

            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Artisan</th>
                    <th>Craft Specialty</th>
                    <th>Studio Location</th>
                    <th>Experience</th>
                    <th>Products Listed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artisans.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="product-table-cell">
                          <img src={a.image} alt={a.name} className="artisan-mini-thumb" />
                          <strong>{a.name}</strong>
                        </div>
                      </td>
                      <td><span className="craft-tag">{a.specialty}</span></td>
                      <td>{a.location}</td>
                      <td>{a.experience}</td>
                      <td><strong>{a.product_count}</strong> creations</td>
                      <td>
                        <Link to={`/artisans/${a.id}`} className="table-action-btn view" title="View Profile">
                          Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="admin-tab-content">
            <div className="tab-section-header">
              <h3>Patron Reviews Moderation</h3>
              <span className="tab-count-pill">{reviews.length} Total Reviews</span>
            </div>

            {reviews.length === 0 ? (
              <div className="admin-empty">No reviews to moderate.</div>
            ) : (
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Patron</th>
                      <th>Rating</th>
                      <th>Feedback</th>
                      <th>Date</th>
                      <th>Moderation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => (
                      <tr key={r.id}>
                        <td><strong>{r.product_name}</strong></td>
                        <td>{r.user_name}</td>
                        <td><RatingStars rating={r.rating} size={13} /></td>
                        <td className="review-comment-cell">{r.comment}</td>
                        <td>{new Date(r.created_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="table-action-btn delete"
                            onClick={() => handleDeleteReview(r.id)}
                            title="Remove Review"
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
          </div>
        )}

        {/* TAB 5: PATRONS */}
        {activeTab === 'users' && (
          <div className="admin-tab-content">
            <div className="tab-section-header">
              <h3>Registered Patron Accounts</h3>
              <span className="tab-count-pill">{users.length} Users</span>
            </div>

            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Orders</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>
                        <div className="product-table-cell">
                          <img src={u.avatar} alt={u.name} className="user-mini-thumb" />
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-tag ${u.role.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.total_orders || 0} orders</td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADD PRODUCT MODAL */}
        {showAddModal && (
          <div className="modal-backdrop">
            <div className="admin-modal">
              <div className="modal-header">
                <h3>Add New Handmade Product</h3>
                <button className="close-modal-btn" onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="modal-form">
                <div className="form-group">
                  <label>Product Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Handcrafted Terracotta Water Urn"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-control"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="1299.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={newProduct.stock_quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      className="form-control"
                      value={newProduct.category_id}
                      onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                      required
                    >
                      {!newProduct.category_id && (
                        <option value="" disabled>— Select a Category —</option>
                      )}
                      {categories.map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Crafting Artisan *</label>
                    <select
                      className="form-control"
                      value={newProduct.artisan_id}
                      onChange={(e) => setNewProduct({ ...newProduct, artisan_id: e.target.value })}
                      required
                    >
                      {!newProduct.artisan_id && (
                        <option value="" disabled>— Select an Artisan —</option>
                      )}
                      {artisans.map((a) => (
                        <option key={a.id} value={String(a.id)}>{a.name} ({a.specialty})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Describe materials, traditional craft style, and story..."
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary" disabled={submittingProduct}>
                    <Check size={16} /> {submittingProduct ? 'Saving...' : 'Add to Catalog'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAddModal(false)}
                    disabled={submittingProduct}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
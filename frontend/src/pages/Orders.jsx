import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { getOrders, cancelOrderApi } from '../services/api';
import './Orders.css';

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [cancellingId, setCancellingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || 'Unable to fetch your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container orders-auth-guard">
        <div className="guard-card">
          <Package size={48} className="guard-icon" />
          <h2>Order History</h2>
          <p>Please sign in to view your orders and track real-time artisan shipments.</p>
          <Link to="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancellingId(orderId);
    try {
      await cancelOrderApi(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: 'Cancelled' } : o));
    } catch (err) {
      alert(err.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = status || 'Pending';
    switch (s) {
      case 'Confirmed':
        return <span className="order-status-pill confirmed" style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}><CheckCircle2 size={13} style={{ display: 'inline', marginRight: '3px' }} /> Confirmed</span>;
      case 'Processing':
        return <span className="order-status-pill processing" style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}><Clock size={13} style={{ display: 'inline', marginRight: '3px' }} /> Processing</span>;
      case 'Shipped':
        return <span className="order-status-pill shipped" style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}><Truck size={13} style={{ display: 'inline', marginRight: '3px' }} /> Shipped</span>;
      case 'Delivered':
        return <span className="order-status-pill delivered" style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}><CheckCircle2 size={13} style={{ display: 'inline', marginRight: '3px' }} /> Delivered</span>;
      case 'Cancelled':
        return <span className="order-status-pill cancelled" style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}><XCircle size={13} style={{ display: 'inline', marginRight: '3px' }} /> Cancelled</span>;
      default:
        return <span className="order-status-pill pending" style={{ background: '#ffedd5', color: '#9a3412', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}><Clock size={13} style={{ display: 'inline', marginRight: '3px' }} /> Pending</span>;
    }
  };

  const statusTabs = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'All') return true;
    return (o.order_status || 'Pending').toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="orders-page">
      <div className="container">
        <header className="orders-header">
          <div>
            <span className="orders-badge">Customer Account</span>
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-sub">Track your orders and view past handcrafted artisan purchases.</p>
          </div>
        </header>

        {/* Status Filter Tabs */}
        <div className="orders-filter-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', margin: '20px 0', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
          {statusTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: statusFilter === tab ? '2px solid #B86F52' : '1px solid #ccc',
                background: statusFilter === tab ? '#B86F52' : '#fff',
                color: statusFilter === tab ? '#fff' : '#444',
                fontWeight: statusFilter === tab ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '0.85rem'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Retrieving your order history from database..." />
        ) : error ? (
          <ErrorMessage title="Failed to load orders" message={error} onRetry={loadOrders} />
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders-card">
            <div className="empty-orders-icon">📦</div>
            <h3>No Orders Found</h3>
            <p>No orders match the selected filter category.</p>
            <Link to="/products" className="btn btn-primary">
              Explore Products Catalog <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="orders-feed" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredOrders.map((order) => {
              const canCancel = ['Pending', 'Confirmed'].includes(order.order_status || 'Pending');

              return (
                <div key={order.id} className="order-card" style={{ border: '1px solid #E6D7C3', borderRadius: '12px', padding: '20px', background: '#fff' }}>
                  {/* Order Card Header */}
                  <div className="order-card-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', pb: '12px', borderBottom: '1px solid #f0f0f0' }}>
                    <div className="order-header-left" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <div className="order-id-block">
                        <span className="order-label" style={{ display: 'block', fontSize: '0.78rem', color: '#888' }}>Order Code</span>
                        <strong className="order-id-val" style={{ color: '#B86F52' }}>{order.order_code || `#ORD-${order.id}`}</strong>
                      </div>
                      <div className="order-date-block">
                        <span className="order-label" style={{ display: 'block', fontSize: '0.78rem', color: '#888' }}>Date Placed</span>
                        <span style={{ fontSize: '0.9rem' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="order-total-block">
                        <span className="order-label" style={{ display: 'block', fontSize: '0.78rem', color: '#888' }}>Total Amount</span>
                        <strong className="order-total-val" style={{ fontSize: '1.05rem' }}>₹{Number(order.total_amount).toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="order-payment-block">
                        <span className="order-label" style={{ display: 'block', fontSize: '0.78rem', color: '#888' }}>Payment Method</span>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600 }}>{(order.payment_method || 'cod')} ({order.payment_status || 'paid'})</span>
                      </div>
                    </div>

                    <div className="order-header-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {getStatusBadge(order.order_status)}
                      {canCancel && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #dc2626',
                            background: '#fff',
                            color: '#dc2626',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="order-shipping-summary" style={{ fontSize: '0.85rem', color: '#555', marginBottom: '16px', background: '#FAF9F6', padding: '10px 14px', borderRadius: '8px' }}>
                    <strong>Delivery Address: </strong>
                    <span>{order.full_name || 'Recipient'} — {order.house_street || order.shipping_address}, {order.area_city || order.city}, {order.state} - {order.pincode} (Tel: {order.phone})</span>
                  </div>

                  {/* Items in this order */}
                  <div className="order-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {order.items?.map((item) => (
                      <div key={item.id} className="order-item-tile" style={{ display: 'flex', gap: '14px', alignItems: 'center', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #f3f3f3' }}>
                        <img src={item.image} alt={item.name} className="order-item-thumb" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div className="order-item-details" style={{ flex: 1 }}>
                          <span className="order-item-category" style={{ fontSize: '0.78rem', color: '#888' }}>{item.category_name}</span>
                          <h4 className="order-item-name" style={{ margin: '2px 0', fontSize: '0.95rem' }}>
                            <Link to={`/products/${item.product_id}`} style={{ color: '#2C1810', textDecoration: 'none' }}>{item.name}</Link>
                          </h4>
                          
                          {/* Display selected variant options & custom text */}
                          {(item.selected_color || item.selected_size || item.custom_text) && (
                            <div className="order-variant-pill" style={{ fontSize: '0.8rem', color: '#B86F52', display: 'flex', gap: '10px', marginTop: '2px' }}>
                              {item.selected_color && <span>Color: {item.selected_color}</span>}
                              {item.selected_size && <span>Size: {item.selected_size}</span>}
                              {item.custom_text && <span>Text: "{item.custom_text}"</span>}
                            </div>
                          )}

                          <span className="order-item-qty-price" style={{ fontSize: '0.82rem', color: '#666' }}>
                            Qty: <strong>{item.quantity}</strong> × ₹{Number(item.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="order-item-subtotal">
                          <strong>₹{Number(item.quantity * item.price).toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    ))}
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
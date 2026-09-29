import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Calendar, Shield, Package, Heart, Star, 
  Edit3, Check, X, LogOut, Sparkles, ExternalLink, ShoppingBag 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMe, updateProfileApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './Profile.css';

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [stats, setStats] = useState({ orders: 0, wishlist: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/profile');
      return;
    }

    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated, authLoading]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await getMe();
      if (res.user) {
        updateUser(res.user);
        setEditName(res.user.name || '');
        setEditAvatar(res.user.avatar || '');
        if (res.user.stats) {
          setStats(res.user.stats);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to sync profile data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Name cannot be empty.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const res = await updateProfileApi({
        name: editName.trim(),
        avatar: editAvatar.trim()
      });
      if (res.user) {
        updateUser(res.user);
        showToast('Profile updated successfully!', 'success');
        setIsEditing(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(user?.name || '');
    setEditAvatar(user?.avatar || '');
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    showToast('You have been logged out.', 'info');
    navigate('/login');
  };

  if (authLoading || (loading && !user)) {
    return (
      <div className="container" style={{ padding: '5rem 0' }}>
        <LoadingSpinner text="Retrieving your Craftora patron profile..." />
      </div>
    );
  }

  if (!user) return null;

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
        day: 'numeric'
      })
    : 'Member since 2026';

  return (
    <div className="craftora-profile-page">
      {/* Top Banner Header */}
      <div className="profile-banner">
        <div className="container">
          <div className="profile-banner-inner">
            <span className="patron-badge">
              <Sparkles size={15} /> Verified Craftora Patron
            </span>
            <h1 className="profile-banner-title">My Account</h1>
            <p className="profile-banner-subtitle">
              Manage your personal details, monitor order statuses, and track your artisan impact.
            </p>
          </div>
        </div>
      </div>

      <div className="container profile-main-container">
        <div className="profile-grid-layout">
          {/* Left Column: Account Card */}
          <div className="profile-sidebar-col">
            <div className="patron-identity-card">
              <div className="patron-avatar-wrap">
                <img
                  src={
                    user.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={user.name}
                  className="patron-avatar-img"
                />
                <span className={`role-pill ${user.role === 'ADMIN' ? 'admin' : 'user'}`}>
                  {user.role === 'ADMIN' ? 'Administrator' : 'Patron'}
                </span>
              </div>

              <h2 className="patron-name">{user.name}</h2>
              <p className="patron-email">{user.email}</p>

              <div className="patron-meta-list">
                <div className="patron-meta-row">
                  <Calendar size={16} />
                  <span>Joined {joinDate}</span>
                </div>
                <div className="patron-meta-row">
                  <Shield size={16} />
                  <span>Account Status: Active</span>
                </div>
              </div>

              <div className="patron-actions">
                {!isEditing ? (
                  <button
                    className="btn btn-outline edit-btn"
                    onClick={() => {
                      setEditName(user.name);
                      setEditAvatar(user.avatar || '');
                      setIsEditing(true);
                    }}
                  >
                    <Edit3 size={16} /> Edit Profile
                  </button>
                ) : (
                  <button className="btn btn-secondary edit-btn" onClick={handleCancelEdit}>
                    <X size={16} /> Cancel Editing
                  </button>
                )}

                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Content & Edit Form */}
          <div className="profile-content-col">
            {/* Patron Stats Bar */}
            <div className="profile-stats-grid">
              <Link to="/orders" className="stat-card">
                <div className="stat-icon-wrap orders">
                  <Package size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.orders}</span>
                  <span className="stat-label">Orders Placed</span>
                </div>
                <ExternalLink size={16} className="stat-arrow" />
              </Link>

              <Link to="/wishlist" className="stat-card">
                <div className="stat-icon-wrap wishlist">
                  <Heart size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.wishlist}</span>
                  <span className="stat-label">Wishlist Items</span>
                </div>
                <ExternalLink size={16} className="stat-arrow" />
              </Link>

              <div className="stat-card">
                <div className="stat-icon-wrap reviews">
                  <Star size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.reviews}</span>
                  <span className="stat-label">Reviews Shared</span>
                </div>
              </div>
            </div>

            {/* Edit Profile Card (Conditional) */}
            {isEditing ? (
              <div className="profile-card edit-card">
                <div className="card-header">
                  <h3 className="card-title">Edit Account Details</h3>
                  <p className="card-subtitle">Update your display name and profile picture URL.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="profile-edit-form">
                  <div className="form-group">
                    <label htmlFor="edit-name">Full Name *</label>
                    <input
                      id="edit-name"
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-avatar">Avatar Image URL (Optional)</label>
                    <input
                      id="edit-avatar"
                      type="url"
                      className="form-control"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                    />
                    <small className="form-hint">
                      Paste a direct link to any high-resolution portrait or Unsplash photo.
                    </small>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      <Check size={16} /> {saving ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* Account Overview Card */}
            <div className="profile-card">
              <div className="card-header">
                <h3 className="card-title">Account Security & Credentials</h3>
                <p className="card-subtitle">Overview of your authentication settings on Craftora.</p>
              </div>

              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Password</span>
                  <span className="info-value">•••••••••••• (Encrypted via Scrypt)</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Access Level</span>
                  <span className="info-value">
                    {user.role === 'ADMIN' ? 'Platform Administrator' : 'Standard Marketplace Patron'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links / Next Steps */}
            <div className="quick-actions-bar">
              <Link to="/orders" className="quick-action-btn">
                <ShoppingBag size={18} />
                <span>View My Recent Orders</span>
              </Link>
              <Link to="/products" className="quick-action-btn">
                <Sparkles size={18} />
                <span>Discover New Crafts</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
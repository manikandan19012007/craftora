import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, Shield, Package, Heart, Star,
  Edit3, Check, X, LogOut, Sparkles, ExternalLink, ShoppingBag,
  Store, Camera, Upload, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMe, updateProfileApi, uploadAvatar } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './Profile.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

/** Resolve avatar path to a full URL */
function resolveAvatar(avatarPath) {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  // local upload path like /api/avatars/user_4_abc.jpg
  return `${API_BASE.replace('/api', '')}${avatarPath}`;
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [stats,      setStats]      = useState({ orders: 0, wishlist: 0, reviews: 0 });
  const [loading,    setLoading]    = useState(true);
  const [isEditing,  setIsEditing]  = useState(false);
  const [editName,   setEditName]   = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [saving,     setSaving]     = useState(false);

  // Avatar upload state
  const [avatarPreview,   setAvatarPreview]   = useState(null); // object URL for preview
  const [avatarFile,      setAvatarFile]      = useState(null); // actual File object
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
      return;
    }
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated, authLoading]);

  // Cleanup object URL on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await getMe();
      if (res.user) {
        updateUser(res.user);
        setEditName(res.user.name   || '');
        setEditMobile(res.user.mobile || '');
        if (res.user.stats) setStats(res.user.stats);
      }
    } catch (err) {
      addToast(err.message || 'Failed to sync profile data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Avatar file selection ─────────────────────────── */
  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Only image files are allowed (JPEG, PNG, WebP, GIF).', 'warning');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      addToast('Image is too large. Please choose a file under 3 MB.', 'warning');
      return;
    }

    // Revoke previous preview URL
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const res = await uploadAvatar(avatarFile);
      if (res.user) {
        updateUser(res.user);
        // Clear the local preview — real URL is now in user.avatar
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
        setAvatarFile(null);
        addToast('Profile photo updated!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to upload photo.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancelAvatarPreview = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ─── Profile text save ──────────────────────────────── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) { addToast('Name cannot be empty.', 'warning'); return; }
    if (editMobile && !/^[6-9]\d{9}$/.test(editMobile.trim())) {
      addToast('Mobile must be a valid 10-digit Indian number starting with 6–9.', 'warning');
      return;
    }
    try {
      setSaving(true);
      const res = await updateProfileApi({ name: editName.trim(), mobile: editMobile.trim() || '' });
      if (res.user) {
        updateUser(res.user);
        addToast('Profile updated successfully!', 'success');
        setIsEditing(false);
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(user?.name   || '');
    setEditMobile(user?.mobile || '');
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    addToast('You have been logged out.', 'info');
    navigate('/login');
  };

  if (authLoading || (loading && !user)) {
    return (
      <div className="container" style={{ padding: '5rem 0' }}>
        <LoadingSpinner text="Loading your profile..." />
      </div>
    );
  }
  if (!user) return null;

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })
    : 'Member since 2026';

  const roleLabel = { ADMIN: 'Platform Administrator', SELLER: 'Artisan / Seller', USER: 'Buyer / Patron' }[user.role] || 'Buyer / Patron';
  const rolePillClass = { ADMIN: 'admin', SELLER: 'seller', USER: 'user' }[user.role] || 'user';

  // Show local preview if one was chosen, otherwise use saved avatar
  const displayAvatar = avatarPreview || resolveAvatar(user.avatar) || DEFAULT_AVATAR;

  return (
    <div className="craftora-profile-page">
      {/* Top Banner */}
      <div className="profile-banner">
        <div className="container">
          <div className="profile-banner-inner">
            <span className="patron-badge"><Sparkles size={15} /> Verified Craftora Member</span>
            <h1 className="profile-banner-title">My Account</h1>
            <p className="profile-banner-subtitle">
              Manage your personal details, monitor order statuses, and track your artisan impact.
            </p>
          </div>
        </div>
      </div>

      <div className="container profile-main-container">
        <div className="profile-grid-layout">

          {/* ── Left Column: Identity Card ── */}
          <div className="profile-sidebar-col">
            <div className="patron-identity-card">

              {/* ── Avatar with upload overlay ── */}
              <div className="patron-avatar-wrap">
                <img
                  src={displayAvatar}
                  alt={user.name}
                  className="patron-avatar-img"
                  onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                />
                <span className={`role-pill ${rolePillClass}`}>{roleLabel}</span>

                {/* Camera overlay — always visible */}
                <button
                  className="avatar-upload-overlay"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change profile photo"
                  aria-label="Upload profile photo"
                  type="button"
                >
                  <Camera size={18} />
                  <span>Change Photo</span>
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleAvatarFileChange}
                  aria-label="Select profile photo"
                />
              </div>

              {/* Preview action bar — shown only when a new file is chosen */}
              {avatarFile && (
                <div className="avatar-preview-actions">
                  <p className="avatar-preview-hint">
                    <Upload size={13} /> New photo ready — save to apply
                  </p>
                  <div className="avatar-preview-btns">
                    <button
                      className="btn btn-primary avatar-save-btn"
                      onClick={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      type="button"
                    >
                      {uploadingAvatar ? 'Uploading...' : 'Save Photo'}
                    </button>
                    <button
                      className="avatar-cancel-btn"
                      onClick={handleCancelAvatarPreview}
                      disabled={uploadingAvatar}
                      type="button"
                      title="Discard selected photo"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="avatar-file-name">{avatarFile.name}</p>
                </div>
              )}

              <h2 className="patron-name">{user.name}</h2>
              <p className="patron-email">{user.email}</p>
              {user.mobile && <p className="patron-mobile">📱 {user.mobile}</p>}

              <div className="patron-meta-list">
                <div className="patron-meta-row"><Calendar size={16} /><span>Joined {joinDate}</span></div>
                <div className="patron-meta-row"><Shield size={16} /><span>Account Status: Active</span></div>
              </div>

              <div className="patron-actions">
                {!isEditing ? (
                  <button className="btn btn-outline edit-btn" onClick={() => { setEditName(user.name); setEditMobile(user.mobile || ''); setIsEditing(true); }}>
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

          {/* ── Right Column ── */}
          <div className="profile-content-col">

            {/* Stats Bar */}
            <div className="profile-stats-grid">
              <Link to="/orders" className="stat-card">
                <div className="stat-icon-wrap orders"><Package size={24} /></div>
                <div className="stat-info"><span className="stat-value">{stats.orders}</span><span className="stat-label">Orders Placed</span></div>
                <ExternalLink size={16} className="stat-arrow" />
              </Link>
              <Link to="/wishlist" className="stat-card">
                <div className="stat-icon-wrap wishlist"><Heart size={24} /></div>
                <div className="stat-info"><span className="stat-value">{stats.wishlist}</span><span className="stat-label">Wishlist Items</span></div>
                <ExternalLink size={16} className="stat-arrow" />
              </Link>
              <div className="stat-card">
                <div className="stat-icon-wrap reviews"><Star size={24} /></div>
                <div className="stat-info"><span className="stat-value">{stats.reviews}</span><span className="stat-label">Reviews Shared</span></div>
              </div>
            </div>

            {/* Edit Profile Form */}
            {isEditing && (
              <div className="profile-card edit-card">
                <div className="card-header">
                  <h3 className="card-title">Edit Account Details</h3>
                  <p className="card-subtitle">Update your display name and mobile number.</p>
                </div>
                <form onSubmit={handleSaveProfile} className="profile-edit-form">
                  <div className="form-group">
                    <label htmlFor="edit-name">Full Name *</label>
                    <input id="edit-name" type="text" className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-mobile">Mobile Number (optional)</label>
                    <input
                      id="edit-mobile" type="tel" className="form-control"
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit Indian mobile number"
                      inputMode="numeric" maxLength={10}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      <Check size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} disabled={saving}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Account Details Card */}
            <div className="profile-card">
              <div className="card-header">
                <h3 className="card-title">Account Information</h3>
                <p className="card-subtitle">Your registered details on Craftora.</p>
              </div>
              <div className="info-list">
                <div className="info-item"><span className="info-label"><User size={14} /> Full Name</span><span className="info-value">{user.name}</span></div>
                <div className="info-item"><span className="info-label"><Mail size={14} /> Email Address</span><span className="info-value">{user.email}</span></div>
                {user.mobile && (
                  <div className="info-item"><span className="info-label"><Phone size={14} /> Mobile Number</span><span className="info-value">{user.mobile}</span></div>
                )}
                <div className="info-item"><span className="info-label"><Shield size={14} /> Account Type</span><span className="info-value">{roleLabel}</span></div>
                <div className="info-item"><span className="info-label"><Calendar size={14} /> Member Since</span><span className="info-value">{joinDate}</span></div>
                <div className="info-item"><span className="info-label">Password</span><span className="info-value">•••••••••••• (Encrypted via Scrypt)</span></div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="quick-actions-bar">
              <Link to="/orders" className="quick-action-btn"><ShoppingBag size={18} /><span>View My Recent Orders</span></Link>
              {user.role === 'SELLER' && (
                <Link to="/seller" className="quick-action-btn"><Store size={18} /><span>Go to Seller Dashboard</span></Link>
              )}
              <Link to="/products" className="quick-action-btn"><Sparkles size={18} /><span>Discover New Crafts</span></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
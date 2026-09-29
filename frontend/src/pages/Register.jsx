import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, ShoppingBag, Palette, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [role, setRole] = useState('USER'); // 'USER' | 'SELLER'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Artisan-specific fields
  const [craftName, setCraftName] = useState('');
  const [craftCategory, setCraftCategory] = useState('Pottery & Ceramics');
  const [location, setLocation] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-check.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        confirm_password: confirmPassword,
        role: role === 'SELLER' ? 'SELLER' : 'USER',
        craft_name: role === 'SELLER' ? craftName : null,
        craft_category: role === 'SELLER' ? craftCategory : null,
        location: role === 'SELLER' ? location : null
      });

      addToast(`Account created successfully as ${role === 'SELLER' ? 'Artisan' : 'Patron'}!`, 'success');
      navigate(role === 'SELLER' ? '/seller' : '/profile');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <span className="brand-icon">🧶</span>
            <span className="brand-name">CRAFTORA</span>
          </div>
          <h2>Join the CRAFTORA Family</h2>
          <p>Support ethical handmade crafts or showcase your artisan workshop.</p>
        </div>

        {/* ROLE SELECTION BUTTONS */}
        <div className="role-switcher-tabs">
          <button
            type="button"
            className={`role-tab-btn ${role === 'USER' ? 'active' : ''}`}
            onClick={() => setRole('USER')}
          >
            <ShoppingBag size={16} />
            <span>I want to Shop (Buyer)</span>
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'SELLER' ? 'active' : ''}`}
            onClick={() => setRole('SELLER')}
          >
            <Palette size={16} />
            <span>I am an Artisan (Seller)</span>
          </button>
        </div>

        {errorMsg && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="reg-name">{role === 'SELLER' ? 'Artisan / Master Craftsman Name' : 'Full Name'}</label>
            <div className="input-field-wrap">
              <User size={18} className="input-icon" />
              <input
                id="reg-name"
                type="text"
                placeholder={role === 'SELLER' ? 'e.g. Master Rajesh Kumar' : 'e.g. Ananya Sharma'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {role === 'SELLER' && (
            <>
              <div className="auth-input-group">
                <label htmlFor="reg-craft">Studio / Workshop Brand</label>
                <div className="input-field-wrap">
                  <Palette size={18} className="input-icon" />
                  <input
                    id="reg-craft"
                    type="text"
                    placeholder="e.g. Blue Clay Pottery Studio"
                    value={craftName}
                    onChange={(e) => setCraftName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="reg-cat">Primary Craft Discipline</label>
                <select
                  id="reg-cat"
                  value={craftCategory}
                  onChange={(e) => setCraftCategory(e.target.value)}
                  className="auth-select-field"
                >
                  <option value="Pottery & Ceramics">Pottery & Ceramics</option>
                  <option value="Handmade Jewelry">Handmade Jewelry</option>
                  <option value="Wood Crafts">Wood Crafts</option>
                  <option value="Handmade Bags">Handmade Bags</option>
                  <option value="Home Decor">Home Decor</option>
                  <option value="Paintings & Art">Paintings & Art</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Gifts">Gifts & Keepsakes</option>
                </select>
              </div>

              <div className="auth-input-group">
                <label htmlFor="reg-loc">Artisan Workshop City & State</label>
                <div className="input-field-wrap">
                  <MapPin size={18} className="input-icon" />
                  <input
                    id="reg-loc"
                    type="text"
                    placeholder="e.g. Jaipur, Rajasthan"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="auth-input-group">
            <label htmlFor="reg-email">Email Address</label>
            <div className="input-field-wrap">
              <Mail size={18} className="input-icon" />
              <input
                id="reg-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="reg-password">Password (minimum 6 characters)</label>
            <div className="input-field-wrap">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <div className="input-field-wrap">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-confirm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            <UserPlus size={18} />
            <span>{loading ? 'Creating Account...' : role === 'SELLER' ? 'Register Artisan Workshop' : 'Create Patron Account'}</span>
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
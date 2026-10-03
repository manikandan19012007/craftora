import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShoppingBag, Palette, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');

  // Redirect destination after login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      addToast(`Welcome back, ${user.name}!`, 'success');

      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'SELLER' || user.role === 'ARTISAN') {
        navigate('/seller', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
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
          <h2>Sign In to CRAFTORA</h2>
          <p>Access your personalized crafts marketplace account.</p>
        </div>

        {/* Role info cards — informational only, no pre-filling */}
        <div className="role-cards-grid">
          <div className="role-card role-info-card">
            <div className="role-card-icon buyer-icon">
              <ShoppingBag size={22} />
            </div>
            <div className="role-card-info">
              <strong>Buyer</strong>
              <span>Browse, customize &amp; order handmade products</span>
            </div>
          </div>

          <div className="role-card role-info-card">
            <div className="role-card-icon seller-icon">
              <Palette size={22} />
            </div>
            <div className="role-card-info">
              <strong>Artisan / Seller</strong>
              <span>Manage your studio, products &amp; orders</span>
            </div>
          </div>

          <div className="role-card role-info-card">
            <div className="role-card-icon admin-icon">
              <Shield size={22} />
            </div>
            <div className="role-card-info">
              <strong>Admin</strong>
              <span>Manage marketplace, artisans &amp; analytics</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-field-wrap">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="label-with-link">
              <label htmlFor="password">Password</label>
            </div>
            <div className="input-field-wrap">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            <LogIn size={18} />
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New to Craftora?{' '}
            <Link to="/register" className="auth-switch-link">
              Create an account <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
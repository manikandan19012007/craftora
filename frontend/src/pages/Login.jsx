import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, ShoppingBag, Palette, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [activeRole, setActiveRole] = useState('buyer'); // 'buyer' | 'seller' | 'admin'
  const [email, setEmail] = useState('ananya@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect destination after login
  const from = location.state?.from?.pathname || (activeRole === 'seller' ? '/seller' : activeRole === 'admin' ? '/admin' : '/');

  const handleRoleTabClick = (role) => {
    setActiveRole(role);
    setErrorMsg('');
    if (role === 'buyer') {
      setEmail('ananya@example.com');
      setPassword('password123');
    } else if (role === 'seller') {
      setEmail('artisan@craftora.com');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmail('admin@craftora.com');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await login(email, password);
      addToast(`Welcome back, ${user.name}!`, 'success');
      
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'SELLER' || user.role === 'ARTISAN') {
        navigate('/seller', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
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
          <p>Access your personalized crafts, artisan studio, or marketplace management.</p>
        </div>

        {/* ── ROLE SELECTION CARDS ────────────────────── */}
        <div className="role-cards-grid">
          {/* Buyer Card */}
          <button
            type="button"
            className={`role-card ${activeRole === 'buyer' ? 'active' : ''}`}
            onClick={() => handleRoleTabClick('buyer')}
            aria-pressed={activeRole === 'buyer'}
          >
            <div className="role-card-icon buyer-icon">
              <ShoppingBag size={22} />
            </div>
            <div className="role-card-info">
              <strong>Buyer</strong>
              <span>Browse, customize &amp; order handmade products</span>
            </div>
            {activeRole === 'buyer' && <span className="role-active-dot" aria-hidden="true" />}
          </button>

          {/* Seller / Artisan Card */}
          <button
            type="button"
            className={`role-card ${activeRole === 'seller' ? 'active' : ''}`}
            onClick={() => handleRoleTabClick('seller')}
            aria-pressed={activeRole === 'seller'}
          >
            <div className="role-card-icon seller-icon">
              <Palette size={22} />
            </div>
            <div className="role-card-info">
              <strong>Artisan / Seller</strong>
              <span>Manage your studio, products &amp; orders</span>
            </div>
            {activeRole === 'seller' && <span className="role-active-dot" aria-hidden="true" />}
          </button>

          {/* Admin Card */}
          <button
            type="button"
            className={`role-card ${activeRole === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleTabClick('admin')}
            aria-pressed={activeRole === 'admin'}
          >
            <div className="role-card-icon admin-icon">
              <Shield size={22} />
            </div>
            <div className="role-card-info">
              <strong>Admin</strong>
              <span>Manage marketplace, artisans &amp; analytics</span>
            </div>
            {activeRole === 'admin' && <span className="role-active-dot" aria-hidden="true" />}
          </button>
        </div>

        {/* Demo credentials banner */}
        <div className="demo-credentials-banner">
          <span className="demo-badge">Demo Mode</span>
          <span>
            {activeRole === 'buyer' && 'ananya@example.com / password123'}
            {activeRole === 'seller' && 'artisan@craftora.com / password123'}
            {activeRole === 'admin' && 'admin@craftora.com / password123'}
          </span>
        </div>


        {errorMsg && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-field-wrap">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="label-with-link">
              <label htmlFor="password">Password</label>
              <span className="forgot-link" onClick={() => addToast('All demo accounts use password: password123', 'info')}>
                Forgot password?
              </span>
            </div>
            <div className="input-field-wrap">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            <LogIn size={18} />
            <span>{loading ? 'Authenticating...' : `Sign In as ${activeRole === 'buyer' ? 'Buyer' : activeRole === 'seller' ? 'Artisan' : 'Admin'}`}</span>
          </button>
        </form>

        {/* DEMO ONE-CLICK CREDENTIALS BAR */}
        <div className="demo-credentials-box">
          <h4>🧪 One-Click Demo Credentials:</h4>
          <div className="demo-buttons-grid">
            <button 
              type="button" 
              className={`demo-btn ${activeRole === 'buyer' ? 'highlight' : ''}`}
              onClick={() => handleRoleTabClick('buyer')}
            >
              <strong>🛍️ Patron/Buyer</strong>
              <span>ananya@example.com</span>
            </button>
            <button 
              type="button" 
              className={`demo-btn ${activeRole === 'seller' ? 'highlight' : ''}`}
              onClick={() => handleRoleTabClick('seller')}
            >
              <strong>🎨 Master Artisan</strong>
              <span>artisan@craftora.com</span>
            </button>
            <button 
              type="button" 
              className={`demo-btn ${activeRole === 'admin' ? 'highlight' : ''}`}
              onClick={() => handleRoleTabClick('admin')}
            >
              <strong>🛡️ Platform Admin</strong>
              <span>admin@craftora.com</span>
            </button>
          </div>
        </div>

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
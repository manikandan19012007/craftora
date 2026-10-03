import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus, Mail, Lock, User, Phone, Eye, EyeOff,
  AlertCircle, CheckCircle2, ShoppingBag, Palette, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

const PASSWORD_RULES = [
  { id: 'length',  label: 'At least 8 characters',          test: (p) => p.length >= 8 },
  { id: 'letter',  label: 'Contains a letter',              test: (p) => /[A-Za-z]/.test(p) },
  { id: 'digit',   label: 'Contains a number',              test: (p) => /\d/.test(p) },
];

export default function Register() {
  const navigate     = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [role,            setRole]            = useState('USER'); // 'USER' | 'SELLER'
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [mobile,          setMobile]          = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Seller-only fields
  const [craftName,     setCraftName]     = useState('');
  const [craftCategory, setCraftCategory] = useState('Pottery & Ceramics');
  const [location,      setLocation]      = useState('');

  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(password));

  const validate = () => {
    if (!name.trim())  return 'Full name is required.';
    if (!email.trim()) return 'Email address is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
      return 'Please enter a valid email address.';
    if (mobile && !/^[6-9]\d{9}$/.test(mobile.trim()))
      return 'Mobile number must be a valid 10-digit Indian number starting with 6–9.';
    if (password.length < 8)
      return 'Password must be at least 8 characters long.';
    if (!/[A-Za-z]/.test(password))
      return 'Password must contain at least one letter.';
    if (!/\d/.test(password))
      return 'Password must contain at least one number.';
    if (password !== confirmPassword)
      return 'Passwords do not match. Please re-check.';
    if (role === 'SELLER' && !craftName.trim())
      return 'Studio / Workshop brand name is required for Artisan accounts.';
    if (role === 'SELLER' && !location.trim())
      return 'Workshop city & state is required for Artisan accounts.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoading(true);
    try {
      await register({
        name:             name.trim(),
        email:            email.trim().toLowerCase(),
        mobile:           mobile.trim() || undefined,
        password,
        confirm_password: confirmPassword,
        role:             role === 'SELLER' ? 'SELLER' : 'USER',
        craft_name:       role === 'SELLER' ? craftName.trim() : undefined,
        craft_category:   role === 'SELLER' ? craftCategory    : undefined,
        location:         role === 'SELLER' ? location.trim()  : undefined,
      });

      addToast(
        `Account created successfully! Please sign in to continue.`,
        'success'
      );
      navigate('/login');
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

        {/* ROLE SELECTION */}
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

        <form onSubmit={handleSubmit} className="auth-form" noValidate>

          {/* Full Name */}
          <div className="auth-input-group">
            <label htmlFor="reg-name">
              {role === 'SELLER' ? 'Artisan / Master Craftsman Name' : 'Full Name'} *
            </label>
            <div className="input-field-wrap">
              <User size={18} className="input-icon" />
              <input
                id="reg-name"
                type="text"
                placeholder={role === 'SELLER' ? 'e.g. Rajesh Kumar' : 'e.g. Ananya Sharma'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Seller-specific fields */}
          {role === 'SELLER' && (
            <>
              <div className="auth-input-group">
                <label htmlFor="reg-craft">Studio / Workshop Brand *</label>
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
                <label htmlFor="reg-cat">Primary Craft Discipline *</label>
                <select
                  id="reg-cat"
                  value={craftCategory}
                  onChange={(e) => setCraftCategory(e.target.value)}
                  className="auth-select-field"
                >
                  <option value="Pottery &amp; Ceramics">Pottery &amp; Ceramics</option>
                  <option value="Handmade Jewelry">Handmade Jewelry</option>
                  <option value="Wood Crafts">Wood Crafts</option>
                  <option value="Handmade Bags">Handmade Bags</option>
                  <option value="Home Decor">Home Decor</option>
                  <option value="Paintings &amp; Art">Paintings &amp; Art</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Gifts">Gifts &amp; Keepsakes</option>
                </select>
              </div>

              <div className="auth-input-group">
                <label htmlFor="reg-loc">Artisan Workshop City &amp; State *</label>
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

          {/* Email */}
          <div className="auth-input-group">
            <label htmlFor="reg-email">Email Address *</label>
            <div className="input-field-wrap">
              <Mail size={18} className="input-icon" />
              <input
                id="reg-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="auth-input-group">
            <label htmlFor="reg-mobile">Mobile Number <span className="optional-label">(optional)</span></label>
            <div className="input-field-wrap">
              <Phone size={18} className="input-icon" />
              <input
                id="reg-mobile"
                type="tel"
                placeholder="10-digit Indian mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                autoComplete="tel"
                maxLength={10}
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-input-group">
            <label htmlFor="reg-password">Password *</label>
            <div className="input-field-wrap">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters, letter + number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
                autoComplete="new-password"
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

            {/* Password strength hints */}
            {(passwordFocused || password.length > 0) && (
              <ul className="password-rules-list">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <li key={rule.id} className={passed ? 'rule-pass' : 'rule-fail'}>
                      {passed ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-input-group">
            <label htmlFor="reg-confirm">Confirm Password *</label>
            <div className="input-field-wrap">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={`confirm-match-hint ${password === confirmPassword ? 'match-ok' : 'match-fail'}`}>
                {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            <UserPlus size={18} />
            <span>
              {loading
                ? 'Creating Account...'
                : role === 'SELLER'
                  ? 'Register Artisan Workshop'
                  : 'Create Account'}
            </span>
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
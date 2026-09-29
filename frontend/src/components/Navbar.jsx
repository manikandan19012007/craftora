import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Heart, User, Search, LogOut, Shield, Menu, X, 
  Palette, Sparkles, ChevronDown, LayoutGrid
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './Navbar.css';

const CATEGORY_NAV = [
  { label: '☰ All Categories', slug: null, path: '/categories' },
  { label: 'Men', slug: 'Men', path: '/products?gender=Men' },
  { label: 'Women', slug: 'Women', path: '/products?gender=Women' },
  { label: 'Kids', slug: 'Kids', path: '/products?gender=Kids' },
  { label: 'Home & Living', slug: 'Home & Living', path: '/products?category=Home+%26+Living' },
  { label: 'Jewelry', slug: 'Jewelry', path: '/products?category=Jewelry' },
  { label: 'Gifts', slug: 'Gifts', path: '/products?category=Gifts' },
  { label: 'Art & Crafts', slug: 'Art & Crafts', path: '/products?category=Art+%26+Crafts' },
  { label: 'Bags', slug: 'Bags & Accessories', path: '/products?category=Bags+%26+Accessories' },
  { label: 'Artisans', slug: null, path: '/artisans' },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isSeller, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { totalItemsCount } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    addToast('You have been signed out.', 'info');
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="craftora-navbar-wrap">
      {/* ─── TOP ANNOUNCEMENT BAR ─────────────────────────────── */}
      <div className="announcement-bar">
        <div className="container announcement-inner">
          <span>✨ Discover handcrafted products made by independent Indian artisans — Free Shipping Over ₹1,000</span>
          <div className="announcement-right">
            <span>₹ INR</span>
            <span>100% Authentic Handmade</span>
            <span>Pan-India Delivery</span>
          </div>
        </div>
      </div>

      {/* ─── MAIN NAVBAR ──────────────────────────────────────── */}
      <div className="container navbar-inner">
        {/* Mobile Hamburger */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={closeMobileMenu}>
          <span className="brand-icon">🧶</span>
          <div className="brand-text-col">
            <span className="brand-name">CRAFTORA</span>
            <span className="brand-tagline">Handmade &amp; Customized</span>
          </div>
        </Link>

        {/* Desktop Search Bar */}
        <form className="nav-search-box" onSubmit={handleSearchSubmit} role="search">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search handmade products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search handmade products"
          />
          <button type="submit" className="nav-search-submit" aria-label="Search">
            Search
          </button>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} end>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Products
          </NavLink>
          <NavLink to="/artisans" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Artisans
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            About
          </NavLink>
          {isSeller && (
            <NavLink to="/seller" className={({ isActive }) => isActive ? 'nav-item active seller-nav-link' : 'nav-item seller-nav-link'}>
              <Palette size={14} /> Studio
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-item active admin-nav-link' : 'nav-item admin-nav-link'}>
              <Shield size={14} /> Admin
            </NavLink>
          )}
        </nav>

        {/* User Actions */}
        <div className="nav-actions">
          <Link to="/wishlist" className="action-btn" title="Wishlist" aria-label="Wishlist" onClick={closeMobileMenu}>
            <Heart size={20} />
            {wishlistCount > 0 && <span className="badge" aria-label={`${wishlistCount} items in wishlist`}>{wishlistCount}</span>}
          </Link>
          <Link to="/cart" className="action-btn" title="Shopping Cart" aria-label="Shopping cart" onClick={closeMobileMenu}>
            <ShoppingBag size={20} />
            {totalItemsCount > 0 && <span className="badge" aria-label={`${totalItemsCount} items in cart`}>{totalItemsCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="nav-user-profile-menu">
              <Link
                to={isAdmin ? '/admin' : isSeller ? '/seller' : '/profile'}
                className="user-profile-trigger"
                title={user.name}
                onClick={closeMobileMenu}
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                  alt={user.name}
                  className="nav-user-avatar"
                />
                <span className="nav-user-name">{user.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="action-btn logout-btn" title="Sign out" aria-label="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="action-btn user-btn" title="Sign in" onClick={closeMobileMenu}>
              <User size={18} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* ─── CATEGORY SUB-NAVIGATION BAR ─────────────────────── */}
      <nav className="category-nav-bar" aria-label="Category navigation">
        <div className="container category-nav-inner">
          {CATEGORY_NAV.map((cat) => (
            <Link
              key={cat.label}
              to={cat.path}
              className={`cat-nav-link ${cat.slug === null && cat.path === '/categories' ? 'cat-nav-all' : ''}`}
              aria-label={`Browse ${cat.label}`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ─── MOBILE DRAWER ────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-label="Mobile navigation">
          <form className="mobile-search-bar" onSubmit={(e) => { handleSearchSubmit(e); closeMobileMenu(); }}>
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Search handmade products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search"
            />
          </form>

          <nav className="mobile-nav-links">
            <NavLink to="/" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'mobile-link active' : 'mobile-link'} end>
              Home
            </NavLink>
            <NavLink to="/products" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'mobile-link active' : 'mobile-link'}>
              All Products
            </NavLink>

            {/* Category shortcuts in mobile */}
            <div className="mobile-category-row">
              {['Men', 'Women', 'Kids', 'Jewelry', 'Gifts'].map(cat => (
                <Link
                  key={cat}
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  onClick={closeMobileMenu}
                  className="mobile-cat-chip"
                >
                  {cat}
                </Link>
              ))}
            </div>

            <NavLink to="/categories" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'mobile-link active' : 'mobile-link'}>
              All Categories
            </NavLink>
            <NavLink to="/artisans" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'mobile-link active' : 'mobile-link'}>
              Meet Artisans
            </NavLink>
            <NavLink to="/about" onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'mobile-link active' : 'mobile-link'}>
              About CRAFTORA
            </NavLink>
            {isSeller && (
              <NavLink to="/seller" onClick={closeMobileMenu} className="mobile-link seller-link">
                <Palette size={16} /> Artisan Studio Dashboard
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" onClick={closeMobileMenu} className="mobile-link admin-mobile-link">
                <Shield size={16} /> Admin Control Center
              </NavLink>
            )}
            {isAuthenticated ? (
              <>
                <NavLink to="/orders" onClick={closeMobileMenu} className="mobile-link">My Orders</NavLink>
                <NavLink to="/wishlist" onClick={closeMobileMenu} className="mobile-link">Wishlist ({wishlistCount})</NavLink>
                <NavLink to="/cart" onClick={closeMobileMenu} className="mobile-link">Cart ({totalItemsCount})</NavLink>
                <NavLink to="/profile" onClick={closeMobileMenu} className="mobile-link">Profile</NavLink>
                <button onClick={handleLogout} className="mobile-logout-btn">
                  <LogOut size={16} /> Sign Out ({user.name})
                </button>
              </>
            ) : (
              <NavLink to="/login" onClick={closeMobileMenu} className="mobile-link login-link">
                <User size={16} /> Sign In / Register
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
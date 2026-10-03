import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Sparkles, Truck, Award, Mail } from 'lucide-react';

// lucide-react v1.41+ removed brand icons — use inline SVGs instead
const Instagram = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const Facebook = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const Twitter = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);
import './Footer.css';

export default function Footer() {
  return (
    <footer className="craftora-footer">

      {/* ─── VALUE TRUST STRIP ──────────────────────── */}
      <div className="footer-trust-strip">
        <div className="container trust-strip-inner">
          <div className="trust-item">
            <div className="trust-icon-wrap">
              <ShieldCheck size={22} />
            </div>
            <div>
              <strong>Verified Artisans</strong>
              <span>100% hand-vetted creators</span>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon-wrap">
              <Sparkles size={22} />
            </div>
            <div>
              <strong>Bespoke Customization</strong>
              <span>Personalized text, engravings & sizes</span>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon-wrap">
              <Truck size={22} />
            </div>
            <div>
              <strong>Eco-Conscious Shipping</strong>
              <span>Biodegradable packaging</span>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon-wrap">
              <Award size={22} />
            </div>
            <div>
              <strong>Fair-Trade Value</strong>
              <span>85% goes directly to creators</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN FOOTER CONTENT ────────────────────── */}
      <div className="container footer-content">

        {/* Brand Column */}
        <div className="footer-brand-col">
          <div className="footer-brand-logo">
            <span className="footer-brand-icon">🧶</span>
            <div>
              <span className="footer-brand-name">CRAFTORA</span>
              <span className="footer-brand-tagline">Handmade &amp; Customized</span>
            </div>
          </div>
          <p className="footer-brand-desc">
            Empowering independent Indian master artisans through digital marketing,
            authentic direct trade, and made-to-order craftsmanship since 2024.
          </p>
          {/* Social Links */}
          <div className="footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
              <Twitter size={18} />
            </a>
            <a href="mailto:hello@craftora.in" className="social-link" aria-label="Email us">
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Shop Column */}
        <div className="footer-links-col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/products?gender=Women">Women</Link></li>
            <li><Link to="/products?gender=Men">Men</Link></li>
            <li><Link to="/products?gender=Kids">Kids</Link></li>
            <li><Link to="/products?category=Jewelry">Jewelry</Link></li>
            <li><Link to="/products?category=Home+%26+Living">Home &amp; Living</Link></li>
            <li><Link to="/products?category=Gifts">Gifts</Link></li>
            <li><Link to="/products?category=Art+%26+Crafts">Art &amp; Crafts</Link></li>
            <li><Link to="/products?category=Bags+%26+Accessories">Bags &amp; Accessories</Link></li>
          </ul>
        </div>

        {/* Explore Column */}
        <div className="footer-links-col">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/artisans">Meet Artisans</Link></li>
            <li><Link to="/categories">All Categories</Link></li>
            <li><Link to="/seller">Artisan Studio Portal</Link></li>
            <li><Link to="/register">Sell Your Creations</Link></li>
            <li><Link to="/about">Our Ethical Sourcing</Link></li>
            <li><Link to="/about">CRAFTORA Story</Link></li>
          </ul>
        </div>

        {/* Support Column */}
        <div className="footer-links-col">
          <h4>Support</h4>
          <ul>
            <li><Link to="/profile">My Account</Link></li>
            <li><Link to="/orders">Order Tracking</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
            <li><Link to="/wishlist">My Wishlist</Link></li>
            <li><a href="mailto:support@craftora.in">Contact Support</a></li>
            <li><Link to="/login">Sign In / Register</Link></li>
          </ul>
        </div>
      </div>

      {/* ─── NEWSLETTER BAR ─────────────────────────── */}
      <div className="footer-newsletter-strip">
        <div className="container newsletter-inner">
          <div className="newsletter-text">
            <strong>✉️ Join the Craftora Circle</strong>
            <span>Get curated handmade drops, artisan stories &amp; exclusive discounts</span>
          </div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              aria-label="Email for newsletter"
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      {/* ─── BOTTOM BAR ─────────────────────────────── */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            © {new Date().getFullYear()} CRAFTORA Handmade Marketplace — Crafted with&nbsp;
            <Heart size={12} className="heart-icon" fill="#2563EB" color="#2563EB" />
            &nbsp;for conscious Indian living.
          </p>
          <div className="footer-legal-links">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Artisan Code of Ethics</span>
            <span>·</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Award, Star, ArrowLeft, Package, Sparkles, Phone, Mail, Share2 } from 'lucide-react';
import { getArtisanById } from '../services/api';
import ProductCard from '../components/ProductCard';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useToast } from '../context/ToastContext';
import './ArtisanProfile.css';

export default function ArtisanProfile() {
  const { id } = useParams();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchArtisanDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getArtisanById(id);
      setArtisan(data.artisan || null);
    } catch (err) {
      setError(err.message || 'Failed to load artisan profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtisanDetails();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Artisan profile link copied to clipboard!', 'info');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0' }}>
        <LoadingSpinner text="Fetching artisan story & master catalog..." />
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="container" style={{ padding: '5rem 0' }}>
        <ErrorMessage message={error || 'Artisan not found.'} onRetry={fetchArtisanDetails} />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/artisans" className="btn btn-secondary">
            <ArrowLeft size={16} /> Back to Artisans Directory
          </Link>
        </div>
      </div>
    );
  }

  const {
    name,
    specialty,
    bio,
    location,
    image,
    experience = '5+ years',
    rating = 5.0,
    products = []
  } = artisan;

  return (
    <div className="craftora-artisan-profile-page">
      {/* Top Breadcrumb Navigation */}
      <div className="profile-top-bar">
        <div className="container">
          <Link to="/artisans" className="back-link">
            <ArrowLeft size={16} /> Back to Master Artisans
          </Link>
        </div>
      </div>

      {/* Hero Studio Banner */}
      <section className="artisan-hero-section">
        <div className="artisan-cover-art" />
        <div className="container">
          <div className="artisan-profile-card">
            <div className="artisan-avatar-container">
              <img 
                src={image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'} 
                alt={name} 
                className="artisan-main-avatar"
              />
              <span className="craft-badge">{specialty}</span>
            </div>

            <div className="artisan-info-col">
              <div className="artisan-title-row">
                <h1 className="artisan-fullname">{name}</h1>
                <button className="share-profile-btn" onClick={handleShare} title="Share Profile">
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>

              <div className="artisan-pills-row">
                <span className="pill-item">
                  <MapPin size={15} /> {location}
                </span>
                <span className="pill-item">
                  <Award size={15} /> {experience} Crafting Experience
                </span>
                <span className="pill-item rating-pill">
                  <RatingStars rating={rating} size={15} />
                  <strong>{rating ? Number(rating).toFixed(1) : '5.0'} / 5.0</strong>
                </span>
              </div>

              <p className="artisan-biography">{bio}</p>

              <div className="artisan-highlights-grid">
                <div className="highlight-box">
                  <span className="h-val">{products.length}</span>
                  <span className="h-lbl">Handmade Products</span>
                </div>
                <div className="highlight-box">
                  <span className="h-val">100%</span>
                  <span className="h-lbl">Ethically Sourced</span>
                </div>
                <div className="highlight-box">
                  <span className="h-val">Direct</span>
                  <span className="h-lbl">Patron Impact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artisan's Handcrafted Catalog */}
      <section className="artisan-products-section">
        <div className="container">
          <div className="catalog-header">
            <div>
              <span className="section-eyebrow">
                <Sparkles size={16} /> Direct from the Studio
              </span>
              <h2 className="catalog-title">Handcrafted Creations by {name}</h2>
              <p className="catalog-desc">
                Every purchase directly supports {name}'s rural livelihood, family workshop, and the survival of traditional Indian craft.
              </p>
            </div>
            <div className="catalog-count-pill">
              <Package size={16} />
              <span>{products.length} {products.length === 1 ? 'Item' : 'Items'} Available</span>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="artisan-no-products">
              <Package size={48} />
              <h3>No creations currently listed</h3>
              <p>This artisan is currently crafting new pieces in their workshop. Check back soon!</p>
              <Link to="/products" className="btn btn-primary">
                Explore Other Creations
              </Link>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
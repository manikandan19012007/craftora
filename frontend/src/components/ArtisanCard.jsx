import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Award, ChevronRight } from 'lucide-react';
import RatingStars from './RatingStars';
import './ArtisanCard.css';

export default function ArtisanCard({ artisan }) {
  if (!artisan) return null;

  const {
    id,
    name,
    bio,
    specialty,
    location,
    image,
    experience = '5+ years',
    rating = 5.0,
    product_count = 0
  } = artisan;

  return (
    <div className="craftora-artisan-card">
      <div className="artisan-header-banner" />
      
      <div className="artisan-avatar-wrap">
        <img 
          src={image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'} 
          alt={name}
          className="artisan-avatar-img" 
        />
        <div className="artisan-badge-chip" title={specialty}>
          {specialty}
        </div>
      </div>

      <div className="artisan-body">
        <h3 className="artisan-name">{name}</h3>
        
        <div className="artisan-meta-row">
          <span className="artisan-meta-item">
            <MapPin size={14} /> {location}
          </span>
          <span className="artisan-meta-item">
            <Award size={14} /> {experience}
          </span>
        </div>

        <div className="artisan-rating-box">
          <RatingStars rating={rating} size={14} />
        </div>

        <p className="artisan-bio">{bio}</p>

        <div className="artisan-footer">
          <span className="artisan-products-stat">
            <strong>{product_count}</strong> {product_count === 1 ? 'Product' : 'Products'}
          </span>
          <Link to={`/artisans/${id}`} className="artisan-profile-btn">
            <span>View Profile</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
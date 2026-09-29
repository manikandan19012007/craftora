import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryCard.css';

export default function CategoryCard({ category }) {
  if (!category) return null;

  const { id, name, description, image } = category;

  return (
    <Link to={`/products?category=${encodeURIComponent(name)}`} className="craftora-category-card">
      <div className="category-image-wrap">
        <img 
          src={image || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=500&q=80'} 
          alt={name}
          loading="lazy" 
        />
        <div className="category-overlay" />
      </div>
      <div className="category-content">
        <h3>{name}</h3>
        {description && <p>{description}</p>}
        <span className="category-explore-link">Explore Craft →</span>
      </div>
    </Link>
  );
}
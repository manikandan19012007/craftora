import React from 'react';
import { Star } from 'lucide-react';
import './RatingStars.css';

export default function RatingStars({ rating = 0, maxRating = 5, size = 16, showCount = true, count = null }) {
  const stars = [];
  const roundedRating = Math.round(Number(rating) * 2) / 2;

  for (let i = 1; i <= maxRating; i++) {
    const isFull = i <= roundedRating;
    const isHalf = !isFull && (i - 0.5 <= roundedRating);

    stars.push(
      <span key={i} className={`star-icon-wrap ${isFull ? 'full' : isHalf ? 'half' : 'empty'}`}>
        <Star size={size} />
      </span>
    );
  }

  return (
    <div className="rating-stars-container" aria-label={`Rating: ${rating} out of ${maxRating}`}>
      <div className="stars-row">{stars}</div>
      {showCount && (
        <span className="rating-numeric">
          {Number(rating).toFixed(1)}
          {count !== null && <span className="review-count"> ({count})</span>}
        </span>
      )}
    </div>
  );
}
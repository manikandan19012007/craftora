import React from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid({
  products = [],
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  emptyMessage = "No handcrafted products found matching your selection."
}) {
  if (!products || products.length === 0) {
    return (
      <div className="empty-products-state">
        <div className="empty-icon">🏺</div>
        <h3>No Products Available</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="craftora-product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={wishlistIds.includes(product.id)}
        />
      ))}
    </div>
  );
}
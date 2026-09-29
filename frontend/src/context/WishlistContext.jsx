import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user wishlist from MySQL when authenticated
  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getWishlist();
      setWishlistItems(data.wishlist || []);
    } catch (err) {
      console.warn("Could not load wishlist:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Check if a product ID is wishlisted
  const isWishlisted = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  // Toggle wishlist
  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      addToast('Please login to save handcrafted items to your wishlist', 'info');
      return;
    }

    const alreadyFavorited = isWishlisted(product.id);

    if (alreadyFavorited) {
      try {
        await removeFromWishlist(product.id);
        setWishlistItems((prev) => prev.filter((i) => i.id !== product.id));
        addToast(`Removed "${product.name}" from wishlist`, 'info');
      } catch (err) {
        addToast(err.message || 'Failed to remove from wishlist', 'error');
      }
    } else {
      try {
        await addToWishlist(product.id);
        // Add optimistic or reload
        setWishlistItems((prev) => [product, ...prev]);
        addToast(`Saved "${product.name}" to your wishlist!`, 'success');
      } catch (err) {
        addToast(err.message || 'Failed to add to wishlist', 'error');
      }
    }
  };

  // Remove directly
  const removeItem = async (productId, productName = 'Item') => {
    try {
      await removeFromWishlist(productId);
      setWishlistItems((prev) => prev.filter((i) => i.id !== productId));
      addToast(`Removed "${productName}" from wishlist`, 'info');
    } catch (err) {
      addToast(err.message || 'Failed to remove item', 'error');
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      wishlistCount: wishlistItems.length,
      loading,
      isWishlisted,
      toggleWishlist,
      removeItem,
      reloadWishlist: loadWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
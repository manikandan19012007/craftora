import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCartApi, updateCartItemApi, removeCartItemApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('craftora_local_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [subtotal, setSubtotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Recalculate totals whenever cartItems change
  useEffect(() => {
    const calculatedSubtotal = cartItems.reduce((acc, item) => {
      const unitPrice = Number(item.price || 0) + Number(item.customization_fee || 0);
      return acc + (unitPrice * item.quantity);
    }, 0);

    const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const calculatedShipping = calculatedSubtotal > 0 && calculatedSubtotal < 1000 ? 99 : 0; // Free shipping over ₹1000
    
    setSubtotal(calculatedSubtotal);
    setShippingFee(calculatedShipping);
    setGrandTotal(calculatedSubtotal + calculatedShipping);
    setTotalItemsCount(count);

    try {
      localStorage.setItem('craftora_local_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn("Could not sync local cart:", e);
    }
  }, [cartItems]);

  // Load user cart from MySQL backend if available, fallback to local
  const loadCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await getCart();
      if (data && data.items) {
        // Map DB fields to frontend cart representation
        const items = data.items.map(it => ({
          cart_item_id: it.id,
          id: it.id,
          product_id: it.product_id,
          name: it.name,
          price: it.price,
          image: it.variant_image || it.image,
          selected_color: it.selected_color,
          selected_size: it.selected_size,
          selected_material: it.selected_material,
          custom_text: it.custom_text,
          customization_fee: Number(it.customization_fee || 0),
          stock_quantity: it.is_made_to_order ? 999 : it.stock_quantity,
          is_made_to_order: it.is_made_to_order,
          quantity: it.quantity,
          artisan_name: it.artisan_name,
          category_name: it.category_name
        }));
        setCartItems(items);
      }
    } catch (err) {
      console.warn("Backend cart unavailable; persisting in client mode:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Add to cart with support for custom text, variant options, and fallback
  const addToCart = async (product, quantity = 1, options = {}) => {
    const {
      selected_color = null,
      selected_size = null,
      selected_material = null,
      custom_text = null,
      customization_fee = 0,
      image = null
    } = options;

    const displayImage = image || product.image;
    const cartItemId = `cart-${product.id}-${selected_color || ''}-${selected_size || ''}-${(custom_text || '').slice(0, 10)}-${Date.now()}`;

    const newItem = {
      cart_item_id: cartItemId,
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      image: displayImage,
      category_name: product.category_name,
      artisan_name: product.artisan_name,
      stock_quantity: product.is_made_to_order ? 999 : (product.stock_quantity || 10),
      is_made_to_order: product.is_made_to_order,
      quantity,
      selected_color,
      selected_size,
      selected_material,
      custom_text,
      customization_fee: Number(customization_fee || 0)
    };

    setCartItems(prev => {
      // Find matching item with same product_id AND same variants/text
      const existingIndex = prev.findIndex(item => 
        item.product_id === product.id &&
        (item.selected_color || null) === (selected_color || null) &&
        (item.selected_size || null) === (selected_size || null) &&
        (item.selected_material || null) === (selected_material || null) &&
        (item.custom_text || null) === (custom_text || null)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const maxAvailable = product.is_made_to_order ? 999 : (product.stock_quantity || 10);
        const nextQty = Math.min(updated[existingIndex].quantity + quantity, maxAvailable);
        updated[existingIndex].quantity = nextQty;
        return updated;
      }
      return [newItem, ...prev];
    });

    // Attempt backend sync if authenticated
    if (isAuthenticated) {
      try {
        await addToCartApi(product.id, quantity, {
          selected_color,
          selected_size,
          selected_material,
          custom_text,
          customization_fee
        });
        // Reload from DB to sync exact backend cart item IDs
        await loadCart();
      } catch (e) {
        console.warn("Backend add to cart error:", e);
      }
    }

    addToast(`Added ${quantity > 1 ? `${quantity} × ` : ''}"${product.name}" to your cart!`, 'success');
    return true;
  };

  // Update quantity
  const updateQuantity = async (cartItemId, newQty) => {
    if (newQty <= 0) return;
    setCartItems(prev => prev.map(item => item.cart_item_id === cartItemId || item.id === cartItemId ? { ...item, quantity: newQty } : item));

    if (isAuthenticated) {
      try {
        await updateCartItemApi(cartItemId, newQty);
      } catch (e) {}
    }
  };

  // Remove line item
  const removeFromCart = async (cartItemId, productName = 'Item') => {
    setCartItems(prev => prev.filter(item => item.cart_item_id !== cartItemId && item.id !== cartItemId));
    addToast(`Removed "${productName}" from cart`, 'info');

    if (isAuthenticated) {
      try {
        await removeCartItemApi(cartItemId);
      } catch (e) {}
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('craftora_local_cart');
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      subtotal,
      shippingFee,
      grandTotal,
      totalItemsCount,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      reloadCart: loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
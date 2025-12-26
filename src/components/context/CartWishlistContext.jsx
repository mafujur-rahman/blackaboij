"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartWishlistContext = createContext();

export function CartWishlistProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Load initial counts
  useEffect(() => {
    updateCartCountFromStorage();
    updateWishlistCountFromStorage();
  }, []);

  const updateCartCountFromStorage = () => {
    // Replace with your actual cart storage logic
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartCount(count);
  };

  const updateWishlistCountFromStorage = () => {
    // Replace with your actual wishlist storage logic
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistCount(wishlist.length);
  };

  const incrementCart = () => {
    setCartCount(prev => prev + 1);
  };

  const decrementCart = () => {
    setCartCount(prev => Math.max(0, prev - 1));
  };

  const setCart = (count) => {
    setCartCount(count);
  };

  const setWishlist = (count) => {
    setWishlistCount(count);
  };

  return (
    <CartWishlistContext.Provider value={{
      cartCount,
      wishlistCount,
      updateCartCountFromStorage,
      updateWishlistCountFromStorage,
      incrementCart,
      decrementCart,
      setCart,
      setWishlist
    }}>
      {children}
    </CartWishlistContext.Provider>
  );
}

export const useCartWishlist = () => {
  const context = useContext(CartWishlistContext);
  if (!context) {
    throw new Error('useCartWishlist must be used within CartWishlistProvider');
  }
  return context;
};
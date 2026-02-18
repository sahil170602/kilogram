import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function FloatingCart() {
  const [uniqueItemCount, setUniqueItemCount] = useState(0);

  const updateCartCount = () => {
    // Retrieve the array of products from localStorage
    const cart = JSON.parse(localStorage.getItem('kilogram_cart') || '[]');
    
    // Use .length to count how many unique products exist in the array
    // This ignores the 'quantity' value inside the objects
    setUniqueItemCount(cart.length);
  };

  useEffect(() => {
    updateCartCount();
    
    // Sync with other components (ProductGrid, ProductDetails)
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  // Return nothing if the cart is empty
  if (uniqueItemCount === 0) return null;

  return (
    <div className="fixed bottom-28 right-6 z-[150] animate-in zoom-in duration-300">
      <Link 
        to="/cart" 
        className="relative flex items-center justify-center w-14 h-14 bg-primary rounded-full shadow-2xl shadow-primary/40 active:scale-90 transition-transform"
      >
        {/* Cart Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>

        {/* Unique Item Badge */}
        <div className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-primary shadow-lg animate-in fade-in zoom-in">
          {uniqueItemCount}
        </div>
      </Link>
    </div>
  );
}
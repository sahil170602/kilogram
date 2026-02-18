import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // PRO TIP: Check if user session exists in Local Storage
      const user = localStorage.getItem('kilogram_user');

      if (user) {
        // If logged in, skip login and go straight to store
        navigate('/home');
      } else {
        // Otherwise, send them to the login flow
        navigate('/login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
      <div className="relative">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
        
        {/* Pulsing Logo */}
        <div className="relative animate-bounce">
          <h1 className="text-5xl font-black italic tracking-tighter text-white">
            KILO<span className="text-primary">GRAM</span>
          </h1>
          {/* Ensure 'animate-grow' is defined in your index.css */}
          <div className="mt-2 h-1 bg-primary w-full rounded-full animate-grow"></div>
        </div>
      </div>
      
      <div className="absolute bottom-12">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
          Premium Essentials Delivered
        </p>
      </div>
    </div>
  );
}
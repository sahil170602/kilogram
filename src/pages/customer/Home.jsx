import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from "../../components/customer/Header";
import SearchBar from "../../components/customer/SearchBar";
import Banner from "../../components/customer/Banner";
import CategoryGrid from "../../components/customer/CategoryGrid";
import ProductGrid from "../../components/customer/ProductGrid";
import FloatingCart from "../../components/customer/FloatingCart";

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const location = useLocation();

  const loadData = () => {
    const savedProducts = JSON.parse(localStorage.getItem('kilogram_products') || '[]');
    const savedCategories = JSON.parse(localStorage.getItem('kilogram_categories') || '[]');
    setAllProducts(savedProducts);
    setCategories(savedCategories);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // Filter products for Home (Limit to 10)
  const bulkHomeItems = allProducts.filter(p => p.section === 'bulk' && p.showOnHome).slice(0, 10);
  const dailyHomeItems = allProducts.filter(p => p.section === 'daily' && p.showOnHome).slice(0, 10);

  // Filter categories and limit to top 8 for Home
  const bulkCategories = categories.filter(c => c.section === 'bulk').slice(0, 8);
  const dailyCategories = categories.filter(c => c.section === 'daily').slice(0, 8);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      
      <main className="pt-24 pb-44">
        <SearchBar />
        
        <div className="px-4">
          <Banner />
          
          {/* Section 1: Bulk Items */}
          <div className="mt-8">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-bold italic">Stock up on <span className="text-primary">Bulk Items</span></h2>
              {/* "See All" for Categories */}
              <Link to="/collection/bulk/all-categories" className="text-primary text-[10px] font-black uppercase tracking-widest border-b border-primary/30">
                See All →
              </Link>
            </div>
            
            <CategoryGrid dynamicCategories={bulkCategories} />

            <div className="flex justify-between items-center mt-10 mb-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Popular Products</h3>
              {/* "View All" for Products in this section */}
              <Link to="/collection/bulk" className="text-primary text-[10px] font-black uppercase">
                View All →
              </Link>
            </div>
            
            {bulkHomeItems.length > 0 ? (
              <ProductGrid products={bulkHomeItems} />
            ) : (
              <div className="glass-card p-6 text-center text-gray-500 text-xs italic">No featured items yet.</div>
            )}
          </div>

          {/* Section 2: Daily Needs */}
          <div className="mt-16">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-bold italic">Fresh <span className="text-primary">Daily Needs</span></h2>
              <Link to="/collection/daily/all-categories" className="text-primary text-[10px] font-black uppercase tracking-widest border-b border-primary/30">
                See All →
              </Link>
            </div>
            
            <CategoryGrid dynamicCategories={dailyCategories} />

            <div className="flex justify-between items-center mt-10 mb-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Essential Picks</h3>
              <Link to="/collection/daily" className="text-primary text-[10px] font-black uppercase">
                View All →
              </Link>
            </div>
            
            {dailyHomeItems.length > 0 ? (
              <ProductGrid products={dailyHomeItems} />
            ) : (
              <div className="glass-card p-6 text-center text-gray-500 text-xs italic">No featured items yet.</div>
            )}
          </div>
        </div>
      </main>

      <FloatingCart />

      {/* Bottom Navigation */}
<div className="fixed bottom-6 left-6 right-6 h-20 glass-card flex justify-around items-center px-4 z-50 shadow-2xl shadow-primary/10">
  
  {/* Store Tab */}
  <Link to="/home" className="flex-1">
    <div className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 mx-auto w-fit ${
      isActive('/home') ? 'bg-black/100 text-primary scale-105' : 'text-white-500 hover:text-white'
    }`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <span className="text-[9px] font-black uppercase tracking-tighter">Store</span>
    </div>
  </Link>
  
  {/* Products Tab */}
  <Link to="/all-products" className="flex-1">
    <div className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 mx-auto w-fit ${
      isActive('/all-products') ? 'bg-black/100 text-primary scale-105' : 'text-white-500 hover:text-white'
    }`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
      <span className="text-[9px] font-black uppercase tracking-tighter">Products</span>
    </div>
  </Link>

  {/* Orders Tab */}
  <Link to="/orders" className="flex-1">
    <div className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 mx-auto w-fit ${
      isActive('/orders') ? 'bg-black/100 text-primary scale-105' : 'text-white-500 hover:text-white'
    }`}>
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
      </div>
      <span className="text-[9px] font-black uppercase tracking-tighter">Orders</span>
    </div>
  </Link>

</div>
    </div>
  );
}
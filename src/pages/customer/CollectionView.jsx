import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/customer/Header";
import ProductGrid from "../../components/customer/ProductGrid";
import CategoryGrid from "../../components/customer/CategoryGrid";

export default function CollectionView() {
  const { section, categoryName } = useParams();
  const navigate = useNavigate();
  const [displayProducts, setDisplayProducts] = useState([]);
  const [displayCategories, setDisplayCategories] = useState([]);

  useEffect(() => {
    // Load fresh data from localStorage
    const allProducts = JSON.parse(localStorage.getItem('kilogram_products') || '[]');
    const allCategories = JSON.parse(localStorage.getItem('kilogram_categories') || '[]');
    
    // 1. FILTER CATEGORIES
    const sectionCats = allCategories.filter(c => c.section === section);
    setDisplayCategories(sectionCats);

    // 2. FILTER PRODUCTS
    let filtered = allProducts.filter(p => p.section === section);
    
    if (categoryName && categoryName !== 'all-categories') {
      // MODE: Specific Category View
      filtered = filtered.filter(p => p.category === categoryName);
    } else {
      // MODE: Section View or All Categories View
      // Randomize products for a fresh discovery feel
      filtered = [...filtered].sort(() => Math.random() - 0.5);
    }
    
    setDisplayProducts(filtered);
  }, [section, categoryName]);

  // Dynamic Title Logic
  const getTitle = () => {
    if (categoryName === 'all-categories') return `All ${section} Categories`;
    if (categoryName) return categoryName;
    return `${section} Collection`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-32">
      <Header />
      
      <div className="px-4">
        {/* Back Button & Title */}
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-primary active:scale-90 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
              {getTitle()}
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
              {section} Section
            </p>
          </div>
        </div>

        {/* --- MODE A: SHOW ALL CATEGORIES --- */}
        {categoryName === 'all-categories' && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
             <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 ml-2">Browse by Category</h2>
             <CategoryGrid dynamicCategories={displayCategories} />
             <div className="h-px w-full bg-white/5 my-10"></div>
          </div>
        )}

        {/* --- PRODUCTS DISPLAY --- */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              {categoryName && categoryName !== 'all-categories' ? 'Category Items' : 'Recommended for you'}
            </h2>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">
              {displayProducts.length} Items
            </span>
          </div>

          {displayProducts.length > 0 ? (
            <ProductGrid products={displayProducts} />
          ) : (
            <div className="glass-card p-16 text-center border-dashed border-white/10">
              <div className="text-4xl mb-4 opacity-20">📦</div>
              <p className="text-gray-500 text-xs italic font-bold uppercase tracking-widest">
                No items found in this {categoryName ? 'category' : 'section'}
              </p>
              <button 
                onClick={() => navigate('/home')}
                className="mt-6 text-primary text-[10px] font-black border border-primary/30 px-6 py-2 rounded-full uppercase"
              >
                Go to Store
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
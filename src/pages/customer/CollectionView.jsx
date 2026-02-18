import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Header from "../../components/customer/Header";
import ProductGrid from "../../components/customer/ProductGrid";
import CategoryGrid from "../../components/customer/CategoryGrid";

/**
 * CollectionView Component
 * Dynamic terminal for browsing products by section or specific category.
 * Syncs with Supabase for real-time inventory discovery.
 */
export default function CollectionView() {
  const { section, categoryName } = useParams();
  const navigate = useNavigate();
  const [displayProducts, setDisplayProducts] = useState([]);
  const [displayCategories, setDisplayCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Unified Data Fetcher from Supabase
  const syncCollectionData = useCallback(async () => {
    setLoading(true);
    try {
      // Logic: Parallel fetch for categories and products to reduce latency
      const [catResponse, prodResponse] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .eq('section', section),
        supabase
          .from('products')
          .select('*')
          .eq('section', section)
      ]);

      if (catResponse.error) throw catResponse.error;
      if (prodResponse.error) throw prodResponse.error;

      // Map Categories
      setDisplayCategories(catResponse.data || []);

      // Filter Products based on Route Context
      let filtered = prodResponse.data || [];
      
      if (categoryName && categoryName !== 'all-categories') {
        // MODE: Specific Category Filter (Case-insensitive match)
        filtered = filtered.filter(p => 
          p.category.toLowerCase() === categoryName.toLowerCase()
        );
      } else {
        // MODE: Discovery View (Randomize for fresh feel)
        filtered = [...filtered].sort(() => Math.random() - 0.5);
      }
      
      setDisplayProducts(filtered);
    } catch (err) {
      console.error("Collection Sync Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [section, categoryName]);

  useEffect(() => {
    syncCollectionData();

    // 2. Real-time Listener: Updates if stock or categories change globally
    const subscription = supabase
      .channel(`collection_${section}`)
      .on('postgres_changes', { event: '*', table: 'products' }, syncCollectionData)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [syncCollectionData]);

  // Dynamic Title Logic
  const getTitle = () => {
    if (categoryName === 'all-categories') return `All ${section} Categories`;
    if (categoryName) return categoryName.replace(/-/g, ' ');
    return `${section} Collection`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-32 selection:bg-primary/30">
      <Header />
      
      <div className="px-4">
        {/* Back Button & Identity Suite */}
        <div className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 text-primary active:scale-75 transition-all shadow-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none drop-shadow-2xl">
              {getTitle()}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#ff4d94]"></span>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                Logistics Section: {section}
              </p>
            </div>
          </div>
        </div>

        {/* --- MODE A: SHOW ALL CATEGORIES --- */}
        {categoryName === 'all-categories' && !loading && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
             <div className="flex items-center gap-3 mb-6 px-2">
                <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Browse Nodes</h2>
                <div className="h-px flex-1 bg-primary/10"></div>
             </div>
             <CategoryGrid dynamicCategories={displayCategories} />
             <div className="h-px w-full bg-white/5 my-12"></div>
          </div>
        )}

        {/* --- PRODUCTS DISPLAY TERMINAL --- */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="flex justify-between items-center mb-8 px-2">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
              {categoryName && categoryName !== 'all-categories' ? 'Linked Inventory' : 'Suggested Discovery'}
            </h2>
            <div className="glass-card px-3 py-1.5 border-primary/20 bg-primary/5 rounded-lg">
               <span className="text-[10px] font-black text-primary italic">
                 {loading ? '...' : displayProducts.length} assets
               </span>
            </div>
          </div>

          {loading ? (
            <div className="py-32 text-center space-y-4">
               <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" />
               <p className="text-primary font-black text-[11px] uppercase tracking-[0.5em] animate-pulse">Syncing Cloud Terminal...</p>
            </div>
          ) : displayProducts.length > 0 ? (
            <ProductGrid products={displayProducts} />
          ) : (
            /* Empty State Overlay */
            <div className="glass-card p-20 text-center border-dashed border-white/10 bg-white/[0.01] shadow-inner">
              <div className="text-5xl mb-6 grayscale opacity-20 animate-bounce">📦</div>
              <p className="text-gray-500 text-xs italic font-bold uppercase tracking-[0.2em] mb-8 leading-loose">
                Null Result: No assets found in <br/> this {categoryName ? 'category node' : 'logistics section'}
              </p>
              <button 
                onClick={() => navigate('/home')}
                className="bg-white text-black text-[10px] font-black px-10 py-5 rounded-[2rem] uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:bg-primary hover:text-black"
              >
                Return to Store Hub
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
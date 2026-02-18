import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Header from "../../components/customer/Header";
import SearchBar from "../../components/customer/SearchBar";
import Banner from "../../components/customer/Banner";
import CategoryGrid from "../../components/customer/CategoryGrid";
import ProductGrid from "../../components/customer/ProductGrid";
import FloatingCart from "../../components/customer/FloatingCart";
import BottomNav from "../../components/customer/BottomNav"; // Imported separate file

/**
 * Home Component
 * Main storefront terminal. Syncs categories and featured products from Supabase.
 */
export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Data Synchronization Logic
  const loadData = useCallback(async () => {
    try {
      // Parallel fetch to reduce initial load time
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*').order('name', { ascending: true })
      ]);

      if (prodRes.error) throw prodRes.error;
      if (catRes.error) throw catRes.error;

      setAllProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error("Storefront Sync Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // 2. Real-time Subscription: Update Home if Admin changes items
    const subscription = supabase
      .channel('home_realtime_sync')
      .on('postgres_changes', { event: '*', table: 'products' }, loadData)
      .on('postgres_changes', { event: '*', table: 'categories' }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [loadData]);

  // 3. Logic Filters for Dashboard Mapping
  const bulkHomeItems = allProducts.filter(p => p.section === 'bulk' && p.showOnHome).slice(0, 10);
  const dailyHomeItems = allProducts.filter(p => p.section === 'daily' && p.showOnHome).slice(0, 10);

  const bulkCategories = categories.filter(c => c.section === 'bulk').slice(0, 8);
  const dailyCategories = categories.filter(c => c.section === 'daily').slice(0, 8);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
      <Header />
      
      <main className="pt-24 pb-44 animate-in fade-in duration-1000">
        <SearchBar />
        
        <div className="px-4">
          <Banner />
          
          {loading ? (
            /* Skeleton / Loading State */
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-primary font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Loading Inventory...</p>
            </div>
          ) : (
            <>
              {/* Section 1: Bulk Items */}
              <div className="mt-10">
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-2xl font-black  tracking-tighter  leading-none">
                    Bulk <span className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]">Items</span>
                  </h2>
                  <Link to="/collection/bulk/all-categories" className="text-primary text-[12px] font-black uppercase tracking-widest border-b border-primary/20 pb-1 hover:border-primary transition-all">
                    See All →
                  </Link>
                </div>
                
                <CategoryGrid dynamicCategories={bulkCategories} />

                <div className="flex justify-between items-center mt-12 mb-4 px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Premium Stock</h3>
                  <Link to="/collection/bulk" className="text-primary text-[12px] font-black uppercase tracking-widest hover:text-primary transition-colors">
                    View all
                  </Link>
                </div>
                
                {bulkHomeItems.length > 0 ? (
                  <ProductGrid products={bulkHomeItems} />
                ) : (
                  <div className="glass-card p-10 text-center border-dashed border-white/5 opacity-20">
                    <p className="text-[9px] font-black uppercase italic">Null Inventory Found</p>
                  </div>
                )}
              </div>

              {/* Section 2: Daily Needs */}
              <div className="mt-20">
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-2xl font-black  tracking-tighter uppercase leading-none">
                    Daily <span className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]">Essentials</span>
                  </h2>
                  <Link to="/collection/daily/all-categories" className="text-primary text-[12px] font-black uppercase tracking-widest border-b border-primary/20 pb-1 hover:border-primary transition-all">
                    See all →
                  </Link>
                </div>
                
                <CategoryGrid dynamicCategories={dailyCategories} />

                <div className="flex justify-between items-center mt-12 mb-4 px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Fresh Mapping</h3>
                  <Link to="/collection/daily" className="text-primary text-[12px] font-black uppercase tracking-widest hover:text-primary transition-colors">
                    view all
                  </Link>
                </div>
                
                {dailyHomeItems.length > 0 ? (
                  <ProductGrid products={dailyHomeItems} />
                ) : (
                  <div className="glass-card p-10 text-center border-dashed border-white/5 opacity-20">
                    <p className="text-[9px] font-black uppercase italic">No daily items synced</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <FloatingCart />

      {/* Persistent Separate Navigation Component */}
      <BottomNav />
    </div>
  );
}
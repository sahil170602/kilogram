import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Header from "../../components/customer/Header";
import ProductGrid from "../../components/customer/ProductGrid";
import BottomNav from "../../components/customer/BottomNav";

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Inventory from Supabase instead of LocalStorage
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Cloud Sync Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-44 selection:bg-primary/30">
      <Header />
      
      <div className="px-4 animate-in fade-in duration-700">
        {/* Page Header */}
        <h1 className="text-2xl font-black  mb-8 border-l-4 border-primary pl-4 uppercase tracking-tighter leading-none">
          All <span className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]">Products</span>
        </h1>

        {loading ? (
          /* Loading State */
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Syncing Cloud Ledger...</p>
          </div>
        ) : (
          /* Grouped Sections */
          ['bulk', 'daily'].map(section => (
            <div key={section} className="mb-12">
              <div className="flex items-center gap-3 mb-4 px-2">
                <h2 className="text-primary font-black uppercase tracking-[0.2em] text-[12px] ">
                  {section} Iteams
                </h2>
                <div className="h-px flex-1 bg-white/5"></div>
              </div>
              
              <ProductGrid products={products.filter(p => p.section === section)} />
              
              {products.filter(p => p.section === section).length === 0 && (
                <div className="glass-card p-10 text-center border-dashed border-white/5 opacity-30">
                  <p className="text-[9px] font-black uppercase tracking-widest italic">No Iteams Found</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Persistent Separate Navigation */}
      <BottomNav />
    </div>
  );
}
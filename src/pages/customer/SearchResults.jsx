import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ProductGrid from "../../components/customer/ProductGrid";

/**
 * SearchResults Component
 * AI-powered results terminal that queries Supabase.
 * Handles Voice, Visual, and Text-based discovery protocols.
 */
export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  const mode = params.get('mode'); // 'voice' or 'image'

  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(!!mode);
  const [loading, setLoading] = useState(!mode);

  useEffect(() => {
    const fetchResults = async () => {
      // Logic: If AI mode is active, simulate a 'Processing' delay for premium feel
      if (mode && isProcessing) {
        const timer = setTimeout(() => setIsProcessing(false), 2200);
        return () => clearTimeout(timer);
      }

      setLoading(true);
      try {
        // Logic: Query Supabase using ILIKE for case-insensitive partial matching
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
          .order('name', { ascending: true });

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error("Search Protocol Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, mode, isProcessing]);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 selection:bg-primary/30">
      {/* 1. Executive Search Header */}
      <header className="fixed top-0 left-0 right-0 h-24 z-[100] bg-black/60 backdrop-blur-2xl border-b border-white/5 flex items-center px-6 gap-5">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.03] text-primary border border-white/10 active:scale-75 transition-all shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">
            {isProcessing ? 'AI Protocol' : 'Discovery Feed'}
          </h1>
          <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1">
            {isProcessing ? 'Analyzing Stream...' : 'Supabase Synced'}
          </p>
        </div>
      </header>

      <main className="pt-32 px-4 animate-in fade-in duration-700">
        {isProcessing ? (
          /* 2. AI Processing Module (Voice/Image UI) */
          <div className="py-24 text-center space-y-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] animate-ping duration-[2000ms]"></div>
              <div className="relative w-32 h-32 bg-[#0a0a0a] border-2 border-primary/40 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]">
                <span className="text-5xl drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]">
                  {mode === 'voice' ? '🎙️' : '📷'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-primary italic uppercase tracking-tighter animate-pulse">
                {mode === 'voice' ? 'Processing Voice...' : 'Analyzing Vision...'}
              </h2>
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
                Kilogram AI finding your assets
              </p>
            </div>
          </div>
        ) : (
          /* 3. Results Discovery Stream */
          <div className="animate-in slide-in-from-bottom-6 duration-1000">
            <div className="mb-8 px-2 flex justify-between items-end">
              <div>
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                  Telemetry Found: {results.length} Nodes
                </p>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">
                  {query ? `"${query}"` : 'Visual Logic Match'}
                </h2>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                 <span className="text-primary text-xs">🔍</span>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center animate-pulse">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-primary font-black text-[9px] uppercase tracking-widest">Accessing Database...</p>
              </div>
            ) : results.length > 0 ? (
              <ProductGrid products={results} />
            ) : (
              /* Empty Search Overlay */
              <div className="py-32 text-center glass-card border-dashed border-white/10 bg-white/[0.01] rounded-[2.5rem]">
                <div className="text-5xl mb-6 opacity-20 grayscale">🔎</div>
                <p className="text-gray-600 text-xs italic font-bold uppercase tracking-widest leading-loose">
                  No exact matches found <br/> in our cloud inventory.
                </p>
                <button 
                  onClick={() => navigate('/home')}
                  className="mt-8 bg-white text-black font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-2xl shadow-2xl active:scale-95 transition-all"
                >
                  Return to Store Hub
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
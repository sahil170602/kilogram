import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from "../../components/customer/Header";
import ProductGrid from "../../components/customer/ProductGrid";

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  const mode = params.get('mode'); // 'voice' or 'image'

  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(!!mode);

  useEffect(() => {
    if (mode) {
      // Fake processing delay for a "High-Tech" feel
      const timer = setTimeout(() => {
        setIsProcessing(false);
        const all = JSON.parse(localStorage.getItem('kilogram_products') || '[]');
        // In a real app, AI logic would go here. For now, we show top 4 matches.
        setResults(all.slice(0, 4)); 
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      const all = JSON.parse(localStorage.getItem('kilogram_products') || '[]');
      const filtered = all.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    }
  }, [query, mode]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-32">
      {/* 1. Fixed Header with Back Button */}
      <header className="fixed top-0 left-0 right-0 h-20 z-[100] bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 flex items-center px-6 gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-primary hover:bg-primary/10 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-black italic uppercase tracking-tighter">
          {isProcessing ? 'AI Processing' : 'Search Results'}
        </h1>
      </header>

      <main className="pt-28 px-4">
        {isProcessing ? (
          /* 2. AI Processing Animation */
          <div className="py-20 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <div className="relative w-24 h-24 bg-black border-2 border-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/20">
                <span className="text-4xl">{mode === 'voice' ? '🎙️' : '📷'}</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-primary italic uppercase tracking-widest animate-pulse">
                {mode === 'voice' ? 'Listening...' : 'Analyzing Image...'}
              </h2>
              <p className="text-gray-500 text-xs mt-2 font-bold uppercase">Kilogram AI is finding your items</p>
            </div>
          </div>
        ) : (
          /* 3. Results Display */
          <div>
            <div className="mb-6">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">
                Found {results.length} items
              </p>
              <h2 className="text-2xl font-black italic tracking-tighter">
                {query ? `"${query}"` : 'AI Visual Match'}
              </h2>
            </div>

            <ProductGrid products={results} />

            {results.length === 0 && (
              <div className="py-20 text-center glass-card border-white/5">
                <p className="text-gray-500 italic">No exact matches found.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-4 text-primary font-black uppercase text-xs border-b border-primary/30"
                >
                  Return to Store
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
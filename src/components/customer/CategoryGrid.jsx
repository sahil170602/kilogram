import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CategoryGrid Component
 * Displays a responsive grid of product categories fetched from Supabase.
 * * @param {Array} dynamicCategories - Array of category objects from Supabase.
 */
export default function CategoryGrid({ dynamicCategories = [] }) {
  
  // 1. Handling Empty States
  if (!dynamicCategories || dynamicCategories.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center opacity-40">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] italic">
          Fetching Logistics Data...
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {dynamicCategories.map((cat) => (
        <Link 
          key={cat.id} 
          /* Navigates to collection view based on Supabase section and name fields */
          to={`/collection/${cat.section}/${cat.name.toLowerCase()}`} 
          className="flex flex-col items-center group cursor-pointer active:scale-90 transition-all duration-300"
        >
          {/* Glassy UI Icon Container */}
          <div className="w-full aspect-square glass-card flex items-center  justify-center bg-white/[0.03] border-white/5 overflow-hidden p-0 shadow-xl group-hover:border-primary/40 group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] transition-all relative">
            
            {/* Visual Background Glow on Hover */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {cat.image ? (
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500" 
              />
            ) : (
              /* Fallback icon if no image is present in Supabase */
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 bg-primary/20 rounded-lg rotate-45 border border-primary/40 group-hover:rotate-90 transition-transform duration-500" />
                <span className="text-[8px] font-black text-primary/40 uppercase">📦</span>
              </div>
            )}

            {/* Subtle Glass Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none" />
          </div>

          {/* Category Label */}
          <span className="text-[12px] mt-2.5 text-white-500 font-black uppercase tracking-tighter text-center line-clamp-1 group-hover:text-primary transition-colors leading-none">
            {cat.name}
          </span>
          
          {/* Indicator Dot for Active Categories */}
          <div className="w-0.5 h-0.5 bg-primary/0 group-hover:bg-primary rounded-full mt-1 transition-all duration-300" />
        </Link>
      ))}
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryGrid({ dynamicCategories = [] }) {
  if (dynamicCategories.length === 0) {
    return (
      <p className="text-gray-600 text-[10px] italic py-4">
        No categories added in this section yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {dynamicCategories.map((cat) => (
        /* Use Link to navigate to a filtered category page */
        <Link 
          key={cat.id} 
          to={`/collection/${cat.section}/${cat.name}`} 
          className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-full aspect-square glass-card flex items-center justify-center bg-white/5 border-white/5 overflow-hidden p-0 shadow-lg group-hover:border-primary/30">
             {cat.image ? (
               <img 
                 src={cat.image} 
                 alt={cat.name} 
                 className="w-full h-full object-cover rounded-2xl" 
               />
             ) : (
               <div className="w-8 h-8 bg-primary/20 rounded-lg rotate-45 border border-primary/40" /> 
             )}
          </div>
          <span className="text-[10px] mt-2 text-gray-400 font-black uppercase tracking-tighter text-center line-clamp-1 group-hover:text-primary transition-colors">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
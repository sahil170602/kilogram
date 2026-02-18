import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from "../../components/customer/Header";
import ProductGrid from "../../components/customer/ProductGrid";

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('kilogram_products') || '[]');
    setProducts(saved);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-44">
      <Header />
      <div className="px-4">
        <h1 className="text-2xl font-black italic mb-8 border-l-4 border-primary pl-4 uppercase tracking-tighter">
          Full <span className="text-primary">Inventory</span>
        </h1>

        {['bulk', 'daily'].map(section => (
          <div key={section} className="mb-12">
            <h2 className="text-primary font-black uppercase tracking-widest text-sm mb-4">
              {section} Items
            </h2>
            <ProductGrid products={products.filter(p => p.section === section)} />
          </div>
        ))}
      </div>

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
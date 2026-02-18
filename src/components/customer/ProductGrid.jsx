import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ProductGrid({ products = [], isSingleRow = false }) {
  const [cart, setCart] = useState([]);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('kilogram_cart') || '[]');
    setCart(savedCart);
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  const updateQuantity = (product, delta) => {
    let currentCart = JSON.parse(localStorage.getItem('kilogram_cart') || '[]');
    const index = currentCart.findIndex(item => item.id === product.id);

    if (index > -1) {
      currentCart[index].quantity += delta;
      if (currentCart[index].quantity <= 0) currentCart.splice(index, 1);
    } else if (delta > 0) {
      currentCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('kilogram_cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('storage'));
  };

  const getItemQty = (id) => {
    const item = cart.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  // Logic: Switch classes based on isSingleRow prop
  const containerClass = isSingleRow 
    ? "flex flex-nowrap gap-4 overflow-x-auto no-scrollbar pb-4 px-1 mt-4" 
    : "grid grid-cols-2 gap-4 mt-4";

  const itemClass = isSingleRow
    ? "min-w-[160px] max-w-[160px] flex-shrink-0"
    : "relative group";

  return (
    <div className={containerClass}>
      {products.map((product) => {
        const qty = getItemQty(product.id);
        return (
          <div key={product.id} className={itemClass}>
            <Link to={`/product/${product.id}`} className="block">
              <div className="glass-card p-3 border-white/5 bg-white/5">
                {/* Image height slightly smaller for single row consistency */}
                <div className={`w-full ${isSingleRow ? 'h-32' : 'h-40'} mb-3 overflow-hidden rounded-xl bg-black/40`}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] font-black uppercase text-white/80 truncate leading-none">{product.name}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-primary font-black text-sm">₹{product.price}</span>
                  
                  <div className="flex items-center" onClick={(e) => {e.preventDefault(); e.stopPropagation();}}>
                    {qty > 0 ? (
                      <div className="flex items-center bg-primary rounded-lg h-8 px-1">
                        <button onClick={() => updateQuantity(product, -1)} className="w-6 h-6 flex items-center justify-center text-black font-black text-sm">-</button>
                        <span className="px-2 text-black text-xs font-black min-w-[20px] text-center">{qty}</span>
                        <button onClick={() => updateQuantity(product, 1)} className="w-6 h-6 flex items-center justify-center text-black font-black text-sm">+</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => updateQuantity(product, 1)}
                        className="bg-primary/10 border border-primary/30 text-primary w-8 h-8 rounded-lg font-black hover:bg-primary hover:text-black transition-all"
                      >+</button>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
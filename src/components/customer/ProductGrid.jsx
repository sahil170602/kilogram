import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ProductGrid({ products = [], isSingleRow = false }) {
  const [cartItems, setCartItems] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const fetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('cart').select('*').eq('user_id', user.id);
      setCartItems(data || []);
    }
  };

  useEffect(() => {
    fetchCart();
    const sub = supabase.channel('cart-grid-sync')
      .on('postgres_changes', { event: '*', table: 'cart' }, fetchCart)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const updateQuantity = async (product, delta) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please login to manage your cart");

    setLoadingId(product.id);
    const existing = cartItems.find(i => i.product_id === product.id);

    try {
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          await supabase.from('cart').delete().eq('id', existing.id);
        } else {
          await supabase.from('cart').update({ quantity: newQty }).eq('id', existing.id);
        }
      } else if (delta > 0) {
        await supabase.from('cart').insert([{ 
          user_id: user.id, product_id: product.id, quantity: 1, 
          name: product.name, price: product.price, image: product.image 
        }]);
      }
    } catch (error) {
      console.error("Cart Sync Error:", error.message);
    } finally {
      setLoadingId(null);
    }
  };

  const getItemQty = (id) => cartItems.find(i => i.product_id === id)?.quantity || 0;

  const containerClass = isSingleRow 
    ? "flex flex-nowrap gap-4 overflow-x-auto no-scrollbar pb-6 mt-4" 
    : "grid grid-cols-2 gap-4 mt-4";

  const itemClass = isSingleRow
    ? "min-w-[170px] max-w-[170px] flex-shrink-0"
    : "relative group animate-in fade-in slide-in-from-bottom-2 duration-500";

  return (
    <div className={containerClass}>
      {products.map((product) => {
        const qty = getItemQty(product.id);
        const isSyncing = loadingId === product.id;

        return (
          <div key={product.id} className={itemClass}>
            <div className="glass-card p-3 border-white/5 bg-white/[0.03] hover:border-primary/20 transition-all duration-300 shadow-xl">
              
              {/* --- IMAGE CONTAINER: COVER OPTIMIZED --- */}
              <Link to={`/product/${product.id}`} className="block relative group">
                <div className={`w-full ${isSingleRow ? 'aspect-square' : 'aspect-[4/5]'} mb-3 overflow-hidden rounded-2xl bg-[#0a0a0a] relative border border-white/5`}>
                  <img 
                    src={product.image || 'https://via.placeholder.com/150'} 
                    alt={product.name} 
                    /* EXECUTIVE FIX: object-cover ensures the image fills 
                       the frame without distortion. 
                    */
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                  />
                  
                  {/* Premium Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                </div>
                
                <p className="text-[14px] font-black uppercase text-white/90 truncate tracking-tight leading-none">
                  {product.name}
                </p>
                <p className="text-[8px] text-gray-500 font-bold uppercase mt-1.5 tracking-widest">Premium Estate</p>
              </Link>

              {/* Price & Action Control */}
              <div className="flex justify-between items-center mt-5">
                <div className="flex flex-col">
                  <span className="text-primary font-black text-sm italic leading-none">₹{product.price}</span>
                  <span className="text-[7px] text-gray-600 font-black uppercase mt-1 tracking-tighter">Net Settlement</span>
                </div>
                
                <div className="relative">
                  {qty > 0 ? (
                    <div className="flex items-center bg-primary rounded-xl h-10 px-1 shadow-lg shadow-primary/20">
                      <button 
                        disabled={isSyncing}
                        onClick={() => updateQuantity(product, -1)} 
                        className="w-8 h-8 flex items-center justify-center text-black font-black text-lg active:scale-75"
                      >
                        -
                      </button>
                      <span className="px-2 text-black text-[11px] font-black min-w-[24px] text-center italic">
                        {isSyncing ? '...' : qty}
                      </span>
                      <button 
                        disabled={isSyncing}
                        onClick={() => updateQuantity(product, 1)} 
                        className="w-8 h-8 flex items-center justify-center text-black font-black text-lg active:scale-75"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      disabled={isSyncing}
                      onClick={() => updateQuantity(product, 1)}
                      className="bg-white/5 border border-white/10 text-white w-10 h-10 rounded-2xl font-black text-xl hover:bg-primary hover:text-black hover:border-primary transition-all active:scale-75 flex items-center justify-center shadow-xl"
                    >
                      {isSyncing ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : '+'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
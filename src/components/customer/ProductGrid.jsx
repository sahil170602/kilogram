import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';


export default function ProductGrid({ products = [], isSingleRow = false }) {
  const [cartItems, setCartItems] = useState([]);
  const [loadingId, setLoadingId] = useState(null); // Track which item is currently syncing

  // 1. Fetch Cart Data from Supabase
  const fetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id);
      setCartItems(data || []);
    }
  };

  useEffect(() => {
    fetchCart();

    // 2. Real-time Subscription for instant UI feedback across tabs
    const sub = supabase
      .channel('cart-grid-sync')
      .on('postgres_changes', { event: '*', table: 'cart' }, fetchCart)
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  // 3. Optimized Quantity Logic
  const updateQuantity = async (product, delta) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please login to manage your cart");

    setLoadingId(product.id);
    const existing = cartItems.find(i => i.product_id === product.id);

    try {
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          // Remove from DB if quantity reaches zero
          await supabase.from('cart').delete().eq('id', existing.id);
        } else {
          // Update existing row
          await supabase.from('cart').update({ quantity: newQty }).eq('id', existing.id);
        }
      } else if (delta > 0) {
        // Insert new row if adding for the first time
        await supabase.from('cart').insert([{ 
          user_id: user.id, 
          product_id: product.id, 
          quantity: 1, 
          name: product.name, 
          price: product.price, 
          image: product.image 
        }]);
      }
      // UI will refresh via real-time subscription
    } catch (error) {
      console.error("Cart Sync Error:", error.message);
    } finally {
      setLoadingId(null);
    }
  };

  const getItemQty = (id) => cartItems.find(i => i.product_id === id)?.quantity || 0;

  // Grid Layout Classes
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
              
              {/* Product Visual */}
              <Link to={`/product/${product.id}`} className="block relative group">
                <div className={`w-full ${isSingleRow ? 'h-32' : 'h-40'} mb-3 overflow-hidden rounded-2xl bg-black/40 relative`}>
                  <img 
                    src={product.image || 'https://via.placeholder.com/150'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  {/* Subtle Glass Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                </div>
                
                <p className="text-[10px] font-black uppercase text-white/80 truncate tracking-tight leading-none">
                  {product.name}
                </p>
                <p className="text-[8px] text-gray-500 font-bold uppercase mt-1">Premium Quality</p>
              </Link>

              {/* Price & Action Control */}
              <div className="flex justify-between items-center mt-4">
                <span className="text-primary font-black text-sm italic">₹{product.price}</span>
                
                <div className="relative">
                  {qty > 0 ? (
                    <div className="flex items-center bg-primary rounded-xl h-9 px-1 shadow-lg shadow-primary/20 transition-all">
                      <button 
                        disabled={isSyncing}
                        onClick={() => updateQuantity(product, -1)} 
                        className="w-7 h-7 flex items-center justify-center text-black font-black text-lg active:scale-75 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="px-2 text-black text-xs font-black min-w-[24px] text-center italic">
                        {isSyncing ? '...' : qty}
                      </span>
                      <button 
                        disabled={isSyncing}
                        onClick={() => updateQuantity(product, 1)} 
                        className="w-7 h-7 flex items-center justify-center text-black font-black text-lg active:scale-75 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      disabled={isSyncing}
                      onClick={() => updateQuantity(product, 1)}
                      className="bg-primary/10 border border-primary/30 text-primary w-9 h-9 rounded-xl font-black text-lg hover:bg-primary hover:text-black transition-all active:scale-75 shadow-lg shadow-primary/5 flex items-center justify-center"
                    >
                      {isSyncing ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : '+'}
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
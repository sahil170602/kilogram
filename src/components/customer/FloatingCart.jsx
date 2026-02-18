import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * FloatingCart Terminal
 * High-fidelity pill design with real-time value sync.
 */
export default function FloatingCart() {
  const [cartInfo, setCartInfo] = useState({ count: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const updateCartMetrics = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('cart')
        .select('price, quantity')
        .eq('user_id', user.id);

      if (error) throw error;

      // Calculate both count and total for a more "useful" look
      const metrics = data.reduce((acc, item) => ({
        count: acc.count + item.quantity,
        total: acc.total + (item.price * item.quantity)
      }), { count: 0, total: 0 });

      setCartInfo(metrics);
    } catch (err) {
      console.error("Cart Sync Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    updateCartMetrics();
    const subscription = supabase.channel('floating_cart_sync')
      .on('postgres_changes', { event: '*', table: 'cart' }, updateCartMetrics)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [updateCartMetrics]);

  if (cartInfo.count === 0 || loading) return null;

  return (
    <div className="fixed bottom-28 left-0 right-0 flex justify-center z-[150] pointer-events-none px-6">
      <Link 
        to="/cart" 
        className="pointer-events-auto flex items-center gap-4 bg-black/80 backdrop-blur-2xl border border-white/10 pl-3 pr-6 py-3 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-90 transition-all duration-500 group animate-in slide-in-from-bottom-10"
      >
        {/* Iconic Asset Badge */}
        <div className="relative w-12 h-12 bg-primary rounded-[1.2rem] flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] group-hover:rotate-[10deg] transition-transform">
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-black">
             <span className="text-black text-[9px] font-black">{cartInfo.count}</span>
          </div>
        </div>

        {/* Financial Telemetry */}
        <div className="flex flex-col">
          <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] leading-none mb-1">
            Manifest Value
          </p>
          <p className="text-lg font-black text-white italic tracking-tighter leading-none">
            ₹{cartInfo.total.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Action Pointer */}
        <div className="ml-2 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary transition-colors">
          <svg className="w-4 h-4 text-white group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
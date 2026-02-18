import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; //

/**
 * Navbar Component
 * A persistent sticky navigation bar that displays the active delivery profile.
 */
export default function Navbar() {
  const [deliveryLabel, setDeliveryLabel] = useState('Home');

  // 1. Fetch the active address type from Supabase
  const syncAddressLabel = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: addr } = await supabase
          .from('addresses')
          .select('type')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .single();

        if (addr?.type) {
          setDeliveryLabel(addr.type);
        }
      }
    } catch (err) {
      console.error("Navbar Sync Error:", err.message);
    }
  };

  useEffect(() => {
    syncAddressLabel();

    // 2. Real-time Listener: Updates if the user changes their primary address
    const subscription = supabase
      .channel('navbar_address_sync')
      .on('postgres_changes', 
        { event: '*', table: 'addresses' }, 
        syncAddressLabel
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  return (
    <nav className="glass-card sticky top-4 mx-4 p-4 flex justify-between items-center z-50 border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl shadow-2xl">
      {/* Branding with signature primary glow */}
      <h1 className="text-primary font-black text-2xl tracking-tighter italic drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]">
        KILOGRAM
      </h1>

      {/* Dynamic Delivery Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-4 py-1.5 rounded-full transition-all hover:border-primary/30">
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Deliver to:</span>
          <span className="text-[10px] font-black text-primary uppercase italic tracking-tight">
            {deliveryLabel}
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1 shadow-[0_0_5px_#22c55e]"></div>
        </div>
      </div>
    </nav>
  );
}
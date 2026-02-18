import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * Header Component
 * Minimalist executive terminal displaying identity and verified logistics coordinates.
 */
export default function Header() {
  const [initial, setInitial] = useState('?');
  const [address, setAddress] = useState('Locating...');

  // 1. Fetch Identity & Active Coordinates from Supabase
  const loadHeaderTelemetry = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch Profile Initial 
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile?.full_name) {
          setInitial(profile.full_name.charAt(0).toUpperCase());
        }

        // Fetch Primary Logistics Address
        const { data: addr } = await supabase
          .from('addresses')
          .select('address')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .maybeSingle();

        if (addr) {
          setAddress(addr.address);
        } else {
          setAddress('Address Pending');
        }
      }
    } catch (err) {
      console.error("Header Handshake Error:", err.message);
    }
  }, []);

  useEffect(() => {
    loadHeaderTelemetry();

    // 2. Real-time Subscription for profile/address changes
    const headerSub = supabase
      .channel('header_live_sync')
      .on('postgres_changes', { event: '*', table: 'profiles' }, loadHeaderTelemetry)
      .on('postgres_changes', { event: '*', table: 'addresses' }, loadHeaderTelemetry)
      .subscribe();

    return () => {
      supabase.removeChannel(headerSub);
    };
  }, [loadHeaderTelemetry]);

  return (
    <header className="fixed top-0 left-0 right-0 h-24 bg-black/60 backdrop-blur-2xl border-b border-white/5 z-[100] flex items-center justify-between px-6 shadow-2xl">
      <div className="flex flex-col">
        {/* Brand Identity */}
        <Link to="/home" className="flex items-center gap-2 group active:scale-95 transition-transform">
          <h1 className="text-2xl font-black italic tracking-tighter leading-none text-white">
            KILO<span className="text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]">GRAM</span>
          </h1>
        </Link>
        
        {/* Logistics Coordinate Display (Non-interactive) */}
        <div className="flex items-center gap-1.5 mt-2 opacity-60">
          <span className="text-primary text-[10px]">📍</span>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] truncate max-w-[150px]">
            {address}
          </p>
        </div>
      </div>

      {/* Profile Terminal Access */}
      <Link 
        to="/profile" 
        className="relative group w-12 h-12"
      >
        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-2xl group-hover:bg-primary/40 transition-all opacity-0 group-hover:opacity-100"></div>
        <div className="relative w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-primary font-black text-base active:scale-90 transition-all shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          {initial}
        </div>
      </Link>
    </header>
  );
}
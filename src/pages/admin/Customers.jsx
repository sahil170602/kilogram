import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase'; //

/**
 * Admin Customers Component
 * Manages user profiles and order statistics synced with Supabase.
 */
export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Profiles and calculated Order Counts from Supabase
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      // Logic: Fetch all profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('joined_date', { ascending: false });

      if (profileError) throw profileError;

      // Logic: Fetch orders to map stats
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('phone');

      if (orderError) throw orderError;

      const usersWithStats = profiles.map(user => ({
        ...user,
        // Map order count based on unique phone identifier
        orderCount: orders.filter(o => o.phone === user.phone).length
      }));

      setCustomers(usersWithStats);
    } catch (error) {
      console.error("Database Error:", error.message);
      alert("Failed to sync customer registry: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();

    // 2. Real-time Subscription: Refresh if a new user joins or profile updates
    const subscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', table: 'profiles' }, loadCustomers)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [loadCustomers]);

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header Section */}
      <header className="mb-8 shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-none">
            Registered <span className="text-primary">Users</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black italic mt-3 uppercase tracking-[0.3em]">
            Cloud Customer Database Management
          </p>
        </div>
        
        <div className="glass-card px-6 py-3 border-primary/20 bg-primary/5 flex flex-col items-end shadow-2xl">
           <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Base</p>
           <p className="text-2xl font-black text-primary italic leading-none">
             {loading ? '...' : customers.length.toString().padStart(2, '0')}
           </p>
        </div>
      </header>

      {/* Main Table Container */}
      <div className="flex-1 glass-card border-white/5 overflow-hidden bg-white/[0.01] flex flex-col shadow-2xl relative">
        {/* Subtle Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

        <div className="overflow-y-auto no-scrollbar relative z-10">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#0a0a0a] border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] z-20">
              <tr>
                <th className="px-10 py-6 w-24">Node</th>
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Contact Stream</th>
                <th className="px-8 py-6 text-center">Registration</th>
                <th className="px-8 py-6 text-center">Orders</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-32 text-center animate-pulse">
                    <span className="text-primary font-black uppercase text-[10px] tracking-[0.5em]">Establishing Sync...</span>
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-white/[0.03] transition-all group cursor-default">
                    
                    {/* Incremental ID Node */}
                    <td className="px-10 py-5">
                      <span className="text-[11px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 italic">
                        #{ (customers.length - index).toString().padStart(2, '0') }
                      </span>
                    </td>

                    {/* Identity Module */}
                    <td className="px-8 py-5 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center font-black text-white italic border border-white/10 group-hover:border-primary/40 group-hover:text-primary transition-all duration-300 shadow-xl">
                        {user.full_name?.charAt(0) || user.name?.charAt(0)}
                      </div>
                      <p className="font-black text-white uppercase text-xs tracking-widest leading-none group-hover:translate-x-1 transition-transform">
                        {user.full_name || user.name}
                      </p>
                    </td>

                    {/* Contact */}
                    <td className="px-8 py-5 font-bold text-gray-400 text-xs tracking-widest group-hover:text-gray-200 transition-colors">
                      +91 {user.phone}
                    </td>
                    
                    {/* Timestamp Mapping */}
                    <td className="px-8 py-5 text-center text-[10px] text-gray-500 font-black uppercase tracking-widest italic">
                      {new Date(user.joined_date || user.joinedDate).toLocaleDateString('en-IN')}
                    </td>

                    {/* Stats Mapping */}
                    <td className="px-8 py-5 text-center">
                      <span className="text-white font-black italic text-sm bg-white/5 px-4 py-1.5 rounded-xl border border-white/10 group-hover:border-primary/20 group-hover:text-primary transition-all shadow-inner">
                        {user.orderCount || 0}
                      </span>
                    </td>

                    {/* Action Hub */}
                    <td className="px-10 py-5 text-right">
                      <button className="text-[10px] font-black text-primary border border-primary/20 px-6 py-3 rounded-2xl uppercase hover:bg-primary hover:text-black transition-all active:scale-90 shadow-lg shadow-primary/5 hover:shadow-primary/20">
                        View Ledger
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <span className="text-5xl">👥</span>
                      <p className="text-gray-400 font-black uppercase italic tracking-[0.5em] text-xs">
                        Registry Vault Empty
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
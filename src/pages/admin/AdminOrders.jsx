import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase'; //

/**
 * AdminOrders Component
 * Displays archived settlements (Delivered/Cancelled) fetched directly from Supabase.
 */
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('Delivered');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Archived Orders from Supabase
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Filter for terminal states only to keep history clean
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['Delivered', 'Cancelled'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Archive Sync Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    // 2. Real-time Subscription: Refresh history if an order is archived
    const subscription = supabase
      .channel('admin-archive-sync')
      .on('postgres_changes', { event: 'UPDATE', table: 'orders' }, payload => {
        // If an order status changes to Delivered or Cancelled, refresh the list
        if (['Delivered', 'Cancelled'].includes(payload.new.status)) {
          loadOrders();
        }
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [loadOrders]);

  // 3. Derived Stats
  const totalRevenue = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(o => o.status === filter);

  return (
    <div className="animate-in fade-in duration-700 h-full flex flex-col">
      {/* Header with Cloud Analytics */}
      <header className="flex justify-between items-end mb-10 shrink-0">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
            Order <span className="text-primary">History</span>
          </h1>
          <p className="text-gray-500 text-sm font-bold italic mt-3 underline decoration-primary/30">
            Archived settlements synced with Supabase Cloud.
          </p>
        </div>
        
        <div className="text-right glass-card p-4 border-primary/20 bg-primary/5">
           <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Lifetime Revenue</p>
           <p className="text-3xl font-black text-primary italic leading-none">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-8 shrink-0">
        {['Delivered', 'Cancelled', 'All'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              filter === tab 
                ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
                : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-20">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
             <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
             <p className="text-primary font-black uppercase text-[10px] animate-pulse">Syncing Archives...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="glass-card p-8 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group relative overflow-hidden">
              {/* Decorative Background ID */}
              <span className="absolute -right-4 -bottom-4 text-7xl font-black text-white/[0.02] italic pointer-events-none uppercase">
                {order.id.slice(0, 4)}
              </span>

              <div className="flex justify-between items-center relative z-10">
                <div className="flex gap-8 items-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${
                    order.status === 'Delivered' 
                      ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                      : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    {order.status === 'Delivered' ? '✓' : '✕'}
                  </div>
                  
                  <div>
                    <h3 className="font-black text-xl tracking-tighter uppercase italic text-white group-hover:text-primary transition-colors">
                      {order.id.slice(0, 12)}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-IN')} • {order.items?.length || 0} Assets Handled
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-600 uppercase mb-2 tracking-tighter">Settled Amount</p>
                  <p className="text-2xl font-black text-white italic leading-none">₹{order.total_amount}</p>
                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg mt-2 inline-block border ${
                    order.status === 'Delivered' 
                      ? 'border-green-500/30 text-green-500 bg-green-500/5' 
                      : 'border-red-500/30 text-red-500 bg-red-500/5'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items Strip */}
              <div className="mt-6 pt-6 border-t border-white/5 flex gap-3 overflow-x-auto no-scrollbar relative z-10">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex-shrink-0 bg-black/40 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
                    <img src={item.image} className="w-7 h-7 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                    <p className="text-[9px] font-black uppercase text-gray-400">
                      <span className="text-primary">{item.quantity}x</span> {item.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] gap-4">
            <span className="text-4xl opacity-20">📂</span>
            <p className="text-gray-700 font-black uppercase tracking-[0.4em] italic text-xs">Archives Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
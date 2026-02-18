import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Header from "../../components/customer/Header";
import BottomNav from "../../components/customer/BottomNav";
import LiveTrackingMap from "../../components/customer/LiveTrackingMap";

/**
 * Orders Component
 * Executive logistics terminal for tracking active coordinate streams and history.
 */
export default function Orders() {
  const [liveOrder, setLiveOrder] = useState(null);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Unified Cloud Synchronizer
  const loadOrders = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // FILTER: Active Logistics (Real-time tracking enabled)
        const currentLive = data.find(order => 
          ['Live', 'Processing', 'Packing', 'Packed', 'Out for Delivery'].includes(order.status)
        );
        setLiveOrder(currentLive);

        // FILTER: Vault History (Settled nodes)
        const past = data.filter(order => 
          ['Delivered', 'Cancelled'].includes(order.status)
        );
        setHistoryOrders(past);
      }
    } catch (err) {
      console.error("Order Sync Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    // 2. REAL-TIME HANDSHAKE: Re-sync on status changes
    const subscription = supabase.channel('order_live_pipeline')
      .on('postgres_changes', { event: 'UPDATE', table: 'orders' }, loadOrders)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [loadOrders]);

  // 3. Logistics Stepper Config
  const steps = ["Live", "Packing", "Packed", "Out for Delivery", "Delivered"];
  const currentStepIndex = steps.indexOf(liveOrder?.status || "Live");

  // 4. Reorder Protocol: Wipe cart and inject historical items
  const handleReorder = async (orderItems) => {
    if (!orderItems || orderItems.length === 0) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      // Clear local cloud cart
      await supabase.from('cart').delete().eq('user_id', user.id);
      
      const cartPayload = orderItems.map(item => ({
        user_id: user.id,
        product_id: item.product_id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      await supabase.from('cart').insert(cartPayload);
      navigate('/cart');
    } catch (err) {
      alert("Reorder sync failed.");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#ff4d94]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-44 selection:bg-primary/30">
      <Header />
      
      <main className="px-6 animate-in fade-in duration-700">
        <div className="mb-10">
          <h1 className="text-4xl font-black  uppercase tracking-tighter leading-none">
             All <span className="text-primary ">Orders</span>
          </h1>
          <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em] mt-3">Logistics Stream: Online</p>
        </div>

        {/* --- LIVE PIPELINE SECTION --- */}
        {liveOrder ? (
          <section className="mb-12 animate-in slide-in-from-top-4 duration-700">
            <div className="flex justify-between items-end mb-4 px-1">
              <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Real Time Update</h2>
              <span className="text-[8px] font-bold text-gray-700 uppercase italic">Ref: #{liveOrder.id.slice(-8)}</span>
            </div>
            
            <div className="glass-card overflow-hidden bg-white/[0.02] border-primary/20 border-2 shadow-2xl rounded-[2.5rem] relative">
              
              {/* LEAFLET TERMINAL  */}
              <div className="relative h-72 bg-[#0a0a0a] overflow-hidden border-b border-white/5">
                <LiveTrackingMap orderId={liveOrder.id} />
                
                {/* Status Overlay */}
                <div className="absolute top-4 left-4 z-[400] bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                   <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">
                     {liveOrder.status}
                   </span>
                </div>
              </div>

              {/* STEPPER DASHBOARD */}
              <div className="p-8 bg-black/40 backdrop-blur-md">
                <div className="flex justify-between relative mb-4 px-2">
                  <div className="absolute top-2.5 left-0 right-0 h-[2px] bg-white/10 z-0"></div>
                  <div 
                    className="absolute top-2.5 left-0 h-[2px] bg-primary z-0 transition-all duration-1000 shadow-[0_0_10px_#ff4d94]"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                  ></div>
                  
                  {steps.map((step, i) => (
                    <div key={step} className="relative z-10">
                      <div className={`w-5 h-5 rounded-full border-2 transition-all duration-700 flex items-center justify-center ${
                        i <= currentStepIndex ? 'bg-primary border-primary shadow-[0_0_15px_#ff4d94]' : 'bg-[#0a0a0a] border-white/20'
                      }`}>
                        {i < currentStepIndex && <span className="text-black text-[10px] font-black italic">✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between px-1">
                   <p className="text-[8px] font-black text-primary uppercase tracking-tighter italic">Order Placed</p>
                   <p className={`text-[8px] font-black uppercase tracking-tighter italic ${currentStepIndex >= 3 ? 'text-primary' : 'text-gray-700'}`}>Dispatch</p>
                   <p className={`text-[8px] font-black uppercase tracking-tighter italic ${currentStepIndex >= 4 ? 'text-primary' : 'text-gray-700'}`}>Completion</p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* EMPTY STATE PIPELINE */
          <div className="mb-12 p-16 glass-card border-dashed border-white/10 text-center opacity-30 flex flex-col items-center gap-4 rounded-[2.5rem]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl">📡</div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">Scanning Pipeline...</p>
          </div>
        )}

        {/* --- VAULT HISTORY SECTION --- */}
        <section className="animate-in slide-in-from-bottom-6 duration-1000">
          <div className="flex items-center gap-3 mb-8 px-1">
            <h2 className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] italic leading-none">Order History</h2>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>
          
          <div className="space-y-4 pb-20">
            {historyOrders.length > 0 ? historyOrders.map(order => (
                <div key={order.id} className="glass-card p-6 border-white/5 bg-white/[0.01] flex justify-between items-center group active:bg-white/[0.03] transition-all duration-300 relative overflow-hidden">
                  <div className="flex gap-5 items-center relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg border-2 shadow-xl ${
                      order.status === 'Delivered' ? 'bg-green-500/5 border-green-500/10 text-green-500' : 'bg-red-500/5 border-red-500/10 text-red-500'
                    }`}>
                      {order.status === 'Delivered' ? '✓' : '✕'}
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-white italic">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-[9px] text-gray-600 font-bold mt-1 uppercase tracking-widest">
                        Ref: #{order.id.slice(-6)} • <span className="text-primary italic">₹{order.total_amount}</span>
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleReorder(order.items)}
                    className="text-[9px] font-black text-primary border border-primary/20 px-6 py-3 rounded-xl uppercase hover:bg-primary hover:text-black transition-all active:scale-90"
                  >
                    Reorder
                  </button>
                </div>
              )) : (
              <div className="py-24 text-center glass-card border-white/5 bg-white/[0.01] rounded-[2rem]">
                <p className="text-gray-800 text-[10px] font-black uppercase tracking-[0.5em] italic">No Past Orders</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
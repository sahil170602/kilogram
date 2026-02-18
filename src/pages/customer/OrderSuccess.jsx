import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Header from "../../components/customer/Header";

/**
 * OrderSuccess Component
 * Displays the confirmation and real-time tracking for the most recent order.
 * Powered by Supabase Realtime logic.
 */
export default function OrderSuccess() {
  const navigate = useNavigate();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch the absolute latest order for the logged-in user
  const loadLatestOrder = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setCurrentOrder(data);
    } catch (err) {
      console.error("Order Sync Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLatestOrder();

    // 2. Real-time Subscription: Update status instantly when Admin pushes changes
    const subscription = supabase
      .channel('order-success-monitor')
      .on('postgres_changes', 
        { event: 'UPDATE', table: 'orders' }, 
        (payload) => {
          // Only update if the change belongs to the current displayed order
          if (currentOrder && payload.new.id === currentOrder.id) {
            setCurrentOrder(payload.new);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [loadLatestOrder, currentOrder?.id]);

  const steps = ["Live", "Packing", "Packed", "Out for Delivery", "Delivered"];
  const currentStepIndex = steps.indexOf(currentOrder?.status || "Live");

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-10 selection:bg-primary/30">
      <Header />
      
      <div className="px-6 animate-in fade-in duration-1000">
        {/* Success Branding */}
        <div className="text-center mb-12">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-rgb),0.4)]">
              <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Order Secured</h1>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-3">
            Ref ID: <span className="text-white italic">{currentOrder?.id.slice(0, 13)}</span>
          </p>
        </div>

        {/* Real-time Cloud Stepper */}
        <div className="glass-card p-8 bg-white/[0.02] border-white/5 mb-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-transparent to-transparent opacity-30" />
          
          <div className="flex justify-between relative">
            {/* Background Line */}
            <div className="absolute top-4 left-2 right-2 h-0.5 bg-white/10 z-0"></div>
            
            {/* Active Progress Line */}
            <div 
              className="absolute top-4 left-2 h-0.5 bg-primary z-0 transition-all duration-1000 ease-in-out shadow-[0_0_10px_#ff4d94]"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 96}%` }}
            ></div>
            
            {steps.map((step, i) => (
              <div key={step} className="relative z-10 flex flex-col items-center gap-4">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  i <= currentStepIndex ? 'bg-primary border-primary shadow-[0_0_20px_#ff4d94]' : 'bg-black border-white/20'
                }`}>
                  {i < currentStepIndex ? (
                    <span className="text-black text-[12px] font-black italic">✓</span>
                  ) : i === currentStepIndex ? (
                    <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                  ) : (
                    <span className="text-gray-700 text-[8px] font-black">{i + 1}</span>
                  )}
                </div>
                <p className={`text-[8px] font-black uppercase text-center w-14 tracking-tighter ${
                  i <= currentStepIndex ? 'text-white' : 'text-gray-600'
                }`}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Logistics Terminal (Map View) */}
        <div className="glass-card h-80 rounded-[2.5rem] overflow-hidden relative border-white/5 mb-12 shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-white/[0.01]">
          <iframe 
            width="100%" height="100%" 
            src="http://googleusercontent.com/maps.google.com/5"
            className="grayscale invert opacity-20 contrast-150 pointer-events-none"
          ></iframe>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />

          {/* Animated Rider Marker Mapping */}
          <div className="absolute transition-all duration-[6000ms] ease-in-out"
            style={{ 
              top: currentOrder?.status === 'Delivered' ? '20%' : (currentStepIndex >= 3 ? '35%' : '65%'), 
              left: currentOrder?.status === 'Delivered' ? '80%' : (currentStepIndex >= 3 ? '70%' : '20%') 
            }}
          >
            <div className="flex flex-col items-center">
               <div className="bg-primary text-black text-[9px] font-black px-3 py-1.5 rounded-xl shadow-2xl uppercase mb-3 animate-bounce">
                 {currentStepIndex >= 3 ? 'Rider Inbound' : 'Dispatching...'}
               </div>
               <div className="text-5xl drop-shadow-[0_0_25px_#ff4d94]">
                {currentStepIndex >= 3 ? '🏍️' : '🏪'}
               </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] italic opacity-40">Live Logistics Feed</span>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="space-y-4">
          <Link 
            to="/home" 
            className="block w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest text-center shadow-2xl active:scale-95 transition-all"
          >
            Authorize New Sync
          </Link>
          <button 
            onClick={() => navigate('/orders')}
            className="block w-full text-gray-600 hover:text-white font-black uppercase text-[9px] tracking-[0.3em] text-center py-2 transition-all"
          >
            View Active Pipelines
          </button>
        </div>
      </div>
    </div>
  );
}
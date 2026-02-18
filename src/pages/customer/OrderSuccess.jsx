import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from "../../components/customer/Header";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [trackingData, setTrackingData] = useState({ origin: null, destination: null });

  const loadLatestOrder = () => {
    // 1. Fetch current order from history
    const history = JSON.parse(localStorage.getItem('kilogram_orders_history') || '[]');
    if (history.length > 0) {
      setCurrentOrder(history[0]);
    }

    // 2. Load Store and Customer coordinates for the map
    const store = JSON.parse(localStorage.getItem('kilogram_store_location') || 'null');
    const userAddr = JSON.parse(localStorage.getItem('kilogram_addresses') || '[]');
    const primaryAddr = userAddr.find(a => a.isPrimary) || userAddr[0];

    if (store && primaryAddr) {
      setTrackingData({
        origin: { lat: parseFloat(store.lat), lng: parseFloat(store.lng) },
        destination: { lat: primaryAddr.lat, lng: primaryAddr.lng }
      });
    }
  };

  useEffect(() => {
    loadLatestOrder();
    // Sync status updates from Admin in real-time
    window.addEventListener('storage', loadLatestOrder);
    return () => window.removeEventListener('storage', loadLatestOrder);
  }, []);

  // Step logic synced with Admin Status
  const steps = ["Live", "Packing", "Packed", "Out for Delivery", "Delivered"];
  const currentStepIndex = steps.indexOf(currentOrder?.status || "Live");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-10 pb-20">
      <Header />
      
      <div className="px-6 mt-16">
        {/* Success Icon & Header */}
        <div className="text-center mb-10">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)]">
              <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Order Secured!</h1>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2 italic">Ref ID: {currentOrder?.id}</p>
        </div>

        {/* Real-time Logistics Stepper */}
        <div className="glass-card p-6 bg-white/[0.02] border-white/5 mb-8">
          <div className="flex justify-between relative">
            <div className="absolute top-3 left-2 right-2 h-0.5 bg-white/10 z-0"></div>
            <div 
              className="absolute top-3 left-2 h-0.5 bg-primary z-0 transition-all duration-1000 ease-out"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 96}%` }}
            ></div>
            
            {steps.map((step, i) => (
              <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  i <= currentStepIndex ? 'bg-primary border-primary shadow-[0_0_15px_#ff4d94]' : 'bg-black border-white/20'
                }`}>
                  {i < currentStepIndex && <span className="text-black text-[10px] font-black">✓</span>}
                  {i === currentStepIndex && <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></div>}
                </div>
                <p className={`text-[7px] font-black uppercase text-center w-12 tracking-tighter ${
                  i <= currentStepIndex ? 'text-white' : 'text-gray-600'
                }`}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Tracking Map with Rider Animation */}
        <div className="glass-card h-80 rounded-[2.5rem] overflow-hidden relative border-white/5 mb-10 shadow-2xl bg-white/[0.02]">
          <iframe 
            width="100%" height="100%" 
            src="http://googleusercontent.com/maps.google.com/9"
            className="grayscale invert opacity-30 contrast-125 pointer-events-none"
          ></iframe>
          
          {/* Animated Rider/Warehouse Marker - Movement based on Status */}
          <div className="absolute transition-all duration-[4000ms] ease-in-out"
            style={{ 
              top: currentOrder?.status === 'Delivered' ? '20%' : (currentStepIndex >= 3 ? '40%' : '65%'), 
              left: currentOrder?.status === 'Delivered' ? '80%' : (currentStepIndex >= 3 ? '60%' : '20%') 
            }}
          >
            <div className="flex flex-col items-center">
               <div className="bg-primary text-black text-[9px] font-black px-3 py-1 rounded-lg shadow-2xl uppercase mb-2 whitespace-nowrap">
                 {currentStepIndex >= 3 ? 'Partner Enroute' : 'Dispatching...'}
               </div>
               <div className="text-4xl drop-shadow-[0_0_20px_#ff4d94] animate-bounce">
                {currentStepIndex >= 3 ? '🏍️' : '🏪'}
               </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/home" className="block w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest text-center shadow-xl transition-all active:scale-95">
            Continue Shopping
          </Link>
          <button 
            onClick={() => navigate('/orders')}
            className="block w-full text-gray-500 hover:text-white font-black uppercase text-[10px] tracking-widest text-center py-2 transition-colors"
          >
            View My Activity
          </button>
        </div>
      </div>
    </div>
  );
}
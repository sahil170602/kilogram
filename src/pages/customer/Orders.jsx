import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Header from "../../components/customer/Header";

export default function Orders() {
  const [liveOrder, setLiveOrder] = useState(null);
  const [historyOrders, setHistoryOrders] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const loadOrders = () => {
    // Fetch from the unified history key
    const savedOrders = JSON.parse(localStorage.getItem('kilogram_orders_history') || '[]');

    // 1. Filter Live Orders (Any status except Delivered/Cancelled)
    const currentLive = savedOrders.find(order => 
      ['Live', 'Processing', 'Packing', 'Packed', 'Out for Delivery'].includes(order.status)
    );
    setLiveOrder(currentLive);

    // 2. Filter History (Only Delivered or Cancelled)
    const past = savedOrders.filter(order => 
      ['Delivered', 'Cancelled'].includes(order.status)
    );
    setHistoryOrders(past);
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('storage', loadOrders);
    return () => window.removeEventListener('storage', loadOrders);
  }, []);

  // Tracking Progress Logic based on Admin selection
  const steps = ["Live", "Packing", "Packed", "Out for Delivery", "Delivered"];
  const currentStepIndex = steps.indexOf(liveOrder?.status || "Live");

  const handleReorder = (orderItems) => {
    localStorage.setItem('kilogram_cart', JSON.stringify(orderItems));
    window.dispatchEvent(new Event('storage'));
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-10 pb-44">
      
      <div className="px-6">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Activity</h1>

        {/* --- SECTION 1: LIVE TRACKING --- */}
        {liveOrder ? (
          <section className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex justify-between items-end mb-4 px-1">
              <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Active Track</h2>
              <span className="text-[9px] font-bold text-gray-500 uppercase italic">Ref: #{liveOrder.id}</span>
            </div>
            
            <div className="glass-card overflow-hidden bg-white/5 border-primary/20 border-2 shadow-2xl shadow-primary/5">
              
              {/* Live Map View with Dark Theme */}
              <div className="relative h-64 bg-[#111] overflow-hidden">
                <iframe 
                  width="100%" height="100%" 
                  src="https://developers.google.com/maps/documentation/routes"
                  className="grayscale invert opacity-30 contrast-125 pointer-events-none"
                ></iframe>
                
                {/* Animated Rider/Warehouse Marker based on Store Settings */}
                <div className="absolute transition-all duration-[3000ms] ease-in-out"
                  style={{ 
                    top: liveOrder.status === 'Out for Delivery' ? '30%' : '60%', 
                    left: liveOrder.status === 'Out for Delivery' ? '70%' : '20%' 
                  }}
                >
                  <div className="flex flex-col items-center">
                     <div className="text-3xl drop-shadow-[0_0_15px_#ff4d94] animate-bounce">
                      {liveOrder.status === 'Out for Delivery' ? '🏍️' : '🏪'}
                     </div>
                     <div className="mt-2 bg-primary text-black text-[8px] font-black px-2 py-1 rounded-full uppercase">
                       {liveOrder.status}
                     </div>
                  </div>
                </div>
              </div>

              {/* Status Stepper Syncing with Admin */}
              <div className="p-6 bg-black/60 border-t border-white/5">
                <div className="flex justify-between relative mb-2">
                  <div className="absolute top-2 left-0 w-full h-0.5 bg-white/10 z-0"></div>
                  <div 
                    className="absolute top-2 left-0 h-0.5 bg-primary z-0 transition-all duration-1000"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                  ></div>
                  
                  {steps.slice(0, 4).map((step, i) => (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                        i <= currentStepIndex ? 'bg-primary border-primary shadow-[0_0_8px_#ff4d94]' : 'bg-black border-white/20'
                      }`}></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between px-1">
                   <p className="text-[8px] font-black text-primary uppercase italic">Confirmed</p>
                   <p className={`text-[8px] font-black uppercase italic ${currentStepIndex >= 3 ? 'text-primary' : 'text-gray-600'}`}>Dispatch</p>
                </div>
              </div>
              
              <div className="p-5 flex justify-between items-center bg-white/5 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl border border-primary/20">🛵</div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">
                      {liveOrder.status === 'Out for Delivery' ? 'Rider is Enroute' : 'Preparing Order'}
                    </p>
                    <p className="text-[8px] text-gray-500 font-bold mt-1 uppercase">Lightning Delivery</p>
                  </div>
                </div>
                <button className="bg-primary text-black px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">
                  Support
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="mb-12 p-10 glass-card border-dashed border-white/5 text-center opacity-20">
              <p className="text-[10px] font-black uppercase tracking-widest italic leading-none">No active transactions in transit</p>
          </div>
        )}

        {/* --- SECTION 2: ORDER VAULT --- */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 px-1 italic">Order Vault</h2>
          
          <div className="space-y-4 pb-20">
            {historyOrders.length > 0 ? (
              historyOrders.map(order => (
                <div key={order.id} className="glass-card p-5 border-white/5 bg-white/[0.02] flex justify-between items-center group hover:bg-white/[0.04] transition-all">
                  <div className="flex gap-5 items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border ${
                      order.status === 'Delivered' ? 'bg-green-500/10 border-green-500/10 text-green-500' : 'bg-red-500/10 border-red-500/10 text-red-500'
                    }`}>
                      {order.status === 'Delivered' ? '✓' : '✕'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black uppercase tracking-tighter text-white italic">{order.date}</p>
                        <span className={`text-[7px] font-black border px-1.5 py-0.5 rounded uppercase ${
                          order.status === 'Delivered' ? 'border-green-500/30 text-green-500' : 'border-red-500/30 text-red-500'
                        }`}>{order.status}</span>
                      </div>
                      <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase tracking-wide">
                        {order.items?.length || 0} Items • <span className="text-white">₹{order.total}</span>
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleReorder(order.items)}
                    className="text-[9px] font-black text-primary border border-primary/20 px-4 py-2.5 rounded-xl uppercase hover:bg-primary hover:text-black transition-all active:scale-95"
                  >
                    Reorder
                  </button>
                </div>
              ))
            ) : (
              <div className="py-20 text-center glass-card border-white/5 bg-white/2">
                <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest italic leading-none">Vault is currently empty</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-6 right-6 h-20 glass-card flex justify-around items-center px-4 z-50 shadow-2xl shadow-primary/10">
        
        {/* Store Tab */}
        <Link to="/home" className="flex-1">
          <div className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 mx-auto w-fit ${
            isActive('/home') ? 'bg-black/100 text-primary scale-105' : 'text-white-500 hover:text-white'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">Store</span>
          </div>
        </Link>
        
        {/* Products Tab */}
        <Link to="/all-products" className="flex-1">
          <div className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 mx-auto w-fit ${
            isActive('/all-products') ? 'bg-black/100 text-primary scale-105' : 'text-white-500 hover:text-white'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">Products</span>
          </div>
        </Link>
      
        {/* Orders Tab */}
        <Link to="/orders" className="flex-1">
          <div className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 mx-auto w-fit ${
            isActive('/orders') ? 'bg-black/100 text-primary scale-105' : 'text-white-500 hover:text-white'
          }`}>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter">Orders</span>
          </div>
        </Link>
      
      </div>
    </div>
  );
}
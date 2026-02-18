import React, { useState, useEffect } from 'react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('Delivered');

  const loadOrders = () => {
    const allSaved = JSON.parse(localStorage.getItem('kilogram_orders_history') || '[]');
    
    // Filter out active logistics (Live/Packing/Packed/Out for Delivery)
    // Only show completed or terminal states
    const historyOnly = allSaved.filter(o => 
      ['Delivered', 'Cancelled'].includes(o.status)
    );
    
    setOrders(historyOnly);
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('storage', loadOrders);
    return () => window.removeEventListener('storage', loadOrders);
  }, []);

  const totalRevenue = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(o => o.status === filter);

  return (
    <div className="animate-in fade-in duration-700 h-full flex flex-col">
      <header className="flex justify-between items-end mb-10 shrink-0">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">Order History</h1>
          <p className="text-gray-500 text-sm font-bold italic mt-3 underline decoration-primary/30">Archived successful & cancelled settlements.</p>
        </div>
        
        <div className="text-right">
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Lifetime Cleared</p>
           <p className="text-3xl font-black text-primary italic leading-none">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </header>

      {/* Filter Tabs - History Context Only */}
      <div className="flex gap-4 mb-8 shrink-0">
        {['Delivered', 'Cancelled', 'All'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              filter === tab 
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-20">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="glass-card p-8 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
              <div className="flex justify-between items-center">
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
                      {order.id}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                      {order.date} • {order.items.length} Products Handled
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-600 uppercase mb-2 tracking-tighter">Settled Amount</p>
                  <p className="text-2xl font-black text-white italic leading-none">₹{order.total}</p>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded mt-2 inline-block border ${
                    order.status === 'Delivered' 
                      ? 'border-green-500/30 text-green-500 bg-green-500/5' 
                      : 'border-red-500/30 text-red-500 bg-red-500/5'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Collapsed Items Strip */}
              <div className="mt-6 pt-6 border-t border-white/5 flex gap-3 overflow-x-auto no-scrollbar">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex-shrink-0 bg-black/40 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
                    <img src={item.image} className="w-6 h-6 rounded object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                    <p className="text-[9px] font-black uppercase text-gray-400">
                      <span className="text-primary">{item.quantity}x</span> {item.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-gray-700 font-black uppercase tracking-[0.4em] italic text-xs">Archives Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
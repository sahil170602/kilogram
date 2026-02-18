import React, { useState, useEffect, useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export default function AdminDashboard() {
  const location = useLocation();
  const [stats, setStats] = useState({ sales: 0, pending: 0, outOfStock: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const isOverview = location.pathname === '/admin' || location.pathname === '/admin/';
  const isActive = (path) => location.pathname === path;

  // --- Sidebar Navigation ---
  const navItems = useMemo(() => [
    { path: '/admin', label: 'Overview', icon: '📊' },
    { path: '/admin/inventory', label: 'Products', icon: '📦' },
    { path: '/admin/categories', label: 'Categories', icon: '📂' },
    { path: '/admin/banners', label: 'Marketing Banners', icon: '🖼️' },
    { path: '/admin/orders', label: 'Orders History', icon: '🚚' },
    { path: '/admin/customers', label: 'Customers Data', icon: '👥' },
    { path: '/admin/settings', label: 'Store Settings', icon: '⚙️' },
  ], []);

  const loadAdminData = () => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('kilogram_orders_history') || '[]');
      const allProducts = JSON.parse(localStorage.getItem('kilogram_products') || '[]');
      
      if (Array.isArray(allOrders)) {
        // Calculate Revenue from all orders
        const totalSales = allOrders.reduce((sum, o) => sum + (Number(o?.total) || 0), 0);
        
        // Overview only shows ACTIVE tracks (Removes 'Delivered' orders)
        const activeOrders = allOrders.filter(o => 
          ['Live', 'Processing', 'Packing', 'Packed', 'Out for Delivery'].includes(o?.status)
        );

        setStats({ 
          sales: totalSales, 
          pending: activeOrders.length,
          outOfStock: Array.isArray(allProducts) ? allProducts.filter(p => Number(p?.stock) === 0).length : 0
        });

        setRecentOrders(activeOrders); 
      }
    } catch (e) { console.error("Admin Load Error:", e); }
  };

  const updateStatus = (orderId, newStatus) => {
    const allOrders = JSON.parse(localStorage.getItem('kilogram_orders_history') || '[]');
    const updated = allOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    localStorage.setItem('kilogram_orders_history', JSON.stringify(updated));
    loadAdminData(); // Refresh overview to remove delivered orders instantly
    window.dispatchEvent(new Event('storage')); // Notifies Customer App
  };

  useEffect(() => {
    loadAdminData();
    window.addEventListener('storage', loadAdminData);
    return () => window.removeEventListener('storage', loadAdminData);
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-primary/30">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 border-r border-white/5 p-8 flex flex-col h-full bg-[#050505] shrink-0">
        <div className="mb-12 text-left">
          <h2 className="text-primary font-black text-3xl italic tracking-tighter leading-none">KILOGRAM</h2>
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Executive Suite</p>
        </div>

        <nav className="flex flex-col gap-1 relative overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.path) || (item.path === '/admin' && isOverview);
            return (
              <Link key={item.path} to={item.path} className={`group relative z-10 flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'text-black font-black' : 'text-gray-500 hover:text-white'}`}>
                {active && <div className="absolute inset-0 bg-primary rounded-2xl shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] z-[-1]"></div>}
                <span className="text-lg">{item.icon}</span>
                <span className="text-[11px] uppercase font-black tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full p-12 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
        
        {isOverview ? (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-700">
            <header className="flex justify-between items-end mb-10 shrink-0">
              <div className="text-left">
                <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-white">Overview</h1>
                <p className="text-gray-500 text-sm font-bold italic mt-3 underline decoration-primary/30">Live stream logistics feed.</p>
              </div>

              {/* Green Blinking Indicator */}
              <div className="text-[10px] font-black text-primary bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                LIVE TRACKING ACTIVE
              </div>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-8 mb-10 shrink-0">
              <div className="glass-card p-10 border-white/5 bg-white/[0.02]">
                <p className="text-gray-500 text-[11px] font-black uppercase mb-3">Total Sales</p>
                <p className="text-5xl font-black text-primary italic">₹{stats.sales.toLocaleString()}</p>
              </div>
              <div className="glass-card p-10 border-white/5 bg-white/[0.02]">
                <p className="text-gray-500 text-[11px] font-black uppercase mb-3">Active Pipeline</p>
                <p className="text-5xl font-black text-white italic">{stats.pending.toString().padStart(2, '0')}</p>
              </div>
              <div className="glass-card p-10 border-white/5 bg-white/[0.02]">
                <p className="text-gray-500 text-[11px] font-black uppercase mb-3">Stock Alerts</p>
                <p className="text-5xl font-black text-red-500 italic">{stats.outOfStock.toString().padStart(2, '0')}</p>
              </div>
            </div>

            {/* Live Stream Table */}
            <div className="flex-1 min-h-0 flex flex-col text-left">
              <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.5em] mb-6">Activity Stream</h3>
              <div className="flex-1 glass-card border-white/5 overflow-hidden bg-white/[0.01] flex flex-col shadow-2xl">
                <div className="overflow-y-auto no-scrollbar">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-[#0a0a0a] z-20 border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <tr>
                        <th className="px-10 py-6">Reference ID</th>
                        <th className="px-10 py-6">Logistics Status</th>
                        <th className="px-10 py-6 text-right">Settlement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                          <tr 
                            key={order?.id} 
                            onClick={() => setSelectedOrder(order)} 
                            className="text-xs hover:bg-white/[0.03] transition-colors group cursor-pointer"
                          >
                            <td className="px-10 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                                <div>
                                  <p className="font-black text-white italic uppercase group-hover:text-primary transition-colors">{order.id}</p>
                                  <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold truncate max-w-[150px]">
                                    {order.items?.[0]?.name} +{order.items?.length - 1} items
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-5" onClick={(e) => e.stopPropagation()}>
                              <select 
                                value={order.status} 
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                className="bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-primary uppercase focus:border-primary outline-none cursor-pointer"
                              >
                                <option value="Live">Confirmed</option>
                                <option value="Packing">Packing</option>
                                <option value="Packed">Packed</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Mark Delivered (Archive)</option>
                              </select>
                            </td>
                            <td className="px-10 py-5 text-right font-black italic text-primary text-lg">₹{order.total}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-20 text-center text-gray-600 font-black uppercase tracking-widest text-xs italic leading-none">
                            No active data tracks found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : <Outlet />}
      </main>

      {/* --- LIVE ORDER TRACKING MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-12 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-6xl h-[80vh] flex border-primary/20 bg-[#0a0a0a] overflow-hidden shadow-2xl">
            
            {/* Left: Manifest */}
            <div className="w-80 border-r border-white/5 p-8 flex flex-col shrink-0 text-left">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-primary leading-none">{selectedOrder.id}</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-white transition-colors">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Order Manifest</p>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                    <img src={item.image} className="w-12 h-12 rounded-lg object-cover bg-black" alt="" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-white truncate w-32">{item.name}</p>
                      <p className="text-[9px] text-primary font-bold mt-1 uppercase">Qty: {item.quantity} • ₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/5 mt-auto">
                 <div className="flex justify-between items-center mb-6">
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Status</span>
                   <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">{selectedOrder.status}</span>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="w-full bg-primary text-black py-4 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all">Close Monitor</button>
              </div>
            </div>

            {/* Right: Live Map Tracking */}
            <div className="flex-1 relative bg-white/[0.01]">
              <div className="absolute top-8 left-8 z-10">
                <p className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">Logistics Terminal</p>
              </div>
              
              <iframe 
                width="100%" height="100%" 
                src="http://googleusercontent.com/maps.google.com/7"
                className="grayscale invert opacity-30 contrast-125 pointer-events-none"
              ></iframe>

              {/* Animated Rider Marker */}
              <div className="absolute transition-all duration-[3000ms] ease-in-out"
                style={{ 
                  top: selectedOrder.status === 'Delivered' ? '20%' : '55%', 
                  left: selectedOrder.status === 'Delivered' ? '80%' : '25%' 
                }}
              >
                <div className="flex flex-col items-center">
                   <div className="text-4xl drop-shadow-[0_0_20px_#ff4d94] animate-bounce">
                    {['Out for Delivery', 'Delivered'].includes(selectedOrder.status) ? '🏍️' : '🏪'}
                   </div>
                   <div className="mt-4 bg-primary text-black text-[9px] font-black px-3 py-1 rounded-full uppercase shadow-2xl">
                     {selectedOrder.status === 'Packing' ? 'Preparing Items' : 'Rider Tracking'}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
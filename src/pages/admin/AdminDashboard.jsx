import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../lib/supabase';

// Fix for Leaflet marker icons in Admin Suite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Internal Map Recenter Logic
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 15); }, [center, map]);
  return null;
}

export default function AdminDashboard() {
  const location = useLocation();
  const [stats, setStats] = useState({ sales: 0, pending: 0, outOfStock: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOverview = location.pathname === '/admin' || location.pathname === '/admin/';

  const navItems = useMemo(() => [
    { path: '/admin', label: 'Overview', icon: '📊' },
    { path: '/admin/inventory', label: 'Products', icon: '📦' },
    { path: '/admin/categories', label: 'Categories', icon: '📂' },
    { path: '/admin/banners', label: 'Marketing Banners', icon: '🖼️' },
    { path: '/admin/orders', label: 'Orders History', icon: '🚚' },
    { path: '/admin/customers', label: 'Customers Data', icon: '👥' },
    { path: '/admin/settings', label: 'Store Settings', icon: '⚙️' },
  ], []);

  const loadAdminData = useCallback(async () => {
    try {
      const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      const { data: products } = await supabase.from('products').select('stock');

      if (orders) {
        const totalSales = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        const activeOrders = orders.filter(o => ['Live', 'Processing', 'Packing', 'Packed', 'Out for Delivery'].includes(o.status));
        
        setStats({ 
          sales: totalSales, 
          pending: activeOrders.length,
          outOfStock: products?.filter(p => Number(p.stock) === 0).length || 0
        });
        setRecentOrders(activeOrders); 
      }
    } catch (e) {
      console.error("Admin Load Error:", e.message); 
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) loadAdminData();
  };

  useEffect(() => {
    loadAdminData();
    const sub = supabase.channel('admin_sync').on('postgres_changes', { event: '*', table: 'orders' }, loadAdminData).subscribe();
    return () => supabase.removeChannel(sub);
  }, [loadAdminData]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505] text-white">
      
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 p-8 flex flex-col h-full bg-[#050505] shrink-0">
        <div className="mb-12">
          <h2 className="text-primary font-black text-3xl italic tracking-tighter">KILOGRAM</h2>
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Executive Suite</p>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${location.pathname === item.path ? 'bg-primary text-black font-black' : 'text-gray-500 hover:text-white'}`}>
              <span>{item.icon}</span>
              <span className="text-[11px] uppercase font-black tracking-widest">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Stream */}
      <main className="flex-1 flex flex-col p-12 bg-[radial-gradient(circle_at_top_right,_#ff4d9405,_transparent)]">
        {isOverview ? (
          <div className="flex flex-col h-full animate-in fade-in duration-700">
            <header className="flex justify-between items-end mb-10">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Overview</h1>
              <div className="text-[10px] font-black text-primary bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">LIVE CLOUD FEED</div>
            </header>

            <div className="grid grid-cols-3 gap-8 mb-10">
              {['Total Sales', 'Active Pipeline', 'Stock Alerts'].map((label, i) => (
                <div key={label} className="glass-card p-10 bg-white/[0.02] border-white/5">
                  <p className="text-gray-500 text-[11px] font-black uppercase mb-3">{label}</p>
                  <p className={`text-5xl font-black italic ${label === 'Stock Alerts' ? 'text-red-500' : label === 'Total Sales' ? 'text-primary' : 'text-white'}`}>
                    {label === 'Total Sales' ? `₹${stats.sales.toLocaleString()}` : label === 'Active Pipeline' ? stats.pending : stats.outOfStock}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex-1 glass-card border-white/5 overflow-hidden bg-white/[0.01] flex flex-col">
              <div className="overflow-y-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-[#0a0a0a] border-b border-white/5 text-[10px] font-black text-gray-500 uppercase">
                    <tr><th className="px-10 py-6">Reference ID</th><th className="px-10 py-6">Status</th><th className="px-10 py-6 text-right">Settlement</th></tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id} onClick={() => setSelectedOrder(order)} className="text-xs hover:bg-white/[0.03] group cursor-pointer border-b border-white/5">
                        <td className="px-10 py-5 font-black text-white italic group-hover:text-primary transition-colors uppercase">{order.id.slice(-8)}</td>
                        <td className="px-10 py-5" onClick={e => e.stopPropagation()}>
                          <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)} className="bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-primary uppercase">
                            {['Live', 'Packing', 'Packed', 'Out for Delivery', 'Delivered'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-10 py-5 text-right font-black italic text-primary text-lg">₹{order.total_amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : <Outlet />}
      </main>

      {/* MONITORING MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-12 bg-black/90 backdrop-blur-xl animate-in zoom-in duration-300">
          <div className="glass-card w-full max-w-6xl h-[80vh] flex border-primary/20 bg-[#0a0a0a] overflow-hidden shadow-2xl">
            {/* Sidebar Manifest */}
            <div className="w-80 border-r border-white/5 p-8 flex flex-col shrink-0">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic text-primary">#{selectedOrder.id.slice(-8)}</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-white">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                    <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-white uppercase truncate">{item.name}</p>
                      <p className="text-[9px] text-primary font-bold mt-1 uppercase">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Location Node</p>
                <p className="text-[11px] font-bold text-white italic">{selectedOrder.address}</p>
              </div>
            </div>

            {/* LEAFLET MAP TERMINAL */}
            <div className="flex-1 relative bg-black">
              <MapContainer center={[21.45, 80.20]} zoom={15} zoomControl={false} className="h-full w-full">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <Marker position={[21.45, 80.20]} />
                <MapRecenter center={[21.45, 80.20]} />
              </MapContainer>
              <div className="absolute top-8 left-8 z-[500] bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary italic">Live Satellite Link</div>
              <style dangerouslySetInnerHTML={{ __html: `.leaflet-tile-pane { filter: brightness(0.6) invert(1) contrast(3) hue-rotate(190deg) saturate(0.3); }` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Header from "../../components/customer/Header";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // View State: 'main', 'addresses', 'payments'
  const [view, setView] = useState('main');

  // Data States
  const [user, setUser] = useState({ name: "", phone: "", id: "" });
  const [addresses, setAddresses] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({ notifications: true, appSounds: true });

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    // Load Core Data
    const userData = JSON.parse(localStorage.getItem('kilogram_user') || '{}');
    const savedAddresses = JSON.parse(localStorage.getItem('kilogram_addresses') || '[]');
    const orders = JSON.parse(localStorage.getItem('kilogram_orders_history') || '[]');
    const savedSettings = JSON.parse(localStorage.getItem('kilogram_app_settings') || 'null');

    setUser(userData);
    setAddresses(savedAddresses);
    setPaymentHistory(orders); // Payment history derived from orders
    if (savedSettings) setSettings(savedSettings);
  }, []);

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('kilogram_app_settings', JSON.stringify(newSettings));
  };

  const deleteAddress = (index) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
    localStorage.setItem('kilogram_addresses', JSON.stringify(updated));
  };

  const handleLogout = () => {
    if(window.confirm("Terminate session?")) {
      localStorage.removeItem('kilogram_user');
      navigate('/login');
    }
  };

  // --- SUB-VIEW: ADDRESSES ---
  if (view === 'addresses') return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-10 px-6">
      <Header />
      <button onClick={() => setView('main')} className="mb-6 text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
        ← Back to Profile
      </button>
      <h2 className="text-2xl font-black italic uppercase mb-8">Saved Addresses</h2>
      <div className="space-y-4">
        {addresses.length > 0 ? addresses.map((addr, i) => (
          <div key={i} className="glass-card p-5 border-white/5 bg-white/5 flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-primary uppercase mb-2 tracking-widest">{addr.type || 'Location'}</p>
              <p className="text-xs font-bold text-gray-400 leading-relaxed">{addr.address}</p>
            </div>
            <button onClick={() => deleteAddress(i)} className="text-red-500/50 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        )) : (
          <div className="p-20 text-center opacity-20 italic text-xs uppercase font-black tracking-widest">No addresses saved</div>
        )}
      </div>
    </div>
  );

  // --- SUB-VIEW: PAYMENTS ---
  if (view === 'payments') return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-10 px-6">
      <Header />
      <button onClick={() => setView('main')} className="mb-6 text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
        ← Back to Profile
      </button>
      <h2 className="text-2xl font-black italic uppercase mb-8">Payment Ledger</h2>
      <div className="space-y-3">
        {paymentHistory.length > 0 ? paymentHistory.map((pay, i) => (
          <div key={i} className="glass-card p-5 border-white/5 bg-white/2 flex justify-between items-center group">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{pay.date}</p>
              <p className="text-xs font-bold uppercase tracking-tighter text-white">Ref: #{pay.id?.toString().slice(-6)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-primary italic">₹{pay.total}</p>
              <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest mt-1">Settled</p>
            </div>
          </div>
        )) : (
          <div className="p-20 text-center opacity-20 italic text-xs uppercase font-black tracking-widest">No transactions found</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-44 selection:bg-primary/30">
      <Header />
      
      <div className="px-6 max-w-lg mx-auto animate-in fade-in duration-500">
        
        {/* --- SECTION 1: IDENTITY --- */}
        <div className="glass-card p-6 border-white/5 bg-white/2 mb-8 relative">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl border border-primary/20 font-black italic text-primary">
              {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{user.name || "User"}</h1>
              <p className="text-primary font-bold text-xs tracking-widest mt-1">+91 {user.phone}</p>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: FUNCTIONAL TABS --- */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <button onClick={() => setView('addresses')} className="glass-card p-6 bg-white/5 border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all group">
                <span className="text-2xl group-hover:scale-110 transition-transform">📍</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Addresses</span>
            </button>
            <button onClick={() => setView('payments')} className="glass-card p-6 bg-white/5 border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all group">
                <span className="text-2xl group-hover:scale-110 transition-transform">💳</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Payments</span>
            </button>
        </div>


        {/* --- SECTION 3: APP PREFERENCES --- */}
        <section className="mb-8">
          <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 px-1">Control Center</h2>
          <div className="glass-card bg-white/5 border-white/5 divide-y divide-white/5 overflow-hidden">
            
            {/* Notification Toggle */}
            <div className="p-5 flex items-center justify-between hover:bg-white/2 transition-colors">
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Push Notifications</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase mt-1 italic">Alerts for order status</p>
              </div>
              <button 
                onClick={() => toggleSetting('notifications')}
                className={`w-11 h-6 rounded-full relative transition-all duration-300 ${settings.notifications ? 'bg-primary' : 'bg-gray-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.notifications ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            {/* Sounds Toggle */}
            <div className="p-5 flex items-center justify-between hover:bg-white/2 transition-colors">
              <div>
                <p className="text-xs font-black uppercase tracking-widest">In-App Sounds</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase mt-1 italic">Feedback sounds on clicks</p>
              </div>
              <button 
                onClick={() => toggleSetting('appSounds')}
                className={`w-11 h-6 rounded-full relative transition-all duration-300 ${settings.appSounds ? 'bg-primary' : 'bg-gray-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.appSounds ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            {/* Dark Mode - Locked */}
            <div className="p-5 flex items-center justify-between opacity-60">
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Visual Theme</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase mt-1 italic">Amoled dark mode</p>
              </div>
              <span className="text-[9px] font-black text-primary uppercase border border-primary/20 px-2 py-1 rounded">Locked</span>
            </div>
          </div>
        </section>

        {/* --- SECTION 4: DANGER ZONE --- */}
        <div className="space-y-4 pt-4">
          <button className="w-full py-4 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
            Terms & Privacy Policy
          </button>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500/5 border border-red-500/20 text-red-500 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl shadow-red-500/5"
          >
            Terminate Session
          </button>
        </div>
      </div>

      {/* --- BOTTOM NAVIGATION --- */}
      <div className="fixed bottom-6 left-6 right-6 h-20 glass-card border-white/10 bg-black/60 backdrop-blur-xl flex justify-around items-center px-4 z-50 shadow-2xl">
        <Link to="/home" className={`flex flex-col items-center gap-1 transition-all ${isActive('/home') ? 'text-primary scale-110' : 'text-gray-500'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
           <span className="text-[9px] font-black uppercase tracking-tighter">Store</span>
        </Link>
        <Link to="/all-products" className={`flex flex-col items-center gap-1 transition-all ${isActive('/all-products') ? 'text-primary scale-110' : 'text-gray-500'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
           <span className="text-[9px] font-black uppercase tracking-tighter">Inventory</span>
        </Link>
        <Link to="/orders" className={`flex flex-col items-center gap-1 transition-all ${isActive('/orders') ? 'text-primary scale-110' : 'text-gray-500'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
           <span className="text-[9px] font-black uppercase tracking-tighter">Activity</span>
        </Link>
        
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Header from "../../components/customer/Header";
import BottomNav from "../../components/customer/BottomNav";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [view, setView] = useState('main');

  // Unified Cloud State
  const [user, setUser] = useState({ full_name: "", phone: "", id: "" });
  const [addresses, setAddresses] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ notifications: true, appSounds: true });

  const isActive = (path) => location.pathname === path;

  /**
   * 1. Automatic Identity Retrieval
   * Fetches the authenticated user from Supabase and syncs the profile record.
   */
  const loadProfileSuite = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get the current active session
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        return navigate('/login');
      }

      // Parallel Data Fetching for zero-latency UI
      const [profileRes, addrRes, orderRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
        supabase.from('addresses').select('*').eq('user_id', authUser.id).order('is_primary', { ascending: false }),
        supabase.from('orders').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false })
      ]);

      // Automatically populate identity fields
      if (profileRes.data) {
        setUser(profileRes.data);
        setEditName(profileRes.data.full_name); // Pre-fill edit state
      } else {
        // Fallback for metadata if profile row isn't fully initialized
        setUser({
          full_name: authUser.user_metadata?.full_name || "Protocol User",
          phone: authUser.user_metadata?.phone || "",
          id: authUser.id
        });
        setEditName(authUser.user_metadata?.full_name || "");
      }

      if (addrRes.data) setAddresses(addrRes.data);
      if (orderRes.data) setPaymentHistory(orderRes.data);

      const savedSettings = JSON.parse(localStorage.getItem('kilogram_app_settings'));
      if (savedSettings) setSettings(savedSettings);

    } catch (err) {
      console.error("Profile Handshake Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfileSuite();
  }, [loadProfileSuite]);

  // 2. Identity Update Protocol
  const updateIdentity = async () => {
    if (editName.trim().length < 3) return alert("Label must be > 2 characters");
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editName })
        .eq('id', user.id);

      if (error) throw error;
      
      // Update local state instantly
      setUser(prev => ({ ...prev, full_name: editName }));
      setIsEditing(false);
    } catch (err) {
      alert("Identity Sync Failed");
    }
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('kilogram_app_settings', JSON.stringify(newSettings));
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Delete this delivery node?")) return;
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert("Removal failed.");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Terminate cloud session?")) {
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" />
    </div>
  );

  // --- SUB-VIEW: ADDRESSES ---
  if (view === 'addresses') return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-12 pb-10 px-6">
      
      <button onClick={() => setView('main')} className="mb-6 text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
        ← Back to Profile
      </button>
      <h2 className="text-2xl font-black italic uppercase mb-8">Saved Addresses</h2>
      <div className="space-y-4">
        {addresses.length > 0 ? addresses.map((addr) => (
          <div key={addr.id} className="glass-card p-5 border-white/5 bg-white/5 flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-primary uppercase mb-2 tracking-widest">{addr.type || 'Location'}</p>
              <p className="text-xs font-bold text-gray-400 leading-relaxed italic">{addr.address}</p>
            </div>
            <button onClick={() => deleteAddress(addr.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ) ) : (
          <div className="p-20 text-center opacity-20 italic text-xs uppercase font-black tracking-widest">No addresses saved</div>
        )}
      </div>
    </div>
  );

  // --- SUB-VIEW: PAYMENTS ---
  if (view === 'payments') return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-12 pb-10 px-6">
      
      <button onClick={() => setView('main')} className="mb-6 text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
        ← Back to Profile
      </button>
      <h2 className="text-2xl font-black italic uppercase mb-8">Payment History</h2>
      <div className="space-y-3">
        {paymentHistory.length > 0 ? paymentHistory.map((pay) => (
          <div key={pay.id} className="glass-card p-5 border-white/5 bg-white/2 flex justify-between items-center group">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{new Date(pay.created_at).toLocaleDateString()}</p>
              <p className="text-xs font-bold uppercase tracking-tighter text-white">Ref: #{pay.id?.toString().slice(-6)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-primary italic">₹{pay.total_amount}</p>
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
        
        {/* --- SECTION 1: IDENTITY SUITE --- */}
        <div className="glass-card p-6 border-white/5 bg-white/2 mb-8 relative">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl border border-primary/20 font-black italic text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : '👤'}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-black uppercase tracking-widest outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <button onClick={updateIdentity} className="text-[9px] font-black text-primary uppercase">Save</button>
                    <button onClick={() => setIsEditing(false)} className="text-[9px] font-black text-gray-500 uppercase">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-1xl font-black  uppercase tracking-tighter leading-none">{user.full_name || "Protocol User"}</h1>
                    <p className="text-primary font-bold text-xs tracking-widest mt-1">+91 {user.phone}</p>
                  </div>
                  <button onClick={() => setIsEditing(true)} className="text-[10px] font-black text-gray-500 uppercase border-b border-gray-800">Edit</button>
                </div>
              )}
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
            Log Out
          </button>
        </div>
      </div>

     
      <BottomNav />
    </div>
  );
}
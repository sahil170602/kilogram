import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * Login Component
 * Handles multi-stage identity and coordinate synchronization.
 */
export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Auth, 2: Location Sync

  // Phase 1: Establish Cloud Identity Handshake
  const handleAuth = async () => {
    if (phone.length === 10 && name.trim().length > 2) {
      setLoading(true);
      try {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously({
          options: {
            data: { full_name: name, phone: phone }
          }
        });

        if (authError) throw authError;

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: authData.user.id, 
            full_name: name, 
            phone: phone, 
            joined_date: new Date().toISOString() 
          }, { onConflict: 'phone' });

        if (profileError) throw profileError;

        setStep(2); // Progress to Location Detection
      } catch (error) {
        console.error("Auth Error:", error.message);
        alert("Sync Error: " + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Verification failed: Valid name and 10-digit mobile required.");
    }
  };

  // Phase 2: Establish Logistics Coordinates
  const detectLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        
        // Formulate a clean, readable address node
        const readable = data.display_name.split(',').slice(0, 2).join(',');

        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { error } = await supabase.from('addresses').upsert({
            user_id: user.id,
            address: readable,
            lat: latitude,
            lng: longitude,
            is_primary: true,
            type: 'Current'
          });
          if (error) throw error;
        }

        navigate('/home');
      } catch (err) {
        console.error("Location Error:", err.message);
        alert("Location sync failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }, () => {
      alert("Please enable location permissions to continue.");
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col px-6 pt-20 selection:bg-primary/30">
      
      {/* Dynamic Branding Header */}
      <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight">Welcome to</h2>
        <h2 className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-none drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]">
          Kilogram
        </h2>
        <p className="text-gray-500 text-[10px] mt-5 font-black uppercase tracking-[0.4em] border-l-2 border-primary/30 pl-3 animate-pulse">
          {step === 1 ? 'Initializing v1.0' : 'Establishing Coordinates'}
        </p>
      </div>

      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {step === 1 ? (
          <>
            {/* Name Module */}
            <div className="glass-card p-1 pl-4 flex items-center bg-white/[0.03] border-white/5 focus-within:border-primary/40 transition-all duration-300">
              <input 
                type="text" 
                value={name}
                disabled={loading}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Your Full Name" 
                className="flex-1 bg-transparent p-4 outline-none text-sm font-black uppercase placeholder:text-gray-700 tracking-widest"
              />
            </div>

            {/* Contact Module */}
            <div className="glass-card p-1 pl-4 flex items-center bg-white/[0.03] border-white/5 focus-within:border-primary/40 transition-all duration-300">
              <span className="text-primary font-black text-sm tracking-tighter pr-3 border-r border-white/10">+91</span>
              <input 
                type="tel" 
                maxLength="10"
                value={phone}
                disabled={loading}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter Your Mobile Number" 
                className="flex-1 bg-transparent p-4 outline-none text-sm font-black placeholder:text-gray-700 tracking-widest"
              />
            </div>

            {/* Access Trigger */}
            <div className="pt-4 flex justify-center">
              <button 
                onClick={handleAuth}
                disabled={loading || phone.length < 10 || name.length < 3}
                className="w-fit mx-auto bg-primary text-black px-10 py-3 rounded-full font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_10px_25px_rgba(var(--primary-rgb),0.3)] active:scale-90 transition-all disabled:opacity-20 flex items-center gap-3"
              >
                {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Login"}
              </button>
            </div>
          </>
        ) : (
          /* Location Sync Phase */
          <div className="flex flex-col items-center justify-center space-y-10 py-10 animate-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse"></div>
              <div className="relative w-24 h-24 bg-primary/10 rounded-[2.5rem] border border-primary/30 flex items-center justify-center text-4xl shadow-2xl">
                📍
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Sync Coordinates</h3>
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] leading-relaxed">
                Precision logistics requires your <br/> active coordinate stream.
              </p>
            </div>

            <button 
              onClick={detectLocation}
              disabled={loading}
              className="w-full bg-primary text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all flex justify-center items-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                "Detect Current Location"
              )}
            </button>

            <button 
              onClick={() => navigate('/home')}
              className="text-gray-600 font-black text-[9px] uppercase tracking-[0.4em] hover:text-white transition-colors"
            >
              Skip and Enter Store
            </button>
          </div>
        )}

        {/* Identity Check Branding (Only in Step 1) */}
        {step === 1 && (
          <div className="relative py-8 flex items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-6 text-gray-700 text-[9px] font-black uppercase tracking-[0.3em]">Identity Check</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>
        )}
      </div>

      <footer className="mt-auto mb-12 text-center">
        <p className="text-gray-700 text-[8px] px-12 leading-relaxed uppercase font-black tracking-[0.2em]">
          Secure handshake active • <span className="text-primary/40">Kilogram Cloud Node</span>
        </p>
      </footer>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * StoreSettings Component
 * Admin terminal to set the GPS origin for the Kilogram logistics network.
 * Persists data to Supabase 'settings' table.
 */
export default function StoreSettings() {
  const [storeLocation, setStoreLocation] = useState({ lat: '', lng: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(true);

  // 1. Load Settings from Supabase on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'store_location')
          .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
        if (data) setStoreLocation(data.value);
      } catch (err) {
        console.error("Settings Fetch Error:", err.message);
      } finally {
        setSyncing(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. Browser Geolocation Logic
  const getCurrentLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Reverse Geocoding using OpenStreetMap
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const readableAddress = data.display_name.split(',').slice(0, 3).join(',');

        const newLoc = { 
          lat: latitude.toFixed(4), 
          lng: longitude.toFixed(4), 
          address: readableAddress 
        };
        
        setStoreLocation(newLoc);
        alert("GPS Coordinates Captured locally. Click 'Confirm' to sync to cloud.");
      } catch (err) {
        setStoreLocation(prev => ({ ...prev, lat: latitude.toFixed(4), lng: longitude.toFixed(4) }));
      } finally {
        setLoading(false);
      }
    }, () => {
      alert("Location permission denied.");
      setLoading(false);
    });
  };

  // 3. Save/Upsert to Supabase
  const saveStoreLocation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'store_location', 
          value: storeLocation,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;
      alert("Logistics Origin Synchronized with Supabase Cloud!");
    } catch (err) {
      alert("Cloud Sync Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (syncing) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 h-full pb-20">
      <header className="mb-10 space-y-2">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none text-white">
          Logistics <span className="text-primary">Origin</span>
        </h1>
        <p className="text-gray-500 text-sm font-bold italic underline decoration-primary/30">
          Set the central dispatch center for rider tracking.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Suite */}
        <form onSubmit={saveStoreLocation} className="glass-card p-10 bg-white/[0.02] border-white/5 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-10 -mt-10" />

          <button 
            type="button"
            onClick={getCurrentLocation}
            className="w-full bg-primary/10 border border-primary/30 text-primary py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary hover:text-black transition-all active:scale-95"
          >
            {loading ? "Establishing Satellite Link..." : "🎯 Capture Store Position"}
          </button>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-primary text-xs">📍</div>
              <input 
                type="text" 
                value={storeLocation.address}
                onChange={(e) => setStoreLocation({...storeLocation, address: e.target.value})}
                className="w-full bg-black border border-white/10 p-5 pl-14 rounded-2xl text-xs font-bold text-white outline-none focus:border-primary transition-all placeholder:text-gray-700"
                placeholder="Store Street Address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase ml-2">Latitude</label>
                <input 
                  type="text" value={storeLocation.lat}
                  onChange={(e) => setStoreLocation({...storeLocation, lat: e.target.value})}
                  className="w-full bg-black border border-white/10 p-5 rounded-2xl text-xs font-bold text-primary outline-none" placeholder="0.0000"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase ml-2">Longitude</label>
                <input 
                  type="text" value={storeLocation.lng}
                  onChange={(e) => setStoreLocation({...storeLocation, lng: e.target.value})}
                  className="w-full bg-black border border-white/10 p-5 rounded-2xl text-xs font-bold text-primary outline-none" placeholder="0.0000"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-black py-6 rounded-[2rem] font-black uppercase text-[12px] tracking-widest shadow-2xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Synchronizing..." : "Confirm Dispatch Center"}
          </button>
        </form>

        {/* Visual Map Preview */}
        <div className="glass-card h-[500px] bg-[#050505] overflow-hidden border-white/5 relative group shadow-2xl">
           <iframe 
             width="100%" height="100%" 
             src={`https://maps.google.com/maps?q=${storeLocation.lat},${storeLocation.lng}&z=15&output=embed`}
             className="grayscale invert opacity-30 contrast-125 transition-opacity group-hover:opacity-50"
           ></iframe>
           
           {/* Visual Marker Overlay */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="text-5xl drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)] relative z-10">🏪</div>
              </div>
           </div>

           <div className="absolute bottom-6 left-6 right-6 p-4 glass-card bg-black/80 border-primary/20">
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Terminal Origin</p>
              <p className="text-[10px] text-white font-bold truncate uppercase">{storeLocation.address || 'Waiting for coordinates...'}</p>
           </div>
        </div>
      </div>
    </div>
  );
}
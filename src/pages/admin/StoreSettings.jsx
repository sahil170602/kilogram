import React, { useState, useEffect } from 'react';

export default function StoreSettings() {
  const [storeLocation, setStoreLocation] = useState({ lat: '', lng: '', address: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('kilogram_store_location') || 'null');
    if (saved) setStoreLocation(saved);
  }, []);

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
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const readableAddress = data.display_name.split(',').slice(0, 3).join(',');

        const newLoc = { lat: latitude.toFixed(4), lng: longitude.toFixed(4), address: readableAddress };
        setStoreLocation(newLoc);
        localStorage.setItem('kilogram_store_location', JSON.stringify(newLoc));
        alert("Store Origin Set to Current Location!");
      } catch (err) {
        setStoreLocation(prev => ({ ...prev, lat: latitude, lng: longitude }));
      }
      setLoading(false);
    }, () => {
      alert("Permission denied.");
      setLoading(false);
    });
  };

  const saveStoreLocation = (e) => {
    e.preventDefault();
    localStorage.setItem('kilogram_store_location', JSON.stringify(storeLocation));
    alert("Logistics Settings Saved!");
  };

  return (
    <div className="animate-in fade-in duration-500 h-full">
      <header className="mb-10">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Logistics Origin</h1>
        <p className="text-gray-500 text-sm font-bold italic mt-3">Set the dispatch center for rider tracking.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={saveStoreLocation} className="glass-card p-10 bg-white/[0.02] border-white/5 space-y-6">
          <button 
            type="button"
            onClick={getCurrentLocation}
            className="w-full bg-primary/10 border border-primary/30 text-primary py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-black transition-all"
          >
            {loading ? "Detecting..." : "🎯 Use Current Store Location"}
          </button>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">📍</div>
            <input 
              type="text" 
              value={storeLocation.address}
              onChange={(e) => setStoreLocation({...storeLocation, address: e.target.value})}
              className="w-full bg-black border border-white/10 p-4 pl-12 rounded-xl text-xs font-bold text-white outline-none focus:border-primary"
              placeholder="Store Street Address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" value={storeLocation.lat}
              onChange={(e) => setStoreLocation({...storeLocation, lat: e.target.value})}
              className="bg-black border border-white/10 p-4 rounded-xl text-xs font-bold text-primary" placeholder="Latitude"
            />
            <input 
              type="text" value={storeLocation.lng}
              onChange={(e) => setStoreLocation({...storeLocation, lng: e.target.value})}
              className="bg-black border border-white/10 p-4 rounded-xl text-xs font-bold text-primary" placeholder="Longitude"
            />
          </div>

          <button type="submit" className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
            Confirm Dispatch Center
          </button>
        </form>

        <div className="glass-card h-[400px] bg-[#111] overflow-hidden border-white/5 relative">
           <iframe width="100%" height="100%" src="http://googleusercontent.com/maps.google.com/6" className="grayscale invert opacity-40"></iframe>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl drop-shadow-[0_0_10px_#ff4d94]">🏪</div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [initial, setInitial] = useState('?');
  const [address, setAddress] = useState('Set Location');
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  useEffect(() => {
    // 1. Load User Identity
    const userData = JSON.parse(localStorage.getItem('kilogram_user') || '{}');
    const name = userData.name || userData.phone || 'User';
    setInitial(name.charAt(0).toUpperCase());

    // 2. Check for saved address
    const savedAddresses = JSON.parse(localStorage.getItem('kilogram_addresses') || '[]');
    if (savedAddresses.length > 0) {
      setAddress(savedAddresses[0].address); // Show the primary address
    } else if (userData.isLoggedIn) {
      // Show popup if logged in but no address saved
      setShowLocationPopup(true);
    }
  }, []);

  const getGeoLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        // Reverse Geocoding using OpenStreetMap (Free)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const readableAddress = data.display_name.split(',').slice(0, 2).join(',');

        // Update State
        setAddress(readableAddress);
        setShowLocationPopup(false);

        // Save to Profile Addresses
        const newAddress = {
          type: 'Current Location',
          address: readableAddress,
          lat: latitude,
          lng: longitude,
          isPrimary: true
        };
        
        const existingAddresses = JSON.parse(localStorage.getItem('kilogram_addresses') || '[]');
        localStorage.setItem('kilogram_addresses', JSON.stringify([newAddress, ...existingAddresses]));
        
        // Sync with Profile Page
        window.dispatchEvent(new Event('storage'));
        
      } catch (error) {
        console.error("Location Fetch Error:", error);
        setAddress("Location Error");
      }
    }, () => {
      alert("Please enable location permissions");
    });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 z-[100] flex items-center justify-between px-6">
        <div className="flex flex-col">
          <Link to="/home" className="flex items-center gap-2">
            <h1 className="text-xl font-black italic tracking-tighter leading-none">
              KILO<span className="text-primary">GRAM</span>
            </h1>
          </Link>
          
          {/* Address Display below Logo */}
          <button 
            onClick={() => setShowLocationPopup(true)}
            className="flex items-center gap-1 mt-1 group"
          >
            <span className="text-primary text-[10px]">📍</span>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest truncate max-w-[150px] group-hover:text-white transition-colors">
              {address}
            </p>
            <span className="text-[8px] text-primary/50 group-hover:text-primary transition-colors">▼</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/profile" 
            className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-sm hover:bg-primary hover:text-black transition-all active:scale-90 shadow-lg shadow-primary/5"
          >
            {initial}
          </Link>
        </div>
      </header>

      {/* --- LOCATION PERMISSION POPUP --- */}
      {showLocationPopup && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-sm p-8 border-primary/20 bg-[#0d0d0d] shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto border border-primary/20">📍</div>
            <h3 className="text-xl font-black italic uppercase text-center mb-2 tracking-tighter">Enable Location</h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase text-center tracking-widest mb-8 leading-relaxed">
              Kilogram needs your location to provide <br/> lightning fast deliveries.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={getGeoLocation}
                className="w-full bg-primary text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                Use Current Location
              </button>
              <button 
                onClick={() => setShowLocationPopup(false)}
                className="w-full py-4 text-gray-600 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
              >
                Enter Manually
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const handleContinue = () => {
    if (phone.length === 10 && name.trim().length > 2) {
      // 1. Fetch existing users database
      const existingUsers = JSON.parse(localStorage.getItem('kilogram_users') || '[]');
      
      // 2. Check if user already exists by phone number
      const userIndex = existingUsers.findIndex(u => u.phone === phone);
      let userData;

      if (userIndex === -1) {
        // NEW USER: Create incremental ID starting from 1
        userData = {
          id: existingUsers.length + 1, // Simple count-based ID
          name: name,
          phone: phone,
          joinedDate: new Date().toLocaleDateString('en-IN'),
          totalOrders: 0
        };
        const updatedUsers = [...existingUsers, userData];
        localStorage.setItem('kilogram_users', JSON.stringify(updatedUsers));
      } else {
        // RETURNING USER: Retrieve their existing record
        userData = existingUsers[userIndex];
      }

      // 3. Set Current Session with the cleaned ID
      localStorage.setItem('kilogram_user', JSON.stringify({ 
        ...userData,
        isLoggedIn: true,
        loginTime: new Date().toISOString() 
      }));

      // Notify other tabs (like Admin Dashboard) of the new user
      window.dispatchEvent(new Event('storage'));
      navigate('/home');
    } else {
      alert("Please enter your name and a valid 10-digit mobile number");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col px-6 pt-20">
      <div className="mb-12">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight">Welcome to</h2>
        <h2 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none">Kilogram</h2>
        <p className="text-gray-500 text-sm mt-3 font-bold italic">Log in to stock up your essentials.</p>
      </div>

      <div className="space-y-4">
        {/* Name Input */}
        <div className="glass-card p-1 pl-4 flex items-center bg-white/5 border-white/10 focus-within:border-primary/50 transition-colors">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Full Name" 
            className="flex-1 bg-transparent p-4 outline-none text-sm font-black uppercase placeholder:text-gray-600 tracking-widest"
          />
        </div>

        {/* Mobile Number Input */}
        <div className="glass-card p-1 pl-4 flex items-center bg-white/5 border-white/10 focus-within:border-primary/50 transition-colors">
          <span className="text-gray-400 font-black text-sm tracking-tighter">+91</span>
          <input 
            type="tel" 
            maxLength="10"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="Mobile Number" 
            className="flex-1 bg-transparent p-4 outline-none text-sm font-black placeholder:text-gray-600 tracking-widest"
          />
        </div>

        <button 
          onClick={handleContinue}
          className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-30"
          disabled={phone.length < 10 || name.length < 3}
        >
          Access Store
        </button>

        <div className="relative py-6 flex items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-gray-600 text-[10px] font-black uppercase tracking-widest">Secure Login</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* Social Options */}
        <div className="space-y-3">
          <button className="w-full glass-card p-4 flex items-center justify-center gap-3 bg-white/5 border-white/10 active:scale-[0.98] transition-all hover:bg-white/10">
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-4 h-4" alt="Google" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sync with Google</span>
          </button>
          
          <button className="w-full glass-card p-4 flex items-center justify-center gap-3 bg-white/5 border-white/10 active:scale-[0.98] transition-all hover:bg-white/10">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-4 h-4 invert" alt="Apple" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sync with Apple</span>
          </button>
        </div>
      </div>

      <p className="mt-auto mb-10 text-center text-gray-600 text-[9px] px-10 leading-relaxed uppercase font-black tracking-tighter">
        Data encrypted with Kilogram <span className="text-primary/50">v2.0 Protocol</span>.
      </p>
    </div>
  );
}
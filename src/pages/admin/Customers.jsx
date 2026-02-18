import React, { useState, useEffect } from 'react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  const loadCustomers = () => {
    try {
      // 1. Load registered users
      const users = JSON.parse(localStorage.getItem('kilogram_users') || '[]');
      
      // 2. Load orders to calculate 'Total Orders' per user
      const orders = JSON.parse(localStorage.getItem('kilogram_orders_history') || '[]');
      
      const usersWithStats = users.map(user => ({
        ...user,
        orderCount: orders.filter(o => o.phone === user.phone).length
      }));

      setCustomers(usersWithStats);
    } catch (error) {
      console.error("Error loading customer data:", error);
    }
  };

  useEffect(() => {
    loadCustomers();
    window.addEventListener('storage', loadCustomers);
    return () => window.removeEventListener('storage', loadCustomers);
  }, []);

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header Section */}
      <header className="mb-8 shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-none">Registered Users</h1>
          <p className="text-gray-500 text-[10px] font-black italic mt-3 uppercase tracking-[0.3em]">Customer Database Management</p>
        </div>
        
        <div className="glass-card px-6 py-3 border-primary/20 bg-primary/5 flex flex-col items-end">
           <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Base</p>
           <p className="text-2xl font-black text-primary italic leading-none">{customers.length.toString().padStart(2, '0')}</p>
        </div>
      </header>

      {/* Main Table Container */}
      <div className="flex-1 glass-card border-white/5 overflow-hidden bg-white/[0.01] flex flex-col shadow-2xl">
        <div className="overflow-y-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#0a0a0a] border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] z-10">
              <tr>
                <th className="px-10 py-6 w-24">ID</th>
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Contact No.</th>
                <th className="px-8 py-6 text-center">Joined Date</th>
                <th className="px-8 py-6 text-center">Orders</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.length > 0 ? (
                customers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group cursor-default">
                    
                    {/* Clean Incremental ID */}
                    <td className="px-10 py-5">
  <span className="text-[11px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 italic">
    {/* If user.id is just a number, it will show as #01, #02, etc. */}
    #{typeof user.id === 'number' ? user.id.toString().padStart(2, '0') : '01'}
  </span>
</td>

                    {/* Identity - Removed ID from bottom */}
                    <td className="px-8 py-5 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center font-black text-white italic border border-white/10 group-hover:border-primary/40 group-hover:text-primary transition-all duration-300">
                        {user.name?.charAt(0)}
                      </div>
                      <p className="font-black text-white uppercase text-xs tracking-widest leading-none group-hover:translate-x-1 transition-transform">
                        {user.name}
                      </p>
                    </td>

                    <td className="px-8 py-5 font-bold text-gray-400 text-xs tracking-widest group-hover:text-gray-200 transition-colors">
                      +91 {user.phone}
                    </td>
                    
                    <td className="px-8 py-5 text-center text-[10px] text-gray-500 font-black uppercase tracking-widest">
                      {user.joinedDate}
                    </td>

                    <td className="px-8 py-5 text-center">
                      <span className="text-white font-black italic text-sm bg-white/5 px-4 py-1.5 rounded-xl border border-white/10 group-hover:border-primary/20 group-hover:text-primary transition-all">
                        {user.orderCount || 0}
                      </span>
                    </td>

                    <td className="px-10 py-5 text-right">
                      <button className="text-[10px] font-black text-primary border border-primary/20 px-6 py-3 rounded-2xl uppercase hover:bg-primary hover:text-black transition-all active:scale-90 shadow-lg shadow-primary/5">
                        Ledger
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <span className="text-5xl">👥</span>
                      <p className="text-gray-400 font-black uppercase italic tracking-[0.5em] text-xs">
                        Registry Empty
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
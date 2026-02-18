import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // Default

  const loadData = () => {
    // 1. Load Cart
    const savedCart = JSON.parse(localStorage.getItem('kilogram_cart') || '[]');
    setCartItems(savedCart);

    // 2. Load Primary Address
    const savedAddresses = JSON.parse(localStorage.getItem('kilogram_addresses') || '[]');
    if (savedAddresses.length > 0) {
      setSelectedAddress(savedAddresses.find(a => a.isPrimary) || savedAddresses[0]);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const updateQty = (id, delta) => {
    const updated = cartItems.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(0, item.quantity + delta) };
      return item;
    }).filter(item => item.quantity > 0);

    setCartItems(updated);
    localStorage.setItem('kilogram_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 1 ? 0 : 25;
  const handlingFee = subtotal > 1 ? 0 : 25;
  const total = subtotal + deliveryFee + handlingFee;

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      alert("Please set a delivery address first!");
      return;
    }

    // 1. Create Order Object
    const newOrder = {
      id: `ORD-${Date.now()}`,
      items: cartItems,
      total: total,
      address: selectedAddress.address,
      payment: paymentMethod,
      date: new Date().toLocaleDateString('en-IN'),
      status: 'Processing'
    };

    // 2. Save to History
    const history = JSON.parse(localStorage.getItem('kilogram_orders_history') || '[]');
    localStorage.setItem('kilogram_orders_history', JSON.stringify([newOrder, ...history]));

    // 3. Clear Cart
    localStorage.removeItem('kilogram_cart');
    window.dispatchEvent(new Event('storage'));

    navigate('/order-success');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-10 pb-44 selection:bg-primary/30">
      
      <div className="px-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-primary border border-white/5 transition-all active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Review Order</h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* --- SECTION 1: DELIVERY ADDRESS --- */}
            <div className="glass-card p-5 border-white/5 bg-white/[0.02]">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Delivering To</h4>
                <Link to="/profile" className="text-[9px] font-black text-primary uppercase border-b border-primary/20">Change</Link>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl border border-primary/20">📍</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase tracking-tight truncate">
                    {selectedAddress ? selectedAddress.type : 'No Address Set'}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold truncate mt-0.5">
                    {selectedAddress ? selectedAddress.address : 'Please update your profile address'}
                  </p>
                </div>
              </div>
            </div>

            {/* --- SECTION 2: CART ITEMS --- */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-1">Your Items</h4>
              {cartItems.map(item => (
                <div key={item.id} className="glass-card p-3 flex gap-4 border-white/5 bg-white/[0.01] items-center">
                  <img src={item.image} className="w-16 h-16 rounded-lg object-cover bg-black/40 border border-white/5" alt="" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-xs uppercase tracking-tight truncate">{item.name}</h3>
                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-1 italic">₹{item.price} per unit</p>
                  </div>
                  <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
                    <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 font-black hover:text-primary transition-colors text-sm">-</button>
                    <span className="px-3 text-xs font-black italic">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 font-black text-primary transition-colors text-sm">+</button>
                  </div>
                </div>
              ))}
            </div>

           {/* --- SECTION 3: PAYMENT METHOD --- */}
<div className="glass-card p-5 border-white/5 bg-white/[0.02]">
  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-1">
    Select Payment Method
  </h4>
  <div className="grid grid-cols-2 gap-3">
    {['UPI', 'COD'].map((method) => {
      const isSelected = paymentMethod === method;
      return (
        <button
          key={method}
          type="button"
          onClick={() => setPaymentMethod(method)} // Directly updates the state
          className={`relative p-2 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group overflow-hidden ${
            isSelected
              ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]'
              : 'border-white/5 bg-white/5 opacity-80 hover:opacity-100 hover:border-white/20'
          }`}
        >
          {/* Active Indicator Glow */}
          {isSelected && (
            <div className="absolute top-0 right-0 w-8 h-8 bg-primary/20 blur-xl -mr-4 -mt-4 animate-pulse"></div>
          )}

          <span className={`text-2xl transition-transform duration-300 ${isSelected ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`}>
            {method === 'UPI' ? '⚡' : '💵'}
          </span>
          
          <div className="text-center">
            <span className={`text-[10px] font-black uppercase tracking-widest block ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
              {method === 'UPI' ? 'Instant UPI' : 'Cash on Delivery'}
            </span>
            {isSelected && (
              <span className="text-[7px] font-black text-primary/60 uppercase tracking-tighter animate-in fade-in slide-in-from-top-1">
                
              </span>
            )}
          </div>
        </button>
      );
    })}
  </div>
</div>

            {/* --- SECTION 4: BILL SUMMARY --- */}
            <div className="glass-card p-6 border-white/5 bg-white/[0.03] space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Order Summary</h4>
              <div className="space-y-2 text-[11px] font-bold uppercase tracking-wider">
                <div className="flex justify-between">
                  <span className="text-gray-500">Item Total</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-500 italic' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Handling Fee</span>
                  <span className={handlingFee === 0 ? 'text-green-500 italic' : ''}>
                  {handlingFee === 0 ? 'FREE' : `₹${handlingFee}`}
                  </span>
                </div>
                <div className="h-px bg-white/10 my-4"></div>
                <div className="flex justify-between items-center">
                  <span className="font-black text-sm text-white">To Pay</span>
                  <span className="text-2xl font-black text-primary italic">₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl">
              <span className="text-4xl opacity-40">🛒</span>
            </div>
            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] mb-8 italic">Your basket is waiting</p>
            <Link to="/home" className="inline-block bg-primary text-black px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95">
              Browse Store
            </Link>
          </div>
        )}
      </div>

      {/* --- FLOATING CHECKOUT BAR --- */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 glass-card flex border-t border-white/5 z-[110] flex gap-4 items-center max-w-lg h-23 mx-auto">
          <div className="flex-1">
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Total Payable</p>
            <p className="text-xl font-black text-white italic leading-none mt-1">₹{total}</p>
          </div>
          <button 
            onClick={handlePlaceOrder}
            className="flex-[2] bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/40 active:scale-95 transition-all"
          >
            Pay & Place Order →
          </button>
        </div>
      )}
    </div>
  );
}
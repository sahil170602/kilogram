import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * Cart Component
 * Handles order review, pricing calculation, and cloud synchronization with Supabase.
 */
export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Load Sync Logic from Supabase
  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Fetch active cart items
      const { data: cartData } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id);

      // Fetch primary delivery address
      const { data: addrData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      setCartItems(cartData || []);
      setSelectedAddress(addrData);
    } catch (err) {
      console.error("Cart Sync Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();

    // Subscribe to cart changes for real-time quantity updates
    const subscription = supabase
      .channel('cart_updates')
      .on('postgres_changes', { event: '*', table: 'cart' }, loadData)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [loadData]);

  // 2. Quantity Management with Supabase persistence
  const updateQty = async (id, delta, currentQty) => {
    const newQty = currentQty + delta;
    
    try {
      if (newQty <= 0) {
        await supabase.from('cart').delete().eq('id', id);
      } else {
        await supabase.from('cart').update({ quantity: newQty }).eq('id', id);
      }
      // UI updates automatically via real-time subscription
    } catch (err) {
      alert("Failed to update inventory link.");
    }
  };

  // 3. Bill Calculation Logic
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 25;
  const handlingFee = subtotal === 0 ? 0 : 15;
  const total = subtotal + deliveryFee + handlingFee;

  // 4. Secure Cloud Handshake (Order Placement)
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please set a delivery address first!");
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Create permanent order record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          phone: user.user_metadata?.phone || '', // Falls back to metadata if available
          items: cartItems,
          total_amount: total,
          address: selectedAddress.address,
          payment_method: paymentMethod,
          status: 'Processing'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Clear the cloud cart table for this user
      await supabase.from('cart').delete().eq('user_id', user.id);

      navigate('/order-success');
    } catch (err) {
      alert("Terminal Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

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
            
            {/* SECTION 1: DELIVERY ADDRESS */}
            <div className="glass-card p-5 border-white/5 bg-white/[0.02] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl pointer-events-none" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Delivering To</h4>
                <Link to="/profile" className="text-[9px] font-black text-primary uppercase border-b border-primary/20">Change</Link>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-xl border border-primary/20 shadow-lg">📍</div>
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

            {/* SECTION 2: CART ITEMS */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-1">Your Manifest</h4>
              {cartItems.map(item => (
                <div key={item.id} className="glass-card p-3 flex gap-4 border-white/5 bg-white/[0.01] items-center group">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-white/5">
                    <img src={item.image} className="w-full h-full object-cover  group-hover:grayscale-0 transition-all duration-500" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-xs uppercase tracking-tight truncate">{item.name}</h3>
                    <p className="text-[9px] text-primary font-bold uppercase mt-1 italic">₹{item.price}</p>
                  </div>
                  <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10 shadow-inner">
                    <button onClick={() => updateQty(item.id, -1, item.quantity)} className="w-8 h-8 font-black hover:text-primary transition-colors text-sm active:scale-75">-</button>
                    <span className="px-3 text-xs font-black italic">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1, item.quantity)} className="w-8 h-8 font-black text-primary transition-colors text-sm active:scale-75">+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 3: PAYMENT METHOD */}
            <div className="glass-card p-5 border-white/5 bg-white/[0.02]">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-1">Select Payment Gateway</h4>
              <div className="grid grid-cols-2 gap-3">
                {['UPI', 'COD'].map((method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`relative p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group overflow-hidden ${
                        isSelected ? 'border-primary bg-primary/10 shadow-2xl shadow-primary/10' : 'border-white/5 bg-white/5 opacity-60'
                      }`}
                    >
                      <span className={`text-2xl transition-transform duration-300 ${isSelected ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`}>
                        {method === 'UPI' ? '⚡' : '💵'}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                        {method === 'UPI' ? 'Instant UPI' : 'Cash on Delivery'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: BILL SUMMARY */}
            <div className="glass-card p-6 border-white/5 bg-white/[0.03] space-y-4 shadow-xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Financial Summary</h4>
              <div className="space-y-3 text-[11px] font-bold uppercase tracking-wider">
                <div className="flex justify-between text-gray-400"><span>Item Total</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-gray-400">
                  <span>Logistics Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-500 italic' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Handling Node</span>
                  <span className={handlingFee === 0 ? 'text-green-500 italic' : ''}>{handlingFee === 0 ? 'FREE' : `₹${handlingFee}`}</span>
                </div>
                <div className="h-px bg-white/10 my-2"></div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-black text-sm text-white">Net Payable</span>
                  <span className="text-3xl font-black text-primary italic drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]">₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-32 animate-in fade-in zoom-in duration-700">
            <div className="w-28 h-28 bg-white/[0.02] rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl">
              <span className="text-5xl opacity-40 grayscale">🛒</span>
            </div>
            <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] mb-8 italic">Your cloud basket is empty</p>
            <Link to="/home" className="inline-block bg-primary text-black px-12 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all">
              Initialize Shopping
            </Link>
          </div>
        )}
      </div>

      {/* FLOATING CHECKOUT BAR */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-xl border-t border-white/5 z-[110] flex gap-4 items-center max-w-lg mx-auto h-24 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex-1 pl-2">
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Grand Total</p>
            <p className="text-2xl font-black text-white italic leading-none mt-1">₹{total}</p>
          </div>
          <button 
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="flex-[2] bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/40 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            {isProcessing ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Authorize Order →"}
          </button>
        </div>
      )}
    </div>
  );
}
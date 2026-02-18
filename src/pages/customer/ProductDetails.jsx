import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ProductGrid from "../../components/customer/ProductGrid";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProductSuite = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: foundProduct, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (prodError) throw prodError;

      if (foundProduct) {
        setProduct(foundProduct);

        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category', foundProduct.category)
          .neq('id', id)
          .limit(10);
        
        setSuggested(related || []);

       // Manage History inside loadProductSuite
let recentlyViewedIds = JSON.parse(localStorage.getItem('kilogram_recent') || '[]');

// 1. Ensure we only keep valid UUID strings (not timestamps or old numbers)
recentlyViewedIds = recentlyViewedIds.filter(id => 
  typeof id === 'string' && id.includes('-')
);

// 2. Add current product and limit to 10
recentlyViewedIds = [foundProduct.id, ...recentlyViewedIds.filter(itemId => itemId !== foundProduct.id)].slice(0, 10);
localStorage.setItem('kilogram_recent', JSON.stringify(recentlyViewedIds));

// 3. Fetch History Details from Cloud only if we have IDs
const validHistoryIds = recentlyViewedIds.filter(rid => rid !== foundProduct.id);

if (validHistoryIds.length > 0) {
  const { data: historyData, error: historyError } = await supabase
    .from('products')
    .select('*')
    .in('id', validHistoryIds);
  
  if (!historyError) setRecent(historyData || []);
} else {
  setRecent([]);
}
        const { data: historyData } = await supabase
          .from('products')
          .select('*')
          .in('id', recentlyViewedIds.filter(rid => rid !== foundProduct.id));
        
        setRecent(historyData || []);
      }

      if (user) {
        const { data: cartData } = await supabase
          .from('cart')
          .select('*')
          .eq('user_id', user.id);
        setCart(cartData || []);
      }
    } catch (err) {
      console.error("Discovery Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProductSuite();
    const subscription = supabase.channel('cart-sync')
      .on('postgres_changes', { event: '*', table: 'cart' }, loadProductSuite)
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, [loadProductSuite]);

  const updateQuantity = async (delta) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');
    const existingItem = cart.find(item => item.product_id === product.id);
    try {
      if (existingItem) {
        const newQty = existingItem.quantity + delta;
        if (newQty <= 0) await supabase.from('cart').delete().eq('id', existingItem.id);
        else await supabase.from('cart').update({ quantity: newQty }).eq('id', existingItem.id);
      } else if (delta > 0) {
        await supabase.from('cart').insert([{
          user_id: user.id, product_id: product.id, quantity: 1,
          name: product.name, price: product.price, image: product.image
        }]);
      }
    } catch (err) { alert("Inventory sync failed."); }
  };

  const handleBuyNow = async () => {
    const inCart = cart.find(i => i.product_id === product.id);
    if (!inCart) await updateQuantity(1);
    navigate('/cart');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cartItem = cart.find(i => i.product_id === product?.id);
  const qty = cartItem ? cartItem.quantity : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-44 selection:bg-primary/30">
      <button 
        onClick={() => navigate(-1)} 
        className="fixed top-6 left-6 z-[110] w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-primary active:scale-75 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <main className="pt-24 animate-in fade-in duration-700">
        <div className="px-4 mb-10">
          <div className="glass-card w-full aspect-square overflow-hidden border-white/10 shadow-2xl relative group">
            <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        </div>

        <div className="px-6 space-y-8 mb-12">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-lg uppercase tracking-[0.2em] border border-primary/20">
                {product.category}
              </span>
              <h2 className="text-4xl font-black italic tracking-tighter leading-none uppercase text-white drop-shadow-2xl">
                {product.name}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-primary italic drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]">
                ₹{product.price}
              </p>
            </div>
          </div>

          <div className="glass-card p-6 bg-white/[0.02] border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl pointer-events-none" />
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 italic">Asset Specification</h4>
            <p className="text-sm text-gray-300 leading-relaxed italic font-medium whitespace-pre-line">
              {product.specification || `Premium grade ${product.name} hand-picked from the ${product.section} logistics segment.`}
            </p>
          </div>
        </div>

        {/* Horizontal Scrolling Sections */}
        {[
          { title: "Related Assets", data: suggested, color: "bg-primary" },
          { title: "Access History", data: recent, color: "bg-white/20" }
        ].map((section, idx) => section.data.length > 0 && (
          <section key={idx} className="mb-14">
            <div className="flex items-center gap-3 mb-6 px-6">
              <div className={`h-4 w-1 ${section.color} rounded-full shadow-[0_0_8px_#ff4d94]`}></div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 italic">{section.title}</h3>
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-4 px-6 snap-x">
              {section.data.map((item) => (
                <div key={item.id} className="min-w-[160px] max-w-[160px] snap-start" onClick={() => navigate(`/product/${item.id}`)}>
                  <div className="glass-card overflow-hidden aspect-square mb-3 border-white/5 bg-white/[0.02] group active:scale-95 transition-all">
                    <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-tighter truncate">{item.name}</p>
                  <p className="text-[9px] font-black text-primary italic mt-0.5">₹{item.price}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent z-[101]">
        <div className="flex gap-4 max-w-lg mx-auto">
          <button onClick={handleBuyNow} className="flex-1 bg-white text-black py-5 rounded-[2rem] font-black  text-md tracking-widest shadow-2xl active:scale-95 transition-all">
            Buy now
          </button>
          <div className="flex-1 h-16">
            {qty > 0 ? (
              <div className="h-full flex items-center justify-between glass-card px-2 bg-primary border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] rounded-[2rem]">
                <button onClick={() => updateQuantity(-1)} className="w-12 h-12 flex items-center justify-center text-black font-black text-2xl active:scale-75 transition-all">-</button>
                <span className="text-black text-xl font-black italic">{qty}</span>
                <button onClick={() => updateQuantity(1)} className="w-12 h-12 flex items-center justify-center text-black font-black text-2xl active:scale-75 transition-all">+</button>
              </div>
            ) : (
              <button onClick={() => updateQuantity(1)} className="w-full h-full bg-primary/10 border border-primary/40 text-primary rounded-[2rem] font-black  text-md tracking-widest shadow-xl active:scale-95 transition-all">
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
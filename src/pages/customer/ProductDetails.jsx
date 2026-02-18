import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductGrid from "../../components/customer/ProductGrid";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [recent, setRecent] = useState([]);

  const loadData = () => {
    const allProducts = JSON.parse(localStorage.getItem('kilogram_products') || '[]');
    const savedCart = JSON.parse(localStorage.getItem('kilogram_cart') || '[]');
    const found = allProducts.find(p => p.id === parseInt(id));
    
    setProduct(found);
    setCart(savedCart);

    if (found) {
      const suggestions = allProducts.filter(p => p.category === found.category && p.id !== found.id);
      setSuggested(suggestions);

      let recentlyViewedIds = JSON.parse(localStorage.getItem('kilogram_recent') || '[]');
      recentlyViewedIds = [found.id, ...recentlyViewedIds.filter(itemId => itemId !== found.id)].slice(0, 10);
      localStorage.setItem('kilogram_recent', JSON.stringify(recentlyViewedIds));

      const recentData = recentlyViewedIds
        .filter(itemId => itemId !== found.id)
        .map(itemId => allProducts.find(p => p.id === itemId))
        .filter(Boolean);
      setRecent(recentData);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [id]);

  const updateQuantity = (delta) => {
    let currentCart = [...cart];
    const index = currentCart.findIndex(item => item.id === product.id);

    if (index > -1) {
      currentCart[index].quantity += delta;
      if (currentCart[index].quantity <= 0) currentCart.splice(index, 1);
    } else if (delta > 0) {
      currentCart.push({ ...product, quantity: 1 });
    }

    setCart(currentCart);
    localStorage.setItem('kilogram_cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('storage'));
  };

  const handleBuyNow = () => {
    // Add to cart if not already there, then navigate to checkout/cart
    const inCart = cart.find(i => i.id === product.id);
    if (!inCart) {
      updateQuantity(1);
    }
    navigate('/cart'); // Change this to your checkout path
  };

  if (!product) return <div className="p-10 text-white font-black italic">LOADING...</div>;

  const cartItem = cart.find(i => i.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-44">
      {/* Floating Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="fixed top-6 left-6 z-[110] w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-primary shadow-2xl active:scale-90 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <main className="pt-24">
        <div className="px-4 mb-8">
          <div className="glass-card w-full aspect-square overflow-hidden border-white/10 shadow-2xl shadow-primary/5">
            <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
          </div>
        </div>

        <div className="px-4 space-y-6 mb-12">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">{product.category}</span>
              <h2 className="text-3xl font-black italic mt-3 tracking-tighter leading-none uppercase">{product.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-primary italic">₹{product.price}</p>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Incl. Taxes</p>
            </div>
          </div>

          <div className="glass-card p-5 bg-white/5 border-white/5">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Description</h4>
            <p className="text-sm text-gray-300 leading-relaxed italic">Premium grade {product.name} hand-picked from our {product.section} collection.</p>
          </div>
        </div>

        {suggested.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-2 px-4">
              <div className="h-4 w-1 bg-primary rounded-full"></div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Related Picks</h3>
            </div>
            <ProductGrid products={suggested} isSingleRow={true} />
          </section>
        )}

        {recent.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-2 px-4">
              <div className="h-4 w-1 bg-white/20 rounded-full"></div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 italic">History</h3>
            </div>
            <ProductGrid products={recent} isSingleRow={true} />
          </section>
        )}
      </main>

      {/* --- Sticky Bottom Action Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent z-[101]">
        <div className="flex gap-3">
          {/* BUY NOW - Always Visible */}
          <button 
            onClick={handleBuyNow}
            className="flex-1 bg-black text-primary py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all text-xs"
          >
            Buy Now
          </button>

          {/* ADD TO CART - Dynamic Toggle */}
          <div className="flex-[1] h-14">
            {qty > 0 ? (
              <div className="h-full flex items-center justify-between glass-card px-4 bg-primary border-primary">
                <button onClick={() => updateQuantity(-1)} className="w-10 h-10 flex items-center justify-center text-white font-black text-xl active:scale-75 transition-all">-</button>
                <div className="flex flex-col items-center">
                   <span className="text-white text-lg font-black leading-none">{qty}</span>
                   <span className="text-white/50 text-[8px] font-bold uppercase"></span>
                </div>
                <button onClick={() => updateQuantity(1)} className="w-10 h-10 flex items-center justify-center text-white font-black text-xl active:scale-75 transition-all">+</button>
              </div>
            ) : (
              <button 
                onClick={() => updateQuantity(1)}
                className="w-full h-full bg-primary text-black rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all text-xs"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
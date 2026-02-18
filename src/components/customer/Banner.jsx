import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; //

export default function Banner() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Load Banners from Supabase instead of Local Storage
  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Fallback static slide if database is empty
        setSlides([{ 
          title: "Welcome to Kilogram", 
          tag: "Store Live", 
          color: "from-primary/30",
          type: 'text' 
        }]);
      } else {
        setSlides(data);
      }
    } catch (err) {
      console.error("Banner Sync Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();

    // 2. Real-time Listener: Updates the UI instantly if Admin changes a banner
    const subscription = supabase
      .channel('public:banners')
      .on('postgres_changes', { event: '*', table: 'banners' }, loadBanners)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  // 3. Auto-play Logic
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) return (
    <div className="w-full h-40 bg-white/5 rounded-2xl animate-pulse flex items-center justify-center">
      <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Syncing Feed...</span>
    </div>
  );

  return (
    <div className="relative w-full h-50 overflow-hidden mt-2 rounded-2xl shadow-xl border border-white/5">
      {/* Sliding Track */}
      <div 
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={slide.id || i} className="min-w-full h-full relative overflow-hidden bg-[#111]">
            
            {/* Conditional Rendering: Image vs Text Gradient */}
            {slide.type === 'image' ? (
              <img 
                src={slide.image} 
                className="w-full h-full object-cover" 
                alt={slide.tag} 
              />
            ) : (
              <div className={`w-full h-full flex items-center p-8 bg-gradient-to-br ${slide.color || 'from-primary/30'} via-transparent to-transparent`}>
                <div className={`max-w-[75%] transition-all duration-700 ${current === i ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                  <span className="text-primary text-[9px] font-black uppercase tracking-[0.3em]">{slide.tag}</span>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight text-white mt-2 drop-shadow-2xl">
                    {slide.title}
                  </h3>
                </div>
              </div>
            )}
            
            {/* Visual Glass Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Progress Indicators (Blinkit Style Dots) */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 shadow-2xl ${
                current === i ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
              }`} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
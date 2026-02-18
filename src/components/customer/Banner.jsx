import React, { useState, useEffect } from 'react';

export default function Banner() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState([]);

  const loadBanners = () => {
    const saved = JSON.parse(localStorage.getItem('kilogram_banners') || '[]');
    // Fallback if empty
    if (saved.length === 0) {
      setSlides([{ 
        title: "Welcome to Kilogram", 
        tag: "Store Live", 
        color: "from-primary/30",
        type: 'text' 
      }]);
    } else {
      setSlides(saved);
    }
  };

  useEffect(() => {
    loadBanners();
    window.addEventListener('storage', loadBanners);
    return () => window.removeEventListener('storage', loadBanners);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-50 overflow-hidden mt-2 rounded-2xl shadow-xl">
      {/* Sliding Track */}
      <div 
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="min-w-full h-full relative overflow-hidden bg-[#111]">
            
            {/* Conditional Rendering: Image vs Text Gradient */}
            {slide.type === 'image' ? (
              <img 
                src={slide.image} 
                className="w-full h-full object-cover" 
                alt={slide.tag} 
              />
            ) : (
              <div className={`w-full h-full flex items-center p-8 bg-gradient-to-br ${slide.color} via-transparent to-transparent`}>
                <div className={`max-w-[75%] transition-all duration-700 ${current === i ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                  <span className="text-primary text-[9px] font-black uppercase tracking-[0.3em]">{slide.tag}</span>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight text-white mt-2">
                    {slide.title}
                  </h3>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Indicators (Blinkit Style Dots) */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                current === i ? 'w-6 bg-white shadow-lg' : 'w-1.5 bg-white/40'
              }`} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
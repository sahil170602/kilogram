import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const user = localStorage.getItem('kilogram_user');
      if (user) {
        navigate('/home');
      } else {
        navigate('/login');
      }
    }, 4500); // Extended slightly to finish the join animation

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Glassy Container with "Joining" Parts */}
        <div className="w-40 h-40 glass-card border-white/10 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)] mb-8 flex items-center justify-center relative overflow-hidden">
          
          {/* SVG Code-Generated Scooter Icon */}
          <svg viewBox="0 0 100 100" className="w-24 h-24 relative z-20">
            {/* Scooter Body - Slides from LEFT */}
            <path 
              d="M20 60 Q 25 40 45 40 L 65 40 Q 75 40 75 55 L 75 65 L 25 65 Z" 
              fill="none" 
              stroke="white" 
              strokeWidth="2.5"
              className="animate-[slideRight_1.2s_ease-out_forwards]"
            />
            {/* Handlebar & Seat Detail - Slides from LEFT */}
            <path 
              d="M45 40 L 40 30 M 65 40 L 70 45" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round"
              className="animate-[slideRight_1.4s_ease-out_forwards]"
            />
            
            {/* Delivery Box (K-Logo) - Slides from RIGHT */}
            <rect 
              x="50" y="25" width="20" height="15" 
              fill="none" 
              stroke="#ff4d94" 
              strokeWidth="2"
              className="animate-[slideLeft_1.5s_ease-out_forwards]"
            />
            <path d="M56 28 L 56 37 M 56 32 L 64 28 M 56 32 L 64 37" stroke="#ff4d94" strokeWidth="1.5" className="animate-[slideLeft_1.5s_ease-out_forwards]" />

            {/* Wheels - Slide from RIGHT */}
            <circle cx="30" cy="70" r="7" stroke="white" strokeWidth="2.5" fill="none" className="animate-[slideLeft_1.3s_ease-out_forwards]" />
            <circle cx="70" cy="70" r="7" stroke="white" strokeWidth="2.5" fill="none" className="animate-[slideLeft_1.3s_ease-out_forwards]" />
          </svg>

          {/* Internal Glass Reflection Light */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
        </div>

        {/* Text Branding - Slides UP */}
        <div className="text-center animate-[slideUp_1s_ease-out_forwards]">
          <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
            KILO<span className="text-primary drop-shadow-[0_0_10px_#ff4d94]">GRAM</span>
          </h1>
          
          <div className="mt-4 w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 mx-auto">
            <div className="h-full bg-primary shadow-[0_0_15px_#ff4d94] animate-[grow_3.5s_linear_forwards]"></div>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2 opacity-0 animate-[fadeIn_1s_ease-in_2s_forwards]">
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em] italic">
          Executive Logistics Suite
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideRight {
          0% { transform: translateX(-150%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideLeft {
          0% { transform: translateX(150%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes grow {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </div>
  );
}
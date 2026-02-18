import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * SplashScreen Component
 * Serves as the gatekeeper for the Kilogram Ecosystem.
 * Synchronizes high-fidelity branding with Supabase Cloud session verification.
 */
export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const initializeEcosystem = async () => {
      // 1. Establish visual buffer (4.5s) to preserve brand identity
      const animationTimer = new Promise(resolve => setTimeout(resolve, 4500));

      // 2. Parallel Cloud Handshake 
      // Verifies if a secure session token exists in internal memory
      const authCheck = supabase.auth.getSession();

      // Wait for both the animation sequence and the database verify to complete
      const [_, { data: { session } }] = await Promise.all([animationTimer, authCheck]);

      if (session) {
        // HANDSHAKE VERIFIED: Route to Storefront Node
        navigate('/home', { replace: true });
      } else {
        // HANDSHAKE NULL: Route to Identity Terminal
        navigate('/login', { replace: true });
      }
    };

    initializeEcosystem();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center overflow-hidden selection:bg-primary/30">
      
      {/* Background Ambience: Executive Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Logistics Asset Icon (SVG Scooter)  */}
        <div className="w-44 h-44 glass-card border-white/10 shadow-[0_0_80px_rgba(var(--primary-rgb),0.15)] mb-10 flex items-center justify-center relative overflow-hidden bg-white/[0.02]">
          
          <svg viewBox="0 0 100 100" className="w-24 h-24 relative z-20">
            {/* Chassis - Slides from LEFT */}
            <path 
              d="M20 60 Q 25 40 45 40 L 65 40 Q 75 40 75 55 L 75 65 L 25 65 Z" 
              fill="none" stroke="white" strokeWidth="2.5"
              className="animate-[slideRight_1.2s_ease-out_forwards]"
            />
            {/* Navigation Handles - Slides from LEFT */}
            <path 
              d="M45 40 L 40 30 M 65 40 L 70 45" 
              stroke="white" strokeWidth="2" strokeLinecap="round"
              className="animate-[slideRight_1.4s_ease-out_forwards]"
            />
            
            {/* Cargo Box (K-Branding) - Slides from RIGHT */}
            <rect 
              x="50" y="25" width="20" height="15" 
              fill="none" stroke="#ff4d94" strokeWidth="2"
              className="animate-[slideLeft_1.5s_ease-out_forwards]"
            />
            <path d="M56 28 L 56 37 M 56 32 L 64 28 M 56 32 L 64 37" stroke="#ff4d94" strokeWidth="1.5" className="animate-[slideLeft_1.5s_ease-out_forwards]" />

            {/* Kinetic Components (Wheels) - Slide from RIGHT */}
            <circle cx="30" cy="70" r="7" stroke="white" strokeWidth="2.5" fill="none" className="animate-[slideLeft_1.3s_ease-out_forwards]" />
            <circle cx="70" cy="70" r="7" stroke="white" strokeWidth="2.5" fill="none" className="animate-[slideLeft_1.3s_ease-out_forwards]" />
          </svg>

          {/* Internal Glass Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none animate-pulse"></div>
        </div>

        {/* Branding Terminal */}
        <div className="text-center animate-[slideUp_1s_ease-out_forwards]">
          <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-2xl">
            KILO<span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.6)]">GRAM</span>
          </h1>
          
          {/* Precision Progress Bar */}
          <div className="mt-6 w-52 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 mx-auto">
            <div className="h-full bg-primary shadow-[0_0_20px_#ff4d94] animate-[grow_4.5s_linear_forwards]"></div>
          </div>
          <p className="text-[8px] text-primary/40 font-black uppercase tracking-[0.4em] mt-3 animate-pulse">
            Verifying Protocol...
          </p>
        </div>
      </div>
      
      {/* Infrastructure Telemetry */}
      <div className="absolute bottom-16 flex flex-col items-center gap-3 opacity-0 animate-[fadeIn_1s_ease-in_2.5s_forwards]">
        <div className="w-2 h-2 bg-primary rounded-full animate-ping shadow-[0_0_10px_#ff4d94]"></div>
        <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.6em] italic">
          Executive Cloud Logistics
        </p>
      </div>

      {/* Animation Logic */}
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
          0% { transform: translateY(60px); opacity: 0; }
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
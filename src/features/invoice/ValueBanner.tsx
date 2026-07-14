import React, { useEffect, useState } from 'react';
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Heart, Stars, Zap } from "lucide-react";

export const ValueBanner: React.FC = () => {
  const [hidden, setHidden] = useState(() => {
    return localStorage.getItem("tooleefy_hide_banners") === "true" || 
           localStorage.getItem("tooleefy_hide_value_page") === "true";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setHidden(
        localStorage.getItem("tooleefy_hide_banners") === "true" || 
        localStorage.getItem("tooleefy_hide_value_page") === "true"
      );
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("tooleefy_preferences_changed", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tooleefy_preferences_changed", handleStorageChange);
    };
  }, []);

  if (hidden) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-20">
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-1 md:p-2 shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />
        
        <div className="relative bg-slate-950/40 backdrop-blur-3xl rounded-[2rem] border border-white/5 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 border border-emerald-500/20">
              <Stars className="w-3 h-3" /> Community Powered
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-none">
              Empower the Vision to Keep It <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-black">Free Forever.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed">
              We're dedicated to providing professional enterprise tools with zero cost. Your support helps us maintain servers and develop new powerful features for the global business community.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 shrink-0">
            <Link 
              to="/value-our-tools"
              className="group/btn relative w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-black uppercase tracking-[0.15em] sm:tracking-widest text-xs sm:text-sm rounded-2xl shadow-[0_8px_0_0_#065f46] hover:shadow-[0_4px_0_0_#065f46] hover:translate-y-[4px] active:translate-y-[8px] active:shadow-none transition-all border border-emerald-400/20 active:scale-[0.98] pl-[0.15em] sm:pl-[0.2em] whitespace-nowrap"
            >
              <Heart className="w-5 h-5 fill-white group-hover/btn:scale-110 transition-transform shrink-0" />
              <span>Value Our Tool</span>
            </Link>
            
            <div className="flex flex-col items-center gap-2 mt-1">
              <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                <div className="flex -space-x-1.5">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&h=60&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&h=60&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&h=60&q=80"
                  ].map((url, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border border-slate-700 overflow-hidden bg-slate-800">
                      <img 
                        src={url} 
                        alt="Supporter avatar" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                        loading="lazy" 
                        width="20" 
                        height="20" 
                      />
                    </div>
                  ))}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                  Trusted by 1K+
                </span>
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">One-click appreciation</p>
            </div>
          </div>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute bottom-6 right-6 flex gap-2 overflow-hidden pointer-events-none opacity-20">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1 h-8 bg-emerald-500/50 rounded-full rotate-45" />
          ))}
        </div>
      </div>
    </div>
  );
};

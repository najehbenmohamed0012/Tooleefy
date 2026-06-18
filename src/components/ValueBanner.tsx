import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Sparkles, Heart, Zap, ShieldCheck, Globe } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ValueBanner() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-[2.5rem] border-[4px] border-indigo-600 dark:border-white group transition-all duration-500 bg-slate-100 dark:bg-[#daf3e4] mt-12"
    >
      <div className="relative z-10 p-6 md:p-10 lg:p-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Content side */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-200 text-slate-800 dark:bg-emerald-200/80 dark:text-emerald-900 border border-slate-300/50 dark:border-emerald-300/40">
              <Sparkles className="w-3.5 h-3.5 fill-current text-slate-700 dark:text-emerald-800" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Community Supporters</span>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-emerald-950 tracking-tighter leading-[0.9] italic">
                Value our <span className="text-indigo-600 dark:text-indigo-600 transition-colors duration-500 underline decoration-indigo-500/30 dark:decoration-indigo-500/30 underline-offset-8">Work.</span>
              </h2>
              <p className="text-slate-600 dark:text-emerald-900/80 text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                We're committed to keeping elite professional tools accessible for everyone. If our craft empowers your journey, consider fueling our vision.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-white/80 rounded-2xl border border-slate-200 dark:border-emerald-200/50 shadow-sm transition-all hover:bg-white/90">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-emerald-900">Privacy Secured</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-white/80 rounded-2xl border border-slate-200 dark:border-emerald-200/50 shadow-sm transition-all hover:bg-white/90">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-emerald-900">Open Source Spirit</span>
              </div>
            </div>
          </div>

          {/* Action side */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col items-center gap-4">
            <Link 
              to="/value-our-tools" 
              className={cn(
                "group/btn relative w-full lg:w-[320px] h-16 bg-indigo-600 dark:bg-indigo-600 text-white dark:text-white rounded-[1.5rem] font-black uppercase text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.3em] pl-[0.15em] sm:pl-[0.3em] transition-all flex items-center justify-center gap-2 sm:gap-3 whitespace-nowrap",
                "border-b-[4px] border-indigo-800 dark:border-indigo-800 hover:brightness-105 active:border-b-[1px] active:translate-y-[3px]"
              )}
            >
              <Heart className="w-5 h-5 fill-current shrink-0" />
              <span>Become a Supporter</span>
            </Link>

            <div className="flex items-center gap-2.5 opacity-65 group-hover:opacity-100 transition-opacity">
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&h=60&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&h=60&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&h=60&q=80"
                ].map((url, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-background overflow-hidden bg-muted">
                    <img src={url} alt="Supporter avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-emerald-900/80 italic">
                Trusted by 1K+ supporters
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

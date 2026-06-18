import { useState, ChangeEvent, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, CreditCard, Sparkles, Heart, Zap, ShieldCheck, Globe } from "lucide-react";
import { Logo } from "@/components/Logo";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ValueTools() {
  const [amount, setAmount] = useState<number | null>(4);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const presets = [2, 3, 4, 10];

  const handleCustomChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setCustomValue(val);
      if (val !== "") {
        setAmount(parseInt(val));
      } else {
        setAmount(null);
      }
    }
  };

  const paypalEmail = import.meta.env.VITE_PAYPAL_EMAIL || "your-paypal-email@example.com";

  const paypalLink = amount 
    ? `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${paypalEmail}&amount=${amount}&currency_code=USD&item_name=Platform+Value`
    : "#";

  const isDisabled = !amount || amount <= 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center py-24 px-6">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl w-full text-center space-y-12 relative z-10"
      >
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-black uppercase tracking-[0.2em] mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Support Innovation
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter leading-[0.9]">
            Value our <span className="text-primary italic">Craft.</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
            We're dedicated to building precision tools for professional workflows. If our space helps you thrive, your support ensures this mission remains free and accessible for everyone.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-primary/10 p-8 md:p-14 rounded-[4rem] shadow-2xl space-y-12 relative overflow-hidden group">
          {/* Subtle Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/[0.02] to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="space-y-3 relative z-10">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">Choose Your Impact</h2>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">Direct contribution in USD</p>
          </div>

          <div className="flex flex-wrap justify-center gap-5 relative z-10">
            {presets.map((p) => (
              <button
                key={p}
                onMouseDown={() => {
                  setAmount(p);
                  setIsCustom(false);
                }}
                className={`w-24 h-24 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 ${
                  amount === p && !isCustom
                    ? "bg-primary text-white shadow-2xl shadow-primary/30 scale-110 -translate-y-2"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-105"
                }`}
              >
                <span className="text-sm font-black uppercase tracking-widest opacity-40 mb-1">USD</span>
                <span className="text-3xl font-black">${p}</span>
              </button>
            ))}
            <button
              onMouseDown={() => setIsCustom(true)}
              className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-300 ${
                isCustom
                  ? "bg-primary text-white shadow-2xl shadow-primary/30 scale-110 -translate-y-2"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-105"
              }`}
            >
              <Plus className={`w-10 h-10 ${isCustom ? "text-white" : "text-muted-foreground"}`} />
            </button>
          </div>

          <AnimatePresence>
            {isCustom && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="relative z-10"
              >
                <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 max-w-sm mx-auto">
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-primary">$</span>
                    <Input
                      type="text"
                      value={customValue}
                      onChange={handleCustomChange}
                      placeholder="Enter amount"
                      className="h-20 pl-14 bg-transparent border-none text-4xl font-black focus-visible:ring-0 placeholder:text-muted-foreground/20 text-center"
                      autoFocus
                    />
                  </div>
                  <div className="h-px bg-primary/10 w-full mt-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mt-4">Personalized Support</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-6 relative z-10">
            <a 
              href={isDisabled ? undefined : paypalLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full max-w-md h-20 rounded-[2rem] text-xl font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 mx-auto group/pay",
                isDisabled && "opacity-50 pointer-events-none cursor-not-allowed grayscale"
              )}
            >
              <span>Contribute ${amount || 0}</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover/pay:rotate-12 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </a>
            <div className="mt-4 flex items-center justify-center gap-2 opacity-50">
               <CreditCard className="w-4 h-4 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payments securely processed via PayPal</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-primary/5">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary opacity-40 shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Secure SSL</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Globe className="w-5 h-5 text-primary opacity-40 shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Global Reach</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Zap className="w-5 h-5 text-primary opacity-40 shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Instant Support</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Heart className="w-5 h-5 text-primary opacity-40 shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Built with Joy</span>
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-12"
        >
          <div className="flex flex-col items-center space-y-6">
            <div className="flex -space-x-4 overflow-hidden py-2">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80"
              ].map((url, i) => (
                <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-background overflow-hidden bg-muted">
                  <img src={url} alt="Supporter avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
              <div className="flex items-center justify-center h-10 w-10 rounded-full ring-4 ring-background bg-primary text-white text-[10px] font-black">
                +1K
              </div>
            </div>
            <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest italic">
              Joined by over 1,000 professional supporters.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-24 w-full max-w-2xl mx-auto"
        >
          <div className="relative p-12 rounded-[3.5rem] bg-gradient-to-b from-primary/5 to-transparent border border-primary/10 overflow-hidden text-center group">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
            <div className="relative z-10 space-y-6">
              <Logo className="w-20 h-20 mx-auto drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-foreground tracking-tighter italic">Thank You for Fueling our Vision</h3>
                <p className="text-muted-foreground font-medium leading-relaxed max-w-md mx-auto">
                  Your generosity fuels our continuous innovation. Every contribution directly supports the development of elite, high-precision tools for professionals worldwide. We are deeply grateful for your trust.
                </p>
              </div>
            </div>
            
            {/* Corner Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[80px]" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}

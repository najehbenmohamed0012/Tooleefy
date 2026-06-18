import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { Heart, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { ValueBanner } from "./ValueBanner";

export function Footer() {
  return (
    <footer className="bg-muted/30 dark:bg-dark text-foreground dark:text-white pt-24 pb-12 transition-colors border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-12">
          <div className="lg:col-span-6 max-w-xl">
            <Link to="/" aria-label="Tooleefy Home" className="flex items-center gap-3 mb-8 group">
              <Logo className="w-10 h-10 group-hover:rotate-[15deg]" />
              <span className="text-2xl font-black tracking-tight text-primary dark:text-white transition-colors duration-500">Tooleefy</span>
            </Link>
            <p className="text-muted-foreground dark:text-white/50 text-sm font-medium leading-relaxed mb-10">
              The premium enterprise-grade productivity suite built for modern businesses. Completely free, locally processed, and privacy-first.
            </p>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-[10px] font-black text-muted-foreground dark:text-white/30 uppercase tracking-[0.2em]">Appearance Mode</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-6">
            <div>
              <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-white/30 mb-8">Popular Tools</h5>
              <div className="flex flex-col gap-4 text-sm font-bold text-foreground/70 dark:text-white/70">
                <Link to="/tools/invoice" className="hover:text-primary transition-colors">Invoice Maker</Link>
                <Link to="/tools/qr" className="hover:text-primary transition-colors">QR Generator</Link>
                <Link to="/tools/barcode" className="hover:text-primary transition-colors">Barcode Suite</Link>
                <Link to="/tools/converter" className="hover:text-primary transition-colors">Units Converter</Link>
              </div>
            </div>

            <div>
              <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-white/30 mb-8">Resources</h5>
              <div className="flex flex-col gap-4 text-sm font-bold text-foreground/70 dark:text-white/70">
                <Link to="/categories" className="hover:text-primary transition-colors">Tool Library</Link>
                <Link to="/blog" className="hover:text-primary transition-colors">Insights Blog</Link>
                <Link to="/faq" className="hover:text-primary transition-colors">Help & FAQ</Link>
                <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
                <Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mb-20">
          <ValueBanner />
        </div>

        <div className="pt-12 border-t border-border/50 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 dark:text-white/30 text-center md:text-left">
            &copy; {new Date().getFullYear()} TOOLEEFY UTILITY ECOSYSTEM &bull; ALL RIGHTS RESERVED
          </div>
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 dark:text-white/30">
            <Link to="/privacy" className="hover:text-primary dark:hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary dark:hover:text-white transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-primary dark:hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

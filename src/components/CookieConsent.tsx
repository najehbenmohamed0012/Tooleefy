import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Cookie, X } from "lucide-react";
import { safeStorage } from "@/utils/safeStorage";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already made a cookie selection
    const consent = safeStorage.getItem("tooleefy_cookie_consent");
    if (!consent) {
      // Delay visibility slightly for an elegant page-load entry transition
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (choice: "accepted" | "declined") => {
    safeStorage.setItem("tooleefy_cookie_consent", choice);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 bg-slate-900 dark:bg-zinc-900 text-slate-100 border border-slate-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-5 space-y-4"
          id="cookie-consent-banner"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <Cookie className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold tracking-tight uppercase italic text-white">
                Cookie Integrity
              </h3>
            </div>
            <button
              onClick={() => handleConsent("declined")}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            We utilize essential local cookies and anonymized telemetry to optimize our web compilers. We also partner with Google AdSense to serve non-intrusive, contextually compliant advertising under our updated{" "}
            <Link to="/privacy" className="text-primary hover:underline font-semibold">
              Privacy Policy
            </Link>.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => handleConsent("declined")}
              className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg border border-slate-800 transition-colors uppercase tracking-wider"
            >
              Decline
            </button>
            <button
              onClick={() => handleConsent("accepted")}
              className="flex-1 py-2 text-xs font-black text-white bg-primary hover:bg-primary/95 shadow-lg shadow-primary/20 rounded-lg transition-colors uppercase tracking-wider"
            >
              Accept All
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

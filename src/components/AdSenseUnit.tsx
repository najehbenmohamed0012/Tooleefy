import { useEffect, useState } from "react";
import { Sparkles, HelpCircle, Shield, Monitor, Smartphone, Tablet } from "lucide-react";

interface AdSenseUnitProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  type?: "leaderboard" | "in-feed" | "sidebar" | "banner";
  className?: string;
}

export function AdSenseUnit({ 
  slot, 
  format = "auto", 
  type = "leaderboard", 
  className = "" 
}: AdSenseUnitProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // Read client ID from environment or fallback to empty for local sandbox
  const adClient = import.meta.env.VITE_ADSENSE_CLIENT || "";

  useEffect(() => {
    if (!adClient) return;

    const loadAd = () => {
      try {
        // Prevent loading multiple instances of the script
        const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
        if (!existingScript) {
          const script = document.createElement("script");
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
          script.async = true;
          script.crossOrigin = "anonymous";
          document.head.appendChild(script);
        }

        // Initialize ad units once loaded
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        setIsLoaded(true);
      } catch (err) {
        console.warn("Google AdSense loading error:", err);
        setAdError(true);
      }
    };

    // Delay slightly to allow full initial hydration and avoid blocking main thread
    const timer = setTimeout(loadAd, 100);
    return () => clearTimeout(timer);
  }, [adClient, slot]);

  // If we have an active AdSense client ID, render the actual AdSense code snippet
  if (adClient && !adError) {
    return (
      <div 
        id={`adsense-wrapper-${slot}`}
        className={`w-full overflow-hidden my-6 mx-auto flex justify-center items-center bg-card/40 rounded-2xl p-2 border border-border/10 ${className}`}
      >
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight: type === "leaderboard" ? "90px" : "250px" }}
          data-ad-client={adClient}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Beautiful development/sandbox placeholder if no AdSense client configured (standard free tier behavior)
  // Designed with precise modern layout sizes to verify responsiveness across desktop, tablet, and mobile.
  const mockAds = {
    leaderboard: {
      title: "TOOLEEFY PREMIUM BUSINESS INVOICING CORE",
      description: "Generate corporate, tax-ready, dynamic PDF invoices directly inside your browser. No server calls, total data sovereignty, zero limits.",
      cta: "Generate Invoices Now",
      link: "/tools/invoice",
      color: "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20",
      borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
      badgeColor: "bg-emerald-500/10 text-emerald-500",
      ctaBg: "bg-emerald-500 hover:bg-emerald-600",
      dimensions: "Desktop: 728x90 Leaderboard | Mobile: 320x50 Banner"
    },
    "in-feed": {
      title: "DYNAMIC ENCODING: QR CODE SUITE V3.0",
      description: "Embed logos, custom vector gradients, and high-density tracking indicators. Perfect for retail scanners, digital menus, and corporate campaigns.",
      cta: "Create Custom QR",
      link: "/tools/qr",
      color: "from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20",
      borderColor: "border-blue-500/20 hover:border-blue-500/40",
      badgeColor: "bg-blue-500/10 text-blue-500",
      ctaBg: "bg-blue-500 hover:bg-blue-600",
      dimensions: "Responsive 336x280 Rectangle | Adaptive Feed Unit"
    },
    sidebar: {
      title: "SCIENTIFIC UNIT CONVERTER",
      description: "IEEE 754 precision transformations across physical parameters and real-time cryptocurrency scaling.",
      cta: "Convert Now",
      link: "/tools/converter",
      color: "from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20",
      borderColor: "border-amber-500/20 hover:border-amber-500/40",
      badgeColor: "bg-amber-500/10 text-amber-500",
      ctaBg: "bg-amber-500 hover:bg-amber-600",
      dimensions: "300x250 Medium Rectangle | Sidebar Optimized"
    },
    banner: {
      title: "INDUSTRIAL BARCODE GENERATION CORE",
      description: "Batch serialize inventory, retail tags, and labels (Code 128, EAN-13, UPC) locally in ultra high-definition.",
      cta: "Generate Barcodes",
      link: "/tools/barcode",
      color: "from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20",
      borderColor: "border-indigo-500/20 hover:border-indigo-500/40",
      badgeColor: "bg-indigo-500/10 text-indigo-500",
      ctaBg: "bg-indigo-500 hover:bg-indigo-600",
      dimensions: "Desktop: 970x250 Billboard | Tablet: 728x90"
    }
  };

  const currentMock = mockAds[type] || mockAds.leaderboard;

  return (
    <div 
      id={`adsense-sandbox-${slot}`}
      className={`w-full overflow-hidden my-6 mx-auto rounded-3xl border border-dashed transition-all duration-300 bg-card/60 p-6 flex flex-col justify-between md:flex-row items-center gap-6 shadow-sm ${currentMock.borderColor} ${currentMock.color} ${className}`}
    >
      <div className="flex-1 text-left space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${currentMock.badgeColor} flex items-center gap-1`}>
            <Sparkles className="w-2.5 h-2.5" /> Sponsored Sponsor
          </span>
          <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Shield className="w-3 h-3 text-slate-400/80" /> AdSense Slot: {slot}
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <Monitor className="w-2.5 h-2.5" /> Desktop
            <Tablet className="w-2.5 h-2.5" /> Tablet
            <Smartphone className="w-2.5 h-2.5" /> Mobile
          </div>
        </div>
        <h4 className="text-sm font-black text-foreground tracking-tight uppercase italic flex items-center gap-2">
          {currentMock.title}
        </h4>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-2xl">
          {currentMock.description}
        </p>
      </div>

      <div className="flex flex-col items-center sm:items-end gap-1.5 w-full md:w-auto shrink-0">
        <a 
          href={currentMock.link}
          className={`w-full md:w-auto px-5 py-2.5 rounded-xl text-center text-[10px] font-black uppercase tracking-wider text-white transition-all duration-300 cursor-pointer shadow-sm ${currentMock.ctaBg}`}
        >
          {currentMock.cta}
        </a>
        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest text-center sm:text-right">
          {currentMock.dimensions}
        </span>
      </div>
    </div>
  );
}

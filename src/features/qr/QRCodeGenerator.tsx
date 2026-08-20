import { useState, useEffect } from "react";
import { SingleQRGenerator } from "./SingleQRGenerator";
import { BulkQRGenerator } from "./BulkQRGenerator";
import { motion, AnimatePresence } from "motion/react";
import { ValueBanner } from "@/components/ValueBanner";
import { AdSenseUnit } from "@/components/AdSenseUnit";
import { QRFAQ } from "./QRFAQ";

export function QRCodeGenerator() {
  const [activeTab, setActiveTab] = useState("single");

  useEffect(() => {
    document.title = "Precision QR Code Generator | Free Custom Brand Label Engine";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Generate custom-branded QR codes with embedded logos, specific colors, and styling parameters for free. Build static codes, batch create in bulk mode, and download superior high-definition vectors.");
    }
  }, []);

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="flex flex-col gap-6 mb-12">
        <div className="space-y-4 text-center">
          <h1 className="text-5xl font-black text-foreground tracking-tighter italic uppercase">Free QR Code Generator</h1>
          <p className="text-muted-foreground text-sm font-medium max-w-2xl mx-auto leading-relaxed">
            Our tool supports seamless single QR code generation, dynamic bulk QR code generation, and custom QR codes complete with brand logos and personalized styles. Design high-fidelity vector matrices for URLs, Wi-Fi, and contacts with 100% free unlimited use.
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="relative flex gap-4 p-2 bg-slate-100 dark:bg-zinc-950 border-2 border-slate-200 dark:border-zinc-800 rounded-3xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
            <button
              id="qr-single-mode-trigger"
              onClick={() => setActiveTab("single")}
              className={`relative px-8 py-3.5 rounded-2xl font-black uppercase text-sm tracking-wider transition-all duration-200 ${
                activeTab === "single"
                  ? "bg-primary text-white border-2 border-primary -translate-y-[4px] shadow-[0_4px_0_0_#003d25] cursor-default"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 cursor-pointer"
              }`}
            >
              Single Mode
            </button>
            <button
              id="qr-bulk-engine-trigger"
              onClick={() => setActiveTab("bulk")}
              className={`relative px-8 py-3.5 rounded-2xl font-black uppercase text-sm tracking-wider transition-all duration-200 ${
                activeTab === "bulk"
                  ? "bg-primary text-white border-2 border-primary -translate-y-[4px] shadow-[0_4px_0_0_#003d25] cursor-default"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 cursor-pointer"
              }`}
            >
              Bulk Engine
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "single" ? (
          <motion.div
            key="single"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SingleQRGenerator />
          </motion.div>
        ) : (
          <motion.div
            key="bulk"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <BulkQRGenerator />
          </motion.div>
        )}
      </AnimatePresence>

      <ValueBanner />
      <AdSenseUnit slot="1849204719" type="leaderboard" className="my-8" />
      
      {/* Supporting headings & content to capture search intent */}
      <div className="w-full max-w-4xl mx-auto mt-16 p-8 border border-border/40 rounded-3xl bg-card shadow-premium space-y-8 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">Free QR Code Generator Online</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Design scan-proof matrix codes for your digital platforms completely free. Tooleefy’s online creator works directly inside your browser, enabling you to generate high-fidelity, permanent QR patterns without registrations, hidden fees, or expiration limits.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">Create Single & Bulk QR Codes</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Generate single custom landing links or use our high-speed bulk compilation workspace to create hundreds of distinct QR codes simultaneously. Upload dynamic spreadsheets or input sequential data matrices to produce bulk stickers ready for packaging.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">Customize QR Codes with Logos & Brand Colors</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Incorporate your official company logo, customize pattern styles (including liquid dots, pixels, and smooth rounded edges), modify foreground/background gradients, and adjust error-correction rates (L, M, Q, H) to maintain scan speed.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">Instant Vector SVG & High-Resolution PNG Downloads</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Export your creations as fully scalable, print-ready vector SVGs for billboards and large print media, or standard crisp PNG formats for digital use. No third-party servers see your data, ensuring complete confidentiality.
            </p>
          </div>
        </div>
      </div>

      <QRFAQ />
    </div>
  );
}

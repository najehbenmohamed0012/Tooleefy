import { useState, useEffect } from "react";
import { SingleBarcodeGenerator } from "./SingleBarcodeGenerator";
import { BulkBarcodeGenerator } from "./BulkBarcodeGenerator";
import { motion, AnimatePresence } from "motion/react";
import { ValueBanner } from "@/components/ValueBanner";
import { AdSenseUnit } from "@/components/AdSenseUnit";
import { BarcodeFAQ } from "./BarcodeFAQ";

export function BarcodeGenerator() {
  const [activeTab, setActiveTab] = useState("single");

  useEffect(() => {
    document.title = "Precision Barcode Generator | Free Bulk Serial Label Maker";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Generate free high-density barcodes online with our professional precision barcode engine. Supports bulk code generation, Code 128, EAN-13, and customizable vector color outputs.");
    }
  }, []);

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="flex flex-col gap-6 mb-12">
        <div className="space-y-2 text-center">
          <h1 className="text-5xl font-black text-foreground tracking-tighter italic uppercase">Barcode Engine.</h1>
          <p className="text-muted-foreground text-sm font-medium italic">High-fidelity industrial data serialization core.</p>
        </div>
        
        <div className="flex justify-center">
          <div className="relative flex gap-4 p-2 bg-slate-100 dark:bg-zinc-950 border-2 border-slate-200 dark:border-zinc-800 rounded-3xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
            <button
              id="barcode-single-mode-trigger"
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
              id="barcode-bulk-engine-trigger"
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
            <SingleBarcodeGenerator />
          </motion.div>
        ) : (
          <motion.div
            key="bulk"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <BulkBarcodeGenerator />
          </motion.div>
        )}
      </AnimatePresence>

      <ValueBanner />
      <AdSenseUnit slot="2940251718" type="banner" className="my-8" />
      <BarcodeFAQ />
    </div>
  );
}


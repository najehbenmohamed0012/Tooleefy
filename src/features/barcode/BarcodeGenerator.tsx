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
        <div className="space-y-4 text-center">
          <h1 className="text-5xl font-black text-foreground tracking-tighter italic uppercase">Free Barcode Generator</h1>
          <p className="text-muted-foreground text-sm font-medium max-w-3xl mx-auto leading-relaxed">
            Generate barcodes online for free. Whether you need to create single or bulk barcodes, our free barcode generator for business supports critical barcode formats including Code 128, EAN-13, and UPC barcodes.
          </p>
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
      
      {/* Supporting headings & content to capture search intent */}
      <div className="w-full max-w-4xl mx-auto mt-16 p-8 border border-border/40 rounded-3xl bg-card shadow-premium space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">Create Single or Bulk Barcodes</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Tooleefy provides complete flexibility for stock management. Use our single generator to output individual tracking labels, or switch to the bulk engine to batch compile thousands of unique sequential barcode stickers in a single operation.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">Supported Barcode Formats</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our professional serialization core supports key global industry standards: <strong>Code 128</strong> (for enterprise logistics and asset inventory tracking), <strong>EAN-13</strong> (for international retail point-of-sale), and <strong>UPC-A / UPC-E</strong> (for standard retail distribution).
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">How to Generate a Barcode Online</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Generating your codes is simple: select your preferred barcode format, enter your alphanumeric data values, adjust styling parameters like stripe height and label margins, and immediately download high-resolution visual outputs.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">Free Barcode Generator for Business</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Designed specifically for small business logistics, retail operators, and warehouse managers, our online utility operates completely locally in your browser. Save high-definition graphics without cost, sign-ups, or limits.
            </p>
          </div>
        </div>
      </div>

      <BarcodeFAQ />
    </div>
  );
}


import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdSenseUnit } from "@/components/AdSenseUnit";
import { SeoEditorial } from "@/components/SeoEditorial";
import { 
  FileText, 
  QrCode, 
  Barcode, 
  RefreshCcw, 
  Calculator, 
  Search, 
  Settings, 
  Database,
  ArrowRight
} from "lucide-react";

const categories = [
  {
    title: "Financial & Data",
    description: "Enterprise grade calculation and encoding engines for precision processing.",
    color: "from-emerald-500/10 to-teal-500/10",
    tools: [
      { 
        name: "Invoice Generator", 
        path: "/tools/invoice", 
        desc: "Professional invoice and bill templates with local PDF export.",
        icon: FileText,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
      },
      { 
        name: "Unit Converter", 
        path: "/tools/converter", 
        desc: "High-precision calculations for measurement units, currency and crypto rates.",
        icon: RefreshCcw,
        color: "text-teal-500",
        bg: "bg-teal-500/10"
      }
    ]
  },
  {
    title: "Encoding & Identity",
    description: "Generate machine-readable identifiers locally with industry standards.",
    color: "from-blue-500/10 to-indigo-500/10",
    tools: [
      { 
        name: "QR Code Generator", 
        path: "/tools/qr", 
        desc: "Dynamic vector QR codes for business and web.",
        icon: QrCode,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
      },
      { 
        name: "Barcode Generator", 
        path: "/tools/barcode", 
        desc: "Industry standard barcode labels (EAN, UPC, Code128).",
        icon: Barcode,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10"
      }
    ]
  }
];

export function Categories() {
  return (
    <div className="bg-slate-50/50 dark:bg-[#0B1612] min-h-screen pb-24 transition-colors duration-300">
      <PageHeader 
        title="Free Online Business & Productivity Tools" 
        description="Our refined collection of high-performance business utilities. No data leaves your browser."
        badge="Core Library"
      />
      
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Header Billboard / Leaderboard Ad Unit */}
          <AdSenseUnit slot="7208149163" type="banner" className="mb-12" />
 
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <div className="h-full p-6 sm:p-10 border border-slate-100 dark:border-white/5 shadow-premium rounded-[2.5rem] bg-white dark:bg-[#1E3932] overflow-hidden relative group/card hover:border-slate-200 dark:hover:border-white/10 transition-all duration-500">
                  <div className="relative z-10">
                    <div className="mb-8">
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3 tracking-tight uppercase">{cat.title}</h3>
                      <p className="text-slate-500 dark:text-slate-300 font-medium text-xs sm:text-sm leading-relaxed max-w-md">{cat.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {cat.tools.map(tool => (
                        <Link 
                          key={tool.name} 
                          to={tool.path}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 sm:p-6 bg-slate-50 dark:bg-[#0B1612]/40 hover:bg-primary dark:hover:bg-[#006241] rounded-[2rem] group/btn transition-all duration-500 border border-slate-100/50 dark:border-white/5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/25 dark:hover:shadow-primary/10 w-full"
                        >
                          <div className={cn(
                            "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover/btn:scale-110",
                            tool.bg,
                            tool.color,
                            "group-hover/btn:bg-white group-hover/btn:text-[#006241]"
                          )}>
                            <tool.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          
                          <div className="flex-1 min-w-0 w-full text-left">
                            <div className="font-extrabold text-slate-900 dark:text-slate-100 group-hover/btn:text-white transition-colors text-base sm:text-lg tracking-tight">{tool.name}</div>
                            <div className="text-[11.5px] sm:text-xs text-slate-500 dark:text-slate-400 group-hover/btn:text-white/90 transition-colors mt-1 font-medium whitespace-normal break-words leading-relaxed">{tool.desc}</div>
                          </div>
                          
                          <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center opacity-0 group-hover/btn:opacity-100 transition-all duration-500 -translate-x-4 group-hover/btn:translate-x-0 shrink-0 self-end sm:self-auto">
                            <ArrowRight className="w-5 h-5 text-primary group-hover/btn:text-[#006241]" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  {/* Decorative subtle corner gradient */}
                  <div className={cn(
                    "absolute -bottom-16 -right-16 w-48 h-48 bg-gradient-to-br rounded-full blur-3xl opacity-10 pointer-events-none transition-transform duration-700 group-hover/card:scale-110",
                    cat.color
                  )} />
                </div>
              </motion.div>
            ))}
          </div>
 
          {/* Bottom Leaderboard / Content-Match Ad Unit */}
          <AdSenseUnit slot="8109356127" type="leaderboard" className="mt-16" />
        </div>
      </section>
      <SeoEditorial route="/categories" />
    </div>
  );
}

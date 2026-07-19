import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdSenseUnit } from "@/components/AdSenseUnit";
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
        name: "Business & Rate Converter", 
        path: "/tools/converter", 
        desc: "High-precision calculations for currency and crypto exchange rates.",
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
        name: "QR Generator", 
        path: "/tools/qr", 
        desc: "Dynamic vector QR codes for business and web.",
        icon: QrCode,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
      },
      { 
        name: "Barcode Suite", 
        path: "/tools/barcode", 
        desc: "Industry standard labels (EAN, UPC, Code128).",
        icon: Barcode,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10"
      }
    ]
  }
];

export function Categories() {
  return (
    <div className="bg-muted/30 min-h-screen pb-24">
      <PageHeader 
        title="Utility Ecosystem." 
        description="Our refined collection of high-performance business utilities. No data leaves your browser."
        badge="Core Library"
      />
      
      <section className="py-12">
        <div className="container mx-auto px-6">
          {/* Header Billboard / Leaderboard Ad Unit */}
          <AdSenseUnit slot="7208149163" type="banner" className="mb-12" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Card className="h-full p-1 border-none shadow-premium rounded-[3rem] bg-card overflow-hidden">
                  <div className="p-10">
                    <div className="mb-10">
                      <h3 className="text-3xl font-black text-foreground mb-3 tracking-tighter uppercase italic">{cat.title}</h3>
                      <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-sm">{cat.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {cat.tools.map(tool => (
                        <Link 
                          key={tool.name} 
                          to={tool.path}
                          className="flex items-center gap-6 p-6 bg-muted/50 dark:bg-white/[0.03] rounded-[2rem] group transition-all duration-500 hover:bg-primary border border-transparent hover:border-primary/20 shadow-sm hover:shadow-xl hover:shadow-primary/20"
                        >
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:bg-white",
                            tool.bg,
                            tool.color
                          )}>
                            <tool.icon className="w-6 h-6" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-foreground group-hover:text-white transition-colors text-lg tracking-tight">{tool.name}</div>
                            <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground group-hover:text-white/70 transition-colors mt-0.5 font-bold truncate">{tool.desc}</div>
                          </div>
                          
                          <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                            <ArrowRight className="w-5 h-5 text-primary group-hover:text-white" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  {/* Decorative corner element */}
                  <div className={cn(
                    "absolute -bottom-16 -right-16 w-48 h-48 bg-gradient-to-br rounded-full blur-3xl opacity-20 pointer-events-none",
                    cat.color
                  )} />
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom Leaderboard / Content-Match Ad Unit */}
          <AdSenseUnit slot="8109356127" type="leaderboard" className="mt-16" />
        </div>
      </section>
    </div>
  );
}

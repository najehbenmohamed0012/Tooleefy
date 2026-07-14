import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  QrCode, 
  Barcode, 
  RefreshCcw, 
  ShieldCheck, 
  Zap, 
  Globe,
  ArrowRightLeft,
  Flame,
  Eye,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Heart
} from "lucide-react";
import { defaultArticles, BlogPost } from "@/app/Articles";
import { fetchBlogPosts } from "@/supabase/db";
import { AdSenseUnit } from "@/components/AdSenseUnit";

const tools = [
  {
    title: "Invoice Generator",
    desc: "Professional invoice templates with tax support and PDF export.",
    icon: FileText,
    path: "/tools/invoice",
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    title: "QR Code Generator",
    desc: "Generate custom QR codes for URLs, WiFi, VCards and more.",
    icon: QrCode,
    path: "/tools/qr",
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Barcode Generator",
    desc: "Professional barcodes including Code128, EAN13 and bulk support.",
    icon: Barcode,
    path: "/tools/barcode",
    color: "bg-purple-50 text-purple-600"
  },
  {
    title: "Units Converter",
    desc: "Real-time high-precision conversion for length, weight, volume and more.",
    icon: RefreshCcw,
    path: "/tools/converter",
    color: "bg-orange-50 text-orange-600"
  }
];

export function Home() {
  const animatedWords = ["Invoicing", "QR Codes", "Barcodes", "Conversions"];
  const [index, setIndex] = useState(0);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        const posts = await fetchBlogPosts();
        if (posts && posts.length > 0) {
          const sorted = [...posts].sort((a, b) => b.views - a.views);
          setBlogPosts(sorted);
        } else {
          const stored = localStorage.getItem("blog_posts");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const sorted = [...parsed].sort((a, b) => b.views - a.views);
              setBlogPosts(sorted);
              return;
            } catch {
              // ignore
            }
          }
          const sorted = [...defaultArticles].sort((a, b) => b.views - a.views);
          setBlogPosts(sorted);
        }
      } catch (err) {
        console.error("Failed to load blog posts in Home", err);
        const sorted = [...defaultArticles].sort((a, b) => b.views - a.views);
        setBlogPosts(sorted);
      }
    };
    loadBlogPosts();
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.85;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % animatedWords.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Premium Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-background">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-primary text-[11px] font-bold uppercase tracking-[0.2em] mb-8"
            >
              <Zap className="w-3.5 h-3.5" />
              Professional Suite &bull; Free Forever
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-8xl font-black text-foreground leading-tight md:leading-[1.12] tracking-tighter mb-8 flex flex-col items-center justify-center gap-1 sm:gap-2"
            >
              <span>Ultimate Suite For</span>
              <span className="relative inline-block h-[1.2em] w-full min-w-[250px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center text-primary italic select-none"
                  >
                    {animatedWords[index]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground font-medium max-w-3xl mb-12 leading-relaxed"
            >
              Tooleefy is your premium localized business tools generator. Instantly design clean PDFs with the Invoice Suite, customize dynamic high-fidelity QR Codes, compile bulk Barcode Stickers, and compute precise metric and imperial Units Conversions with total privacy.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link to="/tools/invoice" className="w-full sm:w-auto">
                <Button size="lg" className="h-16 px-10 text-base bg-primary hover:bg-secondary text-white font-bold rounded-2xl shadow-premium w-full">
                  Create Invoice
                </Button>
              </Link>
              <Link to="/categories" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="h-16 px-10 text-base border-border text-foreground font-bold rounded-2xl hover:bg-muted w-full">
                  Browser all Tools
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[100px] pointer-events-none" />
      </section>

      {/* Bento Tools Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="sr-only">Our Professional Offline Utilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:auto-rows-[300px] md:auto-rows-[300px]">
            {/* Invoice Large Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-12 md:row-span-2 lg:col-span-8 lg:row-span-2 bento-card p-8 md:p-12 flex flex-col justify-between group !bg-primary !text-white border-none overflow-hidden relative min-h-[400px] lg:min-h-0"
            >
              <div className="flex justify-between items-start flex-wrap gap-4 relative z-10">
                <div className="p-4 md:p-5 bg-white/20 backdrop-blur rounded-3xl group-hover:scale-110 transition-transform duration-500">
                  <FileText className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-sm">PDF EXPORT</span>
                  <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-sm">TAX READY</span>
                </div>
              </div>
              <div className="max-w-md relative z-10 mt-8 md:mt-0">
                <h3 className="text-3xl md:text-5xl font-black mb-4 text-white leading-tight">Professional Invoicing</h3>
                <p className="text-white/80 font-medium text-base md:text-lg leading-relaxed mb-8">
                  Create beautiful, business-ready invoices with multiple templates, automatic calculations, and local PDF downloads.
                </p>
                <Link to="/tools/invoice">
                  <Button className="rounded-full bg-white text-primary font-black h-14 md:h-16 px-8 md:px-10 flex gap-2 hover:bg-white/90 transition-all border-none shadow-xl text-sm md:text-base">
                    Start Generating <ArrowRightLeft className="w-4 h-4 rotate-90" />
                  </Button>
                </Link>
              </div>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-[0.05] pointer-events-none select-none group-hover:opacity-[0.08] transition-opacity duration-500 hidden md:block">
                <FileText className="w-[500px] h-[500px] text-white" />
              </div>
            </motion.div>

            {/* QR Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-6 lg:col-span-4 bento-card p-6 sm:p-8 !bg-primary !text-white group border-none flex flex-col justify-between min-h-[300px] lg:min-h-0"
            >
              <div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-white">QR Generator</h3>
                <p className="text-white/80 text-sm font-medium mb-6 leading-relaxed">
                  Dynamic vector QR codes for Wi-Fi, URLs, and Business Cards.
                </p>
              </div>
              <Link to="/tools/qr">
                <Button className="bg-white text-primary rounded-full font-black w-full h-12 hover:bg-white/90 transition-colors border-none shadow-lg text-xs uppercase tracking-widest">
                  Create Now
                </Button>
              </Link>
            </motion.div>

            {/* Barcode Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-6 lg:col-span-4 bento-card p-6 sm:p-8 group !bg-primary !text-white border-none flex flex-col justify-between min-h-[300px] lg:min-h-0"
            >
              <div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                  <Barcode className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-white">Barcode Suite</h3>
                <p className="text-white/80 text-sm font-medium mb-6 leading-relaxed">
                  EAN, UPC, and Code128 generation with bulk export support.
                </p>
              </div>
              <Link to="/tools/barcode">
                <Button className="bg-white text-primary rounded-full font-black w-full h-12 hover:bg-white/90 transition-colors border-none shadow-lg text-xs uppercase tracking-widest">
                  Generate
                </Button>
              </Link>
            </motion.div>

            {/* Units Converter - Horizontal Strip */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-12 bento-card p-8 flex flex-col md:flex-row items-center justify-between gap-8 group !bg-primary !text-white border-none min-h-[250px] md:min-h-0"
            >
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-[1.5rem] flex items-center justify-center shrink-0">
                  <RefreshCcw className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Universal Units Converter</h3>
                  <p className="text-white/80 text-sm font-medium">Science-grade accuracy for engineering and financial data.</p>
                </div>
              </div>
              <Link to="/tools/converter" className="w-full md:w-auto">
                <Button className="bg-white text-primary px-10 h-14 rounded-full font-black shadow-lg hover:bg-white/90 w-full transition-all border-none text-sm uppercase tracking-widest">
                  Launch Converter
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 md:py-32 bg-background border-t border-border">
        <div className="container mx-auto px-6">
          <h2 className="sr-only">Performance & Security Trust Standards</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16">
            <div className="col-span-1 md:col-span-1 text-center md:text-left">
              <div className="text-4xl md:text-5xl font-black text-foreground mb-2">32ms</div>
              <p className="text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] text-primary opacity-60">Avg. Processing Time</p>
            </div>
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 border-t md:border-t-0 md:border-l border-border pt-12 md:pt-0 md:pl-16">
               <div className="space-y-4 text-center md:text-left">
                  <ShieldCheck className="w-10 h-10 text-primary mx-auto md:mx-0" />
                  <h3 className="text-xl font-bold text-foreground uppercase italic tracking-tight">Data Sovereign</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">All computations are purely client-side. Your financial data is never transmitted to any server.</p>
               </div>
               <div className="space-y-4 text-center md:text-left">
                  <Zap className="w-10 h-10 text-primary mx-auto md:mx-0" />
                  <h3 className="text-xl font-bold text-foreground uppercase italic tracking-tight">Binary Speed</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">Built with optimized JS algorithms to ensure generation happens before the button click is felt.</p>
               </div>
               <div className="space-y-4 text-center md:text-left sm:col-span-2 md:col-span-1">
                  <Globe className="w-10 h-10 text-primary mx-auto md:mx-0" />
                  <h3 className="text-xl font-bold text-foreground uppercase italic tracking-tight">Unrestricted</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">No credits, no subscription wall, no "premium" features. Access the full power of Tooleefy for free.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google AdSense Ads Section */}
      <section className="py-8 bg-muted/5 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <AdSenseUnit slot="9182374650" type="leaderboard" className="my-0" />
          </div>
        </div>
      </section>

      {/* Blog Hot Articles Slider Section */}
      <section className="py-24 bg-muted/20 border-t border-border overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <Flame className="w-4 h-4 fill-current animate-pulse" />
                Trending on Blog
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight italic">
                Hot Articles & <span className="text-primary underline decoration-primary/30 underline-offset-8">Insights</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed">
                Stay updated with curated enterprise guidelines, advanced localization workflows, and secure browser-side computing algorithms written by industry pioneers.
              </p>
            </div>

            {/* Slider Navigation Controls */}
            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <button
                onClick={() => handleScroll('left')}
                className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:-translate-x-1 duration-300 shadow-sm cursor-pointer active:scale-95 group"
                aria-label="Previous articles"
              >
                <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:translate-x-1 duration-300 shadow-sm cursor-pointer active:scale-95 group"
                aria-label="Next articles"
              >
                <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Slider Flex Track */}
          <div
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-8 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {blogPosts.map((post) => {
              const getCategoryStyle = (category: string) => {
                const lower = category.toLowerCase();
                if (lower.includes("invoice")) return "bg-emerald-500 text-white";
                if (lower.includes("qr")) return "bg-blue-500 text-white";
                if (lower.includes("barcode")) return "bg-purple-500 text-white";
                if (lower.includes("converter")) return "bg-orange-500 text-white";
                return "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900";
              };

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="w-[300px] sm:w-[380px] shrink-0 snap-start snap-always group"
                >
                  <Card className="h-full bg-card hover:bg-card/90 border border-border/40 hover:border-primary/30 shadow-premium hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col p-4">
                    {/* Cover Image */}
                    <div className="relative h-48 sm:h-56 rounded-[1.5rem] overflow-hidden bg-muted mb-6">
                      <img
                        src={post.coverImage || "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=800&q=80"}
                        alt={post.coverImageAlt || post.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        id={`home-blog-img-${post.id}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
                      
                      {/* Badge overlay */}
                      <span className={`absolute top-4 left-4 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg ${getCategoryStyle(post.category)}`}>
                        {post.category}
                      </span>
                    </div>

                    {/* Metadata line */}
                    <div className="flex items-center gap-4 text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-3">
                      <span>{post.date}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        5 min read
                      </span>
                    </div>

                    {/* Title & Excerpt */}
                    <div className="space-y-3 flex-grow">
                      <h3 className="text-xl font-extrabold text-foreground tracking-tight line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border/40 my-5" />

                    {/* Footer Row (Reactions / CTA) */}
                    <div className="flex items-center justify-between">
                      {/* Social Metrics */}
                      <div className="flex items-center gap-3 text-muted-foreground text-[11px] font-black uppercase tracking-wider">
                        <span className="flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-lg">
                          <Eye className="w-3.5 h-3.5 text-primary/70" />
                          {post.views}
                        </span>
                        {(post.reactions?.heart > 0 || post.reactions?.fire > 0) && (
                          <span className="flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-lg text-red-500 dark:text-red-400">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            {(post.reactions?.heart || 0) + (post.reactions?.fire || 0)}
                          </span>
                        )}
                      </div>

                      {/* Action trigger */}
                      <Link
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-widest group-hover:gap-2.5 transition-all duration-300"
                      >
                        Read Article
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Link, useSearchParams } from "react-router-dom";
import { 
  Calendar, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  Heart, 
  Flame, 
  ThumbsUp,
  Clock,
  BookOpen,
  Share2,
  Check,
  Mail,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AdSenseUnit } from "@/components/AdSenseUnit";

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.631 2.022 14.161.992 11.537.992c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.47 3.387 1.357 4.847l-.905 3.3 3.4-.885zm11.373-7.54c-.268-.134-1.585-.78-1.82-.866-.237-.087-.41-.13-.58.134-.17.26-.66.82-.808.99-.148.17-.295.19-.562.057-.268-.134-1.13-.417-2.154-1.33-.797-.71-1.335-1.59-1.492-1.858-.157-.268-.017-.413.118-.547.12-.12.268-.313.402-.47.135-.156.18-.268.27-.447.09-.178.044-.335-.022-.47-.067-.134-.58-1.4-.795-1.92-.21-.504-.424-.43-.58-.43h-.496c-.17 0-.447.064-.68.314-.233.25-.89.87-.89 2.122 0 1.25.908 2.458 1.033 2.625.125.166 1.786 2.727 4.327 3.82.605.26 1.076.415 1.444.532.608.193 1.162.165 1.6.1.487-.07 1.585-.648 1.808-1.242.224-.594.224-1.103.157-1.21-.067-.107-.246-.17-.514-.304z" />
  </svg>
);

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  views: number;
  reactions: {
    heart: number;
    fire: number;
    thumbsUp: number;
  };
  published: boolean;
  coverImage?: string;
  coverImageAlt?: string;
  coverImageCaption?: string;
  coverImageTitle?: string;
  seoTitle?: string;
  seoDesc?: string;
  seoKeywords?: string;
}

const parseItalicsOnly = (text: string): React.ReactNode => {
  const italicRegex = /\*([^*]+)\*/g;
  const matches = [...text.matchAll(italicRegex)];
  
  if (matches.length === 0) {
    return text;
  }
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  matches.forEach((match, mIdx) => {
    const matchIndex = match.index || 0;
    if (matchIndex > lastIndex) {
      parts.push(<span key={`text-plain-it-${mIdx}`}>{text.substring(lastIndex, matchIndex)}</span>);
    }
    
    const italicText = match[1];
    parts.push(
      <em key={`text-italic-${mIdx}`} className="italic font-medium text-slate-700 dark:text-slate-300">
        {italicText}
      </em>
    );
    
    lastIndex = matchIndex + match[0].length;
  });
  
  if (lastIndex < text.length) {
    parts.push(<span key="text-plain-it-end">{text.substring(lastIndex)}</span>);
  }
  
  return <>{parts}</>;
};

const parseBoldAndItalics = (text: string): React.ReactNode => {
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const matches = [...text.matchAll(boldRegex)];
  
  if (matches.length === 0) {
    return parseItalicsOnly(text);
  }
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  matches.forEach((match, mIdx) => {
    const matchIndex = match.index || 0;
    if (matchIndex > lastIndex) {
      parts.push(<span key={`text-plain-${mIdx}`}>{parseItalicsOnly(text.substring(lastIndex, matchIndex))}</span>);
    }
    
    const boldText = match[1];
    parts.push(
      <strong key={`text-bold-${mIdx}`} className="font-extrabold text-foreground">
        {parseItalicsOnly(boldText)}
      </strong>
    );
    
    lastIndex = matchIndex + match[0].length;
  });
  
  if (lastIndex < text.length) {
    parts.push(<span key="text-plain-end">{parseItalicsOnly(text.substring(lastIndex))}</span>);
  }
  
  return <>{parts}</>;
};

const parseInlineFormatting = (text: string): React.ReactNode => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = [...text.matchAll(linkRegex)];
  
  if (matches.length === 0) {
    return parseBoldAndItalics(text);
  }
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  matches.forEach((match, mIdx) => {
    const matchIndex = match.index || 0;
    if (matchIndex > lastIndex) {
      parts.push(<span key={`text-${mIdx}`}>{parseBoldAndItalics(text.substring(lastIndex, matchIndex))}</span>);
    }
    
    const label = match[1];
    const url = match[2];
    parts.push(
      <a 
        key={`link-${mIdx}`} 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-primary hover:underline font-bold"
      >
        {parseBoldAndItalics(label)}
      </a>
    );
    
    lastIndex = matchIndex + match[0].length;
  });
  
  if (lastIndex < text.length) {
    parts.push(<span key="text-end">{parseBoldAndItalics(text.substring(lastIndex))}</span>);
  }
  
  return <>{parts}</>;
};

const renderParagraphWithFormatting = (text: string, idx: number) => {
  const imageRegex = /!\[([^\]]*)\]\((.*?)\)/g;
  const matches = [...text.matchAll(imageRegex)];

  if (matches.length > 0) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    matches.forEach((match, mIdx) => {
      const matchIndex = match.index || 0;
      if (matchIndex > lastIndex) {
        const textBefore = text.substring(lastIndex, matchIndex);
        parts.push(
          <span key={`text-before-${mIdx}`}>{parseInlineFormatting(textBefore)}</span>
        );
      }
      
      const alt = match[1] || "Article Image";
      const src = match[2];
      
      parts.push(
        <div key={`img-container-${mIdx}`} className="my-6 space-y-2 flex flex-col items-center justify-center">
          <div className="relative group overflow-hidden rounded-3xl border border-border/40 shadow-md max-w-full">
            <img 
              src={src} 
              alt={alt} 
              referrerPolicy="no-referrer"
              className="max-h-[500px] w-auto max-w-full object-contain rounded-3xl transition-transform duration-300 group-hover:scale-[1.01]"
              id={`article-img-${idx}-${mIdx}`}
            />
          </div>
          {alt && alt !== "Illustration infographic" && (
            <p className="text-center text-xs text-muted-foreground italic font-medium">
              {alt}
            </p>
          )}
        </div>
      );
      
      lastIndex = matchIndex + match[0].length;
    });
    
    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex);
      parts.push(
        <span key="text-after">{parseInlineFormatting(textAfter)}</span>
      );
    }
    
    return (
      <div key={idx} className="text-base text-muted-foreground font-medium leading-relaxed my-4">
        {parts}
      </div>
    );
  }

  return (
    <p key={idx} className="text-base text-muted-foreground font-medium leading-relaxed">
      {parseInlineFormatting(text)}
    </p>
  );
};

export const defaultArticles: BlogPost[] = [
  {
    id: "art-1",
    title: "Why Client-Side Processing is the Future of B2B SaaS",
    excerpt: "Discover how a shift towards local processing is revolutionizing data security and application performance in the enterprise space.",
    content: `## The Rise of Decentralized Architectures

In the classical cloud paradigm, client browsers acted as thin, passive portals. All telemetry, parsing, and structural data flowed upstream to centralized servers. While convenient, this model introduces high latency, huge bandwidth costs, and severe security compliance challenges (such as GDPR, HIPAA, and CCPA).

### Enter Local-First Computing

Modern JavaScript runtimes, accelerated WASM engines, and physical sandbox storage partitions (like standard IndexedDB) allow modern applications to execute heavy workloads *directly inside the browser*. This is the core philosophy of **Tooleefy**:

1. **Absolute Security**: Because zero raw customer data leaves the user's terminal, a potential cloud vector leak is completely mitigated.
2. **Sub-millisecond Latency**: Local computation processes QR styles, unit translations, and barcode sequences instantaneously.
3. **Offline Integrity**: Your productivity suite remains 100% active, regardless of satellite, cellular, or local network interruptions.

By embracing this decentralization, developers can build faster, cheaper, and inherently secure professional utilities that treat clients as powerful computation peers rather than dumb terminals.`,
    date: "May 15, 2024",
    author: "Tech Insider",
    category: "Business",
    views: 1420,
    reactions: { heart: 88, fire: 54, thumbsUp: 31 },
    published: true,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    seoTitle: "Why Client-Side Processing is the Future of B2B SaaS",
    seoDesc: "Discover how a shift towards local processing is revolutionizing data security and application performance in the enterprise space.",
    seoKeywords: "client-side, local-first, decentralized, SaaS, WASM"
  },
  {
    id: "art-2",
    title: "5 Common Invoicing Mistakes Every Freelancer Makes",
    excerpt: "Learn how to avoid delays and ensure professional standards in your financial documentation with these expert tips.",
    content: `## Professional Financial Standards

Freelancers often operate as high-velocity solopreneurs. Yet, their financial backend remains their primary bottleneck. A single delayed invoice can disrupt key operational cashflow. Here are the five most common invoicing mistakes and how to solve them:

### 1. Ambiguous Terms
Never leave payment windows open. Avoid writing vague terms like "Payable on receipt." Instead, enforce precise guidelines (e.g., **NET 15** or **NET 30** with dynamic percentage-based late compound penalties clearly declared).

### 2. Lack of Granular Breakdowns
Clients hesitate when they see giant lump sums. Always structure your work scope as discrete, transparent line items, separating materials, consultative hours, and software subscriptions.

### 3. Static/Manual Numbering
Duplicate invoice numbers confuse bookkeeping software. Utilize a strict sequential indexing schema (e.g., \`INV-2026-0042\`) to ensure historical records remain pristine.

### 4. Poor Mobile Readability
Many business managers approve invoices on their smartphones. Avoid sending physical spreadsheets or dense tables. Ensure your layout converts to a responsive PDF container instantly.

### 5. Neglecting Auto-calculating Tax Rates
Double-checking sales taxes or regional VAT rates manually invite computational errors. Always use an auto-calculating professional generator like **Tooleefy Invoices** to ensure perfect sums.`,
    date: "May 10, 2024",
    author: "Finance Pro",
    category: "Invoice Generator",
    views: 935,
    reactions: { heart: 42, fire: 22, thumbsUp: 19 },
    published: true,
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    seoTitle: "5 Common Invoicing Mistakes Every Freelancer Makes | Tooleefy",
    seoDesc: "Learn how to avoid delays and ensure professional standards in your financial documentation with these expert tips.",
    seoKeywords: "invoicing, freelance, business tips, finance, invoice templates"
  },
  {
    id: "art-3",
    title: "Understanding QR Code Security: Beyond the Scanner",
    excerpt: "An in-depth look at how dynamic QR codes are used in modern cybersecurity and authentication workflows.",
    content: `## The Modern Security Landscape of Matrix Codes

Initially developed in 1994 by Denso Wave for automotive tracking, Quick Response (QR) codes have become the ubiquitous bridging mechanism between physical reality and digital directories. However, with massive convenience comes security vectors that admins must defend.

### The Problem: Malicious Redirection

Because humans cannot read raw QR pixel arrays intuitively, we rely entirely on scanner software to decode terminal endpoints. Attackers leverage this by pasting fraudulent stickers over physical QR codes (a vector known as *Quishing*).

### Best Practices for Secure QR Usage:

- **Static vs. Dynamic Isolation**: Real-time static generation compiled in the sandbox is immune to server manipulation. Ensure encryption keys are held in client cookies rather than remote data pools.
- **Strict HTTPS Constraints**: Scanners should never auto-load endpoints that do not display verified SSL certificates or validated security signatures.
- **Custom Visual Brand Authentication**: Applying cohesive company colors, embedded logo signatures, and custom styling patterns makes forgery of your physical banners far more difficult to execute.

Understanding how to isolate QR code generation inside client environments ensures that your team and your corporate users remain secure.`,
    date: "May 05, 2024",
    author: "Security Team",
    category: "QR Code Generator",
    views: 2125,
    reactions: { heart: 110, fire: 72, thumbsUp: 50 },
    published: true,
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    seoTitle: "Understanding QR Code Security: Beyond the Scanner",
    seoDesc: "An in-depth look at how dynamic QR codes are used in modern cybersecurity and authentication workflows.",
    seoKeywords: "qr code security, quishing, encryption, cyber security, qr scanner"
  }
];

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copied, setCopied] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const articleIdParam = searchParams.get("article");

  const categories = [
    "All",
    "Invoice Generator",
    "Units Converter",
    "QR Code Generator",
    "Barcode Generator",
    "Finance",
    "Business",
    "Insurance"
  ];

  // Load from local storage and sync
  useEffect(() => {
    const raw = localStorage.getItem("blog_posts");
    let loadedPosts: BlogPost[] = [];
    if (!raw) {
      localStorage.setItem("blog_posts", JSON.stringify(defaultArticles));
      loadedPosts = defaultArticles;
      setPosts(defaultArticles);
    } else {
      try {
        loadedPosts = JSON.parse(raw);
        setPosts(loadedPosts);
      } catch {
        loadedPosts = defaultArticles;
        setPosts(defaultArticles);
      }
    }

    // Direct land / deep link support from shared URL params
    if (articleIdParam && loadedPosts.length > 0) {
      const match = loadedPosts.find(p => p.id === articleIdParam);
      if (match) {
        setSelectedPost(match);
      }
    }
  }, []);

  // Update URL if deep linked article changes
  useEffect(() => {
    if (posts.length > 0 && articleIdParam) {
      const match = posts.find(p => p.id === articleIdParam);
      if (match && (!selectedPost || selectedPost.id !== match.id)) {
        setSelectedPost(match);
      }
    } else if (!articleIdParam && selectedPost) {
      setSelectedPost(null);
    }
  }, [articleIdParam, posts]);

  // Dynamic Open Graph and Meta Tag optimization for the selected article
  useEffect(() => {
    if (selectedPost) {
      const originalTitle = document.title;
      const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";

      // Update basic HTML document title
      document.title = `${selectedPost.title} | Tooleefy Blog`;
      
      const updateMeta = (name: string, value: string, isProperty = false) => {
        const attribute = isProperty ? "property" : "name";
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute(attribute, name);
          document.head.appendChild(meta);
        }
        meta.setAttribute("content", value);
      };

      const shareUrl = `${window.location.origin}/blog?article=${selectedPost.id}`;

      // Basic SEO Meta tags
      updateMeta("description", selectedPost.excerpt);
      if (selectedPost.seoKeywords) {
        updateMeta("keywords", selectedPost.seoKeywords);
      } else {
        updateMeta("keywords", `${selectedPost.category}, Tooleefy Blog, ${selectedPost.title.split(" ").join(", ")}`);
      }

      // Open Graph Social Media Tags
      updateMeta("og:title", selectedPost.title, true);
      updateMeta("og:description", selectedPost.excerpt, true);
      updateMeta("og:type", "article", true);
      updateMeta("og:url", shareUrl, true);
      if (selectedPost.coverImage) {
        updateMeta("og:image", selectedPost.coverImage, true);
      }
      updateMeta("og:site_name", "Tooleefy", true);

      // Twitter Cards Tags
      updateMeta("twitter:card", "summary_large_image");
      updateMeta("twitter:title", selectedPost.title);
      updateMeta("twitter:description", selectedPost.excerpt);
      if (selectedPost.coverImage) {
        updateMeta("twitter:image", selectedPost.coverImage);
      }

      // Cleanup to restore original general meta tags on back navigation
      return () => {
        document.title = originalTitle;
        updateMeta("description", originalDescription);
      };
    }
  }, [selectedPost]);

  const handleOpenPost = (post: BlogPost) => {
    // Increment view locally
    const updated = posts.map(p => {
      if (p.id === post.id) {
        return { ...p, views: (p.views || 0) + 1 };
      }
      return p;
    });
    setPosts(updated);
    localStorage.setItem("blog_posts", JSON.stringify(updated));
    setSelectedPost({ ...post, views: (post.views || 0) + 1 });
    setSearchParams({ article: post.id });
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Track page views in analytics index
    try {
      const stats = JSON.parse(localStorage.getItem("admin_stats_cache") || "{}");
      const pageVisits = stats.pageVisits || {};
      pageVisits[`blog_post_${post.id}`] = (pageVisits[`blog_post_${post.id}`] || 0) + 1;
      localStorage.setItem("admin_stats_cache", JSON.stringify({ ...stats, pageVisits }));
    } catch {
      // ignore
    }
  };

  const handleReact = (type: "heart" | "fire" | "thumbsUp") => {
    if (!selectedPost) return;
    
    const updatedPosts = posts.map(p => {
      if (p.id === selectedPost.id) {
        const reactions = p.reactions || { heart: 0, fire: 0, thumbsUp: 0 };
        return {
          ...p,
          reactions: {
            ...reactions,
            [type]: (reactions[type] || 0) + 1
          }
        };
      }
      return p;
    });

    setPosts(updatedPosts);
    localStorage.setItem("blog_posts", JSON.stringify(updatedPosts));
    
    setSelectedPost(prev => {
      if (!prev) return null;
      const rx = prev.reactions || { heart: 0, fire: 0, thumbsUp: 0 };
      return {
        ...prev,
        reactions: {
          ...rx,
          [type]: (rx[type] || 0) + 1
        }
      };
    });

    toast.success("Thank you for your response!");
  };

  const publishedPosts = posts.filter(p => p.published);
  const filteredPosts = publishedPosts.filter(p => 
    selectedCategory === "All" ? true : p.category === selectedCategory
  );

  const relatedArticles = selectedPost 
    ? posts
        .filter((p) => p.published && p.id !== selectedPost.id)
        .sort((a, b) => {
          // Prioritize different categories for maximum diversity and engagement
          const aDiff = a.category !== selectedPost.category ? 1 : 0;
          const bDiff = b.category !== selectedPost.category ? 1 : 0;
          if (aDiff !== bDiff) return bDiff - aDiff;
          return (b.views || 0) - (a.views || 0);
        })
        .slice(0, 3)
    : [];

  return (
    <div className="bg-muted min-h-screen">
      <AnimatePresence mode="wait">
        {!selectedPost ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PageHeader 
              title="Tooleefy Blog" 
              description="The official publication for Tooleefy tools, offering premium masterclasses on invoice generation, dynamic QR & barcode solutions, units converter technology, plus strategic guides covering corporate finance, business productivity, and custom insurance models."
              badge="Blog"
            />
            
            <section className="py-16 md:py-20">
              <div className="container mx-auto px-6">
                
                {/* Dynamic Category Filters */}
                <div className="mb-12 bg-card p-6 md:p-8 rounded-[2rem] border border-border/20 shadow-sm">
                  <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Filter articles by category:</p>
                  <div className="flex flex-wrap gap-2.5">
                    {categories.map((cat) => {
                      const isActive = selectedCategory === cat;
                      const count = cat === "All" 
                        ? publishedPosts.length 
                        : publishedPosts.filter(p => p.category === cat).length;
                      
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 border cursor-pointer ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                              : "bg-muted/40 text-muted-foreground border-border/30 hover:bg-muted hover:text-foreground hover:border-border"
                          }`}
                        >
                          {cat}
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-colors ${
                            isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {filteredPosts.length === 0 ? (
                  <div className="text-center py-20 bg-card rounded-[2.5rem] p-12 shadow-premium border border-border/20">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                    <p className="text-lg font-black text-foreground uppercase tracking-wider">No Articles Found</p>
                    <p className="text-muted-foreground mt-2">There are currently no published articles in the "{selectedCategory}" category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {filteredPosts.map((article, idx) => (
                      <React.Fragment key={article.id || article.title}>
                        {idx === 3 && (
                          <div className="col-span-full">
                            <AdSenseUnit slot="5938204918" type="in-feed" className="my-4" />
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className="group cursor-pointer bg-card rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-premium transition-all duration-500 border border-border/20"
                          onClick={() => handleOpenPost(article)}
                        >
                        <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                          {article.coverImage ? (
                            <img 
                              src={article.coverImage} 
                              alt={article.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-720 ease-out"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                          )}
                          <div className="absolute top-6 left-6 px-3 py-1 bg-background rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm border border-border/20">
                            {article.category}
                          </div>
                        </div>

                        <div className="p-8">
                          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-primary" /> {article.date}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-primary" /> {article.author}
                            </div>
                          </div>

                          <h3 className="text-xl md:text-2xl font-black text-foreground mb-4 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                            {article.title}
                          </h3>

                          <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-6 line-clamp-3">
                            {article.excerpt}
                          </p>

                          <div className="flex items-center justify-between text-foreground font-black uppercase text-[10px] tracking-widest pt-4 border-t border-border/40">
                            <span className="group-hover:text-primary transition-colors flex items-center gap-2">
                              Read Article <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1.5 transition-transform" />
                            </span>
                            <div className="flex items-center gap-3 text-muted-foreground font-normal normal-case">
                              <span className="flex items-center gap-1 text-[11px]"><Eye className="w-3.5 h-3.5" /> {(article.views || 0)}</span>
                              <span className="flex items-center gap-0.5 text-[11px]"><Heart className="w-3.5 h-3.5 fill-rose-500 stroke-rose-500 text-rose-500" /> {((article.reactions?.heart || 0) + (article.reactions?.fire || 0) + (article.reactions?.thumbsUp || 0))}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  ))}
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pb-24"
          >
            {/* Elegant Header Area with back button */}
            <div className="bg-background border-b border-border/60 py-8">
              <div className="container mx-auto px-6 max-w-4xl flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSelectedPost(null);
                    setSearchParams({});
                  }}
                  className="rounded-xl font-bold gap-2 text-sm text-foreground hover:bg-muted"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Articles
                </Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-black tracking-widest">
                  <BookOpen className="w-4 h-4 text-primary" /> Inside {selectedPost.category}
                </div>
              </div>
            </div>

            {/* Premium Article Container */}
            <div className="container mx-auto px-6 max-w-4xl mt-12 bg-card rounded-[3rem] p-8 md:p-14 border border-border/20 shadow-premium">
              {selectedPost.coverImage && (
                <div className="w-full h-80 md:h-[26rem] rounded-[2rem] overflow-hidden mb-12 shadow-sm relative">
                  <img 
                    src={selectedPost.coverImage} 
                    alt={selectedPost.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                </div>
              )}

              {/* Tag and stats metrics panel */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <span className="px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest border border-primary/10">
                    {selectedPost.category}
                  </span>
                  <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" /> {Math.max(2, Math.ceil(selectedPost.content.split(" ").length / 225))} min read
                  </div>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground text-xs font-bold">
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {selectedPost.views} views</span>
                  <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-rose-500" /> {selectedPost.reactions?.heart || 0}</span>
                  <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> {selectedPost.reactions?.fire || 0}</span>
                </div>
              </div>

              {/* Large Display Title */}
              <h1 className="text-3xl md:text-5xl font-black text-foreground italic uppercase tracking-tight leading-tight mb-6">
                {selectedPost.title}
              </h1>

              {/* Author & Date info card */}
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl mb-12 border border-border/20 w-fit">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center font-black text-primary text-sm uppercase">
                  {selectedPost.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-foreground leading-tight">{selectedPost.author}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{selectedPost.date}</p>
                </div>
              </div>

              {/* Excerpt Box */}
              <blockquote className="border-l-4 border-primary pl-6 py-2 italic font-medium text-lg text-slate-700 dark:text-slate-300 mb-12 bg-primary/5 rounded-r-2xl pr-4">
                {selectedPost.excerpt}
              </blockquote>

              {/* Body Content - beautiful typography */}
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed font-semibold space-y-6 animate-fade-in">
                {selectedPost.content.split("\n\n").map((block, idx) => {
                  const renderedBlock = (() => {
                    if (block.startsWith("## ")) {
                      return (
                        <h2 key={idx} className="text-2xl md:text-3xl font-black text-foreground italic uppercase tracking-tight pt-6 border-b border-border/40 pb-2">
                          {parseInlineFormatting(block.replace("## ", ""))}
                        </h2>
                      );
                    }
                    if (block.startsWith("### ")) {
                      return (
                        <h3 key={idx} className="text-xl font-black text-foreground uppercase tracking-wider pt-4">
                          {parseInlineFormatting(block.replace("### ", ""))}
                        </h3>
                      );
                    }
                    if (block.startsWith("- ")) {
                      return (
                        <ul key={idx} className="list-disc pl-6 space-y-2 text-muted-foreground font-medium">
                          {block.split("\n").map((li, i) => (
                            <li key={i}>{parseInlineFormatting(li.replace("- ", ""))}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (block.startsWith("1. ")) {
                      return (
                        <ol key={idx} className="list-decimal pl-6 space-y-3 text-muted-foreground font-medium">
                          {block.split("\n").map((li, i) => (
                            <li key={i}>{parseInlineFormatting(li.substring(3))}</li>
                          ))}
                        </ol>
                      );
                    }
                    return renderParagraphWithFormatting(block, idx);
                  })();

                  if (idx === 4) {
                    return (
                      <React.Fragment key={idx}>
                        <AdSenseUnit slot="8920153810" type="sidebar" className="my-8" />
                        {renderedBlock}
                      </React.Fragment>
                    );
                  }

                  return <React.Fragment key={idx}>{renderedBlock}</React.Fragment>;
                })}
              </div>

              {/* Reaction and Engagement Control */}
              <div className="mt-16 pt-10 border-t border-border/45 text-center space-y-6">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-black">Was this post insightful? Show your response</p>
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    onClick={() => handleReact("heart")} 
                    variant="outline"
                    className="h-14 px-6 rounded-2xl border-rose-100 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 font-bold gap-2 hover:border-rose-400 group transition-all"
                  >
                    <Heart className="w-5 h-5 group-hover:scale-125 transition-transform text-rose-500 fill-rose-500/20" /> 
                    <span>{(selectedPost.reactions?.heart || 0)}</span>
                  </Button>
                  
                  <Button 
                    onClick={() => handleReact("fire")} 
                    variant="outline"
                    className="h-14 px-6 rounded-2xl border-orange-100 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-600 font-bold gap-2 hover:border-orange-400 group transition-all"
                  >
                    <Flame className="w-5 h-5 group-hover:scale-125 transition-transform text-orange-500 fill-orange-500/10" /> 
                    <span>{(selectedPost.reactions?.fire || 0)}</span>
                  </Button>

                  <Button 
                    onClick={() => handleReact("thumbsUp")} 
                    variant="outline"
                    className="h-14 px-6 rounded-2xl border-blue-100 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 font-bold gap-2 hover:border-blue-400 group transition-all"
                  >
                    <ThumbsUp className="w-5 h-5 group-hover:scale-125 transition-transform text-blue-500" /> 
                    <span>{(selectedPost.reactions?.thumbsUp || 0)}</span>
                  </Button>
                </div>

                {/* Premium Social Media Sharing Station */}
                <div className="mt-10 pt-8 border-t border-border/40 text-center space-y-4">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-black flex items-center justify-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-primary" /> Share this Masterclass
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {/* Copy Link Button */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/blog?article=${selectedPost.id}`;
                        navigator.clipboard.writeText(shareUrl);
                        setCopied(true);
                        toast.success("Article link copied to clipboard!");
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="h-11 px-4 rounded-xl border-border/30 hover:bg-muted hover:text-foreground text-muted-foreground text-xs font-bold gap-2 cursor-pointer transition-all duration-300"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500 animate-bounce" />
                      ) : (
                        <Link2 className="w-4 h-4 text-primary" />
                      )}
                      <span>{copied ? "Copied Link!" : "Copy Link"}</span>
                    </Button>

                    {/* Share on X (Twitter) */}
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${window.location.origin}/blog?article=${selectedPost.id}`)}&text=${encodeURIComponent(`${selectedPost.title} - Read this masterclass on Tooleefy Blog`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-slate-900 hover:bg-black text-white hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer"
                      title="Share on X (Twitter)"
                    >
                      <XIcon className="w-4 h-4" />
                    </a>

                    {/* Share on Facebook */}
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/blog?article=${selectedPost.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-[#1877F2] hover:bg-[#0c63d4] text-white hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer"
                      title="Share on Facebook"
                    >
                      <FacebookIcon className="w-5 h-5" />
                    </a>

                    {/* Share on LinkedIn */}
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/blog?article=${selectedPost.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-[#0077B5] hover:bg-[#005a8a] text-white hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer"
                      title="Share on LinkedIn"
                    >
                      <LinkedinIcon className="w-4.5 h-4.5" />
                    </a>

                    {/* Share on WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${selectedPost.title} - ${window.location.origin}/blog?article=${selectedPost.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer"
                      title="Share on WhatsApp"
                    >
                      <WhatsappIcon className="w-4.5 h-4.5" />
                    </a>

                    {/* Share via Email */}
                    <a
                      href={`mailto:?subject=${encodeURIComponent(selectedPost.title)}&body=${encodeURIComponent(`I highly recommend reading this premium blog post from Tooleefy:\n\n${selectedPost.title}\n${window.location.origin}/blog?article=${selectedPost.id}`)}`}
                      className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-muted hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer border border-border/30"
                      title="Share via Email"
                    >
                      <Mail className="w-4 h-4 text-primary" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* AdSense Unit between single article content and related articles */}
            <div className="container mx-auto px-6 max-w-4xl mt-12">
              <AdSenseUnit slot="6920153841" type="leaderboard" />
            </div>

            {/* Premium Related Articles Section */}
            {relatedArticles.length > 0 && (
              <div className="container mx-auto px-6 max-w-4xl mt-16">
                <div className="flex items-center gap-3 mb-8">
                  <span className="h-px bg-border/40 flex-1" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    Related articles to explore
                  </h3>
                  <span className="h-px bg-border/40 flex-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((article, idx) => (
                    <motion.div
                      key={article.id || article.title}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group cursor-pointer bg-card rounded-[2rem] overflow-hidden shadow-sm hover:shadow-premium transition-all duration-300 border border-border/20 flex flex-col h-full"
                      onClick={() => {
                        setSelectedPost(article);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                        {article.coverImage ? (
                          <img 
                            src={article.coverImage} 
                            alt={article.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                        )}
                        <div className="absolute top-4 left-4 px-2.5 py-0.5 bg-background/90 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-widest text-primary border border-border/10">
                          {article.category}
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-primary" /> {article.date}
                          </span>
                        </div>

                        <h4 className="text-sm md:text-base font-black text-foreground mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                          {article.title}
                        </h4>

                        <p className="text-muted-foreground font-medium text-xs leading-relaxed mb-4 line-clamp-2 flex-grow">
                          {article.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-foreground font-black uppercase text-[9px] tracking-widest pt-3 border-t border-border/40 mt-auto">
                          <span className="group-hover:text-primary transition-colors flex items-center gap-1.5">
                            Read Now <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Legal({ type }: { type: 'terms' | 'privacy' | 'cookies' }) {

  const isTerms = type === 'terms';
  const isPrivacy = type === 'privacy';
  const isCookies = type === 'cookies';

  return (
    <div className="bg-background min-h-screen">
      <PageHeader 
        title={isTerms ? "Terms of Service." : isPrivacy ? "Privacy Policy." : "Cookie Protocol."} 
        description={
          isTerms 
            ? "The legal framework governing our professional utility ecosystem." 
            : isPrivacy 
              ? "Our radical commitment to your absolute data sovereignty."
              : "Transparency regarding our minimal browser-level data footprint."
        }
        badge="Legal Documentation"
      />
      
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-slate dark:prose-invert prose-lg font-medium text-muted-foreground leading-relaxed max-w-none">
            {isTerms && (
              <div className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">01. Acceptance of Terms</h2>
                  <p>
                    By accessing and utilizing the Tooleefy platform (the "Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and Tooleefy. If you do not agree with any part of these terms, you are prohibited from using our industrial utility suite.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">02. Scope of Service</h2>
                  <p>
                    Tooleefy provides a decentralized suite of productivity tools, including but not limited to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Dynamic Quote & Invoice Management Systems</li>
                    <li>High-Fidelity QR Code Generation Engines</li>
                    <li>Industrial Bulk Barcode Serialization Tools</li>
                    <li>Advanced Unit & Data Converters</li>
                  </ul>
                  <p>
                    We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without prior notice.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">03. User Conduct & Integrity</h2>
                  <p>
                    You agree to use our tools only for lawful purposes. Prohibited activities include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Generating fraudulent financial documents or misrepresenting tax identities.</li>
                    <li>Automated scraping, bot-driven requests, or any attempt to destabilize our infrastructure.</li>
                    <li>Enciphering illegal content into QR codes or Barcodes.</li>
                    <li>Removing or obscuring our brand marks where they are mandatory by design.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">04. Limitation of Liability</h2>
                  <p>
                    Tooleefy provides these tools "As-Is" and "As-Available." We make no warranties, expressed or implied, regarding the accuracy of generated data. <strong>Users are solely responsible</strong> for verifying the legal and financial accuracy of any invoice, barcode, or data translation produced by the platform. Tooleefy shall not be held liable for any financial losses, compliance failures, or damages arising from the use of our generated assets.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">05. Intellectual Property</h2>
                  <p>
                    The "Tooleefy" name, the design aesthetic, and the underlying source code are the exclusive property of our team. However, we maintain a **User-First Ownership** policy: you retain 100% ownership of the data you input and the final assets (PDFs, Images, Text) generated through our engine.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">06. Termination</h2>
                  <p>
                    We reserve the right to terminate or restrict access to any user found in violation of these terms, particularly those engaging in systemic abuse of our free resources.
                  </p>
                </div>
              </div>
            )}

            {isPrivacy && (
              <div className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">01. Radical Data Sovereignty</h2>
                  <p>
                    Privacy is not just a feature at Tooleefy; it is our fundamental architectural constraint. Most contemporary utility platforms operate on a "Capture and Cloud" model, where your work is transmitted to distant servers for processing. Tooleefy operates on a **Radical Sovereignty Protocol**. This means that when you generate an invoice, encode a barcode, or convert sensitive business data, the entire computation occurs within your device's sandbox. We do not have a server-side "view" of your business operations.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">02. The "Zero-Knowledge" Standard</h2>
                  <p>
                    In legal and technical terms, Tooleefy acts as a **Passive Catalyst**. We provide the logic and the interface, but you provide the data and the processing power. Because your inputs never cross the network threshold to our infrastructure:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We cannot be compelled by third parties to provide access to your documents (Invoices, QR codes, etc.) because we never possessed them.</li>
                    <li>There is no "Global Database" of your activity that can be breached or leaked.</li>
                    <li>Your financial identities, client lists, and internal serial numbers remain historically invisible to our team.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">03. Minimalist & Ethical Telemetry</h2>
                  <p>
                    To maintain the stability of our high-fidelity engines, we collect basic, non-identifiable telemetry. This is limited to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>**Performance Metrics**: How fast the QR engine renders on different browser engines.</li>
                    <li>**Aggregation**: Total number of tool accesses to determine which utilities require further optimization.</li>
                    <li>**Error Logs**: Anonymous reports of script crashes to ensure industrial-grade uptime.</li>
                  </ul>
                  <p>
                    We strictly prohibit the use of identity-linking trackers or behavioral profiling tools within the Tooleefy ecosystem.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">04. Local Physical Storage</h2>
                  <p>
                    Any "Saving" mechanisms provided (such as persistent settings or invoice drafts) utilize **IndexedDB or LocalStorage** API. This is a physical partition of data stored exclusively on your hard drive. Clearing your browser cache or "Site Data" will permanently remove this information. We do not maintain backups of your local data; you are the sole custodian of your work.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">05. Security & Isolation</h2>
                  <p>
                    We recommend that users handling highly sensitive or regulated information (such as HIPAA or GDPR-governed data) utilize Tooleefy in an "Incognito" or "Private" window for maximum isolation. By closing the tab, you ensure that the browser's volatile memory is purged of all transient processing state.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">06. Future-Proof Integrity</h2>
                  <p>
                    As Tooleefy evolves, our commitment to this **Local-First** philosophy remains immutable. Should we ever introduce cloud-syncing features, they will be strictly "Opt-In" with end-to-end encryption, ensuring that even in the cloud, were we to host your data, we could not read it.
                  </p>
                </div>
              </div>
            )}

            {isCookies && (
              <div className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">01. Our Stance on Tracking</h2>
                  <p>
                    At Tooleefy, we believe that tracking should be the exception, not the rule. Unlike many modern platforms that utilize "tracking pixels" to follow your digital life across the web, Tooleefy maintains a **high-integrity, low-footprint browser environment**. We do not sell your data, because we don't collect it.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">02. Essential Session Cookies</h2>
                  <p>
                    We utilize a minimal set of "Essential" cookies to ensure the platform functions as intended. These include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>**Preference Memory**: Remembering your choice of Light or Dark mode.</li>
                    <li>**Session Continuity**: Ensuring that your active tool states remain intact during deep-work intervals.</li>
                    <li>**Security Tokens**: Protecting the platform from automated bot attacks and cross-site request forgery.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">03. Performance Telemetry</h2>
                  <p>
                    To maintain our **industrial-grade performance standards**, we may use anonymized analytic cookies. These tell us which features are being used most frequently and help us identify hardware bottlenecks, allowing us to optimize the engine for slower devices. No personal data is ever attached to these signals.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">04. Third-Party Cookies</h2>
                  <p>
                    Certain features (such as integrated support widgets or social sharing) may occasionally introduce third-party cookies. We audit these integrations rigorously to ensure they adhere to our "Privacy-First" mission.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30">05. Controlling Your Environment</h2>
                  <p>
                    You have total control. You can disable cookies at any time through your browser settings. Because Tooleefy is built with **client-side resilience**, most of our core tools (QR, Barcode, Converters) will continue to function even if you block all storage, though your preferences may reset upon refresh.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

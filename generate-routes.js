import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

// Secure permission helpers for Hostinger / cPanel deployment
const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
  try {
    fs.chmodSync(dirPath, 0o755);
  } catch (e) {
    // Ignore chmod issues on platforms that don't support or allow it
  }
};

const writeFileSafe = (filePath, content) => {
  fs.writeFileSync(filePath, content, "utf-8");
  try {
    fs.chmodSync(filePath, 0o644);
  } catch (e) {
    // Ignore chmod issues on platforms that don't support or allow it
  }
};

// Define the metadata map exactly as in server.ts
const metaMap = {
  "/": {
    title: "Tooleefy | Professional Free Offline Business Utilities Suite",
    desc: "Instant premium local business tools generator. Design clean PDFs with the Invoice Suite, custom-brand high-fidelity QR Codes, compile bulk Barcode Stickers, and compute metrics offline.",
    keywords: "business tools, free online tools, invoice generator, barcode generator, QR generator, unit converter, local productivity, offline utilities",
    ogImageParam: "home"
  },
  "/tools/invoice": {
    title: "Enterprise Invoice Generator | Free Professional Invoicing - Tooleefy",
    desc: "Produce professional, fully compliant business invoices offline. Features brand logos insertion, bank details integrations, tax computations, and unlimited premium PDF prints.",
    keywords: "online invoice maker, invoice creator, pdf billing creator, local invoice builder, professional invoicing",
    ogImageParam: "invoice"
  },
  "/tools/qr": {
    title: "Branded QR Code suite | Custom Logo & Gradient Matrix - Tooleefy",
    desc: "Generate premium custom-branded QR codes with embedded vector logos, custom dot styles, edge gradients, error-correction tuning, and complete verification diagnostics.",
    keywords: "branded qr code generator, custom qr creator, free qr logo maker, high-fidelity qr suite",
    ogImageParam: "qr"
  },
  "/tools/barcode": {
    title: "Bulk Barcode Generator | Free Serial Label Stickers - Tooleefy",
    desc: "Generate high-density industrial Code128, EAN-13, and UPC barcodes. Import lists, customize labels, print layout grid parameters, and download high-resolution sticker books.",
    keywords: "barcode label maker, code128 sheet generator, free retail barcodes, barcode sticker sheet",
    ogImageParam: "barcode"
  },
  "/tools/converter": {
    title: "High-Accuracy Units Converter | Scientific Measurement Tool - Tooleefy",
    desc: "Perform flawless measurement transformations across length, mass, temperature, area, digital data, plus live real-time fiat and cryptocurrency markets.",
    keywords: "measurement metrics convert, fiat currency calculator, imperial converters, live crypto conversion",
    ogImageParam: "converter"
  },
  "/categories": {
    title: "Productivity Categories Hub | Browse Local Utilities - Tooleefy",
    desc: "Select from our structured lists of high-integrity tools. Free, direct, local-first processing for invoices, tracking labels, scan matrices, and scientific dimensions.",
    keywords: "productivity modules, local-first utility list, tools categories, business software suite",
    ogImageParam: "categories"
  },
  "/blog": {
    title: "Insights Workspace | SaaS, Local Security, & Workflows - Tooleefy",
    desc: "Masterclass tutorials and insightful professional blog posts on client-side sandboxing, data privacy sovereignty, and optimal accounting templates.",
    keywords: "tooleefy blog, local saas insights, tech workflow security, financial invoice design",
    ogImageParam: "blog"
  },
  "/about": {
    title: "The Tooleefy Standard | Private Decentralized Browser Tech - Tooleefy",
    desc: "Discover why we are creating specialized offline utilities. Zero-knowledge local sandbox calculations mean we do not capture, sync, or sell your business files.",
    keywords: "about tooleefy, decentralized browser app, local security web tools, professional utility design",
    ogImageParam: "about"
  },
  "/faq": {
    title: "Core Help Desk | Support & Knowledgebase Guide - Tooleefy",
    desc: "Frequently asked questions and guides for configuring currency rates, scanning customized ECC barcodes, and generating high-density vector graphics safely.",
    keywords: "tooleefy support, qr builder tutorials, local security facts, invoice pdf layout assistance",
    ogImageParam: "faq"
  },
  "/contact": {
    title: "Get in Touch | High-Integrity Support - Tooleefy",
    desc: "Drop us a line for enterprise utility integration questions, feedback, or custom feature proposals. Our specialists respond within a business day.",
    keywords: "contact tooleefy, software support, provide feedback tool suite, support team email",
    ogImageParam: "contact"
  },
  "/value-our-tools": {
    title: "Value Our Tools | User Feedback & Continuous Support - Tooleefy",
    desc: "Leave feedback on your favorite Tooleefy modules, rate our response speeds, and share your suggestions directly with our engineering team.",
    keywords: "value our tools, feedback portal, user rating, online suite review",
    ogImageParam: "value-our-tools"
  },
  "/privacy": {
    title: "Sovereignty Privacy Protocol | Zero Data Harvesting - Tooleefy",
    desc: "We prioritize total local privacy sovereignty. Your sensitive business client databases and accounting logs never cross the network block to our servers.",
    keywords: "privacy policy, private local sandbox, zero database tracking, HIPAA compliant tool",
    ogImageParam: "privacy"
  },
  "/terms": {
    title: "Terms of Service | Legal Passiveness and Trust - Tooleefy",
    desc: "Review terms for utilizing our industrial utility suite. Safe, free-of-charge passiveness with solid and distinct user content ownership boundaries.",
    keywords: "terms of service, legal guidelines, user ownership license, passive software engine",
    ogImageParam: "terms"
  },
  "/cookies": {
    title: "Cookie and Cache Transparency Declaration - Tooleefy",
    desc: "We strictly reject identity-tracking or behavioural marketing analytics cookies. Cookies are used purely to preserve your configuration selections locally.",
    keywords: "cookie policy, localstorage preference records, zero analytical trackers, web cache control",
    ogImageParam: "cookies"
  }
};

// Define private routes with noindex
const privateRoutes = [
  "dashboard",
  "admin",
  "settings/account",
  "settings/preferences",
  "login",
  "register"
];

const host = "tooleefy.com";
const protocol = "https";
const distDir = path.join(process.cwd(), "dist");
const sourceHtml = path.join(distDir, "index.html");

if (!fs.existsSync(sourceHtml)) {
  console.error("Error: dist/index.html not found! Run npm run build first.");
  process.exit(1);
}

const rawHtml = fs.readFileSync(sourceHtml, "utf-8");

// Helper function to cleanly strip any existing SEO and Social meta tags from the base HTML template
const stripExistingSeoTags = (html) => {
  let cleaned = html;
  // Strip existing Title
  cleaned = cleaned.replace(/<title>.*?<\/title>/gi, "");
  // Strip existing Canonical Link
  cleaned = cleaned.replace(/<link rel="canonical" href=".*?" \/?>/gi, "");
  // Strip standard SEO Meta tags
  cleaned = cleaned.replace(/<meta name="(description|keywords|author|robots)" content=".*?" \/?>/gi, "");
  // Strip Open Graph tags
  cleaned = cleaned.replace(/<meta property="og:[a-zA-Z0-9:_]+" content=".*?" \/?>/gi, "");
  // Strip Twitter Card tags
  cleaned = cleaned.replace(/<meta name="twitter:[a-zA-Z0-9:_]+" content=".*?" \/?>/gi, "");
  return cleaned;
};

const baseHtml = stripExistingSeoTags(rawHtml);

console.log("Generating pre-rendered physical HTML routes for SEO and Hostinger 404 compatibility...");

// Generate public routes
Object.entries(metaMap).forEach(([route, meta]) => {
  let targetHtmlPath;
  if (route === "/") {
    targetHtmlPath = path.join(distDir, "index.html");
  } else {
    const normalizedRoute = route.startsWith("/") ? route.substring(1) : route;
    const routeDir = path.join(distDir, normalizedRoute);
    
    // Create folder recursive
    ensureDir(routeDir);
    targetHtmlPath = path.join(routeDir, "index.html");
  }
  
  const absoluteUrl = `${protocol}://${host}${route}`;
  const ogImgUrl = meta.ogImageParam && meta.ogImageParam.startsWith("http")
    ? meta.ogImageParam
    : `${protocol}://${host}/images/og-default.jpg`;
  
  // Build clean SEO meta tags block
  const seoTags = `
    <!-- General SEO tags -->
    <meta name="description" content="${meta.desc}" />
    <meta name="keywords" content="${meta.keywords}" />
    <meta name="author" content="Tooleefy" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${absoluteUrl}" />

    <!-- Open Graph tags -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Tooleefy" />
    <meta property="og:url" content="${absoluteUrl}" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.desc}" />
    <meta property="og:image" content="${ogImgUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${meta.title}" />

    <!-- Twitter Card metadata -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${absoluteUrl}" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.desc}" />
    <meta name="twitter:image" content="${ogImgUrl}" />
  `;

  let pageHtml = baseHtml;
  
  // Inject Title and SEO blocks cleanly nested before </head>
  pageHtml = pageHtml.replace("</head>", `<title>${meta.title}</title>\n${seoTags}\n</head>`);
  
  writeFileSafe(targetHtmlPath, pageHtml);
  if (route === "/") {
    console.log("- Pre-rendered main landing page: dist/index.html");
  } else {
    const normalizedRoute = route.startsWith("/") ? route.substring(1) : route;
    console.log(`- Created public SEO route: ${normalizedRoute}/index.html`);
  }
});

// Define default articles for offline fallback/offline builds
const defaults = [
  {
    id: "art-1",
    title: "Why Client-Side Processing is the Future of B2B SaaS",
    excerpt: "Discover how a shift towards local processing is revolutionizing data security and application performance in the enterprise space.",
    seoTitle: "Why Client-Side Processing is the Future of B2B SaaS",
    seoDesc: "Discover how a shift towards local processing is revolutionizing data security and application performance in the enterprise space.",
    seoKeywords: "client-side, local-first, decentralized, SaaS, WASM",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category: "Business"
  },
  {
    id: "art-2",
    title: "5 Common Invoicing Mistakes Every Freelancer Makes",
    excerpt: "Learn how to avoid delays and ensure professional standards in your financial documentation with these expert tips.",
    seoTitle: "5 Common Invoicing Mistakes Every Freelancer Makes",
    seoDesc: "Learn how to avoid delays and ensure professional standards in your financial documentation with these expert tips.",
    seoKeywords: "online invoice maker, invoice creator, pdf billing creator, local invoice builder, professional invoicing",
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    category: "Invoice Generator"
  },
  {
    id: "art-3",
    title: "Mastering Custom QR Code Architecture for Retail",
    excerpt: "Understand structural guidelines, custom styles, and verification diagnostics to optimize customer engagement.",
    seoTitle: "Mastering Custom QR Code Architecture for Retail",
    seoDesc: "Understand structural guidelines, custom styles, and verification diagnostics to optimize customer engagement.",
    seoKeywords: "branded qr code generator, custom qr creator, free qr logo maker, high-fidelity qr suite",
    coverImage: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=800&q=80",
    category: "QR Code Generator"
  }
];

// Fetch posts from Supabase or fallback
let blogPostsToPreRender = [...defaults];
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseAnonKey) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, excerpt, seoTitle, seoDesc, seoKeywords, coverImage, category");
    
    if (!error && data && data.length > 0) {
      console.log(`Fetched ${data.length} blog posts from Supabase for pre-rendering.`);
      // Merge fetched posts with defaults, ensuring no duplicate IDs
      const fetchedIds = new Set(data.map(p => p.id));
      const uniqueDefaults = defaults.filter(p => !fetchedIds.has(p.id));
      blogPostsToPreRender = [...data, ...uniqueDefaults];
    } else if (error) {
      console.warn("Supabase fetch returned error, using fallback defaults:", error.message);
    }
  } catch (err) {
    console.warn("Could not fetch from Supabase, using defaults:", err);
  }
} else {
  console.log("No Supabase configuration found in environment. Pre-rendering offline defaults.");
}

// Generate pre-rendered physical HTML files for every blog post
blogPostsToPreRender.forEach((post) => {
  const route = `/blog/${post.id}`;
  const routeDir = path.join(distDir, "blog", post.id);
  ensureDir(routeDir);
  
  const absoluteUrl = `${protocol}://${host}${route}`;
  const title = `${post.seoTitle || post.title} | Tooleefy Insights`;
  const desc = post.seoDesc || post.excerpt;
  const keywords = post.seoKeywords || "tooleefy blog, local saas insights, tech workflow security";
  const ogImgUrl = post.coverImage && post.coverImage.startsWith("http")
    ? post.coverImage
    : `${protocol}://${host}/images/og-default.jpg`;
    
  const seoTags = `
    <!-- General SEO tags for ${post.title} -->
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="author" content="Tooleefy" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${absoluteUrl}" />

    <!-- Open Graph tags -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Tooleefy" />
    <meta property="og:url" content="${absoluteUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${ogImgUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${title}" />

    <!-- Twitter Card metadata -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${absoluteUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${ogImgUrl}" />
  `;

  let pageHtml = baseHtml;
  pageHtml = pageHtml.replace("</head>", `<title>${title}</title>\n${seoTags}\n</head>`);
  
  const targetHtmlPath = path.join(routeDir, "index.html");
  writeFileSafe(targetHtmlPath, pageHtml);
  console.log(`- Pre-rendered blog article route: blog/${post.id}/index.html`);
});

// Generate private routes with noindex
privateRoutes.forEach((route) => {
  const routeDir = path.join(distDir, route);
  ensureDir(routeDir);
  
  const absoluteUrl = `${protocol}://${host}/${route}`;
  const title = `Portal | Tooleefy`;
  
  const seoTags = `
    <!-- Private Route Meta -->
    <meta name="robots" content="noindex, nofollow" />
    <meta name="author" content="Tooleefy" />
    <link rel="canonical" href="${absoluteUrl}" />
  `;

  let pageHtml = baseHtml;
  pageHtml = pageHtml.replace("</head>", `<title>${title}</title>\n${seoTags}\n</head>`);
  
  const targetHtmlPath = path.join(routeDir, "index.html");
  writeFileSafe(targetHtmlPath, pageHtml);
  console.log(`- Created private route: ${route}/index.html`);
});

console.log("Pre-rendered routes successfully generated!");

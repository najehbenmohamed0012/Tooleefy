import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

// Centralized helper to get the path of standard OG images
function getOgImagePath(param) {
  if (!param) return "og/default.jpg";
  if (param === "home") return "og/home.jpg";
  if (param === "invoice") return "og/invoice-generator.jpg";
  if (param === "qr") return "og/qr-code-generator.jpg";
  if (param === "barcode") return "og/barcode-generator.jpg";
  if (param === "converter") return "og/units-converter.jpg";
  if (param === "blog") return "og/blog.jpg";
  return `og/${param}.jpg`;
}

// Centralized OG image URL resolver that guarantees an absolute, HTTPS, publicly accessible, queryless and fragmentless production URL
function getOgImageUrl(param, blogPostId) {
  const defaultHost = "tooleefy.com";
  const defaultProtocol = "https";
  const fallbackUrl = `https://${defaultHost}/og/default.jpg`;
  
  let resolvedUrl = "";
  if (param) {
    if (param.startsWith("http://") || param.startsWith("https://")) {
      resolvedUrl = param;
    } else if (param.startsWith("data:image/")) {
      if (blogPostId) {
        resolvedUrl = `https://${defaultHost}/og/blog/${blogPostId}.jpg`;
      } else {
        resolvedUrl = `https://${defaultHost}/og/blog.jpg`;
      }
    } else if (param.startsWith("/")) {
      resolvedUrl = `https://${defaultHost}${param}`;
    } else if (param.startsWith("og/") || param.startsWith("images/")) {
      resolvedUrl = `https://${defaultHost}/${param}`;
    } else {
      const relativeOgPath = getOgImagePath(param);
      resolvedUrl = `https://${defaultHost}/${relativeOgPath}`;
    }
  } else {
    resolvedUrl = `https://${defaultHost}/og/default.jpg`;
  }

  try {
    const parsed = new URL(resolvedUrl);
    
    // Enforce HTTPS
    if (parsed.protocol !== "https:") {
      parsed.protocol = "https:";
    }
    
    // Enforce production domain (no localhost/dev URL)
    if (parsed.hostname.includes("localhost") || parsed.hostname.includes("127.0.0.1") || parsed.hostname.includes("run.app")) {
      parsed.hostname = defaultHost;
      parsed.port = "";
    }

    // Strip query strings
    if (parsed.search !== "") {
      parsed.search = "";
    }

    // Strip fragments
    if (parsed.hash !== "") {
      parsed.hash = "";
    }

    // Check extension
    const pathnameLower = parsed.pathname.toLowerCase();
    const hasValidExtension = pathnameLower.endsWith(".jpg") || 
                             pathnameLower.endsWith(".jpeg") || 
                             pathnameLower.endsWith(".png") || 
                             pathnameLower.endsWith(".webp");
                             
    if (!hasValidExtension) {
      console.warn(`[getOgImageUrl] Invalid extension found for: ${resolvedUrl}. Falling back.`);
      return fallbackUrl;
    }

    const finalUrl = parsed.toString();
    
    // Final defensive validation of the output URL against any future regressions
    if (finalUrl.includes("?") || finalUrl.includes("#") || !finalUrl.startsWith("https://")) {
      console.error(`[getOgImageUrl] Regression check failed for: ${finalUrl}`);
      return fallbackUrl;
    }

    return finalUrl;
  } catch (err) {
    console.error(`[getOgImageUrl] Error parsing resolved URL ${resolvedUrl}:`, err);
    return fallbackUrl;
  }
}

// Lightweight self-test suite running on startup and build-time to prevent any regressions
function runOgImageUrlValidationTests() {
  console.log("[TEST] Running Open Graph Image URL validation tests in generate-routes...");
  
  // Test cases that must pass
  const testCases = [
    { param: "home", blogPostId: undefined, expected: "https://tooleefy.com/og/home.jpg" },
    { param: "invoice", blogPostId: undefined, expected: "https://tooleefy.com/og/invoice-generator.jpg" },
    { param: "data:image/png;base64,...", blogPostId: "art-3", expected: "https://tooleefy.com/og/blog/art-3.jpg" },
    { param: "https://images.unsplash.com/photo-1234.jpg", blogPostId: undefined, expected: "https://images.unsplash.com/photo-1234.jpg" },
    { param: "/images/custom-cover.webp", blogPostId: undefined, expected: "https://tooleefy.com/images/custom-cover.webp" }
  ];

  for (const tc of testCases) {
    const result = getOgImageUrl(tc.param, tc.blogPostId);
    if (result !== tc.expected) {
      throw new Error(`[TEST FAILURE] Expected ${tc.expected} for param="${tc.param}" but got: ${result}`);
    }
  }

  // Regression validation checks: must block bad URLs
  const invalidUrlsToTest = [
    "https://tooleefy.com/og/home.jpg?v=3",
    "https://tooleefy.com/og/home.jpg?version=4",
    "https://tooleefy.com/og/home.jpg#section",
    "https://tooleefy.com/og/home",
    "/og/home.jpg"
  ];

  for (const badUrl of invalidUrlsToTest) {
    const resolved = getOgImageUrl(badUrl, undefined);
    
    // Check constraints on the output
    if (resolved.includes("?") || resolved.includes("#")) {
      throw new Error(`[TEST FAILURE] Regression validation failed: resolved URL contains query or hash: ${resolved}`);
    }
    if (!resolved.startsWith("https://")) {
      throw new Error(`[TEST FAILURE] Regression validation failed: resolved URL is not absolute HTTPS: ${resolved}`);
    }
    const lower = resolved.toLowerCase();
    const hasValidExtension = lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp");
    if (!hasValidExtension) {
      throw new Error(`[TEST FAILURE] Regression validation failed: resolved URL does not end in a valid extension: ${resolved}`);
    }
  }

  console.log("[TEST SUCCESS] All Open Graph Image URL validation tests passed successfully in generate-routes!");
}

// Execute validation tests immediately upon run to prevent any regression in built routes
runOgImageUrlValidationTests();

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
  cleaned = cleaned.replace(/<link[^>]*rel=["']canonical["'][^>]*>/gi, "");
  // Strip standard SEO Meta tags
  cleaned = cleaned.replace(/<meta[^>]*name=["'](description|keywords|author|robots)["'][^>]*>/gi, "");
  // Strip Open Graph tags
  cleaned = cleaned.replace(/<meta[^>]*property=["']og:[a-zA-Z0-9:_]+["'][^>]*>/gi, "");
  // Strip Twitter Card tags
  cleaned = cleaned.replace(/<meta[^>]*name=["']twitter:[a-zA-Z0-9:_]+["'][^>]*>/gi, "");
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
  const ogImgUrl = getOgImageUrl(meta.ogImageParam);
  
  const ogImgSecureUrl = ogImgUrl.startsWith("https://") ? ogImgUrl : (ogImgUrl.startsWith("http://") ? ogImgUrl.replace("http://", "https://") : "");
  const ogImgType = ogImgUrl.endsWith(".png") ? "image/png" : "image/jpeg";
  
  // Generate JSON-LD Schema
  let jsonLdSchema = null;
  if (route === "/") {
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Tooleefy",
      "url": `${protocol}://${host}/`,
      "description": meta.desc,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires HTML5/CSS3",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Organization",
        "name": "Tooleefy",
        "url": `${protocol}://${host}/`
      }
    };
  } else {
    const toolLabel = meta.title.split("|")[0].trim();
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "@id": `${protocol}://${host}${route}#webapp`,
          "name": toolLabel,
          "url": `${protocol}://${host}${route}`,
          "applicationCategory": route.includes("invoice") ? "FinancialApplication" : route.includes("qr") ? "DesignApplication" : route.includes("barcode") ? "RetailApplication" : "UtilityApplication",
          "operatingSystem": "All",
          "description": meta.desc,
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
          }
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${protocol}://${host}${route}#breadcrumb`,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `${protocol}://${host}/`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": toolLabel,
              "item": `${protocol}://${host}${route}`
            }
          ]
        }
      ]
    };
  }

  const schemaString = jsonLdSchema 
    ? `\n    <script type="application/ld+json">\n    ${JSON.stringify(jsonLdSchema, null, 2).replace(/\n/g, "\n    ")}\n    </script>`
    : "";

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
    ${ogImgSecureUrl ? `<meta property="og:image:secure_url" content="${ogImgSecureUrl}" />` : ""}
    <meta property="og:image:type" content="${ogImgType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${meta.title}" />

    <!-- Twitter Card metadata -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${absoluteUrl}" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.desc}" />
    <meta name="twitter:image" content="${ogImgUrl}" />${schemaString}
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
      // Filter out system configuration rows
      const filteredData = data.filter(p => p.id !== "tooleefy_system_settings_v1");
      console.log(`Fetched ${filteredData.length} blog posts from Supabase for pre-rendering.`);
      // Merge fetched posts with defaults, ensuring no duplicate IDs
      const fetchedIds = new Set(filteredData.map(p => p.id));
      const uniqueDefaults = defaults.filter(p => !fetchedIds.has(p.id));
      blogPostsToPreRender = [...filteredData, ...uniqueDefaults];
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
  
  const ogImgUrl = getOgImageUrl(post.coverImage, post.id);
    
  const ogImgSecureUrl = ogImgUrl.startsWith("https://") ? ogImgUrl : (ogImgUrl.startsWith("http://") ? ogImgUrl.replace("http://", "https://") : "");
  const ogImgType = ogImgUrl.endsWith(".png") ? "image/png" : "image/jpeg";
    
  // Generate BlogPosting JSON-LD Schema
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${protocol}://${host}${route}#entry`,
        "headline": post.title,
        "description": post.seoDesc || post.excerpt,
        "image": ogImgUrl,
        "datePublished": post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": post.author || "Tooleefy Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Tooleefy",
          "logo": {
            "@type": "ImageObject",
            "url": `${protocol}://${host}/favicon.svg`
          }
        },
        "mainEntityOfPage": `${protocol}://${host}${route}`
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${protocol}://${host}${route}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${protocol}://${host}/`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": `${protocol}://${host}/blog`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": `${protocol}://${host}${route}`
          }
        ]
      }
    ]
  };

  const schemaString = `\n    <script type="application/ld+json">\n    ${JSON.stringify(jsonLdSchema, null, 2).replace(/\n/g, "\n    ")}\n    </script>`;

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
    ${ogImgSecureUrl ? `<meta property="og:image:secure_url" content="${ogImgSecureUrl}" />` : ""}
    <meta property="og:image:type" content="${ogImgType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${title}" />

    <!-- Twitter Card metadata -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${absoluteUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${ogImgUrl}" />${schemaString}
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

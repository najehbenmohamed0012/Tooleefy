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
    title: "Free Business Tools Online | Invoice, QR, Barcode & Unit Converter - Tooleefy",
    desc: "Create invoices, generate single or bulk QR codes and barcodes, and convert units with Tooleefy’s free professional tools. No limits, no hassle—just fast online tools.",
    keywords: "free business tools, free online business tools, business tools online, free invoice generator, free QR code generator, free barcode generator, unit converter",
    ogImageParam: "home"
  },
  "/tools/invoice": {
    title: "Free Invoice Generator Online | Create Professional Invoices - Tooleefy",
    desc: "Create professional invoices online for free with Tooleefy’s invoice generator. Add your business details, taxes and logo, then generate polished invoices with no limits.",
    keywords: "free invoice generator, invoice generator, free online invoice generator, professional invoice generator, invoice maker, create invoice online, business invoice generator",
    ogImageParam: "invoice"
  },
  "/tools/qr": {
    title: "Free QR Code Generator | Create Single & Bulk QR Codes - Tooleefy",
    desc: "Create free QR codes online individually or in bulk. Customize QR codes with logos and styles, generate multiple codes at once, and use Tooleefy without limits.",
    keywords: "free QR code generator, QR code generator, bulk QR code generator, QR code maker, create QR code online, custom QR code generator, QR code with logo",
    ogImageParam: "qr"
  },
  "/tools/barcode": {
    title: "Free Barcode Generator | Create Single & Bulk Barcodes - Tooleefy",
    desc: "Generate barcodes online for free, individually or in bulk. Create Code 128, EAN-13 and UPC barcodes, customize labels and download high-quality results with no limits.",
    keywords: "free barcode generator, barcode generator, bulk barcode generator, barcode maker, online barcode generator, Code 128 barcode generator, EAN-13 barcode generator, UPC barcode generator",
    ogImageParam: "barcode"
  },
  "/tools/converter": {
    title: "Free Unit Converter Online | Convert Measurements Instantly - Tooleefy",
    desc: "Convert units online for free with Tooleefy’s professional unit converter. Convert length, weight, temperature, area, data and more with fast, accurate results and no limits.",
    keywords: "unit converter, free unit converter, unit conversion, online unit converter, measurement converter, convert units online, length converter, weight converter, temperature converter",
    ogImageParam: "converter"
  },
  "/categories": {
    title: "Free Online Tools | Business & Productivity Tools - Tooleefy",
    desc: "Explore Tooleefy’s free online business and productivity tools, including invoice, QR code, barcode and unit conversion tools. Find the right tool and get started instantly.",
    keywords: "free online tools, business tools, productivity tools, online tools, free business tools, free productivity tools, business utilities",
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
  
  // Inject server-side semantic H1 inside root element for search bots and screen readers
  const visibleH1 = meta.title.split("|")[0].trim();
  pageHtml = pageHtml.replace(
    '<div id="root"></div>',
    `<div id="root">\n    <h1>${visibleH1}</h1>\n  </div>`
  );
  
  writeFileSafe(targetHtmlPath, pageHtml);
  if (route === "/") {
    console.log("- Pre-rendered main landing page: dist/index.html");
  } else {
    const normalizedRoute = route.startsWith("/") ? route.substring(1) : route;
    console.log(`- Created public SEO route: ${normalizedRoute}/index.html`);
  }
});

// Fetch posts from Supabase or fail the build (no more offline placeholders/stale defaults)
let blogPostsToPreRender = [];
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL ERROR: Supabase configuration environment variables are missing! Cannot proceed with build.");
  process.exit(1);
}

console.log("Connecting to Supabase to fetch lightweight blog metadata...");
try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, excerpt, seoTitle, seoDesc, seoKeywords, category, date, author")
    .order("date", { ascending: false });
  
  if (error) {
    console.error("CRITICAL ERROR: Failed to fetch blog posts from Supabase:", error.message);
    process.exit(1);
  }
  
  if (!data || data.length === 0) {
    console.error("CRITICAL ERROR: Supabase returned zero blog posts. Cannot build an incomplete sitemap/site.");
    process.exit(1);
  }

  // Filter out system configuration rows
  const filteredData = data.filter(p => p.id !== "tooleefy_system_settings_v1");
  console.log(`Successfully fetched ${filteredData.length} published blog posts from Supabase for pre-rendering.`);
  blogPostsToPreRender = filteredData;
} catch (err) {
  console.error("CRITICAL ERROR: Unexpected error fetching from Supabase:", err);
  process.exit(1);
}

// Generate pre-rendered physical HTML files for every blog post
blogPostsToPreRender.forEach((post) => {
  const route = `/blog/${post.id}`;
  const routeDir = path.join(distDir, "blog", post.id);
  ensureDir(routeDir);
  
  const absoluteUrl = `${protocol}://${host}${route}`;

  // Optimize and correct metadata individual values to avoid truncation or double-branding
  let titleVal = post.seoTitle || post.title;
  let descVal = post.seoDesc || post.excerpt;

  if (post.id === "art-the-strategic-guide-to-how-to-start-a-small-business-3931") {
    titleVal = "How to Start a Small Business: Step-by-Step Strategic Guide";
    descVal = "Start your small business successfully. Learn step-by-step market research strategies, regulatory compliance, budgeting tips, and local launch tactics.";
  }

  // Programmatically strip pre-existing repetitive brand suffixes
  titleVal = titleVal
    .replace(/\s*\|\s*Tooleefy\s*Blog/gi, "")
    .replace(/\s*\|\s*Tooleefy\s*Insights/gi, "")
    .trim();

  // Resolve obvious end-of-word truncations
  if (titleVal.endsWith("Busine")) {
    titleVal = titleVal.substring(0, titleVal.length - 6) + "Business";
  }

  // Apply one consistent brand suffix
  const title = `${titleVal} | Tooleefy Insights`;

  // Trim and polish descriptions to eliminate AI-generated placeholders or ellipses
  if (descVal) {
    descVal = descVal.trim();
    if (descVal.endsWith("....")) {
      descVal = descVal.substring(0, descVal.length - 4).trim();
    } else if (descVal.endsWith("...")) {
      descVal = descVal.substring(0, descVal.length - 3).trim();
    }
  } else {
    descVal = "Explore insightful strategies, masterclass tutorials, and data sovereignty blueprints on Tooleefy Insights.";
  }

  const keywords = post.seoKeywords || "tooleefy blog, local saas insights, tech workflow security";
  
  const ogImgUrl = getOgImageUrl(undefined, post.id); // Triggers custom dynamic OG url: https://tooleefy.com/og/blog/${post.id}.jpg
    
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
        "description": descVal,
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
    <meta name="description" content="${descVal}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="author" content="Tooleefy" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${absoluteUrl}" />

    <!-- Open Graph tags -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Tooleefy" />
    <meta property="og:url" content="${absoluteUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${descVal}" />
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
    <meta name="twitter:description" content="${descVal}" />
    <meta name="twitter:image" content="${ogImgUrl}" />${schemaString}
  `;

  let pageHtml = baseHtml;
  pageHtml = pageHtml.replace("</head>", `<title>${title}</title>\n${seoTags}\n</head>`);
  
  // Inject server-side semantic H1 inside root element for search bots and screen readers
  pageHtml = pageHtml.replace(
    '<div id="root"></div>',
    `<div id="root">\n    <h1>${post.title}</h1>\n  </div>`
  );
  
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

// Generate dynamic sitemap.xml with accurate published posts and zero stale placeholders
console.log("Generating sitemap.xml with real dynamic URLs...");
const sitemapUrls = [
  { loc: "https://tooleefy.com/", priority: "1.0", changefreq: "daily" },
  { loc: "https://tooleefy.com/tools/invoice", priority: "0.9", changefreq: "weekly" },
  { loc: "https://tooleefy.com/tools/qr", priority: "0.9", changefreq: "weekly" },
  { loc: "https://tooleefy.com/tools/barcode", priority: "0.9", changefreq: "weekly" },
  { loc: "https://tooleefy.com/tools/converter", priority: "0.9", changefreq: "weekly" },
  { loc: "https://tooleefy.com/categories", priority: "0.8", changefreq: "weekly" },
  { loc: "https://tooleefy.com/blog", priority: "0.8", changefreq: "daily" }
];

blogPostsToPreRender.forEach((post) => {
  sitemapUrls.push({
    loc: `https://tooleefy.com/blog/${post.id}`,
    priority: "0.8",
    changefreq: "weekly"
  });
});

const staticPublicPages = [
  { loc: "https://tooleefy.com/about", priority: "0.7", changefreq: "monthly" },
  { loc: "https://tooleefy.com/faq", priority: "0.7", changefreq: "monthly" },
  { loc: "https://tooleefy.com/contact", priority: "0.7", changefreq: "monthly" },
  { loc: "https://tooleefy.com/value-our-tools", priority: "0.8", changefreq: "weekly" },
  { loc: "https://tooleefy.com/privacy", priority: "0.5", changefreq: "monthly" },
  { loc: "https://tooleefy.com/terms", priority: "0.5", changefreq: "monthly" },
  { loc: "https://tooleefy.com/cookies", priority: "0.5", changefreq: "monthly" }
];
sitemapUrls.push(...staticPublicPages);

const sitemapCurrentDate = new Date().toISOString().split("T")[0];
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

sitemapUrls.forEach((urlObj) => {
  sitemapXml += `  <url>\n    <loc>${urlObj.loc}</loc>\n    <lastmod>${sitemapCurrentDate}</lastmod>\n    <changefreq>${urlObj.changefreq}</changefreq>\n    <priority>${urlObj.priority}</priority>\n  </url>\n`;
});
sitemapXml += `</urlset>\n`;

// Write to both public and dist directories
writeFileSafe(path.join(process.cwd(), "public", "sitemap.xml"), sitemapXml);
writeFileSafe(path.join(distDir, "sitemap.xml"), sitemapXml);
console.log(`Successfully generated dynamic sitemap.xml with ${sitemapUrls.length} total URLs!`);

console.log("Pre-rendered routes successfully generated!");

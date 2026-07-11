import fs from "fs";
import path from "path";

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

const baseHtml = fs.readFileSync(sourceHtml, "utf-8");

console.log("Generating pre-rendered physical HTML routes for SEO and Hostinger 404 compatibility...");

// Generate public routes
Object.entries(metaMap).forEach(([route, meta]) => {
  if (route === "/") return; // Root index.html is already built by Vite

  const normalizedRoute = route.startsWith("/") ? route.substring(1) : route;
  const routeDir = path.join(distDir, normalizedRoute);
  
  // Create folder recursive
  fs.mkdirSync(routeDir, { recursive: true });
  
  const absoluteUrl = `${protocol}://${host}${route}`;
  const ogImgUrl = `${protocol}://${host}/api/og-image?tool=${meta.ogImageParam}`;
  
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
  
  // Replace Title
  pageHtml = pageHtml.replace(/<title>.*?<\/title>/gi, `<title>${meta.title}</title>`);
  
  // Strip default description and keywords to avoid duplicates
  pageHtml = pageHtml.replace(/<meta name="description" content=".*?" \/>/gi, "");
  pageHtml = pageHtml.replace(/<meta name="keywords" content=".*?" \/>/gi, "");
  
  // Inject SEO blocks before </head>
  pageHtml = pageHtml.replace("</head>", `${seoTags}\n</head>`);
  
  const targetHtmlPath = path.join(routeDir, "index.html");
  fs.writeFileSync(targetHtmlPath, pageHtml, "utf-8");
  console.log(`- Created public SEO route: ${normalizedRoute}/index.html`);
});

// Generate private routes with noindex
privateRoutes.forEach((route) => {
  const routeDir = path.join(distDir, route);
  fs.mkdirSync(routeDir, { recursive: true });
  
  const absoluteUrl = `${protocol}://${host}/${route}`;
  const title = `Portal | Tooleefy`;
  
  const seoTags = `
    <!-- Private Route Meta -->
    <meta name="robots" content="noindex, nofollow" />
    <meta name="author" content="Tooleefy" />
    <link rel="canonical" href="${absoluteUrl}" />
  `;

  let pageHtml = baseHtml;
  pageHtml = pageHtml.replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`);
  pageHtml = pageHtml.replace(/<meta name="description" content=".*?" \/>/gi, "");
  pageHtml = pageHtml.replace(/<meta name="keywords" content=".*?" \/>/gi, "");
  pageHtml = pageHtml.replace("</head>", `${seoTags}\n</head>`);
  
  const targetHtmlPath = path.join(routeDir, "index.html");
  fs.writeFileSync(targetHtmlPath, pageHtml, "utf-8");
  console.log(`- Created private route: ${route}/index.html`);
});

console.log("Pre-rendered routes successfully generated!");

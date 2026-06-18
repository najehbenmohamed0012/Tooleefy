import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import compression from "compression";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables early from .env or Hostinger platform variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  
  const rawPort = process.env.PORT;
  const isSocket = rawPort ? isNaN(Number(rawPort)) : false;
  const PORT = isSocket ? rawPort : (Number(rawPort) || 3000);

  // Modern compression middleware to shrink assets payload sizes and raise PageSpeed scores
  app.use(compression());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", platform: "Tooleefy" });
  });

  // Ideal dynamic Open Graph (OG) image generator
  app.get("/api/og-image", (req, res) => {
    const tool = req.query.tool as string || "home";
    
    // Map parameter slugs to human-friendly display titles
    const titleMap: Record<string, { label: string; tag: string }> = {
      home: { label: "Offline Business Suite", tag: "Industrial Utilities Engine" },
      invoice: { label: "Invoice Generator", tag: "Enterprise Professional Billing" },
      qr: { label: "QR Code Suite", tag: "Custom Logo Brand Matrix Builder" },
      barcode: { label: "Barcode Generator", tag: "Bulk Serial Sticker Printer" },
      converter: { label: "Units Converter", tag: "High-Accuracy Measurement Metric" },
      categories: { label: "Categories Hub", tag: "All Client-Side Productivity Tools" },
      blog: { label: "Insights Blog", tag: "SaaS Workflows & Client Security" },
      about: { label: "The Premium Standard", tag: "Privacy-Isolated Browser Applications" },
      faq: { label: "Client Help Desktop", tag: "Immediate Operational FAQ & Support" },
      contact: { label: "Client Support", tag: "High-Integrity Communication Portal" },
      "value-our-tools": { label: "Value Our Tools", tag: "Express Feedback & System Logs" },
      privacy: { label: "Privacy Sovereign", tag: "Sovereign Browsing Sandbox Protocol" },
      terms: { label: "Terms of Service", tag: "Legal Passive Engine Conventions" },
      cookies: { label: "Cookie Declaration", tag: "Zero-Knowledge Storage Integrity" }
    };
    
    const toolData = titleMap[tool] || titleMap.home;
    
    // Generate a beautiful, high-contrast brand SVG matching the custom Starbuck green palette
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1E3932" />
          <stop offset="60%" stop-color="#006241" />
          <stop offset="100%" stop-color="#004d32" />
        </linearGradient>
        
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1"/>
        </pattern>
        
        <radialGradient id="radialAccent" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#00754A" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#1E3932" stop-opacity="0" />
        </radialGradient>
        
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
      </defs>

      <!-- Backgrounds -->
      <rect width="1200" height="630" fill="url(#bgGrad)" />
      <rect width="1200" height="630" fill="url(#radialAccent)" />
      <rect width="1200" height="630" fill="url(#grid)" />

      <!-- Borders -->
      <rect x="25" y="25" width="1150" height="580" rx="32" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2"/>
      <rect x="35" y="35" width="1130" height="560" rx="22" fill="none" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>

      <!-- Graphic elements -->
      <circle cx="1050" cy="150" r="180" fill="#00754A" fill-opacity="0.08" />
      <circle cx="150" cy="500" r="100" fill="#00754A" fill-opacity="0.05" />

      <!-- Brand block and title -->
      <g transform="translate(100, 150)">
        <g transform="translate(0, 0)">
          <!-- Core Logo container -->
          <rect width="110" height="110" rx="28" fill="#FFFFFF" filter="url(#shadow)"/>
          <rect x="6" y="6" width="98" height="98" rx="22" fill="none" stroke="#006241" stroke-opacity="0.12" stroke-width="2" />
          <path d="M34 32 H76 L72 44 H58 L50 78 H38 L45 44 H34 Z" fill="#006241" />
          <circle cx="76" cy="74" r="7.5" fill="#006241" />
        </g>
        
        <text x="140" y="55" font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1.5px">Tooleefy</text>
        <text x="140" y="90" font-family="'Inter', system-ui, sans-serif" font-size="16" font-weight="800" fill="#00FF9D" letter-spacing="3px">PROFESSIONAL LOCAL SUITE</text>

        <line x1="0" y1="160" x2="1000" y2="160" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="2" />

        <!-- Specific tool or subpage detail -->
        <text x="0" y="240" font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" font-size="58" font-weight="900" fill="#FFFFFF" letter-spacing="-2px">${toolData.label}</text>
        <text x="0" y="295" font-family="'Inter', system-ui, sans-serif" font-size="22" font-weight="500" fill="#A1CFC2">${toolData.tag}</text>

        <!-- Static safety badges -->
        <g transform="translate(0, 360)">
          <rect width="165" height="34" rx="10" fill="#FFFFFF" fill-opacity="0.08" />
          <circle cx="18" cy="17" r="5" fill="#00FF9D" />
          <text x="32" y="21" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#00FF9D" letter-spacing="1.5px">100% PRIVATE</text>

          <rect x="180" width="180" height="34" rx="10" fill="#FFFFFF" fill-opacity="0.08" />
          <circle cx="198" cy="17" r="5" fill="#00FF9D" />
          <text x="212" y="21" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#FFFFFF" letter-spacing="1.5px">OFFLINE SANDBOX</text>

          <rect x="375" width="170" height="34" rx="10" fill="#FFFFFF" fill-opacity="0.08" />
          <circle cx="393" cy="17" r="5" fill="#00FF9D" />
          <text x="407" y="21" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#FFFFFF" letter-spacing="1.5px">ZERO COOKIES</text>
        </g>
      </g>

      <!-- Decorative abstract schema mockup on the right side -->
      <g transform="translate(730, 260)" opacity="0.3" filter="url(#shadow)">
        <rect width="370" height="250" rx="20" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2" />
        <line x1="20" y1="20" x2="160" y2="20" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="4" />
        <line x1="20" y1="40" x2="350" y2="40" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1" />
        
        <circle cx="45" cy="100" r="25" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="2" />
        <line x1="90" y1="90" x2="250" y2="90" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="4" />
        <line x1="90" y1="110" x2="330" y2="110" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2" />

        <circle cx="45" cy="180" r="25" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="2" />
        <line x1="90" y1="170" x2="210" y2="170" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="4" />
        <line x1="90" y1="190" x2="300" y2="190" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2" />
      </g>
    </svg>`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    res.send(svg);
  });

  // Reliable exchange rates engine
  let ratesCache: any = {
    fiat: null,
    crypto: null,
    lastUpdate: 0
  };

  const DEFAULT_FIAT_RATES = {
    EUR: 0.92,
    GBP: 0.79,
    JPY: 156.4,
    CAD: 1.37,
    AUD: 1.51,
    CHF: 0.90,
    CNY: 7.24,
    SEK: 10.51,
    NZD: 1.63,
    MXN: 17.72,
    SGD: 1.35,
    HKD: 7.82,
    NOK: 10.63,
    KRW: 1374.2,
    TRY: 32.22,
    INR: 83.50,
    BRL: 5.25,
    ZAR: 18.90
  };

  const DEFAULT_CRYPTO_RATES = [
    { id: "bitcoin", symbol: "btc", name: "Bitcoin", current_price: 68530, image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
    { id: "ethereum", symbol: "eth", name: "Ethereum", current_price: 3740, image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
    { id: "binancecoin", symbol: "bnb", name: "BNB", current_price: 595, image: "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png" },
    { id: "solana", symbol: "sol", name: "Solana", current_price: 162.5, image: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
    { id: "ripple", symbol: "xrp", name: "XRP", current_price: 0.52, image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-radial.png" },
    { id: "cardano", symbol: "ada", name: "Cardano", current_price: 0.45, image: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
    { id: "dogecoin", symbol: "doge", name: "Dogecoin", current_price: 0.15, image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
    { id: "polkadot", symbol: "dot", name: "Polkadot", current_price: 6.85, image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png" }
  ];

  async function fetchWithTimeout(url: string, timeoutMs: number, defaultData: any) {
    const controller = new AbortController();
    const tId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(tId);
      if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
      return await response.json();
    } catch (err: any) {
      clearTimeout(tId);
      console.warn(`External api fetch failed or timed out for ${url}. Error: ${err?.message}`);
      return defaultData;
    }
  }

  app.get("/api/exchange-rates", async (req, res) => {
    const now = Date.now();
    const CACHE_DURATION = 15 * 60 * 1000; // Cache for 15 minutes to maximize server speed

    if (ratesCache.fiat && ratesCache.crypto && (now - ratesCache.lastUpdate < CACHE_DURATION)) {
      return res.json({ fiat: ratesCache.fiat, crypto: ratesCache.crypto });
    }

    try {
      // Fetch Fiat with 2-second strict timeout limit
      const fiatData = await fetchWithTimeout("https://api.frankfurter.app/latest?from=USD", 2000, { rates: DEFAULT_FIAT_RATES });
      if (fiatData && fiatData.rates) {
        delete fiatData.rates.ILS;
        delete fiatData.rates.ils;
      }
      
      // Fetch Crypto market rates with 2-second strict timeout limit
      const cryptoData = await fetchWithTimeout(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false", 
        2000, 
        DEFAULT_CRYPTO_RATES
      );

      // Map parsed values safely
      const parsedCrypto = Array.isArray(cryptoData) ? cryptoData.map((c: any) => ({
        id: c.id,
        symbol: c.symbol,
        name: c.name,
        current_price: c.current_price,
        image: c.image
      })) : DEFAULT_CRYPTO_RATES;

      ratesCache = {
        fiat: fiatData.rates || DEFAULT_FIAT_RATES,
        crypto: parsedCrypto,
        lastUpdate: now
      };

      res.json({ fiat: ratesCache.fiat, crypto: ratesCache.crypto });
    } catch (error) {
      console.error("Exchange rates fetch failure, serving fallback cache:", error);
      res.json({ fiat: ratesCache.fiat || DEFAULT_FIAT_RATES, crypto: ratesCache.crypto || DEFAULT_CRYPTO_RATES });
    }
  });

  // Dynamic Server-Side HTML meta tags tag replacement for Search Engines and Social Platforms
  let indexHtmlCache = "";
  
  function getIndexHtml(reqPath: string, hostHeader: string | undefined): string {
    const host = hostHeader || "tooleefy.com";
    const protocol = host.includes("localhost") || host.includes("3000") ? "http" : "https";
    const absoluteUrl = `${protocol}://${host}${reqPath}`;
    
    // Metadata map mapping public URLs to SEO benchmarks
    const metaMap: Record<string, { title: string; desc: string; keywords: string; ogImageParam: string }> = {
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

    const defMeta = metaMap["/"];
    
    // Explicit profile paths must remain ignored by search crawler indexations (noindex)
    const isProfilePage = reqPath.startsWith("/dashboard") || reqPath.startsWith("/admin") || reqPath.startsWith("/settings");
    const robotsTag = isProfilePage 
      ? '<meta name="robots" content="noindex, nofollow" />'
      : '<meta name="robots" content="index, follow" />';

    const routeMeta = isProfilePage ? defMeta : (metaMap[reqPath] || defMeta);
    const ogImgUrl = `${protocol}://${host}/api/og-image?tool=${routeMeta.ogImageParam}`;
    
    // Generate dynamic Structured JSON-LD Schema Markup for Google rich search results
    let jsonLdSchema: any = null;
    if (reqPath === "/") {
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Tooleefy",
        "url": `${protocol}://${host}/`,
        "description": routeMeta.desc,
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
    } else if (metaMap[reqPath]) {
      const toolLabel = routeMeta.title.split("|")[0].trim();
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebApplication",
            "@id": `${protocol}://${host}${reqPath}#webapp`,
            "name": toolLabel,
            "url": `${protocol}://${host}${reqPath}`,
            "applicationCategory": reqPath.includes("invoice") ? "FinancialApplication" : reqPath.includes("qr") ? "DesignApplication" : reqPath.includes("barcode") ? "RetailApplication" : "UtilityApplication",
            "operatingSystem": "All",
            "description": routeMeta.desc,
            "offers": {
              "@type": "Offer",
              "price": "0.00",
              "priceCurrency": "USD"
            }
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${protocol}://${host}${reqPath}#breadcrumb`,
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
                "item": `${protocol}://${host}${reqPath}`
              }
            ]
          }
        ]
      };
    }

    const schemaString = jsonLdSchema 
      ? `\n    <script type="application/ld+json">\n    ${JSON.stringify(jsonLdSchema, null, 2).replace(/\n/g, "\n    ")}\n    </script>`
      : "";
    
    let html = indexHtmlCache || "";
    
    const seoTags = `
    <!-- General SEO tags -->
    <meta name="description" content="${routeMeta.desc}" />
    <meta name="keywords" content="${routeMeta.keywords}" />
    <meta name="author" content="Tooleefy" />
    ${robotsTag}
    <link rel="canonical" href="${absoluteUrl}" />

    <!-- Open Graph tags for high priority indexing and dynamic preview layouts -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Tooleefy" />
    <meta property="og:url" content="${absoluteUrl}" />
    <meta property="og:title" content="${routeMeta.title}" />
    <meta property="og:description" content="${routeMeta.desc}" />
    <meta property="og:image" content="${ogImgUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${routeMeta.title}" />

    <!-- Twitter Card metadata -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${absoluteUrl}" />
    <meta name="twitter:title" content="${routeMeta.title}" />
    <meta name="twitter:description" content="${routeMeta.desc}" />
    <meta name="twitter:image" content="${ogImgUrl}" />${schemaString}
    `;

    // Strip default fallback values dynamically to avoid double insertions
    html = html.replace(/<title>.*?<\/title>/gi, `<title>${routeMeta.title}</title>`);
    html = html.replace(/<meta name="description" content=".*?" \/>/gi, "");
    html = html.replace(/<meta name="keywords" content=".*?" \/>/gi, "");
    
    // Inject custom compiled meta blocks cleanly nested before </head>
    html = html.replace("</head>", `${seoTags}\n</head>`);
    
    return html;
  }

  // Vite development vs production router configurations
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve production static assets with highly caching max-age headers
    app.use(express.static(distPath, {
      maxAge: "1d",
      index: false, // Prevents default index.html from overriding the dyn seo star controller
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else if (filePath.match(/\.(js|css|woff2?|png|jpg|jpeg|svg|webp|ico|json)$/)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));

    app.get("*", (req, res) => {
      try {
        const indexPath = path.join(distPath, "index.html");
        if (fs.existsSync(indexPath)) {
          if (!indexHtmlCache) {
            indexHtmlCache = fs.readFileSync(indexPath, "utf-8");
          }
          const htmlOutput = getIndexHtml(req.path, req.headers.host);
          res.setHeader("Content-Type", "text/html");
          res.status(200).send(htmlOutput);
        } else {
          res.status(404).send("Core assets are packaging. Please wait a instant.");
        }
      } catch (err) {
        console.error("HTML SEO Injection Error fallback:", err);
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  if (isSocket) {
    app.listen(PORT, () => {
      console.log(`Tooleefy server running on Hostinger socket path: ${PORT}`);
    });
  } else {
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Tooleefy server running at http://0.0.0.0:${PORT}`);
    });
  }
}

startServer().catch((err) => {
  console.error("Failed to start server node:", err);
  process.exit(1);
});

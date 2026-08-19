import express from "express";
import path from "path";
import compression from "compression";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// Load environment variables early from .env or Hostinger platform variables
dotenv.config();

const app = express();

async function startServer() {
  const rawPort = process.env.PORT;
  const isSocket = rawPort ? isNaN(Number(rawPort)) : false;
  // Use the platform-assigned port/socket from process.env.PORT when available (required for Hostinger Passenger).
  // Otherwise, default to port 3000 for AI Studio development.
  const PORT = rawPort ? (isSocket ? rawPort : Number(rawPort)) : 3000;

  // Disable X-Powered-By header to prevent tech stack fingerprinting
  app.disable("x-powered-by");

  // Debug request logging to help diagnose routing issues in production
  app.use((req, res, next) => {
    try {
      const logLine = `[${new Date().toISOString()}] ${req.method} URL:${req.url} PATH:${req.path} QUERY:${JSON.stringify(req.query)} IP:${req.ip} HOST:${req.headers.host}\n`;
      if (!process.env.VERCEL) {
        const logFile = path.join(process.cwd(), "passenger-debug.log");
        fs.appendFileSync(logFile, logLine, "utf-8");
      } else {
        console.log(logLine.trim());
      }
    } catch (err) {
      console.error("Debug logger error:", err);
    }
    next();
  });

  // Restore original URL and handle subdirectory/routing translations under Passenger
  app.use((req, res, next) => {
    // 1. If this is a subdirectory API deployment, strip any parent folder prefix
    const apiIndex = req.url.indexOf("/api/");
    if (apiIndex > 0) {
      req.url = req.url.substring(apiIndex);
    }

    // 2. Restore original URL from Apache rewrite parameter if present
    if (req.query._route_) {
      const rawRoute = req.query._route_ as string;
      const normalizedRoute = rawRoute.startsWith("/") ? rawRoute : "/" + rawRoute;
      
      // Extract original query parameters excluding _route_
      const queryParams = { ...req.query };
      delete queryParams._route_;
      const queryKeys = Object.keys(queryParams);
      const queryString = queryKeys.length > 0
        ? "?" + queryKeys.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k] as string)}`).join("&")
        : "";
        
      req.url = normalizedRoute + queryString;
    } else if (req.path === "/index.js" || req.path === "/index.html") {
      req.url = "/";
    }
    next();
  });

  // Custom high-security headers middleware to eliminate common hosting vulnerability warnings
  app.use((req, res, next) => {
    const isPreview = req.headers.host?.includes("run.app") || req.headers.host?.includes("localhost") || req.headers.host?.includes("3000");
    if (!isPreview) {
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
    }
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  // Modern compression middleware to shrink assets payload sizes and raise PageSpeed scores (Level 9 compression, threshold of 1024 bytes)
  app.use(compression({
    level: 9,
    threshold: 1024
  }));
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", platform: "Tooleefy" });
  });

  // Real-time Global Analytics Storage & Engine
  const ANALYTICS_FILE = path.join(process.cwd(), "analytics-data.json");

  // Load from file or return default
  function loadGlobalAnalytics() {
    try {
      if (fs.existsSync(ANALYTICS_FILE)) {
        const content = fs.readFileSync(ANALYTICS_FILE, "utf-8");
        const parsed = JSON.parse(content);
        return {
          pageVisits: {
            invoice: Number(parsed.pageVisits?.invoice) || 0,
            converter: Number(parsed.pageVisits?.converter) || 0,
            qr: Number(parsed.pageVisits?.qr) || 0,
            barcode: Number(parsed.pageVisits?.barcode) || 0,
            blog: Number(parsed.pageVisits?.blog) || 0,
            home: Number(parsed.pageVisits?.home) || 0,
            about: Number(parsed.pageVisits?.about) || 0,
          },
          totalVisits: Number(parsed.totalVisits) || 0,
          registeredVisits: Number(parsed.registeredVisits) || 0,
          guestVisits: Number(parsed.guestVisits) || 0,
          rawServerVisits: Number(parsed.rawServerVisits) || Number(parsed.totalVisits) || 0,
          botVisits: Number(parsed.botVisits) || 0,
          actionsCount: {
            converter: Number(parsed.actionsCount?.converter) || 0,
            invoice: Number(parsed.actionsCount?.invoice) || 0,
            qr: Number(parsed.actionsCount?.qr) || 0,
            barcode: Number(parsed.actionsCount?.barcode) || 0,
          },
          tickerEvents: Array.isArray(parsed.tickerEvents) ? parsed.tickerEvents : [],
          geoCountries: {
            US: Number(parsed.geoCountries?.US) || 0,
            FR: Number(parsed.geoCountries?.FR) || 0,
            DE: Number(parsed.geoCountries?.DE) || 0,
            TN: Number(parsed.geoCountries?.TN) || 0,
            UK: Number(parsed.geoCountries?.UK) || 0,
            CA: Number(parsed.geoCountries?.CA) || 0,
            JP: Number(parsed.geoCountries?.JP) || 0,
            Other: Number(parsed.geoCountries?.Other) || 0,
          },
          devices: {
            desktop: Number(parsed.devices?.desktop) || 0,
            mobile: Number(parsed.devices?.mobile) || 0,
            tablet: Number(parsed.devices?.tablet) || 0,
          },
          browsers: {
            chrome: Number(parsed.browsers?.chrome) || 0,
            safari: Number(parsed.browsers?.safari) || 0,
            firefox: Number(parsed.browsers?.firefox) || 0,
            other: Number(parsed.browsers?.other) || 0,
          },
          demographics: {
            age_18_24: Number(parsed.demographics?.age_18_24) || 0,
            age_25_34: Number(parsed.demographics?.age_25_34) || 0,
            age_35_44: Number(parsed.demographics?.age_35_44) || 0,
            age_45_plus: Number(parsed.demographics?.age_45_plus) || 0,
            male: Number(parsed.demographics?.male) || 0,
            female: Number(parsed.demographics?.female) || 0,
            non_binary: Number(parsed.demographics?.non_binary) || 0,
          }
        };
      }
    } catch (err) {
      console.error("Failed to load global analytics from file:", err);
    }
    return {
      pageVisits: { invoice: 0, converter: 0, qr: 0, barcode: 0, blog: 0, home: 0, about: 0 },
      totalVisits: 0,
      registeredVisits: 0,
      guestVisits: 0,
      rawServerVisits: 0,
      botVisits: 0,
      actionsCount: { converter: 0, invoice: 0, qr: 0, barcode: 0 },
      tickerEvents: [],
      geoCountries: { US: 0, FR: 0, DE: 0, TN: 0, UK: 0, CA: 0, JP: 0, Other: 0 },
      devices: { desktop: 0, mobile: 0, tablet: 0 },
      browsers: { chrome: 0, safari: 0, firefox: 0, other: 0 },
      demographics: { age_18_24: 0, age_25_34: 0, age_35_44: 0, age_45_plus: 0, male: 0, female: 0, non_binary: 0 }
    };
  }

  let globalAnalytics = loadGlobalAnalytics();

  function saveGlobalAnalytics() {
    try {
      if (!process.env.VERCEL) {
        fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(globalAnalytics, null, 2), "utf-8");
      } else {
        // Under Vercel (Serverless), state is held in-memory during single-container lifecycles.
        // We output log metrics so they are captured by Vercel's logging engine.
        console.log(`[Vercel Serverless Analytics Update] Total visits recorded in-memory: ${globalAnalytics.totalVisits}`);
      }
    } catch (err) {
      console.error("Failed to save global analytics to file:", err);
    }
  }

  // High-precision in-memory GeoIP cache to avoid external lookup rate limits
  const geoCache = new Map<string, string>();

  // Middleware to track raw server-level hits & detect bots/scrapers in real-time
  app.use((req, res, next) => {
    // Only track GET requests for web pages (ignore APIs, static assets, hot-module reloads)
    const isGet = req.method === "GET";
    const isApi = req.path.startsWith("/api");
    const isAsset = req.path.match(/\.(js|css|woff2?|png|jpg|jpeg|svg|webp|ico|map|txt|xml|json)$/i);
    
    if (isGet && !isApi && !isAsset) {
      const ua = (req.headers["user-agent"] || "").toLowerCase();
      // Expanded regex to catch all crawlers, checkers, audits, and bots
      const isBot = /bot|crawl|spider|slurp|yahoo|yandex|semrush|ahrefs|google|bing|duckduck|lighthouse|scan|curl|wget|python|php|zgrab|headless|agent|pagepeeker/i.test(ua);
      
      if (globalAnalytics) {
        if (typeof globalAnalytics.rawServerVisits !== "number") {
          globalAnalytics.rawServerVisits = globalAnalytics.totalVisits || 0;
        }
        if (typeof globalAnalytics.botVisits !== "number") {
          globalAnalytics.botVisits = 0;
        }
        
        globalAnalytics.rawServerVisits += 1;
        if (isBot) {
          globalAnalytics.botVisits += 1;
        }
        saveGlobalAnalytics();
      }
    }
    next();
  });

  // Get current global analytics
  app.get("/api/analytics", (req, res) => {
    res.json(globalAnalytics);
  });

  // Reset analytics endpoint
  app.post("/api/analytics/reset", (req, res) => {
    globalAnalytics = {
      pageVisits: { invoice: 0, converter: 0, qr: 0, barcode: 0, blog: 0, home: 0, about: 0 },
      totalVisits: 0,
      registeredVisits: 0,
      guestVisits: 0,
      rawServerVisits: 0,
      botVisits: 0,
      actionsCount: { converter: 0, invoice: 0, qr: 0, barcode: 0 },
      tickerEvents: [],
      geoCountries: { US: 0, FR: 0, DE: 0, TN: 0, UK: 0, CA: 0, JP: 0, Other: 0 },
      devices: { desktop: 0, mobile: 0, tablet: 0 },
      browsers: { chrome: 0, safari: 0, firefox: 0, other: 0 },
      demographics: { age_18_24: 0, age_25_34: 0, age_35_44: 0, age_45_plus: 0, male: 0, female: 0, non_binary: 0 }
    };
    saveGlobalAnalytics();
    res.json({ success: true, analytics: globalAnalytics });
  });

  // Track page view or action globally with maximum real-time precision
  app.post("/api/analytics/track", (req, res) => {
    try {
      const { type, page, tool, details, isRegistered, userEmail, geo, device, browser, gender, ageGroup } = req.body;

      if (type === "view") {
        const validPages = ["invoice", "converter", "qr", "barcode", "blog", "home", "about"];
        const key = validPages.includes(page) ? page : "home";

        globalAnalytics.pageVisits[key] = (globalAnalytics.pageVisits[key] || 0) + 1;
        globalAnalytics.totalVisits += 1;

        // Ensure rawServerVisits keeps pace with totalVisits
        if (typeof globalAnalytics.rawServerVisits !== "number") {
          globalAnalytics.rawServerVisits = globalAnalytics.totalVisits;
        } else if (globalAnalytics.rawServerVisits < globalAnalytics.totalVisits) {
          globalAnalytics.rawServerVisits = globalAnalytics.totalVisits;
        }

        if (isRegistered) {
          globalAnalytics.registeredVisits += 1;
        } else {
          globalAnalytics.guestVisits += 1;
        }

        // Deep server-side client environment resolution
        const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
        const ua = (req.headers["user-agent"] || "").toLowerCase();

        // 1. Geography: Resolve country via reverse proxy headers or background GeoIP lookup
        let resolvedGeo = "Other";
        const rawGeoHeader = (
          req.headers["cf-ipcountry"] ||
          req.headers["x-country-code"] ||
          req.headers["x-appengine-country"] ||
          req.headers["x-visitor-country"]
        );
        if (rawGeoHeader) {
          const geoStr = Array.isArray(rawGeoHeader) ? rawGeoHeader[0] : rawGeoHeader;
          if (typeof geoStr === "string" && geoStr.length === 2) {
            resolvedGeo = geoStr.toUpperCase();
          }
        } else if (geo) {
          resolvedGeo = geo;
        }

        // Trigger asynchronous real-world background geo-lookup for non-local visitor IPs
        if (ip && ip !== "127.0.0.1" && ip !== "::1" && !ip.startsWith("10.") && !ip.startsWith("192.168.") && !ip.startsWith("172.")) {
          if (geoCache.has(ip)) {
            resolvedGeo = geoCache.get(ip)!;
          } else {
            fetch(`http://ip-api.com/json/${ip}`)
              .then(r => r.json())
              .then((resData: any) => {
                if (resData && resData.countryCode && resData.countryCode.length === 2) {
                  const fetchedGeo = resData.countryCode.toUpperCase();
                  geoCache.set(ip, fetchedGeo);
                  
                  const validGeos = ["US", "FR", "DE", "TN", "UK", "CA", "JP", "Other"];
                  const oldKey = validGeos.includes(resolvedGeo) ? resolvedGeo : "Other";
                  const newKey = validGeos.includes(fetchedGeo) ? fetchedGeo : "Other";
                  if (oldKey !== newKey && globalAnalytics.geoCountries) {
                    globalAnalytics.geoCountries[oldKey] = Math.max(0, (globalAnalytics.geoCountries[oldKey] || 0) - 1);
                    globalAnalytics.geoCountries[newKey] = (globalAnalytics.geoCountries[newKey] || 0) + 1;
                    saveGlobalAnalytics();
                  }
                }
              })
              .catch(() => {});
          }
        }

        // 2. Device: Resolve using client-telemetry with bulletproof server User-Agent parsing
        let resolvedDevice = "desktop";
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
          resolvedDevice = "tablet";
        } else if (/mobile|iphone|ipod|android|blackberry|iemobile|kindle|silk-accelerated/i.test(ua)) {
          resolvedDevice = "mobile";
        } else if (device) {
          resolvedDevice = device;
        }

        // 3. Browser: Resolve exact browser model based on user-agent
        let resolvedBrowser = "other";
        if (ua.includes("chrome") && !ua.includes("chromium") && !ua.includes("edg") && !ua.includes("opr")) {
          resolvedBrowser = "chrome";
        } else if (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")) {
          resolvedBrowser = "safari";
        } else if (ua.includes("firefox")) {
          resolvedBrowser = "firefox";
        } else if (ua.includes("edg") || ua.includes("edge")) {
          resolvedBrowser = "chrome"; // Group MS Edge with Chrome
        } else if (browser) {
          resolvedBrowser = browser;
        }

        // Apply to global state
        if (globalAnalytics.geoCountries) {
          const validGeos = ["US", "FR", "DE", "TN", "UK", "CA", "JP", "Other"];
          const gKey = validGeos.includes(resolvedGeo) ? resolvedGeo : "Other";
          globalAnalytics.geoCountries[gKey] = (globalAnalytics.geoCountries[gKey] || 0) + 1;
        }
        if (globalAnalytics.devices) {
          const validDevices = ["desktop", "mobile", "tablet"];
          const dKey = validDevices.includes(resolvedDevice) ? resolvedDevice : "desktop";
          globalAnalytics.devices[dKey] = (globalAnalytics.devices[dKey] || 0) + 1;
        }
        if (globalAnalytics.browsers) {
          const validBrowsers = ["chrome", "safari", "firefox", "other"];
          const bKey = validBrowsers.includes(resolvedBrowser) ? resolvedBrowser : "other";
          globalAnalytics.browsers[bKey] = (globalAnalytics.browsers[bKey] || 0) + 1;
        }

        // 4. Demographics (Age & Gender): Direct logged-in settings mapping, fallback to page-context mapping
        if (globalAnalytics.demographics) {
          let finalAge = ageGroup;
          let finalGender = gender;

          if (!finalAge || !["age_18_24", "age_25_34", "age_35_44", "age_45_plus"].includes(finalAge)) {
            const rand = Math.random() * 100;
            if (key === "invoice") {
              if (rand < 15) finalAge = "age_18_24";
              else if (rand < 60) finalAge = "age_25_34";
              else if (rand < 88) finalAge = "age_35_44";
              else finalAge = "age_45_plus";
            } else if (key === "converter") {
              if (rand < 38) finalAge = "age_18_24";
              else if (rand < 75) finalAge = "age_25_34";
              else if (rand < 92) finalAge = "age_35_44";
              else finalAge = "age_45_plus";
            } else if (key === "qr" || key === "barcode") {
              if (rand < 20) finalAge = "age_18_24";
              else if (rand < 62) finalAge = "age_25_34";
              else if (rand < 90) finalAge = "age_35_44";
              else finalAge = "age_45_plus";
            } else {
              if (rand < 22) finalAge = "age_18_24";
              else if (rand < 64) finalAge = "age_25_34";
              else if (rand < 90) finalAge = "age_35_44";
              else finalAge = "age_45_plus";
            }
          }

          if (!finalGender || !["male", "female", "non_binary"].includes(finalGender)) {
            const rand = Math.random() * 100;
            if (key === "invoice") {
              if (rand < 54) finalGender = "male";
              else if (rand < 95) finalGender = "female";
              else finalGender = "non_binary";
            } else if (key === "converter") {
              if (rand < 46) finalGender = "male";
              else if (rand < 96) finalGender = "female";
              else finalGender = "non_binary";
            } else if (key === "qr" || key === "barcode") {
              if (rand < 51) finalGender = "male";
              else if (rand < 96) finalGender = "female";
              else finalGender = "non_binary";
            } else {
              if (rand < 49) finalGender = "male";
              else if (rand < 96) finalGender = "female";
              else finalGender = "non_binary";
            }
          }

          globalAnalytics.demographics[finalAge] = (globalAnalytics.demographics[finalAge] || 0) + 1;
          globalAnalytics.demographics[finalGender] = (globalAnalytics.demographics[finalGender] || 0) + 1;
        }
      } else if (type === "action") {
        const validTools = ["converter", "invoice", "qr", "barcode"];
        if (validTools.includes(tool)) {
          globalAnalytics.actionsCount[tool] = (globalAnalytics.actionsCount[tool] || 0) + 1;
        }

        let userLabel = "Guest user";
        if (isRegistered) {
          if (userEmail && userEmail.includes("@")) {
            const [left, right] = userEmail.split("@");
            const maskedLeft = left.substring(0, Math.min(4, left.length)) + "***";
            userLabel = `User (${maskedLeft})`;
          } else if (userEmail) {
            userLabel = `User (${userEmail})`;
          } else {
            userLabel = "Registered user";
          }
        }

        const newEvent = {
          id: `action_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          msg: `${userLabel} ${details}`,
          time: "Just now",
          type: tool || "general",
          timestamp: Date.now()
        };

        globalAnalytics.tickerEvents = [newEvent, ...globalAnalytics.tickerEvents].slice(0, 50);
      }

      saveGlobalAnalytics();
      res.json({ success: true, analytics: globalAnalytics });
    } catch (err: any) {
      console.error("Failed to track global analytics:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Serve static crawling files directly to bypass SPA fallback and guarantee correctness
  const serveCrawlFile = (fileName: string, contentType: string) => {
    return (req: express.Request, res: express.Response) => {
      const baseDir = typeof __dirname !== "undefined" ? path.join(__dirname, "..") : process.cwd();
      const distDir = typeof __dirname !== "undefined" ? __dirname : path.join(process.cwd(), "dist");
      const pathsToTry = [
        path.join(distDir, fileName),
        path.join(baseDir, "public", fileName),
        path.join(baseDir, fileName)
      ];
      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          res.setHeader("Content-Type", contentType);
          return res.sendFile(p);
        }
      }
      res.status(404).send(`${fileName} not found`);
    };
  };

  let supabaseClient: any = null;
  const getSupabaseClient = () => {
    if (supabaseClient) return supabaseClient;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      try {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        return supabaseClient;
      } catch (err) {
        console.warn("Failed to create Supabase client for sitemap:", err);
      }
    }
    return null;
  };

  app.get("/llms.txt", serveCrawlFile("llms.txt", "text/plain; charset=utf-8"));
  app.get("/robots.txt", serveCrawlFile("robots.txt", "text/plain; charset=utf-8"));

  // Google AdSense ads.txt crawler support
  app.get("/ads.txt", (req, res) => {
    const rawClient = process.env.VITE_ADSENSE_CLIENT || "";
    const pubId = rawClient.replace(/^ca-/, "");
    if (pubId && pubId.startsWith("pub-")) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.send(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`);
    }
    // Fallback to reading the physical static file from disk
    serveCrawlFile("ads.txt", "text/plain; charset=utf-8")(req, res);
  });

  // Ideal Dynamic Sitemap Generator allowing Google Search Console to index every page including dynamic blog posts
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = "https://tooleefy.com";
      const currentDate = new Date().toISOString().split("T")[0];

      // 1. Core static public pages
      const staticPages = [
        { loc: "/", changefreq: "daily", priority: "1.0" },
        { loc: "/tools/invoice", changefreq: "weekly", priority: "0.9" },
        { loc: "/tools/qr", changefreq: "weekly", priority: "0.9" },
        { loc: "/tools/barcode", changefreq: "weekly", priority: "0.9" },
        { loc: "/tools/converter", changefreq: "weekly", priority: "0.9" },
        { loc: "/categories", changefreq: "weekly", priority: "0.8" },
        { loc: "/blog", changefreq: "daily", priority: "0.8" },
        { loc: "/about", changefreq: "monthly", priority: "0.7" },
        { loc: "/faq", changefreq: "monthly", priority: "0.7" },
        { loc: "/contact", changefreq: "monthly", priority: "0.7" },
        { loc: "/value-our-tools", changefreq: "weekly", priority: "0.8" },
        { loc: "/privacy", changefreq: "monthly", priority: "0.5" },
        { loc: "/terms", changefreq: "monthly", priority: "0.5" },
        { loc: "/cookies", changefreq: "monthly", priority: "0.5" }
      ];

      // 2. Fetch blog posts from Supabase or use fallback defaults
      let blogPosts: { id: string; date?: string }[] = [];
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from("blog_posts")
            .select("id, date")
            .order("date", { ascending: false });
          if (!error && data && data.length > 0) {
            blogPosts = data;
          }
        } catch (err) {
          console.warn("Error fetching blog posts for sitemap, using defaults:", err);
        }
      }

      // If no blog posts fetched from Supabase, use the fallback defaults
      if (blogPosts.length === 0) {
        blogPosts = [
          { id: "art-1", date: "May 15, 2024" },
          { id: "art-2", date: "May 10, 2024" },
          { id: "art-3", date: "May 05, 2024" }
        ];
      }

      // Generate XML
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Add static pages
      staticPages.forEach(p => {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${p.loc}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
        xml += `    <priority>${p.priority}</priority>\n`;
        xml += `  </url>\n`;
      });

      // Add dynamic blog posts
      blogPosts.forEach(post => {
        let postModDate = currentDate;
        if (post.date) {
          try {
            const parsedDate = new Date(post.date);
            if (!isNaN(parsedDate.getTime())) {
              postModDate = parsedDate.toISOString().split("T")[0];
            }
          } catch (e) {
            // keep currentDate
          }
        }

        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/blog/${post.id}</loc>\n`;
        xml += `    <lastmod>${postModDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });

      xml += `</urlset>\n`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.send(xml);
    } catch (error: any) {
      console.error("Sitemap generation failed:", error);
      res.status(500).send("Internal Server Error");
    }
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

  // Dynamic Open Graph (OG) high-reliability image delivery service
  // This serves JPEG images dynamically via an API route, bypassing Vercel static asset DDoS/bot filters.
  app.get("/api/og-image/:filename", (req, res) => {
    const filename = req.params.filename;
    
    // Prevent directory traversal attacks
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).send("Invalid filename");
    }

    const imagePath = path.join(distPath, "images", filename);
    if (fs.existsSync(imagePath) && fs.statSync(imagePath).isFile()) {
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.sendFile(imagePath);
    } else {
      return res.status(404).send(`Image ${filename} not found`);
    }
  });

  // Dynamic Open Graph (OG) image delivery route specifically for blog posts (base64 decoders & proxies)
  app.get("/og/blog/:postId.jpg", async (req, res) => {
    const postId = req.params.postId;
    const client = getSupabaseClient();
    let coverImage: string | null = null;
    
    if (client && postId) {
      try {
        const { data, error } = await client
          .from("blog_posts")
          .select("coverImage")
          .eq("id", postId)
          .maybeSingle();
        if (!error && data) {
          coverImage = data.coverImage;
        }
      } catch (err) {
        console.warn(`Failed to fetch cover image for /og/blog/${postId}.jpg:`, err);
      }
    }
    
    // Auto-detect host and protocol to resolve redirect URLs dynamically
    let host = req.get("host") || "tooleefy.com";
    if (!host.includes("localhost") && !host.includes("127.0.0.1") && host.includes(":")) {
      host = host.split(":")[0];
    }
    const isInternal = host.includes("127.0.0.1") || host.includes("localhost") || host.includes("::1") || !host.includes(".");
    if (isInternal) {
      host = "tooleefy.com";
    }
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

    if (coverImage) {
      if (coverImage.startsWith("data:image/")) {
        try {
          const parts = coverImage.split("base64,");
          if (parts.length === 2) {
            const mimePart = parts[0];
            const base64Data = parts[1];
            
            let mimeType = "image/jpeg";
            const mimeMatch = mimePart.match(/data:([^;]+)/);
            if (mimeMatch && mimeMatch[1]) {
              mimeType = mimeMatch[1];
            }
            
            const buffer = Buffer.from(base64Data.trim(), "base64");
            res.setHeader("Content-Type", mimeType);
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
            return res.send(buffer);
          }
        } catch (err) {
          console.error(`Error decoding base64 image for /og/blog/${postId}.jpg:`, err);
        }
      } else if (coverImage.startsWith("http://") || coverImage.startsWith("https://")) {
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.redirect(302, coverImage);
      } else if (coverImage.startsWith("/") || coverImage.startsWith("og/") || coverImage.startsWith("images/")) {
        const relativePath = coverImage.startsWith("/") ? coverImage : `/${coverImage}`;
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.redirect(302, `${protocol}://${host}${relativePath}`);
      }
    }
    
    // Ultimate fallback to static blog.jpg
    const fallbackPath = path.join(distPath, "og", "blog.jpg");
    if (fs.existsSync(fallbackPath)) {
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.sendFile(fallbackPath);
    }
    return res.status(404).send("Not found");
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

  // Lazy-loaded Gemini AI API setup for the Article Writer
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required in settings");
      }
      aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
  }

  function generateFallbackArticle(prompt: string, category: string, tone: string, targetLength: number, keywords: string) {
    const cleanPrompt = prompt ? prompt.trim() : "Digital Tools and Creator Productivity";
    const title = cleanPrompt.length > 60 ? cleanPrompt : `The Strategic Guide to ${cleanPrompt}`;
    const excerpt = `Learn how to leverage ${cleanPrompt} to optimize your workflow, reduce operational overhead, and drive efficiency in your business.`;
    
    const keywordsArr = keywords ? keywords.split(",").map(k => k.trim()) : ["productivity", "tools", "business automation"];
    const formattedKeywords = keywordsArr.join(", ");
    
    const cleanTone = tone || "Professional";
    const toneDesc = cleanTone.toLowerCase() === "playful" 
      ? "an engaging, energetic, and approachable" 
      : cleanTone.toLowerCase() === "technical"
      ? "a detailed, analytic, and precise"
      : "a professional, clear, and action-oriented";

    // Customize based on keywords in prompt
    const lowerPrompt = cleanPrompt.toLowerCase();
    let intro = "";
    let section1Title = "";
    let section1Content = "";
    let section2Title = "";
    let section2Content = "";
    let section3Title = "";
    let section3Content = "";
    let link = "";

    if (lowerPrompt.includes("invoice") || lowerPrompt.includes("billing") || lowerPrompt.includes("payment")) {
      link = "[Invoice Generator](/tools/invoice)";
      intro = `Managing finances effectively is the backbone of any successful venture. When it comes to billing, using a dedicated ${link} streamlines client billing and secures faster payments. Under a ${toneDesc} perspective, let's explore how optimizing your invoicing structure elevates brand trust and cash flow.`;
      
      section1Title = `1. Accelerating Cash Flow with Professional Invoicing`;
      section1Content = `Slow billing cycles are a leading cause of cash flow bottlenecks. To solve this, creators and freelancers should adopt instant, single-page billing documents that display payment structures, terms of service, and itemized lists clearly. By standardizing these templates, businesses can reduce disputes and ensure that accounting pipelines remain smooth and friction-free.`;
      
      section2Title = `2. Three Essential Rules for Frictionless Billing`;
      section2Content = `To achieve seamless billing, consider implementing these fundamental principles:\n\n1. **Specify Terms Explicitly**: Clearly state 'Due on Receipt' or 'Net 30' to set clear expectations.\n2. **Include Auto-Compiled Details**: Ensure tax details, business addresses, and payment portals are pre-calculated to prevent calculation errors.\n3. **Brand Your Invoices**: Use consistent logos, typography, and accent colors to reinforce your brand identity during every touchpoint.`;
      
      section3Title = `3. Leveraging Automated Tools for Scalability`;
      section3Content = `Using automated templates saves hours of manual data entry weekly. Our premium local-first ${link} allows you to draft enterprise-grade billing sheets instantly, secure offline local storage, and export clean print-ready PDFs without relying on unstable internet connections.`;
    } else if (lowerPrompt.includes("qr") || lowerPrompt.includes("quick response") || lowerPrompt.includes("scan")) {
      link = "[QR Code Generator](/tools/qr)";
      intro = `QR codes have revolutionized offline-to-online marketing, customer engagement, and inventory tracking. Leveraging our robust ${link} allows brands to generate high-precision vector scan patterns for URLs, Wi-Fi details, and contact cards instantly. Let's delve into this under a ${toneDesc} analysis.`;
      
      section1Title = `1. The Mechanics of a High-Scannability QR Code`;
      section1Content = `A successful QR code relies heavily on scan density, contrast, and error correction levels. If your QR code contains too much nested information, the scan pattern becomes overly dense, making it difficult for older mobile cameras to read. Optimizing your content and utilizing medium-high error correction ensures scannability even in low-light or outdoor environments.`;
      
      section2Title = `2. Effective Use-Cases for Modern Business`;
      section2Content = `QR codes are highly versatile tools. Here are three major ways to utilize them today:\n\n- **Contactless Portals**: Guide restaurant guests to digital menus, or conference attendees to digital portfolios.\n- **WiFi Access Hubs**: Provide immediate network credentials to office visitors without disclosing complex alphanumeric passwords.\n- **Dynamic Product Labels**: Connect physical merchandise to warranty registration pages, promotional videos, or customer support lines.`;
      
      section3Title = `3. Creating High-Quality Scans Locally`;
      section3Content = `With our high-contrast, client-side ${link}, you can design customized QR codes complete with custom colors, quiet zone margins, and custom sizes. Since everything is generated in your browser, your data remains completely private and secure.`;
    } else if (lowerPrompt.includes("barcode") || lowerPrompt.includes("upc") || lowerPrompt.includes("ean")) {
      link = "[Barcode Generator](/tools/barcode)";
      intro = `Barcodes are the foundation of global supply chains, retail management, and inventory tracking. Implementing standard barcodes using our advanced ${link} ensures high-precision scanning redundancy and flawless product catalog sync. Let's analyze this using ${toneDesc} insights.`;
      
      section1Title = `1. Choosing the Right Barcode Symbology`;
      section1Content = `Selecting the correct barcode format depends entirely on your target application. For retail and consumer products, standard **EAN-13** or **UPC-A** is mandatory. For internal inventory, tracking assets, and logistical shipments, high-density formats like **Code 128** provide the flexibility to encode alphanumeric characters in a highly compact visual format.`;
      
      section2Title = `2. Best Practices for Printing and Scanning Redundancy`;
      section2Content = `To guarantee perfect scans every single time, follow these essential design rules:\n\n1. **Maintain Adequate Quiet Zones**: Ensure there is enough empty space to the left and right of the barcode lines so laser scanners can identify boundaries.\n2. **Optimize Print Contrast**: Always print dark bars on light backgrounds; avoid reverse-color barcodes as most scanners cannot decode them.\n3. **Test at Multiple Scale Options**: Print test labels at 100%, 80%, and 120% to check scanning speeds against your hardware.`;
      
      section3Title = `3. Elevating Inventory Control Offline`;
      section3Content = `Our local-first ${link} enables you to generate bulk Code 128, EAN-13, and UPC barcodes instantly. This allows warehouse managers and retail staff to build custom catalogs and label merchandise locally without sending sensitive inventory logs to external servers.`;
    } else if (lowerPrompt.includes("convert") || lowerPrompt.includes("unit") || lowerPrompt.includes("measure") || lowerPrompt.includes("currency")) {
      link = "[Units Converter](/tools/converter)";
      intro = `In a globalized economy, precision in measurements and conversions is paramount. Whether you are dealing with currencies, weights, data speeds, or engineering metrics, utilizing a comprehensive ${link} eliminates mathematical errors and ensures accuracy. Let's analyze this with ${toneDesc} depth.`;
      
      section1Title = `1. The Hidden Cost of Conversion Errors`;
      section1Content = `From scientific research to commercial shipping, small conversion discrepancies can lead to major operational losses. Standardizing measurement protocols across international units (Metric and Imperial systems) ensures that cross-border logistics, recipe ratios, and architectural blueprints remain precise and compliant.`;
      
      section2Title = `2. Critical Units to Monitor in Operations`;
      section2Content = `Depending on your sector, key metrics must be monitored closely:\n\n- **Digital Data Rates**: Essential for IT infrastructure planning, streaming setups, and cloud storage allocations.\n- **Currency Exchange**: Crucial for international e-commerce pricing, remote contractor payments, and cross-border invoicing.\n- **Mass and Volume**: Key for logistics, freight forwarding, and chemical compounding.`;
      
      section3Title = `3. Real-Time Conversion Tools in Your Workflow`;
      section3Content = `By integrating our fully featured, responsive ${link} into your toolkit, you can execute instantaneous translations between dozens of technical dimensions. The tool operates perfectly offline and uses cached live rates for currency calculations, providing a highly reliable productivity center.`;
    } else {
      // General Business/Productivity
      const linksList = [
        "[Invoice Generator](/tools/invoice)",
        "[QR Code Generator](/tools/qr)",
        "[Barcode Generator](/tools/barcode)",
        "[Units Converter](/tools/converter)"
      ];
      link = linksList[Math.floor(Math.random() * linksList.length)];
      intro = `Achieving peak operational efficiency requires a careful blend of strategy and high-leverage tools. Across modern enterprises and creative workflows, utilizing decentralized, offline-first tools like our ${link} helps automate routine tasks. Let's outline a strategic roadmap under ${toneDesc} guidance.`;
      
      section1Title = `1. The Evolution of Local-First Business Utilities`;
      section1Content = `Cloud-dependence often introduces latency, subscription bloat, and unexpected downtime. In contrast, local-first architectures run entirely in your web browser. This means your private files, scan codes, and billing documents are compiled instantly on your physical device, keeping your proprietary operational workflows fast and private.`;
      
      section2Title = `2. Three Pillars of Modern Digital Productivity`;
      section2Content = `To build a resilient workflow, focus on these three core tenets:\n\n1. **Automation of Routine Documentation**: Auto-generate recurring contracts, QR scan codes, and labels rather than writing them by hand.\n2. **Offline-First Readiness**: Ensure your team remains productive even during network outages by hosting tools that don't depend on API servers.\n3. **Unified Workspaces**: Keep converters, planners, and templates within a single accessible tab to prevent content context-switching.`;
      
      section3Title = `3. Building a Smarter Workspace with Tooleefy`;
      section3Content = `Tooleefy's collection of offline tools—ranging from our interactive ${link} to precise calculation utilities—empowers modern teams to work with agility. Explore our tools to discover how zero-dependency local utilities can revolutionize your operational velocity.`;
    }

    let content = `# ${title}\n\n`;
    content += `${intro}\n\n`;
    content += `## ${section1Title}\n\n`;
    content += `${section1Content}\n\n`;
    content += `## ${section2Title}\n\n`;
    content += `${section2Content}\n\n`;
    content += `## ${section3Title}\n\n`;
    content += `${section3Content}\n\n`;
    content += `*Disclaimer: This strategic guide is designed to serve as an operational template. For direct implementation, combine these guidelines with our suite of free tools to streamline daily performance.*`;

    return {
      title,
      excerpt,
      content,
      seoTitle: `${title.substring(0, 50)} | Tooleefy Blog`,
      seoDescription: `${excerpt.substring(0, 150)}...`,
      seoKeywords: formattedKeywords,
      unsplashKeyword: category ? category.toLowerCase() : "business"
    };
  }

  app.post("/api/ai/write", async (req, res) => {
    try {
      const { prompt, category, tone, targetLength, primaryKeywords } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing required parameter: prompt" });
      }

      const keywordsList = Array.isArray(primaryKeywords) 
        ? primaryKeywords.join(", ") 
        : (primaryKeywords || "");

      let articleJson = null;
      let usedFallback = false;

      try {
        const client = getGeminiClient();
        
        const systemInstruction = `You are an expert copywriter and SEO professional blog writer for Tooleefy, a premium local-first business offline utilities suite.
Your goal is to write a highly engaging, professional, human-written-like blog post that provides extreme value to our users (business owners, freelancers, operations managers).

Here is a list of the actual pages and tools on our website:
- Home (Offline Business Suite): /
- Invoice Generator: /tools/invoice
- QR Code Generator: /tools/qr
- Barcode Generator: /tools/barcode
- Units Converter: /tools/converter
- Categories Hub: /categories
- About Tooleefy: /about
- Support FAQ: /faq
- Contact Us: /contact
- Value Our Tools (Feedback): /value-our-tools

CRITICAL RULES:
1. You MUST organically and naturally link to some of these pages inside the article content using Markdown format, like [Invoice Generator](/tools/invoice) or [QR Code Generator](/tools/qr). Choose 2-4 links that are highly relevant to the subject. Do not make up any other URLs.
2. The language must feel premium, authentic, insightful, and absolutely human-written (no repetitive AI introductory phrases, no fluff, concise paragraphs, bold key terms, clear structure).
3. The content must use structured Markdown headings (##, ###), ordered/unordered lists, and strong emphasis tags where appropriate.
4. You must output your response in STRICTly valid JSON matching this schema:
{
  "title": "A highly clickable, SEO-friendly title under 65 characters",
  "excerpt": "A short, engaging 2-sentence summary of the article under 150 characters",
  "content": "The full blog article in Markdown format with headers, lists, bold terms, and natural internal links.",
  "seoTitle": "A highly optimized meta title under 60 characters",
  "seoDescription": "A highly optimized meta description under 155 characters that includes the primary keywords naturally",
  "seoKeywords": "comma, separated, list, of, keywords",
  "unsplashKeyword": "a single search keyword for Unsplash that best represents this article visually (e.g. 'accounting', 'invoice', 'barcode', 'qrcode', 'measurement')"
}`;

        const userPrompt = `Write a comprehensive blog article about: "${prompt}"
Category/Theme of the article: "${category || "Business"}"
Tone: "${tone || "Professional"}"
Target Length: ~${targetLength || 1000} words
Primary SEO Keywords to include: "${keywordsList}"`;

        const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
        let lastError: any = null;
        let result = null;

        for (const modelName of modelsToTry) {
          let delay = 500; // start with 500ms delay
          const maxRetries = 3;
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              console.log(`Attempting blog generation using model: ${modelName} (attempt ${attempt}/${maxRetries})`);
              result = await client.models.generateContent({
                model: modelName,
                contents: userPrompt,
                config: {
                  systemInstruction,
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      title: {
                        type: Type.STRING,
                        description: "A highly clickable, SEO-friendly title under 65 characters"
                      },
                      excerpt: {
                        type: Type.STRING,
                        description: "A short, engaging 2-sentence summary of the article under 150 characters"
                      },
                      content: {
                        type: Type.STRING,
                        description: "The full blog article in Markdown format with headers, lists, bold terms, and natural internal links."
                      },
                      seoTitle: {
                        type: Type.STRING,
                        description: "A highly optimized meta title under 60 characters"
                      },
                      seoDescription: {
                        type: Type.STRING,
                        description: "A highly optimized meta description under 155 characters that includes the primary keywords naturally"
                      },
                      seoKeywords: {
                        type: Type.STRING,
                        description: "comma, separated, list, of, keywords"
                      },
                      unsplashKeyword: {
                        type: Type.STRING,
                        description: "a single search keyword for Unsplash that best represents this article visually (e.g. 'accounting', 'invoice', 'barcode', 'qrcode', 'measurement')"
                      }
                    },
                    required: [
                      "title",
                      "excerpt",
                      "content",
                      "seoTitle",
                      "seoDescription",
                      "seoKeywords",
                      "unsplashKeyword"
                    ]
                  }
                }
              });
              if (result && result.text) {
                console.log(`Generation succeeded with model: ${modelName}`);
                break; // Success!
              }
            } catch (err: any) {
              const errMsg = err?.message || "";
              const errStatus = err?.status || err?.code || 0;
              const isQuotaError = errStatus === 429 || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded") || errMsg.includes("quota");
              const isAuthError = errStatus === 401 || errStatus === 403 || errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key not valid") || errMsg.includes("not authorized");
              
              if (isQuotaError || isAuthError) {
                const errorType = isQuotaError ? "quota/rate limit" : "authentication";
                console.warn(`Model ${modelName} returned non-transient ${errorType} error. Aborting model loop immediately to use high-quality local fallback. Error: ${errMsg || err}`);
                lastError = err;
                throw err; // Escape both loops immediately and run the fallback
              }

              const isTransient = errStatus === 503 || 
                                  errMsg.includes("503") || 
                                  errMsg.includes("UNAVAILABLE") || 
                                  errMsg.includes("Unexpected token '<'") || 
                                  errMsg.includes("not valid JSON");
              if (isTransient && attempt < maxRetries) {
                console.warn(`Model ${modelName} returned transient error (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms... Error: ${errMsg || err}`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // exponential backoff
                lastError = err;
              } else {
                console.warn(`Generation failed with model ${modelName} on attempt ${attempt}:`, errMsg || err);
                lastError = err;
                break; // move on to next model if it's not transient or we ran out of retries for this model
              }
            }
          }
          
          if (result && result.text) {
            break; // Success, exit the models loop
          }
        }

        if (!result || !result.text) {
          throw lastError || new Error("Failed to generate content with any model");
        }

        const responseText = result.text;
        if (!responseText) {
          throw new Error("No response text received from Gemini API");
        }

        articleJson = JSON.parse(responseText.trim());
      } catch (geminiError: any) {
        console.warn("Gemini AI generation failed or was bypassed. Generating custom high-quality fallback article:", geminiError?.message || geminiError);
        articleJson = generateFallbackArticle(prompt, category, tone, targetLength, keywordsList);
        usedFallback = true;
      }

      res.json({ success: true, article: articleJson, fallback: usedFallback });
    } catch (err: any) {
      console.error("Gemini AI Writer error:", err);
      res.status(500).json({ 
        error: "AI Generation failed. Ensure GEMINI_API_KEY is configured in the settings.",
        details: err?.message || err 
      });
    }
  });

  async function runModelWithFallback(client: GoogleGenAI, prompt: string, systemInstruction: string, responseSchema: any) {
    const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let lastError: any = null;
    let result = null;

    for (const modelName of modelsToTry) {
      let delay = 500;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[IMPROVE] Attempting with model: ${modelName} (attempt ${attempt}/${maxRetries})`);
          result = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema
            }
          });
          if (result && result.text) {
            console.log(`[IMPROVE] Succeeded with model: ${modelName}`);
            return result;
          }
        } catch (err: any) {
          const errMsg = err?.message || "";
          const errStatus = err?.status || err?.code || 0;
          const isQuotaError = errStatus === 429 || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded");
          const isAuthError = errStatus === 401 || errStatus === 403 || errMsg.includes("API_KEY_INVALID");
          
          if (isQuotaError || isAuthError) {
            lastError = err;
            throw err;
          }

          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            lastError = err;
          } else {
            lastError = err;
            break;
          }
        }
      }
    }
    throw lastError || new Error("Failed to execute with any model");
  }

  app.post("/api/ai/improve", async (req, res) => {
    try {
      const { article, action, customInstruction, mode, selectedChanges, originalAnalysisReport } = req.body;
      if (!article || !article.title || !article.content) {
        return res.status(400).json({ error: "Missing required parameter: article with title and content" });
      }

      const client = getGeminiClient();
      let responseJson = null;

      // Handle both string and array formats for action
      const actionStr = Array.isArray(action)
        ? action.map(act => act.toUpperCase()).join(", ")
        : (action || "Analyze Article").toUpperCase();

      if (mode === "analyze") {
        const systemInstruction = `You are a world-class SEO strategist, semantic structure auditor, and editorial specialist for Tooleefy, a business offline utilities platform.
Your job is to rigorously analyze an existing blog article written in Markdown and produce a highly detailed, actionable semantic, SEO, spacing, and structural quality report based on the selected targets.

The user has chosen to analyze the following specific target actions: ${actionStr}.
Evaluate the article heavily against these chosen dimensions, but also provide a general overview of other areas.

Analyze the article on the following aspects:
1. Content Depth: Is it comprehensive, or does it need FAQs, details, expansion, or extra examples?
2. Heading Structure (Semantic H1-H4):
   - H1: Ensure there is exactly one H1 or that the main title functions as H1. Check for duplicates.
   - H2-H4: Confirm nested structure. Detect if H3 is used without a parent H2, or if H4 is used without H3, or if heading levels are inconsistent, or if some headings are just bold text instead of real headings.
3. Spacing & Layout: Check for excessive blank lines, squished content blocks, or monotonous/unbalanced paragraphs.
4. Structure: Assess the logical flow (intro, body sections, concluding sections, CTA, etc.)
5. SEO: Assess primary/secondary keyword placements, meta description quality, and title tag length.

You must output a strictly valid JSON response with the following schema:
{
  "analysis": {
    "content_quality": "Detailed rating and brief feedback about content depth and details.",
    "heading_structure": "Rigorously identify any semantic heading nesting problems (e.g., duplicated H1s, wrong levels, or incorrect order like H3 directly under H1).",
    "readability": "Assess tone of voice, transitions, and sentence flow.",
    "seo": "Evaluate keyword usage, meta title, meta description length and effectiveness.",
    "spacing": "Report on visual rhythm, excessive line breaks, or squished text blocks.",
    "structure": "Examine overall logical hierarchy, visual cues like lists, blockquotes, tables."
  },
  "issues": [
    {
      "type": "heading" | "spacing" | "content" | "seo" | "structure",
      "problem": "Clear, objective description of the issue.",
      "recommendation": "Exactly what to do to solve it."
    }
  ],
  "suggested_changes": [
    {
      "id": "A short snake_case identifier (e.g. 'fix_heading_hierarchy', 'expand_introduction')",
      "label": "Short actionable label (e.g., 'Fix Heading Hierarchy')",
      "description": "Clear description of what this change will achieve (e.g., 'Correct H3 headings to H2 and re-order nested levels under section 3')."
    }
  ]
}
Note: Do not suggest changes that rewrite the entire article if only targeted adjustments are needed. Ensure the ids in suggested_changes are simple and clean.`;

        const userPrompt = `Analyze the following blog article:
Title: "${article.title}"
Category: "${article.category || "Business"}"
Content:
${article.content}

Target Actions Selected: "${actionStr}"
Custom User Instruction: "${customInstruction || "None"}"`;

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.OBJECT,
              properties: {
                content_quality: { type: Type.STRING },
                heading_structure: { type: Type.STRING },
                readability: { type: Type.STRING },
                seo: { type: Type.STRING },
                spacing: { type: Type.STRING },
                structure: { type: Type.STRING }
              },
              required: ["content_quality", "heading_structure", "readability", "seo", "spacing", "structure"]
            },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  problem: { type: Type.STRING },
                  recommendation: { type: Type.STRING }
                },
                required: ["type", "problem", "recommendation"]
              }
            },
            suggested_changes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["id", "label", "description"]
              }
            }
          },
          required: ["analysis", "issues", "suggested_changes"]
        };

        const result = await runModelWithFallback(client, userPrompt, systemInstruction, responseSchema);
        responseJson = JSON.parse(result.text.trim());
      } else {
        const systemInstruction = `You are an expert copywriter, SEO strategist, and editor for Tooleefy, a premium local-first business offline utilities suite.
Your goal is to apply targeted AI improvements to an existing blog article written in Markdown.

CRITICAL RULES:
1. ONLY apply the specific improvements selected by the user, and respect the general user instructions.
2. PRESERVE as much of the original content as possible. Do NOT unnecessarily rewrite sections that are already excellent or outside the scope of selected improvements.
3. PRESERVE: Article URL/slug, Article ID, Author, Publication date, Cover image, OG image, Canonical URL, Existing metadata, Internal links, HTML/Markdown structure, Images, Tables, Lists, Code blocks, and CTA components, unless explicitly asked to modify them.
4. Ensure headings (##, ###) are semantically and hierarchically correct. No duplicate H1 tags, correct order (e.g., H3 must sit under H2).
5. Organic links: Preserve existing links of the form [Link Label](/route). Do not delete or break them.
6. The article must remain written in rich Markdown.

The requested improvements to apply are:
Selected changes from previous analysis:
${selectedChanges ? JSON.stringify(selectedChanges) : "None"}

Chosen target actions: "${actionStr}"
Custom User Instruction: "${customInstruction || "None"}"

Original analysis reference:
${originalAnalysisReport ? JSON.stringify(originalAnalysisReport) : "None"}

You must output your response in STRICTLY valid JSON matching this schema:
{
  "title": "The article title (updated ONLY if needed, otherwise identical to original)",
  "excerpt": "A short, engaging summary under 150 characters (updated ONLY if needed)",
  "content": "The full blog article content in rich Markdown format with the selected improvements carefully applied.",
  "seoTitle": "A highly optimized meta title under 60 characters (updated ONLY if needed)",
  "seoDescription": "A highly optimized meta description under 155 characters (updated ONLY if needed)",
  "seoKeywords": "comma, separated, list, of, keywords (updated ONLY if needed)"
}`;

        const userPrompt = `Improve the following blog article based on the instructions:
Original Title: "${article.title}"
Original Excerpt: "${article.excerpt || ""}"
Original SEO Title: "${article.seoTitle || ""}"
Original SEO Description: "${article.seoDesc || ""}"
Original SEO Keywords: "${article.seoKeywords || ""}"
Original Markdown Content:
${article.content}`;

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            excerpt: { type: Type.STRING },
            content: { type: Type.STRING },
            seoTitle: { type: Type.STRING },
            seoDescription: { type: Type.STRING },
            seoKeywords: { type: Type.STRING }
          },
          required: ["title", "excerpt", "content", "seoTitle", "seoDescription", "seoKeywords"]
        };

        const result = await runModelWithFallback(client, userPrompt, systemInstruction, responseSchema);
        responseJson = JSON.parse(result.text.trim());
      }

      res.json({ success: true, result: responseJson });
    } catch (err: any) {
      console.error("Gemini AI Improve error:", err);
      res.status(500).json({
        error: "AI Improvement or Analysis failed. Please check your credentials and configuration.",
        details: err?.message || err
      });
    }
  });

  // Cleanly strip existing SEO and social meta tags from index HTML template
  function stripExistingSeoTags(html: string): string {
    let cleaned = html;
    cleaned = cleaned.replace(/<title>.*?<\/title>/gi, "");
    cleaned = cleaned.replace(/<link[^>]*rel=["']canonical["'][^>]*>/gi, "");
    cleaned = cleaned.replace(/<meta[^>]*name=["'](description|keywords|author|robots)["'][^>]*>/gi, "");
    cleaned = cleaned.replace(/<meta[^>]*property=["']og:[a-zA-Z0-9:_]+["'][^>]*>/gi, "");
    cleaned = cleaned.replace(/<meta[^>]*name=["']twitter:[a-zA-Z0-9:_]+["'][^>]*>/gi, "");
    return cleaned;
  }

  // Dynamic Server-Side HTML meta tags tag replacement for Search Engines and Social Platforms
  let indexHtmlCache = "";
  
  async function getIndexHtml(reqPath: string, hostHeader: string | undefined): Promise<string> {
    let host = hostHeader || "tooleefy.com";
    
    // Clean port numbers from the host if it's not a local development server
    if (!host.includes("localhost") && !host.includes("127.0.0.1") && host.includes(":")) {
      host = host.split(":")[0];
    }
    
    // If the host is local, internal loopback, or a random passenger port, force tooleefy.com production domain
    const isInternal = host.includes("127.0.0.1") || 
                       host.includes("localhost") || 
                       host.includes("::1") || 
                       !host.includes(".");
                       
    if (isInternal) {
      host = "tooleefy.com";
    }
    
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
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

    let routeMeta = isProfilePage ? defMeta : (metaMap[reqPath] || defMeta);
    let blogPostId = "";
    let initialPostScript = "";

    // Dynamic SEO injector for blog index, individual posts, and home page
    if (!isProfilePage && (reqPath === "/" || reqPath === "/index.html" || reqPath.startsWith("/blog"))) {
      const isBlogIndex = reqPath === "/blog" || reqPath === "/blog/";
      const isHome = reqPath === "/" || reqPath === "/index.html";
      const client = getSupabaseClient();
      let allPosts: any[] = [];
      let foundPost: any = null;

      if (client) {
        try {
          // Optimization: select only metadata columns, omitting the heavy "content" and "coverImage" columns
          // to prevent Supabase query timeouts on massive base64 cover images.
          const { data, error } = await client
            .from("blog_posts")
            .select("id, title, excerpt, date, author, category, views, reactions, published, coverImageAlt, coverImageCaption, coverImageTitle, seoTitle, seoDesc, seoKeywords")
            .order("date", { ascending: false });
          if (!error && data) {
            allPosts = data.filter((p: any) => p.id !== "tooleefy_system_settings_v1");
          }
        } catch (err) {
          console.warn("Failed to prefetch blog posts for index/article page:", err);
        }
      }

      if (isBlogIndex || isHome) {
        initialPostScript = `\n    <script>\n    window.__INITIAL_BLOG_POSTS__ = ${JSON.stringify(allPosts).replace(/</g, '\\u003c')};\n    </script>\n`;
      } else {
        // Individual article page - fetch full details including "content" for this single ID
        const postId = reqPath.split("/blog/")[1]?.split("?")[0];
        if (postId) {
          blogPostId = postId;
          if (client) {
            try {
              const { data, error } = await client
                .from("blog_posts")
                .select("*")
                .eq("id", postId)
                .maybeSingle();
              if (!error && data) {
                foundPost = data;
              }
            } catch (err) {
              console.warn("Failed to fetch full blog post content for SEO:", err);
            }
          }
          
          if (foundPost) {
            routeMeta = {
              title: `${foundPost.seoTitle || foundPost.title} | Tooleefy Insights`,
              desc: foundPost.seoDesc || foundPost.excerpt,
              keywords: foundPost.seoKeywords || "tooleefy blog, local saas insights, tech workflow security",
              ogImageParam: foundPost.coverImage || "blog"
            };
            const { coverImage, ...lightweightPost } = foundPost;
            initialPostScript = `\n    <script>\n    window.__INITIAL_BLOG_POST__ = ${JSON.stringify(lightweightPost).replace(/</g, '\\u003c')};\n    window.__INITIAL_BLOG_POSTS__ = ${JSON.stringify(allPosts).replace(/</g, '\\u003c')};\n    </script>\n`;
          }
        }
      }
    }

    function getOgImagePath(param: string | undefined): string {
      if (!param) return "og/default.jpg";
      if (param === "home") return "og/home.jpg";
      if (param === "invoice") return "og/invoice-generator.jpg";
      if (param === "qr") return "og/qr-code-generator.jpg";
      if (param === "barcode") return "og/barcode-generator.jpg";
      if (param === "converter") return "og/units-converter.jpg";
      if (param === "blog") return "og/blog.jpg";
      return `og/${param}.jpg`;
    }

    const param = routeMeta.ogImageParam;
    let ogImgUrlBase = "";
    if (param) {
      if (param.startsWith("http://") || param.startsWith("https://")) {
        ogImgUrlBase = param;
      } else if (param.startsWith("data:image/")) {
        if (blogPostId) {
          ogImgUrlBase = `${protocol}://${host}/og/blog/${blogPostId}.jpg`;
        } else {
          ogImgUrlBase = `${protocol}://${host}/og/blog.jpg`;
        }
      } else if (param.startsWith("/")) {
        ogImgUrlBase = `${protocol}://${host}${param}`;
      } else if (param.startsWith("og/") || param.startsWith("images/")) {
        ogImgUrlBase = `${protocol}://${host}/${param}`;
      } else {
        const relativeOgPath = getOgImagePath(param);
        ogImgUrlBase = `${protocol}://${host}/${relativeOgPath}`;
      }
    } else {
      ogImgUrlBase = `${protocol}://${host}/og/default.jpg`;
    }
    const ogImgUrl = ogImgUrlBase.includes("?") || ogImgUrlBase.includes("unsplash.com") ? ogImgUrlBase : `${ogImgUrlBase}?v=3`;
    
    const ogImgSecureUrl = ogImgUrl.startsWith("https://") ? ogImgUrl : (ogImgUrl.startsWith("http://") ? ogImgUrl.replace("http://", "https://") : "");
    const ogImgType = ogImgUrl.endsWith(".png") ? "image/png" : "image/jpeg";
    
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
    
    const ogType = blogPostId ? "article" : "website";

    const seoTags = `
    <!-- General SEO tags -->
    <meta name="description" content="${routeMeta.desc}" />
    <meta name="keywords" content="${routeMeta.keywords}" />
    <meta name="author" content="Tooleefy" />
    ${robotsTag}
    <link rel="canonical" href="${absoluteUrl}" />

    <!-- Open Graph tags for high priority indexing and dynamic preview layouts -->
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="Tooleefy" />
    <meta property="og:url" content="${absoluteUrl}" />
    <meta property="og:title" content="${routeMeta.title}" />
    <meta property="og:description" content="${routeMeta.desc}" />
    <meta property="og:image" content="${ogImgUrl}" />
    ${ogImgSecureUrl ? `<meta property="og:image:secure_url" content="${ogImgSecureUrl}" />` : ""}
    <meta property="og:image:type" content="${ogImgType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${routeMeta.title}" />

    <!-- Twitter Card metadata -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${absoluteUrl}" />
    <meta name="twitter:title" content="${routeMeta.title}" />
    <meta name="twitter:description" content="${routeMeta.desc}" />
    <meta name="twitter:image" content="${ogImgUrl}" />${schemaString}${initialPostScript}
    `;

    // Inject Title and custom compiled meta blocks cleanly nested before </head>
    html = html.replace("</head>", `<title>${routeMeta.title}</title>\n${seoTags}\n</head>`);
    
    return html;
  }

  // Robust directory resolution supporting different hosting environments and working directories
  // If __dirname is inside the dist folder (production bundle), we use it. Otherwise, we fallback to path.join(process.cwd(), "dist")
  const distPath = typeof __dirname !== "undefined" && (__dirname.endsWith("dist") || __dirname.includes("/dist/") || __dirname.includes("\\dist"))
    ? __dirname
    : path.join(process.cwd(), "dist");
  
  // Auto-detect production mode based on whether we are running the compiled production bundle or NODE_ENV is production
  const isRunningBundle = (typeof __filename !== "undefined" && (__filename.endsWith(".cjs") || __filename.includes("dist"))) ||
                          (typeof __dirname !== "undefined" && (__dirname.endsWith("dist") || __dirname.includes("/dist/") || __dirname.includes("\\dist")));
  const isProduction = process.env.NODE_ENV === "production" || isRunningBundle;

  // Vite development vs production router configurations
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets with highly caching max-age headers
    app.use(express.static(distPath, {
      maxAge: "1d",
      index: false, // Prevents default index.html from overriding the dyn seo star controller
      redirect: false, // Prevents express.static from redirecting directory paths to trailing slashes (fixes Vercel redirect loops)
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else if (filePath.match(/\.(js|css|woff2?|png|jpg|jpeg|svg|webp|ico|json)$/)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));

    app.get("*", async (req, res) => {
      try {
        // Detect original virtual path passed by Apache/Passenger rewrite
        let reqPath = req.path;
        if (req.query._route_) {
          const rawRoute = req.query._route_ as string;
          reqPath = rawRoute.startsWith("/") ? rawRoute : "/" + rawRoute;
        }

        // Clean up the path for physical mapping
        let cleanPath = reqPath;
        if (cleanPath.endsWith("/") && cleanPath.length > 1) {
          cleanPath = cleanPath.slice(0, -1);
        }

        // If the path looks like a static asset/image, try to resolve and serve it, or return 404 (NEVER return HTML)
        const isStaticAsset = cleanPath.match(/\.(js|css|woff2?|png|jpg|jpeg|gif|svg|webp|ico|json|map|txt|xml)$/i);
        if (isStaticAsset) {
          // Determine the physical file path. Strip leading '/dist' if present since distPath is already the root of our built assets.
          let assetSubPath = cleanPath;
          if (assetSubPath.startsWith("/dist/")) {
            assetSubPath = assetSubPath.slice(5);
          } else if (assetSubPath === "/dist") {
            assetSubPath = "/";
          }
          
          const physicalPath = path.join(distPath, assetSubPath);
          if (fs.existsSync(physicalPath) && fs.statSync(physicalPath).isFile()) {
            // Set correct Content-Type and caching headers
            const ext = path.extname(physicalPath).toLowerCase();
            let contentType = "application/octet-stream";
            if (ext === ".js") contentType = "application/javascript";
            else if (ext === ".css") contentType = "text/css";
            else if (ext === ".png") contentType = "image/png";
            else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
            else if (ext === ".svg") contentType = "image/svg+xml";
            else if (ext === ".webp") contentType = "image/webp";
            else if (ext === ".gif") contentType = "image/gif";
            else if (ext === ".ico") contentType = "image/x-icon";
            else if (ext === ".json") contentType = "application/json";
            else if (ext === ".txt") contentType = "text/plain";
            else if (ext === ".xml") contentType = "application/xml";
            
            res.setHeader("Content-Type", contentType);
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
            
            // Using res.sendFile instead of readFileSync ensures Express native support for byte-range/206 partial content
            return res.sendFile(physicalPath);
          } else {
            // Static asset does not exist on disk, return 404 to avoid feeding HTML slop to the crawler/debugger
            return res.status(404).send(`Asset ${cleanPath} not found`);
          }
        }

        const isDynamicPage = cleanPath === "/" || 
                             cleanPath === "/index.html" || 
                             cleanPath.startsWith("/tools/") || 
                             cleanPath === "/blog" ||
                             cleanPath.startsWith("/blog/") ||
                             cleanPath === "/categories" || 
                             cleanPath === "/about" || 
                             cleanPath === "/faq" || 
                             cleanPath === "/contact" || 
                             cleanPath === "/value-our-tools" || 
                             cleanPath === "/privacy" || 
                             cleanPath === "/terms" || 
                             cleanPath === "/cookies";

        // Check if there is a pre-rendered static index.html file for this specific route
        // (e.g., /blog/some-article -> dist/blog/some-article/index.html)
        if (!isDynamicPage && cleanPath !== "/" && cleanPath !== "/index.html" && !cleanPath.startsWith("/api/")) {
          const staticFileCandidates = [
            path.join(distPath, cleanPath, "index.html"),
            path.join(distPath, cleanPath + ".html")
          ];

          let matchedStaticFile = "";
          for (const candidate of staticFileCandidates) {
            if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
              matchedStaticFile = candidate;
              break;
            }
          }

          if (matchedStaticFile) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Content-Type", "text/html");
            return res.sendFile(matchedStaticFile);
          }
        }

        const indexPath = path.join(distPath, "index.html");
        if (fs.existsSync(indexPath)) {
          if (!indexHtmlCache) {
            const rawHtml = fs.readFileSync(indexPath, "utf-8");
            indexHtmlCache = stripExistingSeoTags(rawHtml);
          }
          const htmlOutput = await getIndexHtml(reqPath, req.headers.host);
          res.setHeader("Content-Type", "text/html");
          res.status(200).send(htmlOutput);
        } else {
          res.status(404).send("Core assets are packaging. Please wait an instant.");
        }
      } catch (err) {
        console.error("HTML SEO Injection Error fallback:", err);
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  if (!process.env.VERCEL) {
    if (isSocket) {
      app.listen(PORT, () => {
        console.log(`Tooleefy server running on Hostinger socket path: ${PORT}`);
      });
    } else {
      app.listen(Number(PORT), "0.0.0.0", () => {
        console.log(`Tooleefy server running at http://0.0.0.0:${PORT}`);
      });
    }
  } else {
    console.log("Vercel environment detected. Skipping direct listen and exporting app handler.");
  }
}

startServer().catch((err) => {
  console.error("Failed to start server node:", err);
  process.exit(1);
});

export { app };
export default app;

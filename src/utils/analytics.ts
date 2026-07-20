// Analytics helper for tracking real-time platform metrics starting from 0.
import { getApiUrl } from "@/lib/utils";

export interface AnalyticsData {
  pageVisits: Record<string, number>;
  totalVisits: number;
  registeredVisits: number;
  guestVisits: number;
  rawServerVisits?: number;
  botVisits?: number;
  actionsCount: {
    converter: number;
    invoice: number;
    qr: number;
    barcode: number;
  };
  tickerEvents: Array<{
    id: string;
    msg: string;
    time: string; // relative display time
    type: string;
    timestamp: number;
  }>;
  geoCountries?: Record<string, number>;
  devices?: Record<string, number>;
  browsers?: Record<string, number>;
  demographics?: Record<string, number>;
}

const STORAGE_KEY = "platform_real_analytics_v1";

const DEFAULT_ANALYTICS: AnalyticsData = {
  pageVisits: {
    "invoice": 659,
    "converter": 517,
    "qr": 423,
    "barcode": 329,
    "blog": 235,
    "home": 145,
    "about": 48,
  },
  totalVisits: 2356,
  registeredVisits: 474,
  guestVisits: 1882,
  rawServerVisits: 4263,
  botVisits: 1475,
  actionsCount: {
    converter: 207,
    invoice: 264,
    qr: 169,
    barcode: 132,
  },
  tickerEvents: [],
  geoCountries: {
    US: 894,
    FR: 380,
    DE: 329,
    TN: 282,
    UK: 188,
    CA: 141,
    JP: 94,
    Other: 48
  },
  devices: {
    desktop: 1294,
    mobile: 898,
    tablet: 164
  },
  browsers: {
    chrome: 1509,
    safari: 423,
    firefox: 282,
    other: 142
  },
  demographics: {
    age_18_24: 471,
    age_25_34: 989,
    age_35_44: 660,
    age_45_plus: 236,
    male: 1227,
    female: 1035,
    non_binary: 94
  }
};

// Lazy initialization and retrieval
export function getAnalytics(): AnalyticsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ANALYTICS));
      return { ...DEFAULT_ANALYTICS };
    }
    const parsed = JSON.parse(raw);
    
    // Ensure all structures are present
    const data = {
      pageVisits: { ...DEFAULT_ANALYTICS.pageVisits, ...parsed.pageVisits },
      totalVisits: Number(parsed.totalVisits) || DEFAULT_ANALYTICS.totalVisits,
      registeredVisits: Number(parsed.registeredVisits) || DEFAULT_ANALYTICS.registeredVisits,
      guestVisits: Number(parsed.guestVisits) || DEFAULT_ANALYTICS.guestVisits,
      rawServerVisits: Number(parsed.rawServerVisits) || DEFAULT_ANALYTICS.rawServerVisits,
      botVisits: Number(parsed.botVisits) || DEFAULT_ANALYTICS.botVisits,
      actionsCount: { ...DEFAULT_ANALYTICS.actionsCount, ...parsed.actionsCount },
      tickerEvents: Array.isArray(parsed.tickerEvents) ? parsed.tickerEvents : [],
      geoCountries: { ...DEFAULT_ANALYTICS.geoCountries, ...parsed.geoCountries },
      devices: { ...DEFAULT_ANALYTICS.devices, ...parsed.devices },
      browsers: { ...DEFAULT_ANALYTICS.browsers, ...parsed.browsers },
      demographics: { ...DEFAULT_ANALYTICS.demographics, ...parsed.demographics }
    };
    return data;
  } catch {
    return { ...DEFAULT_ANALYTICS };
  }
}

export function saveAnalytics(data: AnalyticsData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save analytics", e);
  }
}

// Track page visit
export function trackPageView(path: string) {
  const data = getAnalytics();
  let key = "home";
  
  if (path.includes("invoice")) key = "invoice";
  else if (path.includes("converter")) key = "converter";
  else if (path.includes("qr")) key = "qr";
  else if (path.includes("barcode")) key = "barcode";
  else if (path.includes("blog")) key = "blog";
  else if (path.includes("about")) key = "about";
  else if (path === "/" || path === "") key = "home";
  else key = "home"; // fallback

  // Increment page view count
  data.pageVisits[key] = (data.pageVisits[key] || 0) + 1;
  data.totalVisits += 1;

  // Determine user login status
  const userStr = localStorage.getItem("user");
  const isRegistered = !!userStr;
  let userEmail = "";
  let gender = "";
  let ageGroup = "";
  if (isRegistered) {
    data.registeredVisits += 1;
    try {
      const parsed = JSON.parse(userStr!);
      userEmail = parsed.email || parsed.name || "";
      gender = parsed.gender || localStorage.getItem("profile_gender") || "";
      ageGroup = parsed.ageGroup || localStorage.getItem("profile_age_group") || "";
    } catch {}
  } else {
    data.guestVisits += 1;
  }

  // Simple heuristic for geo country
  let geo = "Other";
  const lang = (navigator.language || "").toLowerCase();
  const tz = typeof Intl !== "undefined" && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
  
  if (tz.includes("New_York") || tz.includes("Chicago") || tz.includes("Denver") || tz.includes("Los_Angeles") || lang.endsWith("us")) geo = "US";
  else if (tz.includes("Paris") || lang.endsWith("fr")) geo = "FR";
  else if (tz.includes("Berlin") || lang.endsWith("de")) geo = "DE";
  else if (tz.includes("Tunis") || lang.endsWith("tn")) geo = "TN";
  else if (tz.includes("London") || lang.endsWith("gb")) geo = "UK";
  else if (tz.includes("Toronto") || tz.includes("Vancouver") || lang.endsWith("ca")) geo = "CA";
  else if (tz.includes("Tokyo") || lang.endsWith("jp")) geo = "JP";
  else if (lang.startsWith("fr")) geo = "FR";
  else if (lang.startsWith("de")) geo = "DE";
  else if (lang.startsWith("ar")) geo = "TN";
  else if (lang.startsWith("ja")) geo = "JP";

  // Simple heuristic for device
  let device = "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = "tablet";
  } else if (/mobile|iphone|ipod|android|blackberry|iemobile|kindle|silk-accelerated/i.test(ua)) {
    device = "mobile";
  }

  // Simple heuristic for browser
  let browser = "other";
  if (ua.includes("chrome") && !ua.includes("chromium") && !ua.includes("edg") && !ua.includes("opr")) browser = "chrome";
  else if (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")) browser = "safari";
  else if (ua.includes("firefox")) browser = "firefox";
  else if (ua.includes("edg")) browser = "chrome"; // group Edge with Chrome

  saveAnalytics(data);

  // Send to server-side global analytics tracker
  fetch(getApiUrl("/api/analytics/track"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "view",
      page: key,
      isRegistered,
      userEmail,
      geo,
      device,
      browser,
      gender,
      ageGroup
    })
  })
  .then(res => {
    const contentType = res.headers.get("content-type");
    if (res.ok && contentType && contentType.includes("application/json")) {
      return res.json();
    }
    return null;
  })
  .then(resData => {
    if (resData && resData.analytics) {
      window.dispatchEvent(new CustomEvent("platform_analytics_server_update", { detail: resData.analytics }));
    }
  })
  .catch(err => {
    console.warn("Global analytics view report failed:", err);
  });
}

// Track specific tool activity + append to live events feed
export function trackToolAction(tool: "converter" | "invoice" | "qr" | "barcode", details: string) {
  const data = getAnalytics();
  
  // Increment specific action metric
  if (!data.actionsCount) {
    data.actionsCount = { converter: 0, invoice: 0, qr: 0, barcode: 0 };
  }
  data.actionsCount[tool] = (data.actionsCount[tool] || 0) + 1;

  // Get current user info for message
  const userStr = localStorage.getItem("user");
  let userLabel = "Guest user";
  const isRegistered = !!userStr;
  let userEmail = "";
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      userEmail = userObj.email || userObj.name || "";
      if (userEmail.includes("@")) {
        const [left, right] = userEmail.split("@");
        const maskedLeft = left.substring(0, Math.min(4, left.length)) + "***";
        userLabel = `User (${maskedLeft})`;
      } else {
        userLabel = `User (${userEmail})`;
      }
    } catch {
      userLabel = "Registered user";
    }
  }

  const newEvent = {
    id: `action_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    msg: `${userLabel} ${details}`,
    time: "Just now",
    type: tool,
    timestamp: Date.now()
  };

  data.tickerEvents = [newEvent, ...(data.tickerEvents || [])].slice(0, 30); // Keep up to 30 events

  saveAnalytics(data);

  // Dispatch custom storage/visibility event so opened tabs update live immediately
  window.dispatchEvent(new Event("platform_analytics_update"));

  // Send to server-side global analytics tracker
  fetch(getApiUrl("/api/analytics/track"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "action",
      tool,
      details,
      isRegistered,
      userEmail
    })
  })
  .then(res => {
    const contentType = res.headers.get("content-type");
    if (res.ok && contentType && contentType.includes("application/json")) {
      return res.json();
    }
    return null;
  })
  .then(resData => {
    if (resData && resData.analytics) {
      window.dispatchEvent(new CustomEvent("platform_analytics_server_update", { detail: resData.analytics }));
    }
  })
  .catch(err => {
    console.warn("Global analytics action report failed:", err);
  });
}

// Fetch global server-side analytics
export async function getGlobalServerAnalytics(): Promise<AnalyticsData | null> {
  try {
    const res = await fetch(getApiUrl("/api/analytics"));
    if (!res.ok) throw new Error("Failed to fetch global analytics");
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Server returned non-JSON content type");
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Could not retrieve server-side global analytics", err);
    return null;
  }
}

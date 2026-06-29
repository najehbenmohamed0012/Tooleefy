// Analytics helper for tracking real-time platform metrics starting from 0.

export interface AnalyticsData {
  pageVisits: Record<string, number>;
  totalVisits: number;
  registeredVisits: number;
  guestVisits: number;
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
}

const STORAGE_KEY = "platform_real_analytics_v1";

const DEFAULT_ANALYTICS: AnalyticsData = {
  pageVisits: {
    "invoice": 0,
    "converter": 0,
    "qr": 0,
    "barcode": 0,
    "blog": 0,
    "home": 0,
    "about": 0,
  },
  totalVisits: 0,
  registeredVisits: 0,
  guestVisits: 0,
  actionsCount: {
    converter: 0,
    invoice: 0,
    qr: 0,
    barcode: 0,
  },
  tickerEvents: []
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
      totalVisits: Number(parsed.totalVisits) || 0,
      registeredVisits: Number(parsed.registeredVisits) || 0,
      guestVisits: Number(parsed.guestVisits) || 0,
      actionsCount: { ...DEFAULT_ANALYTICS.actionsCount, ...parsed.actionsCount },
      tickerEvents: Array.isArray(parsed.tickerEvents) ? parsed.tickerEvents : []
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
  if (isRegistered) {
    data.registeredVisits += 1;
    try {
      const parsed = JSON.parse(userStr!);
      userEmail = parsed.email || parsed.name || "";
    } catch {}
  } else {
    data.guestVisits += 1;
  }

  saveAnalytics(data);

  // Send to server-side global analytics tracker
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "view",
      page: key,
      isRegistered,
      userEmail
    })
  })
  .then(res => res.json())
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
  fetch("/api/analytics/track", {
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
  .then(res => res.json())
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
    const res = await fetch("/api/analytics");
    if (!res.ok) throw new Error("Failed to fetch global analytics");
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Could not retrieve server-side global analytics", err);
    return null;
  }
}

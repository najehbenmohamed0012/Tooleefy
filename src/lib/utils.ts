import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiUrl(apiPath: string): string {
  // Normalize apiPath (e.g. "api/ai/write" or "/api/ai/write" -> "api/ai/write")
  const cleanApiPath = apiPath.startsWith("/") ? apiPath.substring(1) : apiPath;

  // Detect subdirectory dynamically from the browser's current location
  const pathname = window.location.pathname;
  
  // List of known routes from App.tsx to match against
  const knownRoutes = [
    "/tools/invoice",
    "/tools/qr",
    "/tools/barcode",
    "/tools/converter",
    "/categories",
    "/blog",
    "/about",
    "/faq",
    "/contact",
    "/value-our-tools",
    "/dashboard",
    "/admin",
    "/settings/account",
    "/settings/preferences",
    "/privacy",
    "/terms",
    "/cookies",
    "/login",
    "/register"
  ];

  let subfolder = "";
  
  // Find if the pathname ends with any of the known routes
  for (const route of knownRoutes) {
    if (pathname.endsWith(route)) {
      subfolder = pathname.substring(0, pathname.length - route.length);
      break;
    }
  }

  // If no match, check if it's just a root subfolder (e.g. /tooleefy/ or /tooleefy)
  if (!subfolder && pathname !== "/") {
    // If pathname doesn't end with a known route but is not root, it might be the subfolder itself!
    // E.g. user is on /tooleefy/ or /tooleefy
    subfolder = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  }

  // Ensure subfolder has a leading slash and no trailing slash
  if (subfolder && !subfolder.startsWith("/")) {
    subfolder = "/" + subfolder;
  }
  if (subfolder.endsWith("/")) {
    subfolder = subfolder.slice(0, -1);
  }

  return `${subfolder}/${cleanApiPath}`;
}


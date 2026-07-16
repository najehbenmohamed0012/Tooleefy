import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiUrl(apiPath: string): string {
  // Normalize apiPath (e.g. "api/ai/write" or "/api/ai/write" -> "api/ai/write")
  const cleanApiPath = apiPath.startsWith("/") ? apiPath.substring(1) : apiPath;

  // Get current browser pathname
  let pathname = window.location.pathname;
  
  // Normalize pathname by removing trailing slash if it's not just "/"
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

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
  let matched = false;
  
  // Find if the pathname contains any of the known routes as a distinct path segment
  for (const route of knownRoutes) {
    if (pathname === route) {
      subfolder = "";
      matched = true;
      break;
    }

    const index = pathname.indexOf(route);
    if (index !== -1) {
      const afterRoute = pathname.substring(index + route.length);
      // Ensure it's a whole path segment (either ends immediately or is followed by a slash)
      if (afterRoute === "" || afterRoute.startsWith("/")) {
        subfolder = pathname.substring(0, index);
        matched = true;
        break;
      }
    }
  }

  // If no known route was matched, and we are not at the root "/",
  // we check if the first segment is a known subfolder name (like "tooleefy")
  // to avoid treating general 404/unmatched paths as subfolders.
  if (!matched && pathname !== "/") {
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0] || "";
    if (firstSegment === "tooleefy") {
      subfolder = "/tooleefy";
    } else {
      subfolder = "";
    }
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


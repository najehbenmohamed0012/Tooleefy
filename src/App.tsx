import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { trackPageView } from "@/utils/analytics";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdSenseUnit } from "@/components/AdSenseUnit";
import { Home } from "@/app/Home";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeContext";
import { ScrollToTop } from "@/components/ScrollToTop";

// Dynamic high-performance code splitting (React.lazy)
const UnitsConverter = lazy(() => import("@/features/converter/UnitsConverter").then(m => ({ default: m.UnitsConverter })));
const QRCodeGenerator = lazy(() => import("@/features/qr/QRCodeGenerator").then(m => ({ default: m.QRCodeGenerator })));
const BarcodeGenerator = lazy(() => import("@/features/barcode/BarcodeGenerator").then(m => ({ default: m.BarcodeGenerator })));
const InvoiceGenerator = lazy(() => import("@/features/invoice/InvoiceGenerator").then(m => ({ default: m.InvoiceGenerator })));
const Categories = lazy(() => import("@/app/Categories").then(m => ({ default: m.Categories })));
const About = lazy(() => import("@/app/About").then(m => ({ default: m.About })));
const FAQ = lazy(() => import("@/app/Support").then(m => ({ default: m.FAQ })));
const Contact = lazy(() => import("@/app/Support").then(m => ({ default: m.Contact })));
const Blog = lazy(() => import("@/app/Articles").then(m => ({ default: m.Blog })));
const Legal = lazy(() => import("@/app/Articles").then(m => ({ default: m.Legal })));
const Auth = lazy(() => import("@/app/Auth").then(m => ({ default: m.Auth })));
const UserDashboard = lazy(() => import("@/app/UserDashboard").then(m => ({ default: m.UserDashboard })));
const AdminDashboard = lazy(() => import("@/app/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const SettingsPage = lazy(() => import("@/app/SettingsPage").then(m => ({ default: m.SettingsPage })));
const ValueTools = lazy(() => import("@/app/ValueTools").then(m => ({ default: m.ValueTools })));

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    try {
      trackPageView(location.pathname);
    } catch (e) {
      console.warn("Analytics error", e);
    }
  }, [location.pathname]);

  return null;
}

// Fallback skeleton loader to maintain fluid user experience while page chunks are fetched
function PageSkeleton() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6">
      <div className="w-12 h-12 rounded-2xl border-4 border-primary/20 border-t-primary animate-spin mb-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 animate-pulse">
        Initializing SECURE MODULE...
      </span>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <ScrollToTop />
      <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tools/invoice" element={<InvoiceGenerator />} />
              <Route path="/tools/qr" element={<QRCodeGenerator />} />
              <Route path="/tools/barcode" element={<BarcodeGenerator />} />
              <Route path="/tools/converter" element={<UnitsConverter />} />
              
              {/* Nav & Info Pages */}
              <Route path="/categories" element={<Categories />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<Blog />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route 
                path="/value-our-tools" 
                element={
                  localStorage.getItem("tooleefy_hide_value_page") === "true" 
                    ? <Navigate to="/" replace /> 
                    : <ValueTools />
                } 
              />
              
              {/* Dashboards */}
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Settings */}
              <Route path="/settings/account" element={<SettingsPage defaultTab="account" />} />
              <Route path="/settings/preferences" element={<SettingsPage defaultTab="preferences" />} />
              
              {/* Legal */}
              <Route path="/privacy" element={<Legal type="privacy" />} />
              <Route path="/terms" element={<Legal type="terms" />} />
              <Route path="/cookies" element={<Legal type="cookies" />} />
              
              {/* Auth */}
              <Route path="/login" element={<Auth type="login" />} />
              <Route path="/register" element={<Auth type="register" />} />

              {/* 404 */}
              <Route path="*" element={
                <div className="container py-40 text-center">
                  <h1 className="text-8xl font-black text-primary tracking-tighter mb-4">404</h1>
                  <p className="text-xl font-bold text-dark mb-8 uppercase tracking-widest">Page not found</p>
                  <Link to="/" className="text-slate-500 hover:text-primary font-bold">Return to home →</Link>
                </div>
              } />
            </Routes>
          </Suspense>
        </main>
        <div className="container mx-auto px-6 max-w-7xl">
          <AdSenseUnit slot="7940156299" type="leaderboard" className="mt-8 mb-4" />
        </div>
        <Footer />
        <Toaster />
      </div>
    </BrowserRouter>
    </ThemeProvider>
  );
}

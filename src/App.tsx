import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { trackPageView } from "@/utils/analytics";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Home } from "@/app/Home";
import { Toaster } from "@/components/ui/sonner";
import { UnitsConverter } from "@/features/converter/UnitsConverter";
import { QRCodeGenerator } from "@/features/qr/QRCodeGenerator";
import { BarcodeGenerator } from "@/features/barcode/BarcodeGenerator";
import { InvoiceGenerator } from "@/features/invoice/InvoiceGenerator";
import { Categories } from "@/app/Categories";
import { About } from "@/app/About";
import { FAQ, Contact } from "@/app/Support";
import { Blog, Legal } from "@/app/Articles";
import { Auth } from "@/app/Auth";
import { UserDashboard } from "@/app/UserDashboard";
import { AdminDashboard } from "@/app/AdminDashboard";
import { SettingsPage } from "@/app/SettingsPage";
import { ValueTools } from "@/app/ValueTools";
import { ThemeProvider } from "@/components/ThemeContext";
import { ScrollToTop } from "@/components/ScrollToTop";

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

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <ScrollToTop />
      <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools/invoice" element={<InvoiceGenerator />} />
            <Route path="/tools/qr" element={<QRCodeGenerator />} />
            <Route path="/tools/barcode" element={<BarcodeGenerator />} />
            <Route path="/tools/converter" element={<UnitsConverter />} />
            
            {/* Nav & Info Pages */}
            <Route path="/categories" element={<Categories />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/value-our-tools" element={<ValueTools />} />
            
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
        </main>
        <Footer />
        <Toaster />
      </div>
    </BrowserRouter>
    </ThemeProvider>
  );
}

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  User, 
  Settings, 
  ShieldCheck, 
  Sparkles, 
  Save, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Globe, 
  Image as ImageIcon,
  Key,
  Database,
  Download,
  Upload,
  RefreshCw,
  Bell,
  Eye,
  EyeOff,
  Palette,
  BarChart3,
  BookOpen
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { useTheme } from "@/components/ThemeContext";
import { supabase } from "@/supabase/client";
import { AdminStats } from "@/components/AdminStats";
import { AdminBlogManager } from "@/components/AdminBlogManager";

// Helper to draw brand logo + text directly on HTML5 Canvas
function drawLogoPreview(
  canvas: HTMLCanvasElement, 
  scale: number, 
  bg: 'transparent' | 'white' | 'dark-emerald', 
  iconBg: string, 
  iconSym: string, 
  textCol: string,
  textVal: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background Fill
  if (bg === "white") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);
  } else if (bg === "dark-emerald") {
    ctx.fillStyle = "#0B1612";
    ctx.fillRect(0, 0, w, h);
  }

  // Draw Logo Block
  const iconSize = 80 * scale;
  const iconX = 40 * scale;
  const iconY = (h - iconSize) / 2;

  ctx.save();
  ctx.translate(iconX, iconY);

  // Background Box (Rounded Rectangle with high compatibility)
  ctx.fillStyle = iconBg;
  const r = 20 * scale;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(0, 0, iconSize, iconSize, r);
  } else {
    ctx.moveTo(r, 0);
    ctx.lineTo(iconSize - r, 0);
    ctx.quadraticCurveTo(iconSize, 0, iconSize, r);
    ctx.lineTo(iconSize, iconSize - r);
    ctx.quadraticCurveTo(iconSize, iconSize, iconSize - r, iconSize);
    ctx.lineTo(r, iconSize);
    ctx.quadraticCurveTo(0, iconSize, 0, iconSize - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
  }
  ctx.fill();

  // Decorative inner line
  ctx.strokeStyle = iconSym;
  ctx.lineWidth = 1.5 * scale;
  ctx.globalAlpha = 0.25;
  const pad = 8 * scale;
  const padR = (20 - 4) * scale;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(pad, pad, iconSize - pad * 2, iconSize - pad * 2, padR);
  } else {
    ctx.rect(pad, pad, iconSize - pad * 2, iconSize - pad * 2);
  }
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // Draw T Glyph from Logo.tsx path
  ctx.save();
  ctx.scale(iconSize / 100, iconSize / 100);
  ctx.fillStyle = iconSym;
  
  // High accuracy vector rendering
  const tPath = new Path2D("M22 20 H78 L74 35 H56 L46 80 H30 L40 35 H22 Z");
  ctx.fill(tPath);

  // High accuracy dot rendering
  ctx.beginPath();
  ctx.arc(78, 74, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore(); // restore icon container translation

  // Draw Text "Tooleefy" with display font style
  const fontPt = 48 * scale;
  const textX = (40 + 80 + 20) * scale;
  const textY = h / 2 + (15 * scale); // alignment adjust

  ctx.fillStyle = textCol;
  ctx.font = `900 ${fontPt}px "Plus Jakarta Sans", "Inter", sans-serif`;
  ctx.fillText(textVal, textX, textY);
}

export function SettingsPage({ defaultTab }: { defaultTab?: "account" | "preferences" | "analytics" | "blog" }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  // Get active tab from URL search parameter or fallback
  const tabParam = searchParams.get("tab");
  const activeTab = 
    tabParam === "preferences" || defaultTab === "preferences" ? "preferences" :
    tabParam === "analytics" || defaultTab === "analytics" ? "analytics" :
    tabParam === "blog" || defaultTab === "blog" ? "blog" :
    defaultTab || "account";

  // Real user state from local storage / fallback
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : {
        id: "",
        name: "Guest User",
        email: "guest@example.com",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Guest&backgroundColor=0284c7,3b82f6,0ea5e9,10b981,6366f1,7c3aed",
        role: "user"
      };
    } catch {
      return {
        id: "",
        name: "Guest User",
        email: "guest@example.com",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Guest&backgroundColor=0284c7,3b82f6,0ea5e9,10b981,6366f1,7c3aed",
        role: "user"
      };
    }
  });

  // Account Form states
  const [fullName, setFullName] = useState(user.name || "");
  const [userEmail, setUserEmail] = useState(user.email || "");
  const [company, setCompany] = useState(() => localStorage.getItem("company") || "Tooleefy Workspace Inc.");
  const [jobTitle, setJobTitle] = useState(() => localStorage.getItem("job_title") || "General Member");
  const [avatarSeed, setAvatarSeed] = useState(() => {
    // extract seed if it was a dicebear svg
    const match = user.avatar?.match(/seed=([^&]+)/);
    return match ? match[1] : (user.name || "user-seed");
  });

  // Password / security states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Preferences Form states
  const [defaultCurrency, setDefaultCurrency] = useState(() => localStorage.getItem("pref_currency") || "USD");
  const [defaultFormat, setDefaultFormat] = useState(() => localStorage.getItem("pref_barcode") || "CODE128");
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("pref_sound") !== "false");
  const [syncHistory, setSyncHistory] = useState(() => localStorage.getItem("pref_sync") !== "false");
  const [notifyUpdates, setNotifyUpdates] = useState(() => localStorage.getItem("pref_updates") !== "false");
  const [prefLang, setPrefLang] = useState(() => localStorage.getItem("pref_lang") || "en");
  const [qrColor, setQrColor] = useState(() => localStorage.getItem("pref_qr_color") || "#0F172A");

  // Logo Downloader and Customizer states
  const [logoMode, setLogoMode] = useState<'light' | 'dark' | 'emerald' | 'mono'>('light');
  const [logoPreviewBg, setLogoPreviewBg] = useState<'checkboard' | 'light' | 'dark'>('checkboard');
  const [logoHighRes, setLogoHighRes] = useState<boolean>(true);
  const [logoCustomText, setLogoCustomText] = useState<string>("Tooleefy");
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Logo Redraw Engine hook
  useEffect(() => {
    if (activeTab !== "preferences") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let iconBg = "#006241"; // Brand main emerald color
    let iconSym = "#FFFFFF";
    let textVal = "#006241";

    if (logoMode === "dark") {
      iconBg = "#006241";
      iconSym = "#FFFFFF";
      textVal = "#FFFFFF";
    } else if (logoMode === "emerald") {
      iconBg = "#FFFFFF";
      iconSym = "#006241";
      textVal = "#006241";
    } else if (logoMode === "mono") {
      iconBg = "#1E3932";
      iconSym = "#FFFFFF";
      textVal = "#1E3932";
    }

    let bgOpt: 'transparent' | 'white' | 'dark-emerald' = "transparent";
    if (logoPreviewBg === "light") bgOpt = "white";
    if (logoPreviewBg === "dark") bgOpt = "dark-emerald";

    drawLogoPreview(canvas, 1, bgOpt, iconBg, iconSym, textVal, logoCustomText);
  }, [logoMode, logoPreviewBg, activeTab, logoCustomText]);

  // High-Resolution PNG Logo Exporter download trigger
  const handleDownloadLogo = () => {
    const exportMultiplier = logoHighRes ? 3 : 1;
    const tempCanvas = document.createElement("canvas");
    // Standard layout box is 520x160.
    tempCanvas.width = 520 * exportMultiplier;
    tempCanvas.height = 160 * exportMultiplier;

    let iconBg = "#006241";
    let iconSym = "#FFFFFF";
    let textVal = "#006241";

    if (logoMode === "dark") {
      iconBg = "#006241";
      iconSym = "#FFFFFF";
      textVal = "#FFFFFF";
    } else if (logoMode === "emerald") {
      iconBg = "#FFFFFF";
      iconSym = "#006241";
      textVal = "#006241";
    } else if (logoMode === "mono") {
      iconBg = "#1E3932";
      iconSym = "#FFFFFF";
      textVal = "#1E3932";
    }

    let bgOpt: 'transparent' | 'white' | 'dark-emerald' = "transparent";
    if (logoPreviewBg === "light") bgOpt = "white";
    if (logoPreviewBg === "dark") bgOpt = "dark-emerald";

    drawLogoPreview(tempCanvas, exportMultiplier, bgOpt, iconBg, iconSym, textVal, logoCustomText);

    try {
      const dataUrl = tempCanvas.toDataURL("image/png");
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataUrl);
      downloadAnchor.setAttribute(
        "download", 
        `tooleefy_logo_${logoMode}_${logoHighRes ? '3x_retina' : '1x_standard'}.png`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Prinstine Tooleefy logo asset converted and downloaded successfully!");
    } catch (e: any) {
      toast.error("Canvas export failed: " + e.message);
    }
  };

  // Load latest user details
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        setFullName(u.name || "");
        setUserEmail(u.email || "");
      } catch (e) {
        console.error("Error reading stored user sessions", e);
      }
    }
  }, []);

  // Update DiceBear Avatar Seed on demand
  const handleGenerateNewAvatar = () => {
    const randomSeeds = ["superman", "batman", "matrix", "neo", "goku", "phoenix", "wizard", "starlord", "spark", "comet", "galaxy", "stellar"];
    const randomSeed = randomSeeds[Math.floor(Math.random() * randomSeeds.length)] + "-" + Math.floor(Math.random() * 1000);
    setAvatarSeed(randomSeed);
    toast.success("Random avatar seed populated! Save changes to apply.");
  };

  // Change tab handler
  const setTab = (tab: "account" | "preferences" | "analytics" | "blog") => {
    setSearchParams({ tab });
  };

  // Handler: Save Account Details
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    try {
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=0284c7,3b82f6,0ea5e9,10b981,6366f1,7c3aed`;
      const updatedUser = {
        ...user,
        name: fullName.trim(),
        email: userEmail.trim(),
        avatar: avatarUrl
      };

      // 1. Sync backend Supabase session metadata if logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: fullName.trim(),
            avatar_url: avatarUrl
          }
        });
        if (error) {
          console.warn("Could not sync profile settings to cloud db, using local storage cache:", error.message);
        }
      }

      // 2. Persist in local storage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("company", company);
      localStorage.setItem("job_title", jobTitle);
      
      setUser(updatedUser);
      toast.success("Profile details saved and synchronized successfully!");
      
      // Dispatch storage event to trigger immediate Navbar re-renders
      window.dispatchEvent(new Event("storage"));
    } catch (err: any) {
      toast.error("Error occurred while saving profile changes: " + err.message);
    }
  };

  // Handler: Save Preferences Details
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      localStorage.setItem("pref_currency", defaultCurrency);
      localStorage.setItem("pref_barcode", defaultFormat);
      localStorage.setItem("pref_sound", String(soundEnabled));
      localStorage.setItem("pref_sync", String(syncHistory));
      localStorage.setItem("pref_updates", String(notifyUpdates));
      localStorage.setItem("pref_lang", prefLang);
      localStorage.setItem("pref_qr_color", qrColor);

      toast.success("Your customized preference configurations were updated!");
    } catch {
      toast.error("Failed to store updated preferences.");
    }
  };

  // Handler: Update secure password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwords.new || passwords.new.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error("New password and confirm password fields must match.");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Simulated local fallback for demo profiles
        toast.info("Local profile password simulated changed successfully!");
        setPasswords({ current: "", new: "", confirm: "" });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      toast.success("Your secure gateway login password has been updated in Supabase!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to update security credentials.");
    }
  };

  // Handler: Backup Export / Download data
  const handleExportDataFallback = () => {
    const personalBackup = {
      user,
      appState: {
        company,
        jobTitle,
        preferences: {
          defaultCurrency,
          defaultFormat,
          soundEnabled,
          syncHistory,
          notifyUpdates,
          prefLang,
          qrColor
        }
      },
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(personalBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tooleefy_backup_${user.name.replace(/\s+/g, "_").toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("All settings and configurations downloaded successfully!");
  };

  // Handler: Clear Workspace local cache
  const handleClearWorkspaceCache = () => {
    if (window.confirm("Are you sure you want to clear your local tool recents and presets cache? This will reset custom default formats & local templates but will keep your active Cloud account intact.")) {
      const savedUser = localStorage.getItem("user");
      localStorage.clear();
      if (savedUser) {
        localStorage.setItem("user", savedUser); // Preserve login
      }
      toast.success("Workspace cache successfully cleared.");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  // Check if user is admin or is added in the registered users cache (team members)
  const isAdmin = user.role === "admin" || user.email?.toLowerCase() === "najehbenmohamed0012@gmail.com";
  let isAddedByAdmin = false;
  try {
    const cachedUsers = localStorage.getItem("registered_users_cache");
    if (cachedUsers) {
      const list = JSON.parse(cachedUsers);
      if (Array.isArray(list)) {
        isAddedByAdmin = list.some((u: any) => u && u.email && u.email.toLowerCase() === user.email?.toLowerCase());
      }
    }
  } catch (e) {
    // ignore
  }
  const showOrgFields = isAdmin || isAddedByAdmin;

  return (
    <div className="bg-background min-h-screen">
      <PageHeader 
        title="Command & Controls" 
        description="Optimize, customize, and secure your professional multi-tool utility workstation."
        badge="Active Configuration"
      />

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Sidebar navigation */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 border-none shadow-premium rounded-[2rem] bg-card">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setTab("account")}
                  className={`flex items-center gap-4 w-full p-4 rounded-2xl cursor-pointer text-left transition-all ${
                    activeTab === "account" 
                      ? "bg-primary text-white font-black" 
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-bold"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Account Details</span>
                </button>

                <button
                  onClick={() => setTab("preferences")}
                  className={`flex items-center gap-4 w-full p-4 rounded-2xl cursor-pointer text-left transition-all ${
                    activeTab === "preferences" 
                      ? "bg-primary text-white font-black" 
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-bold"
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Preferences</span>
                </button>

                {isAdmin && (
                  <>
                    <button
                      onClick={() => setTab("analytics")}
                      className={`flex items-center gap-4 w-full p-4 rounded-2xl cursor-pointer text-left transition-all ${
                        activeTab === "analytics" 
                          ? "bg-primary text-white font-black" 
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-bold"
                      }`}
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span>Admin Analytics</span>
                    </button>

                    <button
                      onClick={() => setTab("blog")}
                      className={`flex items-center gap-4 w-full p-4 rounded-2xl cursor-pointer text-left transition-all ${
                        activeTab === "blog" 
                          ? "bg-primary text-white font-black" 
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-bold"
                      }`}
                    >
                      <BookOpen className="w-5 h-5" />
                      <span>Blog Manager</span>
                    </button>
                  </>
                )}
              </div>

              <div className="h-px bg-slate-100 dark:bg-white/5 my-6" />

              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Security Gateway</p>
                <div className="p-4 bg-muted/50 rounded-2xl border border-border/40 text-center">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-foreground">Cryptographic Shield</p>
                  <p className="text-[10px] text-muted-foreground mt-1">End-to-end sandbox storage active</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Active Settings Panel */}
          <div className="lg:col-span-3">
            {activeTab === "account" && (
              <div className="space-y-8">
                {/* Profile Form */}
                <Card className="p-8 md:p-12 border-none shadow-premium rounded-[2.5rem] bg-card">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6 mb-8">
                    <div>
                      <h3 className="text-2xl font-black italic uppercase text-foreground">Profile Information</h3>
                      <p className="text-sm text-muted-foreground font-medium mt-1">Update your general details and your avatars instantly.</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <User className="w-5 h-5" />
                    </div>
                  </div>

                  <form onSubmit={handleSaveAccount} className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center bg-muted/20 p-6 rounded-3xl border border-border/40">
                      {/* Avatar preview */}
                      <div className="relative group shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/20">
                        <img 
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=0284c7,3b82f6,0ea5e9,10b981,6366f1,7c3aed`}
                          alt="Avatar Seed Preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={handleGenerateNewAvatar}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                          title="Generate Seed"
                        >
                          <RefreshCw className="w-5 h-5 animate-spin-hover" />
                        </button>
                      </div>

                      <div className="flex-grow space-y-2">
                        <Label htmlFor="avatarSeed" className="text-xs font-black uppercase tracking-wider text-slate-500">Avatar Seed Variant</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="avatarSeed"
                            value={avatarSeed}
                            onChange={(e) => setAvatarSeed(e.target.value)}
                            placeholder="Enter any word or name"
                            className="h-12 rounded-xl"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleGenerateNewAvatar}
                            className="rounded-xl h-12 gap-1 font-bold shrink-0"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-primary" /> Random
                          </Button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Any string will generate a distinct visual vector avatar model.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-wider text-slate-500">Full Display Name</Label>
                        <Input 
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your Name"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userEmail" className="text-xs font-black uppercase tracking-wider text-slate-500">Email Address</Label>
                        <Input 
                          id="userEmail"
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="your.email@domain.com"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      {showOrgFields && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="company" className="text-xs font-black uppercase tracking-wider text-slate-500">Organization / Corporate Group</Label>
                            <Input 
                              id="company"
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              placeholder="Enterprise Group"
                              className="h-12 rounded-xl"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="jobTitle" className="text-xs font-black uppercase tracking-wider text-slate-500">Workspace Member Title</Label>
                            <Input 
                              id="jobTitle"
                              value={jobTitle}
                              onChange={(e) => setJobTitle(e.target.value)}
                              placeholder="Creative Consultant"
                              className="h-12 rounded-xl"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-secondary transition-colors">
                        <Save className="w-4 h-4" /> Save Attributes
                      </Button>
                    </div>
                  </form>
                </Card>

                {/* Secure Gate Update Password */}
                <Card className="p-8 md:p-12 border-none shadow-premium rounded-[2.5rem] bg-card">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6 mb-8">
                    <div>
                      <h3 className="text-2xl font-black italic uppercase text-foreground">Secure Passkey Gateway</h3>
                      <p className="text-sm text-muted-foreground font-medium mt-1">Configure your login credentials and key security values.</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Key className="w-5 h-5" />
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPass" className="text-xs font-black uppercase tracking-wider text-slate-500">Current Gateway Pass</Label>
                        <div className="relative">
                          <Input 
                            id="currentPass"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwords.current}
                            onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                            placeholder="Enter current password"
                            className="h-12 rounded-xl pr-10"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPass" className="text-xs font-black uppercase tracking-wider text-slate-500">New Gateway Pass</Label>
                        <div className="relative">
                          <Input 
                            id="newPass"
                            type={showNewPassword ? "text" : "password"}
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            placeholder="6+ characters"
                            className="h-12 rounded-xl pr-10"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPass" className="text-xs font-black uppercase tracking-wider text-slate-500">Confirm Gateway Pass</Label>
                        <Input 
                          id="confirmPass"
                          type="password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                          placeholder="Confirm new password"
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" variant="outline" className="h-14 px-8 rounded-2xl border-border font-bold hover:border-primary transition-all">
                        Update Gateway Password
                      </Button>
                    </div>
                  </form>
                </Card>

                {/* Backup & System Tools */}
                <Card className="p-8 md:p-12 border-none shadow-premium rounded-[2.5rem] bg-card">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6 mb-8">
                    <div>
                      <h3 className="text-2xl font-black italic uppercase text-foreground">Integrity & Utilities</h3>
                      <p className="text-sm text-muted-foreground font-medium mt-1">Export, Backup, or Wipe localized workspace parameters.</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Database className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-muted/20 border border-border/40 rounded-3xl flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-foreground uppercase tracking-tight">Personal Data Portability</h4>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          Download a compiled structured backup containing your user preferences, profile metadata, and workspace configuration configurations for safe keeping.
                        </p>
                      </div>
                      <Button 
                        onClick={handleExportDataFallback}
                        className="mt-6 w-full h-12 bg-primary/10 text-primary font-bold rounded-xl border border-primary/25 hover:bg-primary hover:text-white transition-all gap-2"
                      >
                        <Download className="w-4 h-4" /> Export Config JSON
                      </Button>
                    </div>

                    <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-red-500 uppercase tracking-tight">Danger Zone Operations</h4>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          Wipe localized cache parameters, remove profile presets, and clean your browser's persistent key-val storage for a fresh security pass.
                        </p>
                      </div>
                      <Button 
                        onClick={handleClearWorkspaceCache}
                        variant="destructive"
                        className="mt-6 w-full h-12 bg-red-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-600 transition-colors gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Purge Tool Caches
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "preferences" && (
              /* Preferences tab Section */
              <div className="space-y-8">
                <Card className="p-8 md:p-12 border-none shadow-premium rounded-[2.5rem] bg-card">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6 mb-8">
                    <div>
                      <h3 className="text-2xl font-black italic uppercase text-foreground">Workflow Configurations</h3>
                      <p className="text-sm text-muted-foreground font-medium mt-1">Set localized default options for our document generator, barcode styles, and theme skins.</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Settings className="w-5 h-5" />
                    </div>
                  </div>

                  <form onSubmit={handleSavePreferences} className="space-y-8">

                    {/* App Themes Control */}
                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-primary" /> Active Canvas Layout Skin
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => { if (theme === "dark") toggleTheme(); }}
                          className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer border text-left transition-all ${
                            theme === "light" 
                              ? "border-primary bg-primary/5 dark:bg-primary/5 text-slate-900" 
                              : "border-border bg-transparent text-slate-400"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-white border border-slate-300 shrink-0" />
                          <div>
                            <span className="font-extrabold block text-sm">Elegant Paper (Light Theme)</span>
                            <span className="text-xs text-muted-foreground font-medium">Standard eye-friendly bright canvas styled for daily business use.</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => { if (theme === "light") toggleTheme(); }}
                          className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer border text-left transition-all ${
                            theme === "dark" 
                              ? "border-primary bg-primary/5 text-white" 
                              : "border-border bg-transparent text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-slate-950 border border-white/20 shrink-0" />
                          <div>
                            <span className="font-extrabold block text-sm">Industrial Slate (Dark Theme)</span>
                            <span className="text-xs text-muted-foreground font-medium">High-contrast, energy-saving premium twilight interface.</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-white/5 my-4" />

                    {/* Toggle Settings */}
                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary" /> Telemetry & System Alerts
                      </Label>
                      
                      <div className="space-y-4">
                        <label className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 cursor-pointer transition-colors">
                          <input 
                            type="checkbox"
                            checked={syncHistory}
                            onChange={(e) => setSyncHistory(e.target.checked)}
                            className="mt-1 w-4.5 h-4.5 accent-primary cursor-pointer rounded-lg shrink-0"
                          />
                          <div>
                            <span className="font-extrabold block text-sm text-foreground">Real-time Cloud Sync</span>
                            <span className="text-xs text-muted-foreground block font-medium mt-0.5">Automatically register generated invoice IDs, QR codes, and barcodes within your Cloud database history.</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 cursor-pointer transition-colors">
                          <input 
                            type="checkbox"
                            checked={notifyUpdates}
                            onChange={(e) => setNotifyUpdates(e.target.checked)}
                            className="mt-1 w-4.5 h-4.5 accent-primary cursor-pointer rounded-lg shrink-0"
                          />
                          <div>
                            <span className="font-extrabold block text-sm text-foreground">Updates & Newsletter Notifications</span>
                            <span className="text-xs text-muted-foreground block font-medium mt-0.5">Stay updated with newly integrated modern utility tools and business features.</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-secondary transition-colors">
                        <Save className="w-4 h-4" /> Save Preferences
                      </Button>
                    </div>
                  </form>
                </Card>

                {/* Brand Asset Center: Logo Builder & Exporter */}
                {isAdmin && (
                  <Card className="p-8 md:p-12 border-none shadow-premium rounded-[2.5rem] bg-card mt-8">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6 mb-8">
                      <div>
                        <h3 className="text-2xl font-black italic uppercase text-foreground">Platform Logo Workspace</h3>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                          Configure layout templates, preview brand assets, and download Tooleefy corporate logo assets built directly from source code as transparent PNG vectors.
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                      {/* Live Canvas Preview Panel */}
                      <div className="xl:col-span-7 space-y-4">
                        <div className="text-xs font-black uppercase tracking-wider text-slate-500">Live Brand Preview (520 x 160)</div>
                        
                        {/* Checkboard preview container */}
                        <div className="relative rounded-[2rem] border-2 border-dashed border-border overflow-hidden flex items-center justify-center p-6 min-h-[220px]">
                          {logoPreviewBg === "checkboard" && (
                            <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none" style={{
                              backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
                              backgroundSize: "16px 16px"
                            }} />
                          )}
                          <canvas 
                            ref={canvasRef} 
                            width={520} 
                            height={160} 
                            className={`relative max-w-full rounded-2xl shadow-premium z-10 transition-all border ${
                              logoPreviewBg === "light" ? "bg-white border-slate-300/45" : 
                              logoPreviewBg === "dark" ? "bg-slate-950 border-white/5" : 
                              "bg-transparent border-dashed border-slate-300/30"
                            }`}
                          />
                        </div>

                        {/* Preview Background Selection */}
                        <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-2xl text-xs">
                          <span className="font-bold text-muted-foreground">Preview Backing:</span>
                          <div className="flex gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setLogoPreviewBg("checkboard")}
                              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                                logoPreviewBg === "checkboard" ? "bg-primary text-white" : "hover:bg-muted font-semibold text-foreground/80"
                              }`}
                            >
                              Adaptive Dot-Grid
                            </button>
                            <button
                              type="button"
                              onClick={() => setLogoPreviewBg("light")}
                              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                                logoPreviewBg === "light" ? "bg-primary text-white" : "hover:bg-muted font-semibold text-foreground/80"
                              }`}
                            >
                              Bright White
                            </button>
                            <button
                              type="button"
                              onClick={() => setLogoPreviewBg("dark")}
                              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                                logoPreviewBg === "dark" ? "bg-primary text-white" : "hover:bg-muted font-semibold text-foreground/80"
                              }`}
                            >
                              Dark Emerald
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Logo Control Panel */}
                      <div className="xl:col-span-5 space-y-6 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Logo Style Preset</Label>
                            <p className="text-[10px] text-muted-foreground">Switch the corporate color palette of the download packet.</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setLogoMode("light")}
                              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                logoMode === "light" 
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/25" 
                                  : "border-border hover:bg-muted/50"
                              }`}
                            >
                              <span className="text-xs font-black block text-foreground">Standard Light Logo</span>
                              <span className="text-[9px] text-muted-foreground mt-1 block">Green Icon Block<br />Green Corporate Text</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setLogoMode("dark")}
                              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                logoMode === "dark" 
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/25" 
                                  : "border-border hover:bg-muted/50"
                              }`}
                            >
                              <span className="text-xs font-black block text-foreground">Standard Dark Logo</span>
                              <span className="text-[9px] text-muted-foreground mt-1 block">Green Icon Block<br />Bright White Text</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setLogoMode("emerald")}
                              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                logoMode === "emerald" 
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/25" 
                                  : "border-border hover:bg-muted/50"
                              }`}
                            >
                              <span className="text-xs font-black block text-foreground">Minimal Invert Logo</span>
                              <span className="text-[9px] text-muted-foreground mt-1 block">White Icon Block<br />Green Corporate Text</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setLogoMode("mono")}
                              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                logoMode === "mono" 
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/25" 
                                  : "border-border hover:bg-muted/50"
                              }`}
                            >
                              <span className="text-xs font-black block text-foreground">Forest Luxury Logo</span>
                              <span className="text-[9px] text-muted-foreground mt-1 block">Dark Moss Icon Block<br />Dark Moss Text</span>
                            </button>
                          </div>

                          {/* Custom Core Text */}
                          <div className="space-y-4 pt-2">
                            <Label htmlFor="logoCustomText" className="text-xs font-black uppercase tracking-wider text-slate-500">Logo Headline Text</Label>
                            <Input 
                              id="logoCustomText"
                              value={logoCustomText}
                              onChange={(e) => setLogoCustomText(e.target.value.substring(0, 24))}
                              placeholder="Branding word"
                              className="h-11 rounded-xl"
                            />
                          </div>

                          {/* Resolution toggle */}
                          <div className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border border-border/40">
                            <div>
                              <span className="text-xs font-black block text-foreground">Retina High Resolution</span>
                              <span className="text-[9.5px] text-muted-foreground">Applies 3x dynamic multiplier vector scaling (1560x480 png)</span>
                            </div>
                            <input 
                              type="checkbox"
                              checked={logoHighRes}
                              onChange={(e) => setLogoHighRes(e.target.checked)}
                              aria-label="Retina High Resolution"
                              className="w-4.5 h-4.5 accent-primary rounded-lg shrink-0 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Download Executable */}
                        <Button
                          type="button"
                          onClick={handleDownloadLogo}
                          className="w-full h-14 bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-widest text-xs rounded-2xl border-2 border-emerald-950/20 border-b-[6px] hover:border-b-[4px] active:border-b-2 active:translate-y-[4px] transition-all gap-2 cursor-pointer shadow-premium"
                        >
                          <Download className="w-4 h-4" /> Export Brand PNG Logo
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "analytics" && isAdmin && (
              <div className="space-y-8">
                <AdminStats />
              </div>
            )}

            {activeTab === "blog" && isAdmin && (
              <div className="space-y-8">
                <AdminBlogManager />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

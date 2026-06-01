import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Settings, User, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/supabase/client";

export function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Initial Local Check
    const storedUser = localStorage.getItem("user");
    let isSimulated = false;
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed?.simulation) {
          isSimulated = true;
        }
      } catch (err) {
        // ignore
      }
    }

    // 2. Fetch current Supabase user session for accuracy, wrapped in a 1.5s timeout.
    Promise.race([
      supabase.auth.getSession(),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500))
    ]).then(({ data }) => {
      const session = data?.session;
      if (session?.user) {
        const uName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "User";
        const profileUser = {
          id: session.user.id,
          name: uName,
          email: session.user.email,
          avatar: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(uName)}&backgroundColor=0284c7,3b82f6,0ea5e9,10b981,6366f1,7c3aed`,
          role: (session.user.email?.toLowerCase().includes("admin") || session.user.email?.toLowerCase() === "najehbenmohamed0012@gmail.com") ? "admin" : "user"
        };
        setUser(profileUser);
        localStorage.setItem("user", JSON.stringify(profileUser));
      } else if (!isSimulated) {
        setUser(null);
        localStorage.removeItem("user");
      }
    }).catch(() => {
      // Supabase is paused or unreachable. Preserve workspace local/simulated session to prevent auto sign-out.
      console.log("Supabase connection timed out. Working in high-integrity local mode.");
    });

    // 3. Keep standard listener active for real-time authentication state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const uName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "User";
        const profileUser = {
          id: session.user.id,
          name: uName,
          email: session.user.email,
          avatar: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(uName)}&backgroundColor=0284c7,3b82f6,0ea5e9,10b981,6366f1,7c3aed`,
          role: (session.user.email?.toLowerCase().includes("admin") || session.user.email?.toLowerCase() === "najehbenmohamed0012@gmail.com") ? "admin" : "user"
        };
        setUser(profileUser);
        localStorage.setItem("user", JSON.stringify(profileUser));
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    setUser(null);
    window.location.assign("/");
  };

  return (
    <nav className="sticky top-0 z-50 h-20 w-full glass-nav">
      <div className="w-full max-w-none px-6 md:px-12 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <Logo className="w-10 h-10 group-hover:rotate-[15deg] group-hover:scale-110" />
          <span className="text-2xl font-black tracking-tight text-primary dark:text-white transition-colors duration-500">Tooleefy</span>
        </Link>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8 text-sm font-black uppercase tracking-[0.2em]">
            <Link to="/categories" className="text-primary dark:text-white font-extrabold hover:opacity-80 transition-opacity">Tools</Link>
            <Link to="/faq" className="text-primary dark:text-white font-extrabold hover:opacity-80 transition-opacity">FAQ</Link>
          </div>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-4" />
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="relative group focus:outline-none w-10 h-10 rounded-2xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-all p-0.5 cursor-pointer flex items-center justify-center bg-card"
                >
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-[0.6rem]" />
                </button>
                {/* Connected Mark Animation */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 pointer-events-none">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
                </span>

                {isProfileOpen && (
                  <>
                    {/* Backdrop/Overlay to dismiss */}
                    <div 
                      className="fixed inset-0 z-40 bg-transparent cursor-default" 
                      onClick={() => setIsProfileOpen(false)} 
                    />
                    
                    {/* Dropdown Menu Container */}
                    <div className="absolute right-0 mt-3 w-64 rounded-2xl p-2 border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-slate-900 z-50 flex flex-col gap-1 origin-top-right">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-black leading-none text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs font-bold leading-none text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate(user.role === 'admin' ? "/admin" : "/dashboard");
                        }} 
                        className="flex items-center gap-3 w-full p-3 rounded-xl cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group focus:outline-none text-slate-800 dark:text-slate-200"
                      >
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-bold text-sm">{user.role === 'admin' ? "Admin Console" : "My Dashboard"}</span>
                      </button>

                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/settings/account");
                        }} 
                        className="flex items-center gap-3 w-full p-3 rounded-xl cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group focus:outline-none text-slate-800 dark:text-slate-200"
                      >
                        <User className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-bold text-sm">Account Settings</span>
                      </button>

                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/settings/preferences");
                        }} 
                        className="flex items-center gap-3 w-full p-3 rounded-xl cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group focus:outline-none text-slate-800 dark:text-slate-200"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-bold text-sm">Preferences</span>
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />

                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }} 
                        className="flex items-center gap-3 w-full p-3 rounded-xl cursor-pointer text-left hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors group focus:outline-none"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span className="font-bold text-sm">Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-sm font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors">Sign In</Link>
            )}
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          {user && (
            <Link to={user.role === 'admin' ? "/admin" : "/dashboard"} className="relative mr-2 cursor-pointer block">
              <div className="w-8 h-8 rounded-xl overflow-hidden border-2 border-primary/20">
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900">
                 <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
              </span>
            </Link>
          )}
          <button className="p-2 text-dark dark:text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 p-6 flex flex-col gap-6 shadow-2xl z-40"
        >
          <div className="flex flex-col gap-4 text-sm font-black uppercase tracking-[0.2em]">
            {user && (
              <Link to={user.role === 'admin' ? "/admin" : "/dashboard"} onClick={() => setIsOpen(false)} className="text-primary">
                {user.role === 'admin' ? "Admin Console" : "My Dashboard"}
              </Link>
            )}
            <Link to="/categories" onClick={() => setIsOpen(false)} className="text-primary dark:text-white font-extrabold">Tools</Link>
            <Link to="/faq" onClick={() => setIsOpen(false)} className="text-primary dark:text-white font-extrabold">FAQ</Link>
          </div>
          <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex flex-col gap-3">
            {user ? (
              <button 
                onClick={handleLogout}
                className="w-full h-12 bg-red-50 text-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <Link to="/login" className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center" onClick={() => setIsOpen(false)}>Sign In</Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}

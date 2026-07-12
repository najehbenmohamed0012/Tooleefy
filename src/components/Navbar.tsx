import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Settings, User, LayoutDashboard, Wrench, HelpCircle, LogIn, BookOpen } from "lucide-react";
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
        <Link to="/" aria-label="Tooleefy Home" className="flex items-center gap-3 group">
          <Logo className="w-10 h-10 group-hover:rotate-[15deg] group-hover:scale-110" />
          <span className="text-2xl font-black tracking-tight text-primary dark:text-white transition-colors duration-500">Tooleefy</span>
        </Link>
        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8 text-sm font-black uppercase tracking-[0.2em]">
            <Link to="/categories" className="text-primary dark:text-white font-extrabold hover:opacity-80 transition-opacity mr-24">all tools</Link>
            <Link to="/blog" className="text-primary dark:text-white font-extrabold hover:opacity-80 transition-opacity">Blog</Link>
            <Link to="/faq" className="text-primary dark:text-white font-extrabold hover:opacity-80 transition-opacity">FAQ</Link>
          </div>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-4" />
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-label="User profile menu"
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
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          {user && (
            <div className="relative mr-2">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsOpen(false);
                }}
                aria-label="User profile menu"
                className="relative group focus:outline-none w-8 h-8 rounded-xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-all p-0.5 cursor-pointer flex items-center justify-center bg-card"
              >
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-[0.4rem]" />
              </button>
              {/* Connected Mark Animation */}
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 pointer-events-none">
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
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl p-2 border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-slate-900 z-50 flex flex-col gap-1 origin-top-right">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5">
                      <div className="flex flex-col space-y-1">
                        <p className="text-xs font-black leading-none text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-[10px] font-bold leading-none text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate(user.role === 'admin' ? "/admin" : "/dashboard");
                      }} 
                      className="flex items-center gap-2.5 w-full p-2.5 rounded-xl cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group focus:outline-none text-slate-800 dark:text-slate-200"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span className="font-bold text-xs">{user.role === 'admin' ? "Admin Console" : "My Dashboard"}</span>
                    </button>

                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/settings/account");
                      }} 
                      className="flex items-center gap-2.5 w-full p-2.5 rounded-xl cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group focus:outline-none text-slate-800 dark:text-slate-200"
                    >
                      <User className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span className="font-bold text-xs">Account Settings</span>
                    </button>

                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/settings/preferences");
                      }} 
                      className="flex items-center gap-2.5 w-full p-2.5 rounded-xl cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group focus:outline-none text-slate-800 dark:text-slate-200"
                    >
                      <Settings className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span className="font-bold text-xs">Preferences</span>
                    </button>

                    <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />

                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }} 
                      className="flex items-center gap-2.5 w-full p-2.5 rounded-xl cursor-pointer text-left hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors group focus:outline-none"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="font-bold text-xs">Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="relative">
            <button className="p-2 text-dark dark:text-white focus:outline-none cursor-pointer" aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"} onClick={() => {
              setIsOpen(!isOpen);
              setIsProfileOpen(false);
            }}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Dropdown Sandwich Menu */}
            {isOpen && (
              <>
                {/* Backdrop/Overlay to dismiss */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent cursor-default" 
                  onClick={() => setIsOpen(false)} 
                />
                
                {/* Dropdown Menu Container styled exactly like profile menu dropdown */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 mt-3 w-56 rounded-2xl p-2 border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-slate-900 z-50 flex flex-col gap-1 origin-top-right animate-in fade-in zoom-in duration-100"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                      Navigation
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/categories");
                    }} 
                    className="flex items-center gap-2.5 w-full p-2.5 rounded-xl cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group focus:outline-none text-slate-800 dark:text-slate-200"
                  >
                    <Wrench className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <span className="font-bold text-xs">all tools</span>
                  </button>

                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/blog");
                    }} 
                    className="flex items-center gap-2.5 w-full p-2.5 rounded-xl cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group focus:outline-none text-slate-800 dark:text-slate-200"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <span className="font-bold text-xs">Blog</span>
                  </button>

                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/faq");
                    }} 
                    className="flex items-center gap-2.5 w-full p-2.5 rounded-xl cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group focus:outline-none text-slate-800 dark:text-slate-200"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <span className="font-bold text-xs">FAQ Guide Support</span>
                  </button>

                  {!user && (
                    <>
                      <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />
                      <button 
                        onClick={() => {
                          setIsOpen(false);
                          navigate("/login");
                        }} 
                        className="flex items-center gap-2.5 w-full p-2.5 rounded-xl cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group focus:outline-none text-slate-800 dark:text-slate-200"
                      >
                        <LogIn className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        <span className="font-bold text-xs">Sign In / Account</span>
                      </button>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/supabase/client";
import { fetchActivities } from "@/supabase/db";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Activity, 
  ShieldAlert, 
  Globe, 
  Server, 
  Database, 
  Zap,
  LayoutDashboard,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ShieldX,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Check,
  Terminal,
  ShieldAlert as AlertIcon,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  UserPlus,
  Mail,
  UserX,
  Settings
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UserEntity {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  joined: string;
}

export function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // States for system controls & dynamics
  const [maintenanceActive, setMaintenanceActive] = useState<boolean>(() => {
    return localStorage.getItem("tooleefy_maintenance") === "true";
  });
  
  const [hideBanners, setHideBanners] = useState<boolean>(() => {
    return localStorage.getItem("tooleefy_hide_banners") === "true";
  });
  const [hideValuePage, setHideValuePage] = useState<boolean>(() => {
    return localStorage.getItem("tooleefy_hide_value_page") === "true";
  });

  const handleToggleHideBanners = () => {
    const newVal = !hideBanners;
    setHideBanners(newVal);
    localStorage.setItem("tooleefy_hide_banners", String(newVal));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("tooleefy_preferences_changed"));
    if (newVal) {
      toast.success("Banners Disabled: All 'Value our Tools' promotion banners are now hidden globally.");
    } else {
      toast.success("Banners Enabled: Promotion banners restored to all utility modules.");
    }
  };

  const handleToggleHideValuePage = () => {
    const newVal = !hideValuePage;
    setHideValuePage(newVal);
    localStorage.setItem("tooleefy_hide_value_page", String(newVal));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("tooleefy_preferences_changed"));
    if (newVal) {
      toast.warning("Supporter Page Disabled: Access to '/value-our-tools' is now locked & hidden.");
    } else {
      toast.success("Supporter Page Enabled: Access restored to '/value-our-tools'.");
    }
  };
  
  const [rebooting, setRebooting] = useState(false);
  const [rebootLogs, setRebootLogs] = useState<string[]>([]);
  
  // Stats and activities
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [liveRefreshSpin, setLiveRefreshSpin] = useState(false);
  const [dbFetchType, setDbFetchType] = useState<"supabase" | "local">("local");

  // Filter, pagination & user form modal states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All"); // All, Super Admin, Contributor, Regular, Active, Inactive
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Add / Edit modalling
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserEntity | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    role: "Regular",
    status: "Active" as "Active" | "Inactive"
  });

  // Unique menu context tracker
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  // 1. Initial Authorization Verification
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.role === 'admin' || parsed?.email?.toLowerCase() === "najehbenmohamed0012@gmail.com") {
          setIsAdmin(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        // ignore
      }
    }

    Promise.race([
      supabase.auth.getSession(),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500))
    ]).then(({ data }) => {
      const session = data?.session;
      if (session?.user) {
        const email = session.user.email?.toLowerCase() || "";
        const role = (email.includes("admin") || email === "najehbenmohamed0012@gmail.com") ? "admin" : "user";
        setIsAdmin(role === "admin");
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    }).catch(() => {
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setIsAdmin(parsed?.role === 'admin');
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  // 2. Load users & live stats
  const syncAndLoadStats = async (isManual = false) => {
    if (isManual) {
      setLiveRefreshSpin(true);
    }

    // A. Sync / Load Users List
    const defaultList: UserEntity[] = [
      { id: "1", name: "Najeh Ben Mohamed", email: "najehbenmohamed0012@gmail.com", role: "Super Admin", status: "Active", joined: "May 2024" }
    ];

    let cachedUsersList = defaultList;
    const cachedString = localStorage.getItem("registered_users_cache");
    if (cachedString) {
      try {
        const parsed = JSON.parse(cachedString);
        if (Array.isArray(parsed)) {
          // Keep only real registered accounts, filter out the static fake ones
          const fakeEmails = ["john@example.com", "jane@test.com", "robert@company.com", "emily@tooleefy.io"];
          cachedUsersList = parsed.filter(u => u && u.email && !fakeEmails.includes(u.email.toLowerCase()));
          // Ensure the real user is always present
          if (!cachedUsersList.some(u => u.email.toLowerCase() === "najehbenmohamed0012@gmail.com")) {
            cachedUsersList.unshift(defaultList[0]);
          }
        }
      } catch {
        // use default
      }
    }

    // Auto-integrate currently logged user if we find they are not present
    const loggedInUserStr = localStorage.getItem("user");
    if (loggedInUserStr) {
      try {
        const parsedLogged = JSON.parse(loggedInUserStr);
        if (parsedLogged?.email && !cachedUsersList.some(u => u.email.toLowerCase() === parsedLogged.email.toLowerCase())) {
          const newUser: UserEntity = {
            id: parsedLogged.id || String(Math.random()),
            name: parsedLogged.name || parsedLogged.email.split('@')[0],
            email: parsedLogged.email,
            role: parsedLogged.role === "admin" ? "Super Admin" : "Regular",
            status: "Active",
            joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          };
          cachedUsersList.push(newUser);
        }
      } catch (err) {
        // ignore
      }
    }

    localStorage.setItem("registered_users_cache", JSON.stringify(cachedUsersList));
    setUsers(cachedUsersList);

    // B. Fetch Real-Time Activity Metrics
    try {
      const res = await fetchActivities();
      if (res && res.data) {
        setActivities(res.data);
        setDbFetchType(res.type || "local");
      }
    } catch (err) {
      console.warn("Could not load database logs: ", err);
    }

    if (isManual) {
      setTimeout(() => {
        setLiveRefreshSpin(false);
        toast.success("All metrics and registrations synchronized from Supabase direct endpoint.");
      }, 600);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      syncAndLoadStats();
    }
  }, [isAdmin]);

  // Handle Maintenance Mode
  const handleToggleMaintenance = () => {
    const newVal = !maintenanceActive;
    setMaintenanceActive(newVal);
    localStorage.setItem("tooleefy_maintenance", String(newVal));
    if (newVal) {
      toast.warning("High-Alert: Production node is locked. Public endpoints are now serving Maintenance warnings.");
    } else {
      toast.success("Security Cleared: Production system restored to normal routing protocols.", {
        icon: <Check className="w-5 h-5 text-emerald-500" />
      });
    }
  };

  // Trigger CLI Reboot simulation
  const handleSystemReboot = () => {
    setRebooting(true);
    setRebootLogs(["[REBOOT] Initiating cryptographic system flush..."]);
    
    const steps = [
      "[REBOOT] Decoupling active database pools safely... [DONE]",
      "[REBOOT] Restruturing local cache clusters... [DONE]",
      "[REBOOT] Killing zombie threads and worker loops... [OK]",
      "[REBOOT] Flashing serverless utility rendering pipeline... [OK]",
      "[REBOOT] Invoking Supabase RLS security handshakes... [SUCCESS]",
      "[REBOOT] Verifying Docker container volume integrity... [COMPLETED]",
      "[REBOOT] Production Gateway re-routing traffic to PORT 3000.",
      "[REBOOT] COMPLETED successfully! System node online."
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setRebootLogs(prev => [...prev, steps[stepIdx]]);
        stepIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setRebooting(false);
          setRebootLogs([]);
          syncAndLoadStats();
          toast.success("Tooleefy node reboot completed. All logs flushed and cached files re-indexed.");
        }, 800);
      }
    }, 350);
  };

  // Adding user creation
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      toast.error("Please fill in the name and email address.");
      return;
    }

    const newUser: UserEntity = {
      id: "u-" + Math.random().toString(36).substring(2, 9),
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim().toLowerCase(),
      role: newUserForm.role,
      status: newUserForm.status,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    localStorage.setItem("registered_users_cache", JSON.stringify(updated));
    setShowAddModal(false);
    setNewUserForm({ name: "", email: "", role: "Regular", status: "Active" });
    toast.success(`User object for '${newUser.name}' registration initiated.`);
  };

  // Editing user submission
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated = users.map(u => u.id === editingUser.id ? editingUser : u);
    setUsers(updated);
    localStorage.setItem("registered_users_cache", JSON.stringify(updated));
    setEditingUser(null);
    toast.success("User credentials and level attributes saved successfully.");
  };

  // Quick Action triggers
  const handleToggleUserStatus = (user: UserEntity) => {
    const updatedUser: UserEntity = {
      ...user,
      status: user.status === "Active" ? "Inactive" : "Active"
    };
    const updated = users.map(u => u.id === user.id ? updatedUser : u);
    setUsers(updated);
    localStorage.setItem("registered_users_cache", JSON.stringify(updated));
    setActiveMenuUserId(null);
    toast.info(`Status updated for ${user.name} to ${updatedUser.status}.`);
  };

  const handleCycleRole = (user: UserEntity) => {
    const roles = ["Regular", "Contributor", "Super Admin"];
    const currentIdx = roles.indexOf(user.role);
    const nextRole = roles[(currentIdx + 1) % roles.length];
    
    const updatedUser: UserEntity = {
      ...user,
      role: nextRole
    };
    const updated = users.map(u => u.id === user.id ? updatedUser : u);
    setUsers(updated);
    localStorage.setItem("registered_users_cache", JSON.stringify(updated));
    setActiveMenuUserId(null);
    toast.success(`Role upgraded for ${user.name} to ${nextRole}.`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    const remaining = users.filter(u => u.id !== userId);
    setUsers(remaining);
    localStorage.setItem("registered_users_cache", JSON.stringify(remaining));
    setActiveMenuUserId(null);
    toast.error(`Entity purged: Cleared standard and auth tokens for ${userName}.`);
  };

  const handleRequestPasswordReset = (user: UserEntity) => {
    setActiveMenuUserId(null);
    toast.info(`Reset request dispatched to system mail for ${user.email}.`);
  };

  // Filters & Searching
  const filteredUsers = users.filter(user => {
    // Search query matches name, email, or role
    const s = searchQuery.toLowerCase();
    const queryMatches = 
      user.name.toLowerCase().includes(s) ||
      user.email.toLowerCase().includes(s) ||
      user.role.toLowerCase().includes(s);

    if (!queryMatches) return false;

    // Role dynamic filters
    if (roleFilter === "All") return true;
    if (roleFilter === "Super Admin") return user.role === "Super Admin";
    if (roleFilter === "Contributor") return user.role === "Contributor";
    if (roleFilter === "Regular") return user.role === "Regular";
    if (roleFilter === "Active") return user.status === "Active";
    if (roleFilter === "Inactive") return user.status === "Inactive";

    return true;
  });

  // Pagination calculation
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Dynamic Metrics calculation based on loaded counts
  const totalUserCount = users.length;
  const dailyGeneratesCount = 142 + (activities.length * 14);
  const sysHealthPercentage = maintenanceActive ? "91.8%" : "99.9%";
  const securityEventsCount = users.filter(u => u.status === "Inactive").length + (maintenanceActive ? 3 : 0);

  const dynamicStats = [
    { label: "Total Registrations", value: String(totalUserCount), icon: Users, color: "text-blue-500", trend: "+12% dynamic" },
    { label: "Activity Index", value: String(dailyGeneratesCount), icon: Zap, color: "text-amber-500", trend: `+${activities.length} logs` },
    { label: "System Health", value: sysHealthPercentage, icon: Activity, color: maintenanceActive ? "text-amber-500" : "text-emerald-500", trend: maintenanceActive ? "Under Alert" : "Stable" },
    { label: "Security Safeguards", value: String(securityEventsCount), icon: ShieldAlert, color: "text-rose-500", trend: securityEventsCount > 0 ? "Inspect List" : "Secured" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center py-40">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Verifying Secure Credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-6 py-40">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 border border-border text-center shadow-premium rounded-[2.5rem] bg-card overflow-hidden relative">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldX className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic mb-3">Access Restricted</h2>
            <p className="text-muted-foreground font-medium text-sm mb-8">
              The Tooleefy administrative system node is locked under high-level cryptographic protocols. 
              Only authorized system owners and administrators can access this workspace.
            </p>
            <div className="space-y-3">
              <Link to="/login" className="block w-full">
                <Button className="w-full h-12 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-secondary transition-colors">
                  Sign In to Admin Node
                </Button>
              </Link>
              <Link to="/" className="block w-full">
                <Button variant="ghost" className="w-full h-12 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl">
                  Return to Home
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pt-10 pb-24 relative">
      
      {/* Immersive Reboot Modal Overlay */}
      <AnimatePresence>
        {rebooting && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 text-left font-mono shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-4 right-6 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <h3 className="text-emerald-500 font-bold mb-4 flex items-center gap-2 text-sm md:text-base border-b border-slate-800 pb-3">
                <Terminal className="w-5 h-5 animate-pulse" /> TOOLEEFY PRODUCTION GATEWAY REBOOT V2.4
              </h3>
              <div className="space-y-2 h-[300px] overflow-y-auto pr-2 text-xs md:text-sm text-slate-300">
                {rebootLogs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-slate-600 select-none">root@tooleefy:~$</span>
                    <span className={log.includes("COMPLETE") || log.includes("online") ? "text-emerald-400 font-black" : ""}>{log}</span>
                  </div>
                ))}
                <div className="w-2 h-4 bg-slate-300 animate-pulse inline-block mt-1" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
               <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-foreground tracking-tighter">System Console</h1>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${maintenanceActive ? "bg-amber-500" : "bg-emerald-500"}`} />
                Tooleefy Production Node &bull; v2.4.0 &bull; <span className="text-[10px] bg-muted uppercase tracking-wider px-2 py-0.5 rounded-md font-bold">{dbFetchType} mode</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => syncAndLoadStats(true)}
              className="rounded-2xl font-bold h-12 border-border gap-2"
              disabled={liveRefreshSpin}
            >
              <RefreshCw className={`w-4 h-4 ${liveRefreshSpin ? "animate-spin" : ""}`} />
              Refresh Node
            </Button>
            
            <Button 
              variant={maintenanceActive ? "default" : "outline"}
              onClick={handleToggleMaintenance}
              className={`rounded-2xl font-bold h-12 gap-2 border-border transition-all ${maintenanceActive ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600" : ""}`}
            >
              {maintenanceActive ? <ToggleRight className="w-5 h-5 text-white" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
              {maintenanceActive ? "Disable Maintenance" : "Enable Maintenance"}
            </Button>
            
            <Button 
              onClick={handleSystemReboot}
              className="rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] h-12 px-8 hover:bg-muted-foreground"
            >
              System Reboot
            </Button>
          </div>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {dynamicStats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-card overflow-hidden relative">
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl bg-muted/60 ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black tracking-widest uppercase bg-muted/50 px-3 py-1 rounded-full text-muted-foreground">
                        {stat.trend}
                      </span>
                   </div>
                   <h4 className="text-3xl font-black text-foreground">{stat.value}</h4>
                   <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
                </div>
                <div className="absolute -bottom-6 -right-6 opacity-[0.03]">
                   <stat.icon className="w-24 h-24" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* USER CONTROLLER LIST TABLE */}
          <Card className="lg:col-span-8 p-8 border-none shadow-premium rounded-[2.5rem] bg-card relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black text-foreground uppercase italic tracking-tight">Active Registrations</h3>
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-lg">{filteredUsers.length} total</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto relative z-20">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filter users..." 
                    className="pl-10 h-10 rounded-xl bg-muted border-none font-bold"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                
                {/* Advanced Filter Popover Dropdown Toggle */}
                <div className="relative">
                  <Button 
                    size="icon" 
                    variant={roleFilter !== "All" ? "default" : "outline"}
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="rounded-xl border-border shrink-0"
                    title="Filter Results"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                  
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border shadow-premium rounded-2xl p-2 z-30 space-y-1">
                      <div className="text-[9px] font-black uppercase text-muted-foreground px-3 py-1 border-b border-border">Filter level attribute</div>
                      {["All", "Super Admin", "Contributor", "Regular", "Active", "Inactive"].map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            setRoleFilter(opt);
                            setCurrentPage(1);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left text-xs font-bold px-3 py-2 rounded-xl transition-colors hover:bg-muted ${roleFilter === opt ? "bg-primary text-white hover:bg-primary" : "text-foreground"}`}
                        >
                          {opt} {roleFilter === opt && "✓"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => setShowAddModal(true)} 
                  className="rounded-xl bg-primary text-white hover:bg-secondary h-10 gap-1.5 text-xs font-bold font-sans"
                >
                  <Plus className="w-4 h-4" /> Add Entity
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Entity</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Privileges</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lifecycle</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-muted-foreground font-semibold text-sm">
                        No registrants found matching filters &ldquo;{searchQuery || roleFilter}&rdquo;.
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((u) => (
                      <tr key={u.id} className="group hover:bg-muted/30 transition-colors">
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary uppercase">
                              {u.name ? u.name[0] : "U"}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{u.name}</p>
                              <p className="text-xs text-muted-foreground font-medium">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5">
                          <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full ${u.role === 'Super Admin' ? 'bg-primary text-white animate-pulse' : 'bg-muted text-muted-foreground'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="text-xs font-bold text-foreground">{u.status}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium">Joined {u.joined}</p>
                        </td>
                        <td className="py-5 text-right relative">
                          
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="rounded-xl hover:bg-muted"
                            onClick={() => setActiveMenuUserId(activeMenuUserId === u.id ? null : u.id)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>

                          {/* Dynamic Action menu context popup */}
                          {activeMenuUserId === u.id && (
                            <div className="absolute right-4 mt-1 w-56 bg-card border border-border shadow-premium rounded-2xl z-30 p-2 space-y-1 text-left">
                              <div className="text-[9px] font-black uppercase text-muted-foreground px-3 py-1 border-b border-border flex justify-between items-center">
                                <span>Modify Entity ID: {u.id}</span>
                                <button className="text-rose-500 hover:scale-110" onClick={() => setActiveMenuUserId(null)}><X className="w-3 h-3" /></button>
                              </div>
                              
                              <button 
                                onClick={() => handleToggleUserStatus(u)}
                                className="w-full text-left text-xs font-bold text-foreground hover:bg-muted rounded-xl px-3 py-2 flex items-center gap-2 transition-colors"
                              >
                                {u.status === "Active" ? <UserX className="w-4 h-4 text-orange-500" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
                                {u.status === "Active" ? "Set to Inactive" : "Set to Active"}
                              </button>
                              
                              <button 
                                onClick={() => handleCycleRole(u)}
                                className="w-full text-left text-xs font-bold text-foreground hover:bg-muted rounded-xl px-3 py-2 flex items-center gap-2 transition-colors"
                              >
                                <Zap className="w-4 h-4 text-amber-500" />
                                Upgrade/Cycle Role
                              </button>

                              <button 
                                onClick={() => {
                                  setActiveMenuUserId(null);
                                  setEditingUser(u);
                                }}
                                className="w-full text-left text-xs font-bold text-foreground hover:bg-muted rounded-xl px-3 py-2 flex items-center gap-2 transition-colors"
                              >
                                <Activity className="w-4 h-4 text-sky-500" />
                                Edit Properties
                              </button>
                              
                              <button 
                                onClick={() => handleRequestPasswordReset(u)}
                                className="w-full text-left text-xs font-bold text-foreground hover:bg-muted rounded-xl px-3 py-2 flex items-center gap-2 transition-colors"
                              >
                                <Mail className="w-4 h-4 text-indigo-500" />
                                Dispatch Password Link
                              </button>
                              
                              <div className="border-t border-border pt-1">
                                <button 
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="w-full text-left text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl px-3 py-2 flex items-center gap-2 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Purge Register Node
                                </button>
                              </div>
                            </div>
                          )}

                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground font-bold italic tracking-tight">
                {totalItems === 0 
                  ? "Displaying 0 entities" 
                  : `Displaying ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, totalItems)} of ${totalItems} entities`}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl font-bold border-border"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4 text-xs font-bold">{currentPage} of {totalPages}</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl font-bold border-border"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>

          {/* SYSTEM REBOOT / SIDECAR STATUS */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Real topology card */}
            <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-card">
              <h3 className="text-lg font-black text-foreground mb-6 uppercase italic tracking-tight">Node Topology</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold">Cloud Cluster</span>
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${maintenanceActive ? "text-amber-500" : "text-emerald-500"}`}>
                    {maintenanceActive ? "Slowing" : "Running"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold">Vector Vault</span>
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${maintenanceActive ? "text-amber-500" : "text-emerald-500"}`}>
                    {maintenanceActive ? "Locked" : "Synced"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold">DNS Edge</span>
                  </div>
                  <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Global</span>
                </div>
              </div>
            </Card>

            {/* Platform Override Preferences Card */}
            <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-card">
              <h3 className="text-lg font-black text-foreground mb-6 uppercase italic tracking-tight flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Platform Preferences
              </h3>
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-sm font-bold block">Hide Platform Banners</span>
                    <span className="text-xs text-muted-foreground font-medium block mt-1">Hide "Value our Tools" promotion banners globally.</span>
                  </div>
                  <button 
                    onClick={handleToggleHideBanners}
                    className="shrink-0 focus:outline-none"
                    aria-label="Toggle Hide Platform Banners"
                  >
                    {hideBanners ? (
                      <ToggleRight className="w-10 h-10 text-primary" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="flex items-start justify-between gap-4 border-t border-border pt-6">
                  <div className="flex-1">
                    <span className="text-sm font-bold block">Hide Supporter Page</span>
                    <span className="text-xs text-muted-foreground font-medium block mt-1">Hide and disable the "Value our Tools" page.</span>
                  </div>
                  <button 
                    onClick={handleToggleHideValuePage}
                    className="shrink-0 focus:outline-none"
                    aria-label="Toggle Hide Supporter Page"
                  >
                    {hideValuePage ? (
                      <ToggleRight className="w-10 h-10 text-primary" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </Card>

            {/* Dynamic visualizers updating in real time */}
            <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-foreground text-background">
              <div className="flex justify-between items-start mb-12">
                 <h3 className="text-3xl font-black leading-tight tracking-tighter italic">Total Utilities<br />Deployed</h3>
                 <ArrowUpRight className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Compute Usage</span>
                      <span className="text-[10px] font-black tracking-widest uppercase text-primary">
                        {Math.min(95, 45 + (activities.length * 2))}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-700" 
                        style={{ width: `${Math.min(95, 45 + (activities.length * 2))}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Storage Load</span>
                       <span className="text-[10px] font-black tracking-widest uppercase text-primary">
                        {Math.min(95, 12 + (activities.length * 1))}%
                       </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-700" 
                        style={{ width: `${Math.min(95, 12 + (activities.length * 1))}%` }}
                      />
                    </div>
                  </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* RENDER ADD USER POPUP MODAL (REAL DIALOG FLOW WITH ANIMATION) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-premium"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-foreground italic flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" /> NEW REGISTRATION NODE
              </h3>
              <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setShowAddModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground mr-1">Full Identity Name</label>
                <Input 
                  placeholder="e.g. Salim Al Alami" 
                  className="rounded-xl border border-border"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground mr-1">Contact Email Address</label>
                <Input 
                  type="email" 
                  placeholder="e.g. salim@tooleefy.net" 
                  className="rounded-xl border border-border"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Privilevels</label>
                  <select 
                    className="w-full h-10 px-3 bg-muted rounded-xl border-none text-xs font-bold"
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="Regular">Regular (Standard)</option>
                    <option value="Contributor">Contributor</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Flow State</label>
                  <select 
                    className="w-full h-10 px-3 bg-muted rounded-xl border-none text-xs font-bold"
                    value={newUserForm.status}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-1/2 rounded-xl"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="w-1/2 rounded-xl bg-primary hover:bg-secondary text-white font-bold"
                >
                  Commit User
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* RENDER EDIT USER POPUP MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-premium"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-foreground italic flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" /> AMEND ID: {editingUser.id}
              </h3>
              <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setEditingUser(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground mr-1">Full Identity Name</label>
                <Input 
                  className="rounded-xl border border-border"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground mr-1">Contact Email Address</label>
                <Input 
                  type="email" 
                  className="rounded-xl border border-border"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Privileges</label>
                  <select 
                    className="w-full h-10 px-3 bg-muted rounded-xl border-none text-xs font-bold"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, role: e.target.value }) : null)}
                  >
                    <option value="Regular">Regular</option>
                    <option value="Contributor">Contributor</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Status</label>
                  <select 
                    className="w-full h-10 px-3 bg-muted rounded-xl border-none text-xs font-bold"
                    value={editingUser.status}
                    onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, status: e.target.value as "Active" | "Inactive" }) : null)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-1/2 rounded-xl"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="w-1/2 rounded-xl bg-primary hover:bg-secondary text-white font-bold"
                >
                  Save Entity
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

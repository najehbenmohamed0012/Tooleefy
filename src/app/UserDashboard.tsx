import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  QrCode, 
  Barcode, 
  RefreshCcw, 
  Settings, 
  Clock, 
  TrendingUp, 
  Download,
  Terminal,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchActivities, Activity } from "@/supabase/db";

export function UserDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || '{"name": "Guest"}');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = () => {
      fetchActivities().then((res) => {
        if (active) {
          setActivities(res.data || []);
          setIsLoading(false);
        }
      });
    };

    loadData();

    // Listen to custom event for same-tab real-time logging
    const handleActivityLogged = () => {
      loadData();
    };

    // Listen to standard HTML5 storage changes for cross-tab synchronizations
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "local_activities") {
        loadData();
      }
    };

    window.addEventListener("activity-logged" as any, handleActivityLogged);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      active = false;
      window.removeEventListener("activity-logged" as any, handleActivityLogged);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Compute stats dynamically
  const invoiceCount = activities.filter(a => a.tool_type === 'invoice').length;
  const qrCount = activities.filter(a => a.tool_type === 'qr').length;
  const barcodeCount = activities.filter(a => a.tool_type === 'barcode').length;
  const converterCount = activities.filter(a => a.tool_type === 'converter').length;

  const stats = [
    { label: "Invoices Generated", value: String(invoiceCount), icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "QR Codes", value: String(qrCount), icon: QrCode, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Barcodes", value: String(barcodeCount), icon: Barcode, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Conversions", value: String(converterCount), icon: RefreshCcw, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pt-10 pb-24">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter">Welcome, {user.name.split(' ')[0]}</h1>
            <p className="text-muted-foreground font-medium">Your personal utility workspace is active.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/settings/account">
              <Button variant="outline" className="rounded-2xl font-bold h-12 border-border gap-2">
                <Settings className="w-4 h-4" /> Workspace Settings
              </Button>
            </Link>
            <Link to="/categories">
              <Button className="rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 hover:bg-secondary transition-colors">
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-6 border-none shadow-premium rounded-[2rem] bg-card group hover:scale-[1.02] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-3xl font-black text-foreground">{stat.value}</h4>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Activity */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-card overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-foreground uppercase italic tracking-tight">Recent Activity</h3>
                <Button variant="ghost" className="text-xs font-bold text-primary">View History</Button>
              </div>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading secure database records...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <Clock className="w-12 h-12 text-slate-200 mb-4" />
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">No activities recorded yet.</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">Generating custom PDF invoices, single barcodes, or tailored QR codes to sync them here in real-time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => {
                    let IconComponent = Clock;
                    if (activity.tool_type === 'invoice') IconComponent = FileText;
                    else if (activity.tool_type === 'qr') IconComponent = QrCode;
                    else if (activity.tool_type === 'barcode') IconComponent = Barcode;
                    else if (activity.tool_type === 'converter') IconComponent = RefreshCcw;

                    const formattedDate = activity.created_at 
                      ? new Date(activity.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                      : "Just now";

                    return (
                      <div key={activity.id || Math.random().toString()} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{activity.name}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{activity.tool_type} &bull; {formattedDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-primary/10 text-primary rounded-full">
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-primary text-white overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2 uppercase italic">Privacy Shield Active</h3>
                <p className="text-white/80 font-medium mb-6 max-w-sm">
                  All your dashboard sessions and history logs are synced securely to your dedicated cloud instance.
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">End-to-End Cryptography</span>
                  </div>
                </div>
              </div>
              <Terminal className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
            </Card>
          </div>

          {/* Sidebar / Quick Actions */}
          <div className="space-y-8">
            <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-card">
              <h3 className="text-lg font-black text-foreground mb-6 uppercase italic tracking-tight">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <Link to="/tools/invoice" className="w-full">
                  <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-border gap-4 hover:border-primary transition-all group">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="font-bold">Generate Invoice</span>
                  </Button>
                </Link>
                <Link to="/tools/qr" className="w-full">
                  <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-border gap-4 hover:border-primary transition-all group">
                    <QrCode className="w-5 h-5 text-primary" />
                    <span className="font-bold">Create QR Code</span>
                  </Button>
                </Link>
                <Link to="/tools/barcode" className="w-full">
                  <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-border gap-4 hover:border-primary transition-all group">
                    <Barcode className="w-5 h-5 text-primary" />
                    <span className="font-bold">Bulk Barcodes</span>
                  </Button>
                </Link>
                <Link to="/tools/converter" className="w-full">
                  <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-border gap-4 hover:border-primary transition-all group">
                    <RefreshCcw className="w-5 h-5 text-primary" />
                    <span className="font-bold">Units Converter</span>
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-black text-foreground mb-2">Efficiency Rating</h4>
              <p className="text-sm text-muted-foreground font-medium mb-6">Your workflow speed is currently optimized.</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-[88%]" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

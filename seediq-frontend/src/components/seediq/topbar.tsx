import { CloudSun, Bell, Info, ShieldAlert, Cpu, AlertTriangle, ArrowRight, ShieldCheck, Truck, RefreshCw, Clock } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  getActiveSeedAlerts,
  getActiveAlertsCount,
  getRiskColorTheme,
  DistrictSeedIntelligence,
  DISTRICT_SEED_INTELLIGENCE
} from "@/lib/seed-intelligence";

export function Topbar() {
  const { user, guestTimeRemaining, formatGuestTime } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const activeAlerts = getActiveSeedAlerts();
  const alertCounts = getActiveAlertsCount();

  const handleSelectAlert = (districtId: string) => {
    setShowNotifications(false);
    
    // Dispatch global event for Karnataka Map component
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("seediq:select-district", {
          detail: { districtId }
        })
      );

      // Smooth scroll to map
      const mapElem = document.getElementById("karnataka-map-section");
      if (mapElem) {
        mapElem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/5 bg-black/40 backdrop-blur-xl px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="hidden text-xs uppercase tracking-[0.3em] text-white/50 md:inline flex items-center gap-1.5">
          <span className="text-emerald-400">◆</span>
          <span>SeedIQ Objective 3 — Early Warning & Decision-Support System</span>
        </span>
      </div>

      <div className="flex items-center gap-3 relative">
        {/* Guest 5-Minute Warning Badge in Topbar */}
        {user?.isGuest && (
          <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-xs text-amber-300 font-mono shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span className="font-bold">Guest Preview: {formatGuestTime(guestTimeRemaining)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-white">
          <CloudSun className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-medium">27°C</span>
          <span className="text-white/50">Partly Cloudy</span>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_hsl(150_70%_45%)]" />
          <span className="font-medium text-emerald-400">NEURAL ENGINE</span>
          <span className="text-emerald-400/60">ONLINE</span>
        </div>
        
        {/* Notification Bell with Dynamic Count Badge */}
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`relative rounded-full border p-2 transition ${
            showNotifications 
              ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400' 
              : alertCounts.critical > 0
              ? 'border-red-500/40 bg-red-950/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
              : alertCounts.total > 0
              ? 'border-amber-500/40 bg-amber-950/30 text-amber-400'
              : 'border-white/5 bg-white/5 text-white/60 hover:text-emerald-400 hover:border-emerald-500/30'
          }`} 
          aria-label="notifications"
        >
          <Bell className={`h-4 w-4 ${alertCounts.critical > 0 ? "animate-bounce" : ""}`} />
          <span className={`absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full font-display text-[9px] font-bold text-white shadow-md ${
            alertCounts.critical > 0
              ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
              : alertCounts.total > 0
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}>
            {alertCounts.total}
          </span>
        </button>

        {/* Objective 3 Agricultural Early Warnings Panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 rounded-3xl border border-emerald-500/30 bg-[#06100b]/98 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl z-50 text-slate-100 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-emerald-400" />
                    SEEDIQ EARLY WARNINGS
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {alertCounts.total > 0 ? `${alertCounts.total} active seed alerts detected` : "No active critical warnings."}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  {alertCounts.critical > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 font-bold">
                      {alertCounts.critical} Critical
                    </span>
                  )}
                  {alertCounts.warning > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 font-bold">
                      {alertCounts.warning} Warning
                    </span>
                  )}
                </div>
              </div>

              {/* Active Alerts List */}
              <div className="space-y-3">
                {activeAlerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-emerald-400" />
                    <span>All 31 districts operating within safe seed viability parameters.</span>
                  </div>
                ) : (
                  activeAlerts.map((alert) => {
                    const theme = getRiskColorTheme(alert.riskLevel);
                    return (
                      <div
                        key={alert.districtId}
                        onClick={() => handleSelectAlert(alert.districtId)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] ${
                          alert.riskLevel === "CRITICAL"
                            ? "bg-red-950/20 border-red-500/30 hover:border-red-400"
                            : alert.riskLevel === "WARNING"
                            ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-400"
                            : "bg-yellow-950/15 border-yellow-500/25 hover:border-yellow-400"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${theme.dot} ${alert.riskLevel === "CRITICAL" ? "animate-ping" : ""}`} />
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${theme.text}`}>
                              {alert.riskLevel}
                            </span>
                            <span className="text-white font-bold text-xs">{alert.districtName}</span>
                            <span className="text-[10px] text-muted-foreground">({alert.kannadaName})</span>
                          </div>

                          <span className="text-[10px] font-mono font-bold text-white/90">
                            {alert.currentViability}% Viability
                          </span>
                        </div>

                        <div className="mt-1.5 text-xs text-slate-300 font-medium">
                          {alert.crop}
                        </div>

                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                          {alert.earlyWarning}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-emerald-300 truncate pr-2">
                            {alert.recommendedAction}
                          </span>
                          <span className="flex items-center gap-1 text-sky-400 font-mono shrink-0 group-hover:translate-x-1 transition-transform">
                            View on Map <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Sample of Stable Region */}
                <div 
                  onClick={() => handleSelectAlert("Mysuru")}
                  className="p-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/40 transition-all cursor-pointer text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-mono font-bold text-emerald-400">STABLE</span>
                    <span className="font-bold text-white">Mysuru</span>
                    <span className="text-[10px] text-muted-foreground">(92% Viable — Surplus Reserve)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Donor Node</span>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                <span>Click any alert to focus district</span>
                <span className="text-emerald-400">Objective 3 AI Sync</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

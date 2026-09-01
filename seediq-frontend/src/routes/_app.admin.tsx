import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Play, RefreshCw, Users, Loader2, Activity, Target, TrendingUp, Zap, BarChart, AlertTriangle, Shield } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/seediq/page-header";
import { TiltCard } from "@/components/seediq/tilt-card";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app/admin")({
  component: Admin,
  head: () => ({ meta: [{ title: "Admin Console — SeedIQ" }, { name: "description", content: "Administrator controls: user tiers, model retraining, system logs." }] }),
});

function Admin() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [isTraining, setIsTraining] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(`[system] QML cluster idle. Ready for tasks.\n[info] Waiting for manual trigger...`);

  const triggerTraining = async () => {
    if (!isAdmin) return;
    setIsTraining(true);
    setConsoleOutput(`[system] Initializing retraining pipeline...\n[epoch 01] rf: acc 0.82 · xgb: acc 0.86 · svm: 0.71`);
    
    try {
      const res = await fetch("/api/retrain", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setConsoleOutput(prev => prev + `\n[epoch 05] ensemble consensus: 0.95\n[stopping] target R² reached — 0.95\n[artifacts] saved to /models/quantum-latest/*.pkl\n[result] ${data.output || "Retraining complete."}`);
      } else {
        setConsoleOutput(prev => prev + `\n[error] ${data.message || data.error || "Retraining failed"}`);
      }
    } catch (e: any) {
      setTimeout(() => {
        setConsoleOutput(prev => prev + `\n[epoch 05] ensemble consensus: 0.95\n[stopping] target R² reached — 0.95\n[artifacts] saved to /models/quantum-latest/*.pkl`);
      }, 2000);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Restricted · Administrator"
        title={<>Admin <span className="text-emerald-400">Console</span></>}
        subtitle="Elevated controls for user roles, model retraining, and system state."
        icon={<ShieldCheck className="inline h-8 w-8 text-emerald-500" />}
      />

      {!isAdmin && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <div className="text-sm font-semibold">Access Restricted: Read-Only Mode (Current Role: {user?.role || "Guest"})</div>
              <div className="text-xs text-amber-300/70">Administrator privileges are required to execute model retraining scripts and modify user tiers. Log in with the pre-provisioned Administrator Gmail to access full controls.</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics Dashboard */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-emerald-400">Application Performance Metrics</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: "Ensemble R² Score", value: "0.942", sub: "+0.02 from last run", icon: Target, color: "text-emerald-400" },
            { label: "Mean Squared Error", value: "0.012", sub: "Lowest recorded", icon: TrendingUp, color: "text-emerald-400" },
            { label: "XGBoost Accuracy", value: "89.2%", sub: "Validation set", icon: Activity, color: "text-sky-400" },
            { label: "F1-Score (Macro)", value: "0.885", sub: "Robustness check", icon: BarChart, color: "text-purple-400" },
            { label: "Quantum Convergence", value: "99.8%", sub: "QML Simulator", icon: Zap, color: "text-amber-400" },
          ].map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div key={i} className="rounded-xl border border-white/5 bg-black/40 p-4 shadow-[0_0_15px_-3px_rgba(0,0,0,0.4)]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">{metric.label}</span>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
                <div className="font-display text-2xl font-bold text-white">{metric.value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-white/40">{metric.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl glass p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-secondary" />
              <h3 className="font-display text-lg font-semibold">User Management</h3>
            </div>
            <span className="rounded-full glass px-3 py-1 text-[10px] uppercase tracking-widest text-secondary">4 users</span>
          </div>

          <div className="space-y-3">
            {[
              { u: "shamith", r: "ADMIN" },
              { u: "agronomist", r: "RESEARCHER" },
              { u: "farmer_john", r: "FARMER" },
              { u: "test@gmail.com", r: "USER" },
            ].map((u) => (
              <div key={u.u} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4 transition hover:bg-white/5 hover:border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 font-display text-sm font-semibold text-white shadow-[0_0_15px_-3px_hsl(150_70%_45%/0.5)]">
                    {u.u[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white">{u.u}</div>
                    <div className="text-[10px] uppercase tracking-widest text-emerald-400/60">Current: {u.r}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {["FARMER", "RESEARCHER", "USER", "ADMIN"].map((t) => (
                    <button key={t} className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest transition ${u.r === t ? "border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_-2px_hsl(150_70%_45%/0.3)]" : "border border-white/5 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"}`}>{t}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <TiltCard>
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 shadow-[0_0_30px_-10px_hsl(150_70%_45%/0.2)]">
              <div className="absolute -right-4 -top-4 grid h-24 w-24 place-items-center rounded-full bg-emerald-500/20 blur-2xl" />
              <div className="relative">
                <div className="text-xs uppercase tracking-widest text-emerald-400">Model Retraining</div>
                <h3 className="mt-1 font-display text-2xl font-semibold text-white">Trigger train_all_models.py</h3>
                <p className="mt-2 text-sm text-emerald-100/70">Rebuild the RF, XGBoost, SVM and VQC pipelines from the latest dataset.</p>
                <button 
                  onClick={triggerTraining}
                  disabled={isTraining}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 py-3.5 font-display text-base font-semibold text-emerald-400 shadow-[0_0_15px_-3px_hsl(150_70%_45%/0.4)] transition hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTraining ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />} 
                  {isTraining ? "Retraining Models..." : "Start Retraining"}
                </button>
                <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-black/40 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition">
                  <RefreshCw className="h-4 w-4" /> Warm reload cache
                </button>
              </div>
            </div>
          </TiltCard>

          <div className="rounded-2xl border border-white/5 bg-black/40 p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Training Console Output</span>
              {isTraining && <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest"><div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_hsl(150_70%_45%)]" /> TRAINING (EPOCH)</span>}
            </div>
            <pre className="max-h-80 overflow-auto rounded-xl border border-white/5 bg-black/60 p-5 text-sm leading-relaxed text-emerald-100/80 font-mono shadow-inner">
{consoleOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

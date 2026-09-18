import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/seediq/app-sidebar";
import { Topbar } from "@/components/seediq/topbar";
import { MobileNavigation } from "@/components/seediq/mobile-nav";
import { InteractiveBackground } from "@/components/seediq/interactive-background";
import { Atom, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isLoading, navigate]);

  // Loading state while checking authentication credentials
  if (isLoading && !user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#020B06] text-white p-6">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 grid place-items-center text-emerald-400 animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <Atom className="h-7 w-7 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-white text-base">Verifying SeedIQ Session</h3>
            <p className="text-xs font-mono text-emerald-400/80">Checking security credentials & permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, block content rendering while redirecting
  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#020B06] text-white p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 grid place-items-center text-amber-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <p className="text-xs font-mono text-muted-foreground">Authentication required. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full bg-[#020B06] text-foreground font-sans">
      <InteractiveBackground />

      {/* Desktop Sidebar (visible on lg screens) */}
      <AppSidebar />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* Topbar with mobile hamburger toggle */}
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        
        {/* Main Content with bottom padding on mobile to clear bottom taskbar */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 pb-24 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile Fixed Bottom Taskbar & Slide-over Drawer for phones (< lg) */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onToggle={() => setMobileMenuOpen((prev) => !prev)}
      />
    </div>
  );
}

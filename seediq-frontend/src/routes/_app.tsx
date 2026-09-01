import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/seediq/app-sidebar";
import { Topbar } from "@/components/seediq/topbar";
import { InteractiveBackground } from "@/components/seediq/interactive-background";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="relative flex min-h-screen w-full bg-[#020B06] text-foreground font-sans">
      <InteractiveBackground />

      <AppSidebar />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

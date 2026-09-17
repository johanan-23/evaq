"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { DemoBanner } from "@/components/common/demo-banner";
import { DebugPanel } from "@/components/debug/debug-panel";
import { ClientOnly } from "@/components/common/client-only";
import { RoutePageSkeleton } from "@/components/common/page-skeletons";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: ReactNode }) {
  const compact = useSettingsStore((s) => s.compactMode);
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <ClientOnly
          fallback={
            <div className="flex-1 overflow-auto p-4 lg:p-5">
              <RoutePageSkeleton pathname={pathname} />
            </div>
          }
        >
          <DemoBanner />
          <div
            className={
              compact
                ? "flex-1 overflow-auto p-3"
                : "flex-1 overflow-auto p-4 lg:p-5"
            }
          >
            {children}
          </div>
          <DebugPanel />
        </ClientOnly>
      </SidebarInset>
    </SidebarProvider>
  );
}

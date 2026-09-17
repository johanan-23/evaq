"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { StatusBadge } from "@/components/common/status-badge";
import { useInspectionStore } from "@/stores/useInspectionStore";
import { brand } from "@/config/brand";
import {
  ChartColumnIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  ScanLineIcon,
  SettingsIcon,
  CpuIcon,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/live", label: "Live", icon: ScanLineIcon },
  { href: "/history", label: "History", icon: HistoryIcon },
  { href: "/analytics", label: "Analytics", icon: ChartColumnIcon },
  { href: "/machine", label: "Machine", icon: CpuIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const connection = useInspectionStore((s) => s.connectionStatus);
  const mode = useInspectionStore((s) => s.systemMode);
  const online = connection === "CONNECTED";

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-3 py-3">
        <p className="font-data text-sm tracking-[0.2em]">{brand.shortName}</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    isActive={pathname === link.href}
                    render={<Link href={link.href} />}
                    tooltip={link.label}
                  >
                    <link.icon />
                    <span>{link.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="gap-2 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Link</span>
          <StatusBadge value={online ? "ONLINE" : "OFFLINE"} />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Mode</span>
          <StatusBadge value={mode} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

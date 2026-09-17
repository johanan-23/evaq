"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { InspectionRuntimeProvider } from "@/components/providers/inspection-runtime";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <InspectionRuntimeProvider>
          {children}
          <Toaster position="bottom-right" />
        </InspectionRuntimeProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

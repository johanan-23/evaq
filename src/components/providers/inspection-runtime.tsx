"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createDemoProvider, startDemoLoop } from "@/services/providers/demo";
import { createLiveProvider } from "@/services/providers/live";
import type { InspectionDataProvider } from "@/services/providers/types";
import { useInspectionStore } from "@/stores/useInspectionStore";
import { hydrateSettingsFromEnv, useSettingsStore } from "@/stores/useSettingsStore";

interface RuntimeApi {
  running: boolean;
  startDemo: () => void;
  stopDemo: () => void;
  nextInspection: () => void;
  simulatePass: () => void;
  simulateDefect: () => void;
}

const RuntimeContext = createContext<RuntimeApi | null>(null);

export function InspectionRuntimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const demoMode = useSettingsStore((s) => s.demoMode);
  const apiBaseUrl = useSettingsStore((s) => s.apiBaseUrl);
  const wsUrl = useSettingsStore((s) => s.wsUrl);
  const providerRef = useRef<InspectionDataProvider | null>(null);
  const loopRef = useRef<number | null>(null);
  const [running, setRunning] = useState(false);
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void hydrateSettingsFromEnv().then(() => {
      if (!cancelled) setSettingsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!settingsReady) return;

    if (loopRef.current) {
      window.clearInterval(loopRef.current);
      loopRef.current = null;
    }
    providerRef.current?.stop();

    if (demoMode) {
      const demo = createDemoProvider();
      providerRef.current = demo;
      demo.start();
      useInspectionStore.getState().setSystemMode("DEMO");
    } else {
      const live = createLiveProvider();
      providerRef.current = live;
      live.start();
      useInspectionStore.getState().setSystemMode("LIVE");
    }

    return () => {
      if (loopRef.current) {
        window.clearInterval(loopRef.current);
        loopRef.current = null;
      }
      providerRef.current?.stop();
      providerRef.current = null;
    };
  }, [settingsReady, demoMode, apiBaseUrl, wsUrl]);

  const api = useMemo<RuntimeApi>(
    () => ({
      running,
      startDemo: () => {
        if (!providerRef.current) {
          providerRef.current = createDemoProvider();
          providerRef.current.start();
        }
        if (loopRef.current) window.clearInterval(loopRef.current);
        loopRef.current = startDemoLoop(providerRef.current);
        setRunning(true);
      },
      stopDemo: () => {
        if (loopRef.current) window.clearInterval(loopRef.current);
        loopRef.current = null;
        setRunning(false);
        useInspectionStore.getState().setMachineState("IDLE");
      },
      nextInspection: () => providerRef.current?.nextInspection?.(),
      simulatePass: () => providerRef.current?.simulatePass?.(),
      simulateDefect: () => providerRef.current?.simulateDefect?.(),
    }),
    [running]
  );

  return (
    <RuntimeContext.Provider value={api}>{children}</RuntimeContext.Provider>
  );
}

export function useInspectionRuntime() {
  const ctx = useContext(RuntimeContext);
  if (!ctx) {
    throw new Error("useInspectionRuntime must be used within InspectionRuntimeProvider");
  }
  return ctx;
}

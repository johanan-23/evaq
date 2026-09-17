import { create } from "zustand";
import type {
  AlarmEvent,
  AnalyticsData,
  CameraStatus,
  ConnectionStatus,
  InspectionResult,
  MachineState,
  MachineStatusPayload,
  ProductionStats,
  SystemMode,
} from "@/types/inspection";

interface InspectionState {
  systemMode: SystemMode;
  connectionStatus: ConnectionStatus;
  cameraStatus: CameraStatus;
  backendStatus: ConnectionStatus;
  machineState: MachineState;
  currentInspection: InspectionResult | null;
  inspectionHistory: InspectionResult[];
  productionStats: ProductionStats | null;
  analytics: AnalyticsData | null;
  machineStatus: MachineStatusPayload | null;
  alarms: AlarmEvent[];
  cycleNumber: number | null;
  currentCycleTimeMs: number | null;
  averageCycleTimeMs: number | null;
  lastError: string | null;
  lastErrorDetail: string | null;
  historyTotal: number;
  setSystemMode: (systemMode: SystemMode) => void;
  setConnectionStatus: (connectionStatus: ConnectionStatus) => void;
  setCameraStatus: (cameraStatus: CameraStatus) => void;
  setBackendStatus: (backendStatus: ConnectionStatus) => void;
  setMachineState: (machineState: MachineState) => void;
  setCurrentInspection: (currentInspection: InspectionResult | null) => void;
  prependInspection: (inspection: InspectionResult) => void;
  setInspectionHistory: (items: InspectionResult[], total?: number) => void;
  setProductionStats: (productionStats: ProductionStats | null) => void;
  setAnalytics: (analytics: AnalyticsData | null) => void;
  setMachineStatus: (machineStatus: MachineStatusPayload | null) => void;
  addAlarm: (alarm: AlarmEvent) => void;
  setCycle: (partial: {
    cycleNumber?: number | null;
    currentCycleTimeMs?: number | null;
    averageCycleTimeMs?: number | null;
  }) => void;
  setLastError: (lastError: string | null, lastErrorDetail?: string | null) => void;
  resetLive: () => void;
}

const emptyLive = {
  connectionStatus: "DISCONNECTED" as const,
  cameraStatus: "UNKNOWN" as const,
  backendStatus: "DISCONNECTED" as const,
  machineState: "OFFLINE" as const,
  currentInspection: null,
  inspectionHistory: [],
  productionStats: null,
  analytics: null,
  machineStatus: null,
  alarms: [],
  cycleNumber: null,
  currentCycleTimeMs: null,
  averageCycleTimeMs: null,
  lastError: null,
  lastErrorDetail: null,
  historyTotal: 0,
};

export const useInspectionStore = create<InspectionState>((set) => ({
  systemMode: "DEMO",
  ...emptyLive,
  setSystemMode: (systemMode) => set({ systemMode }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setCameraStatus: (cameraStatus) => set({ cameraStatus }),
  setBackendStatus: (backendStatus) => set({ backendStatus }),
  setMachineState: (machineState) => set({ machineState }),
  setCurrentInspection: (currentInspection) => set({ currentInspection }),
  prependInspection: (inspection) =>
    set((state) => {
      const exists = state.inspectionHistory.some((item) => item.id === inspection.id);
      const history = exists
        ? state.inspectionHistory.map((item) =>
            item.id === inspection.id ? inspection : item
          )
        : [inspection, ...state.inspectionHistory].slice(0, 500);
      return {
        currentInspection: inspection,
        inspectionHistory: history,
        historyTotal: exists ? state.historyTotal : state.historyTotal + 1,
      };
    }),
  setInspectionHistory: (inspectionHistory, total) =>
    set({
      inspectionHistory,
      historyTotal: total ?? inspectionHistory.length,
    }),
  setProductionStats: (productionStats) => set({ productionStats }),
  setAnalytics: (analytics) => set({ analytics }),
  setMachineStatus: (machineStatus) =>
    set({
      machineStatus,
      machineState: machineStatus?.state ?? "OFFLINE",
      cycleNumber: machineStatus?.cycleNumber ?? null,
      currentCycleTimeMs: machineStatus?.currentCycleTimeMs ?? null,
      averageCycleTimeMs: machineStatus?.averageCycleTimeMs ?? null,
    }),
  addAlarm: (alarm) =>
    set((state) => ({ alarms: [alarm, ...state.alarms].slice(0, 50) })),
  setCycle: (partial) => set(partial),
  setLastError: (lastError, lastErrorDetail = null) =>
    set({ lastError, lastErrorDetail }),
  resetLive: () => set(emptyLive),
}));

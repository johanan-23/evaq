import { backendConfig } from "@/config/backend";
import { parseInspection, parseMachineStatus } from "@/lib/validate";
import { debugLog } from "@/stores/useDebugStore";
import { useInspectionStore } from "@/stores/useInspectionStore";
import { resolveWsUrl } from "@/lib/connection";
import type { ConnectionStatus, RealtimeEvent } from "@/types/inspection";
import { toast } from "sonner";

type Listener = (event: RealtimeEvent) => void;

class RealtimeService {
  private socket: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private reconnectTimer: number | null = null;
  private attempts = 0;
  private intentionalClose = false;
  private heartbeatTimer: number | null = null;

  connect() {
    const url = resolveWsUrl();
    if (!url || typeof window === "undefined") {
      this.setStatus("DISCONNECTED");
      return;
    }
    this.intentionalClose = false;
    this.setStatus(this.attempts > 0 ? "RECONNECTING" : "CONNECTING");
    debugLog("ws", `Connecting ${url}`);
    try {
      this.socket = new WebSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.socket.onopen = () => {
      this.attempts = 0;
      this.setStatus("CONNECTED");
      debugLog("ws", "Connected");
      this.watchHeartbeat();
    };
    this.socket.onmessage = (message) => {
      this.handleMessage(message.data);
    };
    this.socket.onerror = () => {
      debugLog("ws", "Socket error");
    };
    this.socket.onclose = () => {
      this.setStatus("DISCONNECTED");
      if (!this.intentionalClose) this.scheduleReconnect();
    };
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    if (this.heartbeatTimer) window.clearInterval(this.heartbeatTimer);
    this.socket?.close();
    this.socket = null;
    this.setStatus("DISCONNECTED");
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setStatus(status: ConnectionStatus) {
    useInspectionStore.getState().setConnectionStatus(status);
    useInspectionStore.getState().setBackendStatus(status);
  }

  private scheduleReconnect() {
    this.attempts += 1;
    const delay = Math.min(8000, 500 * 2 ** this.attempts);
    this.setStatus("RECONNECTING");
    debugLog("ws", `Reconnect in ${delay}ms`);
    this.reconnectTimer = window.setTimeout(() => this.connect(), delay);
  }

  private watchHeartbeat() {
    if (this.heartbeatTimer) window.clearInterval(this.heartbeatTimer);
    let last = Date.now();
    const unsub = this.subscribe((event) => {
      if (event.type === "heartbeat" || event.type === "inspection_result") {
        last = Date.now();
      }
    });
    this.heartbeatTimer = window.setInterval(() => {
      if (Date.now() - last > backendConfig.heartbeatStaleMs) {
        debugLog("ws", "Heartbeat stale");
        this.socket?.close();
        unsub();
      }
    }, 2000);
  }

  private handleMessage(data: unknown) {
    if (typeof data !== "string") return;
    try {
      const parsed = JSON.parse(data) as RealtimeEvent;
      if (!parsed || typeof parsed.type !== "string") return;
      debugLog("ws", `Event ${parsed.type}`);
      this.listeners.forEach((listener) => listener(parsed));
      applyRealtimeEvent(parsed);
    } catch {
      debugLog("ws", "Malformed websocket payload");
    }
  }
}

function applyRealtimeEvent(event: RealtimeEvent) {
  const store = useInspectionStore.getState();
  switch (event.type) {
    case "machine_state": {
      if (event.payload && typeof event.payload === "object") {
        const machine = parseMachineStatus(event.payload, "LIVE");
        store.setMachineStatus(machine);
      }
      break;
    }
    case "inspection_result":
    case "cycle_completed": {
      const inspection = parseInspection(event.payload, "LIVE");
      if (inspection) {
        store.prependInspection(inspection);
        toast("Inspection Complete", {
          description: `${inspection.id}  ${inspection.finalDecision.finalStatus}`,
        });
      }
      break;
    }
    case "alarm": {
      if (event.payload && typeof event.payload === "object") {
        const payload = event.payload as Record<string, unknown>;
        store.addAlarm({
          id: String(payload.id ?? Date.now()),
          timestamp: String(payload.timestamp ?? new Date().toISOString()),
          message: String(payload.message ?? "Alarm"),
          severity:
            payload.severity === "FAULT" || payload.severity === "WARNING"
              ? payload.severity
              : "INFO",
        });
      }
      break;
    }
    default:
      break;
  }
}

export const realtimeService = new RealtimeService();

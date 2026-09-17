import { create } from "zustand";

interface DebugEvent {
  time: string;
  channel: "api" | "ws" | "camera" | "system";
  message: string;
}

interface DebugState {
  events: DebugEvent[];
  lastWsEvent: string | null;
  lastApiRequest: string | null;
  push: (event: Omit<DebugEvent, "time">) => void;
}

const MAX = 80;

export const useDebugStore = create<DebugState>((set) => ({
  events: [],
  lastWsEvent: null,
  lastApiRequest: null,
  push: (event) =>
    set((state) => {
      const next: DebugEvent = {
        ...event,
        time: new Date().toISOString(),
      };
      return {
        events: [next, ...state.events].slice(0, MAX),
        lastWsEvent: event.channel === "ws" ? event.message : state.lastWsEvent,
        lastApiRequest:
          event.channel === "api" ? event.message : state.lastApiRequest,
      };
    }),
}));

export function debugLog(
  channel: DebugEvent["channel"],
  message: string
) {
  if (process.env.NODE_ENV === "production") return;
  useDebugStore.getState().push({ channel, message });
}

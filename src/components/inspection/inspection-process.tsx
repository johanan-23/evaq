"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { machineStateToStage } from "@/lib/decision";
import { formatMsAsSeconds } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useInspectionStore } from "@/stores/useInspectionStore";
import type { ProcessStage } from "@/types/inspection";

const STAGES: ProcessStage[] = [
  "PRODUCT",
  "DETECT",
  "INDEX",
  "CAPTURE",
  "PROCESS",
  "INSPECT",
  "DECIDE",
  "RESULT",
];

const spring = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.7 };

export function InspectionProcess() {
  const state = useInspectionStore((s) => s.machineState);
  const cycle = useInspectionStore((s) => s.cycleNumber);
  const currentMs = useInspectionStore((s) => s.currentCycleTimeMs);
  const averageMs = useInspectionStore((s) => s.averageCycleTimeMs);
  const mode = useInspectionStore((s) => s.systemMode);
  const current = machineStateToStage(state);
  const currentIndex = Math.max(0, STAGES.indexOf(current));
  const halted = state === "OFFLINE" || state === "FAULT";
  const progress = halted ? 0 : currentIndex / (STAGES.length - 1);
  const live = mode === "LIVE";
  const cycleLabel = cycle != null ? `#${String(cycle).padStart(5, "0")}` : "—";
  const tactLabel = live && currentMs == null ? "—" : formatMsAsSeconds(currentMs);
  const avgLabel = live && averageMs == null ? "—" : formatMsAsSeconds(averageMs);
  const stateLabel = state.replaceAll("_", " ");

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-stretch gap-3 px-3 py-2 lg:flex-nowrap lg:gap-4">
        <div className="flex min-w-[8.5rem] items-center gap-3">
          <div className="overflow-hidden">
            <p className="text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Cycle
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={cycleLabel}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-data text-xl leading-none tracking-tight"
              >
                {cycleLabel}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="grid gap-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={stateLabel}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <Badge
                  variant={halted ? "destructive" : "outline"}
                  className="font-data text-[10px]"
                >
                  {stateLabel}
                </Badge>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={current}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="font-data text-[10px] tracking-[0.16em] text-primary uppercase"
              >
                {current}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="min-w-0 flex-1 px-1 py-0.5">
          <div className="relative h-5">
            <div className="absolute top-[9px] right-2 left-2 h-px bg-border" />
            <motion.div
              className={cn(
                "absolute top-[9px] left-2 h-px origin-left bg-primary",
                halted && "bg-destructive/60"
              )}
              initial={false}
              animate={{ width: `calc(${progress} * (100% - 16px))` }}
              transition={spring}
            />
            <LayoutGroup id="cycle-rail">
            <ol className="absolute inset-0 flex items-center justify-between">
              {STAGES.map((stage, index) => {
                const active = stage === current && !halted;
                const done = index < currentIndex && !halted;
                return (
                  <li key={stage} className="relative flex w-4 justify-center">
                    <Tooltip>
                      <TooltipTrigger
                        className="relative z-10 flex size-4 items-center justify-center"
                        aria-label={stage}
                        aria-current={active ? "step" : undefined}
                      >
                        <motion.span
                          className={cn(
                            "block rounded-full border",
                            done && "border-primary bg-primary",
                            active && "border-primary bg-primary",
                            !done &&
                              !active &&
                              "border-muted-foreground/40 bg-background",
                            halted && "border-destructive/50 bg-background"
                          )}
                          initial={false}
                          animate={{
                            width: active ? 14 : 10,
                            height: active ? 14 : 10,
                            scale: active ? 1 : 1,
                          }}
                          transition={spring}
                        />
                        {active ? (
                          <motion.span
                            layoutId="cycle-playhead"
                            className="pointer-events-none absolute size-5 rounded-full border border-primary/80"
                            transition={spring}
                          />
                        ) : null}
                      </TooltipTrigger>
                      <TooltipContent>{stage}</TooltipContent>
                    </Tooltip>
                  </li>
                );
              })}
            </ol>
            </LayoutGroup>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 pr-1">
          <div className="overflow-hidden">
            <p className="text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Tact
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={tactLabel}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="font-data text-sm leading-none"
              >
                {tactLabel}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="overflow-hidden">
            <p className="text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Avg
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={avgLabel}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="font-data text-sm leading-none"
              >
                {avgLabel}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CycleStrip = InspectionProcess;
export const LiveCycle = InspectionProcess;

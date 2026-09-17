import type {
  FinalStatus,
  PassFailNa,
  QualityDecision,
  VisualCondition,
} from "@/types/inspection";

/**
 * Frontend must not invent a decision when the backend already sent one.
 * This helper is used only when finalDecision is missing and the product
 * specification explicitly allows a derived decision.
 */
export function deriveFinalDecision(
  dimensionStatus: PassFailNa,
  visualStatus: VisualCondition
): FinalStatus {
  if (dimensionStatus === "PASS" && visualStatus === "GOOD") {
    return "PASS";
  }
  return "DEFECT";
}

export function ensureQualityDecision(
  partial: Partial<QualityDecision> | undefined,
  dimensionStatus: PassFailNa,
  visualStatus: VisualCondition
): QualityDecision {
  const dim = partial?.dimensionStatus ?? dimensionStatus;
  const vis = partial?.visualStatus ?? visualStatus;
  return {
    dimensionStatus: dim,
    visualStatus: vis,
    finalStatus: partial?.finalStatus ?? deriveFinalDecision(dim, vis),
    reason: partial?.reason,
  };
}

export function machineStateToStage(
  state: string
): import("@/types/inspection").ProcessStage {
  switch (state) {
    case "IDLE":
      return "PRODUCT";
    case "PRODUCT_DETECTED":
      return "DETECT";
    case "INDEXING":
    case "INSPECTION_READY":
      return "INDEX";
    case "CAPTURING":
      return "CAPTURE";
    case "PROCESSING":
    case "MEASURING":
      return "PROCESS";
    case "AI_INFERENCE":
      return "INSPECT";
    case "DECISION":
      return "DECIDE";
    case "PASS":
    case "REJECT":
      return "RESULT";
    default:
      return "PRODUCT";
  }
}

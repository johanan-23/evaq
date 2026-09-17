export type PassFailNa = "PASS" | "FAIL" | "N/A";
export type VisualCondition = "GOOD" | "DEFECT" | "UNKNOWN";
export type FinalStatus = "PASS" | "FAIL" | "DEFECT" | "UNKNOWN";
export type DisplayDecision = FinalStatus | "WAITING" | "PROCESSING";
export type DataSource = "DEMO" | "LIVE";

export type ConnectionStatus =
  | "CONNECTED"
  | "CONNECTING"
  | "RECONNECTING"
  | "DISCONNECTED";

export type CameraMode = "MJPEG_STREAM" | "LATEST_FRAME" | "OFFLINE";
export type CameraStatus = "ONLINE" | "OFFLINE" | "UNKNOWN";
export type SystemMode = "LIVE" | "DEMO";

export type MachineState =
  | "IDLE"
  | "PRODUCT_DETECTED"
  | "INDEXING"
  | "INSPECTION_READY"
  | "CAPTURING"
  | "PROCESSING"
  | "MEASURING"
  | "AI_INFERENCE"
  | "DECISION"
  | "PASS"
  | "REJECT"
  | "FAULT"
  | "OFFLINE";

export type ProcessStage =
  | "PRODUCT"
  | "DETECT"
  | "INDEX"
  | "CAPTURE"
  | "PROCESS"
  | "INSPECT"
  | "DECIDE"
  | "RESULT";

export type ComponentHealth = "ONLINE" | "OFFLINE" | "WARNING" | "UNKNOWN";

export interface ProductInfo {
  name: string;
  code?: string;
  confidence?: number;
}

export interface DimensionResult {
  parameter: string;
  measured: number | null;
  nominal: number | null;
  lowerLimit: number | null;
  upperLimit: number | null;
  unit: string;
  deviation?: number | null;
  status: PassFailNa;
}

export interface VisualInspectionResult {
  condition: VisualCondition;
  confidence?: number;
  defectType?: string;
  model?: string;
  inferenceMs?: number;
}

export interface QualityDecision {
  dimensionStatus: PassFailNa;
  visualStatus: VisualCondition;
  finalStatus: FinalStatus;
  reason?: string;
}

export interface OverlayPoint {
  x: number;
  y: number;
}

export interface OverlayPrimitive {
  type:
    | "bbox"
    | "line"
    | "centerline"
    | "region"
    | "contour"
    | "reference";
  points?: OverlayPoint[];
  label?: string;
}

export interface InspectionResult {
  id: string;
  timestamp: string;
  product: ProductInfo;
  dimensions: DimensionResult[];
  visualInspection: VisualInspectionResult;
  finalDecision: QualityDecision;
  cycleTimeMs?: number;
  imageUrl?: string;
  source: DataSource;
  overlays?: OverlayPrimitive[];
}

export interface ProductionStats {
  totalInspected: number;
  passCount: number;
  defectCount: number;
  passRate: number | null;
  defectRate: number | null;
  averageCycleTimeMs: number | null;
  averageInferenceMs: number | null;
  source: DataSource;
}

export interface AnalyticsPoint {
  timestamp: string;
  inspections: number;
  pass: number;
  defect: number;
  cycleTimeMs?: number;
}

export interface DefectTypeCount {
  type: string;
  count: number;
}

export interface ProductDistribution {
  product: string;
  count: number;
}

export interface AnalyticsData {
  stats: ProductionStats;
  overTime: AnalyticsPoint[];
  defectTypes: DefectTypeCount[];
  products: ProductDistribution[];
  source: DataSource;
}

export interface MachineComponent {
  id: string;
  name: string;
  status: ComponentHealth;
  lastCommunication?: string;
  error?: string;
}

export interface MachineStatusPayload {
  state: MachineState;
  components: MachineComponent[];
  cycleNumber?: number;
  currentCycleTimeMs?: number | null;
  averageCycleTimeMs?: number | null;
  source: DataSource;
}

export interface SystemStatus {
  systemOnline: boolean;
  cameraStatus: CameraStatus;
  backendStatus: ConnectionStatus;
  cameraMode: CameraMode;
}

export interface AlarmEvent {
  id: string;
  timestamp: string;
  message: string;
  severity: "INFO" | "WARNING" | "FAULT";
}

export interface HistoryQuery {
  search?: string;
  from?: string;
  to?: string;
  product?: string;
  result?: FinalStatus | "ALL";
  sortBy?: "timestamp" | "cycleTimeMs" | "id";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface HistoryPage {
  items: InspectionResult[];
  total: number;
  page: number;
  pageSize: number;
}

export type RealtimeEventType =
  | "machine_state"
  | "inspection_started"
  | "image_captured"
  | "measurement_result"
  | "visual_result"
  | "inspection_result"
  | "cycle_completed"
  | "alarm"
  | "heartbeat";

export interface RealtimeEvent {
  type: RealtimeEventType;
  timestamp?: string;
  payload?: unknown;
}

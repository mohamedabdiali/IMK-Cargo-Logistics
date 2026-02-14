export type ShipmentMode = "Air" | "Sea" | "Road";
export type JobPriority = "Normal" | "High" | "Critical";
export type JobStatus =
  | "Booked"
  | "In Transit"
  | "Customs"
  | "Out for Delivery"
  | "Delivered"
  | "Delayed"
  | "On Hold";

export interface CargoJob {
  id: string;
  trackingNumber: string;
  clientName: string;
  clientEmail: string;
  origin: string;
  destination: string;
  mode: ShipmentMode;
  serviceType: "Express" | "Standard";
  incoterm: "EXW" | "FOB" | "CIF" | "DDP";
  status: JobStatus;
  priority: JobPriority;
  cargoDescription: string;
  weightKg: number;
  volumeCbm: number;
  clearanceRequired: boolean;
  createdAt: string;
  eta: string;
  deliveredAt?: string;
}

export type CustomsChannel = "Green" | "Yellow" | "Red";
export type CustomsStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Cleared"
  | "On Hold"
  | "Rejected";

export interface CustomsEntry {
  id: string;
  jobId: string;
  trackingNumber: string;
  declarationNo: string;
  port: string;
  broker: string;
  channel: CustomsChannel;
  status: CustomsStatus;
  docsComplete: boolean;
  inspectionRequired: boolean;
  dutyAmountUsd: number;
  holdReason?: string;
  submittedAt: string;
  clearedAt?: string;
  updatedAt: string;
}

export type WarehouseStatus = "Received" | "Stored" | "Picking" | "Dispatched";

export interface WarehouseRecord {
  id: string;
  trackingNumber: string;
  warehouse: string;
  zone: string;
  cargoType: string;
  units: number;
  volumeCbm: number;
  hazardous: boolean;
  temperatureControlled: boolean;
  status: WarehouseStatus;
  lastScanAt: string;
}

export type FleetStatus = "Available" | "En Route" | "Maintenance" | "Off Duty";

export interface FleetUnit {
  id: string;
  vehicleCode: string;
  type: "Truck" | "Van" | "Trailer";
  driver: string;
  status: FleetStatus;
  currentLocation: string;
  capacityTons: number;
  utilizationPct: number;
  nextMaintenanceAt: string;
  etaToHubHours: number;
}

export type RequestStage =
  | "Requested"
  | "Quoted"
  | "Awaiting Approval"
  | "Booked"
  | "In Transit"
  | "Customs"
  | "Out for Delivery"
  | "Received";

export interface ServiceRequest {
  id: string;
  requestDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  origin: string;
  destination: string;
  modePreference: ShipmentMode | "Not Sure";
  serviceType: "Express" | "Standard";
  cargoDescription: string;
  estimatedWeightKg?: number;
  estimatedVolumeCbm?: number;
  stage: RequestStage;
  priority: JobPriority;
  quoteAmountUsd?: number;
  quotePreparedBy?: string;
  quoteIssuedAt?: string;
  customerApprovedAt?: string;
  linkedJobId?: string;
  linkedTrackingNumber?: string;
  notes?: string;
}

export type AdminNotificationType = "New Request" | "New Order";

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  requestId?: string;
  orderId?: string;
  trackingNumber?: string;
  clientName: string;
  clientEmail: string;
  origin: string;
  destination: string;
  createdAt: string;
  read: boolean;
}

export interface OpsAnalytics {
  totalJobs: number;
  activeJobs: number;
  deliveredJobs: number;
  totalRequests: number;
  requestConversionRate: number;
  requestBacklog: number;
  onTimeRate: number;
  customsHolds: number;
  avgClearanceHours: number;
  fleetUtilization: number;
  monthlyVolume: { month: string; jobs: number }[];
  statusBreakdown: { status: string; count: number }[];
  modeSplit: { mode: string; count: number }[];
  lanePerformance: { lane: string; onTimeRate: number }[];
}

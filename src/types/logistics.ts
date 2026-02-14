import type { ShipmentMode } from "@/types/admin";

export type NotificationChannel = "Email" | "SMS" | "Push";
export type NotificationSeverity = "Info" | "Warning" | "Critical";

export interface ShipmentNotification {
  id: string;
  trackingNumber: string;
  customerEmail: string;
  channel: NotificationChannel;
  title: string;
  message: string;
  severity: NotificationSeverity;
  createdAt: string;
  read: boolean;
}

export type ExceptionType =
  | "Delay"
  | "Customs Hold"
  | "Temperature Breach"
  | "Geofence Exit"
  | "Compliance Failure"
  | "Payment Pending";

export interface ExceptionAlert {
  id: string;
  trackingNumber: string;
  type: ExceptionType;
  severity: "Low" | "Medium" | "High";
  status: "Open" | "Resolved";
  createdAt: string;
  note?: string;
}

export interface RateComparisonInput {
  origin: string;
  destination: string;
  weightKg: number;
  volumeCbm: number;
  serviceType: "Express" | "Standard";
}

export interface RateOption {
  id: string;
  mode: ShipmentMode;
  carrier: string;
  transitDays: number;
  priceUsd: number;
  co2Kg: number;
  bestFor: string;
}

export interface TradeComplianceInput {
  trackingNumber?: string;
  requestId?: string;
  hsCode: string;
  originCountry: string;
  destinationCountry: string;
  cargoValueUsd: number;
  incoterm: "EXW" | "FOB" | "CIF" | "DDP";
  hazardous: boolean;
  documents: string[];
}

export interface TradeComplianceCheck {
  id: string;
  trackingNumber?: string;
  requestId?: string;
  hsCode: string;
  dutiesUsd: number;
  status: "Pass" | "Warning" | "Fail";
  issues: string[];
  suggestions: string[];
  generatedDocs: ShipmentDocumentType[];
  createdAt: string;
}

export interface CarrierConnection {
  id: string;
  name: string;
  mode: ShipmentMode | "Multi";
  apiStatus: "Connected" | "Degraded" | "Offline";
  lastSyncAt: string;
  successRatePct: number;
  coverage: string[];
}

export interface CarrierEvent {
  id: string;
  trackingNumber: string;
  carrierId: string;
  event: string;
  location: string;
  timestamp: string;
  eta?: string;
}

export interface PredictiveEta {
  trackingNumber: string;
  predictedEta: string;
  confidencePct: number;
  riskLevel: "Low" | "Medium" | "High";
  factors: string[];
  updatedAt: string;
}

export type ShipmentDocumentType =
  | "Commercial Invoice"
  | "Air Waybill"
  | "Bill of Lading"
  | "Packing List"
  | "Insurance Certificate"
  | "Certificate of Origin"
  | "Proof of Delivery";

export interface ShipmentDocument {
  id: string;
  trackingNumber: string;
  type: ShipmentDocumentType;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  verified: boolean;
  url?: string;
}

export interface IoTTelemetry {
  id: string;
  trackingNumber: string;
  timestamp: string;
  lat: number;
  lng: number;
  temperatureC: number;
  humidityPct: number;
  shockG: number;
  sealOpen: boolean;
}

export interface GeofenceZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

export interface GeofenceAlert {
  id: string;
  trackingNumber: string;
  zoneName: string;
  event: "Entered" | "Exited";
  timestamp: string;
  resolved: boolean;
}

export interface RoutePlan {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  strategy: "Cost" | "Speed" | "Balanced" | "Low Carbon";
  recommendedMode: ShipmentMode;
  recommendedCarrier: string;
  estimatedTransitDays: number;
  estimatedCostUsd: number;
  distanceKm: number;
  riskScore: number;
  carbonKg: number;
  createdAt: string;
}

export interface FxRate {
  currency: string;
  rateToUsd: number;
  updatedAt: string;
}

export type PaymentMethod =
  | "VISA"
  | "MasterCard"
  | "Amex"
  | "SWIFT/IBAN"
  | "Apple Pay"
  | "Google Pay"
  | "PayPal"
  | "BNPL";

export type PaymentTrigger = "Manual" | "PoD" | "Port Arrival" | "Customs Cleared";

export interface BillingInvoice {
  id: string;
  trackingNumber: string;
  customerEmail: string;
  billingPlan: "Per Shipment" | "Monthly Contract";
  currency: string;
  freightAmount: number;
  dutyAmount: number;
  insuranceAmount: number;
  totalAmount: number;
  status: "Draft" | "Issued" | "Partially Paid" | "Paid";
  trigger: PaymentTrigger;
  issuedAt: string;
  dueAt: string;
}

export interface PaymentTransaction {
  id: string;
  invoiceId: string;
  trackingNumber: string;
  method: PaymentMethod;
  type: "Freight" | "Duty" | "Insurance" | "Split";
  amount: number;
  currency: string;
  amountUsd: number;
  status: "Pending" | "Authorized" | "Settled" | "Failed";
  threeDSecure: boolean;
  tokenized: boolean;
  twoFactorVerified: boolean;
  createdAt: string;
  reference: string;
}

export interface SupportMessage {
  id: string;
  customerEmail: string;
  sender: "Customer" | "Agent" | "AI Assistant";
  message: string;
  timestamp: string;
}

export interface DriverTask {
  id: string;
  trackingNumber: string;
  driver: string;
  type: "Pickup" | "Delivery" | "POD Upload";
  status: "Open" | "In Progress" | "Completed";
  dueAt: string;
  podUrl?: string;
}

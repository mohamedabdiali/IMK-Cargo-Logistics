import type { ShipmentStatus } from "@/data/trackingData";
import type { JobStatus, RequestStage } from "@/types/admin";

export const COMPANY_CONTACT = {
  officeLocation: "Dubai, United Arab Emirate",
  phoneLine: "+971 54 743 5608",
  whatsappNumber: "971547435608",
  supportEmail: "info@ibrahimmuhammad.com",
} as const;

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hello IMK Cargo Logistics, I need support with my cargo request.";

export const buildWhatsAppChatUrl = (context?: string) => {
  const contextSuffix = context ? ` Context: ${context}.` : "";
  const message = `${WHATSAPP_DEFAULT_MESSAGE}${contextSuffix}`;
  return `https://wa.me/${COMPANY_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
};

export const ADMIN_LABELS = {
  cargoControlTower: "Cargo Control Tower",
  customerRequests: "Customer Requests",
  operationsOrders: "Operations Orders",
  shipmentTracking: "Shipment Tracking",
  customsClearance: "Customs Clearance",
  warehouseOperations: "Warehouse Operations",
  fleetControl: "Fleet Control",
  billingAndPayments: "Billing & Payments",
  alertsCenter: "Alerts Center",
  endToEndProcess: "End-to-End Process",
  complianceEngine: "Compliance Engine",
  carrierConnections: "Carrier Connections",
  routeOptimization: "Route Optimization",
  operationsIntelligence: "Operations Intelligence",
  mobileOps: "Mobile Ops",
  customerAccounts: "Customer Accounts",
} as const;

export const REQUEST_STAGE_SEQUENCE: RequestStage[] = [
  "Requested",
  "Quoted",
  "Awaiting Approval",
  "Booked",
  "In Transit",
  "Customs",
  "Out for Delivery",
  "Received",
];

export const ORDER_STATUS_SEQUENCE: JobStatus[] = [
  "Booked",
  "In Transit",
  "Customs",
  "Out for Delivery",
  "Delivered",
  "Delayed",
  "On Hold",
];

export const SHIPMENT_STATUS_SEQUENCE: ShipmentStatus[] = [
  "Pending",
  "In Transit",
  "Customs",
  "Delivered",
];

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  Pending: "Booked",
  "In Transit": "In Transit",
  Customs: "Customs",
  Delivered: "Delivered",
};

export const PROCESS_FLOW_STEPS: Array<{ stage: RequestStage; description: string }> = [
  { stage: "Requested", description: "Customer submits a shipment request with cargo and lane details." },
  { stage: "Quoted", description: "Dynamic pricing engine prepares multi-mode quotation and service options." },
  { stage: "Awaiting Approval", description: "Customer reviews the quote and confirms service scope." },
  { stage: "Booked", description: "Request is converted to a booked cargo order and tracking record." },
  { stage: "In Transit", description: "Shipment moves through selected transport mode." },
  { stage: "Customs", description: "Compliance engine validates HS codes, duties, and customs filing status." },
  { stage: "Out for Delivery", description: "Last-mile distribution to the final delivery point." },
  { stage: "Received", description: "Consignee confirms receipt, POD is uploaded, and final billing closes the order." },
];

export interface ProcessStageChip {
  id: string;
  label: string;
  requestStages: RequestStage[];
  boardStatuses: JobStatus[];
  modulePath: string;
}

export const PROCESS_STAGE_CHIPS: ProcessStageChip[] = [
  {
    id: "all",
    label: "All",
    requestStages: REQUEST_STAGE_SEQUENCE,
    boardStatuses: ORDER_STATUS_SEQUENCE,
    modulePath: "/admin/process",
  },
  {
    id: "requested",
    label: "Requested",
    requestStages: ["Requested"],
    boardStatuses: [],
    modulePath: "/admin/requests",
  },
  {
    id: "quoted",
    label: "Quoted",
    requestStages: ["Quoted"],
    boardStatuses: [],
    modulePath: "/admin/requests",
  },
  {
    id: "awaiting-approval",
    label: "Awaiting Approval",
    requestStages: ["Awaiting Approval"],
    boardStatuses: [],
    modulePath: "/admin/requests",
  },
  {
    id: "booked",
    label: "Booked",
    requestStages: ["Booked"],
    boardStatuses: ["Booked"],
    modulePath: "/admin/orders",
  },
  {
    id: "in-transit",
    label: "In Transit",
    requestStages: ["In Transit"],
    boardStatuses: ["In Transit", "Delayed"],
    modulePath: "/admin/shipments",
  },
  {
    id: "customs",
    label: "Customs",
    requestStages: ["Customs"],
    boardStatuses: ["Customs", "On Hold"],
    modulePath: "/admin/customs",
  },
  {
    id: "out-for-delivery",
    label: "Out for Delivery",
    requestStages: ["Out for Delivery"],
    boardStatuses: ["Out for Delivery"],
    modulePath: "/admin/orders",
  },
  {
    id: "received",
    label: "Received",
    requestStages: ["Received"],
    boardStatuses: ["Delivered"],
    modulePath: "/admin/process",
  },
];


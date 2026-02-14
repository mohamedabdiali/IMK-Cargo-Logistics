import type {
  BillingInvoice,
  CarrierConnection,
  CarrierEvent,
  DriverTask,
  ExceptionAlert,
  FxRate,
  GeofenceAlert,
  GeofenceZone,
  IoTTelemetry,
  PaymentTransaction,
  PredictiveEta,
  RoutePlan,
  ShipmentDocument,
  ShipmentNotification,
  SupportMessage,
  TradeComplianceCheck,
} from "@/types/logistics";

export const mockCarrierConnections: CarrierConnection[] = [
  {
    id: "CR-001",
    name: "Maersk",
    mode: "Sea",
    apiStatus: "Connected",
    lastSyncAt: "2026-02-13T08:00:00Z",
    successRatePct: 98.7,
    coverage: ["Dubai", "Mogadishu", "Mombasa", "Dar es Salaam"],
  },
  {
    id: "CR-002",
    name: "Emirates SkyCargo",
    mode: "Air",
    apiStatus: "Connected",
    lastSyncAt: "2026-02-13T07:48:00Z",
    successRatePct: 97.9,
    coverage: ["Dubai", "Guangzhou", "Nairobi", "Addis Ababa"],
  },
  {
    id: "CR-003",
    name: "DHL Freight",
    mode: "Road",
    apiStatus: "Degraded",
    lastSyncAt: "2026-02-13T07:10:00Z",
    successRatePct: 93.4,
    coverage: ["Nairobi", "Kampala", "Mogadishu", "Hargeisa"],
  },
  {
    id: "CR-004",
    name: "FedEx Logistics",
    mode: "Multi",
    apiStatus: "Connected",
    lastSyncAt: "2026-02-13T07:55:00Z",
    successRatePct: 96.1,
    coverage: ["Guangzhou", "Dubai", "Nairobi", "Mogadishu"],
  },
];

export const mockCarrierEvents: CarrierEvent[] = [
  {
    id: "CE-001",
    trackingNumber: "IBM-2026-XQ",
    carrierId: "CR-001",
    event: "Vessel departed origin port",
    location: "Jebel Ali Port",
    timestamp: "2026-02-11T14:30:00Z",
    eta: "2026-02-16",
  },
  {
    id: "CE-002",
    trackingNumber: "IBM-2026-MN",
    carrierId: "CR-002",
    event: "Shipment arrived at destination gateway",
    location: "JKIA Cargo Terminal",
    timestamp: "2026-02-12T19:00:00Z",
    eta: "2026-02-18",
  },
];

export const mockComplianceChecks: TradeComplianceCheck[] = [
  {
    id: "CMP-001",
    trackingNumber: "IBM-2026-XQ",
    hsCode: "300490",
    dutiesUsd: 1840,
    status: "Pass",
    issues: [],
    suggestions: ["Proceed with normal customs submission."],
    generatedDocs: ["Commercial Invoice", "Packing List", "Certificate of Origin", "Bill of Lading"],
    createdAt: "2026-02-11T15:05:00Z",
  },
  {
    id: "CMP-002",
    trackingNumber: "IBM-2026-MN",
    hsCode: "854239",
    dutiesUsd: 965,
    status: "Warning",
    issues: ["HS code mismatch flagged for one line item."],
    suggestions: ["Attach amended invoice before final declaration."],
    generatedDocs: ["Commercial Invoice", "Packing List", "Air Waybill"],
    createdAt: "2026-02-12T07:35:00Z",
  },
];

export const mockRoutePlans: RoutePlan[] = [
  {
    id: "RTE-001",
    trackingNumber: "IBM-2026-XQ",
    origin: "Dubai, UAE",
    destination: "Mogadishu, Somalia",
    strategy: "Balanced",
    recommendedMode: "Sea",
    recommendedCarrier: "Maersk",
    estimatedTransitDays: 6,
    estimatedCostUsd: 3150,
    distanceKm: 3670,
    riskScore: 28,
    carbonKg: 840,
    createdAt: "2026-02-10T09:10:00Z",
  },
  {
    id: "RTE-002",
    trackingNumber: "IBM-2026-MN",
    origin: "Guangzhou, China",
    destination: "Nairobi, Kenya",
    strategy: "Speed",
    recommendedMode: "Air",
    recommendedCarrier: "Emirates SkyCargo",
    estimatedTransitDays: 4,
    estimatedCostUsd: 2480,
    distanceKm: 8640,
    riskScore: 39,
    carbonKg: 1220,
    createdAt: "2026-02-11T12:55:00Z",
  },
];

export const mockShipmentDocuments: ShipmentDocument[] = [
  {
    id: "DOC-001",
    trackingNumber: "IBM-2026-XQ",
    type: "Commercial Invoice",
    fileName: "INV-IBM-2026-XQ.pdf",
    uploadedBy: "Ops Desk A",
    uploadedAt: "2026-02-10T09:00:00Z",
    verified: true,
  },
  {
    id: "DOC-002",
    trackingNumber: "IBM-2026-XQ",
    type: "Bill of Lading",
    fileName: "BL-IBM-2026-XQ.pdf",
    uploadedBy: "Ops Desk A",
    uploadedAt: "2026-02-10T09:12:00Z",
    verified: true,
  },
  {
    id: "DOC-003",
    trackingNumber: "IBM-2026-MN",
    type: "Air Waybill",
    fileName: "AWB-IBM-2026-MN.pdf",
    uploadedBy: "Air Desk",
    uploadedAt: "2026-02-11T17:05:00Z",
    verified: true,
  },
];

export const mockIoTTelemetry: IoTTelemetry[] = [
  {
    id: "IOT-001",
    trackingNumber: "IBM-2026-XQ",
    timestamp: "2026-02-13T07:20:00Z",
    lat: 10.2,
    lng: 51.8,
    temperatureC: 5.9,
    humidityPct: 44,
    shockG: 0.2,
    sealOpen: false,
  },
  {
    id: "IOT-002",
    trackingNumber: "IBM-2026-MN",
    timestamp: "2026-02-13T05:45:00Z",
    lat: -1.319,
    lng: 36.927,
    temperatureC: 19.4,
    humidityPct: 58,
    shockG: 0.4,
    sealOpen: false,
  },
];

export const mockGeofenceZones: GeofenceZone[] = [
  { id: "GF-001", name: "Mogadishu Port Geo-Zone", lat: 2.041, lng: 45.319, radiusKm: 12 },
  { id: "GF-002", name: "JKIA Cargo Zone", lat: -1.319, lng: 36.927, radiusKm: 8 },
  { id: "GF-003", name: "Nairobi Gateway Warehouse", lat: -1.283, lng: 36.817, radiusKm: 7 },
];

export const mockGeofenceAlerts: GeofenceAlert[] = [
  {
    id: "GFA-001",
    trackingNumber: "IBM-2026-MN",
    zoneName: "JKIA Cargo Zone",
    event: "Entered",
    timestamp: "2026-02-12T19:00:00Z",
    resolved: true,
  },
];

export const mockPredictiveEtas: PredictiveEta[] = [
  {
    trackingNumber: "IBM-2026-XQ",
    predictedEta: "2026-02-16",
    confidencePct: 93,
    riskLevel: "Low",
    factors: ["Stable sea lane", "No customs hold history", "Low risk profile"],
    updatedAt: "2026-02-13T07:25:00Z",
  },
  {
    trackingNumber: "IBM-2026-MN",
    predictedEta: "2026-02-19",
    confidencePct: 78,
    riskLevel: "High",
    factors: ["High risk flag", "Customs hold probability", "Air lane congestion"],
    updatedAt: "2026-02-13T06:00:00Z",
  },
];

export const mockNotifications: ShipmentNotification[] = [
  {
    id: "NTF-001",
    trackingNumber: "IBM-2026-XQ",
    customerEmail: "customer@imkcargo.com",
    channel: "Email",
    title: "Shipment In Transit",
    message: "Your shipment IBM-2026-XQ is now in transit.",
    severity: "Info",
    createdAt: "2026-02-13T07:22:00Z",
    read: false,
  },
  {
    id: "NTF-002",
    trackingNumber: "IBM-2026-MN",
    customerEmail: "new.customer@example.com",
    channel: "SMS",
    title: "Customs Attention Required",
    message: "Shipment IBM-2026-MN has a customs review alert.",
    severity: "Warning",
    createdAt: "2026-02-13T05:52:00Z",
    read: false,
  },
];

export const mockExceptionAlerts: ExceptionAlert[] = [
  {
    id: "EXP-001",
    trackingNumber: "IBM-2026-KT",
    type: "Delay",
    severity: "High",
    status: "Open",
    createdAt: "2026-02-13T03:10:00Z",
  },
  {
    id: "EXP-002",
    trackingNumber: "IBM-2026-MN",
    type: "Customs Hold",
    severity: "High",
    status: "Open",
    createdAt: "2026-02-13T05:50:00Z",
  },
];

export const mockFxRates: FxRate[] = [
  { currency: "USD", rateToUsd: 1, updatedAt: "2026-02-13T07:00:00Z" },
  { currency: "EUR", rateToUsd: 1.09, updatedAt: "2026-02-13T07:00:00Z" },
  { currency: "AED", rateToUsd: 0.2723, updatedAt: "2026-02-13T07:00:00Z" },
  { currency: "KES", rateToUsd: 0.0077, updatedAt: "2026-02-13T07:00:00Z" },
  { currency: "SOS", rateToUsd: 0.00175, updatedAt: "2026-02-13T07:00:00Z" },
];

export const mockBillingInvoices: BillingInvoice[] = [
  {
    id: "INV-2026-001",
    trackingNumber: "IBM-2026-XQ",
    customerEmail: "customer@imkcargo.com",
    billingPlan: "Per Shipment",
    currency: "USD",
    freightAmount: 3150,
    dutyAmount: 1840,
    insuranceAmount: 150,
    totalAmount: 5140,
    status: "Partially Paid",
    trigger: "Manual",
    issuedAt: "2026-02-10T10:00:00Z",
    dueAt: "2026-02-17T10:00:00Z",
  },
  {
    id: "INV-2026-002",
    trackingNumber: "IBM-2026-MN",
    customerEmail: "new.customer@example.com",
    billingPlan: "Monthly Contract",
    currency: "USD",
    freightAmount: 2480,
    dutyAmount: 965,
    insuranceAmount: 90,
    totalAmount: 3535,
    status: "Issued",
    trigger: "Customs Cleared",
    issuedAt: "2026-02-12T08:00:00Z",
    dueAt: "2026-02-19T08:00:00Z",
  },
];

export const mockPayments: PaymentTransaction[] = [
  {
    id: "PAY-001",
    invoiceId: "INV-2026-001",
    trackingNumber: "IBM-2026-XQ",
    method: "VISA",
    type: "Freight",
    amount: 2500,
    currency: "USD",
    amountUsd: 2500,
    status: "Settled",
    threeDSecure: true,
    tokenized: true,
    twoFactorVerified: true,
    createdAt: "2026-02-10T10:15:00Z",
    reference: "STRP-880011",
  },
];

export const mockSupportMessages: SupportMessage[] = [
  {
    id: "SUP-001",
    customerEmail: "customer@imkcargo.com",
    sender: "Customer",
    message: "Please confirm if delivery includes door-to-door handoff.",
    timestamp: "2026-02-12T09:20:00Z",
  },
  {
    id: "SUP-002",
    customerEmail: "customer@imkcargo.com",
    sender: "Agent",
    message: "Confirmed. This shipment is tagged for door-to-door delivery.",
    timestamp: "2026-02-12T09:40:00Z",
  },
];

export const mockDriverTasks: DriverTask[] = [
  {
    id: "DRV-001",
    trackingNumber: "IBM-2026-XQ",
    driver: "Abdi Noor",
    type: "Delivery",
    status: "In Progress",
    dueAt: "2026-02-16T18:00:00Z",
  },
  {
    id: "DRV-002",
    trackingNumber: "IBM-2026-MN",
    driver: "Khadra Ahmed",
    type: "Pickup",
    status: "Open",
    dueAt: "2026-02-14T09:00:00Z",
  },
];

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAdminData } from "@/context/AdminDataContext";
import {
  mockBillingInvoices,
  mockCarrierConnections,
  mockCarrierEvents,
  mockComplianceChecks,
  mockDriverTasks,
  mockExceptionAlerts,
  mockFxRates,
  mockGeofenceAlerts,
  mockGeofenceZones,
  mockIoTTelemetry,
  mockNotifications,
  mockPayments,
  mockPredictiveEtas,
  mockRoutePlans,
  mockShipmentDocuments,
  mockSupportMessages,
} from "@/data/logisticsData";
import type { ShipmentStatus } from "@/data/trackingData";
import {
  type BillingInvoice,
  type CarrierConnection,
  type CarrierEvent,
  type DriverTask,
  type ExceptionAlert,
  type FxRate,
  type GeofenceAlert,
  type IoTTelemetry,
  type PaymentMethod,
  type PaymentTransaction,
  type PredictiveEta,
  type RateComparisonInput,
  type RateOption,
  type RoutePlan,
  type ShipmentDocument,
  type ShipmentDocumentType,
  type ShipmentNotification,
  type SupportMessage,
  type TradeComplianceCheck,
  type TradeComplianceInput,
  type PaymentTrigger,
} from "@/types/logistics";
import type { ShipmentMode } from "@/types/admin";

const STORAGE_KEYS = {
  carriers: "log_carriers_v1",
  carrierEvents: "log_carrier_events_v1",
  complianceChecks: "log_compliance_checks_v1",
  routes: "log_routes_v1",
  predictiveEtas: "log_predictive_eta_v1",
  documents: "log_documents_v1",
  notifications: "log_notifications_v1",
  exceptions: "log_exceptions_v1",
  iotTelemetry: "log_iot_telemetry_v1",
  geofenceAlerts: "log_geofence_alerts_v1",
  fxRates: "log_fx_rates_v1",
  invoices: "log_invoices_v1",
  payments: "log_payments_v1",
  support: "log_support_messages_v1",
  driverTasks: "log_driver_tasks_v1",
} as const;

interface CreateCarrierEventInput {
  trackingNumber: string;
  carrierId: string;
  event: string;
  location: string;
  eta?: string;
}

interface OptimizeRouteInput {
  trackingNumber: string;
  strategy: RoutePlan["strategy"];
}

interface CreateInvoiceInput {
  trackingNumber: string;
  currency: string;
  trigger: PaymentTrigger;
  includeInsurance: boolean;
  billingPlan: "Per Shipment" | "Monthly Contract";
}

interface RecordPaymentInput {
  invoiceId: string;
  method: PaymentMethod;
  type: PaymentTransaction["type"];
  amount: number;
  currency: string;
  status: PaymentTransaction["status"];
  threeDSecure: boolean;
  tokenized: boolean;
  twoFactorVerified: boolean;
}

interface UploadDocumentInput {
  trackingNumber: string;
  type: ShipmentDocumentType;
  fileName: string;
  uploadedBy: string;
}

interface AddTelemetryInput {
  trackingNumber: string;
  lat: number;
  lng: number;
  temperatureC: number;
  humidityPct: number;
  shockG: number;
  sealOpen: boolean;
}

interface CreateDriverTaskInput {
  trackingNumber: string;
  driver: string;
  type: DriverTask["type"];
  dueAt: string;
}

interface LogisticsControlContextType {
  carrierConnections: CarrierConnection[];
  carrierEvents: CarrierEvent[];
  complianceChecks: TradeComplianceCheck[];
  routePlans: RoutePlan[];
  predictiveEtas: PredictiveEta[];
  documents: ShipmentDocument[];
  notifications: ShipmentNotification[];
  exceptionAlerts: ExceptionAlert[];
  iotTelemetry: IoTTelemetry[];
  geofenceAlerts: GeofenceAlert[];
  fxRates: FxRate[];
  invoices: BillingInvoice[];
  payments: PaymentTransaction[];
  supportMessages: SupportMessage[];
  driverTasks: DriverTask[];
  compareRates: (input: RateComparisonInput) => RateOption[];
  runComplianceCheck: (input: TradeComplianceInput) => TradeComplianceCheck;
  refreshCarrierSync: (carrierId: string) => void;
  addCarrierEvent: (payload: CreateCarrierEventInput) => { success: boolean; message: string };
  optimizeRoute: (input: OptimizeRouteInput) => { success: boolean; message: string; routePlan?: RoutePlan };
  refreshPredictiveEta: (trackingNumber: string) => PredictiveEta | null;
  addStatusNotifications: (trackingNumber: string, status: ShipmentStatus) => void;
  markNotificationRead: (notificationId: string) => void;
  resolveExceptionAlert: (alertId: string, note?: string) => void;
  uploadDocument: (payload: UploadDocumentInput) => { success: boolean; message: string };
  generateStandardDocuments: (trackingNumber: string, mode: ShipmentMode) => ShipmentDocument[];
  addTelemetryReading: (payload: AddTelemetryInput) => { success: boolean; message: string };
  resolveGeofenceAlert: (alertId: string) => void;
  refreshFxRates: () => void;
  createInvoice: (payload: CreateInvoiceInput) => { success: boolean; message: string; invoiceId?: string };
  recordPayment: (payload: RecordPaymentInput) => { success: boolean; message: string };
  postSupportMessage: (customerEmail: string, message: string, sender?: SupportMessage["sender"]) => void;
  sendAiSupportReply: (customerEmail: string, trackingNumber?: string) => void;
  createDriverTask: (payload: CreateDriverTaskInput) => { success: boolean; message: string };
  updateDriverTaskStatus: (taskId: string, status: DriverTask["status"]) => void;
  attachPodToTask: (taskId: string, podFileName: string, uploadedBy: string) => { success: boolean; message: string };
}

const LogisticsControlContext = createContext<LogisticsControlContextType | undefined>(undefined);

const safeParseArray = <T,>(value: string | null, fallback: T[]): T[] => {
  if (!value) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return fallback;
    }
    return parsed as T[];
  } catch (error) {
    console.error("Failed to parse logistics data:", error);
    return fallback;
  }
};

const withStorage = <T,>(key: string, fallback: T[]) =>
  safeParseArray<T>(localStorage.getItem(key), fallback);

const toId = (prefix: string, count: number) => `${prefix}-${String(count + 1).padStart(4, "0")}`;

const STATUS_SEVERITY: Record<ShipmentStatus, ShipmentNotification["severity"]> = {
  Pending: "Info",
  "In Transit": "Info",
  Customs: "Warning",
  Delivered: "Info",
};

const STATUS_ALERT_TITLE: Record<ShipmentStatus, string> = {
  Pending: "Shipment Booked",
  "In Transit": "Shipment In Transit",
  Customs: "Customs Update",
  Delivered: "Shipment Delivered",
};

const STATUS_LABEL: Record<ShipmentStatus, string> = {
  Pending: "Booked",
  "In Transit": "In Transit",
  Customs: "Customs",
  Delivered: "Delivered",
};

const fxToUsd = (currency: string, rates: FxRate[]) =>
  rates.find((rate) => rate.currency === currency)?.rateToUsd ?? 1;

const convertUsdToCurrency = (amountUsd: number, currency: string, rates: FxRate[]) => {
  const rate = fxToUsd(currency, rates);
  return Number((amountUsd / rate).toFixed(2));
};

const convertCurrencyToUsd = (amount: number, currency: string, rates: FxRate[]) => {
  const rate = fxToUsd(currency, rates);
  return Number((amount * rate).toFixed(2));
};

const round2 = (value: number) => Number(value.toFixed(2));

const routeDistanceLookup: Record<string, number> = {
  "Dubai, UAE|Mogadishu, Somalia": 3670,
  "Guangzhou, China|Nairobi, Kenya": 8640,
  "Mombasa, Kenya|Hargeisa, Somalia": 1750,
  "Jeddah, Saudi Arabia|Kampala, Uganda": 2760,
  "Dar es Salaam, Tanzania|Addis Ababa, Ethiopia": 1880,
};

const estimateDistanceKm = (origin: string, destination: string) =>
  routeDistanceLookup[`${origin}|${destination}`] ?? 2400;

const normalizeCountry = (value: string) => value.trim().toUpperCase();

const sanctions = ["IRAN", "SYRIA", "NORTH KOREA", "RUSSIA"];

const dutyRateByHsPrefix: Record<string, number> = {
  "30": 0.08,
  "39": 0.12,
  "52": 0.1,
  "61": 0.14,
  "84": 0.11,
  "85": 0.13,
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
};

const getInsideZone = (lat: number, lng: number, zone: { lat: number; lng: number; radiusKm: number }) =>
  haversineKm(lat, lng, zone.lat, zone.lng) <= zone.radiusKm;

export function LogisticsControlProvider({ children }: { children: ReactNode }) {
  const { shipments, cargoJobs, customsEntries } = useAdminData();

  const [carrierConnections, setCarrierConnections] = useState<CarrierConnection[]>(() =>
    withStorage(STORAGE_KEYS.carriers, mockCarrierConnections)
  );
  const [carrierEvents, setCarrierEvents] = useState<CarrierEvent[]>(() =>
    withStorage(STORAGE_KEYS.carrierEvents, mockCarrierEvents)
  );
  const [complianceChecks, setComplianceChecks] = useState<TradeComplianceCheck[]>(() =>
    withStorage(STORAGE_KEYS.complianceChecks, mockComplianceChecks)
  );
  const [routePlans, setRoutePlans] = useState<RoutePlan[]>(() =>
    withStorage(STORAGE_KEYS.routes, mockRoutePlans)
  );
  const [predictiveEtas, setPredictiveEtas] = useState<PredictiveEta[]>(() =>
    withStorage(STORAGE_KEYS.predictiveEtas, mockPredictiveEtas)
  );
  const [documents, setDocuments] = useState<ShipmentDocument[]>(() =>
    withStorage(STORAGE_KEYS.documents, mockShipmentDocuments)
  );
  const [notifications, setNotifications] = useState<ShipmentNotification[]>(() =>
    withStorage(STORAGE_KEYS.notifications, mockNotifications)
  );
  const [exceptionAlerts, setExceptionAlerts] = useState<ExceptionAlert[]>(() =>
    withStorage(STORAGE_KEYS.exceptions, mockExceptionAlerts)
  );
  const [iotTelemetry, setIoTTelemetry] = useState<IoTTelemetry[]>(() =>
    withStorage(STORAGE_KEYS.iotTelemetry, mockIoTTelemetry)
  );
  const [geofenceAlerts, setGeofenceAlerts] = useState<GeofenceAlert[]>(() =>
    withStorage(STORAGE_KEYS.geofenceAlerts, mockGeofenceAlerts)
  );
  const [fxRates, setFxRates] = useState<FxRate[]>(() =>
    withStorage(STORAGE_KEYS.fxRates, mockFxRates)
  );
  const [invoices, setInvoices] = useState<BillingInvoice[]>(() =>
    withStorage(STORAGE_KEYS.invoices, mockBillingInvoices)
  );
  const [payments, setPayments] = useState<PaymentTransaction[]>(() =>
    withStorage(STORAGE_KEYS.payments, mockPayments)
  );
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(() =>
    withStorage(STORAGE_KEYS.support, mockSupportMessages)
  );
  const [driverTasks, setDriverTasks] = useState<DriverTask[]>(() =>
    withStorage(STORAGE_KEYS.driverTasks, mockDriverTasks)
  );

  useEffect(() => localStorage.setItem(STORAGE_KEYS.carriers, JSON.stringify(carrierConnections)), [carrierConnections]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.carrierEvents, JSON.stringify(carrierEvents)), [carrierEvents]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.complianceChecks, JSON.stringify(complianceChecks)), [complianceChecks]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.routes, JSON.stringify(routePlans)), [routePlans]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.predictiveEtas, JSON.stringify(predictiveEtas)), [predictiveEtas]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(documents)), [documents]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications)), [notifications]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.exceptions, JSON.stringify(exceptionAlerts)), [exceptionAlerts]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.iotTelemetry, JSON.stringify(iotTelemetry)), [iotTelemetry]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.geofenceAlerts, JSON.stringify(geofenceAlerts)), [geofenceAlerts]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.fxRates, JSON.stringify(fxRates)), [fxRates]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments)), [payments]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.support, JSON.stringify(supportMessages)), [supportMessages]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.driverTasks, JSON.stringify(driverTasks)), [driverTasks]);

  const compareRates = (input: RateComparisonInput): RateOption[] => {
    const distanceKm = estimateDistanceKm(input.origin, input.destination);
    const demandFactor = [5, 6, 0].includes(new Date().getDay()) ? 1.07 : 1;
    const serviceMultiplier = input.serviceType === "Express" ? 1.23 : 1;

    const modeConfig: Record<
      ShipmentMode,
      {
        base: number;
        weightFactor: number;
        volumeFactor: number;
        distanceFactor: number;
        days: number;
        co2PerTonKm: number;
        carriers: string[];
        bestFor: string;
      }
    > = {
      Air: {
        base: 960,
        weightFactor: 3.8,
        volumeFactor: 220,
        distanceFactor: 0.12,
        days: 4,
        co2PerTonKm: 0.58,
        carriers: ["Emirates SkyCargo", "FedEx Logistics"],
        bestFor: "Urgent and high-value cargo",
      },
      Sea: {
        base: 510,
        weightFactor: 0.92,
        volumeFactor: 128,
        distanceFactor: 0.05,
        days: 9,
        co2PerTonKm: 0.14,
        carriers: ["Maersk", "FedEx Logistics"],
        bestFor: "Cost-efficient bulk shipments",
      },
      Road: {
        base: 430,
        weightFactor: 1.4,
        volumeFactor: 95,
        distanceFactor: 0.08,
        days: 6,
        co2PerTonKm: 0.25,
        carriers: ["DHL Freight", "FedEx Logistics"],
        bestFor: "Regional door-to-door distribution",
      },
    };

    return (["Air", "Sea", "Road"] as ShipmentMode[])
      .map((mode) => {
        const cfg = modeConfig[mode];
        const priceUsd =
          (cfg.base +
            input.weightKg * cfg.weightFactor +
            input.volumeCbm * cfg.volumeFactor +
            distanceKm * cfg.distanceFactor) *
          serviceMultiplier *
          demandFactor;
        const transitDays = Math.max(
          2,
          Math.round(cfg.days + distanceKm / 2000 - (input.serviceType === "Express" ? 1 : 0))
        );
        const co2Kg = round2((input.weightKg / 1000) * distanceKm * cfg.co2PerTonKm);

        return {
          id: `${mode}-${distanceKm}-${input.weightKg}-${input.volumeCbm}`,
          mode,
          carrier: cfg.carriers[0],
          transitDays,
          priceUsd: round2(priceUsd),
          co2Kg,
          bestFor: cfg.bestFor,
        };
      })
      .sort((a, b) => a.priceUsd - b.priceUsd);
  };

  const runComplianceCheck = (input: TradeComplianceInput): TradeComplianceCheck => {
    const hsCode = input.hsCode.trim();
    const issues: string[] = [];
    const suggestions: string[] = [];
    const docsRequired = ["Commercial Invoice", "Packing List"];
    const providedDocs = new Set(input.documents.map((doc) => doc.trim()).filter(Boolean));

    if (!/^\d{6,10}$/.test(hsCode)) {
      issues.push("HS code must be numeric with 6 to 10 digits.");
    }

    const origin = normalizeCountry(input.originCountry);
    const destination = normalizeCountry(input.destinationCountry);

    if (sanctions.some((country) => origin.includes(country) || destination.includes(country))) {
      issues.push("Trade lane may be restricted by sanctions or export controls.");
      suggestions.push("Escalate to compliance legal team before booking.");
    }

    docsRequired.forEach((doc) => {
      if (!providedDocs.has(doc)) {
        issues.push(`Missing required document: ${doc}.`);
      }
    });

    if (input.hazardous && !providedDocs.has("MSDS")) {
      issues.push("Hazardous cargo requires MSDS documentation.");
      suggestions.push("Attach MSDS and dangerous goods declaration.");
    }

    if (input.cargoValueUsd > 50000 && !providedDocs.has("Insurance Certificate")) {
      suggestions.push("High-value cargo should include insurance certificate.");
    }

    const hsPrefix = hsCode.slice(0, 2);
    const dutyRate = dutyRateByHsPrefix[hsPrefix] ?? 0.1;
    const incotermAdjustment = input.incoterm === "DDP" ? 1.1 : input.incoterm === "CIF" ? 1.05 : 1;
    const dutiesUsd = round2(input.cargoValueUsd * dutyRate * incotermAdjustment);

    const generatedDocs: ShipmentDocumentType[] = ["Commercial Invoice", "Packing List", "Certificate of Origin"];
    if (input.trackingNumber) {
      const linkedShipment = shipments.find((shipment) => shipment.trackingNumber === input.trackingNumber);
      if (linkedShipment?.mode === "Air") {
        generatedDocs.push("Air Waybill");
      }
      if (linkedShipment?.mode === "Sea") {
        generatedDocs.push("Bill of Lading");
      }
      if (!linkedShipment?.mode) {
        generatedDocs.push("Air Waybill");
      }
    }
    if (input.cargoValueUsd > 25000 || input.incoterm === "CIF" || input.incoterm === "DDP") {
      generatedDocs.push("Insurance Certificate");
    }

    const hasCriticalIssue = issues.some((issue) =>
      issue.includes("restricted") || issue.includes("HS code")
    );
    const status: TradeComplianceCheck["status"] =
      hasCriticalIssue ? "Fail" : issues.length > 0 || suggestions.length > 0 ? "Warning" : "Pass";

    if (status === "Pass" && suggestions.length === 0) {
      suggestions.push("Compliance pre-check passed. Continue to customs filing.");
    }

    const check: TradeComplianceCheck = {
      id: toId("CMP", complianceChecks.length),
      trackingNumber: input.trackingNumber,
      requestId: input.requestId,
      hsCode,
      dutiesUsd,
      status,
      issues,
      suggestions,
      generatedDocs: Array.from(new Set(generatedDocs)),
      createdAt: new Date().toISOString(),
    };

    setComplianceChecks((current) => [check, ...current]);

    if (status === "Fail" && input.trackingNumber) {
      const exception: ExceptionAlert = {
        id: toId("EXP", exceptionAlerts.length),
        trackingNumber: input.trackingNumber,
        type: "Compliance Failure",
        severity: "High",
        status: "Open",
        createdAt: new Date().toISOString(),
        note: "Failed automated trade compliance check.",
      };
      setExceptionAlerts((current) => [exception, ...current]);
    }

    return check;
  };

  const refreshCarrierSync = (carrierId: string) => {
    setCarrierConnections((current) =>
      current.map((carrier) => {
        if (carrier.id !== carrierId) {
          return carrier;
        }
        const jitter = (Math.random() - 0.5) * 2.2;
        const successRatePct = Math.max(88, Math.min(99.9, round2(carrier.successRatePct + jitter)));
        return {
          ...carrier,
          successRatePct,
          apiStatus: successRatePct > 95 ? "Connected" : successRatePct > 91 ? "Degraded" : "Offline",
          lastSyncAt: new Date().toISOString(),
        };
      })
    );
  };

  const addCarrierEvent = (payload: CreateCarrierEventInput) => {
    const trackingNumber = payload.trackingNumber.trim().toUpperCase();
    const carrier = carrierConnections.find((item) => item.id === payload.carrierId);
    if (!trackingNumber || !carrier || !payload.event.trim() || !payload.location.trim()) {
      return {
        success: false,
        message: "Tracking number, carrier, event, and location are required.",
      };
    }

    const event: CarrierEvent = {
      id: toId("CE", carrierEvents.length),
      trackingNumber,
      carrierId: payload.carrierId,
      event: payload.event.trim(),
      location: payload.location.trim(),
      timestamp: new Date().toISOString(),
      eta: payload.eta,
    };
    setCarrierEvents((current) => [event, ...current]);
    return {
      success: true,
      message: `Carrier event recorded for ${trackingNumber}.`,
    };
  };

  const optimizeRoute = (input: OptimizeRouteInput) => {
    const trackingNumber = input.trackingNumber.trim().toUpperCase();
    const shipment = shipments.find((item) => item.trackingNumber === trackingNumber);
    if (!shipment) {
      return {
        success: false,
        message: "Shipment not found.",
      };
    }

    const rateOptions = compareRates({
      origin: shipment.origin,
      destination: shipment.destination,
      weightKg:
        cargoJobs.find((job) => job.trackingNumber === trackingNumber)?.weightKg ?? 100,
      volumeCbm:
        cargoJobs.find((job) => job.trackingNumber === trackingNumber)?.volumeCbm ?? 1,
      serviceType: shipment.serviceType ?? "Standard",
    });

    const modeWeight: Record<RoutePlan["strategy"], (candidate: RateOption) => number> = {
      Cost: (candidate) => candidate.priceUsd,
      Speed: (candidate) => candidate.transitDays * 600 + candidate.priceUsd * 0.25,
      Balanced: (candidate) => candidate.priceUsd * 0.55 + candidate.transitDays * 220,
      "Low Carbon": (candidate) => candidate.co2Kg * 2.5 + candidate.priceUsd * 0.3,
    };

    const winner = [...rateOptions].sort((a, b) => modeWeight[input.strategy](a) - modeWeight[input.strategy](b))[0];
    const distanceKm = estimateDistanceKm(shipment.origin, shipment.destination);
    const riskScore = Math.min(
      95,
      Math.round(
        (shipment.riskLevel === "High" ? 70 : shipment.riskLevel === "Medium" ? 45 : 20) +
          (winner.mode === "Road" ? 8 : winner.mode === "Air" ? 4 : 0)
      )
    );

    const routePlan: RoutePlan = {
      id: toId("RTE", routePlans.length),
      trackingNumber,
      origin: shipment.origin,
      destination: shipment.destination,
      strategy: input.strategy,
      recommendedMode: winner.mode,
      recommendedCarrier: winner.carrier,
      estimatedTransitDays: winner.transitDays,
      estimatedCostUsd: winner.priceUsd,
      distanceKm,
      riskScore,
      carbonKg: winner.co2Kg,
      createdAt: new Date().toISOString(),
    };
    setRoutePlans((current) => [routePlan, ...current]);
    return {
      success: true,
      message: `Route optimized for ${trackingNumber}.`,
      routePlan,
    };
  };

  const refreshPredictiveEta = (trackingNumber: string) => {
    const normalized = trackingNumber.trim().toUpperCase();
    const shipment = shipments.find((item) => item.trackingNumber === normalized);
    if (!shipment) {
      return null;
    }
    const linkedOrder = cargoJobs.find((order) => order.trackingNumber === normalized);
    const baseEta = new Date(shipment.eta);
    if (Number.isNaN(baseEta.getTime())) {
      return null;
    }

    let etaOffsetDays = 0;
    const factors: string[] = [];

    if (shipment.riskLevel === "High") {
      etaOffsetDays += 1;
      factors.push("High risk profile");
    }
    if (linkedOrder?.status === "Delayed") {
      etaOffsetDays += 2;
      factors.push("Order currently delayed");
    }
    if (shipment.status === "Customs") {
      etaOffsetDays += 1;
      factors.push("Customs processing variability");
    }
    if (shipment.mode === "Air") {
      etaOffsetDays -= 1;
      factors.push("Air mode acceleration");
    }
    if (shipment.mode === "Sea") {
      factors.push("Ocean lane weather variability");
    }

    const predictedDate = new Date(baseEta);
    predictedDate.setDate(predictedDate.getDate() + etaOffsetDays);

    const confidencePct = Math.max(
      62,
      Math.min(
        97,
        Math.round(
          94 -
            (shipment.riskLevel === "High" ? 12 : shipment.riskLevel === "Medium" ? 6 : 2) -
            (shipment.status === "Customs" ? 6 : 0) -
            (linkedOrder?.status === "Delayed" ? 10 : 0)
        )
      )
    );

    const prediction: PredictiveEta = {
      trackingNumber: normalized,
      predictedEta: predictedDate.toISOString().slice(0, 10),
      confidencePct,
      riskLevel:
        confidencePct < 75 ? "High" : confidencePct < 86 ? "Medium" : "Low",
      factors: factors.length > 0 ? factors : ["Stable milestone progression"],
      updatedAt: new Date().toISOString(),
    };

    setPredictiveEtas((current) => {
      const existingIndex = current.findIndex((item) => item.trackingNumber === normalized);
      if (existingIndex === -1) {
        return [prediction, ...current];
      }
      const next = [...current];
      next[existingIndex] = prediction;
      return next;
    });

    return prediction;
  };

  const addStatusNotifications = (trackingNumber: string, status: ShipmentStatus) => {
    const shipment = shipments.find((item) => item.trackingNumber === trackingNumber);
    if (!shipment) {
      return;
    }

    const title = STATUS_ALERT_TITLE[status];
    const severity = STATUS_SEVERITY[status];
    const channels: ShipmentNotification["channel"][] = ["Email", "SMS", "Push"];

    const created = channels.map((channel, index) => ({
      id: toId("NTF", notifications.length + index),
      trackingNumber,
      customerEmail: shipment.customerEmail,
      channel,
      title,
      message: `Shipment ${trackingNumber} changed status to ${STATUS_LABEL[status]}.`,
      severity,
      createdAt: new Date().toISOString(),
      read: false,
    }));

    setNotifications((current) => [...created, ...current]);

    if (status === "Customs") {
      const customsException: ExceptionAlert = {
        id: toId("EXP", exceptionAlerts.length),
        trackingNumber,
        type: "Customs Hold",
        severity: "High",
        status: "Open",
        createdAt: new Date().toISOString(),
        note: "Manual customs follow-up recommended.",
      };
      setExceptionAlerts((current) => [customsException, ...current]);
    }
    if (status === "Delivered") {
      const podDoc: ShipmentDocument = {
        id: toId("DOC", documents.length),
        trackingNumber,
        type: "Proof of Delivery",
        fileName: `POD-${trackingNumber}.pdf`,
        uploadedBy: "Driver App",
        uploadedAt: new Date().toISOString(),
        verified: true,
      };
      setDocuments((current) => [podDoc, ...current]);
    }
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, read: true } : item))
    );
  };

  const resolveExceptionAlert = (alertId: string, note?: string) => {
    setExceptionAlerts((current) =>
      current.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "Resolved",
              note: note?.trim() || alert.note,
            }
          : alert
      )
    );
  };

  const uploadDocument = (payload: UploadDocumentInput) => {
    const trackingNumber = payload.trackingNumber.trim().toUpperCase();
    if (!trackingNumber || !payload.fileName.trim() || !payload.uploadedBy.trim()) {
      return {
        success: false,
        message: "Tracking number, file name, and uploader are required.",
      };
    }
    const document: ShipmentDocument = {
      id: toId("DOC", documents.length),
      trackingNumber,
      type: payload.type,
      fileName: payload.fileName.trim(),
      uploadedBy: payload.uploadedBy.trim(),
      uploadedAt: new Date().toISOString(),
      verified: false,
    };
    setDocuments((current) => [document, ...current]);
    return {
      success: true,
      message: `${payload.type} uploaded for ${trackingNumber}.`,
    };
  };

  const generateStandardDocuments = (trackingNumber: string, mode: ShipmentMode) => {
    const templateDocs: ShipmentDocumentType[] = [
      "Commercial Invoice",
      "Packing List",
      "Certificate of Origin",
      mode === "Air" ? "Air Waybill" : "Bill of Lading",
    ];
    const generated = templateDocs.map((type, index) => ({
      id: toId("DOC", documents.length + index),
      trackingNumber,
      type,
      fileName: `${type.replace(/\s+/g, "_").toUpperCase()}-${trackingNumber}.pdf`,
      uploadedBy: "Auto-Doc Engine",
      uploadedAt: new Date().toISOString(),
      verified: type !== "Certificate of Origin",
    }));
    setDocuments((current) => [...generated, ...current]);
    return generated;
  };

  const addTelemetryReading = (payload: AddTelemetryInput) => {
    const trackingNumber = payload.trackingNumber.trim().toUpperCase();
    if (!trackingNumber) {
      return {
        success: false,
        message: "Tracking number is required.",
      };
    }

    const reading: IoTTelemetry = {
      id: toId("IOT", iotTelemetry.length),
      trackingNumber,
      timestamp: new Date().toISOString(),
      lat: payload.lat,
      lng: payload.lng,
      temperatureC: payload.temperatureC,
      humidityPct: payload.humidityPct,
      shockG: payload.shockG,
      sealOpen: payload.sealOpen,
    };

    const lastReading = iotTelemetry
      .filter((item) => item.trackingNumber === trackingNumber)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const newGeofenceAlerts: GeofenceAlert[] = [];
    mockGeofenceZones.forEach((zone) => {
      const isInside = getInsideZone(reading.lat, reading.lng, zone);
      const wasInside = lastReading ? getInsideZone(lastReading.lat, lastReading.lng, zone) : false;
      if (lastReading && isInside !== wasInside) {
        const alert: GeofenceAlert = {
          id: toId("GFA", geofenceAlerts.length + newGeofenceAlerts.length),
          trackingNumber,
          zoneName: zone.name,
          event: isInside ? "Entered" : "Exited",
          timestamp: new Date().toISOString(),
          resolved: false,
        };
        newGeofenceAlerts.push(alert);
      }
    });

    if (reading.temperatureC > 30 || reading.temperatureC < 2) {
      const exception: ExceptionAlert = {
        id: toId("EXP", exceptionAlerts.length),
        trackingNumber,
        type: "Temperature Breach",
        severity: "High",
        status: "Open",
        createdAt: new Date().toISOString(),
        note: `Temperature at ${reading.temperatureC}C exceeded threshold.`,
      };
      setExceptionAlerts((current) => [exception, ...current]);
    }

    if (newGeofenceAlerts.some((alert) => alert.event === "Exited")) {
      const exception: ExceptionAlert = {
        id: toId("EXP", exceptionAlerts.length + 1),
        trackingNumber,
        type: "Geofence Exit",
        severity: "Medium",
        status: "Open",
        createdAt: new Date().toISOString(),
      };
      setExceptionAlerts((current) => [exception, ...current]);
    }

    setIoTTelemetry((current) => [reading, ...current]);
    if (newGeofenceAlerts.length > 0) {
      setGeofenceAlerts((current) => [...newGeofenceAlerts, ...current]);
    }

    return {
      success: true,
      message:
        newGeofenceAlerts.length > 0
          ? `Telemetry saved with ${newGeofenceAlerts.length} geofence event(s).`
          : "Telemetry saved.",
    };
  };

  const resolveGeofenceAlert = (alertId: string) => {
    setGeofenceAlerts((current) =>
      current.map((alert) => (alert.id === alertId ? { ...alert, resolved: true } : alert))
    );
  };

  const refreshFxRates = () => {
    setFxRates((current) =>
      current.map((rate) => {
        if (rate.currency === "USD") {
          return { ...rate, updatedAt: new Date().toISOString() };
        }
        const jitter = 1 + (Math.random() - 0.5) * 0.02;
        return {
          ...rate,
          rateToUsd: round2(rate.rateToUsd * jitter),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const createInvoice = (payload: CreateInvoiceInput) => {
    const trackingNumber = payload.trackingNumber.trim().toUpperCase();
    const shipment = shipments.find((item) => item.trackingNumber === trackingNumber);
    if (!shipment) {
      return {
        success: false,
        message: "Shipment not found.",
      };
    }
    const linkedOrder = cargoJobs.find((order) => order.trackingNumber === trackingNumber);
    const duty = customsEntries.find((entry) => entry.trackingNumber === trackingNumber)?.dutyAmountUsd ?? 0;

    const pricing = compareRates({
      origin: shipment.origin,
      destination: shipment.destination,
      weightKg: linkedOrder?.weightKg ?? 100,
      volumeCbm: linkedOrder?.volumeCbm ?? 1,
      serviceType: shipment.serviceType ?? "Standard",
    }).find((option) => option.mode === (shipment.mode ?? "Sea"));

    const freightUsd = pricing?.priceUsd ?? 1500;
    const insuranceUsd = payload.includeInsurance ? Math.max(45, freightUsd * 0.03) : 0;
    const totalUsd = round2(freightUsd + duty + insuranceUsd);

    const invoice: BillingInvoice = {
      id: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`,
      trackingNumber,
      customerEmail: shipment.customerEmail,
      billingPlan: payload.billingPlan,
      currency: payload.currency,
      freightAmount: convertUsdToCurrency(freightUsd, payload.currency, fxRates),
      dutyAmount: convertUsdToCurrency(duty, payload.currency, fxRates),
      insuranceAmount: convertUsdToCurrency(insuranceUsd, payload.currency, fxRates),
      totalAmount: convertUsdToCurrency(totalUsd, payload.currency, fxRates),
      status: "Issued",
      trigger: payload.trigger,
      issuedAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setInvoices((current) => [invoice, ...current]);
    return {
      success: true,
      message: `Invoice ${invoice.id} issued for ${trackingNumber}.`,
      invoiceId: invoice.id,
    };
  };

  const recordPayment = (payload: RecordPaymentInput) => {
    const invoice = invoices.find((item) => item.id === payload.invoiceId);
    if (!invoice) {
      return {
        success: false,
        message: "Invoice not found.",
      };
    }
    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      return {
        success: false,
        message: "Payment amount must be greater than zero.",
      };
    }

    const transaction: PaymentTransaction = {
      id: toId("PAY", payments.length),
      invoiceId: payload.invoiceId,
      trackingNumber: invoice.trackingNumber,
      method: payload.method,
      type: payload.type,
      amount: payload.amount,
      currency: payload.currency,
      amountUsd: convertCurrencyToUsd(payload.amount, payload.currency, fxRates),
      status: payload.status,
      threeDSecure: payload.threeDSecure,
      tokenized: payload.tokenized,
      twoFactorVerified: payload.twoFactorVerified,
      createdAt: new Date().toISOString(),
      reference: `GLB-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
    };
    setPayments((current) => [transaction, ...current]);

    const settledUsd = [...payments, transaction]
      .filter((payment) => payment.invoiceId === payload.invoiceId && payment.status === "Settled")
      .reduce((sum, payment) => sum + payment.amountUsd, 0);
    const invoiceTotalUsd = convertCurrencyToUsd(invoice.totalAmount, invoice.currency, fxRates);

    setInvoices((current) =>
      current.map((item) =>
        item.id === payload.invoiceId
          ? {
              ...item,
              status:
                settledUsd >= invoiceTotalUsd
                  ? "Paid"
                  : settledUsd > 0
                    ? "Partially Paid"
                    : item.status,
            }
          : item
      )
    );

    return {
      success: true,
      message: `Payment ${transaction.reference} recorded.`,
    };
  };

  const postSupportMessage = (customerEmail: string, message: string, sender: SupportMessage["sender"] = "Customer") => {
    if (!customerEmail.trim() || !message.trim()) {
      return;
    }
    const supportMessage: SupportMessage = {
      id: toId("SUP", supportMessages.length),
      customerEmail: customerEmail.trim().toLowerCase(),
      sender,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };
    setSupportMessages((current) => [...current, supportMessage]);
  };

  const sendAiSupportReply = (customerEmail: string, trackingNumber?: string) => {
    const normalizedEmail = customerEmail.trim().toLowerCase();
    const shipment = trackingNumber
      ? shipments.find((item) => item.trackingNumber === trackingNumber)
      : shipments.find((item) => item.customerEmail.toLowerCase() === normalizedEmail);

    const message = shipment
      ? `AI update: ${shipment.trackingNumber} is ${shipment.status}. Predicted ETA is being monitored with proactive alerts enabled.`
      : "AI update: We received your request and the operations desk is reviewing it now.";

    postSupportMessage(normalizedEmail, message, "AI Assistant");
  };

  const createDriverTask = (payload: CreateDriverTaskInput) => {
    const trackingNumber = payload.trackingNumber.trim().toUpperCase();
    if (!trackingNumber || !payload.driver.trim() || !payload.dueAt) {
      return {
        success: false,
        message: "Tracking number, driver, and due date are required.",
      };
    }
    const task: DriverTask = {
      id: toId("DRV", driverTasks.length),
      trackingNumber,
      driver: payload.driver.trim(),
      type: payload.type,
      status: "Open",
      dueAt: payload.dueAt,
    };
    setDriverTasks((current) => [task, ...current]);
    return {
      success: true,
      message: `Driver task ${task.id} created.`,
    };
  };

  const updateDriverTaskStatus = (taskId: string, status: DriverTask["status"]) => {
    setDriverTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
  };

  const attachPodToTask = (taskId: string, podFileName: string, uploadedBy: string) => {
    const task = driverTasks.find((item) => item.id === taskId);
    if (!task) {
      return {
        success: false,
        message: "Driver task not found.",
      };
    }
    const fileName = podFileName.trim();
    if (!fileName) {
      return {
        success: false,
        message: "POD file name is required.",
      };
    }
    setDriverTasks((current) =>
      current.map((item) =>
        item.id === taskId
          ? { ...item, podUrl: fileName, status: "Completed", type: "POD Upload" }
          : item
      )
    );
    uploadDocument({
      trackingNumber: task.trackingNumber,
      type: "Proof of Delivery",
      fileName,
      uploadedBy,
    });
    return {
      success: true,
      message: `POD attached to task ${taskId}.`,
    };
  };

  const previousStatusMap = useRef<Map<string, ShipmentStatus>>(new Map());
  const statusInitialized = useRef(false);

  useEffect(() => {
    if (!statusInitialized.current) {
      const initialMap = new Map<string, ShipmentStatus>();
      shipments.forEach((shipment) => {
        initialMap.set(shipment.trackingNumber, shipment.status);
      });
      previousStatusMap.current = initialMap;
      statusInitialized.current = true;
      return;
    }

    const newMap = new Map(previousStatusMap.current);
    shipments.forEach((shipment) => {
      const previous = previousStatusMap.current.get(shipment.trackingNumber);
      if (previous && previous !== shipment.status) {
        addStatusNotifications(shipment.trackingNumber, shipment.status);
      }
      newMap.set(shipment.trackingNumber, shipment.status);
    });
    previousStatusMap.current = newMap;
  }, [shipments]);

  useEffect(() => {
    shipments.forEach((shipment) => {
      if (!predictiveEtas.some((item) => item.trackingNumber === shipment.trackingNumber)) {
        refreshPredictiveEta(shipment.trackingNumber);
      }
    });
  }, [shipments]);

  const value = useMemo<LogisticsControlContextType>(
    () => ({
      carrierConnections,
      carrierEvents,
      complianceChecks,
      routePlans,
      predictiveEtas,
      documents,
      notifications,
      exceptionAlerts,
      iotTelemetry,
      geofenceAlerts,
      fxRates,
      invoices,
      payments,
      supportMessages,
      driverTasks,
      compareRates,
      runComplianceCheck,
      refreshCarrierSync,
      addCarrierEvent,
      optimizeRoute,
      refreshPredictiveEta,
      addStatusNotifications,
      markNotificationRead,
      resolveExceptionAlert,
      uploadDocument,
      generateStandardDocuments,
      addTelemetryReading,
      resolveGeofenceAlert,
      refreshFxRates,
      createInvoice,
      recordPayment,
      postSupportMessage,
      sendAiSupportReply,
      createDriverTask,
      updateDriverTaskStatus,
      attachPodToTask,
    }),
    [
      carrierConnections,
      carrierEvents,
      complianceChecks,
      routePlans,
      predictiveEtas,
      documents,
      notifications,
      exceptionAlerts,
      iotTelemetry,
      geofenceAlerts,
      fxRates,
      invoices,
      payments,
      supportMessages,
      driverTasks,
    ]
  );

  return <LogisticsControlContext.Provider value={value}>{children}</LogisticsControlContext.Provider>;
}

export function useLogisticsControl() {
  const context = useContext(LogisticsControlContext);
  if (!context) {
    throw new Error("useLogisticsControl must be used within LogisticsControlProvider");
  }
  return context;
}

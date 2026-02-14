import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  mockCargoJobs,
  mockCustomsEntries,
  mockFleetUnits,
  mockOpsAnalytics,
  mockServiceRequests,
  mockWarehouseRecords,
} from "@/data/adminData";
import {
  mockShipments,
  type ShipmentCheckpoint,
  type ShipmentRecord,
  type ShipmentStatus,
} from "@/data/trackingData";
import type {
  AdminNotification,
  CargoJob,
  CustomsEntry,
  CustomsStatus,
  FleetStatus,
  FleetUnit,
  JobPriority,
  JobStatus,
  OpsAnalytics,
  RequestStage,
  ServiceRequest,
  ShipmentMode,
  WarehouseRecord,
  WarehouseStatus,
} from "@/types/admin";
import {
  ADMIN_CREDENTIALS,
  CUSTOMER_ACCOUNTS_UPDATED_EVENT,
  loadCustomerAccounts,
  normalizeEmail,
  saveCustomerAccounts,
  type CustomerAccount,
} from "@/lib/customerAccounts";

const ADMIN_DATA_STORAGE_KEYS = {
  requests: "service_requests_v2",
  jobs: "cargo_jobs_v2",
  customs: "customs_entries_v2",
  warehouse: "warehouse_records_v2",
  fleet: "fleet_units_v2",
  shipments: "admin_shipments_v2",
  adminNotifications: "admin_notifications_v1",
} as const;

interface CreateShipmentInput {
  trackingNumber: string;
  customerEmail: string;
  mode: ShipmentMode;
  serviceType: "Express" | "Standard";
  carrier: string;
  containerOrAwb: string;
  riskLevel: "Low" | "Medium" | "High";
  origin: string;
  destination: string;
  eta: string;
  status: ShipmentStatus;
}

interface CreateCargoJobInput {
  trackingNumber: string;
  clientName: string;
  clientEmail: string;
  origin: string;
  destination: string;
  mode: ShipmentMode;
  serviceType: "Express" | "Standard";
  incoterm: "EXW" | "FOB" | "CIF" | "DDP";
  priority: JobPriority;
  cargoDescription: string;
  weightKg: number;
  volumeCbm: number;
  clearanceRequired: boolean;
  eta: string;
}

interface CreateServiceRequestInput {
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
  priority?: JobPriority;
  notes?: string;
}

interface CreateCustomsEntryInput {
  trackingNumber: string;
  declarationNo: string;
  port: string;
  broker: string;
  channel: "Green" | "Yellow" | "Red";
  dutyAmountUsd: number;
}

interface CreateWarehouseRecordInput {
  trackingNumber: string;
  warehouse: string;
  zone: string;
  cargoType: string;
  units: number;
  volumeCbm: number;
  hazardous: boolean;
  temperatureControlled: boolean;
}

interface AdminDataContextType {
  serviceRequests: ServiceRequest[];
  cargoJobs: CargoJob[];
  customsEntries: CustomsEntry[];
  warehouseRecords: WarehouseRecord[];
  fleetUnits: FleetUnit[];
  shipments: ShipmentRecord[];
  customers: CustomerAccount[];
  adminNotifications: AdminNotification[];
  unreadAdminNotifications: number;
  analytics: OpsAnalytics;
  createServiceRequest: (payload: CreateServiceRequestInput) => { success: boolean; message: string; requestId?: string };
  updateRequestStage: (requestId: string, stage: RequestStage) => void;
  issueRequestQuote: (requestId: string, quoteAmountUsd: number, quotePreparedBy: string) => void;
  approveRequest: (requestId: string) => void;
  createJobFromRequest: (requestId: string) => { success: boolean; message: string; jobId?: string };
  createCargoJob: (payload: CreateCargoJobInput) => { success: boolean; message: string };
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  updateJobPriority: (jobId: string, priority: JobPriority) => void;
  createShipment: (payload: CreateShipmentInput) => { success: boolean; message: string };
  updateShipmentStatus: (trackingNumber: string, status: ShipmentStatus) => void;
  deleteShipment: (trackingNumber: string) => void;
  createCustomsEntry: (payload: CreateCustomsEntryInput) => { success: boolean; message: string };
  updateCustomsStatus: (entryId: string, status: CustomsStatus) => void;
  toggleCustomsDocsComplete: (entryId: string, docsComplete: boolean) => void;
  updateCustomsHoldReason: (entryId: string, holdReason: string) => void;
  createWarehouseRecord: (payload: CreateWarehouseRecordInput) => { success: boolean; message: string };
  updateWarehouseStatus: (recordId: string, status: WarehouseStatus) => void;
  updateWarehouseUnits: (recordId: string, units: number) => void;
  updateFleetStatus: (unitId: string, status: FleetStatus) => void;
  updateFleetLocation: (unitId: string, location: string) => void;
  updateFleetUtilization: (unitId: string, utilizationPct: number) => void;
  markAdminNotificationRead: (notificationId: string) => void;
  markAllAdminNotificationsRead: () => void;
  addCustomer: (name: string, email: string, password: string) => { success: boolean; message: string };
  removeCustomer: (email: string) => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

const safeJsonParse = <T,>(value: string | null): T | null => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Failed to parse admin local storage value:", error);
    return null;
  }
};

const loadStoredArray = <T,>(key: string, fallback: T[]): T[] => {
  const parsed = safeJsonParse<unknown>(localStorage.getItem(key));
  if (!Array.isArray(parsed)) {
    return fallback;
  }
  return parsed as T[];
};

const createId = (prefix: string, currentCount: number) =>
  `${prefix}-${String(currentCount + 1).padStart(3, "0")}`;

const LEGACY_JOB_ID_PREFIX = "JOB-";
const ORDER_ID_PREFIX = "ORD-";

const normalizeOrderId = (value?: string) => {
  if (!value) {
    return value;
  }
  if (value.startsWith(LEGACY_JOB_ID_PREFIX)) {
    return `${ORDER_ID_PREFIX}${value.slice(LEGACY_JOB_ID_PREFIX.length)}`;
  }
  return value;
};

const createOrderId = (currentCount: number) =>
  `${ORDER_ID_PREFIX}${new Date().getFullYear()}-${String(currentCount + 1).padStart(3, "0")}`;

const normalizeCargoJobs = (jobs: CargoJob[]): CargoJob[] =>
  jobs.map((job) => ({
    ...job,
    id: normalizeOrderId(job.id) ?? job.id,
    clientEmail: normalizeEmail(job.clientEmail),
  }));

const normalizeServiceRequests = (requests: ServiceRequest[]): ServiceRequest[] =>
  requests.map((request) => ({
    ...request,
    clientEmail: normalizeEmail(request.clientEmail),
    linkedJobId: normalizeOrderId(request.linkedJobId),
  }));

const normalizeCustomsEntries = (entries: CustomsEntry[]): CustomsEntry[] =>
  entries.map((entry) => ({
    ...entry,
    jobId: normalizeOrderId(entry.jobId) ?? "",
  }));

const normalizeShipments = (records: ShipmentRecord[]): ShipmentRecord[] =>
  records.map((record) => ({
    ...record,
    customerEmail: normalizeEmail(record.customerEmail),
  }));

const getShipmentProgressIndex = (status: ShipmentStatus) => {
  if (status === "Pending") return 0;
  if (status === "In Transit") return 1;
  if (status === "Customs") return 2;
  return 3;
};

const applyStatusToCheckpoints = (
  checkpoints: ShipmentCheckpoint[],
  status: ShipmentStatus
): ShipmentCheckpoint[] => {
  const maxCompletedIndex = getShipmentProgressIndex(status);
  const nowIso = new Date().toISOString();

  return checkpoints.map((checkpoint, index) => {
    const completed = index <= maxCompletedIndex;
    return {
      ...checkpoint,
      completed,
      timestamp: completed
        ? checkpoint.timestamp === "Pending"
          ? nowIso
          : checkpoint.timestamp
        : "Pending",
    };
  });
};

const buildDefaultCheckpoints = (origin: string, destination: string, status: ShipmentStatus) => {
  const defaults: ShipmentCheckpoint[] = [
    {
      title: "Booking Confirmed",
      location: origin,
      timestamp: new Date().toISOString(),
      completed: false,
    },
    {
      title: "In Transit",
      location: `Route to ${destination}`,
      timestamp: "Pending",
      completed: false,
    },
    {
      title: "Customs Review",
      location: destination,
      timestamp: "Pending",
      completed: false,
    },
    {
      title: "Delivered",
      location: destination,
      timestamp: "Pending",
      completed: false,
    },
  ];
  return applyStatusToCheckpoints(defaults, status);
};

const mapShipmentToJobStatus = (status: ShipmentStatus): JobStatus => {
  if (status === "Pending") return "Booked";
  if (status === "In Transit") return "In Transit";
  if (status === "Customs") return "Customs";
  return "Delivered";
};

const mapJobToShipmentStatus = (status: JobStatus): ShipmentStatus => {
  if (status === "Booked") return "Pending";
  if (status === "In Transit" || status === "Out for Delivery" || status === "Delayed") return "In Transit";
  if (status === "Customs" || status === "On Hold") return "Customs";
  return "Delivered";
};

const mapJobToRequestStage = (status: JobStatus): RequestStage => {
  if (status === "Booked") return "Booked";
  if (status === "In Transit" || status === "Delayed") return "In Transit";
  if (status === "Customs" || status === "On Hold") return "Customs";
  if (status === "Out for Delivery") return "Out for Delivery";
  return "Received";
};

const mapShipmentToRequestStage = (status: ShipmentStatus): RequestStage => {
  if (status === "Pending") return "Booked";
  if (status === "In Transit") return "In Transit";
  if (status === "Customs") return "Customs";
  return "Received";
};

const buildMonthlyVolume = (jobs: CargoJob[]) => {
  const today = new Date();
  const buckets: { key: string; month: string; jobs: number }[] = [];

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      month: date.toLocaleString("en-US", { month: "short" }),
      jobs: 0,
    });
  }

  const lookup = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  jobs.forEach((job) => {
    const createdAt = new Date(job.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      return;
    }
    const key = `${createdAt.getFullYear()}-${createdAt.getMonth() + 1}`;
    const bucket = lookup.get(key);
    if (bucket) {
      bucket.jobs += 1;
    }
  });

  if (buckets.every((bucket) => bucket.jobs === 0)) {
    return mockOpsAnalytics.monthlyVolume;
  }

  return buckets.map(({ month, jobs }) => ({ month, jobs }));
};

const buildStatusBreakdown = (jobs: CargoJob[]) => {
  const allStatuses: JobStatus[] = [
    "Booked",
    "In Transit",
    "Customs",
    "Out for Delivery",
    "Delivered",
    "Delayed",
    "On Hold",
  ];
  return allStatuses.map((status) => ({
    status,
    count: jobs.filter((job) => job.status === status).length,
  }));
};

const buildModeSplit = (jobs: CargoJob[]) => {
  const modes: ShipmentMode[] = ["Air", "Sea", "Road"];
  return modes.map((mode) => ({
    mode,
    count: jobs.filter((job) => job.mode === mode).length,
  }));
};

const buildLanePerformance = (jobs: CargoJob[]) => {
  const deliveredJobs = jobs.filter((job) => job.status === "Delivered" && job.deliveredAt);
  if (deliveredJobs.length === 0) {
    return mockOpsAnalytics.lanePerformance;
  }

  const lanes = new Map<string, { total: number; onTime: number }>();
  deliveredJobs.forEach((job) => {
    const lane = `${job.origin} -> ${job.destination}`;
    const current = lanes.get(lane) ?? { total: 0, onTime: 0 };
    current.total += 1;
    if (job.deliveredAt && new Date(job.deliveredAt) <= new Date(job.eta)) {
      current.onTime += 1;
    }
    lanes.set(lane, current);
  });

  return Array.from(lanes.entries())
    .map(([lane, stats]) => ({
      lane,
      onTimeRate: Number(((stats.onTime / stats.total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.onTimeRate - a.onTimeRate)
    .slice(0, 6);
};

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() =>
    normalizeServiceRequests(
      loadStoredArray<ServiceRequest>(ADMIN_DATA_STORAGE_KEYS.requests, mockServiceRequests)
    )
  );
  const [cargoJobs, setCargoJobs] = useState<CargoJob[]>(() =>
    normalizeCargoJobs(loadStoredArray<CargoJob>(ADMIN_DATA_STORAGE_KEYS.jobs, mockCargoJobs))
  );
  const [customsEntries, setCustomsEntries] = useState<CustomsEntry[]>(() =>
    normalizeCustomsEntries(
      loadStoredArray<CustomsEntry>(ADMIN_DATA_STORAGE_KEYS.customs, mockCustomsEntries)
    )
  );
  const [warehouseRecords, setWarehouseRecords] = useState<WarehouseRecord[]>(() =>
    loadStoredArray<WarehouseRecord>(ADMIN_DATA_STORAGE_KEYS.warehouse, mockWarehouseRecords)
  );
  const [fleetUnits, setFleetUnits] = useState<FleetUnit[]>(() =>
    loadStoredArray<FleetUnit>(ADMIN_DATA_STORAGE_KEYS.fleet, mockFleetUnits)
  );
  const [shipments, setShipments] = useState<ShipmentRecord[]>(() =>
    normalizeShipments(loadStoredArray<ShipmentRecord>(ADMIN_DATA_STORAGE_KEYS.shipments, mockShipments))
  );
  const [customers, setCustomers] = useState<CustomerAccount[]>(() => loadCustomerAccounts());
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() =>
    loadStoredArray<AdminNotification>(ADMIN_DATA_STORAGE_KEYS.adminNotifications, [])
  );

  useEffect(() => {
    localStorage.setItem(ADMIN_DATA_STORAGE_KEYS.requests, JSON.stringify(serviceRequests));
  }, [serviceRequests]);

  useEffect(() => {
    localStorage.setItem(ADMIN_DATA_STORAGE_KEYS.jobs, JSON.stringify(cargoJobs));
  }, [cargoJobs]);

  useEffect(() => {
    localStorage.setItem(ADMIN_DATA_STORAGE_KEYS.customs, JSON.stringify(customsEntries));
  }, [customsEntries]);

  useEffect(() => {
    localStorage.setItem(ADMIN_DATA_STORAGE_KEYS.warehouse, JSON.stringify(warehouseRecords));
  }, [warehouseRecords]);

  useEffect(() => {
    localStorage.setItem(ADMIN_DATA_STORAGE_KEYS.fleet, JSON.stringify(fleetUnits));
  }, [fleetUnits]);

  useEffect(() => {
    localStorage.setItem(ADMIN_DATA_STORAGE_KEYS.shipments, JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem(
      ADMIN_DATA_STORAGE_KEYS.adminNotifications,
      JSON.stringify(adminNotifications)
    );
  }, [adminNotifications]);

  useEffect(() => {
    const syncCustomers = () => {
      setCustomers(loadCustomerAccounts());
    };

    window.addEventListener(CUSTOMER_ACCOUNTS_UPDATED_EVENT, syncCustomers);
    window.addEventListener("storage", syncCustomers);
    return () => {
      window.removeEventListener(CUSTOMER_ACCOUNTS_UPDATED_EVENT, syncCustomers);
      window.removeEventListener("storage", syncCustomers);
    };
  }, []);

  const analytics = useMemo<OpsAnalytics>(() => {
    const totalJobs = cargoJobs.length;
    const activeJobs = cargoJobs.filter((job) => job.status !== "Delivered").length;
    const deliveredJobs = cargoJobs.filter((job) => job.status === "Delivered").length;
    const totalRequests = serviceRequests.length;
    const convertedRequests = serviceRequests.filter((request) => !!request.linkedJobId).length;
    const requestBacklog = serviceRequests.filter(
      (request) => request.stage !== "Received"
    ).length;
    const customsHolds = customsEntries.filter((entry) => entry.status === "On Hold").length;

    const deliveredWithDate = cargoJobs.filter((job) => job.status === "Delivered" && job.deliveredAt);
    const onTimeRate =
      deliveredWithDate.length > 0
        ? Number(
            (
              (deliveredWithDate.filter((job) => new Date(job.deliveredAt as string) <= new Date(job.eta)).length /
                deliveredWithDate.length) *
              100
            ).toFixed(1)
          )
        : mockOpsAnalytics.onTimeRate;

    const clearancesWithDuration = customsEntries.filter(
      (entry) => entry.submittedAt && entry.clearedAt
    );
    const avgClearanceHours =
      clearancesWithDuration.length > 0
        ? Number(
            (
              clearancesWithDuration.reduce((total, entry) => {
                const start = new Date(entry.submittedAt).getTime();
                const end = new Date(entry.clearedAt as string).getTime();
                return total + (end - start) / (1000 * 60 * 60);
              }, 0) / clearancesWithDuration.length
            ).toFixed(1)
          )
        : mockOpsAnalytics.avgClearanceHours;

    const fleetUtilization =
      fleetUnits.length > 0
        ? Number(
            (
              fleetUnits.reduce((sum, unit) => sum + unit.utilizationPct, 0) / fleetUnits.length
            ).toFixed(1)
          )
        : mockOpsAnalytics.fleetUtilization;

    return {
      totalJobs,
      activeJobs,
      deliveredJobs,
      totalRequests,
      requestConversionRate:
        totalRequests > 0
          ? Number(((convertedRequests / totalRequests) * 100).toFixed(1))
          : mockOpsAnalytics.requestConversionRate,
      requestBacklog,
      onTimeRate,
      customsHolds,
      avgClearanceHours,
      fleetUtilization,
      monthlyVolume: buildMonthlyVolume(cargoJobs),
      statusBreakdown: buildStatusBreakdown(cargoJobs),
      modeSplit: buildModeSplit(cargoJobs),
      lanePerformance: buildLanePerformance(cargoJobs),
    };
  }, [cargoJobs, customsEntries, fleetUnits, serviceRequests]);

  const unreadAdminNotifications = useMemo(
    () => adminNotifications.filter((notification) => !notification.read).length,
    [adminNotifications]
  );

  const pushAdminNotification = (notification: Omit<AdminNotification, "id" | "createdAt" | "read">) => {
    setAdminNotifications((current) => [
      {
        id: createId("ALR", current.length),
        createdAt: new Date().toISOString(),
        read: false,
        ...notification,
      },
      ...current,
    ]);
  };

  const createServiceRequest = (payload: CreateServiceRequestInput) => {
    const clientName = payload.clientName.trim();
    const clientEmail = normalizeEmail(payload.clientEmail);
    const origin = payload.origin.trim();
    const destination = payload.destination.trim();
    const cargoDescription = payload.cargoDescription.trim();

    if (!clientName || !clientEmail || !origin || !destination || !cargoDescription) {
      return {
        success: false,
        message: "Customer, route, and cargo details are required.",
      };
    }

    const requestId = `REQ-${new Date().getFullYear()}-${String(serviceRequests.length + 1).padStart(3, "0")}`;
    const newRequest: ServiceRequest = {
      id: requestId,
      requestDate: new Date().toISOString(),
      clientName,
      clientEmail,
      clientPhone: payload.clientPhone?.trim() || undefined,
      origin,
      destination,
      modePreference: payload.modePreference,
      serviceType: payload.serviceType,
      cargoDescription,
      estimatedWeightKg: payload.estimatedWeightKg,
      estimatedVolumeCbm: payload.estimatedVolumeCbm,
      stage: "Requested",
      priority: payload.priority ?? "Normal",
      notes: payload.notes?.trim() || undefined,
    };

    setServiceRequests((current) => [newRequest, ...current]);
    pushAdminNotification({
      type: "New Request",
      title: `New customer request ${requestId}`,
      message: `${clientName} submitted a request from ${origin} to ${destination}.`,
      requestId,
      clientName,
      clientEmail,
      origin,
      destination,
    });
    return {
      success: true,
      message: `Request ${requestId} created.`,
      requestId,
    };
  };

  const updateRequestStage = (requestId: string, stage: RequestStage) => {
    setServiceRequests((current) =>
      current.map((request) => {
        if (request.id !== requestId) {
          return request;
        }
        return {
          ...request,
          stage,
          customerApprovedAt:
            stage === "Booked"
              ? request.customerApprovedAt ?? new Date().toISOString()
              : request.customerApprovedAt,
        };
      })
    );
  };

  const issueRequestQuote = (requestId: string, quoteAmountUsd: number, quotePreparedBy: string) => {
    setServiceRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              quoteAmountUsd,
              quotePreparedBy: quotePreparedBy.trim(),
              quoteIssuedAt: new Date().toISOString(),
              stage: "Quoted",
            }
          : request
      )
    );
  };

  const approveRequest = (requestId: string) => {
    setServiceRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              stage: "Booked",
              customerApprovedAt: new Date().toISOString(),
            }
          : request
      )
    );
  };

  const createJobFromRequest = (requestId: string) => {
    const request = serviceRequests.find((item) => item.id === requestId);
    if (!request) {
      return {
        success: false,
        message: "Request not found.",
      };
    }

    if (request.linkedJobId) {
      return {
        success: false,
        message: "This request is already linked to a cargo order.",
      };
    }

    const generateTrackingNumber = () => {
      let candidate = "";
      do {
        const code = Math.random().toString(36).slice(2, 5).toUpperCase();
        candidate = `IBM-${new Date().getFullYear()}-${code}`;
      } while (
        shipments.some((shipment) => shipment.trackingNumber === candidate) ||
        cargoJobs.some((job) => job.trackingNumber === candidate)
      );
      return candidate;
    };

    const trackingNumber = generateTrackingNumber();
    const mode = request.modePreference === "Not Sure" ? "Sea" : request.modePreference;
    const nextJobId = createOrderId(cargoJobs.length);
    const job: CargoJob = {
      id: nextJobId,
      trackingNumber,
      clientName: request.clientName,
      clientEmail: request.clientEmail,
      origin: request.origin,
      destination: request.destination,
      mode,
      serviceType: request.serviceType,
      incoterm: "FOB",
      status: "Booked",
      priority: request.priority,
      cargoDescription: request.cargoDescription,
      weightKg: request.estimatedWeightKg ?? 0,
      volumeCbm: request.estimatedVolumeCbm ?? 0,
      clearanceRequired: true,
      createdAt: new Date().toISOString(),
      eta: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
    };

    const shipment: ShipmentRecord = {
      trackingNumber,
      customerEmail: request.clientEmail,
      status: "Pending",
      mode,
      serviceType: request.serviceType,
      carrier: "IMK Logistics Network",
      containerOrAwb: `REF-${trackingNumber}`,
      riskLevel: request.priority === "Critical" ? "High" : request.priority === "High" ? "Medium" : "Low",
      origin: request.origin,
      destination: request.destination,
      eta: job.eta,
      currentLocation: request.origin,
      lastUpdated: new Date().toISOString(),
      checkpoints: buildDefaultCheckpoints(request.origin, request.destination, "Pending"),
    };

    setCargoJobs((current) => [job, ...current]);
    setShipments((current) => [shipment, ...current]);
    setServiceRequests((current) =>
      current.map((item) =>
        item.id === requestId
          ? {
              ...item,
              stage: "Booked",
              linkedJobId: nextJobId,
              linkedTrackingNumber: trackingNumber,
            }
          : item
      )
    );

    pushAdminNotification({
      type: "New Order",
      title: `New customer order ${nextJobId}`,
      message: `${request.clientName} order created from request ${requestId}.`,
      requestId,
      orderId: nextJobId,
      trackingNumber,
      clientName: request.clientName,
      clientEmail: request.clientEmail,
      origin: request.origin,
      destination: request.destination,
    });

    return {
      success: true,
      message: `Request ${requestId} converted to order ${nextJobId}.`,
      jobId: nextJobId,
    };
  };

  const createCargoJob = (payload: CreateCargoJobInput) => {
    const trackingNumber = payload.trackingNumber.trim().toUpperCase();
    const clientEmail = normalizeEmail(payload.clientEmail);

    if (
      !trackingNumber ||
      !payload.clientName.trim() ||
      !clientEmail ||
      !payload.origin.trim() ||
      !payload.destination.trim() ||
      !payload.eta
    ) {
      return {
        success: false,
        message: "Tracking, customer, lane, and ETA fields are required.",
      };
    }

    if (cargoJobs.some((job) => job.id === trackingNumber || job.trackingNumber === trackingNumber)) {
      return {
        success: false,
        message: "An order with this tracking number already exists.",
      };
    }

    const newJob: CargoJob = {
      id: createOrderId(cargoJobs.length),
      trackingNumber,
      clientName: payload.clientName.trim(),
      clientEmail,
      origin: payload.origin.trim(),
      destination: payload.destination.trim(),
      mode: payload.mode,
      serviceType: payload.serviceType,
      incoterm: payload.incoterm,
      status: "Booked",
      priority: payload.priority,
      cargoDescription: payload.cargoDescription.trim(),
      weightKg: payload.weightKg,
      volumeCbm: payload.volumeCbm,
      clearanceRequired: payload.clearanceRequired,
      createdAt: new Date().toISOString(),
      eta: payload.eta,
    };

    setCargoJobs((current) => [newJob, ...current]);

    const shipmentExists = shipments.some((shipment) => shipment.trackingNumber === trackingNumber);
    if (!shipmentExists) {
      const newShipment: ShipmentRecord = {
        trackingNumber,
        customerEmail: clientEmail,
        status: "Pending",
        mode: payload.mode,
        serviceType: payload.serviceType,
        origin: payload.origin.trim(),
        destination: payload.destination.trim(),
        eta: payload.eta,
        riskLevel: payload.priority === "Critical" ? "High" : payload.priority === "High" ? "Medium" : "Low",
        lastUpdated: new Date().toISOString(),
        checkpoints: buildDefaultCheckpoints(payload.origin.trim(), payload.destination.trim(), "Pending"),
      };
      setShipments((current) => [newShipment, ...current]);
    }

    setServiceRequests((current) => {
      let linked = false;
      return current.map((request) => {
        if (linked) {
          return request;
        }
        const canLink =
          !request.linkedJobId &&
          normalizeEmail(request.clientEmail) === clientEmail &&
          request.origin.toLowerCase() === payload.origin.trim().toLowerCase() &&
          request.destination.toLowerCase() === payload.destination.trim().toLowerCase() &&
          request.stage !== "Received";
        if (!canLink) {
          return request;
        }
        linked = true;
        return {
          ...request,
          stage: "Booked",
          linkedJobId: newJob.id,
          linkedTrackingNumber: trackingNumber,
        };
      });
    });

    pushAdminNotification({
      type: "New Order",
      title: `New customer order ${newJob.id}`,
      message: `${newJob.clientName} order booked from ${newJob.origin} to ${newJob.destination}.`,
      orderId: newJob.id,
      trackingNumber: newJob.trackingNumber,
      clientName: newJob.clientName,
      clientEmail: newJob.clientEmail,
      origin: newJob.origin,
      destination: newJob.destination,
    });

    return {
      success: true,
      message: `Cargo order ${newJob.id} created.`,
    };
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    setCargoJobs((current) =>
      current.map((job) => {
        if (job.id !== jobId) {
          return job;
        }
        return {
          ...job,
          status,
          deliveredAt: status === "Delivered" ? job.deliveredAt ?? new Date().toISOString() : job.deliveredAt,
        };
      })
    );

    const updatedJob = cargoJobs.find((job) => job.id === jobId);
    if (updatedJob) {
      const shipmentStatus = mapJobToShipmentStatus(status);
      setShipments((current) =>
        current.map((shipment) =>
          shipment.trackingNumber === updatedJob.trackingNumber
            ? {
                ...shipment,
                status: shipmentStatus,
                lastUpdated: new Date().toISOString(),
                checkpoints: applyStatusToCheckpoints(shipment.checkpoints, shipmentStatus),
              }
            : shipment
        )
      );

      const requestStage = mapJobToRequestStage(status);
      setServiceRequests((current) =>
        current.map((request) =>
          request.linkedJobId === updatedJob.id || request.linkedTrackingNumber === updatedJob.trackingNumber
            ? { ...request, stage: requestStage }
            : request
        )
      );
    }
  };

  const updateJobPriority = (jobId: string, priority: JobPriority) => {
    setCargoJobs((current) =>
      current.map((job) => (job.id === jobId ? { ...job, priority } : job))
    );
  };

  const createShipment = (payload: CreateShipmentInput) => {
    const trackingNumber = payload.trackingNumber.trim().toUpperCase();
    const customerEmail = normalizeEmail(payload.customerEmail);

    if (!trackingNumber || !customerEmail || !payload.origin.trim() || !payload.destination.trim() || !payload.eta) {
      return {
        success: false,
        message: "Tracking number, customer email, origin, destination, and ETA are required.",
      };
    }

    if (shipments.some((shipment) => shipment.trackingNumber === trackingNumber)) {
      return {
        success: false,
        message: "A shipment with this tracking number already exists.",
      };
    }

    const shipment: ShipmentRecord = {
      trackingNumber,
      customerEmail,
      status: payload.status,
      mode: payload.mode,
      serviceType: payload.serviceType,
      carrier: payload.carrier.trim(),
      containerOrAwb: payload.containerOrAwb.trim(),
      riskLevel: payload.riskLevel,
      origin: payload.origin.trim(),
      destination: payload.destination.trim(),
      eta: payload.eta,
      currentLocation: payload.origin.trim(),
      lastUpdated: new Date().toISOString(),
      checkpoints: buildDefaultCheckpoints(payload.origin.trim(), payload.destination.trim(), payload.status),
    };

    setShipments((current) => [shipment, ...current]);

    const hasLinkedJob = cargoJobs.some((job) => job.trackingNumber === trackingNumber);
    if (!hasLinkedJob) {
      const linkedCustomer = customers.find(
        (customer) => normalizeEmail(customer.email) === customerEmail
      );
      const linkedJob: CargoJob = {
        id: createOrderId(cargoJobs.length),
        trackingNumber,
        clientName: linkedCustomer?.name ?? "Direct Customer",
        clientEmail: customerEmail,
        origin: payload.origin.trim(),
        destination: payload.destination.trim(),
        mode: payload.mode,
        serviceType: payload.serviceType,
        incoterm: "FOB",
        status: mapShipmentToJobStatus(payload.status),
        priority: payload.riskLevel === "High" ? "Critical" : payload.riskLevel === "Medium" ? "High" : "Normal",
        cargoDescription: "General cargo",
        weightKg: 0,
        volumeCbm: 0,
        clearanceRequired: true,
        createdAt: new Date().toISOString(),
        eta: payload.eta,
      };
      setCargoJobs((current) => [linkedJob, ...current]);
    }

    return {
      success: true,
      message: `Shipment ${trackingNumber} created.`,
    };
  };

  const updateShipmentStatus = (trackingNumber: string, status: ShipmentStatus) => {
    setShipments((current) =>
      current.map((shipment) =>
        shipment.trackingNumber === trackingNumber
          ? {
              ...shipment,
              status,
              lastUpdated: new Date().toISOString(),
              checkpoints: applyStatusToCheckpoints(shipment.checkpoints, status),
            }
          : shipment
      )
    );

    setCargoJobs((current) =>
      current.map((job) =>
        job.trackingNumber === trackingNumber
          ? {
              ...job,
              status: mapShipmentToJobStatus(status),
              deliveredAt:
                status === "Delivered" ? job.deliveredAt ?? new Date().toISOString() : job.deliveredAt,
            }
          : job
      )
    );

    setServiceRequests((current) =>
      current.map((request) =>
        request.linkedTrackingNumber === trackingNumber
          ? { ...request, stage: mapShipmentToRequestStage(status) }
          : request
      )
    );
  };

  const deleteShipment = (trackingNumber: string) => {
    setShipments((current) => current.filter((shipment) => shipment.trackingNumber !== trackingNumber));
  };

  const createCustomsEntry = (payload: CreateCustomsEntryInput) => {
    const trackingNumber = payload.trackingNumber.trim().toUpperCase();
    const declarationNo = payload.declarationNo.trim().toUpperCase();

    if (!trackingNumber || !declarationNo || !payload.port.trim() || !payload.broker.trim()) {
      return {
        success: false,
        message: "Tracking number, declaration, port, and broker are required.",
      };
    }

    if (customsEntries.some((entry) => entry.declarationNo === declarationNo)) {
      return {
        success: false,
        message: "Declaration number already exists.",
      };
    }

    const linkedJob = cargoJobs.find((job) => job.trackingNumber === trackingNumber);
    const newEntry: CustomsEntry = {
      id: createId("CUS", customsEntries.length),
      jobId: linkedJob?.id ?? "",
      trackingNumber,
      declarationNo,
      port: payload.port.trim(),
      broker: payload.broker.trim(),
      channel: payload.channel,
      status: "Submitted",
      docsComplete: false,
      inspectionRequired: payload.channel === "Red",
      dutyAmountUsd: payload.dutyAmountUsd,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomsEntries((current) => [newEntry, ...current]);
    return {
      success: true,
      message: `Customs file ${declarationNo} created.`,
    };
  };

  const updateCustomsStatus = (entryId: string, status: CustomsStatus) => {
    setCustomsEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              status,
              clearedAt: status === "Cleared" ? entry.clearedAt ?? new Date().toISOString() : entry.clearedAt,
              updatedAt: new Date().toISOString(),
            }
          : entry
      )
    );
  };

  const toggleCustomsDocsComplete = (entryId: string, docsComplete: boolean) => {
    setCustomsEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              docsComplete,
              updatedAt: new Date().toISOString(),
            }
          : entry
      )
    );
  };

  const updateCustomsHoldReason = (entryId: string, holdReason: string) => {
    setCustomsEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              holdReason: holdReason.trim(),
              updatedAt: new Date().toISOString(),
            }
          : entry
      )
    );
  };

  const createWarehouseRecord = (payload: CreateWarehouseRecordInput) => {
    const trackingNumber = payload.trackingNumber.trim().toUpperCase();
    if (!trackingNumber || !payload.warehouse.trim() || !payload.zone.trim() || !payload.cargoType.trim()) {
      return {
        success: false,
        message: "Tracking number, warehouse, zone, and cargo type are required.",
      };
    }

    const newRecord: WarehouseRecord = {
      id: createId("WH", warehouseRecords.length),
      trackingNumber,
      warehouse: payload.warehouse.trim(),
      zone: payload.zone.trim().toUpperCase(),
      cargoType: payload.cargoType.trim(),
      units: payload.units,
      volumeCbm: payload.volumeCbm,
      hazardous: payload.hazardous,
      temperatureControlled: payload.temperatureControlled,
      status: "Received",
      lastScanAt: new Date().toISOString(),
    };

    setWarehouseRecords((current) => [newRecord, ...current]);
    return {
      success: true,
      message: `Warehouse record ${newRecord.id} created.`,
    };
  };

  const updateWarehouseStatus = (recordId: string, status: WarehouseStatus) => {
    setWarehouseRecords((current) =>
      current.map((record) =>
        record.id === recordId
          ? { ...record, status, lastScanAt: new Date().toISOString() }
          : record
      )
    );
  };

  const updateWarehouseUnits = (recordId: string, units: number) => {
    setWarehouseRecords((current) =>
      current.map((record) =>
        record.id === recordId
          ? { ...record, units, lastScanAt: new Date().toISOString() }
          : record
      )
    );
  };

  const updateFleetStatus = (unitId: string, status: FleetStatus) => {
    setFleetUnits((current) =>
      current.map((unit) => (unit.id === unitId ? { ...unit, status } : unit))
    );
  };

  const updateFleetLocation = (unitId: string, location: string) => {
    setFleetUnits((current) =>
      current.map((unit) =>
        unit.id === unitId ? { ...unit, currentLocation: location.trim() } : unit
      )
    );
  };

  const updateFleetUtilization = (unitId: string, utilizationPct: number) => {
    const normalized = Math.max(0, Math.min(100, utilizationPct));
    setFleetUnits((current) =>
      current.map((unit) =>
        unit.id === unitId ? { ...unit, utilizationPct: normalized } : unit
      )
    );
  };

  const markAdminNotificationRead = (notificationId: string) => {
    setAdminNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAdminNotificationsRead = () => {
    setAdminNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    );
  };

  const addCustomer = (name: string, email: string, password: string) => {
    const normalizedName = name.trim();
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = password.trim();

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      return {
        success: false,
        message: "Name, email, and password are required.",
      };
    }

    if (normalizedPassword.length < 6) {
      return {
        success: false,
        message: "Password must be at least 6 characters long.",
      };
    }

    if (normalizedEmail === normalizeEmail(ADMIN_CREDENTIALS.email)) {
      return {
        success: false,
        message: "Admin email is reserved and cannot be used.",
      };
    }

    if (customers.some((customer) => normalizeEmail(customer.email) === normalizedEmail)) {
      return {
        success: false,
        message: "Customer email already exists.",
      };
    }

    const nextCustomers = [
      ...customers,
      {
        name: normalizedName,
        email: normalizedEmail,
        password: normalizedPassword,
        createdAt: new Date().toISOString(),
      },
    ];

    saveCustomerAccounts(nextCustomers);
    setCustomers(nextCustomers);
    return {
      success: true,
      message: "Customer account created successfully.",
    };
  };

  const removeCustomer = (email: string) => {
    const normalizedEmail = normalizeEmail(email);
    const nextCustomers = customers.filter(
      (customer) => normalizeEmail(customer.email) !== normalizedEmail
    );
    saveCustomerAccounts(nextCustomers);
    setCustomers(nextCustomers);
  };

  return (
    <AdminDataContext.Provider
      value={{
        serviceRequests,
        cargoJobs,
        customsEntries,
        warehouseRecords,
        fleetUnits,
        shipments,
        customers,
        adminNotifications,
        unreadAdminNotifications,
        analytics,
        createServiceRequest,
        updateRequestStage,
        issueRequestQuote,
        approveRequest,
        createJobFromRequest,
        createCargoJob,
        updateJobStatus,
        updateJobPriority,
        createShipment,
        updateShipmentStatus,
        deleteShipment,
        createCustomsEntry,
        updateCustomsStatus,
        toggleCustomsDocsComplete,
        updateCustomsHoldReason,
        createWarehouseRecord,
        updateWarehouseStatus,
        updateWarehouseUnits,
        updateFleetStatus,
        updateFleetLocation,
        updateFleetUtilization,
        markAdminNotificationRead,
        markAllAdminNotificationsRead,
        addCustomer,
        removeCustomer,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return context;
}

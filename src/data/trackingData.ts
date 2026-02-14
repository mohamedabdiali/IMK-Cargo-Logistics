export type ShipmentStatus = "Pending" | "In Transit" | "Customs" | "Delivered";

export interface ShipmentCheckpoint {
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
}

export interface ShipmentRecord {
  trackingNumber: string;
  customerEmail: string;
  status: ShipmentStatus;
  mode?: "Air" | "Sea" | "Road";
  serviceType?: "Express" | "Standard";
  carrier?: string;
  containerOrAwb?: string;
  riskLevel?: "Low" | "Medium" | "High";
  currentLocation?: string;
  origin: string;
  destination: string;
  eta: string;
  lastUpdated: string;
  checkpoints: ShipmentCheckpoint[];
}

export const mockShipments: ShipmentRecord[] = [
  {
    trackingNumber: "IBM-2026-XQ",
    customerEmail: "customer@imkcargo.com",
    status: "In Transit",
    mode: "Sea",
    serviceType: "Express",
    carrier: "IMK Ocean Lines",
    containerOrAwb: "CONT-IMK-2217",
    riskLevel: "Low",
    currentLocation: "Arabian Sea Route",
    origin: "Dubai, UAE",
    destination: "Mogadishu, Somalia",
    eta: "2026-02-16",
    lastUpdated: "2026-02-13T07:20:00Z",
    checkpoints: [
      {
        title: "Booking Confirmed",
        location: "Dubai Freight Terminal",
        timestamp: "2026-02-10T08:00:00Z",
        completed: true,
      },
      {
        title: "Export Clearance",
        location: "Jebel Ali Port",
        timestamp: "2026-02-11T14:25:00Z",
        completed: true,
      },
      {
        title: "In Transit",
        location: "Arabian Sea Route",
        timestamp: "2026-02-13T07:20:00Z",
        completed: true,
      },
      {
        title: "Arrival & Delivery",
        location: "Mogadishu Inland Hub",
        timestamp: "Pending",
        completed: false,
      },
    ],
  },
  {
    trackingNumber: "IBM-2026-MN",
    customerEmail: "new.customer@example.com",
    status: "Customs",
    mode: "Air",
    serviceType: "Express",
    carrier: "IMK Air Cargo",
    containerOrAwb: "AWB-7781-IMK",
    riskLevel: "High",
    currentLocation: "JKIA Customs",
    origin: "Guangzhou, China",
    destination: "Nairobi, Kenya",
    eta: "2026-02-18",
    lastUpdated: "2026-02-13T05:45:00Z",
    checkpoints: [
      {
        title: "Booking Confirmed",
        location: "Guangzhou Cargo Center",
        timestamp: "2026-02-08T06:10:00Z",
        completed: true,
      },
      {
        title: "In Transit",
        location: "Nairobi Air Freight",
        timestamp: "2026-02-12T19:00:00Z",
        completed: true,
      },
      {
        title: "Customs Inspection",
        location: "JKIA Customs",
        timestamp: "2026-02-13T05:45:00Z",
        completed: true,
      },
      {
        title: "Final Delivery",
        location: "Nairobi Distribution Point",
        timestamp: "Pending",
        completed: false,
      },
    ],
  },
  {
    trackingNumber: "IBM-2026-ZR",
    customerEmail: "amina@example.com",
    status: "Delivered",
    mode: "Road",
    serviceType: "Standard",
    carrier: "IMK Ground Fleet",
    containerOrAwb: "TRL-33201",
    riskLevel: "Low",
    currentLocation: "Delivered",
    origin: "Mombasa, Kenya",
    destination: "Hargeisa, Somalia",
    eta: "2026-02-11",
    lastUpdated: "2026-02-11T10:30:00Z",
    checkpoints: [
      {
        title: "Booking Confirmed",
        location: "Mombasa Sea Port",
        timestamp: "2026-02-06T09:15:00Z",
        completed: true,
      },
      {
        title: "In Transit",
        location: "Regional Logistics Corridor",
        timestamp: "2026-02-08T15:40:00Z",
        completed: true,
      },
      {
        title: "Customs Cleared",
        location: "Berbera Port",
        timestamp: "2026-02-10T07:55:00Z",
        completed: true,
      },
      {
        title: "Delivered",
        location: "Hargeisa Commercial Zone",
        timestamp: "2026-02-11T10:30:00Z",
        completed: true,
      },
    ],
  },
];

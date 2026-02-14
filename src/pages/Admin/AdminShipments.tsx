import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminData } from "@/context/AdminDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShipmentStatus } from "@/data/trackingData";
import type { ShipmentMode } from "@/types/admin";
import { Search, Trash2, Truck, Plus } from "lucide-react";
import { useLogisticsControl } from "@/context/LogisticsControlContext";

const shipmentStatuses: ShipmentStatus[] = ["Pending", "In Transit", "Customs", "Delivered"];
const shipmentModes: ShipmentMode[] = ["Air", "Sea", "Road"];

const shipmentStatusClass: Record<ShipmentStatus, string> = {
  Pending: "bg-slate-100 text-slate-700 border-slate-200",
  "In Transit": "bg-blue-100 text-blue-700 border-blue-200",
  Customs: "bg-amber-100 text-amber-700 border-amber-200",
  Delivered: "bg-green-100 text-green-700 border-green-200",
};

const shipmentStatusLabel: Record<ShipmentStatus, string> = {
  Pending: "Booked",
  "In Transit": "In Transit",
  Customs: "Customs",
  Delivered: "Delivered",
};

export default function AdminShipments() {
  const { shipments, customers, createShipment, updateShipmentStatus, deleteShipment } = useAdminData();
  const { iotTelemetry, addTelemetryReading } = useLogisticsControl();
  const [searchTerm, setSearchTerm] = useState("");
  const [newShipment, setNewShipment] = useState({
    trackingNumber: "",
    customerEmail: "",
    mode: "Sea" as ShipmentMode,
    serviceType: "Standard" as "Express" | "Standard",
    carrier: "",
    containerOrAwb: "",
    riskLevel: "Medium" as "Low" | "Medium" | "High",
    origin: "",
    destination: "",
    eta: "",
    status: "Pending" as ShipmentStatus,
  });
  const [telemetryDraft, setTelemetryDraft] = useState({
    trackingNumber: "",
    lat: 0,
    lng: 0,
    temperatureC: 20,
    humidityPct: 50,
    shockG: 0.1,
    sealOpen: false,
  });

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const target = `${shipment.trackingNumber} ${shipment.customerEmail} ${shipment.origin} ${shipment.destination} ${shipment.carrier ?? ""} ${shipment.containerOrAwb ?? ""}`;
      return target.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [shipments, searchTerm]);

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createShipment(newShipment);

    if (!result.success) {
      toast({
        title: "Could not create shipment",
        description: result.message,
        variant: "destructive",
      });
      return;
    }

    setNewShipment({
      trackingNumber: "",
      customerEmail: "",
      mode: "Sea",
      serviceType: "Standard",
      carrier: "",
      containerOrAwb: "",
      riskLevel: "Medium",
      origin: "",
      destination: "",
      eta: "",
      status: "Pending",
    });

    toast({
      title: "Shipment created",
      description: result.message,
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Shipment Tracking</h1>
          <p className="text-muted-foreground">
            Manage shipment records, live tracking status, carrier references, and IoT telemetry.
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Create Shipment Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateShipment} className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <Input
                placeholder="Tracking #"
                value={newShipment.trackingNumber}
                onChange={(e) => setNewShipment((current) => ({ ...current, trackingNumber: e.target.value }))}
              />
              <Select
                value={newShipment.customerEmail || undefined}
                onValueChange={(value) => setNewShipment((current) => ({ ...current, customerEmail: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Customer Email" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.email} value={customer.email}>
                      {customer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newShipment.mode}
                onValueChange={(value) =>
                  setNewShipment((current) => ({ ...current, mode: value as ShipmentMode }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  {shipmentModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newShipment.serviceType}
                onValueChange={(value) =>
                  setNewShipment((current) => ({ ...current, serviceType: value as "Express" | "Standard" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Express">Express</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Carrier"
                value={newShipment.carrier}
                onChange={(e) => setNewShipment((current) => ({ ...current, carrier: e.target.value }))}
              />
              <Input
                placeholder="Container / AWB"
                value={newShipment.containerOrAwb}
                onChange={(e) => setNewShipment((current) => ({ ...current, containerOrAwb: e.target.value }))}
              />
              <Input
                placeholder="Origin"
                value={newShipment.origin}
                onChange={(e) => setNewShipment((current) => ({ ...current, origin: e.target.value }))}
              />
              <Input
                placeholder="Destination"
                value={newShipment.destination}
                onChange={(e) => setNewShipment((current) => ({ ...current, destination: e.target.value }))}
              />
              <Input
                type="date"
                value={newShipment.eta}
                onChange={(e) => setNewShipment((current) => ({ ...current, eta: e.target.value }))}
              />
              <Select
                value={newShipment.riskLevel}
                onValueChange={(value) =>
                  setNewShipment((current) => ({ ...current, riskLevel: value as "Low" | "Medium" | "High" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newShipment.status}
                onValueChange={(value) =>
                  setNewShipment((current) => ({ ...current, status: value as ShipmentStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {shipmentStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {shipmentStatusLabel[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">GPS + IoT Telemetry</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-7 gap-3">
            <Select
              value={telemetryDraft.trackingNumber || undefined}
              onValueChange={(value) => setTelemetryDraft((current) => ({ ...current, trackingNumber: value }))}
            >
              <SelectTrigger><SelectValue placeholder="Tracking Number" /></SelectTrigger>
              <SelectContent>
                {shipments.map((shipment) => (
                  <SelectItem key={shipment.trackingNumber} value={shipment.trackingNumber}>
                    {shipment.trackingNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" step="0.0001" placeholder="Lat" value={telemetryDraft.lat || ""} onChange={(e) => setTelemetryDraft((c) => ({ ...c, lat: Number(e.target.value) }))} />
            <Input type="number" step="0.0001" placeholder="Lng" value={telemetryDraft.lng || ""} onChange={(e) => setTelemetryDraft((c) => ({ ...c, lng: Number(e.target.value) }))} />
            <Input type="number" step="0.1" placeholder="Temp C" value={telemetryDraft.temperatureC || ""} onChange={(e) => setTelemetryDraft((c) => ({ ...c, temperatureC: Number(e.target.value) }))} />
            <Input type="number" step="1" placeholder="Humidity %" value={telemetryDraft.humidityPct || ""} onChange={(e) => setTelemetryDraft((c) => ({ ...c, humidityPct: Number(e.target.value) }))} />
            <Input type="number" step="0.1" placeholder="Shock G" value={telemetryDraft.shockG || ""} onChange={(e) => setTelemetryDraft((c) => ({ ...c, shockG: Number(e.target.value) }))} />
            <div className="flex items-center gap-2">
              <label className="text-xs flex items-center"><input type="checkbox" className="mr-2" checked={telemetryDraft.sealOpen} onChange={(e) => setTelemetryDraft((c) => ({ ...c, sealOpen: e.target.checked }))} />Seal Open</label>
              <Button
                onClick={() => {
                  const result = addTelemetryReading(telemetryDraft);
                  if (!result.success) {
                    toast({
                      title: "Telemetry rejected",
                      description: result.message,
                      variant: "destructive",
                    });
                    return;
                  }
                  toast({
                    title: "Telemetry saved",
                    description: result.message,
                  });
                }}
              >
                Add
              </Button>
            </div>
            {telemetryDraft.trackingNumber && (
              <div className="md:col-span-7 rounded-md border border-border/60 p-3">
                <p className="text-xs font-semibold mb-1">Latest Sensor Logs</p>
                {iotTelemetry
                  .filter((reading) => reading.trackingNumber === telemetryDraft.trackingNumber)
                  .slice(0, 4)
                  .map((reading) => (
                    <p key={reading.id} className="text-xs text-muted-foreground">
                      {reading.timestamp}: {reading.temperatureC}C, {reading.humidityPct}% humidity, shock {reading.shockG}g
                    </p>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shipment tracking..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredShipments.map((shipment) => (
            <Card key={shipment.trackingNumber} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="min-w-56">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Tracking</p>
                    <p className="font-semibold">{shipment.trackingNumber}</p>
                    <p className="text-sm text-muted-foreground">{shipment.customerEmail}</p>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium">{shipment.origin} {"->"} {shipment.destination}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {shipment.mode ?? "N/A"} | {shipment.serviceType ?? "N/A"} | ETA {shipment.eta}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {shipment.carrier ?? "Unknown Carrier"} | {shipment.containerOrAwb ?? "No Ref"}
                    </p>
                  </div>

                  <div className="text-right">
                    <Badge variant="outline" className={shipmentStatusClass[shipment.status]}>
                      {shipmentStatusLabel[shipment.status]}
                    </Badge>
                    {shipment.riskLevel && (
                      <p className="text-xs text-muted-foreground mt-1">Risk: {shipment.riskLevel}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Select
                      value={shipment.status}
                      onValueChange={(value) => {
                        const status = value as ShipmentStatus;
                        updateShipmentStatus(shipment.trackingNumber, status);
                        toast({
                          title: "Shipment updated",
                          description: `${shipment.trackingNumber} is now ${shipmentStatusLabel[status]}.`,
                        });
                      }}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {shipmentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {shipmentStatusLabel[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        deleteShipment(shipment.trackingNumber);
                        toast({
                          title: "Shipment deleted",
                          description: `${shipment.trackingNumber} was removed.`,
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

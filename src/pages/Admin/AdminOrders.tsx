import { useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminData } from "@/context/AdminDataContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Plus,
  AlertTriangle,
  CircleDashed,
  PackageCheck,
  ShieldAlert,
  ArrowRightLeft,
  Clock3,
} from "lucide-react";
import type { JobPriority, JobStatus, ShipmentMode } from "@/types/admin";
import { toast } from "@/hooks/use-toast";

const orderStatuses: JobStatus[] = [
  "Booked",
  "In Transit",
  "Customs",
  "Out for Delivery",
  "Delivered",
  "Delayed",
  "On Hold",
];

const priorities: JobPriority[] = ["Normal", "High", "Critical"];
const modes: ShipmentMode[] = ["Air", "Sea", "Road"];

const parseEtaDays = (eta: string) => {
  const etaDate = new Date(eta);
  if (Number.isNaN(etaDate.getTime())) {
    return Number.POSITIVE_INFINITY;
  }
  const msLeft = etaDate.getTime() - Date.now();
  return Math.ceil(msLeft / (1000 * 60 * 60 * 24));
};

export default function AdminOrders() {
  const { cargoJobs, createCargoJob, updateJobPriority, updateJobStatus } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const [modeFilter, setModeFilter] = useState<"all" | ShipmentMode>("all");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [newOrder, setNewOrder] = useState({
    trackingNumber: "",
    clientName: "",
    clientEmail: "",
    origin: "",
    destination: "",
    mode: "Sea" as ShipmentMode,
    serviceType: "Standard" as "Express" | "Standard",
    incoterm: "FOB" as "EXW" | "FOB" | "CIF" | "DDP",
    priority: "Normal" as JobPriority,
    cargoDescription: "",
    weightKg: 0,
    volumeCbm: 0,
    clearanceRequired: true,
    eta: "",
  });

  const filteredOrders = useMemo(() => {
    return cargoJobs.filter((order) => {
      const matchesSearch = `${order.id} ${order.trackingNumber} ${order.clientName} ${order.clientEmail} ${order.origin} ${order.destination}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesMode = modeFilter === "all" || order.mode === modeFilter;
      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [cargoJobs, modeFilter, searchTerm, statusFilter]);

  useEffect(() => {
    if (filteredOrders.length === 0) {
      setSelectedOrderId("");
      return;
    }
    if (!filteredOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(filteredOrders[0].id);
    }
  }, [filteredOrders, selectedOrderId]);

  const selectedOrder = filteredOrders.find((order) => order.id === selectedOrderId);

  const operationsSummary = useMemo(() => {
    const delayed = cargoJobs.filter((order) => order.status === "Delayed").length;
    const onHold = cargoJobs.filter((order) => order.status === "On Hold").length;
    const inCustoms = cargoJobs.filter((order) => order.status === "Customs").length;
    const deliveredToday = cargoJobs.filter((order) => {
      if (order.status !== "Delivered" || !order.deliveredAt) {
        return false;
      }
      return new Date(order.deliveredAt).toDateString() === new Date().toDateString();
    }).length;

    const etaAlerts = cargoJobs
      .filter((order) => order.status !== "Delivered")
      .map((order) => ({ ...order, etaDays: parseEtaDays(order.eta) }))
      .filter((order) => order.etaDays <= 2)
      .sort((a, b) => a.etaDays - b.etaDays)
      .slice(0, 5);

    return {
      delayed,
      onHold,
      inCustoms,
      deliveredToday,
      etaAlerts,
    };
  }, [cargoJobs]);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createCargoJob({
      ...newOrder,
      weightKg: Number(newOrder.weightKg),
      volumeCbm: Number(newOrder.volumeCbm),
    });

    if (!result.success) {
      toast({
        title: "Could not create order",
        description: result.message,
        variant: "destructive",
      });
      return;
    }

    setNewOrder({
      trackingNumber: "",
      clientName: "",
      clientEmail: "",
      origin: "",
      destination: "",
      mode: "Sea",
      serviceType: "Standard",
      incoterm: "FOB",
      priority: "Normal",
      cargoDescription: "",
      weightKg: 0,
      volumeCbm: 0,
      clearanceRequired: true,
      eta: "",
    });

    toast({
      title: "Cargo order created",
      description: result.message,
    });
  };

  const updateSelectedOrderStatus = (status: JobStatus) => {
    if (!selectedOrder) {
      return;
    }
    updateJobStatus(selectedOrder.id, status);
    toast({
      title: "Order status updated",
      description: `${selectedOrder.id} moved to ${status}.`,
    });
  };

  const updateSelectedOrderPriority = (priority: JobPriority) => {
    if (!selectedOrder) {
      return;
    }
    updateJobPriority(selectedOrder.id, priority);
    toast({
      title: "Priority updated",
      description: `${selectedOrder.id} set to ${priority}.`,
    });
  };

  const moveBookedToTransit = () => {
    const bookedOrders = filteredOrders.filter((order) => order.status === "Booked");
    if (bookedOrders.length === 0) {
      toast({
        title: "No booked orders",
        description: "No booked orders match current filters.",
      });
      return;
    }
    bookedOrders.forEach((order) => updateJobStatus(order.id, "In Transit"));
    toast({
      title: "Batch action complete",
      description: `${bookedOrders.length} order(s) moved to In Transit.`,
    });
  };

  const escalateDelayedOrders = () => {
    const delayedOrders = filteredOrders.filter((order) => order.status === "Delayed");
    if (delayedOrders.length === 0) {
      toast({
        title: "No delayed orders",
        description: "No delayed orders match current filters.",
      });
      return;
    }
    delayedOrders.forEach((order) => updateJobPriority(order.id, "Critical"));
    toast({
      title: "Escalation complete",
      description: `${delayedOrders.length} delayed order(s) escalated to Critical.`,
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Operations Orders</h1>
          <p className="text-muted-foreground">
            Manage booked orders, shipment execution, customs progression, and delivery status.
          </p>
        </div>

        <form
          onSubmit={handleCreateOrder}
          className="rounded-lg border border-border/60 p-4 grid grid-cols-1 md:grid-cols-6 gap-3"
        >
          <Input
            placeholder="Tracking #"
            value={newOrder.trackingNumber}
            onChange={(e) => setNewOrder((current) => ({ ...current, trackingNumber: e.target.value }))}
          />
          <Input
            placeholder="Customer Name"
            value={newOrder.clientName}
            onChange={(e) => setNewOrder((current) => ({ ...current, clientName: e.target.value }))}
          />
          <Input
            placeholder="Customer Email"
            type="email"
            value={newOrder.clientEmail}
            onChange={(e) => setNewOrder((current) => ({ ...current, clientEmail: e.target.value }))}
          />
          <Input
            placeholder="Origin"
            value={newOrder.origin}
            onChange={(e) => setNewOrder((current) => ({ ...current, origin: e.target.value }))}
          />
          <Input
            placeholder="Destination"
            value={newOrder.destination}
            onChange={(e) => setNewOrder((current) => ({ ...current, destination: e.target.value }))}
          />
          <Input
            type="date"
            value={newOrder.eta}
            onChange={(e) => setNewOrder((current) => ({ ...current, eta: e.target.value }))}
          />

          <Select
            value={newOrder.mode}
            onValueChange={(value) => setNewOrder((current) => ({ ...current, mode: value as ShipmentMode }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              {modes.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={newOrder.serviceType}
            onValueChange={(value) =>
              setNewOrder((current) => ({ ...current, serviceType: value as "Express" | "Standard" }))
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

          <Select
            value={newOrder.incoterm}
            onValueChange={(value) =>
              setNewOrder((current) => ({ ...current, incoterm: value as "EXW" | "FOB" | "CIF" | "DDP" }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Incoterm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXW">EXW</SelectItem>
              <SelectItem value="FOB">FOB</SelectItem>
              <SelectItem value="CIF">CIF</SelectItem>
              <SelectItem value="DDP">DDP</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={newOrder.priority}
            onValueChange={(value) => setNewOrder((current) => ({ ...current, priority: value as JobPriority }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            min={0}
            placeholder="Weight (kg)"
            value={newOrder.weightKg || ""}
            onChange={(e) => setNewOrder((current) => ({ ...current, weightKg: Number(e.target.value) }))}
          />
          <Input
            type="number"
            min={0}
            step="0.1"
            placeholder="Volume (cbm)"
            value={newOrder.volumeCbm || ""}
            onChange={(e) => setNewOrder((current) => ({ ...current, volumeCbm: Number(e.target.value) }))}
          />
          <Input
            placeholder="Cargo description"
            className="md:col-span-2"
            value={newOrder.cargoDescription}
            onChange={(e) => setNewOrder((current) => ({ ...current, cargoDescription: e.target.value }))}
          />
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">
              <input
                type="checkbox"
                checked={newOrder.clearanceRequired}
                onChange={(e) =>
                  setNewOrder((current) => ({ ...current, clearanceRequired: e.target.checked }))
                }
                className="mr-2"
              />
              Clearance Required
            </label>
          </div>
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </form>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tracking, customer, order ID, or lane..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | JobStatus)}>
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={modeFilter} onValueChange={(value) => setModeFilter(value as "all" | ShipmentMode)}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  {modes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Lane</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ETA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className={selectedOrderId === order.id ? "bg-primary/5" : ""}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <TableCell>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.trackingNumber}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{order.clientName}</p>
                        <p className="text-xs text-muted-foreground">{order.clientEmail}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{order.origin}</p>
                        <p className="text-xs text-muted-foreground">to {order.destination}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.mode}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.priority}
                          onValueChange={(value) => updateJobPriority(order.id, value as JobPriority)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorities.map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                {priority}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateJobStatus(order.id, value as JobStatus)}
                        >
                          <SelectTrigger className="w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {orderStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{order.eta}</TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No orders match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <aside className="space-y-4">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Operations Control Panel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedOrderId || undefined} onValueChange={setSelectedOrderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Order" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.id} - {order.trackingNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedOrder ? (
                  <div className="rounded-md border border-border/60 p-3 space-y-1 text-sm">
                    <p className="font-semibold">{selectedOrder.clientName}</p>
                    <p className="text-muted-foreground">
                      {selectedOrder.origin} to {selectedOrder.destination}
                    </p>
                    <p className="text-muted-foreground">ETA {selectedOrder.eta}</p>
                    <div className="flex gap-2 pt-1">
                      <Badge variant="outline">{selectedOrder.status}</Badge>
                      <Badge variant="outline">{selectedOrder.priority}</Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Select an order to access controls.</p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateSelectedOrderStatus("In Transit")}>
                    In Transit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateSelectedOrderStatus("Customs")}>
                    Customs
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateSelectedOrderStatus("Out for Delivery")}>
                    Out for Delivery
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateSelectedOrderStatus("Delivered")}>
                    Deliver
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateSelectedOrderStatus("On Hold")}>
                    Put On Hold
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateSelectedOrderStatus("Delayed")}>
                    Mark Delayed
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="secondary" onClick={() => updateSelectedOrderPriority("High")}>
                    Priority High
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => updateSelectedOrderPriority("Critical")}>
                    Priority Critical
                  </Button>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Batch Controls</p>
                  <Button size="sm" variant="outline" className="w-full justify-start" onClick={moveBookedToTransit}>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Move Booked to In Transit
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start" onClick={escalateDelayedOrders}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Escalate Delayed to Critical
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">SLA & Exceptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-border/60 p-2">
                    <p className="text-muted-foreground">Delayed</p>
                    <p className="text-lg font-semibold">{operationsSummary.delayed}</p>
                  </div>
                  <div className="rounded-md border border-border/60 p-2">
                    <p className="text-muted-foreground">On Hold</p>
                    <p className="text-lg font-semibold">{operationsSummary.onHold}</p>
                  </div>
                  <div className="rounded-md border border-border/60 p-2">
                    <p className="text-muted-foreground">Customs</p>
                    <p className="text-lg font-semibold">{operationsSummary.inCustoms}</p>
                  </div>
                  <div className="rounded-md border border-border/60 p-2">
                    <p className="text-muted-foreground">Delivered Today</p>
                    <p className="text-lg font-semibold">{operationsSummary.deliveredToday}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Due Within 48h</p>
                  {operationsSummary.etaAlerts.length > 0 ? (
                    operationsSummary.etaAlerts.map((order) => (
                      <div key={order.id} className="rounded-md border border-border/60 p-2">
                        <p className="text-sm font-medium">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.origin} to {order.destination}</p>
                        <p className="text-xs text-muted-foreground">ETA in {Math.max(order.etaDays, 0)} day(s)</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No near-term ETA risks.</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="flex items-center gap-1"><CircleDashed className="h-3.5 w-3.5" />Flow</Badge>
                  <Badge variant="outline" className="flex items-center gap-1"><PackageCheck className="h-3.5 w-3.5" />Delivery</Badge>
                  <Badge variant="outline" className="flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5" />Risk</Badge>
                  <Badge variant="outline" className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />SLA</Badge>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

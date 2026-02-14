import { useMemo, useState } from "react";
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
import { Search, Plus } from "lucide-react";
import type { JobPriority, JobStatus, ShipmentMode } from "@/types/admin";
import { toast } from "@/hooks/use-toast";
import { ORDER_STATUS_SEQUENCE } from "@/constants/operations";

const priorities: JobPriority[] = ["Normal", "High", "Critical"];
const modes: ShipmentMode[] = ["Air", "Sea", "Road"];

export default function AdminOrders() {
  const { cargoJobs, createCargoJob, updateJobPriority, updateJobStatus } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const [modeFilter, setModeFilter] = useState<"all" | ShipmentMode>("all");
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
                  {ORDER_STATUS_SEQUENCE.map((status) => (
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
                    <TableRow key={order.id}>
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
                            {ORDER_STATUS_SEQUENCE.map((status) => (
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
      </main>
    </div>
  );
}

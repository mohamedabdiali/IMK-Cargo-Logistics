import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminData } from "@/context/AdminDataContext";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WarehouseStatus } from "@/types/admin";
import { Search, Plus } from "lucide-react";

const warehouseStatuses: WarehouseStatus[] = ["Received", "Stored", "Picking", "Dispatched"];

export default function AdminInventory() {
  const {
    warehouseRecords,
    createWarehouseRecord,
    updateWarehouseStatus,
    updateWarehouseUnits,
  } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [unitsDrafts, setUnitsDrafts] = useState<Record<string, string>>({});
  const [scanTrackingNumber, setScanTrackingNumber] = useState("");
  const [scanType, setScanType] = useState<"Inbound" | "Outbound">("Inbound");
  const [newRecord, setNewRecord] = useState({
    trackingNumber: "",
    warehouse: "",
    zone: "",
    cargoType: "",
    units: 0,
    volumeCbm: 0,
    hazardous: false,
    temperatureControlled: false,
  });

  const filteredRecords = useMemo(() => {
    return warehouseRecords.filter((record) => {
      const target = `${record.trackingNumber} ${record.warehouse} ${record.zone} ${record.cargoType}`;
      return target.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, warehouseRecords]);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createWarehouseRecord({
      ...newRecord,
      units: Number(newRecord.units),
      volumeCbm: Number(newRecord.volumeCbm),
    });
    if (!result.success) {
      toast({
        title: "Could not create warehouse record",
        description: result.message,
        variant: "destructive",
      });
      return;
    }
    setNewRecord({
      trackingNumber: "",
      warehouse: "",
      zone: "",
      cargoType: "",
      units: 0,
      volumeCbm: 0,
      hazardous: false,
      temperatureControlled: false,
    });
    toast({
      title: "Warehouse record created",
      description: result.message,
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Operations</h1>
          <p className="text-muted-foreground">
            Manage inbound receiving, storage control, picking, and dispatch readiness.
          </p>
        </div>

        <form onSubmit={handleCreateRecord} className="rounded-lg border border-border/60 p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <Input
            placeholder="Tracking #"
            value={newRecord.trackingNumber}
            onChange={(e) => setNewRecord((current) => ({ ...current, trackingNumber: e.target.value }))}
          />
          <Input
            placeholder="Warehouse"
            value={newRecord.warehouse}
            onChange={(e) => setNewRecord((current) => ({ ...current, warehouse: e.target.value }))}
          />
          <Input
            placeholder="Zone"
            value={newRecord.zone}
            onChange={(e) => setNewRecord((current) => ({ ...current, zone: e.target.value }))}
          />
          <Input
            placeholder="Cargo Type"
            value={newRecord.cargoType}
            onChange={(e) => setNewRecord((current) => ({ ...current, cargoType: e.target.value }))}
          />
          <Input
            type="number"
            min={0}
            placeholder="Units"
            value={newRecord.units || ""}
            onChange={(e) => setNewRecord((current) => ({ ...current, units: Number(e.target.value) }))}
          />
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder="Volume (cbm)"
              value={newRecord.volumeCbm || ""}
              onChange={(e) => setNewRecord((current) => ({ ...current, volumeCbm: Number(e.target.value) }))}
            />
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <label className="text-sm font-medium">
            <input
              type="checkbox"
              className="mr-2"
              checked={newRecord.hazardous}
              onChange={(e) => setNewRecord((current) => ({ ...current, hazardous: e.target.checked }))}
            />
            Hazardous
          </label>
          <label className="text-sm font-medium">
            <input
              type="checkbox"
              className="mr-2"
              checked={newRecord.temperatureControlled}
              onChange={(e) =>
                setNewRecord((current) => ({ ...current, temperatureControlled: e.target.checked }))
              }
            />
            Temperature Controlled
          </label>
        </form>

        <div className="rounded-lg border border-border/60 p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Scan Tracking #"
            value={scanTrackingNumber}
            onChange={(e) => setScanTrackingNumber(e.target.value)}
          />
          <Select value={scanType} onValueChange={(value) => setScanType(value as "Inbound" | "Outbound")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inbound">Inbound Scan</SelectItem>
              <SelectItem value="Outbound">Outbound Scan</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              const normalized = scanTrackingNumber.trim().toUpperCase();
              const target = warehouseRecords.find((record) => record.trackingNumber === normalized);
              if (!target) {
                toast({
                  title: "Scan failed",
                  description: "Tracking number not found in warehouse records.",
                  variant: "destructive",
                });
                return;
              }
              updateWarehouseStatus(target.id, scanType === "Inbound" ? "Received" : "Dispatched");
              toast({
                title: `${scanType} scan complete`,
                description: `${normalized} updated to ${scanType === "Inbound" ? "Received" : "Dispatched"}.`,
              });
            }}
          >
            Scan & Update
          </Button>
          <p className="text-xs text-muted-foreground flex items-center">
            Simulates barcode/RFID yard scanning for inbound and outbound movements.
          </p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search warehouse records..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-lg border border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Tracking</TableHead>
                <TableHead>Warehouse / Zone</TableHead>
                <TableHead>Cargo Type</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.trackingNumber}</TableCell>
                  <TableCell>
                    <p>{record.warehouse}</p>
                    <p className="text-xs text-muted-foreground">{record.zone}</p>
                  </TableCell>
                  <TableCell>{record.cargoType}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        className="w-24"
                        value={unitsDrafts[record.id] ?? ""}
                        placeholder={record.units.toString()}
                        onChange={(e) =>
                          setUnitsDrafts((current) => ({ ...current, [record.id]: e.target.value }))
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const value = Number(unitsDrafts[record.id]);
                          if (!Number.isFinite(value) || value < 0) {
                            toast({
                              title: "Invalid units",
                              description: "Units must be a number greater than or equal to 0.",
                              variant: "destructive",
                            });
                            return;
                          }
                          updateWarehouseUnits(record.id, value);
                          toast({
                            title: "Units updated",
                            description: `${record.trackingNumber} now has ${value} units.`,
                          });
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{record.volumeCbm.toFixed(1)} cbm</TableCell>
                  <TableCell>
                    <Select
                      value={record.status}
                      onValueChange={(value) => updateWarehouseStatus(record.id, value as WarehouseStatus)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouseStatuses.map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {record.hazardous && <Badge variant="outline">Hazmat</Badge>}
                      {record.temperatureControlled && <Badge variant="outline">Temp Ctrl</Badge>}
                      {!record.hazardous && !record.temperatureControlled && (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}

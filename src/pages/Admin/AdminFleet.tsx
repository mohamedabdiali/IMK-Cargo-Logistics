import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminData } from "@/context/AdminDataContext";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { FleetStatus } from "@/types/admin";
import { toast } from "@/hooks/use-toast";

const fleetStatuses: FleetStatus[] = ["Available", "En Route", "Maintenance", "Off Duty"];

const statusClass: Record<FleetStatus, string> = {
  Available: "bg-green-100 text-green-700 border-green-200",
  "En Route": "bg-blue-100 text-blue-700 border-blue-200",
  Maintenance: "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Off Duty": "bg-slate-100 text-slate-700 border-slate-200",
};

export default function AdminFleet() {
  const { fleetUnits, updateFleetLocation, updateFleetStatus, updateFleetUtilization } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationDrafts, setLocationDrafts] = useState<Record<string, string>>({});
  const [utilizationDrafts, setUtilizationDrafts] = useState<Record<string, string>>({});

  const filteredUnits = useMemo(() => {
    return fleetUnits.filter((unit) => {
      const target = `${unit.vehicleCode} ${unit.driver} ${unit.type} ${unit.currentLocation}`;
      return target.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [fleetUnits, searchTerm]);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fleet Control</h1>
          <p className="text-muted-foreground">
            Manage dispatch assets, live locations, and utilization for final-mile execution.
          </p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicle, driver, location..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredUnits.map((unit) => (
            <div key={unit.id} className="rounded-lg border border-border/60 p-4 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="min-w-48">
                  <p className="font-semibold">{unit.vehicleCode}</p>
                  <p className="text-xs text-muted-foreground">{unit.type} | Driver: {unit.driver}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{unit.currentLocation}</p>
                  <p className="text-xs text-muted-foreground">
                    Capacity: {unit.capacityTons} tons | Next maintenance: {new Date(unit.nextMaintenanceAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className={statusClass[unit.status]}>
                  {unit.status}
                </Badge>
                <Select
                  value={unit.status}
                  onValueChange={(value) => {
                    updateFleetStatus(unit.id, value as FleetStatus);
                    toast({
                      title: "Fleet status updated",
                      description: `${unit.vehicleCode} is now ${value}.`,
                    });
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fleetStatuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Update current location"
                    value={locationDrafts[unit.id] ?? ""}
                    onChange={(e) =>
                      setLocationDrafts((current) => ({ ...current, [unit.id]: e.target.value }))
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const value = locationDrafts[unit.id];
                      if (!value?.trim()) {
                        return;
                      }
                      updateFleetLocation(unit.id, value);
                      toast({
                        title: "Location updated",
                        description: `${unit.vehicleCode} location set to ${value}.`,
                      });
                    }}
                  >
                    Save
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder={`${unit.utilizationPct}%`}
                    value={utilizationDrafts[unit.id] ?? ""}
                    onChange={(e) =>
                      setUtilizationDrafts((current) => ({ ...current, [unit.id]: e.target.value }))
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const value = Number(utilizationDrafts[unit.id]);
                      if (!Number.isFinite(value)) {
                        return;
                      }
                      updateFleetUtilization(unit.id, value);
                      toast({
                        title: "Utilization updated",
                        description: `${unit.vehicleCode} utilization set to ${Math.max(0, Math.min(100, value))}%.`,
                      });
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">ETA to hub: {unit.etaToHubHours} hour(s)</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

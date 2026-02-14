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
import type { CustomsStatus } from "@/types/admin";
import { Search, FilePlus2 } from "lucide-react";

const customsStatuses: CustomsStatus[] = [
  "Draft",
  "Submitted",
  "Under Review",
  "Cleared",
  "On Hold",
  "Rejected",
];

const statusClasses: Record<CustomsStatus, string> = {
  Draft: "bg-slate-100 text-slate-700 border-slate-200",
  Submitted: "bg-blue-100 text-blue-700 border-blue-200",
  "Under Review": "bg-indigo-100 text-indigo-700 border-indigo-200",
  Cleared: "bg-green-100 text-green-700 border-green-200",
  "On Hold": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminProducts() {
  const {
    customsEntries,
    createCustomsEntry,
    toggleCustomsDocsComplete,
    updateCustomsHoldReason,
    updateCustomsStatus,
  } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CustomsStatus>("all");
  const [newEntry, setNewEntry] = useState({
    trackingNumber: "",
    declarationNo: "",
    port: "",
    broker: "",
    channel: "Yellow" as "Green" | "Yellow" | "Red",
    dutyAmountUsd: 0,
  });

  const filteredEntries = useMemo(() => {
    return customsEntries.filter((entry) => {
      const matchesSearch = `${entry.declarationNo} ${entry.trackingNumber} ${entry.port} ${entry.broker}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customsEntries, searchTerm, statusFilter]);

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createCustomsEntry({
      ...newEntry,
      dutyAmountUsd: Number(newEntry.dutyAmountUsd),
    });

    if (!result.success) {
      toast({
        title: "Could not create customs entry",
        description: result.message,
        variant: "destructive",
      });
      return;
    }

    setNewEntry({
      trackingNumber: "",
      declarationNo: "",
      port: "",
      broker: "",
      channel: "Yellow",
      dutyAmountUsd: 0,
    });
    toast({
      title: "Customs entry created",
      description: result.message,
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customs Clearance</h1>
          <p className="text-muted-foreground">
            Manage declarations, documentation completeness, duty assessment, and hold resolution.
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Open New Customs File</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEntry} className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <Input
                placeholder="Tracking #"
                value={newEntry.trackingNumber}
                onChange={(e) => setNewEntry((current) => ({ ...current, trackingNumber: e.target.value }))}
              />
              <Input
                placeholder="Declaration #"
                value={newEntry.declarationNo}
                onChange={(e) => setNewEntry((current) => ({ ...current, declarationNo: e.target.value }))}
              />
              <Input
                placeholder="Port / Airport"
                value={newEntry.port}
                onChange={(e) => setNewEntry((current) => ({ ...current, port: e.target.value }))}
              />
              <Input
                placeholder="Broker Team"
                value={newEntry.broker}
                onChange={(e) => setNewEntry((current) => ({ ...current, broker: e.target.value }))}
              />
              <Select
                value={newEntry.channel}
                onValueChange={(value) =>
                  setNewEntry((current) => ({ ...current, channel: value as "Green" | "Yellow" | "Red" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Green">Green</SelectItem>
                  <SelectItem value="Yellow">Yellow</SelectItem>
                  <SelectItem value="Red">Red</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Duty (USD)"
                  value={newEntry.dutyAmountUsd || ""}
                  onChange={(e) =>
                    setNewEntry((current) => ({ ...current, dutyAmountUsd: Number(e.target.value) }))
                  }
                />
                <Button type="submit">
                  <FilePlus2 className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search declaration, tracking, port, broker..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | CustomsStatus)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {customsStatuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="border-border/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="min-w-56">
                    <p className="font-semibold">{entry.declarationNo}</p>
                    <p className="text-xs text-muted-foreground">{entry.trackingNumber}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{entry.port}</p>
                    <p className="text-xs text-muted-foreground">{entry.broker} | {entry.channel} Channel</p>
                  </div>
                  <Badge variant="outline" className={statusClasses[entry.status]}>
                    {entry.status}
                  </Badge>
                  <Select
                    value={entry.status}
                    onValueChange={(value) => {
                      updateCustomsStatus(entry.id, value as CustomsStatus);
                      toast({
                        title: "Clearance status updated",
                        description: `${entry.declarationNo} moved to ${value}.`,
                      });
                    }}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {customsStatuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Duty</p>
                    <p className="font-semibold">${entry.dutyAmountUsd.toFixed(2)}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Documents</p>
                    <Button
                      size="sm"
                      variant={entry.docsComplete ? "default" : "outline"}
                      onClick={() => toggleCustomsDocsComplete(entry.id, !entry.docsComplete)}
                    >
                      {entry.docsComplete ? "Complete" : "Pending"}
                    </Button>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Inspection</p>
                    <Badge variant="outline">{entry.inspectionRequired ? "Required" : "Not Required"}</Badge>
                  </div>
                </div>

                {entry.status === "On Hold" && (
                  <Input
                    placeholder="Hold reason"
                    value={entry.holdReason ?? ""}
                    onChange={(e) => updateCustomsHoldReason(entry.id, e.target.value)}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

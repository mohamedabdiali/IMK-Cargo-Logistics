import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminData } from "@/context/AdminDataContext";
import { useLogisticsControl } from "@/context/LogisticsControlContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, PlugZap } from "lucide-react";

const statusClass = {
  Connected: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Degraded: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Offline: "bg-red-100 text-red-700 border-red-200",
} as const;

export default function AdminCarriers() {
  const { shipments } = useAdminData();
  const { carrierConnections, carrierEvents, refreshCarrierSync, addCarrierEvent } = useLogisticsControl();
  const [eventDraft, setEventDraft] = useState({
    trackingNumber: "",
    carrierId: "",
    event: "",
    location: "",
    eta: "",
  });

  const recentEvents = useMemo(() => carrierEvents.slice(0, 12), [carrierEvents]);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Carrier Connections</h1>
          <p className="text-muted-foreground">
            Live integration status and event feeds from Maersk, Emirates, DHL, FedEx, and partner carriers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {carrierConnections.map((carrier) => (
            <Card key={carrier.id} className="border-border/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{carrier.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Mode: {carrier.mode} | Success: {carrier.successRatePct.toFixed(1)}%
                    </p>
                  </div>
                  <Badge variant="outline" className={statusClass[carrier.apiStatus]}>
                    {carrier.apiStatus}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last Sync: {new Date(carrier.lastSyncAt).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {carrier.coverage.map((node) => (
                    <Badge key={node} variant="outline">{node}</Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    refreshCarrierSync(carrier.id);
                    toast({
                      title: "Carrier sync refreshed",
                      description: `${carrier.name} API status updated.`,
                    });
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Sync
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Push Carrier Status Event</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Select
              value={eventDraft.trackingNumber || undefined}
              onValueChange={(value) => setEventDraft((current) => ({ ...current, trackingNumber: value }))}
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

            <Select
              value={eventDraft.carrierId || undefined}
              onValueChange={(value) => setEventDraft((current) => ({ ...current, carrierId: value }))}
            >
              <SelectTrigger><SelectValue placeholder="Carrier" /></SelectTrigger>
              <SelectContent>
                {carrierConnections.map((carrier) => (
                  <SelectItem key={carrier.id} value={carrier.id}>
                    {carrier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Event"
              value={eventDraft.event}
              onChange={(e) => setEventDraft((current) => ({ ...current, event: e.target.value }))}
            />
            <Input
              placeholder="Location"
              value={eventDraft.location}
              onChange={(e) => setEventDraft((current) => ({ ...current, location: e.target.value }))}
            />
            <div className="flex gap-2">
              <Input
                type="date"
                value={eventDraft.eta}
                onChange={(e) => setEventDraft((current) => ({ ...current, eta: e.target.value }))}
              />
              <Button
                onClick={() => {
                  const result = addCarrierEvent({
                    trackingNumber: eventDraft.trackingNumber,
                    carrierId: eventDraft.carrierId,
                    event: eventDraft.event,
                    location: eventDraft.location,
                    eta: eventDraft.eta || undefined,
                  });
                  if (!result.success) {
                    toast({
                      title: "Could not add event",
                      description: result.message,
                      variant: "destructive",
                    });
                    return;
                  }
                  toast({
                    title: "Carrier event added",
                    description: result.message,
                  });
                  setEventDraft({
                    trackingNumber: "",
                    carrierId: "",
                    event: "",
                    location: "",
                    eta: "",
                  });
                }}
              >
                <PlugZap className="h-4 w-4 mr-2" />
                Push
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Recent Carrier Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentEvents.map((event) => {
              const carrier = carrierConnections.find((item) => item.id === event.carrierId);
              return (
                <div key={event.id} className="rounded-md border border-border/60 p-3">
                  <p className="text-sm font-semibold">
                    {event.trackingNumber} | {carrier?.name ?? event.carrierId}
                  </p>
                  <p className="text-xs text-muted-foreground">{event.event} @ {event.location}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                    {event.eta ? ` | ETA ${event.eta}` : ""}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

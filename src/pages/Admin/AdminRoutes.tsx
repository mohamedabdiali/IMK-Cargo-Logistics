import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminData } from "@/context/AdminDataContext";
import { useLogisticsControl } from "@/context/LogisticsControlContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Route, Zap } from "lucide-react";

export default function AdminRoutes() {
  const { shipments } = useAdminData();
  const { routePlans, optimizeRoute } = useLogisticsControl();

  const [trackingNumber, setTrackingNumber] = useState("");
  const [strategy, setStrategy] = useState<"Cost" | "Speed" | "Balanced" | "Low Carbon">("Balanced");

  const recentPlans = useMemo(() => routePlans.slice(0, 10), [routePlans]);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Route Optimization</h1>
          <p className="text-muted-foreground">
            Optimize route plans by cost, speed, carbon, and risk with mode/carrier recommendations.
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Create Route Plan</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={trackingNumber || undefined} onValueChange={setTrackingNumber}>
              <SelectTrigger><SelectValue placeholder="Tracking Number" /></SelectTrigger>
              <SelectContent>
                {shipments.map((shipment) => (
                  <SelectItem key={shipment.trackingNumber} value={shipment.trackingNumber}>
                    {shipment.trackingNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={strategy} onValueChange={(value) => setStrategy(value as typeof strategy)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cost">Cost</SelectItem>
                <SelectItem value="Speed">Speed</SelectItem>
                <SelectItem value="Balanced">Balanced</SelectItem>
                <SelectItem value="Low Carbon">Low Carbon</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                const result = optimizeRoute({ trackingNumber, strategy });
                if (!result.success) {
                  toast({
                    title: "Could not optimize route",
                    description: result.message,
                    variant: "destructive",
                  });
                  return;
                }
                toast({
                  title: "Route optimized",
                  description: result.message,
                });
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Optimize
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {recentPlans.map((plan) => (
            <Card key={plan.id} className="border-border/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold">{plan.id} - {plan.trackingNumber}</p>
                    <p className="text-xs text-muted-foreground">{plan.origin} to {plan.destination}</p>
                  </div>
                  <Badge variant="outline">{plan.strategy}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  <div className="rounded-md border border-border/60 p-2">
                    <p className="text-xs text-muted-foreground">Mode</p>
                    <p className="font-semibold">{plan.recommendedMode}</p>
                  </div>
                  <div className="rounded-md border border-border/60 p-2">
                    <p className="text-xs text-muted-foreground">Carrier</p>
                    <p className="font-semibold">{plan.recommendedCarrier}</p>
                  </div>
                  <div className="rounded-md border border-border/60 p-2">
                    <p className="text-xs text-muted-foreground">Transit</p>
                    <p className="font-semibold">{plan.estimatedTransitDays} days</p>
                  </div>
                  <div className="rounded-md border border-border/60 p-2">
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="font-semibold">${plan.estimatedCostUsd.toFixed(2)}</p>
                  </div>
                  <div className="rounded-md border border-border/60 p-2">
                    <p className="text-xs text-muted-foreground">Risk / Carbon</p>
                    <p className="font-semibold">{plan.riskScore} / {plan.carbonKg}kg</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Route className="h-3.5 w-3.5" />
                  Distance: {plan.distanceKm.toLocaleString()} km | Generated {new Date(plan.createdAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

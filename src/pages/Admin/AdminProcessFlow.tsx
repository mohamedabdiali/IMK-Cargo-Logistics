import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminData } from "@/context/AdminDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROCESS_FLOW_STEPS } from "@/constants/operations";

export default function AdminProcessFlow() {
  const { serviceRequests } = useAdminData();

  const countByStage = (stage: (typeof PROCESS_FLOW_STEPS)[number]["stage"]) =>
    serviceRequests.filter((request) => request.stage === stage).length;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">End-to-End Process</h1>
          <p className="text-muted-foreground">
            Standard operating flow from customer request to confirmed delivery receipt.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {PROCESS_FLOW_STEPS.map((step, index) => (
            <Card key={step.stage} className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <span>
                    Step {String(index + 1).padStart(2, "0")} - {step.stage}
                  </span>
                  <Badge variant="outline">{countByStage(step.stage)} request(s)</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

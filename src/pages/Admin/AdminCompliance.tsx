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
import { ShieldCheck, AlertTriangle, FileCheck2 } from "lucide-react";

const statusClass = {
  Pass: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Fail: "bg-red-100 text-red-700 border-red-200",
} as const;

export default function AdminCompliance() {
  const { shipments } = useAdminData();
  const { complianceChecks, runComplianceCheck, generateStandardDocuments } = useLogisticsControl();

  const [form, setForm] = useState({
    trackingNumber: "",
    hsCode: "",
    originCountry: "",
    destinationCountry: "",
    cargoValueUsd: 0,
    incoterm: "FOB" as "EXW" | "FOB" | "CIF" | "DDP",
    hazardous: false,
    documents: "Commercial Invoice, Packing List",
  });

  const latestChecks = useMemo(() => complianceChecks.slice(0, 10), [complianceChecks]);

  const handleRunCheck = () => {
    const result = runComplianceCheck({
      trackingNumber: form.trackingNumber || undefined,
      hsCode: form.hsCode,
      originCountry: form.originCountry,
      destinationCountry: form.destinationCountry,
      cargoValueUsd: Number(form.cargoValueUsd),
      incoterm: form.incoterm,
      hazardous: form.hazardous,
      documents: form.documents.split(",").map((item) => item.trim()).filter(Boolean),
    });

    toast({
      title: `Compliance ${result.status}`,
      description: `${result.hsCode} duty estimate: $${result.dutiesUsd.toFixed(2)}`,
      variant: result.status === "Fail" ? "destructive" : "default",
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Compliance Engine</h1>
          <p className="text-muted-foreground">
            HS code validation, duty estimates, sanctions screening, and documentation readiness.
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Run Trade Compliance Check</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select
              value={form.trackingNumber || undefined}
              onValueChange={(value) => {
                const shipment = shipments.find((item) => item.trackingNumber === value);
                setForm((current) => ({
                  ...current,
                  trackingNumber: value,
                  originCountry: shipment?.origin ?? current.originCountry,
                  destinationCountry: shipment?.destination ?? current.destinationCountry,
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tracking Number" />
              </SelectTrigger>
              <SelectContent>
                {shipments.map((shipment) => (
                  <SelectItem key={shipment.trackingNumber} value={shipment.trackingNumber}>
                    {shipment.trackingNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="HS Code (e.g. 854239)"
              value={form.hsCode}
              onChange={(e) => setForm((current) => ({ ...current, hsCode: e.target.value }))}
            />
            <Input
              placeholder="Origin Country"
              value={form.originCountry}
              onChange={(e) => setForm((current) => ({ ...current, originCountry: e.target.value }))}
            />
            <Input
              placeholder="Destination Country"
              value={form.destinationCountry}
              onChange={(e) => setForm((current) => ({ ...current, destinationCountry: e.target.value }))}
            />
            <Input
              type="number"
              min={0}
              placeholder="Cargo Value USD"
              value={form.cargoValueUsd || ""}
              onChange={(e) => setForm((current) => ({ ...current, cargoValueUsd: Number(e.target.value) }))}
            />
            <Select
              value={form.incoterm}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, incoterm: value as "EXW" | "FOB" | "CIF" | "DDP" }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXW">EXW</SelectItem>
                <SelectItem value="FOB">FOB</SelectItem>
                <SelectItem value="CIF">CIF</SelectItem>
                <SelectItem value="DDP">DDP</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Documents (comma separated)"
              value={form.documents}
              onChange={(e) => setForm((current) => ({ ...current, documents: e.target.value }))}
              className="md:col-span-2"
            />
            <label className="text-sm font-medium flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={form.hazardous}
                onChange={(e) => setForm((current) => ({ ...current, hazardous: e.target.checked }))}
              />
              Hazardous Cargo
            </label>

            <div className="flex gap-2 md:col-span-4">
              <Button onClick={handleRunCheck}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Run Check
              </Button>
              {form.trackingNumber && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const shipment = shipments.find((item) => item.trackingNumber === form.trackingNumber);
                    if (!shipment?.mode) {
                      toast({
                        title: "Mode missing",
                        description: "Cannot auto-generate standard docs without shipment mode.",
                        variant: "destructive",
                      });
                      return;
                    }
                    const docs = generateStandardDocuments(form.trackingNumber, shipment.mode);
                    toast({
                      title: "Documents generated",
                      description: `${docs.length} standard documents added for ${form.trackingNumber}.`,
                    });
                  }}
                >
                  <FileCheck2 className="h-4 w-4 mr-2" />
                  Generate Standard Documents
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {latestChecks.map((check) => (
            <Card key={check.id} className="border-border/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                  <div>
                    <p className="font-semibold">{check.id} - HS {check.hsCode}</p>
                    <p className="text-xs text-muted-foreground">
                      {check.trackingNumber ? `Tracking ${check.trackingNumber}` : "Unlinked pre-check"} | Duty ${check.dutiesUsd.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant="outline" className={statusClass[check.status]}>
                    {check.status}
                  </Badge>
                </div>

                {check.issues.length > 0 && (
                  <div className="rounded-md border border-red-100 bg-red-50 p-3">
                    <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Issues
                    </p>
                    {check.issues.map((issue) => (
                      <p key={issue} className="text-xs text-red-700">{issue}</p>
                    ))}
                  </div>
                )}

                {check.suggestions.length > 0 && (
                  <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Suggestions</p>
                    {check.suggestions.map((suggestion) => (
                      <p key={suggestion} className="text-xs text-blue-700">{suggestion}</p>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {check.generatedDocs.map((doc) => (
                    <Badge key={doc} variant="outline">{doc}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminData } from "@/context/AdminDataContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { RequestStage } from "@/types/admin";
import { Search, FilePlus2, CheckCheck, ArrowRightLeft } from "lucide-react";
import { REQUEST_STAGE_SEQUENCE } from "@/constants/operations";

export default function AdminRequests() {
  const {
    serviceRequests,
    updateRequestStage,
    issueRequestQuote,
    approveRequest,
    createJobFromRequest,
  } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<"all" | RequestStage>("all");
  const [quoteDrafts, setQuoteDrafts] = useState<Record<string, { amount: string; by: string }>>({});

  const filteredRequests = useMemo(() => {
    return serviceRequests.filter((request) => {
      const target = `${request.id} ${request.clientName} ${request.clientEmail} ${request.origin} ${request.destination} ${request.cargoDescription}`;
      const matchesSearch = target.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = stageFilter === "all" || request.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [searchTerm, serviceRequests, stageFilter]);

  const counts = useMemo(() => {
    return {
      requested: serviceRequests.filter((item) => item.stage === "Requested").length,
      quoted: serviceRequests.filter((item) => item.stage === "Quoted").length,
      booked: serviceRequests.filter((item) => item.stage === "Booked").length,
      received: serviceRequests.filter((item) => item.stage === "Received").length,
    };
  }, [serviceRequests]);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Requests</h1>
          <p className="text-muted-foreground">
            Manage the end-to-end request flow from inquiry, quotation, and booking through delivery receipt.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Requested</p><p className="text-2xl font-bold">{counts.requested}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Quoted</p><p className="text-2xl font-bold">{counts.quoted}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Booked</p><p className="text-2xl font-bold">{counts.booked}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Received</p><p className="text-2xl font-bold">{counts.received}</p></CardContent></Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search request, customer, route, or cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={stageFilter} onValueChange={(value) => setStageFilter(value as "all" | RequestStage)}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {REQUEST_STAGE_SEQUENCE.map((stage) => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const quoteDraft = quoteDrafts[request.id] ?? { amount: "", by: "" };
            return (
              <Card key={request.id} className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    <span>{request.id}</span>
                    <Badge variant="outline">{request.stage}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium">{request.clientName}</p>
                      <p className="text-xs text-muted-foreground">{request.clientEmail}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Route</p>
                      <p className="font-medium">{request.origin}</p>
                      <p className="text-xs text-muted-foreground">to {request.destination}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Service</p>
                      <p className="font-medium">{request.serviceType} | {request.modePreference}</p>
                      <p className="text-xs text-muted-foreground">Priority: {request.priority}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{request.cargoDescription}</p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Select
                      value={request.stage}
                      onValueChange={(value) => {
                        updateRequestStage(request.id, value as RequestStage);
                        toast({
                          title: "Request stage updated",
                          description: `${request.id} moved to ${value}.`,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REQUEST_STAGE_SEQUENCE.map((stage) => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Quote USD"
                      value={quoteDraft.amount}
                      onChange={(e) =>
                        setQuoteDrafts((current) => ({
                          ...current,
                          [request.id]: { ...quoteDraft, amount: e.target.value },
                        }))
                      }
                    />
                    <Input
                      placeholder="Prepared by"
                      value={quoteDraft.by}
                      onChange={(e) =>
                        setQuoteDrafts((current) => ({
                          ...current,
                          [request.id]: { ...quoteDraft, by: e.target.value },
                        }))
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const amount = Number(quoteDraft.amount);
                        if (!Number.isFinite(amount) || amount <= 0 || !quoteDraft.by.trim()) {
                          toast({
                            title: "Quote details missing",
                            description: "Provide valid quote amount and prepared-by name.",
                            variant: "destructive",
                          });
                          return;
                        }
                        issueRequestQuote(request.id, amount, quoteDraft.by);
                        toast({
                          title: "Quote issued",
                          description: `${request.id} quoted at $${amount.toFixed(2)}.`,
                        });
                      }}
                    >
                      <FilePlus2 className="h-4 w-4 mr-2" />
                      Issue Quote
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        approveRequest(request.id);
                        toast({
                          title: "Request approved",
                          description: `${request.id} marked as booked.`,
                        });
                      }}
                    >
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Approve and Book
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const result = createJobFromRequest(request.id);
                        if (!result.success) {
                          toast({
                            title: "Could not create order",
                            description: result.message,
                            variant: "destructive",
                          });
                          return;
                        }
                        toast({
                          title: "Request converted",
                          description: result.message,
                        });
                      }}
                    >
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Convert to Operations Order
                    </Button>
                    {request.quoteAmountUsd !== undefined && (
                      <Badge variant="outline">Quote: ${request.quoteAmountUsd.toFixed(2)}</Badge>
                    )}
                    {request.linkedJobId && <Badge variant="outline">Order: {request.linkedJobId}</Badge>}
                    {request.linkedTrackingNumber && <Badge variant="outline">Tracking: {request.linkedTrackingNumber}</Badge>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}

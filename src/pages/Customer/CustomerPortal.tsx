import { useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useAdminData } from "@/context/AdminDataContext";
import { useLogisticsControl } from "@/context/LogisticsControlContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Search, MessageSquare, FileText, Bell, Brain, CreditCard } from "lucide-react";

export default function CustomerPortal() {
  const { user } = useAuth();
  const { shipments } = useAdminData();
  const {
    predictiveEtas,
    refreshPredictiveEta,
    documents,
    notifications,
    invoices,
    payments,
    supportMessages,
    postSupportMessage,
    sendAiSupportReply,
    markNotificationRead,
  } = useLogisticsControl();

  const [search, setSearch] = useState("");
  const [selectedTracking, setSelectedTracking] = useState("");
  const [message, setMessage] = useState("");

  const customerEmail = user?.email?.toLowerCase() ?? "";

  const myShipments = useMemo(
    () => shipments.filter((shipment) => shipment.customerEmail.toLowerCase() === customerEmail),
    [customerEmail, shipments]
  );
  const filteredShipments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return myShipments;
    return myShipments.filter((shipment) => shipment.trackingNumber.toLowerCase().includes(term));
  }, [myShipments, search]);

  const selectedShipment = useMemo(
    () => filteredShipments.find((shipment) => shipment.trackingNumber === selectedTracking) ?? filteredShipments[0],
    [filteredShipments, selectedTracking]
  );

  const myDocs = useMemo(
    () => documents.filter((doc) => doc.trackingNumber === selectedShipment?.trackingNumber),
    [documents, selectedShipment?.trackingNumber]
  );
  const myNotifications = useMemo(
    () => notifications.filter((notification) => notification.customerEmail.toLowerCase() === customerEmail).slice(0, 12),
    [customerEmail, notifications]
  );
  const myInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.customerEmail.toLowerCase() === customerEmail),
    [customerEmail, invoices]
  );
  const myPayments = useMemo(
    () =>
      payments.filter((payment) =>
        myInvoices.some((invoice) => invoice.id === payment.invoiceId)
      ),
    [myInvoices, payments]
  );
  const mySupport = useMemo(
    () => supportMessages.filter((entry) => entry.customerEmail.toLowerCase() === customerEmail).slice(-12),
    [customerEmail, supportMessages]
  );

  const prediction = selectedShipment
    ? predictiveEtas.find((item) => item.trackingNumber === selectedShipment.trackingNumber)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Portal</h1>
          <p className="text-muted-foreground">
            Dashboard, tracking timeline, documents, billing, notifications, and support in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">My Shipments</p><p className="text-2xl font-bold">{myShipments.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Unread Notifications</p><p className="text-2xl font-bold">{myNotifications.filter((n) => !n.read).length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Open Invoices</p><p className="text-2xl font-bold">{myInvoices.filter((i) => i.status !== "Paid").length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Payments Posted</p><p className="text-2xl font-bold">{myPayments.length}</p></CardContent></Card>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Shipment Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by tracking number"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredShipments.map((shipment) => (
                <Button
                  key={shipment.trackingNumber}
                  variant={selectedShipment?.trackingNumber === shipment.trackingNumber ? "default" : "outline"}
                  onClick={() => setSelectedTracking(shipment.trackingNumber)}
                >
                  {shipment.trackingNumber}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedShipment && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Shipment Timeline - {selectedShipment.trackingNumber}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {selectedShipment.origin} to {selectedShipment.destination} • Status {selectedShipment.status}
                </p>
                {selectedShipment.checkpoints.map((checkpoint, index) => (
                  <div key={`${checkpoint.title}-${index}`} className="rounded-md border border-border/60 p-3">
                    <p className="text-sm font-semibold">{checkpoint.title}</p>
                    <p className="text-xs text-muted-foreground">{checkpoint.location}</p>
                    <p className="text-xs text-muted-foreground">{checkpoint.timestamp}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Brain className="h-5 w-5" />Predictive ETA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {prediction ? (
                  <>
                    <p className="text-sm">Predicted ETA: <span className="font-semibold">{prediction.predictedEta}</span></p>
                    <p className="text-sm">Confidence: <span className="font-semibold">{prediction.confidencePct}%</span></p>
                    <p className="text-sm">Risk: <span className="font-semibold">{prediction.riskLevel}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {prediction.factors.map((factor) => (
                        <Badge key={factor} variant="outline">{factor}</Badge>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No prediction yet.</p>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    const refreshed = refreshPredictiveEta(selectedShipment.trackingNumber);
                    if (!refreshed) {
                      toast({
                        title: "Could not update ETA",
                        description: "Prediction engine could not process this shipment.",
                        variant: "destructive",
                      });
                      return;
                    }
                    toast({
                      title: "ETA updated",
                      description: `${selectedShipment.trackingNumber} prediction refreshed.`,
                    });
                  }}
                >
                  Refresh Prediction
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myDocs.length > 0 ? myDocs.map((doc) => (
                <div key={doc.id} className="rounded-md border border-border/60 p-3">
                  <p className="text-sm font-semibold">{doc.type}</p>
                  <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">{doc.uploadedAt}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No documents for selected shipment.</p>}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myNotifications.map((notification) => (
                <div key={notification.id} className="rounded-md border border-border/60 p-3">
                  <p className="text-sm font-semibold">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  {!notification.read && (
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => markNotificationRead(notification.id)}>
                      Mark Read
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5" />Billing & Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myInvoices.map((invoice) => (
                <div key={invoice.id} className="rounded-md border border-border/60 p-3">
                  <p className="text-sm font-semibold">{invoice.id}</p>
                  <p className="text-xs text-muted-foreground">
                    Total {invoice.totalAmount.toFixed(2)} {invoice.currency} • {invoice.status} • {invoice.billingPlan}
                  </p>
                </div>
              ))}
              {myPayments.length > 0 && (
                <div className="rounded-md border border-border/60 p-3">
                  <p className="text-xs font-semibold mb-1">Recent Payments</p>
                  {myPayments.slice(0, 3).map((payment) => (
                    <p key={payment.id} className="text-xs text-muted-foreground">
                      {payment.reference} - {payment.amount.toFixed(2)} {payment.currency}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5" />Chat / Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {mySupport.map((entry) => (
                <div key={entry.id} className="rounded-md border border-border/60 p-3">
                  <p className="text-xs font-semibold">{entry.sender}</p>
                  <p className="text-sm">{entry.message}</p>
                </div>
              ))}
            </div>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your question..." />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (!message.trim()) return;
                  postSupportMessage(customerEmail, message, "Customer");
                  setMessage("");
                }}
              >
                Send
              </Button>
              <Button
                variant="outline"
                onClick={() => sendAiSupportReply(customerEmail, selectedShipment?.trackingNumber)}
              >
                Ask AI Assistant
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

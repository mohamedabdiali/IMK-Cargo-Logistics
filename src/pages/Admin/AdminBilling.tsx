import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminData } from "@/context/AdminDataContext";
import { useLogisticsControl } from "@/context/LogisticsControlContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import type { PaymentMethod } from "@/types/logistics";
import { CreditCard, RefreshCw, ShieldCheck } from "lucide-react";

const invoiceClass = {
  Draft: "bg-slate-100 text-slate-700 border-slate-200",
  Issued: "bg-blue-100 text-blue-700 border-blue-200",
  "Partially Paid": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
} as const;

const methods: PaymentMethod[] = [
  "VISA",
  "MasterCard",
  "Amex",
  "SWIFT/IBAN",
  "Apple Pay",
  "Google Pay",
  "PayPal",
  "BNPL",
];

export default function AdminBilling() {
  const { shipments } = useAdminData();
  const {
    fxRates,
    refreshFxRates,
    invoices,
    payments,
    createInvoice,
    recordPayment,
  } = useLogisticsControl();

  const [invoiceDraft, setInvoiceDraft] = useState({
    trackingNumber: "",
    currency: "USD",
    trigger: "Manual" as "Manual" | "PoD" | "Port Arrival" | "Customs Cleared",
    includeInsurance: true,
    billingPlan: "Per Shipment" as "Per Shipment" | "Monthly Contract",
  });
  const [paymentDraft, setPaymentDraft] = useState({
    invoiceId: "",
    method: "VISA" as PaymentMethod,
    type: "Split" as "Freight" | "Duty" | "Insurance" | "Split",
    amount: 0,
    currency: "USD",
    status: "Settled" as "Pending" | "Authorized" | "Settled" | "Failed",
    threeDSecure: true,
    tokenized: true,
    twoFactorVerified: true,
  });

  const recentInvoices = useMemo(() => invoices.slice(0, 12), [invoices]);
  const recentPayments = useMemo(() => payments.slice(0, 12), [payments]);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing & Payments</h1>
          <p className="text-muted-foreground">
            GlobalPay controls for multi-currency invoicing, split payments, triggers, and secure settlement.
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">FX Rates & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {fxRates.map((rate) => (
                <Badge key={rate.currency} variant="outline">
                  {rate.currency}: {rate.rateToUsd.toFixed(4)} USD
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">PCI DSS Level 1</Badge>
              <Badge variant="outline">3D Secure</Badge>
              <Badge variant="outline">Tokenization</Badge>
              <Badge variant="outline">2FA</Badge>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                refreshFxRates();
                toast({ title: "FX updated", description: "Live rate board refreshed." });
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh FX
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Create Invoice</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Select
              value={invoiceDraft.trackingNumber || undefined}
              onValueChange={(value) => setInvoiceDraft((current) => ({ ...current, trackingNumber: value }))}
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
              value={invoiceDraft.currency}
              onValueChange={(value) => setInvoiceDraft((current) => ({ ...current, currency: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {fxRates.map((rate) => (
                  <SelectItem key={rate.currency} value={rate.currency}>{rate.currency}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={invoiceDraft.trigger}
              onValueChange={(value) =>
                setInvoiceDraft((current) => ({
                  ...current,
                  trigger: value as "Manual" | "PoD" | "Port Arrival" | "Customs Cleared",
                }))
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="PoD">Pay on Delivery</SelectItem>
                <SelectItem value="Port Arrival">Pay on Port Arrival</SelectItem>
                <SelectItem value="Customs Cleared">Pay on Customs Cleared</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={invoiceDraft.billingPlan}
              onValueChange={(value) =>
                setInvoiceDraft((current) => ({
                  ...current,
                  billingPlan: value as "Per Shipment" | "Monthly Contract",
                }))
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Per Shipment">Per Shipment</SelectItem>
                <SelectItem value="Monthly Contract">Monthly Contract</SelectItem>
              </SelectContent>
            </Select>

            <label className="text-sm font-medium flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={invoiceDraft.includeInsurance}
                onChange={(e) =>
                  setInvoiceDraft((current) => ({ ...current, includeInsurance: e.target.checked }))
                }
              />
              Add Insurance
            </label>

            <Button
              onClick={() => {
                const result = createInvoice(invoiceDraft);
                if (!result.success) {
                  toast({
                    title: "Could not create invoice",
                    description: result.message,
                    variant: "destructive",
                  });
                  return;
                }
                toast({
                  title: "Invoice issued",
                  description: result.message,
                });
              }}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Issue
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Record Payment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Select
              value={paymentDraft.invoiceId || undefined}
              onValueChange={(value) => setPaymentDraft((current) => ({ ...current, invoiceId: value }))}
            >
              <SelectTrigger><SelectValue placeholder="Invoice" /></SelectTrigger>
              <SelectContent>
                {invoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id}>{invoice.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={paymentDraft.method}
              onValueChange={(value) => setPaymentDraft((current) => ({ ...current, method: value as PaymentMethod }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {methods.map((method) => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={paymentDraft.type}
              onValueChange={(value) =>
                setPaymentDraft((current) => ({
                  ...current,
                  type: value as "Freight" | "Duty" | "Insurance" | "Split",
                }))
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Freight">Freight</SelectItem>
                <SelectItem value="Duty">Duty</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Split">Split</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="Amount"
              value={paymentDraft.amount || ""}
              onChange={(e) => setPaymentDraft((current) => ({ ...current, amount: Number(e.target.value) }))}
            />

            <Select
              value={paymentDraft.currency}
              onValueChange={(value) => setPaymentDraft((current) => ({ ...current, currency: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {fxRates.map((rate) => (
                  <SelectItem key={rate.currency} value={rate.currency}>{rate.currency}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                const result = recordPayment(paymentDraft);
                if (!result.success) {
                  toast({
                    title: "Could not record payment",
                    description: result.message,
                    variant: "destructive",
                  });
                  return;
                }
                toast({
                  title: "Payment recorded",
                  description: result.message,
                });
                setPaymentDraft((current) => ({ ...current, amount: 0 }));
              }}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Submit
            </Button>

            <label className="text-xs flex items-center"><input type="checkbox" className="mr-2" checked={paymentDraft.threeDSecure} onChange={(e) => setPaymentDraft((c) => ({ ...c, threeDSecure: e.target.checked }))} />3DS</label>
            <label className="text-xs flex items-center"><input type="checkbox" className="mr-2" checked={paymentDraft.tokenized} onChange={(e) => setPaymentDraft((c) => ({ ...c, tokenized: e.target.checked }))} />Tokenized</label>
            <label className="text-xs flex items-center"><input type="checkbox" className="mr-2" checked={paymentDraft.twoFactorVerified} onChange={(e) => setPaymentDraft((c) => ({ ...c, twoFactorVerified: e.target.checked }))} />2FA</label>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-lg">Invoices</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="rounded-md border border-border/60 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{invoice.id}</p>
                    <Badge variant="outline" className={invoiceClass[invoice.status]}>{invoice.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {invoice.trackingNumber} | {invoice.customerEmail}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total {invoice.totalAmount.toFixed(2)} {invoice.currency} | Trigger {invoice.trigger} | Plan {invoice.billingPlan}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-lg">Payments</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="rounded-md border border-border/60 p-3">
                  <p className="text-sm font-semibold">{payment.reference}</p>
                  <p className="text-xs text-muted-foreground">
                    {payment.invoiceId} | {payment.method} | {payment.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.amount.toFixed(2)} {payment.currency} | {payment.status}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Optional Enhancements (Pilot)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="outline">Blockchain Freight Ledger</Badge>
            <Badge variant="outline">Smart Contract Payout Rules</Badge>
            <Badge variant="outline">AI Support Assistant</Badge>
            <Badge variant="outline">Route Optimization</Badge>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

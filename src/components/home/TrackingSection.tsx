import { Search, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { type ShipmentRecord, type ShipmentStatus } from "@/data/trackingData";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { useAdminData } from "@/context/AdminDataContext";
import { useLogisticsControl } from "@/context/LogisticsControlContext";

const statusBadgeClasses: Record<ShipmentStatus, string> = {
  Pending: "bg-slate-500/20 text-slate-200 border border-slate-400/30",
  "In Transit": "bg-primary/20 text-primary border border-primary/30",
  Customs: "bg-accent/20 text-accent border border-accent/40",
  Delivered: "bg-green-500/20 text-green-300 border border-green-500/40",
};

const formatDateTime = (value: string) => {
  if (value === "Pending") {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

export function TrackingSection() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState<ShipmentRecord | null>(null);
  const { user } = useAuth();
  const { shipments } = useAdminData();
  const { predictiveEtas, refreshPredictiveEta, documents, notifications, addStatusNotifications } = useLogisticsControl();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedTrackingNumber = trackingNumber.trim().toUpperCase();

    if (!normalizedTrackingNumber) {
      toast({
        title: "Enter Tracking Number",
        description: "Please enter a valid tracking number to track your shipment.",
        variant: "destructive"
      });
      return;
    }

    const shipment = shipments.find(
      (item) => item.trackingNumber.toUpperCase() === normalizedTrackingNumber
    );

    if (!shipment) {
      setTrackingResult(null);
      toast({
        title: "Shipment not found",
        description: "No shipment matches that tracking ID.",
        variant: "destructive",
      });
      return;
    }

    if (
      user?.role === "customer" &&
      user.email.toLowerCase() !== shipment.customerEmail.toLowerCase()
    ) {
      setTrackingResult(null);
      toast({
        title: "Access restricted",
        description: "This tracking number is not linked to your customer account.",
        variant: "destructive",
      });
      return;
    }

    setTrackingResult(shipment);
    refreshPredictiveEta(shipment.trackingNumber);
    toast({
      title: "Shipment located",
      description: `${shipment.trackingNumber} is currently ${shipment.status}.`,
    });
  };

  const shipmentPrediction = trackingResult
    ? predictiveEtas.find((item) => item.trackingNumber === trackingResult.trackingNumber)
    : undefined;
  const shipmentDocuments = trackingResult
    ? documents.filter((doc) => doc.trackingNumber === trackingResult.trackingNumber).slice(0, 6)
    : [];
  const shipmentNotifications = trackingResult
    ? notifications.filter((item) => item.trackingNumber === trackingResult.trackingNumber).slice(0, 6)
    : [];

  return (
    <section className="py-20 bg-slate-900 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10">
        <ScrollReveal animation="scale-in" duration={800}>
          <div className="relative w-full max-w-7xl mx-auto glass p-8 md:p-12 rounded-[2.5rem] border border-sky-100/75 bg-gradient-to-br from-[#1a3a6b]/84 via-[#255395]/80 to-[#173a72]/84 shadow-[0_0_0_1px_rgba(224,242,254,0.55),0_0_95px_rgba(125,211,252,0.58),0_0_160px_rgba(56,189,248,0.30)] overflow-hidden">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-52 w-4/5 -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-8 h-44 w-72 rounded-full bg-blue-100/42 blur-3xl" />
            <div className="text-center space-y-4 mb-10">
              <ScrollReveal animation="fade-up-large">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-2">
                  <Package className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-4">
                  Track Your <span className="text-accent underline decoration-accent/30 decoration-8 underline-offset-8">Global Cargo</span>
                </h2>
              </ScrollReveal>
              <ScrollReveal animation="blur-in" delay={300}>
                <p className="text-white/90 text-lg font-semibold max-w-xl mx-auto font-subtitle">
                  Real-time precision tracking for your international shipments. Simply enter your ID below.
                </p>
              </ScrollReveal>
            </div>

            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto group">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter tracking number (e.g., IBM-2026-XQ)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="h-16 bg-white/10 border-white/20 rounded-2xl text-white placeholder:text-white/40 px-6 focus:ring-accent focus:border-accent text-lg font-bold transition-all shadow-inner"
                />
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/50 group-hover:text-accent transition-colors" />
              </div>
              <Button type="submit" variant="gold" className="btn-premium h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shrink-0">
                Locate Shipment
              </Button>
            </form>

            <div className="mt-4 text-center text-xs text-white/60 font-semibold">
              Demo IDs: <span className="text-accent">IBM-2026-XQ</span>,{" "}
              <span className="text-accent">IBM-2026-MN</span>,{" "}
              <span className="text-accent">IBM-2026-ZR</span>
            </div>
            {!user && (
              <div className="mt-2 text-center text-xs text-white/60 font-semibold">
                Want customer-restricted tracking?{" "}
                <Link to="/customer/login" className="text-accent hover:text-accent/80 underline">
                  Create account or sign in
                </Link>
              </div>
            )}
            {user?.role === "customer" && (
              <div className="mt-2 text-center text-xs text-white/70 font-semibold">
                Signed in as <span className="text-accent">{user.email}</span>
              </div>
            )}

            {trackingResult && (
              <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-black">Tracking Number</p>
                    <p className="text-xl font-black text-white">{trackingResult.trackingNumber}</p>
                  </div>
                  <span className={`inline-flex w-fit rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest ${statusBadgeClasses[trackingResult.status]}`}>
                    {trackingResult.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-black">Origin</p>
                    <p className="text-white font-bold mt-2">{trackingResult.origin}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-black">Destination</p>
                    <p className="text-white font-bold mt-2">{trackingResult.destination}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-black">Estimated Delivery</p>
                    <p className="text-white font-bold mt-2">{trackingResult.eta}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/12 p-4 md:p-5 border border-white/30">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/90 font-black">Timeline</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-black">Horizontal Flow</p>
                  </div>
                  <div className="mt-5 overflow-x-auto pb-2">
                    <div
                      className="relative grid gap-3"
                      style={{
                        gridTemplateColumns: `repeat(${trackingResult.checkpoints.length}, minmax(0, 1fr))`,
                        minWidth: `${trackingResult.checkpoints.length * 170}px`,
                      }}
                    >
                      <div className="pointer-events-none absolute left-[8%] right-[8%] top-4 h-[2px] bg-white/80" />

                      {trackingResult.checkpoints.map((checkpoint, index) => (
                        <div key={`${checkpoint.title}-${index}`} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`h-8 w-8 rounded-full border flex items-center justify-center shadow-lg ${
                              checkpoint.completed
                                ? "bg-white border-white text-green-600"
                                : "bg-white border-white text-slate-500"
                            }`}
                          >
                            {checkpoint.completed ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-slate-500" />
                            )}
                          </div>

                          <div className="mt-3 w-full rounded-xl bg-white text-slate-900 border border-white shadow-xl p-3 min-h-[126px]">
                            <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500 font-black">
                              Step {String(index + 1).padStart(2, "0")}
                            </p>
                            <p className="text-[13px] font-black mt-1.5">{checkpoint.title}</p>
                            <p className="text-[11px] font-semibold text-slate-600 mt-1.5">{checkpoint.location}</p>
                            <p className="text-[11px] text-slate-500 mt-1.5">{formatDateTime(checkpoint.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4 border border-white/20">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-black mb-2">Predictive ETA (AI/ML)</p>
                    {shipmentPrediction ? (
                      <>
                        <p className="text-white font-semibold">{shipmentPrediction.predictedEta}</p>
                        <p className="text-xs text-white/70 mt-1">Confidence: {shipmentPrediction.confidencePct}%</p>
                        <p className="text-xs text-white/70">Risk: {shipmentPrediction.riskLevel}</p>
                      </>
                    ) : (
                      <p className="text-xs text-white/70">Prediction unavailable.</p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4 border border-white/20">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-black mb-2">Documents</p>
                    {shipmentDocuments.length > 0 ? (
                      shipmentDocuments.map((doc) => (
                        <p key={doc.id} className="text-xs text-white/80">{doc.type}: {doc.fileName}</p>
                      ))
                    ) : (
                      <p className="text-xs text-white/70">No linked documents.</p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4 border border-white/20">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-black mb-2">Notifications</p>
                    {shipmentNotifications.length > 0 ? (
                      shipmentNotifications.map((item) => (
                        <p key={item.id} className="text-xs text-white/80">{item.channel}: {item.title}</p>
                      ))
                    ) : (
                      <p className="text-xs text-white/70">No notifications yet.</p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-white/30 text-white hover:bg-white/10"
                      onClick={() => addStatusNotifications(trackingResult.trackingNumber, trackingResult.status)}
                    >
                      Send Alert
                    </Button>
                  </div>
                </div>

                <p className="text-[11px] text-white/60 font-semibold">
                  Last updated: {formatDateTime(trackingResult.lastUpdated)}
                </p>
              </div>
            )}

            <div className="mt-16 grid md:grid-cols-2 gap-12 border-t border-white/10 pt-12 text-left">
              {/* How it Works */}
              <ScrollReveal animation="slide-in-left">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40">
                      <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                    </div>
                    How it Works
                  </h3>
                  <div className="space-y-4">
                    {[
                      { step: "01", title: "Allocation", desc: "Your shipment receives a unique IBM-ID immediately upon booking." },
                      { step: "02", title: "Monitoring", desc: "Satellite and port-side scans provide real-time location updates." },
                      { step: "03", title: "Validation", desc: "Automated alerts notify you of customs clearance and final arrival." }
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 group">
                        <span className="text-accent font-black text-xs pt-1">{item.step}</span>
                        <div className="space-y-1">
                          <p className="text-white font-bold leading-none group-hover:text-accent transition-colors">{item.title}</p>
                          <p className="text-white/70 text-sm font-semibold leading-relaxed font-subtitle">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Status Key */}
              <ScrollReveal animation="slide-in-right">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                      <Package className="h-4 w-4 text-accent" />
                    </div>
                    Tracking Status Key
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Pending", color: "bg-slate-500", desc: "Order details received" },
                      { label: "In Transit", color: "bg-primary", desc: "Currently moving" },
                      { label: "Customs", color: "bg-accent", desc: "Regulatory clearance" },
                      { label: "Delivered", color: "bg-green-500", desc: "Arrival confirmed" }
                    ].map((status) => (
                      <div key={status.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${status.color} shadow-[0_0_8px_${status.color === 'bg-slate-500' ? '#94a3b8' : status.color.replace('bg-', '')}]`} />
                        <div className="">
                          <p className="text-shadow-none text-[10px] font-black uppercase tracking-widest text-white">{status.label}</p>
                          <p className="text-[10px] text-white/60 font-bold">{status.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> Live Status</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Global Network</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Verified Delivery</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

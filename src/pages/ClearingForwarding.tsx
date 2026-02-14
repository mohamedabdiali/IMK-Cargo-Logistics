import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Ship, Plane, Truck, Package,
  FileText, Shield, Clock, Globe,
  CheckCircle, ArrowRight, Phone, Mail
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useAdminData } from "@/context/AdminDataContext";
import type { ShipmentMode } from "@/types/admin";
import { useLogisticsControl } from "@/context/LogisticsControlContext";

const services = [
  {
    icon: Ship,
    title: "Sea Freight",
    description: "Cost-effective ocean shipping for large cargo volumes with global coverage.",
    features: ["FCL & LCL Options", "Port-to-Port Service", "Container Tracking"]
  },
  {
    icon: Plane,
    title: "Air Freight",
    description: "Fast and reliable air cargo services for time-sensitive shipments.",
    features: ["Express Delivery", "Door-to-Door Service", "Real-time Tracking"]
  },
  {
    icon: Truck,
    title: "Land Transport",
    description: "Comprehensive road freight solutions across East Africa and beyond.",
    features: ["Cross-border Transport", "Warehousing", "Last Mile Delivery"]
  },
  {
    icon: FileText,
    title: "Customs Clearance",
    description: "Expert handling of all customs documentation and compliance requirements.",
    features: ["Import/Export Clearance", "Duty Calculation", "Regulatory Compliance"]
  }
];

const whyChooseUs = [
  { icon: Shield, title: "Licensed & Insured", description: "Fully licensed customs broker with comprehensive cargo insurance" },
  { icon: Clock, title: "24/7 Support", description: "Round-the-clock customer service and shipment monitoring" },
  { icon: Globe, title: "Global Network", description: "Partners in 50+ countries for seamless international logistics" },
  { icon: CheckCircle, title: "Track Record", description: "15+ years of experience with 98% on-time delivery rate" }
];

export default function ClearingForwarding() {
  const { createServiceRequest } = useAdminData();
  const { compareRates, runComplianceCheck } = useLogisticsControl();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "",
    origin: "",
    destination: "",
    weightKg: "",
    volumeCbm: "",
    hsCode: "",
    cargoValueUsd: "",
    cargoDescription: "",
    notes: "",
  });

  const ratePreview = useMemo(() => {
    const weight = Number(formData.weightKg);
    const volume = Number(formData.volumeCbm);
    if (!formData.origin || !formData.destination || !Number.isFinite(weight) || !Number.isFinite(volume) || weight <= 0 || volume <= 0) {
      return [];
    }
    return compareRates({
      origin: formData.origin,
      destination: formData.destination,
      weightKg: weight,
      volumeCbm: volume,
      serviceType: formData.serviceType === "air" ? "Express" : "Standard",
    });
  }, [compareRates, formData.destination, formData.origin, formData.serviceType, formData.volumeCbm, formData.weightKg]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hsCode.trim()) {
      toast({
        title: "HS code required",
        description: "Provide HS code so the compliance engine can validate duties and restrictions.",
        variant: "destructive",
      });
      return;
    }
    const selectedMode = formData.serviceType;
    const modePreference: ShipmentMode | "Not Sure" =
      selectedMode === "sea"
        ? "Sea"
        : selectedMode === "air"
          ? "Air"
          : selectedMode === "land"
            ? "Road"
            : "Not Sure";
    const requestResult = createServiceRequest({
      clientName: formData.name,
      clientEmail: formData.email,
      clientPhone: formData.phone,
      origin: formData.origin,
      destination: formData.destination,
      modePreference,
      serviceType: selectedMode === "air" ? "Express" : "Standard",
      cargoDescription: formData.cargoDescription,
      estimatedWeightKg: formData.weightKg ? Number(formData.weightKg) : undefined,
      estimatedVolumeCbm: formData.volumeCbm ? Number(formData.volumeCbm) : undefined,
      notes: formData.notes,
    });

    if (!requestResult.success) {
      toast({
        title: "Request could not be submitted",
        description: requestResult.message,
        variant: "destructive",
      });
      return;
    }

    const compliance = runComplianceCheck({
      requestId: requestResult.requestId,
      hsCode: formData.hsCode,
      originCountry: formData.origin,
      destinationCountry: formData.destination,
      cargoValueUsd: Number(formData.cargoValueUsd) || 0,
      incoterm: "FOB",
      hazardous: /hazard|battery|chemical/i.test(formData.cargoDescription),
      documents: [
        "Commercial Invoice",
        "Packing List",
        Number(formData.cargoValueUsd) > 50000 ? "Insurance Certificate" : "",
      ].filter(Boolean),
    });

    toast({
      title: "Quote Request Submitted!",
      description: `Request ID ${requestResult.requestId} created. Compliance status: ${compliance.status}.`,
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      serviceType: "",
      origin: "",
      destination: "",
      weightKg: "",
      volumeCbm: "",
      hsCode: "",
      cargoValueUsd: "",
      cargoDescription: "",
      notes: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-slate-900 to-accent animate-gradient-xy" />
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920')] bg-cover bg-center mix-blend-overlay" />

          <div className="container relative z-10 text-center space-y-8">
            <ScrollReveal animation="fade-up-large">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest animate-pulse-glow">
                <Ship className="h-3 w-3" />
                Global Forwarding Experts
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[0.9] mt-6">
                Clearing & <span className="text-accent underline decoration-accent/30 decoration-8 underline-offset-8">Forwarding</span> Solutions
              </h1>
            </ScrollReveal>
            <ScrollReveal animation="blur-in" delay={300}>
              <p className="text-xl text-white max-w-2xl mx-auto font-semibold font-subtitle mt-6">
                Precision logistics connecting Somalia, Kenya, and the East African region.
                Experience seamless customs mastery and freight excellence.
              </p>
            </ScrollReveal>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                variant="gold"
                size="lg"
                className="btn-premium h-16 px-12 rounded-full font-black uppercase tracking-widest text-xs group"
                onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Package className="ml-0 mr-3 h-5 w-5" />
                Start Your Quote
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-16 px-12 rounded-full border-2 border-white/30 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-primary transition-all duration-500"
              >
                <Phone className="mr-3 h-5 w-5" />
                Expert Consultation
              </Button>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
          <div className="container relative">
            <ScrollReveal animation="slide-up">
              <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-primary">Service Portfolios</h2>
                <p className="text-primary/70 text-lg max-w-2xl mx-auto font-bold font-subtitle">
                  Comprehensive multi-modal logistics tailored to every business size.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <ScrollReveal
                  key={index}
                  animation="zoom-in"
                  delay={index * 100}
                >
                  <div
                    className="glass p-8 rounded-[2rem] border-primary/5 hover:border-accent/30 transition-all duration-500 hover:-translate-y-3 group shadow-xl hover:shadow-2xl flex flex-col h-full"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-all duration-500">
                      <service.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-2xl font-black text-primary mb-4 tracking-tight group-hover:text-accent transition-colors drop-shadow-sm">{service.title}</h3>
                    <p className="text-sm text-primary/70 mb-8 font-bold leading-relaxed font-subtitle">{service.description}</p>

                    <div className="mt-auto space-y-3">
                      {service.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-[13px] font-black text-primary/80">
                          <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 bg-slate-900 relative">
          <div className="container relative z-10 text-center space-y-16">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">The IBRAHIM Advantage</h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto font-semibold font-subtitle">
                Reliability, speed, and safety in every single shipment.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {whyChooseUs.map((item, index) => (
                <ScrollReveal
                  key={index}
                  animation="scale-in"
                  delay={index * 150}
                >
                  <div className="group flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:border-accent transition-all duration-500 hover:rotate-6">
                      <item.icon className="h-10 w-10 text-accent group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 tracking-tight group-hover:text-accent transition-colors text-shadow-sm">{item.title}</h3>
                    <p className="text-sm text-white/70 font-semibold leading-relaxed max-w-[200px]">{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Form */}
        <section id="quote-form" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary pointer-events-none" />
          <div className="absolute top-0 right-0 w-full h-full bg-[url('/assets/images/pattern.svg')] opacity-10 bg-repeat" />

          <div className="container relative">
            <div className="max-w-4xl mx-auto">
              <div className="glass p-12 md:p-16 rounded-[3rem] border-white/20 shadow-2xl">
                <ScrollReveal animation="scale-in">
                  <div className="text-center mb-12 space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white">Instant Quotation</h2>
                    <p className="text-white/90 text-lg font-semibold font-subtitle">
                      Provide your shipment details and our logistics architects will craft your route.
                    </p>
                  </div>
                </ScrollReveal>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Personal Identity</label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Full Name"
                        className="h-14 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-white/40 font-bold px-6 focus:ring-accent focus:border-accent transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Digital Address</label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="h-14 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-white/40 font-bold px-6 focus:ring-accent focus:border-accent transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Contact Line</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+971 XX XXX XXXX"
                        className="h-14 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-white/40 font-bold px-6 focus:ring-accent focus:border-accent transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Cargo Category</label>
                      <Select
                        value={formData.serviceType}
                        onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                      >
                        <SelectTrigger className="h-14 bg-white/10 border-white/20 rounded-xl text-white font-bold px-6 focus:ring-accent focus:border-accent transition-all shadow-inner">
                          <SelectValue placeholder="Select Logistics Type" />
                        </SelectTrigger>
                        <SelectContent className="glass border-white/20 text-primary-foreground font-bold">
                          <SelectItem value="sea">Sea Freight Portfolio</SelectItem>
                          <SelectItem value="air">Air Cargo Network</SelectItem>
                          <SelectItem value="land">Intermodal Land Transport</SelectItem>
                          <SelectItem value="customs">Customs Clearance Mastery</SelectItem>
                          <SelectItem value="not-sure">Not Sure (Need Guidance)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Origin Port</label>
                      <Input
                        required
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        placeholder="City, Port, or Country"
                        className="h-14 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-white/40 font-bold px-6 focus:ring-accent focus:border-accent transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Destination Port</label>
                      <Input
                        required
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        placeholder="Final Delivery City"
                        className="h-14 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-white/40 font-bold px-6 focus:ring-accent focus:border-accent transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Estimated Weight (KG)</label>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        value={formData.weightKg}
                        onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                        placeholder="e.g., 420"
                        className="h-14 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-white/40 font-bold px-6 focus:ring-accent focus:border-accent transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Estimated Volume (CBM)</label>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        value={formData.volumeCbm}
                        onChange={(e) => setFormData({ ...formData, volumeCbm: e.target.value })}
                        placeholder="e.g., 8.5"
                        className="h-14 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-white/40 font-bold px-6 focus:ring-accent focus:border-accent transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">HS Code</label>
                      <Input
                        required
                        value={formData.hsCode}
                        onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
                        placeholder="e.g., 854239"
                        className="h-14 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-white/40 font-bold px-6 focus:ring-accent focus:border-accent transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Cargo Value (USD)</label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={formData.cargoValueUsd}
                        onChange={(e) => setFormData({ ...formData, cargoValueUsd: e.target.value })}
                        placeholder="e.g., 25000"
                        className="h-14 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-white/40 font-bold px-6 focus:ring-accent focus:border-accent transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Cargo Specifications</label>
                    <Textarea
                      value={formData.cargoDescription}
                      onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
                      placeholder="Specify dimensions, weight, nature of goods, and quantity..."
                      rows={5}
                      className="bg-white/10 border-white/20 rounded-2xl text-white placeholder:text-white/40 font-bold px-6 py-4 focus:ring-accent focus:border-accent transition-all min-h-[150px] shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Special Instructions (Optional)</label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Pickup schedule, document notes, handling requirements..."
                      rows={3}
                      className="bg-white/10 border-white/20 rounded-2xl text-white placeholder:text-white/40 font-bold px-6 py-4 focus:ring-accent focus:border-accent transition-all shadow-inner"
                    />
                  </div>

                  <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-3">Process Visibility</p>
                    <p className="text-white/80 text-sm font-semibold">
                      Request {"->"} Quote {"->"} Approval {"->"} Booking {"->"} Transit {"->"} Customs {"->"} Out for Delivery {"->"} Received
                    </p>
                  </div>

                  {ratePreview.length > 0 && (
                    <div className="rounded-2xl border border-white/20 bg-white/5 p-4 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Dynamic Pricing Engine Preview</p>
                      <div className="grid md:grid-cols-3 gap-3">
                        {ratePreview.map((option) => (
                          <div key={option.id} className="rounded-xl border border-white/20 bg-white/10 p-3">
                            <p className="text-sm font-black text-white">{option.mode}</p>
                            <p className="text-xs text-white/70">{option.carrier}</p>
                            <p className="text-sm text-white mt-1">${option.priceUsd.toFixed(2)}</p>
                            <p className="text-xs text-white/70">{option.transitDays} day(s) • {option.co2Kg}kg CO2</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button type="submit" variant="gold" className="btn-premium w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs group">
                    Dispatch Quote Request
                    <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA - Premium Footer Transition */}
        <section className="py-20 bg-slate-100 border-t border-primary/5">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-3xl font-black tracking-tight text-primary">Need Professional Counsel?</h3>
                <p className="text-primary/70 font-bold">Global shipping architects are available 24/7 for custom routing.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="h-14 px-8 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-accent transition-colors shadow-xl shadow-primary/20">
                  <Phone className="h-4 w-4" />
                  +971 58 301 6522
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-full border-2 border-primary text-primary font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-primary hover:text-white transition-all">
                  <Mail className="h-4 w-4" />
                  Secure Email
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

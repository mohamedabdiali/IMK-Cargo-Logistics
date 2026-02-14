import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Shield, Truck, Headphones, Globe, Target, Heart, Package, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const features = [
  {
    icon: Globe,
    title: "Global Network",
    description: "Shipping routes across 50+ countries worldwide.",
  },
  {
    icon: Shield,
    title: "Licensed & Insured",
    description: "Fully licensed customs broker with comprehensive cargo insurance.",
  },
  {
    icon: Truck,
    title: "Reliable Logistics",
    description: "98% on-time delivery rate with real-time tracking.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer service and shipment monitoring.",
  },
];

const steps = [
  {
    number: "1",
    title: "Request Quote",
    description: "Tell us about your shipment - origin, destination, cargo details.",
  },
  {
    number: "2",
    title: "Get Pricing",
    description: "Receive competitive quotes within 24 hours.",
  },
  {
    number: "3",
    title: "Book Shipment",
    description: "Confirm your booking and we handle the rest.",
  },
  {
    number: "4",
    title: "Track & Receive",
    description: "Monitor your cargo in real-time until delivery.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-slate-900 to-accent animate-gradient-xy" />
          <div className="container relative z-10 text-center space-y-6">
            <ScrollReveal animation="fade-up-large">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest animate-pulse-glow">
                <Globe className="h-3 w-3" />
                Our Global Legacy
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-none mt-6">
                Pioneering <span className="text-accent underline decoration-accent/30 decoration-8 underline-offset-8">Global Logistics</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal animation="blur-in" delay={300}>
              <p className="text-xl text-white max-w-2xl mx-auto font-semibold font-subtitle mt-6">
                Over 15 years of excellence in connecting the world through seamless freight forwarding and customs mastery.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Mission & Story - Premium Cards */}
        <section className="py-24 bg-background relative">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8">
              <ScrollReveal animation="slide-in-left">
                <div className="glass p-10 rounded-[2.5rem] border-primary/10 shadow-xl hover:shadow-2xl transition-all duration-500 group h-full">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Target className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="text-3xl font-black text-primary mb-6 tracking-tight">Our Mission</h2>
                  <p className="text-primary/70 leading-relaxed text-lg font-bold font-subtitle">
                    IBRAHIM MUHAMMAD Clearing & Forwarding LLC is dedicated to providing seamless international logistics solutions. Our mission is to empower businesses across Somalia, Kenya, Ethiopia, Djibouti, and Tanzania by offering reliable freight forwarding, customs clearance, and cargo handling services.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal animation="slide-in-right">
                <div className="glass p-10 rounded-[2.5rem] border-primary/10 shadow-xl hover:shadow-2xl transition-all duration-500 group h-full">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-black text-primary mb-6 tracking-tight">Our Story</h2>
                  <p className="text-primary/70 leading-relaxed text-lg font-bold font-subtitle">
                    Founded with a vision to bridge the logistics gap between the region and the global market, we've grown into a trusted name with over 15 years of experience. We handle thousands of shipments annually, connecting businesses to opportunities worldwide with reliability, efficiency, and customer-first service.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Why Choose Us - Modern Grid */}
        <section className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
          <div className="container relative z-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">Why Choose Us?</h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto font-semibold">
                Unmatched expertise and a global network at your fingertips.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <ScrollReveal
                  key={feature.title}
                  animation="zoom-in"
                  delay={index * 100}
                >
                  <div
                    className="glass p-8 rounded-3xl border-white/5 hover:border-accent/30 transition-all duration-500 group hover:-translate-y-2 h-full"
                  >
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-all">
                      <feature.icon className="h-7 w-7 text-accent group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-3 tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-white/70 font-semibold leading-relaxed font-subtitle">{feature.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Strategic Cargo Partnership - Vibrant Design */}
        <section className="py-24 relative">
          <div className="container">
            <ScrollReveal animation="blur-in" duration={1000}>
              <div className="bg-gradient-to-br from-primary to-slate-950 p-1 bg-white/10 rounded-[3rem] shadow-2xl overflow-hidden group">
                <div className="glass p-12 md:p-20 rounded-[2.8rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full -mr-48 -mt-48 blur-[100px]" />
                  <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-black uppercase tracking-[0.2em]">
                        <Package className="h-5 w-5" />
                        Strategic Innovation Partner
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                        Integrated Global <br />
                        <span className="text-accent underline decoration-accent/30 decoration-8 underline-offset-8">Cargo Operations</span>
                      </h2>
                      <p className="text-xl text-white/90 font-semibold leading-relaxed text-shadow-sm font-subtitle">
                        Logistics command meets field execution. Plan, clear, move, and deliver cargo through one unified operational flow built for clearing and forwarding teams.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-6">
                        <a href="/services">
                          <Button size="lg" className="btn-premium h-16 px-12 rounded-full bg-white text-primary font-black uppercase tracking-widest text-xs">
                            Explore Cargo Services
                            <ArrowRight className="ml-3 h-5 w-5" />
                          </Button>
                        </a>
                      </div>
                    </div>
                    <div className="hidden lg:block relative">
                      <div className="aspect-square bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center p-12 relative group-hover:rotate-3 transition-transform duration-700">
                        <div className="absolute inset-8 border border-dashed border-accent/30 rounded-[2.5rem] animate-spin-slow" />
                        <div className="text-center z-10">
                          <Globe className="h-24 w-24 text-accent/20 mx-auto mb-8 animate-pulse-glow" />
                          <p className="text-2xl font-black text-white uppercase tracking-widest">Global Trade</p>
                          <p className="text-sm font-bold text-accent">Synergy & Logistics</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* How It Works - Premium Steps */}
        <section className="py-24 bg-background">
          <div className="container text-center space-y-16">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-primary">Seamless Workflow</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium font-subtitle">Simple steps to initiate your global shipping journey.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {steps.map((step, index) => (
                <ScrollReveal
                  key={step.number}
                  animation="scale-in"
                  delay={index * 150}
                >
                  <div
                    className="relative group h-full"
                  >
                    <div className="glass p-10 rounded-[2.5rem] border-primary/5 shadow-lg group-hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 h-full flex flex-col items-center">
                      <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-8 group-hover:bg-accent transition-colors duration-500 shadow-xl shadow-primary/20 group-hover:shadow-accent/40">
                        {step.number}
                      </div>
                      <h3 className="text-2xl font-black text-primary mb-4 tracking-tight group-hover:text-accent transition-colors">{step.title}</h3>
                      <p className="text-sm text-primary/70 font-bold leading-relaxed font-subtitle">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-[2.8rem] -right-6 w-12 h-0.5 bg-gradient-to-r from-primary to-accent opacity-20" />
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

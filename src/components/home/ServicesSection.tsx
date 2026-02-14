import { Ship, Plane, Truck, FileText, ArrowRight, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const services = [
  {
    icon: Ship,
    title: "Sea Freight",
    description: "Cost-effective ocean shipping for large cargo volumes.",
    color: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500/30"
  },
  {
    icon: Plane,
    title: "Air Freight",
    description: "Fast and reliable air cargo for time-sensitive shipments.",
    color: "from-sky-400/20 to-sky-500/20",
    borderColor: "border-sky-400/30"
  },
  {
    icon: Truck,
    title: "Land Transport",
    description: "Cross-border road freight across East Africa.",
    color: "from-green-500/20 to-green-600/20",
    borderColor: "border-green-500/30"
  },
  {
    icon: FileText,
    title: "Customs Clearance",
    description: "Expert handling of all customs documentation.",
    color: "from-amber-500/20 to-amber-600/20",
    borderColor: "border-amber-500/30"
  }
];

export function ServicesSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container relative">
        <ScrollReveal animation="blur-in">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Package className="h-3 w-3" />
              Our Portfolios
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-primary">Logistics Solutions</h2>
            <p className="text-primary/70 text-lg max-w-2xl mx-auto font-semibold font-subtitle">
              Tailored shipping and documentation experts for your global trade requirements.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <ScrollReveal
              key={service.title}
              animation="zoom-in"
              delay={index * 100}
            >
              <div
                className="glass p-8 rounded-3xl transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl group border-white/40 h-full"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 duration-500">
                    <service.icon className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="text-xl font-black text-primary mb-3 tracking-tight group-hover:text-accent transition-colors">{service.title}</h3>
                <p className="text-sm text-primary/70 mb-6 leading-relaxed font-bold font-subtitle">{service.description}</p>

                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent group/link bg-accent/5 px-4 py-2 rounded-full hover:bg-accent hover:text-white transition-all"
                >
                  Learn More
                  <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link to="/services">
            <Button variant="gold" className="btn-premium h-14 px-10 rounded-full font-bold uppercase tracking-widest text-xs">
              Explore All Services
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

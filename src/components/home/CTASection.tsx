import { ArrowRight, Phone, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-slate-900 to-accent animate-gradient-xy" />
      <div className="absolute inset-0 opacity-20 bg-[url('/assets/images/pattern.svg')] bg-repeat" />

      <div className="container relative z-10">
        <ScrollReveal animation="blur-in" duration={1000}>
          <div className="glass max-w-5xl mx-auto p-12 md:p-20 rounded-[3rem] border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.5)] text-center space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[0.9]">
                Ready to Scale Your <br />
                <span className="text-accent underline decoration-accent/30 decoration-8 underline-offset-8">Global Operations?</span>
              </h2>
              <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-2xl mx-auto">
                Partner with the experts in clearing, forwarding, and global trade logistics.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/quote">
                <Button size="lg" className="btn-premium h-16 px-12 rounded-full bg-white text-primary font-black uppercase tracking-widest text-xs group">
                  Begin Transformation
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 px-12 rounded-full border-2 border-white/30 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-primary transition-all duration-500"
                >
                  Consult Our Experts
                </Button>
              </Link>
            </div>

            <div className="pt-10 border-t border-white/10">
              <div className="flex flex-wrap justify-center gap-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Package className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shipment Safety</p>
                    <p className="text-sm font-bold text-white">100% Secure</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expert Support</p>
                    <p className="text-sm font-bold text-white">24/7 Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal >
      </div >
    </section >
  );
}

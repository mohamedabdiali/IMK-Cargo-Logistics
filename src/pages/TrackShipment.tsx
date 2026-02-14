import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TrackingSection } from "@/components/home/TrackingSection";
import { Package, Shield, Clock, Globe } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WhatsAppHeroCTA } from "@/components/common/WhatsAppHeroCTA";

const TrackShipment = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
                {/* Simple Page Hero */}
                <section className="bg-primary py-16 border-b border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-slate-900 opacity-50" />
                    <div className="container relative z-10 text-center space-y-4">
                        <ScrollReveal animation="fade-up-large">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
                                <Package className="h-3 w-3" />
                                Real-Time Visibility
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mt-4">Shipment Tracking</h1>
                            <p className="text-xl text-white/70 max-w-xl mx-auto font-subtitle font-semibold">Monitor your cargo's journey across our global network.</p>
                            <div className="mt-8">
                                <WhatsAppHeroCTA contextLabel="Shipment tracking hero" />
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                <div className="bg-slate-900">
                    <TrackingSection />
                </div>

                {/* Support Info */}
                <section className="py-24 bg-white">
                    <div className="container">
                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                { icon: Shield, title: "Secure & Verifiable", desc: "Every tracking ID is verified against our secure global database.", color: "bg-primary" },
                                { icon: Clock, title: "Live Updates", desc: "Receive status alerts at every major milestone in the transit process.", color: "bg-secondary" },
                                { icon: Globe, title: "Global Range", desc: "Tracking coverage across Somalia, Kenya, and East African networks.", color: "bg-accent" }
                            ].map((item, i) => (
                                <ScrollReveal key={i} animation="zoom-in" delay={i * 100}>
                                    <div className="space-y-4 text-center group">
                                        <div className={`w-20 h-20 rounded-3xl ${item.color}/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500`}>
                                            <item.icon className={`h-10 w-10 text-${item.color.replace('bg-', '')}`} />
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight text-primary">{item.title}</h3>
                                        <p className="text-primary/70 text-base font-bold font-subtitle leading-relaxed">{item.desc}</p>
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
};

export default TrackShipment;

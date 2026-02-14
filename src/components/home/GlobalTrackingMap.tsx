import { Ship, Plane, Truck, Globe } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function GlobalTrackingMap() {
    return (
        <section className="py-24 bg-white overflow-hidden relative">
            <div className="container px-4 mx-auto">
                <ScrollReveal animation="slide-up">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                            Real-Time Logistics
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                            Global Movement <br />
                            <span className="text-accent"> & Precision Tracking</span>
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed font-semibold font-subtitle">
                            Monitor your cargo as it moves across borders. Our advanced GPS-integrated system
                            provides second-by-second updates on ships, planes, and trucks across our regional network.
                        </p>
                    </div>
                </ScrollReveal>

                <ScrollReveal animation="zoom-in" delay={200}>
                    <div className="relative group max-w-6xl mx-auto">
                        {/* Map Container */}
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 bg-slate-50 aspect-[16/9] lg:aspect-[21/9]">
                            {/* Fallback pattern if map image is missing */}
                            <div className="absolute inset-x-0 inset-y-0 opacity-[0.05] pointer-events-none bg-[url('/assets/images/pattern.svg')] bg-repeat" />
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-200" />

                            <img
                                src="/assets/sections/global_map.png"
                                alt="Global Tracking Map"
                                className="w-full h-full object-cover opacity-80"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />

                            {/* Animated SVG Layers - Routes */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 500">
                                {/* Route 1: Regional Hub to Port */}
                                <path
                                    d="M 400 300 Q 500 250 600 280"
                                    fill="none"
                                    stroke="rgba(230, 0, 0, 0.3)"
                                    strokeWidth="3"
                                    strokeDasharray="8,8"
                                    className="animate-[dash_20s_linear_infinite]"
                                />
                                <circle r="4" fill="#E60000" className="animate-pulse">
                                    <animateMotion dur="10s" repeatCount="indefinite" path="M 400 300 Q 500 250 600 280" />
                                </circle>

                                {/* Route 2: Cross-border Transit */}
                                <path
                                    d="M 300 150 Q 500 100 800 200"
                                    fill="none"
                                    stroke="rgba(8, 47, 73, 0.3)"
                                    strokeWidth="3"
                                    strokeDasharray="8,8"
                                />
                                <circle r="4" fill="#0A2647" className="animate-pulse">
                                    <animateMotion dur="15s" repeatCount="indefinite" path="M 300 150 Q 500 100 800 200" />
                                </circle>

                                {/* Markers */}
                                <g className="cursor-pointer pointer-events-auto">
                                    <circle cx="400" cy="300" r="6" fill="#E60000" />
                                    <text x="415" y="305" className="text-[12px] font-black fill-slate-900 tracking-tighter uppercase">Regional Hub</text>
                                </g>
                                <g className="cursor-pointer pointer-events-auto">
                                    <circle cx="600" cy="280" r="6" fill="#0A2647" />
                                    <text x="615" y="285" className="text-[12px] font-black fill-slate-900 tracking-tighter uppercase">Sea Terminal</text>
                                </g>
                            </svg>

                            {/* Status Overlay Cards */}
                            <div className="absolute top-8 left-8 space-y-4 hidden md:block">
                                <ScrollReveal animation="slide-in-right" delay={500}>
                                    <div className="glass p-4 rounded-2xl flex items-center gap-4 border-slate-200/50 shadow-xl bg-white/60 backdrop-blur-md">
                                        <div className="h-10 w-10 rounded-xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                                            <Plane className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase">Express IM-7042</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">In Transit: Hub Alpha</p>
                                        </div>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal animation="slide-in-right" delay={700}>
                                    <div className="glass p-4 rounded-2xl flex items-center gap-4 border-slate-200/50 shadow-xl bg-white/60 backdrop-blur-md">
                                        <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                            <Ship className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase">Vessel OCEAN-SKY</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Docked: Main Port</p>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>

                            {/* Bottom Sync Bar */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] glass-dark p-3 rounded-2xl flex items-center justify-between px-10 text-white/90 shadow-2xl backdrop-blur-xl border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Sync Active</span>
                                </div>
                                <div className="hidden lg:flex items-center gap-8">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">GPS Precision: 99.9%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Global Network Grid - West & Central Africa */}
                <ScrollReveal animation="slide-up" delay={400}>
                    <div className="mt-24">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">Our Global Network</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto font-medium font-subtitle">
                                Connecting you to major trade routes across West & Central Africa and the global market
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[
                                { country: "Sierra Leone", flag: "🇸🇱", routes: ["Freetown", "Pepel"] },
                                { country: "Ghana", flag: "🇬🇭", routes: ["Accra", "Tema", "Takoradi"] },
                                { country: "Nigeria", flag: "🇳🇬", routes: ["Lagos", "Port Harcourt", "Kano"] },
                                { country: "Senegal", flag: "🇸🇳", routes: ["Dakar", "Ziguinchor"] },
                                { country: "Ivory Coast", flag: "🇨🇮", routes: ["Abidjan", "San Pedro"] },
                                { country: "Guinea", flag: "🇬🇳", routes: ["Conakry", "Kamsar"] },
                                { country: "Cameroon", flag: "🇨🇲", routes: ["Douala", "Kribi"] },
                                { country: "Gambia", flag: "🇬🇲", routes: ["Banjul"] },
                            ].map((dest, index) => (
                                <ScrollReveal
                                    key={dest.country}
                                    animation="zoom-in"
                                    delay={index * 50}
                                    duration={500}
                                >
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-accent hover:shadow-xl transition-all h-full group">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-3xl group-hover:scale-110 transition-transform">{dest.flag}</span>
                                            <h3 className="font-black text-slate-900 tracking-tight">{dest.country}</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {dest.routes.map((route) => (
                                                <div key={route} className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                    <Globe className="h-3 w-3 text-accent" />
                                                    {route}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

import { Package, Ship, Plane, Truck, ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WhatsAppHeroCTA } from "@/components/common/WhatsAppHeroCTA";

const slides = [
  {
    id: 1,
    brand: "IBRAHIM MUHAMMAD Express",
    theme: {
      primary: "#0A2647",
      accent: "#E60000",
      glow: "rgba(230, 0, 0, 0.3)"
    },
    title: (
      <>
        IBRAHIM
        <span className="block">
          <span className="text-accent-dynamic">MUHAMMAD</span>
        </span>
        <span className="block text-2xl md:text-3xl text-white/90 mt-2">
          Express Logistics
        </span>
      </>
    ),
    description: "Your trusted partner for international logistics. Expert customs clearance, freight forwarding, and cargo handling across Somalia, UAE, China, and beyond.",
    stats: [
      { value: "15+", label: "Years Experience" },
      { value: "50+", label: "Countries" },
      { value: "98%", label: "On-Time Delivery" },
    ],
    badgeValue: "IBRAHIM",
    badgeAccent: "MUHAMMAD"
  },
  {
    id: 2,
    brand: "IBRAHIM MUHAMMAD Global",
    theme: {
      primary: "#0F172A",
      accent: "#F59E0B",
      glow: "rgba(245, 158, 11, 0.3)"
    },
    title: (
      <>
        IBRAHIM
        <span className="block">
          <span className="text-accent-dynamic">MUHAMMAD</span>
        </span>
        <span className="block text-2xl md:text-3xl text-white/90 mt-2">
          Global Shipping Solutions
        </span>
      </>
    ),
    description: "Multi-modal transport services tailored to your needs. From container shipping to express air cargo, we ensure your goods reach their destination safely and on time.",
    stats: [
      { value: "SEA", label: "Freight" },
      { value: "AIR", label: "Cargo" },
      { value: "LAND", label: "Transport" },
    ],
    badgeValue: "IBRAHIM",
    badgeAccent: "GLOBAL"
  },
  {
    id: 3,
    brand: "IBRAHIM MUHAMMAD Clearing",
    theme: {
      primary: "#111827",
      accent: "#10B981",
      glow: "rgba(16, 185, 129, 0.3)"
    },
    title: (
      <>
        IBRAHIM
        <span className="block">
          <span className="text-accent-dynamic">MUHAMMAD</span>
        </span>
        <span className="block text-2xl md:text-3xl text-white/90 mt-2">
          Customs Clearing Mastery
        </span>
      </>
    ),
    description: "Specialized in clearing and forwarding for East Africa, UAE, and China. Integrated cargo control for seamless global trade visibility and delivery execution.",
    stats: [
      { value: "UAE", label: "Hub" },
      { value: "SOMALIA", label: "Service" },
      { value: "CHINA", label: "Direct" },
    ],
    badgeValue: "IBRAHIM",
    badgeAccent: "CLEARING"
  }
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="relative overflow-hidden bg-primary min-h-[300px]">
      {/* Static Royal Blue Stage - Solid Base */}
      <div className="absolute inset-0 bg-[#051124]" />

      {/* Deep Blue Gradient Layer for Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A2647] via-[#051124] to-[#020617] opacity-80" />

      {/* Background Logo Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img
          src="/assets/logos/logo-2.jpg"
          alt="Watermark"
          className="w-[120%] lg:w-[100%] max-w-[1200px] opacity-[0.04] grayscale brightness-200 contrast-150"
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      {/* Dynamic Brand Illumination - The "Spotlight" */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 animate-pulse-glow"
        style={{
          background: `radial-gradient(circle at 60% 50%, ${slide.theme.accent} 0%, transparent 60%)`,
          opacity: 0.15
        }}
      />

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/assets/images/pattern.svg')] bg-repeat" />

      <div className="container relative h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-8 lg:py-12 w-full">
          {/* Content side */}
          <div
            key={`slide-content-${currentSlide}`}
            className="glass relative z-10 p-6 md:p-8 rounded-3xl space-y-6 text-center lg:text-left animate-slide-in-right shadow-2xl border-white/20"
          >
            <ScrollReveal animation="slide-in-right" duration={800}>
              <div className="space-y-4">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest animate-pulse-glow transition-colors duration-1000"
                  style={{ borderColor: `${slide.theme.accent}33`, color: slide.theme.accent }}
                >
                  <Globe className="h-3 w-3" />
                  {slide.brand}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[0.9] transition-all duration-1000">
                  {slide.title}
                  <style>{`.text-accent-dynamic { color: ${slide.theme.accent}; }`}</style>
                </h1>
              </div>

              <p className="text-lg md:text-xl text-white max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold font-subtitle mt-6">
                {slide.description}
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                <Link to="/services">
                  <Button
                    size="lg"
                    className="h-14 px-8 rounded-full font-bold uppercase tracking-widest text-xs group transition-all duration-1000 shadow-xl"
                    style={{ backgroundColor: slide.theme.accent, color: '#fff' }}
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 rounded-full border-2 bg-transparent font-bold uppercase tracking-widest text-xs transition-all duration-1000"
                    style={{ borderColor: `${slide.theme.accent}33`, color: slide.theme.accent }}
                  >
                    Our Expertise
                  </Button>
                </Link>
              </div>

              <WhatsAppHeroCTA contextLabel="Home hero section" className="pt-2" />

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-white/20">
                {slide.stats.map((stat, i) => (
                  <div key={i} className="space-y-1 group">
                    <div
                      className="text-xl md:text-2xl font-black transition-all duration-1000 group-hover:scale-110"
                      style={{ color: slide.theme.accent }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-bold text-white uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Visual side - Dynamic Info Badge */}
          <div key={`slide-visual-${currentSlide}`} className="relative hidden lg:flex justify-center items-center animate-scale-in">
            <ScrollReveal animation="scale-in" duration={1000} delay={200}>
              <div className="relative group">
                {/* Outer Glow Ring */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl animate-pulse-glow transition-all duration-1000"
                  style={{ backgroundColor: slide.theme.accent, opacity: 0.2 }}
                />

                {/* Main Badge */}
                <div className="relative glass w-72 h-72 rounded-full flex flex-col items-center justify-center border-white/30 shadow-[0_0_50px_rgba(0,0,0,0.1)] transition-transform group-hover:rotate-6 duration-700">
                  <div
                    className="absolute inset-4 rounded-full border border-dashed animate-spin-slow transition-colors duration-1000"
                    style={{ borderColor: `${slide.theme.accent}4D` }}
                  />
                  <div className="text-center z-10 px-6">
                    <Package
                      className="w-12 h-12 mx-auto mb-4 animate-bounce-subtle transition-colors duration-1000"
                      style={{ color: slide.theme.accent }}
                    />
                    <p className="text-4xl font-black text-white leading-none mb-1">{slide.badgeValue}</p>
                    <p
                      className="text-sm font-black uppercase tracking-[0.2em] transition-colors duration-1000"
                      style={{ color: slide.theme.accent }}
                    >
                      {slide.badgeAccent}
                    </p>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="flex items-center gap-2 mt-8">
                  <Truck className="h-5 w-5 transition-colors duration-1000" style={{ color: slide.theme.accent }} />
                  <p className="text-sm font-semibold text-white">{currentSlide === 0 ? "Express Delivery" : currentSlide === 1 ? "Supply Chain" : "Cargo Visibility"}</p>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === i ? "w-8" : "bg-white/30 hover:bg-white/50"
              }`}
            style={{ backgroundColor: currentSlide === i ? slide.theme.accent : undefined }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

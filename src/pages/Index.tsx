import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrackingSection } from "@/components/home/TrackingSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { GlobalTrackingMap } from "@/components/home/GlobalTrackingMap";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrackingSection />
        <ServicesSection />
        <GlobalTrackingMap />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

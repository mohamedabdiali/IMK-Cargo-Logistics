import { MapPin } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const destinations = [
  { country: "Somalia", flag: "🇸🇴", routes: ["Mogadishu", "Bosaso", "Berbera"] },
  { country: "Kenya", flag: "🇰🇪", routes: ["Mombasa", "Nairobi"] },
  { country: "Ethiopia", flag: "🇪🇹", routes: ["Addis Ababa", "Dire Dawa"] },
  { country: "Djibouti", flag: "🇩🇯", routes: ["Djibouti City"] },
  { country: "Tanzania", flag: "🇹🇿", routes: ["Dar es Salaam"] },
];

export function DestinationsSection() {
  return (
    <section className="py-16">
      <div className="container">
        <ScrollReveal animation="slide-up">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Our Global Network</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connecting you to major trade routes across Africa, Middle East, and Asia
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {destinations.map((dest, index) => (
            <ScrollReveal
              key={dest.country}
              animation="zoom-in"
              delay={index * 50}
              duration={500}
            >
              <div
                className="bg-card rounded-xl p-4 border hover:border-accent hover:shadow-lg transition-all h-full"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{dest.flag}</span>
                  <h3 className="font-semibold">{dest.country}</h3>
                </div>
                <div className="space-y-1">
                  {dest.routes.map((route) => (
                    <div key={route} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {route}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

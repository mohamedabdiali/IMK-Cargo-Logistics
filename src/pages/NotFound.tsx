import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <ScrollReveal animation="blur-in" duration={1000}>
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-black text-primary">404</h1>
          <p className="mb-8 text-2xl text-muted-foreground font-semibold font-subtitle">Oops! Page not found</p>
          <a href="/" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20">
            Return to Home
          </a>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default NotFound;

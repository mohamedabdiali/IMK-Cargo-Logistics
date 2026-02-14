import { Menu, Globe, Phone, X, Package, ArrowRight, LogIn, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Track Shipment", href: "/track" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const customerActionHref = user?.role === "customer" ? "/customer/portal" : "/customer/login";
  const customerActionLabel = user?.role === "customer" ? "Customer Portal" : "Customer Login";
  const isCustomerLoggedIn = user?.role === "customer";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "glass shadow-sm"
    )}>
      {/* Top bar - remains simple but refined */}
      <div className="bg-primary/5 text-primary border-b border-primary/5 hidden sm:block">
        <div className="container flex h-9 items-center justify-between text-[11px] font-medium uppercase tracking-wider">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-accent" />
              +971 58 301 6522
            </span>
            <span className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-accent" />
              info@ibrahimmuhammad.com
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/login" className="text-primary/80 hover:text-primary transition-colors">
              <span className="inline-flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-accent" />
                Admin Portal
              </span>
            </Link>
            <Link
              to="/quote"
              className="flex items-center gap-2 text-accent/90 hover:text-accent transition-all group"
            >
              <Package className="h-3.5 w-3.5" />
              Request Cargo Quote
              <ArrowRight className="h-3 w-3 -ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main header container */}
      <div className="container flex h-20 items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative overflow-hidden rounded-lg bg-white p-1 shadow-sm transition-transform group-hover:scale-105">
            <img
              src="/assets/logos/logo-2.jpg"
              alt="IBRAHIM MUHAMMAD Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-black tracking-tight text-primary group-hover:text-accent transition-colors">IBRAHIM MUHAMMAD</span>
            <span className="text-[10px] font-bold text-accent/80 uppercase tracking-widest">Clearing & Forwarding LLC</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block flex-1">
          <ul className="flex items-center justify-center gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`relative px-4 py-2 text-sm font-semibold transition-all hover:text-accent group ${location.pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                    }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-4 right-4 h-0.5 bg-accent transform transition-transform duration-300 ${location.pathname === item.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isCustomerLoggedIn ? (
            <Button variant="outline" className="hidden md:flex rounded-full" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          ) : (
            <Link to={customerActionHref} className="hidden md:block">
              <Button variant="outline" className="rounded-full">
                <LogIn className="h-4 w-4 mr-2" />
                {customerActionLabel}
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full hover:bg-accent/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-accent" /> : <Menu className="h-6 w-6 text-primary" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass border-t border-primary/5 shadow-2xl animate-slide-up origin-top">
          <ul className="py-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-6 py-4 text-sm font-bold tracking-tight transition-all ${location.pathname === item.href
                    ? "bg-accent/10 text-accent border-l-4 border-accent"
                    : "text-primary hover:bg-primary/5 border-l-4 border-transparent"
                    }`}
                >
                  {item.label}
                  {location.pathname === item.href && <ArrowRight className="h-4 w-4" />}
                </Link>
              </li>
            ))}
            {isCustomerLoggedIn ? (
              <li>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center justify-between px-6 py-4 text-sm font-bold tracking-tight text-primary hover:bg-primary/5 border-l-4 border-transparent"
                >
                  Logout
                </button>
              </li>
            ) : (
              <li>
                <Link
                  to={customerActionHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-6 py-4 text-sm font-bold tracking-tight text-primary hover:bg-primary/5 border-l-4 border-transparent"
                >
                  {customerActionLabel}
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-6 py-4 text-sm font-bold tracking-tight text-primary hover:bg-primary/5 border-l-4 border-transparent"
              >
                Admin Portal
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

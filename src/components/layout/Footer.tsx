import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Package } from "lucide-react";
import { COMPANY_CONTACT } from "@/constants/operations";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-200 border-t-4 border-accent relative overflow-hidden">
      {" "}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
      {/* Main footer */}
      <div className="container py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-white p-1 rounded-lg transition-transform group-hover:scale-110">
                <img
                  src="/assets/logos/logo-1.jpg"
                  alt="IBRAHIM MUHAMMAD Logo"
                  className="h-10 w-auto"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tight text-white">IBRAHIM MUHAMMAD</span>
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Clearing & Forwarding LLC</span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Logistics leader specializing in expert customs clearance and multi-modal transport solutions across the World
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 hover:bg-accent hover:border-accent hover:text-white hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Our Expertise</h3>
            <ul className="space-y-4 text-sm font-semibold text-slate-400">
              <li><Link to="/services" className="hover:text-accent transition-all hover:translate-x-2 inline-block">Sea Freight Solutions</Link></li>
              <li><Link to="/services" className="hover:text-accent transition-all hover:translate-x-2 inline-block">Air Cargo Services</Link></li>
              <li><Link to="/services" className="hover:text-accent transition-all hover:translate-x-2 inline-block">Land Transport Network</Link></li>
              <li><Link to="/services" className="hover:text-accent transition-all hover:translate-x-2 inline-block">Customs & Documentation</Link></li>
              <li><Link to="/services" className="hover:text-accent transition-all hover:translate-x-2 inline-block">Supply Chain Logistics</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Quick Navigation</h3>
            <ul className="space-y-4 text-sm font-semibold text-slate-400">
              <li><Link to="/about" className="hover:text-accent transition-all hover:translate-x-2 inline-block">Corporate Profile</Link></li>
              <li><Link to="/track" className="hover:text-accent transition-all hover:translate-x-2 inline-block">Shipment Tracking</Link></li>
              <li><Link to="/quote" className="hover:text-accent transition-all hover:translate-x-2 inline-block">Request a Quote</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-all hover:translate-x-2 inline-block">Global Contacts</Link></li>
              <li><Link to="/terms" className="hover:text-accent transition-all hover:translate-x-2 inline-block">Privacy & Terms</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Contact Headquarters</h3>
            <ul className="space-y-6 text-sm font-semibold text-slate-400">
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-white text-xs font-black uppercase mb-1">Office Location</p>
                  <span className="text-[13px]">{COMPANY_CONTACT.officeLocation}</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-white text-xs font-black uppercase mb-1">Phone Line</p>
                  <span className="text-[13px]">{COMPANY_CONTACT.phoneLine}</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-white text-xs font-black uppercase mb-1">Email Support</p>
                  <span className="text-[13px]">{COMPANY_CONTACT.supportEmail}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-black/50 border-t border-white/5 py-8">
        <div className="container text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-300">
                (c) 2026 IBRAHIM MUHAMMAD Clearing & Forwarding LLC.
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Crafted by <span className="text-accent/80">PRIMMESISC TECHNOLOGY SOLUTION COMPANY</span>
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-[11px] font-black uppercase tracking-widest">
              <Link to="/admin/login" className="text-accent hover:text-white transition-colors">Cargo Control Portal</Link>
              <Link to="/privacy" className="text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-slate-500 hover:text-white transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}



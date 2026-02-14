import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { toast } from "@/hooks/use-toast";

const contactInfo = [
  {
    icon: MapPin,
    title: "Headquarters",
    details: ["Dubai, United Arab Emirates"],
  },
  {
    icon: Phone,
    title: "Phone",
    details: ["+971 58 301 6522"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@imklogistics.com"],
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"],
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-slate-900 to-accent animate-gradient-xy" />
          <div className="container relative z-10 text-center space-y-6">
            <ScrollReveal animation="fade-up-large">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest animate-pulse-glow">
                <Mail className="h-3 w-3" />
                Global Communication Hub
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-none mt-6">
                Reach Our <span className="text-accent underline decoration-accent/30 decoration-8 underline-offset-8">Support Team</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal animation="blur-in" delay={300}>
              <p className="text-xl text-white/90 max-w-2xl mx-auto font-semibold font-subtitle mt-6">
                Direct access to our logistics architects. We're here to solve your most complex shipping challenges 24/7.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="py-24 bg-background relative">
          <div className="container">
            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16">
              {/* Contact Info */}
              <div className="space-y-12">
                <ScrollReveal animation="slide-in-left">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black tracking-tight text-primary">Contact Details</h2>
                    <p className="text-muted-foreground text-lg font-medium">Headquarters and regional support lines across the globe.</p>
                  </div>
                </ScrollReveal>
                <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
                  {contactInfo.map((item, index) => (
                    <ScrollReveal
                      key={item.title}
                      animation="zoom-in"
                      delay={index * 100}
                    >
                      <div
                        className="glass p-8 rounded-3xl border-primary/5 hover:border-accent/30 transition-all duration-500 group h-full"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                            <item.icon className="h-6 w-6 text-accent group-hover:text-white transition-colors" />
                          </div>
                          <h3 className="text-xl font-black text-primary tracking-tight">{item.title}</h3>
                        </div>
                        <div className="space-y-1">
                          {item.details.map((detail, i) => (
                            <p key={i} className="text-sm text-primary/80 font-bold font-subtitle">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <ScrollReveal animation="slide-in-right">
                <div className="glass p-10 md:p-16 rounded-[3rem] border-primary/5 shadow-2x shadow-primary/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                  <div className="relative z-10 space-y-10">
                    <div className="space-y-3">
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight text-primary">Direct Message</h2>
                      <p className="text-primary/70 font-bold font-subtitle">Our consultants will respond within 60 minutes.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid sm:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Your Persona</label>
                          <Input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Full Name"
                            className="h-14 bg-primary/5 border-primary/10 rounded-xl font-bold px-6 focus:ring-accent focus:border-accent transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Digital Reply</label>
                          <Input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="email@example.com"
                            className="h-14 bg-primary/5 border-primary/10 rounded-xl font-bold px-6 focus:ring-accent focus:border-accent transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Inquiry Subject</label>
                        <Input
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="Subject of Conversation"
                          className="h-14 bg-primary/5 border-primary/10 rounded-xl font-bold px-6 focus:ring-accent focus:border-accent transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Detailed Content</label>
                        <Textarea
                          required
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Describe your requirements in detail..."
                          className="bg-primary/5 border-primary/10 rounded-2xl font-bold px-6 py-4 focus:ring-accent focus:border-accent transition-all min-h-[180px]"
                        />
                      </div>
                      <Button type="submit" variant="gold" className="btn-premium w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs group">
                        Transmit Message
                        <Send className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </form>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

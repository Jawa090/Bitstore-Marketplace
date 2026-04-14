import { useState } from "react";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import Navbar from "@/components/Navbar";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { toast } from "sonner";

interface ContactContent {
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  map_embed_url: string;
}

const fallback: ContactContent = {
  title: "Contact Us",
  subtitle: "We'd love to hear from you. Get in touch with our team.",
  address: "Al Quoz Industrial Area 3, Dubai, UAE",
  phone: "+971 4 123 4567",
  email: "support@bitstores.com",
  hours: "Sun – Thu: 9AM – 6PM | Fri: 10AM – 2PM",
  map_embed_url: "",
};

const ContactUs = () => {
  const { data } = useStorefrontContent<ContactContent>("page_contact", fallback);
  const content = data?.content || fallback;
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold font-display mb-2">{content.title}</h1>
          <p className="text-muted-foreground">{content.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            {[
              { icon: MapPin, label: "Address", value: content.address },
              { icon: Phone, label: "Phone", value: content.phone },
              { icon: Mail, label: "Email", value: content.email },
              { icon: Clock, label: "Working Hours", value: content.hours },
            ].map((item, i) => (
              <Card key={i} className="bg-secondary/30 border-border/50">
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-primary" /> {item.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card className="bg-secondary/20 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Name *</label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What's this about?" />
                </div>
                <div>
                  <label className="text-sm font-medium">Message *</label>
                  <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us how we can help..." rows={5} />
                </div>
                <Button type="submit" disabled={sending} className="w-full">
                  <Send className="h-4 w-4 mr-2" /> {sending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <StorefrontFooter />
    </div>
  );
};

export default ContactUs;

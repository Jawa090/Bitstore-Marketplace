import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Truck, ArrowRight, Globe, Package, Zap, Shield,
  BarChart3, Clock, CheckCircle2, Boxes, Users, HeadphonesIcon
} from "lucide-react";

const steps = [
  { icon: Users, title: "Apply", desc: "Fill out the application form below" },
  { icon: Package, title: "Get Approved", desc: "Our team reviews within 24 hours" },
  { icon: Globe, title: "List Products", desc: "Access our catalog via API or CSV" },
  { icon: Truck, title: "We Ship", desc: "We handle fulfillment & delivery" },
];

const benefits = [
  { icon: Package, title: "No Inventory Needed", desc: "Sell without holding any stock. We store and manage inventory for you." },
  { icon: Truck, title: "We Handle Shipping", desc: "All orders fulfilled and shipped directly to your customers across UAE." },
  { icon: Zap, title: "Automated Sync", desc: "Real-time stock and pricing updates via API integration or CSV feed." },
  { icon: Shield, title: "Quality Guaranteed", desc: "Every product is inspected and comes with warranty coverage." },
  { icon: BarChart3, title: "Competitive Margins", desc: "Wholesale pricing so you can set your own retail margins." },
  { icon: HeadphonesIcon, title: "Dedicated Support", desc: "A dedicated account manager to help you grow your business." },
];

const stats = [
  { value: "200+", label: "Active Dropshippers" },
  { value: "5,000+", label: "Products Available" },
  { value: "24h", label: "Fulfillment Time" },
  { value: "UAE-wide", label: "Delivery Coverage" },
];

const Dropshipping = () => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    business_type: "reseller",
    products_interest: "",
    monthly_volume: "",
    website_url: "",
    message: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("dropship_requests" as any).insert({
        ...formData,
        user_id: user?.id || null,
      });
      if (error) throw error;
      toast.success("Application submitted! Our team will review and contact you within 24 hours.");
      setFormData({
        company_name: "", contact_name: "", email: "", phone: "",
        business_type: "reseller", products_interest: "", monthly_volume: "",
        website_url: "", message: "",
      });
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-xs font-semibold">
              <Boxes className="h-3 w-3 mr-1.5" /> Dropshipping Program
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Start Selling Without <span className="text-primary">Inventory</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join BitStores dropshipping program. Access thousands of phones, tablets, and accessories at wholesale prices — we handle storage, packaging, and delivery.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" className="gap-2 font-semibold" onClick={() => document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" })}>
                Apply Now <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="gap-2" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-border/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="text-muted-foreground mt-2">Get started in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="border-border/50 h-full relative overflow-hidden">
                  <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <CardContent className="p-6 space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Why Dropship With BitStores?</h2>
            <p className="text-muted-foreground mt-2">Everything you need to run a successful reselling business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/50 h-full hover:border-primary/30 transition-colors">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <b.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply-form" className="py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground">Apply to Dropship</h2>
              <p className="text-muted-foreground mt-2">Fill out the form and our team will get back to you within 24 hours</p>
            </div>
            <Card className="border-border/50">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Company / Store Name *</Label>
                      <Input required value={formData.company_name} onChange={e => handleChange("company_name", e.target.value)} placeholder="Your business name" />
                    </div>
                    <div>
                      <Label>Contact Name *</Label>
                      <Input required value={formData.contact_name} onChange={e => handleChange("contact_name", e.target.value)} placeholder="Full name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Email *</Label>
                      <Input required type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)} placeholder="email@company.com" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={formData.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="+971..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Business Type *</Label>
                      <Select value={formData.business_type} onValueChange={v => handleChange("business_type", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reseller">Reseller</SelectItem>
                          <SelectItem value="ecommerce">E-commerce Store</SelectItem>
                          <SelectItem value="social_seller">Social Media Seller</SelectItem>
                          <SelectItem value="corporate">Corporate Buyer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Expected Monthly Volume</Label>
                      <Select value={formData.monthly_volume} onValueChange={v => handleChange("monthly_volume", v)}>
                        <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-20">1 – 20 orders/month</SelectItem>
                          <SelectItem value="21-50">21 – 50 orders/month</SelectItem>
                          <SelectItem value="51-100">51 – 100 orders/month</SelectItem>
                          <SelectItem value="100+">100+ orders/month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Website / Social Link</Label>
                    <Input value={formData.website_url} onChange={e => handleChange("website_url", e.target.value)} placeholder="https://yourstore.com or @instagram" />
                  </div>
                  <div>
                    <Label>Products You're Interested In</Label>
                    <Textarea value={formData.products_interest} onChange={e => handleChange("products_interest", e.target.value)} placeholder="e.g., iPhones, Samsung phones, tablets, accessories..." rows={2} />
                  </div>
                  <div>
                    <Label>Additional Message</Label>
                    <Textarea value={formData.message} onChange={e => handleChange("message", e.target.value)} placeholder="Tell us about your business..." rows={3} />
                  </div>
                  <Button type="submit" size="lg" className="w-full gap-2 font-semibold" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Application"} <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <StorefrontFooter />
    </div>
  );
};

export default Dropshipping;

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, Mail, ArrowRight, Building2, Truck, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";

const defaultContent = {
  title: "Wholesale & B2B",
  subtitle: "Get Custom Pricing.",
  description: "Whether you're a reseller, corporate buyer, or enterprise — get the best wholesale prices on phones, tablets, and accessories across the UAE.",
  email: "wholesale@bitstores.ae",
  perks: [
    { title: "Bulk Discounts", desc: "Up to 40% off on bulk orders", icon: "badge-percent" },
    { title: "Free Shipping", desc: "On orders above 5,000 AED", icon: "truck" },
    { title: "B2B Invoicing", desc: "VAT invoices & NET terms", icon: "building-2" },
  ],
  stats: [
    { value: "500+", label: "Business Clients" },
    { value: "10K+", label: "Devices Shipped" },
    { value: "40%", label: "Savings Up To" },
    { value: "24h", label: "Quote Turnaround" },
  ],
};

const getIcon = (icon: string) => {
  if (icon === "truck") return Truck;
  if (icon === "building-2") return Building2;
  return BadgePercent;
};

const StorefrontWholesale = () => {
  const [open, setOpen] = useState(false);
  const { data: cmsData } = useStorefrontContent("wholesale", defaultContent);
  const content = cmsData?.content || defaultContent;
  const perks = content.perks || defaultContent.perks;
  const stats = content.stats || defaultContent.stats;

  if (cmsData && !cmsData.is_active) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Bulk order request submitted! Our team will contact you within 24 hours.");
    setOpen(false);
  };

  return (
    <section className="py-10">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(217 91% 20% / 0.9))",
          }}
        >
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }} />

          <div className="relative p-8 md:p-12 flex flex-col gap-8">
            {/* Section header — matches Auctions layout */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{content.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {content.subtitle}
                  </p>
                </div>
              </div>
              <Link to="/wholesale">
                <Button variant="outline" size="sm" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 space-y-5">

              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Bulk Orders?<br />
                <span className="text-primary">{content.subtitle}</span>
              </h2>

              <p className="text-muted-foreground max-w-lg">{content.description}</p>

              <div className="flex flex-wrap gap-4">
                {perks.map((perk: any) => {
                  const Icon = getIcon(perk.icon);
                  return (
                    <div key={perk.title} className="flex items-center gap-2 bg-background/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/30">
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{perk.title}</p>
                        <p className="text-[10px] text-muted-foreground">{perk.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="gap-2 font-semibold">
                      Request Bulk Quote <ArrowRight className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Your Bulk Deal</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label>Company Name</Label><Input required placeholder="Your company" /></div>
                        <div><Label>Contact Name</Label><Input required placeholder="Full name" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label>Email</Label><Input required type="email" placeholder="email@company.com" /></div>
                        <div><Label>Phone</Label><Input required placeholder="+971..." /></div>
                      </div>
                      <div>
                        <Label>What products are you looking for?</Label>
                        <Textarea required placeholder="e.g., 50x iPhone 15 128GB, 30x Samsung Galaxy S24..." rows={3} />
                      </div>
                      <Button type="submit" className="w-full">Submit Request</Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Link to="/wholesale">
                  <Button variant="outline" size="lg" className="gap-2">
                    View Catalog <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              {stats.map((stat: any) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.05 }}
                  className="bg-background/10 backdrop-blur-sm border border-border/30 rounded-xl p-5 text-center"
                >
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StorefrontWholesale;

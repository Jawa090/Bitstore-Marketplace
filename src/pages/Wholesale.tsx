import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import {
  Package, Mail, ArrowRight, Building2, Truck, BadgePercent,
  Shield, Clock, Users, Phone, CheckCircle2, Star
} from "lucide-react";

const defaultWholesaleContent = {
  title: "Wholesale & B2B",
  subtitle: "Get Custom Pricing on Bulk Orders",
  description: "Whether you're a reseller, corporate buyer, or enterprise — get the best wholesale prices on phones, tablets, and accessories across the UAE.",
  email: "wholesale@bitstores.ae",
  phone: "+971-XX-XXX-XXXX",
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
  pricing_tiers: [
    { min_qty: 10, max_qty: 49, discount: "10%", label: "Starter" },
    { min_qty: 50, max_qty: 199, discount: "20%", label: "Business" },
    { min_qty: 200, max_qty: 499, discount: "30%", label: "Enterprise" },
    { min_qty: 500, max_qty: null, discount: "40%", label: "Mega" },
  ],
};

const tierColors = [
  "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  "from-amber-500/20 to-amber-600/10 border-amber-500/30",
];

const Wholesale = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { data: cmsData } = useStorefrontContent("wholesale", defaultWholesaleContent);
  const content = cmsData?.content || defaultWholesaleContent;

  const { data: products } = useQuery({
    queryKey: ["wholesale-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*), vendors(store_name)")
        .eq("is_active", true)
        .order("price", { ascending: true })
        .limit(12);
      return data || [];
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Bulk order request submitted! Our team will contact you within 24 hours.");
    setQuoteOpen(false);
  };

  const tiers = content.pricing_tiers || defaultWholesaleContent.pricing_tiers;
  const perks = content.perks || defaultWholesaleContent.perks;
  const stats = content.stats || defaultWholesaleContent.stats;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }} />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                {content.title}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {content.subtitle}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {content.description}
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2 font-semibold">
                    Request Bulk Quote <ArrowRight className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
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
                      <Label>Estimated Quantity</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10-49">10 – 49 units</SelectItem>
                          <SelectItem value="50-199">50 – 199 units</SelectItem>
                          <SelectItem value="200-499">200 – 499 units</SelectItem>
                          <SelectItem value="500+">500+ units</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>What products are you looking for?</Label>
                      <Textarea required placeholder="e.g., 50x iPhone 15 128GB, 30x Samsung Galaxy S24..." rows={3} />
                    </div>
                    <Button type="submit" className="w-full">Submit Request</Button>
                  </form>
                </DialogContent>
              </Dialog>
              <a href={`mailto:${content.email}`}>
                <Button variant="outline" size="lg" className="gap-2">
                  <Mail className="h-4 w-4" /> Email Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-border/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat: any) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Bulk Pricing Tiers</h2>
            <p className="text-muted-foreground mt-2">The more you order, the more you save</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier: any, i: number) => (
              <motion.div
                key={tier.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`relative overflow-hidden border bg-gradient-to-br ${tierColors[i] || tierColors[0]} h-full`}>
                  {i === tiers.length - 1 && (
                    <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">Best Value</Badge>
                  )}
                  <CardContent className="p-6 text-center space-y-3">
                    <Star className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="text-xl font-bold text-foreground">{tier.label}</h3>
                    <p className="text-4xl font-bold text-primary">{tier.discount}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Discount</p>
                    <div className="border-t border-border/30 pt-3">
                      <p className="text-sm text-muted-foreground">
                        {tier.min_qty}{tier.max_qty ? ` – ${tier.max_qty}` : "+"} units
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Why Choose BitStores B2B?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {perks.map((perk: any) => (
              <Card key={perk.title} className="border-border/50">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    {perk.icon === "truck" ? <Truck className="h-6 w-6 text-primary" /> :
                     perk.icon === "building-2" ? <Building2 className="h-6 w-6 text-primary" /> :
                     <BadgePercent className="h-6 w-6 text-primary" />}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{perk.title}</h3>
                  <p className="text-sm text-muted-foreground">{perk.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Catalog */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Available for Bulk Orders</h2>
            <p className="text-muted-foreground mt-2">Browse our catalog — request a quote for custom pricing</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products?.map((product: any) => {
              const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url
                || product.product_images?.[0]?.image_url;
              return (
                <Card key={product.id} className="overflow-hidden group border-border/50 hover:border-primary/30 transition-colors">
                  <div className="aspect-square bg-secondary/30 flex items-center justify-center overflow-hidden">
                    {primaryImage ? (
                      <img src={primaryImage} alt={product.name} className="object-contain h-full w-full p-4 group-hover:scale-105 transition-transform" />
                    ) : (
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-primary">{product.currency} {product.price}</p>
                      <Badge variant="outline" className="text-[10px]">{product.condition?.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Bulk pricing available on quote</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" onClick={() => setQuoteOpen(true)} className="gap-2">
              Request Quote for These Products <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Get in Touch</h2>
            <p className="text-muted-foreground">Our B2B team is ready to help you with custom orders and pricing.</p>
            <div className="flex justify-center gap-6 flex-wrap">
              <a href={`mailto:${content.email}`} className="flex items-center gap-2 text-primary hover:underline">
                <Mail className="h-5 w-5" /> {content.email}
              </a>
              <a href={`tel:${content.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                <Phone className="h-5 w-5" /> {content.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <StorefrontFooter />
    </div>
  );
};

export default Wholesale;

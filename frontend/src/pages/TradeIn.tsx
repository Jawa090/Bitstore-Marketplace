import Navbar from "@/components/Navbar";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, ArrowRight, CheckCircle2, RefreshCw, ShieldCheck, Banknote } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeImage } from "@/hooks/useThemeImage";

const steps = [
  { icon: Smartphone, title: "Select Your Device", desc: "Choose your device brand, model and condition from our catalog." },
  { icon: RefreshCw, title: "Get Instant Quote", desc: "Receive an estimated trade-in value based on device condition." },
  { icon: ShieldCheck, title: "Ship or Drop Off", desc: "Send us your device or visit a BitStores partner location in the UAE." },
  { icon: Banknote, title: "Get Paid", desc: "Receive store credit or cash within 24 hours of verification." },
];

const devices = [
  { name: "iPhone 15 Pro Max", credit: "Up to 1,500 AED" },
  { name: "iPhone 14 Pro", credit: "Up to 1,100 AED" },
  { name: "Samsung Galaxy S24 Ultra", credit: "Up to 1,300 AED" },
  { name: "Samsung Galaxy S23", credit: "Up to 800 AED" },
  { name: "Google Pixel 8 Pro", credit: "Up to 900 AED" },
  { name: "iPad Pro 12.9″", credit: "Up to 1,200 AED" },
];

const TradeIn = () => {
  const bannerTradein = useThemeImage("tradein");
  return (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="relative overflow-hidden py-16 lg:py-24">
      <img src={bannerTradein} alt="Trade-in" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="container relative z-10 max-w-3xl">
        <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Trade-In Program</Badge>
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">Trade-In Your Old Device</h1>
        <p className="text-lg text-muted-foreground mb-6">Get up to <span className="text-primary font-semibold">1,500 AED</span> credit towards your next purchase. Fast, easy and eco-friendly.</p>
        <Button size="lg" className="gap-2">Get Your Quote <ArrowRight className="w-4 h-4" /></Button>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-12 lg:py-16">
      <div className="container">
        <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="text-center h-full border-border/50 bg-card/60">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <s.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Popular Trade-In Values */}
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="container max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-8">Popular Trade-In Values</h2>
        <div className="grid gap-3">
          {devices.map((d, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/60">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium">{d.name}</span>
                </div>
                <Badge variant="secondary" className="text-primary font-semibold">{d.credit}</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <StorefrontFooter />
  </div>
  );
};

export default TradeIn;

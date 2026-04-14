import Navbar from "@/components/Navbar";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Headphones, BatteryCharging, Shield, Cable, Smartphone, MonitorSmartphone } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useThemeImage } from "@/hooks/useThemeImage";

const categories = [
  { icon: Shield, name: "Cases & Covers", desc: "Premium protection for every device", from: "29 AED" },
  { icon: BatteryCharging, name: "Chargers & Power Banks", desc: "Fast charging certified accessories", from: "39 AED" },
  { icon: Headphones, name: "Audio & Earbuds", desc: "Wireless earbuds, headphones & speakers", from: "49 AED" },
  { icon: Cable, name: "Cables & Adapters", desc: "Lightning, USB-C, HDMI and more", from: "15 AED" },
  { icon: MonitorSmartphone, name: "Screen Protectors", desc: "Tempered glass for all models", from: "19 AED" },
  { icon: Smartphone, name: "Stands & Mounts", desc: "Car, desk and wall mounts", from: "25 AED" },
];

const Accessories = () => {
  const bannerAccessories = useThemeImage("accessories");
  return (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="relative overflow-hidden py-16 lg:py-24">
      <img src={bannerAccessories} alt="Accessories" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="container relative z-10 max-w-3xl">
        <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Certified Accessories</Badge>
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">Certified Accessories</h1>
        <p className="text-lg text-muted-foreground mb-6">Cases, chargers, earbuds & more — all certified and starting from just <span className="text-primary font-semibold">29 AED</span>.</p>
        <Link to="/search?category=accessories">
          <Button size="lg">Browse All Accessories</Button>
        </Link>
      </div>
    </section>

    {/* Categories */}
    <section className="py-12 lg:py-16">
      <div className="container">
        <h2 className="text-2xl font-bold text-center mb-10">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link to={`/search?category=${encodeURIComponent(c.name)}`}>
                <Card className="h-full border-border/50 bg-card/60 hover:border-primary/40 transition-colors cursor-pointer group">
                  <CardContent className="pt-8 pb-6 px-6 text-center">
                    <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <c.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{c.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{c.desc}</p>
                    <Badge variant="outline" className="text-xs">From {c.from}</Badge>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Why Certified */}
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="container max-w-2xl text-center">
        <h2 className="text-2xl font-bold mb-4">Why Buy Certified?</h2>
        <p className="text-muted-foreground mb-8">Every accessory sold on BitStores is tested for compatibility and safety. We only stock products that meet OEM or MFi standards.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          {["100% Compatibility Tested", "6-Month Warranty", "Free Returns in 14 Days"].map((t, i) => (
            <div key={i} className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border/50 bg-card/60">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="font-medium">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    <StorefrontFooter />
  </div>
  );
};

export default Accessories;

import { motion } from "framer-motion";
import { Truck, ShieldCheck, RotateCcw, MapPin } from "lucide-react";

const features = [
  { icon: Truck, title: "Same-Day Delivery", desc: "Across Dubai & Sharjah" },
  { icon: ShieldCheck, title: "Verified Vendors", desc: "All sellers are vetted" },
  { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
  { icon: MapPin, title: "UAE Focused", desc: "Local stores & support" },
];

const TrustBanner = () => (
  <section className="py-12 border-y border-border">
    <div className="container">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <f.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBanner;

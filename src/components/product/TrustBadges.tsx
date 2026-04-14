import { ShieldCheck, Unlock, Award, Truck } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Certified by Experts", sub: "Every device inspected" },
  { icon: Unlock, label: "All Phones Unlocked", sub: "Use with any carrier" },
  { icon: Award, label: "12 Months Warranty", sub: "Full coverage included" },
  { icon: Truck, label: "Free Delivery", sub: "Across the UAE" },
];

const TrustBadges = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {badges.map((b) => (
      <div
        key={b.label}
        className="flex flex-col items-center text-center gap-2 rounded-xl border border-border bg-secondary/20 p-4"
      >
        <b.icon className="h-6 w-6 text-primary" />
        <span className="text-xs font-semibold leading-tight">{b.label}</span>
        <span className="text-[10px] text-muted-foreground leading-tight">{b.sub}</span>
      </div>
    ))}
  </div>
);

export default TrustBadges;

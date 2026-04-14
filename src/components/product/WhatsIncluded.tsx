import { Smartphone, Cable, BookOpen } from "lucide-react";

const items = [
  { icon: Smartphone, label: "Device" },
  { icon: Cable, label: "Charging Cable" },
  { icon: BookOpen, label: "Quick Start Guide" },
];

const WhatsIncluded = () => (
  <div className="rounded-xl border border-border p-5">
    <h3 className="font-semibold mb-4">What's Included</h3>
    <div className="flex items-center gap-6">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-2 text-center">
          <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
            <item.icon className="h-6 w-6 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default WhatsIncluded;

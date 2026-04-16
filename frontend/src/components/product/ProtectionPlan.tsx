import { useState } from "react";
import { Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ProtectionPlanProps {
  price: number;
  currency?: string;
}

const ProtectionPlan = ({ price, currency = "AED" }: ProtectionPlanProps) => {
  const [enabled, setEnabled] = useState(false);
  const planPrice = Math.round(price * 0.15);

  return (
    <div className={`rounded-xl border p-4 transition-colors ${
      enabled ? "border-primary bg-primary/5" : "border-border"
    }`}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold">Extended Protection — 24 Months</h4>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Full protection <span className="font-medium text-foreground">(incl. accidental damage)</span> — covers drops, spills & extends warranty to 2 years
          </p>
        </div>
        <span className="text-sm font-bold whitespace-nowrap">{currency} {planPrice}</span>
      </div>
    </div>
  );
};

export default ProtectionPlan;

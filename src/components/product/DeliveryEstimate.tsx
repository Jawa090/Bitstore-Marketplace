import { Truck, Zap } from "lucide-react";
import { format, addDays } from "date-fns";

const DeliveryEstimate = () => {
  const now = new Date();
  const expressDate = format(addDays(now, 1), "EEE, dd MMM");
  const standardDate = `${format(addDays(now, 2), "dd MMM")} - ${format(addDays(now, 4), "dd MMM")}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
        <Zap className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Express Delivery</p>
          <p className="text-xs text-muted-foreground">Get it by {expressDate} — Dubai & Sharjah</p>
        </div>
        <span className="text-xs font-semibold text-primary">FREE</span>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
        <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Standard Delivery</p>
          <p className="text-xs text-muted-foreground">{standardDate} — All UAE Emirates</p>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">FREE</span>
      </div>
    </div>
  );
};

export default DeliveryEstimate;

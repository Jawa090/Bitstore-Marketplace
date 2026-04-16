import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Package, Store, ArrowRight } from "lucide-react";
import { CartItem } from "@/contexts/CartContext";

const EMIRATES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman",
  "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
];

interface ShippingData {
  emirate: string;
  address: string;
  landmark: string;
  phone: string;
  notes: string;
}

interface ShippingStepProps {
  data: ShippingData;
  onChange: (data: ShippingData) => void;
  onNext: () => void;
  itemsByVendor: Record<string, { vendorName: string; items: CartItem[] }>;
}

const ShippingStep = ({ data, onChange, onNext, itemsByVendor }: ShippingStepProps) => {
  const update = (field: keyof ShippingData, value: string) =>
    onChange({ ...data, [field]: value });

  const canProceed = data.emirate && data.address.trim().length > 5 && data.phone.trim().length >= 9;
  const vendorCount = Object.keys(itemsByVendor).length;

  return (
    <div className="space-y-6">
      {/* Delivery form */}
      <div className="rounded-xl border border-border p-5 sm:p-6 space-y-5 bg-card/50">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" /> Delivery Address
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Emirate *</Label>
            <Select value={data.emirate} onValueChange={(v) => update("emirate", v)}>
              <SelectTrigger><SelectValue placeholder="Select emirate" /></SelectTrigger>
              <SelectContent>
                {EMIRATES.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="+971 5X XXX XXXX"
                value={data.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Delivery Address *</Label>
          <Textarea
            placeholder="Building name, street, area..."
            value={data.address}
            onChange={(e) => update("address", e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Nearby Landmark (helps couriers)</Label>
          <Input
            placeholder="Near Mall of the Emirates, Carrefour, etc."
            value={data.landmark}
            onChange={(e) => update("landmark", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Order Notes (optional)</Label>
          <Textarea
            placeholder="Any special delivery instructions..."
            value={data.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* Shipment packages */}
      {vendorCount > 1 && (
        <div className="rounded-xl border border-border p-5 sm:p-6 space-y-4 bg-card/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> Shipment Packages
          </h2>
          <p className="text-sm text-muted-foreground">
            Your order contains items from {vendorCount} vendors. Each will ship separately.
          </p>
          {Object.entries(itemsByVendor).map(([vendorId, group], i) => (
            <div key={vendorId} className="rounded-lg border border-border/50 p-4 bg-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <Store className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Package {i + 1}: {group.vendorName}</span>
              </div>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.productId} className="text-sm text-muted-foreground flex justify-between">
                    <span className="truncate max-w-[250px]">{item.name} ×{item.quantity}</span>
                    <span>AED {(item.price * item.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <Button onClick={onNext} disabled={!canProceed} className="w-full h-12 text-base gap-2">
        Continue to Payment <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ShippingStep;

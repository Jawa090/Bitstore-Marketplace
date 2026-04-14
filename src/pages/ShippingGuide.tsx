import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import Navbar from "@/components/Navbar";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import { Truck, Clock, MapPin, Package, Shield, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShippingContent {
  title: string;
  subtitle: string;
  sections: { heading: string; body: string; icon?: string }[];
  delivery_zones: { zone: string; time: string; cost: string }[];
}

const fallback: ShippingContent = {
  title: "Shipping Guide",
  subtitle: "Everything you need to know about delivery across the UAE",
  sections: [
    { heading: "Free Delivery", body: "Enjoy free delivery on all orders above AED 200 across the UAE.", icon: "truck" },
    { heading: "Same-Day Delivery", body: "Orders placed before 2 PM in Dubai & Sharjah are eligible for same-day delivery.", icon: "clock" },
    { heading: "Packaging", body: "All items are securely packaged with tamper-proof seals to ensure safe delivery.", icon: "package" },
    { heading: "Tracking", body: "Track your order in real-time through your account dashboard or via SMS updates.", icon: "map-pin" },
  ],
  delivery_zones: [
    { zone: "Dubai", time: "Same day – 1 day", cost: "Free above AED 200" },
    { zone: "Abu Dhabi", time: "1 – 2 days", cost: "AED 15" },
    { zone: "Sharjah", time: "Same day – 1 day", cost: "Free above AED 200" },
    { zone: "Other Emirates", time: "2 – 3 days", cost: "AED 25" },
  ],
};

const iconMap: Record<string, React.ElementType> = { truck: Truck, clock: Clock, "map-pin": MapPin, package: Package, shield: Shield, help: HelpCircle };

const ShippingGuide = () => {
  const { data } = useStorefrontContent<ShippingContent>("page_shipping", fallback);
  const content = data?.content || fallback;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold font-display mb-2">{content.title}</h1>
          <p className="text-muted-foreground">{content.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {content.sections.map((s, i) => {
            const Icon = iconMap[s.icon || "truck"] || Truck;
            return (
              <Card key={i} className="bg-secondary/30 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" /> {s.heading}
                  </CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{s.body}</p></CardContent>
              </Card>
            );
          })}
        </div>

        <h2 className="text-xl font-semibold mb-4">Delivery Zones & Timelines</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-3 font-medium">Zone</th>
                <th className="text-left p-3 font-medium">Estimated Time</th>
                <th className="text-left p-3 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {content.delivery_zones.map((z, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-3">{z.zone}</td>
                  <td className="p-3 text-muted-foreground">{z.time}</td>
                  <td className="p-3 text-muted-foreground">{z.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <StorefrontFooter />
    </div>
  );
};

export default ShippingGuide;

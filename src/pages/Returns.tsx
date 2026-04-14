import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import Navbar from "@/components/Navbar";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, CheckCircle, XCircle, Clock } from "lucide-react";

interface ReturnsContent {
  title: string;
  subtitle: string;
  policy_sections: { heading: string; body: string }[];
  steps: { step: string; description: string }[];
  non_returnable: string[];
}

const fallback: ReturnsContent = {
  title: "Returns & Refunds",
  subtitle: "Our hassle-free return policy to ensure your complete satisfaction",
  policy_sections: [
    { heading: "7-Day Return Window", body: "Return any product within 7 days of delivery for a full refund. The item must be in its original condition with all accessories and packaging." },
    { heading: "Refund Timeline", body: "Refunds are processed within 3-5 business days after we receive and inspect the returned item. The amount will be credited to your original payment method." },
    { heading: "Exchange Option", body: "Prefer an exchange? We offer free exchanges for the same product in a different variant or a product of equal value." },
    { heading: "Damaged Products", body: "If you receive a damaged or defective product, contact us within 24 hours for an immediate replacement at no extra cost." },
  ],
  steps: [
    { step: "1", description: "Log into your account and go to Order History" },
    { step: "2", description: "Select the item you wish to return and choose a reason" },
    { step: "3", description: "Schedule a free pickup or drop off at any warehouse" },
    { step: "4", description: "Refund processed within 3-5 business days" },
  ],
  non_returnable: [
    "Screen protectors and tempered glass (once applied)",
    "SIM cards and prepaid vouchers",
    "Products with broken seals or missing accessories",
    "Items damaged by the customer",
  ],
};

const Returns = () => {
  const { data } = useStorefrontContent<ReturnsContent>("page_returns", fallback);
  const content = data?.content || fallback;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10 max-w-4xl">
        <div className="text-center mb-10">
          <RotateCcw className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-bold font-display mb-2">{content.title}</h1>
          <p className="text-muted-foreground">{content.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {content.policy_sections.map((s, i) => (
            <Card key={i} className="bg-secondary/30 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" /> {s.heading}
                </CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{s.body}</p></CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4">How to Return</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {content.steps.map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mx-auto mb-2">{s.step}</div>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><XCircle className="h-5 w-5 text-destructive" /> Non-Returnable Items</h2>
        <ul className="space-y-2 mb-6">
          {content.non_returnable.map((item, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground/50 shrink-0" /> {item}
            </li>
          ))}
        </ul>
      </div>
      <StorefrontFooter />
    </div>
  );
};

export default Returns;

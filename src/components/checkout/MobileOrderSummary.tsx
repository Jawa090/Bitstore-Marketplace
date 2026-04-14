import { useState } from "react";
import { ChevronUp, ChevronDown, ShieldCheck } from "lucide-react";
import { CartItem } from "@/contexts/CartContext";
import { PaymentMethod } from "./PaymentStep";
import { VAT_RATE } from "./OrderSummary";
import { cn } from "@/lib/utils";

interface MobileOrderSummaryProps {
  itemsByVendor: Record<string, { vendorName: string; items: CartItem[] }>;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  codFee: number;
}

const MobileOrderSummary = ({ itemsByVendor, totalAmount, paymentMethod, codFee }: MobileOrderSummaryProps) => {
  const [expanded, setExpanded] = useState(false);
  const vatAmount = +(totalAmount * VAT_RATE).toFixed(2);
  const appliedCodFee = paymentMethod === "cod" ? codFee : 0;
  const grandTotal = +(totalAmount + vatAmount + appliedCodFee).toFixed(2);
  const itemCount = Object.values(itemsByVendor).reduce((s, g) => s + g.items.reduce((a, i) => a + i.quantity, 0), 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-card/95 backdrop-blur-lg shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.5)]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">{itemCount} items</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">AED {grandTotal.toLocaleString()}</span>
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </button>

      <div className={cn(
        "overflow-hidden transition-all duration-300 border-t border-border/50",
        expanded ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="p-4 space-y-2 text-sm max-h-60 overflow-y-auto">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span><span>AED {totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>VAT (5%)</span><span>AED {vatAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span><span className="text-green-500">Free</span>
          </div>
          {appliedCodFee > 0 && (
            <div className="flex justify-between text-amber-400">
              <span>COD Fee</span><span>AED {appliedCodFee}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between font-bold">
            <span>Total</span><span className="text-primary">AED {grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileOrderSummary;

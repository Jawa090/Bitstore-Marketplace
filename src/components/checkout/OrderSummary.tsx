import { Store, ShieldCheck } from "lucide-react";
import { CartItem } from "@/contexts/CartContext";
import { PaymentMethod } from "./PaymentStep";

interface OrderSummaryProps {
  itemsByVendor: Record<string, { vendorName: string; items: CartItem[] }>;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  codFee: number;
}

const VAT_RATE = 0.05;

const OrderSummary = ({ itemsByVendor, totalAmount, paymentMethod, codFee }: OrderSummaryProps) => {
  const vatAmount = +(totalAmount * VAT_RATE).toFixed(2);
  const appliedCodFee = paymentMethod === "cod" ? codFee : 0;
  const grandTotal = +(totalAmount + vatAmount + appliedCodFee).toFixed(2);

  return (
    <div className="rounded-xl border border-border p-5 space-y-4 sticky top-24 bg-card/60 backdrop-blur-sm">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      {Object.entries(itemsByVendor).map(([vendorId, group]) => {
        const subtotal = group.items.reduce((s, i) => s + i.price * i.quantity, 0);
        return (
          <div key={vendorId} className="space-y-2 pb-3 border-b border-border/50 last:border-0">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Store className="h-3.5 w-3.5 text-primary" />
              {group.vendorName}
            </div>
            {group.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm text-muted-foreground">
                <span className="truncate max-w-[160px]">{item.name} ×{item.quantity}</span>
                <span>AED {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">AED {subtotal.toLocaleString()}</span>
            </div>
          </div>
        );
      })}

      <div className="space-y-2 pt-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>AED {totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>VAT (5%)</span>
          <span>AED {vatAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Shipping</span>
          <span className="text-green-500 font-medium">Free</span>
        </div>
        {appliedCodFee > 0 && (
          <div className="flex justify-between text-sm text-amber-400">
            <span>COD Fee</span>
            <span>AED {appliedCodFee}</span>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
        <span>Total</span>
        <span className="text-primary">AED {grandTotal.toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
        Secure checkout · Free returns within 7 days
      </div>
    </div>
  );
};

export { VAT_RATE };
export default OrderSummary;

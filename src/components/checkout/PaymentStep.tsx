import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, CreditCard, Banknote, Smartphone, Clock } from "lucide-react";

export type PaymentMethod = "card" | "cod" | "apple_google_pay" | "bnpl";

interface PaymentStepProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  onNext: () => void;
  onBack: () => void;
  codFee: number;
}

const methods: { id: PaymentMethod; label: string; desc: string; icon: typeof CreditCard; badge?: string }[] = [
  { id: "apple_google_pay", label: "Apple Pay / Google Pay", desc: "Fastest checkout experience", icon: Smartphone, badge: "Popular" },
  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, AMEX", icon: CreditCard },
  { id: "cod", label: "Cash on Delivery", desc: "+10 AED COD fee applies", icon: Banknote },
  { id: "bnpl", label: "Buy Now, Pay Later", desc: "Tabby · Tamara — Split in 4 payments", icon: Clock, badge: "Coming Soon" },
];

const PaymentStep = ({ selected, onSelect, onNext, onBack, codFee }: PaymentStepProps) => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border p-5 sm:p-6 space-y-4 bg-card/50">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" /> Payment Method
        </h2>

        <div className="space-y-3">
          {methods.map((m) => {
            const isSelected = selected === m.id;
            const isDisabled = m.id === "bnpl";
            return (
              <button
                key={m.id}
                onClick={() => !isDisabled && onSelect(m.id)}
                disabled={isDisabled}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-[0_0_20px_-6px_hsl(var(--primary)/0.3)]"
                    : "border-border/50 bg-card/40 hover:border-border",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{m.label}</span>
                    {m.badge && (
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        m.id === "bnpl"
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-primary border border-primary/20"
                      )}>
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                  isSelected ? "border-primary" : "border-border"
                )}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>

        {selected === "cod" && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-400">
            A COD fee of <strong>AED {codFee}</strong> will be added to your order total.
          </div>
        )}

        {(selected === "card" || selected === "apple_google_pay") && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm text-muted-foreground">
            You will be redirected to complete payment securely. No card info is stored on our servers.
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="flex-1 h-12 gap-2 text-base">
          Place Order <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaymentStep;

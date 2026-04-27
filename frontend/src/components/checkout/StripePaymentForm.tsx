import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StripePaymentFormProps {
  orderId: string;
  onBack: () => void;
}

/**
 * Renders Stripe's <PaymentElement /> and handles confirmPayment.
 * Must be rendered inside <Elements stripe={stripePromise} options={{ clientSecret }}>.
 *
 * IMPORTANT: The <Elements> wrapper must already have a non-null clientSecret before
 * this component mounts, otherwise the PaymentElement iframe will not initialise.
 */
export default function StripePaymentForm({ orderId, onBack }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Stripe.js hasn't loaded yet — bail silently (button is disabled in this state)
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation/${orderId}`,
      },
    });

    // confirmPayment only returns here when there is an immediate error.
    // On success, Stripe redirects to return_url and this code never runs.
    if (error) {
      toast({
        title: "Payment failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto mt-8 space-y-6">
      <div className="rounded-xl border border-border p-5 sm:p-6 space-y-5 bg-card/50">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" /> Secure Payment
        </h2>

        <p className="text-sm text-muted-foreground">
          Your payment is processed securely by Stripe. We never see or store your card details.
        </p>

        {/*
          bg-white + explicit min-height are critical: Stripe's iframe measures its
          container dimensions on mount. If the container has no background or zero height
          the iframe renders invisibly.
        */}
        <div className="w-full min-h-[200px] bg-white rounded-md p-4">
          <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 h-12 flex items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-background text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel Payment &amp; Edit Details
        </button>

        <button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="flex-1 h-12 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 disabled:opacity-50"
        >
          {isProcessing ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
          ) : (
            <><Lock className="w-4 h-4" /> Pay Now</>
          )}
        </button>
      </div>
    </form>
  );
}

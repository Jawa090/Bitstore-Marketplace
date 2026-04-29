import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/api/order.service";
import { paymentService } from "@/services/api/payment.service";
import Navbar from "@/components/Navbar";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import GuestCheckoutStep from "@/components/checkout/GuestCheckoutStep";
import ShippingStep from "@/components/checkout/ShippingStep";
import PaymentStep, { PaymentMethod } from "@/components/checkout/PaymentStep";
import OrderSummary from "@/components/checkout/OrderSummary";
import MobileOrderSummary from "@/components/checkout/MobileOrderSummary";
import StripePaymentForm from "@/components/checkout/StripePaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
if (!stripeKey) {
  console.error("CRITICAL: VITE_STRIPE_PUBLISHABLE_KEY is missing from frontend .env");
}
console.log("Stripe Key Loading Check:", stripeKey ? "Key Found" : "KEY MISSING");
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const COD_FEE = 10;

const Checkout = () => {
  const { user } = useAuth();
  const { items, itemsByVendor, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1 = guest auth, 2 = shipping, 3 = payment
  const [step, setStep] = useState(user ? 2 : 1);
  const [shipping, setShipping] = useState({
    emirate: "",
    address: "",
    landmark: "",
    phone: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("apple_google_pay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // If user logs in while on step 1, advance
  useEffect(() => {
    if (user && step === 1) setStep(2);
  }, [user, step]);

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && !isProcessing && !clientSecret) {
      navigate("/cart");
    }
  }, [items.length, isProcessing, clientSecret, navigate]);

  const handleGuestAuthenticated = () => {
    setStep(2);
  };

  // ── Place order via POST /api/orders ───────────────────────────────
  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        title: "Session expired",
        description: "Please log in again.",
        variant: "destructive",
      });
      setStep(1);
      return;
    }

    if (!shipping.address || !shipping.emirate || !shipping.phone) {
      toast({
        title: "Missing shipping info",
        description: "Please go back and fill in your delivery details.",
        variant: "destructive",
      });
      setStep(2);
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = await orderService.placeOrder({
        delivery_address: shipping.address,
        delivery_emirate: shipping.emirate,
        delivery_landmark: shipping.landmark || undefined,
        payment_method: paymentMethod,
        phone: shipping.phone,
        notes: shipping.notes || undefined,
      });

      const orderId = orderData.order.id;

      if (paymentMethod === "cod") {
        // COD: clear cart and go straight to confirmation
        await clearCart();
        toast({
          title: "Order placed!",
          description: "Thank you for your purchase.",
        });
        navigate(`/order-confirmation/${orderId}`);
      } else {
        // Card / Apple Pay: create a PaymentIntent and show Stripe form
        const paymentData = await paymentService.createPaymentIntent(orderId);
        
        if (!paymentData.clientSecret) {
          toast({
            title: "Checkout failed",
            description: "Failed to retrieve payment secret. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        
        setCreatedOrderId(orderId);
        setClientSecret(paymentData.clientSecret);
        setIsProcessing(false);
        // Cart is cleared after Stripe redirects back to /order-confirmation
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({
        title: "Checkout failed",
        description: err.displayMessage || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // ── Stripe payment screen (shown after order is created for card payments) ──
  if (clientSecret && createdOrderId && stripePromise) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-24 lg:pb-16 max-w-lg">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm
              orderId={createdOrderId}
              onBack={() => {
                setClientSecret(null);
                setCreatedOrderId(null);
              }}
            />
          </Elements>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-24 lg:pb-16">
        <CheckoutProgress currentStep={step} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && <GuestCheckoutStep onAuthenticated={handleGuestAuthenticated} />}
            {step === 2 && (
              <ShippingStep
                data={shipping}
                onChange={setShipping}
                onNext={() => setStep(3)}
                itemsByVendor={itemsByVendor}
              />
            )}
            {step === 3 && (
              <>
                <PaymentStep
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                  onNext={handlePlaceOrder}
                  onBack={() => setStep(2)}
                  codFee={COD_FEE}
                  isProcessing={isProcessing}
                />
                {isProcessing && (
                  <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                      <p className="font-medium">Processing your order...</p>
                      <p className="text-sm text-muted-foreground">Please do not close this page</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Desktop order summary - show on steps 2 & 3 */}
          {step >= 2 && (
            <div className="hidden lg:block lg:col-span-1">
              <OrderSummary
                itemsByVendor={itemsByVendor}
                totalAmount={totalAmount}
                paymentMethod={paymentMethod}
                codFee={COD_FEE}
              />
            </div>
          )}
        </div>
      </div>

      {step >= 2 && (
        <MobileOrderSummary
          itemsByVendor={itemsByVendor}
          totalAmount={totalAmount}
          paymentMethod={paymentMethod}
          codFee={COD_FEE}
        />
      )}

      <StorefrontFooter />
    </div>
  );
};

export default Checkout;

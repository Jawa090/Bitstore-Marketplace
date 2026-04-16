import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import GuestCheckoutStep from "@/components/checkout/GuestCheckoutStep";
import ShippingStep from "@/components/checkout/ShippingStep";
import PaymentStep, { PaymentMethod } from "@/components/checkout/PaymentStep";
import OrderSummary, { VAT_RATE } from "@/components/checkout/OrderSummary";
import MobileOrderSummary from "@/components/checkout/MobileOrderSummary";

const COD_FEE = 10;

const Checkout = () => {
  const { user } = useAuth();
  const { items, itemsByVendor, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1 = guest auth, 2 = shipping, 3 = payment
  const [step, setStep] = useState(user ? 2 : 1);
  const [shipping, setShipping] = useState({
    emirate: "", address: "", landmark: "", phone: "", notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("apple_google_pay");
  const [loading, setLoading] = useState(false);

  // If user logs in while on step 1, advance
  useEffect(() => {
    if (user && step === 1) setStep(2);
  }, [user, step]);

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleGuestAuthenticated = () => {
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    const currentUser = user || (await supabase.auth.getUser()).data.user;
    if (!currentUser) {
      toast({ title: "Session expired", description: "Please verify again.", variant: "destructive" });
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const vatAmount = +(totalAmount * VAT_RATE).toFixed(2);
      const codFee = paymentMethod === "cod" ? COD_FEE : 0;
      const grandTotal = +(totalAmount + vatAmount + codFee).toFixed(2);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: currentUser.id,
          total_amount: grandTotal,
          delivery_emirate: shipping.emirate,
          delivery_address: shipping.address,
          delivery_landmark: shipping.landmark || null,
          phone: shipping.phone || null,
          notes: shipping.notes || null,
        })
        .select("id")
        .single();

      if (orderError || !order) throw orderError || new Error("Failed to create order");

      for (const [vendorId, group] of Object.entries(itemsByVendor)) {
        const subtotal = group.items.reduce((s, i) => s + i.price * i.quantity, 0);

        const { data: subOrder, error: subError } = await supabase
          .from("sub_orders")
          .insert({ order_id: order.id, vendor_id: vendorId, subtotal })
          .select("id")
          .single();

        if (subError || !subOrder) throw subError || new Error("Failed to create sub-order");

        const orderItems = group.items.map((item) => ({
          sub_order_id: subOrder.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price,
        }));

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
        if (itemsError) throw itemsError;
      }

      clearCart();

      // Trigger fulfillment workflow asynchronously — don't block user
      supabase.functions
        .invoke("fulfill-order", { body: { order_id: order.id } })
        .then(({ error: fulfillErr }) => {
          if (fulfillErr) console.error("Fulfillment trigger error:", fulfillErr);
        });

      navigate(`/order-confirmation/${order.id}`);
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({ title: "Checkout failed", description: err?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-24 lg:pb-16">
        <CheckoutProgress currentStep={step} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <GuestCheckoutStep onAuthenticated={handleGuestAuthenticated} />
            )}
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
                />
                {loading && (
                  <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                      <p className="font-medium">Processing your order...</p>
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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Phone, ShieldCheck, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface GuestCheckoutStepProps {
  onAuthenticated: () => void;
}

const GuestCheckoutStep = ({ onAuthenticated }: GuestCheckoutStepProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = /^\+?971\s?\d{8,9}$/.test(phone.replace(/\s/g, "")) || phone.replace(/\s/g, "").length >= 10;

  const handleSendOtp = async () => {
    if (!isValidEmail || !isValidPhone) {
      toast({ title: "Invalid input", description: "Please enter a valid email and UAE phone number.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Format phone for Supabase (needs +971 format)
      let formattedPhone = phone.replace(/\s/g, "");
      if (!formattedPhone.startsWith("+")) {
        if (formattedPhone.startsWith("0")) formattedPhone = "+971" + formattedPhone.slice(1);
        else if (formattedPhone.startsWith("971")) formattedPhone = "+" + formattedPhone;
        else formattedPhone = "+971" + formattedPhone;
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: { email, guest_checkout: true },
        },
      });

      if (error) throw error;

      setOtpSent(true);
      toast({ title: "OTP Sent!", description: "Check your phone for the verification code." });
    } catch (err: any) {
      console.error("OTP error:", err);
      toast({
        title: "Could not send OTP",
        description: err?.message || "Please try again or sign in with your account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;

    setLoading(true);
    try {
      let formattedPhone = phone.replace(/\s/g, "");
      if (!formattedPhone.startsWith("+")) {
        if (formattedPhone.startsWith("0")) formattedPhone = "+971" + formattedPhone.slice(1);
        else if (formattedPhone.startsWith("971")) formattedPhone = "+" + formattedPhone;
        else formattedPhone = "+971" + formattedPhone;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });

      if (error) throw error;

      // Update profile with email
      if (data.user) {
        await supabase.from("profiles").upsert({
          user_id: data.user.id,
          email,
          phone: formattedPhone,
          phone_verified: true,
        }, { onConflict: "user_id" });
      }

      toast({ title: "Verified!", description: "Proceeding to checkout..." });
      onAuthenticated();
    } catch (err: any) {
      console.error("Verify error:", err);
      toast({
        title: "Verification failed",
        description: err?.message || "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Guest checkout card */}
      <div className="rounded-xl border border-border p-6 bg-card/50 space-y-5">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-1">Guest Checkout</h2>
          <p className="text-sm text-muted-foreground">
            No account needed — just verify your phone number
          </p>
        </div>

        {!otpSent ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guest-email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="guest-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-phone">Phone Number (UAE) *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="guest-phone"
                  type="tel"
                  placeholder="+971 5X XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              onClick={handleSendOtp}
              disabled={loading || !isValidEmail || !isValidPhone}
              className="w-full h-12 text-base gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              We'll send a 6-digit code to verify your phone
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Enter the 6-digit code sent to <span className="font-medium text-foreground">{phone}</span>
              </p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full h-12 text-base gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & Continue <ArrowRight className="w-4 h-4" /></>}
            </Button>

            <button
              onClick={() => { setOtpSent(false); setOtp(""); }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors w-full text-center"
            >
              Change phone number
            </button>
          </div>
        )}
      </div>

      {/* Or sign in */}
      <div className="text-center space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <Link to="/login" className="block">
          <Button variant="outline" className="w-full h-11">
            Sign in with your account
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default GuestCheckoutStep;

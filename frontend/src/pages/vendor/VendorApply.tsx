import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Store, ArrowLeft, Loader2, MapPin, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { applyForVendor } from "@/lib/api";

const EMIRATES = [
  "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain",
];

const VendorApply = () => {
  const { user, loading: authLoading, vendorStatus, vendor, refreshVendorStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [storeName, setStoreName] = useState("");
  const [emirate, setEmirate] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!storeName.trim() || !emirate) {
      toast({ title: "Missing fields", description: "Store name and emirate are required.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await applyForVendor({
        store_name: storeName.trim(),
        emirate,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        address: address || null,
        store_description: description || null,
      });
      
      // Refresh auth state to pick up the new pending vendor status
      await refreshVendorStatus();
      
      toast({ title: "Application submitted!", description: "We'll review your store and get back to you shortly." });
    } catch (error: any) {
      toast({ title: "Application failed", description: error.displayMessage || "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (vendorStatus === 'approved') {
    return <Navigate to="/vendor" replace />;
  }

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center pt-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center pt-16 p-4">
          <div className="text-center max-w-sm">
            <Store className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Become a Vendor</h1>
            <p className="text-muted-foreground mb-6">Sign in to apply as a vendor on BitStores.</p>
            <Link to="/login"><Button>Sign In</Button></Link>
          </div>
        </div>
      </>
    );
  }

  if (vendorStatus === "pending" || vendorStatus === "rejected" || vendorStatus === "suspended") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center pt-16 p-4">
          <div className="text-center max-w-sm">
            <Store className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Application {vendorStatus === "rejected" ? "Rejected" : vendorStatus === "suspended" ? "Suspended" : "Submitted"}</h1>
            <p className="text-muted-foreground mb-2">
              Your store {vendor?.store_name && <span className="text-primary font-medium">{vendor.store_name}</span>} is currently{" "}
              <span className="capitalize font-medium text-amber-500">{vendorStatus}</span>.
            </p>
            <p className="text-xs text-muted-foreground mt-4">We'll notify you once your application is reviewed.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-24 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-lg mx-auto"
        >
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Become a Vendor</h1>
              <p className="text-sm text-muted-foreground">Start selling on the UAE's #1 phone marketplace</p>
            </div>
          </div>

          <Card className="border-border">
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Store Name *</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="My Phone Store"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Emirate *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Select value={emirate} onValueChange={setEmirate} required>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select your emirate" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMIRATES.map((e) => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="shop@example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+971 5X XXX XXXX"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Store Address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop 12, Al Fahidi St, Bur Dubai"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Store Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about your store and what you sell..."
                    rows={3}
                  />
                </div>

                <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground space-y-1">
                  <p>✓ 10% commission on sales — no monthly fees</p>
                  <p>✓ You handle your own shipping within the UAE</p>
                  <p>✓ Applications reviewed within 24–48 hours</p>
                </div>
              </CardContent>

              <CardFooter className="px-6 pb-6">
                <Button type="submit" className="w-full h-11" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default VendorApply;

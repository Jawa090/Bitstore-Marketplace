import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Package, Store, ArrowRight, Plus, CheckCircle2, Loader2, Home } from "lucide-react";
import { CartItem } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAddresses, addAddress, updateUserProfile } from "@/lib/api";

const EMIRATES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman",
  "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
];

// Matches the backend Address entity exactly
interface SavedAddress {
  id: string;
  label: string;
  emirate: string;
  address: string;       // ← backend field is "address", NOT "address_line"
  landmark: string | null;
  phone: string | null;
  is_default: boolean;
  created_at: string;
}

export interface ShippingData {
  emirate: string;
  address: string;
  landmark: string;
  phone: string;
  notes: string;
}

interface ShippingStepProps {
  data: ShippingData;
  onChange: (data: ShippingData) => void;
  onNext: () => void;
  itemsByVendor: Record<string, { vendorName: string; items: CartItem[] }>;
}

const ShippingStep = ({ data, onChange, onNext, itemsByVendor }: ShippingStepProps) => {
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  // ── Saved addresses state ──────────────────────────────────────────
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(true);

  // ── New address form state ─────────────────────────────────────────
  const [showNewForm, setShowNewForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    label: "Home",
    emirate: "",
    phone: "",
    address: "",      // ← matches backend field name exactly
    landmark: "",
  });

  // ── Fetch saved addresses on mount ─────────────────────────────────
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await getAddresses();
        // Backend returns: { success, data: { addresses: [...] } }
        const addrs: SavedAddress[] = res.data?.data?.addresses || [];
        setSavedAddresses(addrs);

        if (addrs.length > 0) {
          // Auto-select default address, or the first one
          const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
          applyAddressToParent(defaultAddr);
        } else {
          // No saved addresses — show the new address form by default
          setShowNewForm(true);
        }
      } catch {
        // API error — show new address form as fallback
        setShowNewForm(true);
      } finally {
        setAddressLoading(false);
      }
    };
    loadAddresses();
  }, []);

  // ── Apply a saved address to the parent shipping state ─────────────
  const applyAddressToParent = (addr: SavedAddress) => {
    onChange({
      ...data,
      emirate: addr.emirate,
      address: addr.address,
      landmark: addr.landmark || "",
      phone: addr.phone || data.phone,
    });
  };

  // ── Select an existing address ─────────────────────────────────────
  const handleSelectAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setShowNewForm(false);
    applyAddressToParent(addr);
  };

  // ── Show new address form ──────────────────────────────────────────
  const handleShowNewForm = () => {
    setSelectedAddressId(null);
    setShowNewForm(true);
    // Clear parent shipping fields so validation reflects the new form
    onChange({ ...data, emirate: "", address: "", landmark: "", phone: data.phone });
  };

  // ── New form field updater ─────────────────────────────────────────
  const updateNewField = (field: keyof typeof newAddressForm, value: string) => {
    setNewAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Validation ─────────────────────────────────────────────────────
  const isNewFormValid =
    newAddressForm.label.trim().length > 0 &&
    newAddressForm.emirate.length > 0 &&
    newAddressForm.address.trim().length > 5 &&
    newAddressForm.phone.trim().length >= 9;

  // Main button: only enabled when an address is selected and form is closed
  const canProceed = selectedAddressId !== null && !showNewForm;

  // ── Save new address (form-specific action) ────────────────────────
  const handleSaveNewAddress = async () => {
    if (!isNewFormValid) return;
    setSaving(true);
    try {
      // Payload keys EXACTLY match backend: { label, emirate, address, landmark, phone }
      const payload = {
        label: newAddressForm.label,
        emirate: newAddressForm.emirate,
        address: newAddressForm.address,
        landmark: newAddressForm.landmark || null,
        phone: newAddressForm.phone,
      };

      // Fire address save + profile update simultaneously
      const [addrRes] = await Promise.all([
        addAddress(payload),
        updateUserProfile({
          phone: newAddressForm.phone,
          emirate: newAddressForm.emirate,
        }),
      ]);

      // Refresh global auth profile so Account page has fresh phone/emirate
      refreshUser();

      // Update the saved address in the parent shipping state
      onChange({
        ...data,
        emirate: newAddressForm.emirate,
        address: newAddressForm.address,
        landmark: newAddressForm.landmark,
        phone: newAddressForm.phone,
      });

      // Add the new address to saved list, auto-select it, close form
      const newAddr = addrRes.data?.data?.address;
      if (newAddr) {
        setSavedAddresses((prev) => [...prev, newAddr]);
        setSelectedAddressId(newAddr.id);
        setShowNewForm(false);
      }

      toast({ title: "Address saved", description: "Your new address is now selected." });
      // Do NOT call onNext() — user must click "Continue to Payment" themselves
    } catch (error: any) {
      toast({
        title: "Failed to save address",
        description: error.displayMessage || "Please check your inputs and try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel new address form ────────────────────────────────────────
  const handleCancelNewForm = () => {
    setShowNewForm(false);
    // Re-select the previous address
    const prev = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
    if (prev) {
      setSelectedAddressId(prev.id);
      applyAddressToParent(prev);
    }
  };

  // ── Proceed to payment (only when address is selected) ─────────────
  const handleProceed = () => {
    if (canProceed) onNext();
  };

  const vendorCount = Object.keys(itemsByVendor).length;

  // ── Loading state ──────────────────────────────────────────────────
  if (addressLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading your addresses…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Delivery Address Section ──────────────────────────────── */}
      <div className="rounded-xl border border-border p-5 sm:p-6 space-y-4 bg-card/50">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" /> Delivery Address
        </h2>

        {/* ── Saved Address Cards ──────────────────────────────────── */}
        {savedAddresses.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id && !showNewForm;
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelectAddress(addr)}
                  className={`relative text-left rounded-lg border-2 p-4 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-muted-foreground/40 bg-background"
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
                  )}
                  <div className="flex items-center gap-2 mb-1.5">
                    <Home className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {addr.label}
                    </span>
                    {addr.is_default && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground font-medium line-clamp-2">
                    {addr.address}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {addr.emirate}
                    {addr.landmark && ` · Near ${addr.landmark}`}
                  </p>
                  {addr.phone && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {addr.phone}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── "+ Add New Delivery Address" button ──────────────────── */}
        {!showNewForm && (
          <button
            type="button"
            onClick={handleShowNewForm}
            className="w-full rounded-lg border-2 border-dashed border-border p-4 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">Add New Delivery Address</span>
          </button>
        )}

        {/* ── New Address Form ─────────────────────────────────────── */}
        {showNewForm && (
          <div className="space-y-4 pt-3 border-t border-border mt-4">
            <h3 className="text-sm font-semibold text-foreground">New Delivery Address</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-addr-label">Label *</Label>
                <Input
                  id="new-addr-label"
                  placeholder="Home, Office, etc."
                  value={newAddressForm.label}
                  onChange={(e) => updateNewField("label", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Emirate *</Label>
                <Select
                  value={newAddressForm.emirate}
                  onValueChange={(v) => updateNewField("emirate", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select emirate" /></SelectTrigger>
                  <SelectContent>
                    {EMIRATES.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-addr-phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-addr-phone"
                  type="tel"
                  placeholder="+971 5X XXX XXXX"
                  value={newAddressForm.phone}
                  onChange={(e) => updateNewField("phone", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-addr-address">Delivery Address *</Label>
              <Textarea
                id="new-addr-address"
                placeholder="Building name, street, area..."
                value={newAddressForm.address}
                onChange={(e) => updateNewField("address", e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-addr-landmark">Nearby Landmark (helps couriers)</Label>
              <Input
                id="new-addr-landmark"
                placeholder="Near Mall of the Emirates, Carrefour, etc."
                value={newAddressForm.landmark}
                onChange={(e) => updateNewField("landmark", e.target.value)}
              />
            </div>

            {/* ── Form action buttons ─────────────────────────────── */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={handleSaveNewAddress}
                disabled={!isNewFormValid || saving}
                className="gap-2"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                ) : (
                  <>Save & Use Address</>
                )}
              </Button>
              {savedAddresses.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelNewForm}
                  disabled={saving}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Order Notes ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border p-5 sm:p-6 bg-card/50 space-y-3">
        <Label>Order Notes (optional)</Label>
        <Textarea
          placeholder="Any special delivery instructions..."
          value={data.notes}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={2}
        />
      </div>

      {/* ── Shipment Packages ────────────────────────────────────────── */}
      {vendorCount > 1 && (
        <div className="rounded-xl border border-border p-5 sm:p-6 space-y-4 bg-card/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> Shipment Packages
          </h2>
          <p className="text-sm text-muted-foreground">
            Your order contains items from {vendorCount} vendors. Each will ship separately.
          </p>
          {Object.entries(itemsByVendor).map(([vendorId, group], i) => (
            <div key={vendorId} className="rounded-lg border border-border/50 p-4 bg-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <Store className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Package {i + 1}: {group.vendorName}</span>
              </div>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.productId} className="text-sm text-muted-foreground flex justify-between">
                    <span className="truncate max-w-[250px]">{item.name} ×{item.quantity}</span>
                    <span>AED {(item.price * item.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ── Continue Button (hidden when new form is open) ────────────── */}
      {!showNewForm && (
        <Button
          onClick={handleProceed}
          disabled={!canProceed}
          className="w-full h-12 text-base gap-2"
        >
          Continue to Payment <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default ShippingStep;

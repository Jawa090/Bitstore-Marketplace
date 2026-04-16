import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useVendor } from "@/components/vendor/VendorGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VendorSettings = () => {
  const { vendor } = useVendor();
  const { user } = useAuth();
  const { toast } = useToast();

  const [storeName, setStoreName] = useState(vendor?.store_name ?? "");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const update = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("vendors")
        .update({
          store_name: storeName.trim(),
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
          address: address || null,
          store_description: description || null,
        })
        .eq("id", vendor!.id);
      if (error) throw error;
    },
    onSuccess: () => toast({ title: "Settings saved" }),
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Store Settings</h1>

      <div className="rounded-xl border border-border p-5 space-y-4">
        <div className="space-y-2">
          <Label>Store Name</Label>
          <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Contact Email</Label>
          <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="shop@example.com" />
        </div>
        <div className="space-y-2">
          <Label>Contact Phone</Label>
          <Input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+971 5X XXX XXXX" />
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Store address" />
        </div>
        <div className="space-y-2">
          <Label>Store Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <Button onClick={() => update.mutate()} disabled={update.isPending}>
          {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default VendorSettings;

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Save, Store, Globe, Mail, Phone, MapPin, Shield, Image, Users, Pencil, Eye, Ban, Check } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface StoreSettings {
  store_name: string;
  tagline: string;
  description: string;
  logo_url: string;
  favicon_url: string;
  primary_email: string;
  support_email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  country: string;
  region: string;
  currency: string;
  timezone: string;
  language: string;
  vat_number: string;
  trade_license: string;
  social_instagram: string;
  social_facebook: string;
  social_twitter: string;
  social_tiktok: string;
  vendor_applications_open: boolean;
  vendor_commission_default: number;
  vendor_auto_approve: boolean;
  maintenance_mode: boolean;
  cod_enabled: boolean;
  cod_fee: number;
  free_shipping_threshold: number;
}

const defaultSettings: StoreSettings = {
  store_name: "BitStores",
  tagline: "UAE's #1 Marketplace for Phones & Electronics",
  description: "Your trusted destination for buying and selling phones, electronics, and accessories in the UAE.",
  logo_url: "",
  favicon_url: "",
  primary_email: "info@bitstores.com",
  support_email: "support@bitstores.com",
  phone: "+971-XX-XXX-XXXX",
  whatsapp: "+971-XX-XXX-XXXX",
  address: "",
  city: "Dubai",
  country: "United Arab Emirates",
  region: "Dubai",
  currency: "AED",
  timezone: "Asia/Dubai",
  language: "en",
  vat_number: "",
  trade_license: "",
  social_instagram: "",
  social_facebook: "",
  social_twitter: "",
  social_tiktok: "",
  vendor_applications_open: true,
  vendor_commission_default: 10,
  vendor_auto_approve: false,
  maintenance_mode: false,
  cod_enabled: true,
  cod_fee: 10,
  free_shipping_threshold: 500,
};

const emirates = ["Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm Al Quwain"];
const timezones = ["Asia/Dubai", "Asia/Riyadh", "Asia/Kuwait", "Asia/Bahrain", "Asia/Qatar"];
const currencies = ["AED", "SAR", "KWD", "BHD", "QAR", "OMR", "USD"];

const AdminStoreSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [dirty, setDirty] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storefront_content")
        .select("*")
        .eq("id", "store_settings")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ["admin-vendors-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data?.content) {
      setSettings({ ...defaultSettings, ...(data.content as unknown as StoreSettings) });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (s: StoreSettings) => {
      const { error } = await supabase.from("storefront_content").upsert({
        id: "store_settings",
        content: s as any,
        is_active: true,
        updated_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      setDirty(false);
      toast.success("Store settings saved");
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const updateVendorStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("vendors").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors-list"] });
      toast.success("Vendor status updated");
    },
  });

  const update = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading settings…</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" /> Store Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Configure your store identity, region, payments & vendor management</p>
        </div>
        <Button onClick={() => saveMutation.mutate(settings)} disabled={!dirty || saveMutation.isPending}>
          <Save className="h-4 w-4 mr-2" /> {saveMutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general"><Store className="h-4 w-4 mr-1.5" /> General</TabsTrigger>
          <TabsTrigger value="contact"><Mail className="h-4 w-4 mr-1.5" /> Contact</TabsTrigger>
          <TabsTrigger value="region"><Globe className="h-4 w-4 mr-1.5" /> Region</TabsTrigger>
          <TabsTrigger value="payments"><Shield className="h-4 w-4 mr-1.5" /> Payments</TabsTrigger>
          <TabsTrigger value="vendors"><Users className="h-4 w-4 mr-1.5" /> Vendors</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" /> Brand Identity</CardTitle>
              <CardDescription>Your store name, logo, and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input value={settings.store_name} onChange={(e) => update("store_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input value={settings.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Short tagline…" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Store Description</Label>
                <Textarea value={settings.description} onChange={(e) => update("description", e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Store Logo</Label>
                  <ImageUpload value={settings.logo_url} onChange={(url) => update("logo_url", url)} folder="branding" />
                </div>
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <ImageUpload value={settings.favicon_url} onChange={(url) => update("favicon_url", url)} folder="branding" />
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-base font-semibold">Social Media Links</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Instagram</Label>
                    <Input value={settings.social_instagram} onChange={(e) => update("social_instagram", e.target.value)} placeholder="https://instagram.com/…" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Facebook</Label>
                    <Input value={settings.social_facebook} onChange={(e) => update("social_facebook", e.target.value)} placeholder="https://facebook.com/…" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Twitter / X</Label>
                    <Input value={settings.social_twitter} onChange={(e) => update("social_twitter", e.target.value)} placeholder="https://x.com/…" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">TikTok</Label>
                    <Input value={settings.social_tiktok} onChange={(e) => update("social_tiktok", e.target.value)} placeholder="https://tiktok.com/@…" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>Take your store offline temporarily for updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Visitors will see a "Coming Soon" page</p>
                </div>
                <Switch checked={settings.maintenance_mode} onCheckedChange={(v) => update("maintenance_mode", v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Contact Information</CardTitle>
              <CardDescription>How customers and vendors can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Primary Email</Label>
                  <Input type="email" value={settings.primary_email} onChange={(e) => update("primary_email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input type="email" value={settings.support_email} onChange={(e) => update("support_email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone Number</Label>
                  <Input value={settings.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+971-XX-XXX-XXXX" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input value={settings.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="+971-XX-XXX-XXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Business Address</Label>
                <Textarea value={settings.address} onChange={(e) => update("address", e.target.value)} rows={2} placeholder="Full business address…" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Region Tab */}
        <TabsContent value="region" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Region & Localization</CardTitle>
              <CardDescription>Currency, timezone, and location settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={settings.country} onChange={(e) => update("country", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>City / Emirate</Label>
                  <Select value={settings.region} onValueChange={(v) => update("region", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {emirates.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={settings.currency} onValueChange={(v) => update("currency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(v) => update("timezone", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {timezones.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>VAT / TRN Number</Label>
                  <Input value={settings.vat_number} onChange={(e) => update("vat_number", e.target.value)} placeholder="100XXXXXXXXX003" />
                </div>
                <div className="space-y-2">
                  <Label>Trade License Number</Label>
                  <Input value={settings.trade_license} onChange={(e) => update("trade_license", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Payment & Shipping</CardTitle>
              <CardDescription>Configure COD fees and shipping thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cash on Delivery (COD)</p>
                  <p className="text-sm text-muted-foreground">Allow customers to pay upon delivery</p>
                </div>
                <Switch checked={settings.cod_enabled} onCheckedChange={(v) => update("cod_enabled", v)} />
              </div>
              {settings.cod_enabled && (
                <div className="space-y-2">
                  <Label>COD Fee (AED)</Label>
                  <Input type="number" value={settings.cod_fee} onChange={(e) => update("cod_fee", +e.target.value)} />
                </div>
              )}
              <Separator />
              <div className="space-y-2">
                <Label>Free Shipping Threshold (AED)</Label>
                <Input type="number" value={settings.free_shipping_threshold} onChange={(e) => update("free_shipping_threshold", +e.target.value)} />
                <p className="text-xs text-muted-foreground">Orders above this amount get free shipping. Set to 0 to disable.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Vendor Settings</CardTitle>
              <CardDescription>Control vendor applications and defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Accept Vendor Applications</p>
                  <p className="text-sm text-muted-foreground">Allow new sellers to apply on the platform</p>
                </div>
                <Switch checked={settings.vendor_applications_open} onCheckedChange={(v) => update("vendor_applications_open", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Approve Vendors</p>
                  <p className="text-sm text-muted-foreground">Skip manual review for new vendor applications</p>
                </div>
                <Switch checked={settings.vendor_auto_approve} onCheckedChange={(v) => update("vendor_auto_approve", v)} />
              </div>
              <div className="space-y-2">
                <Label>Default Commission Rate (%)</Label>
                <Input type="number" min={0} max={100} value={settings.vendor_commission_default} onChange={(e) => update("vendor_commission_default", +e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Stores</CardTitle>
              <CardDescription>Manage all registered vendor stores</CardDescription>
            </CardHeader>
            <CardContent>
              {vendors && vendors.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store Name</TableHead>
                      <TableHead>Emirate</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {v.logo_url && <img src={v.logo_url} alt="" className="h-8 w-8 rounded object-cover" />}
                            <div>
                              <p className="font-medium">{v.store_name}</p>
                              <p className="text-xs text-muted-foreground">{v.contact_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{v.emirate}</TableCell>
                        <TableCell>{v.commission_rate}%</TableCell>
                        <TableCell>
                          <Badge variant={v.status === "approved" ? "default" : v.status === "pending" ? "secondary" : "destructive"}>
                            {v.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {v.status !== "approved" && (
                            <Button size="sm" variant="ghost" onClick={() => updateVendorStatus.mutate({ id: v.id, status: "approved" })}>
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {v.status !== "suspended" && (
                            <Button size="sm" variant="ghost" onClick={() => updateVendorStatus.mutate({ id: v.id, status: "suspended" })}>
                              <Ban className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No vendors registered yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStoreSettings;

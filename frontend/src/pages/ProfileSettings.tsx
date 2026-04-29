import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Phone, MapPin, Plus, Pencil, Trash2, Loader2, Star, Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  updateUserProfile, uploadProfilePicture,
  getAddresses, addAddress, updateAddress, deleteAddress,
} from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────
interface Address {
  id: string;
  label: string;
  emirate: string;
  address: string;
  landmark: string | null;
  phone: string | null;
  is_default: boolean;
  created_at: string;
}

const EMIRATES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman",
  "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
];

const emptyAddressForm = {
  label: "", emirate: "", address: "", landmark: "", phone: "", is_default: false,
};

// ── Component ─────────────────────────────────────────────────────────
const ProfileSettings = () => {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect guests — only after session restoration completes
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // ── Avatar upload ─────────────────────────────────────────────────
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      await uploadProfilePicture(file);
      await refreshUser(); // syncs Navbar + header instantly
      toast({ title: "Profile picture updated" });
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.displayMessage || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAvatarUploading(false);
      // reset so the same file can be re-selected if needed
      e.target.value = "";
    }
  };

  // ── Account form ──────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    display_name: user?.full_name ?? "",
    phone: user?.phone ?? "",
    emirate: user?.emirate ?? "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        display_name: user.full_name ?? "",
        phone: user.phone ?? "",
        emirate: user.emirate ?? "",
      });
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateUserProfile({
        display_name: profileForm.display_name || undefined,
        phone: profileForm.phone || null,
        emirate: profileForm.emirate || null,
      });
      await refreshUser();
      toast({ title: "Profile updated successfully" });
    } catch (err: any) {
      toast({
        title: "Failed to update profile",
        description: err.displayMessage || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Addresses ─────────────────────────────────────────────────────
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [addrDialogOpen, setAddrDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addrForm, setAddrForm] = useState(emptyAddressForm);
  const [addrSaving, setAddrSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data.data.addresses);
    } catch {
      /* silently ignore */
    } finally {
      setAddrLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  // Re-fetch addresses when user navigates back to this tab/page
  useEffect(() => {
    const handleFocus = () => fetchAddresses();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const openAddDialog = () => {
    setEditingAddress(null);
    setAddrForm(emptyAddressForm);
    setAddrDialogOpen(true);
  };

  const openEditDialog = (addr: Address) => {
    setEditingAddress(addr);
    setAddrForm({
      label: addr.label,
      emirate: addr.emirate,
      address: addr.address,
      landmark: addr.landmark ?? "",
      phone: addr.phone ?? "",
      is_default: addr.is_default,
    });
    setAddrDialogOpen(true);
  };

  const handleAddrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.label || !addrForm.emirate || !addrForm.address) {
      toast({ title: "Label, emirate and address are required.", variant: "destructive" });
      return;
    }
    setAddrSaving(true);
    try {
      const payload = {
        label: addrForm.label,
        emirate: addrForm.emirate,
        address: addrForm.address,
        landmark: addrForm.landmark || null,
        phone: addrForm.phone || null,
        is_default: addrForm.is_default,
      };
      if (editingAddress) {
        await updateAddress(editingAddress.id, payload);
        toast({ title: "Address updated" });
      } else {
        await addAddress(payload);
        toast({ title: "Address added" });
      }
      setAddrDialogOpen(false);
      await fetchAddresses();
    } catch (err: any) {
      toast({
        title: "Failed to save address",
        description: err.displayMessage || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAddress(id);
      toast({ title: "Address deleted" });
      await fetchAddresses();
    } catch (err: any) {
      toast({ title: "Failed to delete address", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
  if (!user) return null;

  const initials = (user.full_name || user.email)[0].toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* ── Page Header ─────────────────────────────────────────── */}
          <div className="flex items-center gap-4 mb-8">
            {/* Clickable avatar with camera overlay */}
            <button
              type="button"
              className="relative group shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => !avatarUploading && avatarInputRef.current?.click()}
              aria-label="Change profile picture"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-full object-cover border-2 border-primary/30"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary">
                  {initials}
                </div>
              )}

              {/* Hover / loading overlay */}
              <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-opacity ${avatarUploading ? "bg-black/50 opacity-100" : "bg-black/40 opacity-0 group-hover:opacity-100"}`}>
                {avatarUploading
                  ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                  : <Camera className="h-5 w-5 text-white" />}
              </div>
            </button>

            {/* Hidden file input */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <div>
              <h1 className="text-2xl font-bold text-foreground">{user.full_name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* ── Tabs ─────────────────────────────────────────────────── */}
          <Tabs defaultValue="account">
            <TabsList className="mb-6">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Account
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Addresses
              </TabsTrigger>
            </TabsList>

            {/* ── ACCOUNT TAB ─────────────────────────────────────────── */}
            <TabsContent value="account">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSave} className="space-y-5">
                    {/* Display Name */}
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="display_name"
                          value={profileForm.display_name}
                          onChange={(e) =>
                            setProfileForm((p) => ({ ...p, display_name: e.target.value }))
                          }
                          className="pl-10"
                          placeholder="Your display name"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (UAE)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm((p) => ({ ...p, phone: e.target.value }))
                          }
                          className="pl-10"
                          placeholder="+971 5X XXX XXXX"
                        />
                      </div>
                    </div>

                    {/* Emirate */}
                    <div className="space-y-2">
                      <Label>Emirate</Label>
                      <Select
                        value={profileForm.emirate}
                        onValueChange={(v) =>
                          setProfileForm((p) => ({ ...p, emirate: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your emirate" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMIRATES.map((e) => (
                            <SelectItem key={e} value={e}>{e}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-2">
                      <Button type="submit" disabled={profileSaving} className="h-10 px-6">
                        {profileSaving
                          ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
                          : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── ADDRESSES TAB ───────────────────────────────────────── */}
            <TabsContent value="addresses">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Your Addresses</h2>
                  <Button size="sm" onClick={openAddDialog} className="gap-2">
                    <Plus className="h-4 w-4" /> Add New Address
                  </Button>
                </div>

                {addrLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : addresses.length === 0 ? (
                  <Card className="border-border/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <MapPin className="h-10 w-10 text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
                      <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={openAddDialog}>
                        <Plus className="h-4 w-4" /> Add your first address
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addresses.map((addr) => (
                      <Card key={addr.id} className={`border-border/50 transition-shadow hover:shadow-md ${addr.is_default ? "ring-1 ring-primary/40" : ""}`}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{addr.label}</span>
                              {addr.is_default && (
                                <Badge variant="secondary" className="text-[10px] gap-1 py-0">
                                  <Star className="h-3 w-3" /> Default
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost" size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => openEditDialog(addr)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                disabled={deletingId === addr.id}
                                onClick={() => handleDeleteAddress(addr.id)}
                              >
                                {deletingId === addr.id
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <Trash2 className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {addr.address}
                            {addr.landmark && `, ${addr.landmark}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{addr.emirate}</p>
                          {addr.phone && (
                            <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Address Dialog */}
              <Dialog open={addrDialogOpen} onOpenChange={setAddrDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAddress ? "Edit Address" : "Add New Address"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddrSubmit} className="space-y-4 mt-2">
                    {/* Label */}
                    <div className="space-y-2">
                      <Label htmlFor="addr-label">Label</Label>
                      <Input
                        id="addr-label"
                        placeholder="e.g. Home, Work, Office"
                        value={addrForm.label}
                        onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Emirate */}
                    <div className="space-y-2">
                      <Label>Emirate</Label>
                      <Select
                        value={addrForm.emirate}
                        onValueChange={(v) => setAddrForm((f) => ({ ...f, emirate: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select emirate" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMIRATES.map((e) => (
                            <SelectItem key={e} value={e}>{e}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="addr-address">Street Address</Label>
                      <Input
                        id="addr-address"
                        placeholder="Building, street, area"
                        value={addrForm.address}
                        onChange={(e) => setAddrForm((f) => ({ ...f, address: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Landmark */}
                    <div className="space-y-2">
                      <Label htmlFor="addr-landmark">Landmark <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        id="addr-landmark"
                        placeholder="Near mall, mosque, etc."
                        value={addrForm.landmark}
                        onChange={(e) => setAddrForm((f) => ({ ...f, landmark: e.target.value }))}
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="addr-phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        id="addr-phone"
                        type="tel"
                        placeholder="+971 5X XXX XXXX"
                        value={addrForm.phone}
                        onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value }))}
                      />
                    </div>

                    {/* Default toggle */}
                    <div className="flex items-center gap-3 pt-1">
                      <Switch
                        id="addr-default"
                        checked={addrForm.is_default}
                        onCheckedChange={(v) => setAddrForm((f) => ({ ...f, is_default: v }))}
                      />
                      <Label htmlFor="addr-default" className="cursor-pointer">
                        Set as default address
                      </Label>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setAddrDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1" disabled={addrSaving}>
                        {addrSaving
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : editingAddress ? "Save Changes" : "Add Address"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSettings;

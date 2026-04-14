import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVendor } from "@/components/vendor/VendorGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload, X, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "used_like_new", label: "Used — Like New" },
  { value: "used_good", label: "Used — Good" },
  { value: "used_fair", label: "Used — Fair" },
  { value: "refurbished", label: "Refurbished" },
];

const STEPS = [
  { id: 0, label: "Basic Info" },
  { id: 1, label: "Specs" },
  { id: 2, label: "Images" },
  { id: 3, label: "SEO & Review" },
];

const MOCK_SPECS: Record<string, Partial<Record<string, string>>> = {
  "iphone 16 pro max": { ram: "8 GB", storage: "256 GB", camera: "48 MP + 12 MP + 12 MP", battery: "4685 mAh", display_size: "6.9 inch", processor: "A18 Pro", os: "iOS 18" },
  "samsung galaxy s24 ultra": { ram: "12 GB", storage: "256 GB", camera: "200 MP + 50 MP + 12 MP + 10 MP", battery: "5000 mAh", display_size: "6.8 inch", processor: "Snapdragon 8 Gen 3", os: "Android 14" },
  "google pixel 9 pro": { ram: "16 GB", storage: "128 GB", camera: "50 MP + 48 MP + 48 MP", battery: "5060 mAh", display_size: "6.3 inch", processor: "Tensor G4", os: "Android 14" },
};

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { vendor } = useVendor();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    name: "", brand: "", slug: "", price: "", original_price: "",
    condition: "new", stock_quantity: "0",
    ram: "", storage: "", camera: "", battery: "", display_size: "",
    processor: "", os: "", color: "", warranty_months: "",
    description: "", meta_title: "", meta_description: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; image_url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useQuery({
    queryKey: ["vendor-product-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, images:product_images(id, image_url)").eq("id", id!).single();
      if (error) throw error;
      setForm({
        name: data.name, brand: data.brand, slug: data.slug,
        price: String(data.price), original_price: data.original_price ? String(data.original_price) : "",
        condition: data.condition, stock_quantity: String(data.stock_quantity),
        ram: data.ram ?? "", storage: data.storage ?? "", camera: data.camera ?? "",
        battery: data.battery ?? "", display_size: data.display_size ?? "",
        processor: data.processor ?? "", os: data.os ?? "", color: data.color ?? "",
        warranty_months: data.warranty_months ? String(data.warranty_months) : "",
        description: data.description ?? "", meta_title: data.meta_title ?? "", meta_description: data.meta_description ?? "",
      });
      setExistingImages(data.images ?? []);
      return data;
    },
    enabled: isEditing,
  });

  const setField = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleNameChange = (name: string) => {
    setField("name", name);
    if (!isEditing) setField("slug", name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const handleAiFill = () => {
    setAiLoading(true);
    setTimeout(() => {
      const key = form.name.toLowerCase().trim();
      const match = Object.entries(MOCK_SPECS).find(([k]) => key.includes(k));
      if (match) {
        const specs = match[1];
        Object.entries(specs).forEach(([k, v]) => { if (v) setField(k, v); });
        toast({ title: "Specs auto-filled!", description: `Found specs for ${match[0]}` });
      } else {
        toast({ title: "No match found", description: "Try a recognized model name (e.g. iPhone 16 Pro Max)", variant: "destructive" });
      }
      setAiLoading(false);
    }, 1200);
  };

  const handleSubmit = async () => {
    if (!vendor) return;
    if (!form.name || !form.brand || !form.slug || !form.price) {
      toast({ title: "Missing required fields", description: "Fill in name, brand, slug, and price.", variant: "destructive" });
      setStep(0);
      return;
    }
    setLoading(true);
    try {
      const productData = {
        vendor_id: vendor.id,
        name: form.name.trim(), brand: form.brand.trim(), slug: form.slug.trim(),
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        condition: form.condition as any,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        ram: form.ram || null, storage: form.storage || null, camera: form.camera || null,
        battery: form.battery || null, display_size: form.display_size || null,
        processor: form.processor || null, os: form.os || null, color: form.color || null,
        warranty_months: form.warranty_months ? parseInt(form.warranty_months) : null,
        description: form.description || null,
        meta_title: form.meta_title || null, meta_description: form.meta_description || null,
      };

      let productId = id;
      if (isEditing) {
        const { error } = await supabase.from("products").update(productData).eq("id", id!);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(productData).select("id").single();
        if (error) throw error;
        productId = data.id;
      }

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const filePath = `${vendor.id}/${productId}/${Date.now()}-${file.name}`;
        const { error: uploadErr } = await supabase.storage.from("product-images").upload(filePath, file);
        if (uploadErr) continue;
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
        await supabase.from("product_images").insert({
          product_id: productId!, image_url: urlData.publicUrl,
          is_primary: existingImages.length === 0 && i === 0, display_order: existingImages.length + i,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      toast({ title: isEditing ? "Product updated" : "Product created" });
      navigate("/vendor/products");
    } catch (err: any) {
      toast({ title: "Error", description: err?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const removeExistingImage = async (imgId: string) => {
    await supabase.from("product_images").delete().eq("id", imgId);
    setExistingImages((prev) => prev.filter((i) => i.id !== imgId));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/vendor/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h1>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => setStep(s.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                step === s.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="h-5 w-5 rounded-full border flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="iPhone 16 Pro Max 256GB" required />
              </div>
              <div className="space-y-2">
                <Label>Brand *</Label>
                <Input value={form.brand} onChange={(e) => setField("brand", e.target.value)} placeholder="Apple" required />
              </div>
              <div className="space-y-2">
                <Label>URL Slug *</Label>
                <Input value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="iphone-16-pro-max" required />
              </div>
              <div className="space-y-2">
                <Label>Price (AED) *</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setField("price", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Original Price (AED)</Label>
                <Input type="number" step="0.01" value={form.original_price} onChange={(e) => setField("original_price", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={(v) => setField("condition", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CONDITIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input type="number" value={form.stock_quantity} onChange={(e) => setField("stock_quantity", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Specs */}
      {step === 1 && (
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Technical Specs</h3>
              <Button variant="outline" size="sm" onClick={handleAiFill} disabled={aiLoading || !form.name} className="gap-1.5">
                {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-primary" />}
                AI Auto-Fill
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: "ram", label: "RAM", ph: "8 GB" }, { key: "storage", label: "Storage", ph: "256 GB" },
                { key: "camera", label: "Camera", ph: "48 MP + 12 MP" }, { key: "battery", label: "Battery", ph: "4685 mAh" },
                { key: "display_size", label: "Display", ph: "6.9 inch" }, { key: "processor", label: "Processor", ph: "A18 Pro" },
                { key: "os", label: "OS", ph: "iOS 18" }, { key: "color", label: "Color", ph: "Desert Titanium" },
                { key: "warranty_months", label: "Warranty (months)", ph: "12" },
              ].map((spec) => (
                <div key={spec.key} className="space-y-2">
                  <Label>{spec.label}</Label>
                  <Input value={(form as any)[spec.key]} onChange={(e) => setField(spec.key, e.target.value)} placeholder={spec.ph} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Images */}
      {step === 2 && (
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Product Images</h3>
            {existingImages.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative h-24 w-24 rounded-lg overflow-hidden border border-border group">
                    <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute inset-0 bg-destructive/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-5 w-5 text-destructive-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Drag & drop or click to upload</span>
              <span className="text-[11px] text-muted-foreground">Background Remover coming soon</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                if (e.target.files) setImageFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
              }} />
            </label>
            {imageFiles.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {imageFiles.map((f, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border group">
                    <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute inset-0 bg-destructive/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4 text-destructive-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: SEO & Review */}
      {step === 3 && (
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">SEO & Final Review</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input value={form.meta_title} onChange={(e) => setField("meta_title", e.target.value)} placeholder="Buy iPhone 16 Pro Max in UAE" />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={form.meta_description} onChange={(e) => setField("meta_description", e.target.value)} rows={2} />
              </div>
            </div>

            {/* Quick summary */}
            <div className="rounded-lg bg-secondary/50 p-4 text-sm space-y-2 mt-4">
              <h4 className="font-medium text-foreground">Summary</h4>
              <div className="grid grid-cols-2 gap-y-1 text-muted-foreground">
                <span>Name:</span><span className="text-foreground">{form.name || "—"}</span>
                <span>Brand:</span><span className="text-foreground">{form.brand || "—"}</span>
                <span>Price:</span><span className="text-foreground">AED {form.price || "—"}</span>
                <span>Stock:</span><span className="text-foreground">{form.stock_quantity}</span>
                <span>Condition:</span><span className="text-foreground capitalize">{form.condition.replace(/_/g, " ")}</span>
                <span>Images:</span><span className="text-foreground">{existingImages.length + imageFiles.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} className="min-w-[140px]">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? "Save Changes" : "Publish Product"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductForm;

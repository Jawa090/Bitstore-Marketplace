import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CalendarIcon, Image, ExternalLink, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/admin/ImageUpload";

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  bg_color: string;
  text_color: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  display_order: number;
}

const emptyBanner: Omit<PromoBanner, "id"> = {
  title: "",
  subtitle: "",
  image_url: "",
  link_url: "",
  bg_color: "#1e293b",
  text_color: "#ffffff",
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 7 * 86400000).toISOString(),
  is_active: true,
  display_order: 0,
};

function DatePicker({ date, onSelect, label }: { date: Date; onSelect: (d: Date) => void; label: string }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && onSelect(d)}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function getStatus(banner: PromoBanner): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (!banner.is_active) return { label: "Disabled", variant: "secondary" };
  const now = new Date();
  const start = new Date(banner.start_date);
  const end = new Date(banner.end_date);
  if (now < start) return { label: "Scheduled", variant: "outline" };
  if (now > end) return { label: "Expired", variant: "destructive" };
  return { label: "Live", variant: "default" };
}

export default function AdminPromoBanners() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PromoBanner | null>(null);
  const [form, setForm] = useState<Omit<PromoBanner, "id">>(emptyBanner);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["promo-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as PromoBanner[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (banner: Omit<PromoBanner, "id"> & { id?: string }) => {
      if (banner.id) {
        const { id, ...rest } = banner;
        const { error } = await supabase.from("promo_banners").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promo_banners").insert(banner);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promo-banners"] });
      toast.success(editing ? "Banner updated" : "Banner created");
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promo_banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promo-banners"] });
      toast.success("Banner deleted");
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyBanner, display_order: banners.length });
    setDialogOpen(true);
  };

  const openEdit = (b: PromoBanner) => {
    setEditing(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle || "",
      image_url: b.image_url || "",
      link_url: b.link_url || "",
      bg_color: b.bg_color,
      text_color: b.text_color,
      start_date: b.start_date,
      end_date: b.end_date,
      is_active: b.is_active,
      display_order: b.display_order,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return toast.error("Title is required");
    saveMutation.mutate(editing ? { ...form, id: editing.id } : form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promo Banners</h1>
          <p className="text-muted-foreground">Schedule promotional banners that auto-show/hide based on dates</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Banner</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : banners.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No promo banners yet. Create your first one!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => {
            const status = getStatus(b);
            return (
              <Card key={b.id} className="overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
                  {b.image_url ? (
                    <img src={b.image_url} alt={b.title} className="h-16 w-28 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="h-16 w-28 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: b.bg_color }}>
                      <Image className="h-6 w-6" style={{ color: b.text_color }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{b.title}</h3>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(b.start_date), "MMM d, yyyy")} → {format(new Date(b.end_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(b.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Banner" : "New Promo Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Summer Sale — Up to 50% Off!" />
            </div>
            <div className="space-y-1">
              <Label>Subtitle</Label>
              <Input value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Limited time offer on all smartphones" />
            </div>

            <div className="space-y-1">
              <Label>Banner Image</Label>
              <ImageUpload
                folder="promo-banners"
                value={form.image_url || ""}
                onChange={(url) => setForm({ ...form, image_url: url })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Link URL</Label>
                <Input value={form.link_url || ""} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="/search?brand=Apple" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>BG Color</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} className="h-10 w-10 rounded cursor-pointer" />
                    <Input value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.text_color} onChange={(e) => setForm({ ...form, text_color: e.target.value })} className="h-10 w-10 rounded cursor-pointer" />
                    <Input value={form.text_color} onChange={(e) => setForm({ ...form, text_color: e.target.value })} className="flex-1" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DatePicker label="Start Date" date={new Date(form.start_date)} onSelect={(d) => setForm({ ...form, start_date: d.toISOString() })} />
              <DatePicker label="End Date" date={new Date(form.end_date)} onSelect={(d) => setForm({ ...form, end_date: d.toISOString() })} />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>

            {/* Preview */}
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: form.bg_color }}>
              {form.image_url ? (
                <div className="relative h-32">
                  <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center" style={{ color: form.text_color }}>
                      <p className="font-bold text-lg">{form.title || "Banner Title"}</p>
                      {form.subtitle && <p className="text-sm opacity-80">{form.subtitle}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center" style={{ color: form.text_color }}>
                  <div className="text-center">
                    <p className="font-bold text-lg">{form.title || "Banner Title"}</p>
                    {form.subtitle && <p className="text-sm opacity-80">{form.subtitle}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

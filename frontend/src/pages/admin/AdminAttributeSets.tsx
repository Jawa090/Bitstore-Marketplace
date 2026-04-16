import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Layers, Plus, Trash2, X, GripVertical } from "lucide-react";

interface FieldDef {
  name: string;
  type: "text" | "number" | "select";
  options?: string[];
  required: boolean;
}

const DEFAULT_TEMPLATES: Record<string, FieldDef[]> = {
  Phone: [
    { name: "RAM", type: "text", required: true },
    { name: "Storage", type: "text", required: true },
    { name: "Battery", type: "text", required: false },
    { name: "Camera", type: "text", required: false },
    { name: "Display Size", type: "text", required: false },
    { name: "Processor", type: "text", required: false },
    { name: "OS", type: "text", required: false },
  ],
  Tablet: [
    { name: "RAM", type: "text", required: true },
    { name: "Storage", type: "text", required: true },
    { name: "Display Size", type: "text", required: true },
    { name: "Battery", type: "text", required: false },
    { name: "Processor", type: "text", required: false },
  ],
  Case: [
    { name: "Material", type: "text", required: true },
    { name: "Color", type: "text", required: true },
    { name: "Compatible Models", type: "text", required: true },
  ],
  Accessory: [
    { name: "Type", type: "text", required: true },
    { name: "Compatibility", type: "text", required: false },
    { name: "Color", type: "text", required: false },
  ],
};

const AdminAttributeSets = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formFields, setFormFields] = useState<FieldDef[]>([{ name: "", type: "text", required: false }]);

  const { data: sets = [] } = useQuery({
    queryKey: ["attribute-sets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attribute_sets")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createSet = useMutation({
    mutationFn: async () => {
      const cleanFields = formFields.filter((f) => f.name.trim());
      if (cleanFields.length === 0) throw new Error("Add at least one field");
      const { error } = await supabase.from("attribute_sets").insert({
        name: formName,
        category: formCategory,
        fields: cleanFields as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attribute-sets"] });
      setShowForm(false);
      setFormName(""); setFormCategory(""); setFormFields([{ name: "", type: "text", required: false }]);
      toast({ title: "Attribute set created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleSet = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("attribute_sets").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attribute-sets"] }),
  });

  const deleteSet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("attribute_sets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attribute-sets"] });
      toast({ title: "Attribute set deleted" });
    },
  });

  const loadTemplate = (cat: string) => {
    const tpl = DEFAULT_TEMPLATES[cat];
    if (tpl) {
      setFormFields([...tpl]);
      setFormCategory(cat);
      setFormName(`${cat} Specs`);
    }
  };

  const addField = () => setFormFields((f) => [...f, { name: "", type: "text", required: false }]);
  const removeField = (idx: number) => setFormFields((f) => f.filter((_, i) => i !== idx));
  const updateField = (idx: number, updates: Partial<FieldDef>) => {
    setFormFields((f) => f.map((field, i) => i === idx ? { ...field, ...updates } : field));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Attribute Sets</h1>
          <p className="text-sm text-muted-foreground">Create specs templates for different product types (Phone, Case, etc.)</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>

      {showForm && (
        <Card className="glass border-primary/30">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-muted-foreground">Quick start from template:</p>
              {Object.keys(DEFAULT_TEMPLATES).map((t) => (
                <Button key={t} size="sm" variant="outline" className="text-xs h-7" onClick={() => loadTemplate(t)}>
                  {t}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Template Name (e.g., Phone Specs)" value={formName} onChange={(e) => setFormName(e.target.value)} />
              <Input placeholder="Category (e.g., Phone, Case)" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Fields</p>
              {formFields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                  <Input
                    placeholder="Field name (e.g., RAM)"
                    value={field.name}
                    onChange={(e) => updateField(idx, { name: e.target.value })}
                    className="flex-1 h-8 text-sm"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(idx, { required: e.target.checked })}
                      className="rounded"
                    />
                    Required
                  </label>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeField(idx)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={addField}>
                <Plus className="h-3 w-3 mr-1" /> Add Field
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => createSet.mutate()} disabled={!formName || !formCategory}>
                Save Template
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {sets.map((s: any) => {
          const fields = Array.isArray(s.fields) ? s.fields as FieldDef[] : [];
          return (
            <Card key={s.id} className={`glass border-border/50 ${!s.is_active ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Layers className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Category: {s.category} · {fields.length} fields</p>
                  </div>
                  <Switch checked={s.is_active} onCheckedChange={(val) => toggleSet.mutate({ id: s.id, is_active: val })} />
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-red-400" onClick={() => deleteSet.mutate(s.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fields.map((f, i) => (
                    <Badge key={i} variant="outline" className={`text-[10px] ${f.required ? "border-primary/30 text-primary" : ""}`}>
                      {f.name} {f.required && "*"}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {sets.length === 0 && (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Layers className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No attribute sets yet. Create templates to standardize product specs.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminAttributeSets;

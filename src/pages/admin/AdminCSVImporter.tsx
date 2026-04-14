import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

const PRODUCT_FIELDS = [
  { key: "name", label: "Product Name", required: true },
  { key: "brand", label: "Brand", required: true },
  { key: "price", label: "Price (AED)", required: true },
  { key: "slug", label: "Slug", required: true },
  { key: "original_price", label: "Original Price", required: false },
  { key: "stock_quantity", label: "Stock Quantity", required: false },
  { key: "condition", label: "Condition", required: false },
  { key: "description", label: "Description", required: false },
  { key: "ram", label: "RAM", required: false },
  { key: "storage", label: "Storage", required: false },
  { key: "color", label: "Color", required: false },
  { key: "battery", label: "Battery", required: false },
  { key: "camera", label: "Camera", required: false },
  { key: "display_size", label: "Display Size", required: false },
  { key: "processor", label: "Processor", required: false },
  { key: "os", label: "OS", required: false },
  { key: "warranty_months", label: "Warranty (months)", required: false },
  { key: "meta_title", label: "Meta Title", required: false },
  { key: "meta_description", label: "Meta Description", required: false },
];

type Step = "upload" | "map" | "preview" | "done";

const AdminCSVImporter = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [vendorId, setVendorId] = useState("");
  const [importCount, setImportCount] = useState(0);

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors-csv"],
    queryFn: async () => {
      const { data } = await supabase.from("vendors").select("id, store_name").eq("status", "approved");
      return data || [];
    },
  });

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) { toast({ title: "CSV must have a header row and at least one data row", variant: "destructive" }); return; }
      const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
      const rows = lines.slice(1).map((l) => {
        const cells: string[] = [];
        let current = "";
        let inQuotes = false;
        for (const ch of l) {
          if (ch === '"') { inQuotes = !inQuotes; }
          else if (ch === "," && !inQuotes) { cells.push(current.trim()); current = ""; }
          else { current += ch; }
        }
        cells.push(current.trim());
        return cells;
      });
      setCsvHeaders(headers);
      setCsvRows(rows);
      // Auto-map matching headers
      const autoMap: Record<string, string> = {};
      headers.forEach((h) => {
        const lower = h.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const match = PRODUCT_FIELDS.find((f) => f.key === lower || f.label.toLowerCase().replace(/[^a-z0-9]/g, "_") === lower);
        if (match) autoMap[match.key] = h;
      });
      setMapping(autoMap);
      setStep("map");
    };
    reader.readAsText(file);
  }, [toast]);

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!vendorId) throw new Error("Select a vendor");
      const reverseMap: Record<string, number> = {};
      Object.entries(mapping).forEach(([field, csvCol]) => {
        const idx = csvHeaders.indexOf(csvCol);
        if (idx >= 0) reverseMap[field] = idx;
      });
      const products = csvRows.map((row) => {
        const p: any = { vendor_id: vendorId, currency: "AED" };
        Object.entries(reverseMap).forEach(([field, idx]) => {
          let val = row[idx] ?? "";
          if (field === "price" || field === "original_price" || field === "stock_quantity" || field === "warranty_months") {
            const num = Number(val);
            if (!isNaN(num)) p[field] = num;
          } else {
            if (val) p[field] = val;
          }
        });
        if (!p.slug && p.name) p.slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
        if (!p.stock_quantity) p.stock_quantity = 0;
        return p;
      }).filter((p) => p.name && p.brand && p.price);

      if (products.length === 0) throw new Error("No valid products after mapping");
      const { error } = await supabase.from("products").insert(products);
      if (error) throw error;
      return products.length;
    },
    onSuccess: (count) => {
      setImportCount(count);
      setStep("done");
      toast({ title: `${count} products imported successfully` });
    },
    onError: (e: any) => toast({ title: "Import failed", description: e.message, variant: "destructive" }),
  });

  const mappedRequired = PRODUCT_FIELDS.filter((f) => f.required).every((f) => mapping[f.key]);
  const previewRows = csvRows.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Bulk CSV Importer</h1>
        <p className="text-sm text-muted-foreground">Upload a spreadsheet of products and map columns to your database</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 text-xs">
        {(["upload", "map", "preview", "done"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            <Badge variant="outline" className={step === s ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground"}>
              {s === "upload" ? "Upload" : s === "map" ? "Map Columns" : s === "preview" ? "Preview & Import" : "Done"}
            </Badge>
          </div>
        ))}
      </div>

      {step === "upload" && (
        <Card className="glass border-border/50">
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <Upload className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Upload a CSV file with product data</p>
            <label className="cursor-pointer">
              <Input type="file" accept=".csv" onChange={handleFile} className="hidden" />
              <Button asChild><span><FileSpreadsheet className="h-4 w-4 mr-2" /> Choose CSV File</span></Button>
            </label>
          </CardContent>
        </Card>
      )}

      {step === "map" && (
        <div className="space-y-4">
          <Card className="glass border-border/50">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold">Assign Vendor</p>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger className="w-full max-w-xs"><SelectValue placeholder="Select vendor..." /></SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.store_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold">Map CSV Columns → Product Fields</p>
              <p className="text-xs text-muted-foreground">Found {csvHeaders.length} columns · {csvRows.length} rows</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRODUCT_FIELDS.map((f) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <span className="text-xs w-28 shrink-0 truncate">
                      {f.label} {f.required && <span className="text-red-400">*</span>}
                    </span>
                    <Select value={mapping[f.key] || "__none__"} onValueChange={(v) => setMapping((m) => ({ ...m, [f.key]: v === "__none__" ? "" : v }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— skip —</SelectItem>
                        {csvHeaders.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={() => setStep("preview")} disabled={!mappedRequired || !vendorId}>
              Preview Import
            </Button>
            <Button variant="ghost" onClick={() => { setStep("upload"); setCsvHeaders([]); setCsvRows([]); setMapping({}); }}>
              Start Over
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-3">Preview (first 5 rows of {csvRows.length})</p>
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      {PRODUCT_FIELDS.filter((f) => mapping[f.key]).map((f) => (
                        <th key={f.key} className="text-left p-2 text-muted-foreground font-medium">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, ri) => (
                      <tr key={ri} className="border-b border-border/30">
                        {PRODUCT_FIELDS.filter((f) => mapping[f.key]).map((f) => {
                          const idx = csvHeaders.indexOf(mapping[f.key]);
                          return <td key={f.key} className="p-2 truncate max-w-[200px]">{row[idx] ?? ""}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={() => importMutation.mutate()} disabled={importMutation.isPending}>
              {importMutation.isPending ? "Importing..." : `Import ${csvRows.length} Products`}
            </Button>
            <Button variant="ghost" onClick={() => setStep("map")}>Back to Mapping</Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <Card className="glass border-primary/30">
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <CheckCircle className="h-12 w-12 text-emerald-400" />
            <p className="text-lg font-display font-bold">{importCount} products imported!</p>
            <Button onClick={() => { setStep("upload"); setCsvHeaders([]); setCsvRows([]); setMapping({}); setVendorId(""); }}>
              Import Another File
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCSVImporter;

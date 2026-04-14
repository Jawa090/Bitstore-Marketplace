import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Globe } from "lucide-react";

const SAMPLE_ENDPOINT = "https://dummyjson.com/products?limit=10";

const AdminProductImport = () => {
  const [endpointUrl, setEndpointUrl] = useState(SAMPLE_ENDPOINT);
  const [vendorId, setVendorId] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    total: number;
    created: number;
    updated: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const { data: vendors } = useQuery({
    queryKey: ["vendors-for-import"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendors")
        .select("id, store_name")
        .eq("status", "approved")
        .order("store_name");
      return data || [];
    },
  });

  const handleSync = async () => {
    if (!endpointUrl.trim()) {
      toast.error("Please enter an endpoint URL");
      return;
    }
    if (!vendorId) {
      toast.error("Please select a vendor");
      return;
    }

    setSyncing(true);
    setProgress(10);
    setResult(null);

    try {
      setProgress(30);

      const { data, error } = await supabase.functions.invoke("import-products", {
        body: { endpoint_url: endpointUrl, vendor_id: vendorId },
      });

      setProgress(90);

      if (error) {
        toast.error(error.message || "Import failed");
        setResult(null);
      } else if (data?.error) {
        toast.error(data.error);
        setResult(null);
      } else {
        setResult(data);
        toast.success(
          `Import complete: ${data.created} created, ${data.updated} updated`
        );
      }
    } catch (e: any) {
      toast.error(e.message || "Unexpected error");
    } finally {
      setProgress(100);
      setTimeout(() => setSyncing(false), 500);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Product Import</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fetch products from an external JSON API and sync them to your catalog.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Card */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Import Configuration
            </CardTitle>
            <CardDescription>
              Enter the JSON endpoint URL. The API should return an array of products with fields:
              title, description, price, image_url, stock_level.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Endpoint URL</Label>
              <Input
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                placeholder="https://api.example.com/products"
                disabled={syncing}
              />
              <p className="text-xs text-muted-foreground">
                A demo endpoint is pre-filled for testing. Replace with your Zambeel / AliDropship API.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Assign to Vendor</Label>
              <Select value={vendorId} onValueChange={setVendorId} disabled={syncing}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor..." />
                </SelectTrigger>
                <SelectContent>
                  {vendors?.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.store_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {syncing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Importing products...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button
              onClick={handleSync}
              disabled={syncing}
              className="w-full gap-2"
              size="lg"
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>
          </CardContent>
        </Card>

        {/* Field Mapping Card */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Field Mapping</CardTitle>
            <CardDescription>External → Local mapping</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {[
                ["title", "name"],
                ["description", "description"],
                ["price", "price"],
                ["image_url", "product_images"],
                ["stock_level", "stock_quantity"],
                ["brand", "brand"],
                ["sku", "slug (auto)"],
                ["color", "color"],
                ["storage", "storage"],
                ["ram", "ram"],
                ["condition", "condition"],
              ].map(([from, to]) => (
                <div key={from} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <code className="text-xs bg-secondary px-2 py-0.5 rounded">{from}</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{to}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Card */}
      {result && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-secondary">
                <p className="text-2xl font-bold">{result.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-500/10">
                <p className="text-2xl font-bold text-green-500">{result.created}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Created
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-500/10">
                <p className="text-2xl font-bold text-blue-500">{result.updated}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <RefreshCw className="h-3 w-3" /> Updated
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-destructive/10">
                <p className="text-2xl font-bold text-destructive">{result.failed}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <XCircle className="h-3 w-3" /> Failed
                </p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" /> Errors
                </p>
                <div className="max-h-40 overflow-auto space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-muted-foreground bg-secondary rounded px-2 py-1">
                      {err}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Enter the JSON API endpoint URL that returns product data.</li>
            <li>Select which vendor these products should be assigned to.</li>
            <li>Click <Badge variant="outline" className="text-xs">Sync Now</Badge> to start the import.</li>
            <li>If a product with the same name already exists for that vendor, its <strong>price</strong> and <strong>stock</strong> are updated.</li>
            <li>New products are created with auto-generated slugs and mapped fields.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProductImport;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Download, Search, FileText } from "lucide-react";

const VAT_RATE = 0.05;
const TRN = "100000000000003"; // BitStores TRN placeholder

const AdminVATEngine = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders = [] } = useQuery({
    queryKey: ["vat-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, sub_orders(*, vendors(store_name, commission_rate)), profiles!orders_customer_id_fkey(display_name, email, phone)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const filtered = orders.filter((o: any) =>
    o.id.includes(searchTerm) ||
    (o.profiles as any)?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateInvoice = (order: any, lang: "en" | "ar") => {
    const total = Number(order.total_amount);
    const exVat = total / (1 + VAT_RATE);
    const vat = total - exVat;
    const date = new Date(order.created_at).toLocaleDateString(lang === "ar" ? "ar-AE" : "en-AE", {
      year: "numeric", month: "long", day: "numeric"
    });

    const isAr = lang === "ar";
    const dir = isAr ? "rtl" : "ltr";
    const labels = isAr
      ? { title: "فاتورة ضريبية", inv: "رقم الفاتورة", date: "التاريخ", customer: "العميل", item: "البند", qty: "الكمية", price: "السعر", subtotal: "المجموع الفرعي", vat: "ضريبة القيمة المضافة (5%)", total: "الإجمالي", trn: "رقم التسجيل الضريبي", seller: "البائع", phone: "الهاتف", address: "العنوان" }
      : { title: "Tax Invoice", inv: "Invoice No", date: "Date", customer: "Customer", item: "Item", qty: "Qty", price: "Price", subtotal: "Subtotal (Ex-VAT)", vat: "VAT (5%)", total: "Total (Inc. VAT)", trn: "Tax Registration No", seller: "Seller", phone: "Phone", address: "Delivery Address" };

    const subOrders = (order.sub_orders || []) as any[];
    const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head><meta charset="utf-8"><title>${labels.title}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: ${isAr ? "'Segoe UI', Tahoma, Arial" : "Arial, sans-serif"}; padding: 40px; color: #1a1a2e; background: #fff; }
  .header { display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #3b82f6; padding-bottom:20px; margin-bottom:30px; }
  .title { font-size:28px; font-weight:bold; color:#3b82f6; }
  .meta { font-size:13px; color:#666; }
  .meta span { display:block; margin:4px 0; }
  .section { margin:20px 0; }
  .section-title { font-size:14px; font-weight:600; color:#3b82f6; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px; }
  table { width:100%; border-collapse:collapse; margin:16px 0; }
  th { background:#f0f4ff; color:#1a1a2e; font-size:12px; padding:10px 12px; text-align:${isAr ? "right" : "left"}; border-bottom:2px solid #3b82f6; }
  td { padding:10px 12px; font-size:13px; border-bottom:1px solid #e5e7eb; }
  .totals { margin-top:20px; }
  .totals td { font-size:14px; padding:8px 12px; }
  .totals .grand { font-weight:bold; font-size:16px; background:#f0f4ff; border-top:2px solid #3b82f6; }
  .footer { margin-top:40px; padding-top:20px; border-top:1px solid #e5e7eb; font-size:11px; color:#999; text-align:center; }
  .trn { font-weight:600; color:#1a1a2e; }
  @media print { body { padding:20px; } }
</style></head>
<body>
  <div class="header">
    <div><div class="title">BitStores</div><div class="meta">${labels.title}</div></div>
    <div class="meta" style="text-align:${isAr ? "left" : "right"}">
      <span><strong>${labels.inv}:</strong> INV-${order.id.slice(0, 8).toUpperCase()}</span>
      <span><strong>${labels.date}:</strong> ${date}</span>
      <span class="trn"><strong>${labels.trn}:</strong> ${TRN}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">${labels.customer}</div>
    <p style="font-size:14px">${(order.profiles as any)?.display_name || "—"}</p>
    <p style="font-size:12px;color:#666">${(order.profiles as any)?.email || ""} ${(order.profiles as any)?.phone ? `· ${(order.profiles as any).phone}` : ""}</p>
    <p style="font-size:12px;color:#666">${labels.address}: ${order.delivery_address}, ${order.delivery_emirate}</p>
  </div>

  <div class="section">
    <div class="section-title">${labels.seller}</div>
    <table>
      <thead><tr><th>${labels.seller}</th><th>${labels.price}</th></tr></thead>
      <tbody>
        ${subOrders.map((so: any) => `<tr><td>${(so.vendors as any)?.store_name || "—"}</td><td>AED ${Number(so.subtotal).toFixed(2)}</td></tr>`).join("")}
      </tbody>
    </table>
  </div>

  <table class="totals">
    <tr><td>${labels.subtotal}</td><td style="text-align:${isAr ? "left" : "right"}">AED ${exVat.toFixed(2)}</td></tr>
    <tr><td>${labels.vat}</td><td style="text-align:${isAr ? "left" : "right"}">AED ${vat.toFixed(2)}</td></tr>
    <tr class="grand"><td>${labels.total}</td><td style="text-align:${isAr ? "left" : "right"}">AED ${total.toFixed(2)}</td></tr>
  </table>

  <div class="footer">
    <p>This is a computer-generated Tax Invoice compliant with UAE FTA standards.</p>
    <p>${isAr ? "هذه فاتورة ضريبية صادرة إلكترونياً وفقاً لمعايير الهيئة الاتحادية للضرائب" : ""}</p>
  </div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.id.slice(0, 8)}-${lang}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Invoice downloaded (${lang === "ar" ? "Arabic" : "English"})` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">VAT Compliance Engine</h1>
        <p className="text-sm text-muted-foreground">
          Generate FTA-compliant Tax Invoices in English and Arabic
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Orders</CardTitle>
            <Receipt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total VAT Collected</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold">
              AED {orders.reduce((s: number, o: any) => s + (Number(o.total_amount) - Number(o.total_amount) / 1.05), 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">TRN</CardTitle>
            <Receipt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-mono font-bold">{TRN}</p>
            <p className="text-[10px] text-muted-foreground">Tax Registration Number</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search by Order ID or customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Order List */}
      <div className="space-y-2">
        {filtered.map((order: any) => {
          const total = Number(order.total_amount);
          const vat = total - total / 1.05;
          return (
            <Card key={order.id} className="glass border-border/50">
              <CardContent className="p-4 flex items-center gap-4 flex-wrap">
                <Receipt className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-[180px]">
                  <p className="font-mono text-sm font-medium">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {(order.profiles as any)?.display_name || "Customer"} ·{" "}
                    {new Date(order.created_at).toLocaleDateString("en-AE", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">AED {total.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">VAT: AED {vat.toFixed(2)}</p>
                </div>
                <Badge variant="outline" className="capitalize">{order.status}</Badge>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => generateInvoice(order, "en")}>
                    <Download className="h-3 w-3" /> EN
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => generateInvoice(order, "ar")}>
                    <Download className="h-3 w-3" /> عربي
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No orders found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminVATEngine;

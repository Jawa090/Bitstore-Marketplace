import { useQuery } from "@tanstack/react-query";
import { useVendor } from "@/components/vendor/VendorGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, Clock, CheckCircle, DollarSign, Truck } from "lucide-react";

const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const VendorPayouts = () => {
  const { vendor } = useVendor();

  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ["vendor-payouts", vendor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_payouts")
        .select("*")
        .eq("vendor_id", vendor!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id,
  });

  // Fetch remittance details for context
  const remittanceIds = [...new Set(payouts.filter((p) => p.remittance_id).map((p) => p.remittance_id!))];

  const { data: remittances = [] } = useQuery({
    queryKey: ["vendor-payout-remittances", remittanceIds],
    queryFn: async () => {
      if (remittanceIds.length === 0) return [];
      const { data } = await supabase
        .from("courier_remittances")
        .select("id, courier_name, reference_number, collection_date")
        .in("id", remittanceIds);
      return data || [];
    },
    enabled: remittanceIds.length > 0,
  });

  const remittanceMap = Object.fromEntries(remittances.map((r) => [r.id, r]));

  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Payouts</h1>
        <p className="text-sm text-muted-foreground">Track your incoming payments from BitStores</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Received</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold">AED {fmt(totalPaid)}</p>
            <p className="text-xs text-muted-foreground">{payouts.filter((p) => p.status === "paid").length} payments</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Pending Payout</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold">AED {fmt(totalPending)}</p>
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold">AED {fmt(totalPaid + totalPending)}</p>
            <p className="text-xs text-muted-foreground">{payouts.length} total entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm">Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 && !isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Banknote className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payouts yet. Payouts will appear here once orders are settled.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payouts.map((p) => {
                const rem = p.remittance_id ? remittanceMap[p.remittance_id] : null;
                return (
                  <div key={p.id} className="flex items-center gap-3 px-3 py-3 rounded-lg bg-secondary/30">
                    <Banknote className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">AED {fmt(Number(p.amount))}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        {rem && (
                          <>
                            <Truck className="h-3 w-3" />
                            <span>{rem.courier_name}</span>
                            {rem.reference_number && <span>· Ref: {rem.reference_number}</span>}
                            <span>· Collected {new Date(rem.collection_date).toLocaleDateString("en-AE", { month: "short", day: "numeric" })}</span>
                          </>
                        )}
                        {p.notes && <span>· {p.notes}</span>}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        p.status === "paid"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }
                    >
                      {p.status === "paid" ? "Received" : "Pending"}
                    </Badge>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {p.paid_at
                        ? new Date(p.paid_at).toLocaleDateString("en-AE", { month: "short", day: "numeric", year: "numeric" })
                        : new Date(p.created_at).toLocaleDateString("en-AE", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorPayouts;

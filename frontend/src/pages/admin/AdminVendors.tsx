import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logAuditEvent } from "@/lib/audit";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Store, Percent } from "lucide-react";
import { useState } from "react";
import type { Tables } from "@/integrations/supabase/types";

type Vendor = Tables<"vendors">;

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  suspended: "bg-red-500/20 text-red-400 border-red-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

const AdminVendors = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Vendor[];
    },
  });

  const updateVendor = useMutation({
    mutationFn: async ({ id, updates, vendorName }: { id: string; updates: Partial<Vendor>; vendorName?: string }) => {
      const { error } = await supabase.from("vendors").update(updates as any).eq("id", id);
      if (error) throw error;

      // Audit log
      const fields = Object.keys(updates);
      const action = updates.status ? updates.status : "update";
      await logAuditEvent({
        action,
        entityType: "vendor",
        entityId: id,
        details: {
          description: `${action === "approved" ? "Approved" : action === "suspended" ? "Suspended" : "Updated"} vendor "${vendorName || id}"`,
          changes: updates,
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vendors"] });
      qc.invalidateQueries({ queryKey: ["admin-pulse-stats"] });
      toast({ title: "Vendor updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const pending = vendors.filter((v) => v.status === "pending");
  const others = vendors.filter((v) => v.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Vendor Management</h1>
        <p className="text-sm text-muted-foreground">Approve applications, set commission rates, monitor performance</p>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" /> Approval Queue ({pending.length})
          </h2>
          {pending.map((v) => (
            <VendorRow key={v.id} vendor={v} onUpdate={updateVendor.mutate} loading={updateVendor.isPending} />
          ))}
        </div>
      )}

      {pending.length === 0 && !isLoading && (
        <Card className="glass border-border/50">
          <CardContent className="py-6 text-center text-muted-foreground text-sm">
            No pending applications
          </CardContent>
        </Card>
      )}

      {others.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">All Vendors ({others.length})</h2>
          {others.map((v) => (
            <VendorRow key={v.id} vendor={v} onUpdate={updateVendor.mutate} loading={updateVendor.isPending} />
          ))}
        </div>
      )}
    </div>
  );
};

function VendorRow({
  vendor,
  onUpdate,
  loading,
}: {
  vendor: Vendor;
  onUpdate: (args: { id: string; updates: Partial<Vendor>; vendorName?: string }) => void;
  loading: boolean;
}) {
  const [editRate, setEditRate] = useState(false);
  const [rate, setRate] = useState(String(vendor.commission_rate));

  return (
    <Card className="glass border-border/50">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{vendor.store_name}</p>
            <p className="text-xs text-muted-foreground">
              {vendor.emirate} · {vendor.contact_email || "No email"} · {vendor.contact_phone || "No phone"}
            </p>
          </div>
        </div>

        {/* Commission Rate */}
        <div className="flex items-center gap-2">
          {editRate ? (
            <div className="flex items-center gap-1">
              <Input
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-16 h-8 text-xs text-center"
                type="number"
                min="0"
                max="100"
              />
              <span className="text-xs text-muted-foreground">%</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-primary"
                onClick={() => {
                  onUpdate({ id: vendor.id, updates: { commission_rate: Number(rate) }, vendorName: vendor.store_name });
                  setEditRate(false);
                }}
                disabled={loading}
              >
                Save
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setEditRate(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/50 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Percent className="h-3 w-3" /> {vendor.commission_rate}%
            </button>
          )}
        </div>

        <Badge variant="outline" className={statusColors[vendor.status] || ""}>
          {vendor.status}
        </Badge>

        <div className="flex gap-2 shrink-0">
          {vendor.status !== "approved" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              onClick={() => onUpdate({ id: vendor.id, updates: { status: "approved" as any }, vendorName: vendor.store_name })}
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4" /> Approve
            </Button>
          )}
          {vendor.status !== "suspended" && vendor.status !== "rejected" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() =>
                onUpdate({
                  id: vendor.id,
                  updates: { status: (vendor.status === "pending" ? "rejected" : "suspended") as any },
                  vendorName: vendor.store_name,
                })
              }
              disabled={loading}
            >
              <XCircle className="h-4 w-4" /> {vendor.status === "pending" ? "Reject" : "Suspend"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminVendors;

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Users, ShieldCheck, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ROLE_DESCRIPTIONS: Record<string, { label: string; description: string; color: string }> = {
  admin: { label: "Admin", description: "Full access to all features", color: "bg-red-500/20 text-red-400" },
  moderator: { label: "Moderator", description: "Can manage content, orders, and support", color: "bg-amber-500/20 text-amber-400" },
  vendor: { label: "Vendor", description: "Vendor store management access", color: "bg-blue-500/20 text-blue-400" },
  customer: { label: "Customer", description: "Standard customer account", color: "bg-muted text-muted-foreground" },
};

const AdminStaffAccess = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [assignEmail, setAssignEmail] = useState("");
  const [assignRole, setAssignRole] = useState("moderator");
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: roleEntries = [], isLoading } = useQuery({
    queryKey: ["staff-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("role");
      if (error) throw error;
      return data;
    },
  });

  const userIds = [...new Set(roleEntries.map((r: any) => r.user_id))];
  const { data: profiles = [] } = useQuery({
    queryKey: ["staff-profiles", userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, email, avatar_url")
        .in("user_id", userIds);
      if (error) throw error;
      return data;
    },
    enabled: userIds.length > 0,
  });

  const profileMap = Object.fromEntries(profiles.map((p: any) => [p.user_id, p]));

  // Group roles by user
  const userRolesMap: Record<string, string[]> = {};
  roleEntries.forEach((r: any) => {
    if (!userRolesMap[r.user_id]) userRolesMap[r.user_id] = [];
    userRolesMap[r.user_id].push(r.role);
  });

  const staffUsers = Object.entries(userRolesMap)
    .filter(([, roles]) => roleFilter === "all" || roles.includes(roleFilter))
    .map(([userId, roles]) => ({
      userId,
      roles,
      profile: profileMap[userId],
    }))
    .filter((u) => {
      if (!search) return true;
      const name = u.profile?.display_name || u.profile?.email || "";
      return name.toLowerCase().includes(search.toLowerCase());
    });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // Find user by email in profiles
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", email)
        .single();
      if (profErr || !prof) throw new Error("User not found with that email");

      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: prof.user_id, role: role as any });
      if (error) {
        if (error.code === "23505") throw new Error("User already has this role");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
      toast.success("Role assigned successfully");
      setAssignEmail("");
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
      toast.success("Role removed");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const admins = Object.values(userRolesMap).filter((r) => r.includes("admin")).length;
  const moderators = Object.values(userRolesMap).filter((r) => r.includes("moderator")).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Staff Access</h1>
          <p className="text-sm text-muted-foreground">Manage role-based permissions for your team</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="h-4 w-4" /> Assign Role</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Assign Role to User</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>User Email</Label>
                <Input
                  placeholder="user@example.com"
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={assignRole} onValueChange={setAssignRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin — Full access</SelectItem>
                    <SelectItem value="moderator">Moderator — Content & support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Permission breakdown */}
              <Card className="glass border-border/50">
                <CardContent className="p-3">
                  <p className="text-xs font-medium mb-2">Permissions for {ROLE_DESCRIPTIONS[assignRole]?.label}:</p>
                  <ul className="text-[11px] text-muted-foreground space-y-1">
                    {assignRole === "admin" ? (
                      <>
                        <li>✅ Manage vendors, products, orders</li>
                        <li>✅ Financial reports & payouts</li>
                        <li>✅ User management & role assignment</li>
                        <li>✅ System configuration & integrations</li>
                      </>
                    ) : (
                      <>
                        <li>✅ View & edit products and orders</li>
                        <li>✅ Handle disputes & support tickets</li>
                        <li>✅ Manage content (SEO, categories)</li>
                        <li>❌ No financial access or payouts</li>
                        <li>❌ No user management or role changes</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
              <Button
                className="w-full"
                onClick={() => assignRoleMutation.mutate({ email: assignEmail, role: assignRole })}
                disabled={!assignEmail || assignRoleMutation.isPending}
              >
                {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold">{Object.keys(userRolesMap).length}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Admins</CardTitle>
            <ShieldCheck className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-red-400">{admins}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Moderators</CardTitle>
            <ShieldCheck className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-amber-400">{moderators}</p></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="moderator">Moderators</SelectItem>
            <SelectItem value="vendor">Vendors</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User List */}
      <div className="space-y-2">
        {isLoading ? (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">Loading staff...</CardContent>
          </Card>
        ) : staffUsers.length === 0 ? (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No users match your filters.</p>
            </CardContent>
          </Card>
        ) : (
          staffUsers.map((u) => (
            <Card key={u.userId} className="glass border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center text-sm font-bold">
                  {(u.profile?.display_name || u.profile?.email || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.profile?.display_name || "Unknown User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.profile?.email || u.userId.slice(0, 16)}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {u.roles.map((role) => {
                    const rd = ROLE_DESCRIPTIONS[role] || ROLE_DESCRIPTIONS.customer;
                    return (
                      <div key={role} className="flex items-center gap-1">
                        <Badge className={`text-[10px] ${rd.color}`}>{rd.label}</Badge>
                        {role !== "customer" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => removeRoleMutation.mutate({ userId: u.userId, role })}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-400" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminStaffAccess;

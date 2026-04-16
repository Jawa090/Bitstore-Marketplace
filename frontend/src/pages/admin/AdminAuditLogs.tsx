import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, History, User, Package, Store, DollarSign, Shield, Clock } from "lucide-react";
import { format } from "date-fns";

const entityIcons: Record<string, any> = {
  product: Package,
  vendor: Store,
  order: DollarSign,
  user: User,
  default: Shield,
};

const actionColors: Record<string, string> = {
  create: "bg-emerald-500/20 text-emerald-400",
  update: "bg-blue-500/20 text-blue-400",
  delete: "bg-red-500/20 text-red-400",
  approve: "bg-emerald-500/20 text-emerald-400",
  suspend: "bg-amber-500/20 text-amber-400",
  login: "bg-muted text-muted-foreground",
};

const AdminAuditLogs = () => {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs", entityFilter, actionFilter],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (entityFilter !== "all") query = query.eq("entity_type", entityFilter);
      if (actionFilter !== "all") query = query.eq("action", actionFilter);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Get profile names for user_ids
  const userIds = [...new Set(logs.map((l: any) => l.user_id))];
  const { data: profiles = [] } = useQuery({
    queryKey: ["audit-profiles", userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, email")
        .in("user_id", userIds);
      if (error) throw error;
      return data;
    },
    enabled: userIds.length > 0,
  });

  const profileMap = Object.fromEntries(profiles.map((p: any) => [p.user_id, p]));

  const entityTypes = [...new Set(logs.map((l: any) => l.entity_type))].sort();
  const actions = [...new Set(logs.map((l: any) => l.action))].sort();

  const filtered = logs.filter((l: any) => {
    if (!search) return true;
    const profile = profileMap[l.user_id];
    const name = profile?.display_name || profile?.email || "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.entity_id || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Complete history trail of all admin actions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Events</CardTitle>
            <History className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold">{logs.length}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Today's Actions</CardTitle>
            <Clock className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold text-emerald-400">
              {logs.filter((l: any) => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Unique Users</CardTitle>
            <User className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold text-blue-400">{userIds.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by user, entity, action..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {entityTypes.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {isLoading ? (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">Loading audit trail...</CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No audit events found. Actions will be recorded as admins use the panel.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((log: any) => {
            const Icon = entityIcons[log.entity_type] || entityIcons.default;
            const profile = profileMap[log.user_id];
            const userName = profile?.display_name || profile?.email || log.user_id.slice(0, 8);
            const colorClass = actionColors[log.action] || "bg-muted text-muted-foreground";
            const details = log.details || {};

            return (
              <Card key={log.id} className="glass border-border/50">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-muted/50 p-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{userName}</span>
                      <Badge className={`text-[10px] ${colorClass}`}>{log.action}</Badge>
                      <Badge variant="outline" className="text-[10px]">{log.entity_type}</Badge>
                      {log.entity_id && (
                        <span className="text-[10px] text-muted-foreground font-mono">{log.entity_id.slice(0, 8)}…</span>
                      )}
                    </div>
                    {Object.keys(details).length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {details.field && <span>Changed <span className="font-medium text-foreground">{details.field}</span></span>}
                        {details.old_value && <span> from <span className="text-red-400">{String(details.old_value)}</span></span>}
                        {details.new_value && <span> to <span className="text-emerald-400">{String(details.new_value)}</span></span>}
                        {details.description && <span>{details.description}</span>}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created_at), "MMM d, HH:mm")}
                  </span>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;

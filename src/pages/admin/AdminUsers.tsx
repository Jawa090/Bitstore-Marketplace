import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { useState } from "react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type UserRole = Tables<"user_roles">;

const AdminUsers = () => {
  const [search, setSearch] = useState("");

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const roleMap = roles.reduce<Record<string, string[]>>((acc, r) => {
    acc[r.user_id] = [...(acc[r.user_id] || []), r.role];
    return acc;
  }, {});

  const filtered = profiles.filter(
    (p) =>
      !search ||
      p.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge: Record<string, string> = {
    admin: "bg-red-500/20 text-red-400 border-red-500/30",
    vendor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    customer: "bg-muted text-muted-foreground border-border/50",
    moderator: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-foreground">Users ({profiles.length})</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((p) => (
          <Card key={p.id} className="glass border-border/50">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{p.display_name || "Unnamed"}</p>
                <p className="text-xs text-muted-foreground truncate">{p.email}</p>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(roleMap[p.user_id] || ["customer"]).map((r) => (
                  <Badge key={r} variant="outline" className={roleBadge[r] || ""}>
                    {r}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground shrink-0">
                {new Date(p.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;

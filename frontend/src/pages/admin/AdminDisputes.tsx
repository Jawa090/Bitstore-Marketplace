import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logAuditEvent } from "@/lib/audit";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, AlertTriangle, CheckCircle, Clock, Send, Shield,
  User, Store, ChevronDown, ChevronUp, X,
} from "lucide-react";

const statusColors: Record<string, string> = {
  open: "bg-red-500/20 text-red-400 border-red-500/30",
  in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  escalated: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  closed: "bg-muted text-muted-foreground border-border",
};

const reasonLabels: Record<string, string> = {
  defective: "Defective Product",
  wrong_item: "Wrong Item Received",
  not_received: "Not Received",
  refund: "Refund Request",
  return: "Return Request",
  other: "Other",
};

const roleIcons: Record<string, typeof User> = {
  customer: User,
  vendor: Store,
  admin: Shield,
};

const roleColors: Record<string, string> = {
  customer: "text-blue-400",
  vendor: "text-amber-400",
  admin: "text-primary",
};

const AdminDisputes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [messageText, setMessageText] = useState("");
  const [resolution, setResolution] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: disputes = [] } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select("*, vendors(store_name), profiles!disputes_customer_id_fkey(display_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["dispute-messages", selectedDispute],
    queryFn: async () => {
      if (!selectedDispute) return [];
      const { data, error } = await supabase
        .from("dispute_messages")
        .select("*, profiles!dispute_messages_sender_id_fkey(display_name)")
        .eq("dispute_id", selectedDispute)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDispute,
  });

  // Realtime subscription for messages
  useEffect(() => {
    if (!selectedDispute) return;
    const channel = supabase
      .channel(`dispute-${selectedDispute}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "dispute_messages",
        filter: `dispute_id=eq.${selectedDispute}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ["dispute-messages", selectedDispute] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedDispute]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("dispute_messages").insert({
        dispute_id: selectedDispute!,
        sender_id: user!.id,
        sender_role: "admin",
        message: messageText,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessageText("");
      qc.invalidateQueries({ queryKey: ["dispute-messages", selectedDispute] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateDisputeStatus = useMutation({
    mutationFn: async ({ id, status, res }: { id: string; status: string; res?: string }) => {
      const update: any = { status };
      if (status === "resolved" || status === "closed") {
        update.resolved_at = new Date().toISOString();
        update.resolved_by = user!.id;
        if (res) update.resolution = res;
      }
      const { error } = await supabase.from("disputes").update(update).eq("id", id);
      if (error) throw error;
      await logAuditEvent({ action: status, entityType: "dispute", entityId: id, details: { description: `Dispute ${status}`, resolution: res } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-disputes"] });
      toast({ title: "Status updated" });
    },
  });

  const filtered = filterStatus === "all" ? disputes : disputes.filter((d: any) => d.status === filterStatus);
  const activeDispute = disputes.find((d: any) => d.id === selectedDispute);

  const openCount = disputes.filter((d: any) => d.status === "open").length;
  const inProgressCount = disputes.filter((d: any) => d.status === "in_progress").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Dispute Resolution Center</h1>
        <p className="text-sm text-muted-foreground">
          Three-way mediation between customers, vendors, and admin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Disputes</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold">{disputes.length}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Open</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-red-400">{openCount}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-amber-400">{inProgressCount}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold text-emerald-400">
              {disputes.filter((d: any) => d.status === "resolved" || d.status === "closed").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Dispute List */}
        <div className="lg:col-span-2 space-y-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((d: any) => (
              <Card
                key={d.id}
                className={`glass border-border/50 cursor-pointer transition-colors hover:border-primary/30 ${selectedDispute === d.id ? "border-primary/50 bg-primary/5" : ""}`}
                onClick={() => setSelectedDispute(d.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{d.subject}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {(d.profiles as any)?.display_name || "Customer"} vs {(d.vendors as any)?.store_name || "Vendor"}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColors[d.status]}`}>
                      {d.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[10px]">{reasonLabels[d.reason] || d.reason}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(d.created_at).toLocaleDateString("en-AE", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No disputes found.</p>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-3">
          {activeDispute ? (
            <Card className="glass border-border/50 flex flex-col h-[650px]">
              {/* Header */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{activeDispute.subject}</h3>
                    <p className="text-[10px] text-muted-foreground">
                      #{activeDispute.id.slice(0, 8)} · {reasonLabels[(activeDispute as any).reason]}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {activeDispute.status === "open" && (
                      <Button size="sm" variant="outline" className="text-xs h-7"
                        onClick={() => updateDisputeStatus.mutate({ id: activeDispute.id, status: "in_progress" })}>
                        Take Over
                      </Button>
                    )}
                    {(activeDispute.status === "open" || activeDispute.status === "in_progress") && (
                      <Button size="sm" variant="outline" className="text-xs h-7 border-purple-500/30 text-purple-400"
                        onClick={() => updateDisputeStatus.mutate({ id: activeDispute.id, status: "escalated" })}>
                        Escalate
                      </Button>
                    )}
                    {activeDispute.status !== "resolved" && activeDispute.status !== "closed" && (
                      <Button size="sm" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => updateDisputeStatus.mutate({ id: activeDispute.id, status: "resolved", res: resolution || "Resolved by admin" })}>
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
                {/* Participants */}
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <User className="h-3 w-3 text-blue-400" />
                    <span>{(activeDispute as any).profiles?.display_name || "Customer"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Store className="h-3 w-3 text-amber-400" />
                    <span>{(activeDispute as any).vendors?.store_name || "Vendor"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Shield className="h-3 w-3 text-primary" />
                    <span>Admin (You)</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg: any) => {
                  const RoleIcon = roleIcons[msg.sender_role] || User;
                  const isAdmin = msg.sender_role === "admin";
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isAdmin ? "flex-row-reverse" : ""}`}>
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                        isAdmin ? "bg-primary/20" : msg.sender_role === "vendor" ? "bg-amber-500/20" : "bg-blue-500/20"
                      }`}>
                        <RoleIcon className={`h-3.5 w-3.5 ${roleColors[msg.sender_role]}`} />
                      </div>
                      <div className={`max-w-[70%] ${isAdmin ? "text-right" : ""}`}>
                        <div className={`rounded-lg px-3 py-2 text-sm ${
                          isAdmin ? "bg-primary/20 text-foreground" : "bg-secondary/50 text-foreground"
                        }`}>
                          {msg.message}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {(msg.profiles as any)?.display_name || msg.sender_role} ·{" "}
                          {new Date(msg.created_at).toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              {activeDispute.status !== "closed" && (
                <div className="p-3 border-t border-border/50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message as Admin..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && messageText.trim() && sendMessage.mutate()}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      disabled={!messageText.trim() || sendMessage.isPending}
                      onClick={() => sendMessage.mutate()}
                      className="gap-1"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="glass border-border/50 h-[650px] flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm">Select a dispute to open the mediation chat</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDisputes;

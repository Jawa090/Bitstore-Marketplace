import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Plus, Trash2, GripVertical, SlidersHorizontal } from "lucide-react";
import { useDragReorder } from "@/hooks/useDragReorder";

interface FilterConfig {
  id: string;
  label: string;
  filter_type: string;
  is_enabled: boolean;
  display_order: number;
  options: any;
  config: any;
}

const AdminSearchFilters = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: filters, isLoading } = useQuery({
    queryKey: ["admin-search-filters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("search_filter_config")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as FilterConfig[];
    },
  });

  const { getDragProps } = useDragReorder(filters || [], async (reordered) => {
    const updates = reordered.map((f, i) =>
      supabase.from("search_filter_config").update({ display_order: i + 1 }).eq("id", f.id)
    );
    await Promise.all(updates);
    queryClient.invalidateQueries({ queryKey: ["admin-search-filters"] });
  });

  if (isLoading) return <p className="text-muted-foreground">Loading filters...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Search Filters</h1>
          <p className="text-muted-foreground text-sm">Manage which filters appear on the products page</p>
        </div>
      </div>

      <div className="space-y-3">
        {filters?.map((filter, i) => {
          const dragProps = getDragProps(i);
          return (
            <div
              key={filter.id}
              className={dragProps.className}
              draggable={dragProps.draggable}
              onDragStart={dragProps.onDragStart}
              onDragOver={dragProps.onDragOver}
              onDrop={dragProps.onDrop}
              onDragEnd={dragProps.onDragEnd}
            >
              <FilterEditor filter={filter} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

function FilterEditor({ filter }: { filter: FilterConfig }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(filter.label);
  const [filterType, setFilterType] = useState(filter.filter_type);
  const [isEnabled, setIsEnabled] = useState(filter.is_enabled);
  const [options, setOptions] = useState<any[]>(
    Array.isArray(filter.options) ? filter.options : []
  );
  const [config, setConfig] = useState<any>(filter.config || {});

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("search_filter_config")
        .update({
          label,
          filter_type: filterType,
          is_enabled: isEnabled,
          options,
          config,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq("id", filter.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-search-filters"] });
      queryClient.invalidateQueries({ queryKey: ["search-filter-config"] });
      toast.success("Filter saved");
      setIsEditing(false);
    },
    onError: () => toast.error("Failed to save"),
  });

  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from("search_filter_config")
        .update({ is_enabled: enabled, updated_at: new Date().toISOString(), updated_by: user?.id })
        .eq("id", filter.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-search-filters"] });
      queryClient.invalidateQueries({ queryKey: ["search-filter-config"] });
    },
  });

  const isObjectOptions = options.length > 0 && typeof options[0] === "object";

  const addOption = () => {
    if (isObjectOptions || filter.id === "condition") {
      setOptions([...options, { value: "", label: "" }]);
    } else {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: any) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {filter.label}
                <Badge variant="outline" className="text-[10px]">{filter.filter_type}</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filter.id} · {Array.isArray(filter.options) ? filter.options.length : 0} options
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={(v) => {
                setIsEnabled(v);
                toggleMutation.mutate(v);
              }}
            />
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? "Active" : "Hidden"}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isEditing && (
        <CardContent className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Label</label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="badge">Badge Pills</SelectItem>
                  <SelectItem value="range">Range Slider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Filter ID</label>
              <Input value={filter.id} disabled className="opacity-60" />
            </div>
          </div>

          {filterType === "range" ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Min</label>
                <Input
                  type="number"
                  value={config.min ?? 0}
                  onChange={(e) => setConfig({ ...config, min: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max</label>
                <Input
                  type="number"
                  value={config.max ?? 20000}
                  onChange={(e) => setConfig({ ...config, max: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Step</label>
                <Input
                  type="number"
                  value={config.step ?? 100}
                  onChange={(e) => setConfig({ ...config, step: Number(e.target.value) })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Options</label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  {isObjectOptions || filter.id === "condition" ? (
                    <>
                      <Input
                        value={typeof opt === "object" ? opt.value : ""}
                        onChange={(e) => updateOption(i, { ...opt, value: e.target.value })}
                        placeholder="Value"
                        className="flex-1"
                      />
                      <Input
                        value={typeof opt === "object" ? opt.label : ""}
                        onChange={(e) => updateOption(i, { ...opt, label: e.target.value })}
                        placeholder="Label"
                        className="flex-1"
                      />
                    </>
                  ) : (
                    <Input
                      value={typeof opt === "string" ? opt : ""}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder="Option value"
                      className="flex-1"
                    />
                  )}
                  <Button variant="ghost" size="icon" onClick={() => removeOption(i)} className="h-8 w-8 text-destructive shrink-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-3 w-3 mr-1" /> Add Option
              </Button>
            </div>
          )}

          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} size="sm">
            <Save className="h-4 w-4 mr-1" />
            {saveMutation.isPending ? "Saving..." : "Save Filter"}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

export default AdminSearchFilters;

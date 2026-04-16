import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, Package, X, Search } from "lucide-react";
import { logAuditEvent } from "@/lib/audit";
import { useDragReorder } from "@/hooks/useDragReorder";

const AdminCollections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: collections, isLoading } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*, collection_products(id, product_id, display_order, products:product_id(name, brand, price, slug))")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const slug = `collection-${Date.now()}`;
      const { error } = await supabase.from("collections").insert({
        name: "New Collection",
        slug,
        display_order: (collections?.length || 0) + 1,
      });
      if (error) throw error;
      if (user) await logAuditEvent({ action: "create", entityType: "collection", entityId: slug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] });
      toast.success("Collection created");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (col: { id: string; name: string; slug: string; description: string | null; badge_text: string | null; is_active: boolean; display_order: number }) => {
      const { error } = await supabase.from("collections").update({
        name: col.name,
        slug: col.slug,
        description: col.description,
        badge_text: col.badge_text,
        is_active: col.is_active,
        display_order: col.display_order,
      }).eq("id", col.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] });
      toast.success("Collection updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
      if (user) await logAuditEvent({ action: "delete", entityType: "collection", entityId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] });
      toast.success("Collection deleted");
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading collections...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Collections Manager</h1>
          <p className="text-muted-foreground text-sm">Curate product collections for the storefront</p>
        </div>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Plus className="h-4 w-4 mr-2" /> New Collection
        </Button>
      </div>

      <div className="space-y-4">
        {collections?.map((col) => (
          <CollectionCard
            key={col.id}
            collection={col}
            isEditing={editingId === col.id}
            onEdit={() => setEditingId(editingId === col.id ? null : col.id)}
            onSave={(updated) => {
              updateMutation.mutate(updated);
              setEditingId(null);
            }}
            onDelete={() => deleteMutation.mutate(col.id)}
            saving={updateMutation.isPending}
          />
        ))}
        {!collections?.length && (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No collections yet. Create one to get started.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

function CollectionCard({
  collection,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  saving,
}: {
  collection: any;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: any) => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(collection.name);
  const [slug, setSlug] = useState(collection.slug);
  const [description, setDescription] = useState(collection.description || "");
  const [badgeText, setBadgeText] = useState(collection.badge_text || "");
  const [isActive, setIsActive] = useState(collection.is_active);
  const productCount = collection.collection_products?.length || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {collection.name}
                {collection.badge_text && (
                  <Badge variant="secondary" className="text-xs">{collection.badge_text}</Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                /{collection.slug} · {productCount} product{productCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={collection.is_active ? "default" : "secondary"}>
              {collection.is_active ? "Active" : "Hidden"}
            </Badge>
            <Button variant="outline" size="sm" onClick={onEdit}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isEditing && (
        <CardContent className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Badge Text</label>
              <Input value={badgeText} onChange={(e) => setBadgeText(e.target.value)} placeholder="e.g. 🔥 Hot" />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm">{isActive ? "Visible" : "Hidden"}</span>
              </div>
            </div>
          </div>

          <ProductPicker collectionId={collection.id} existingProducts={collection.collection_products || []} />

          <Button
            onClick={() => onSave({
              id: collection.id,
              name, slug,
              description: description || null,
              badge_text: badgeText || null,
              is_active: isActive,
              display_order: collection.display_order,
            })}
            disabled={saving}
            size="sm"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

function ProductPicker({ collectionId, existingProducts }: { collectionId: string; existingProducts: any[] }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const existingIds = existingProducts.map((cp: any) => cp.product_id);

  const { data: searchResults } = useQuery({
    queryKey: ["product-search-picker", search],
    queryFn: async () => {
      if (!search || search.length < 2) return [];
      const { data } = await supabase
        .from("products")
        .select("id, name, brand, price")
        .ilike("name", `%${search}%`)
        .eq("is_active", true)
        .limit(10);
      return data || [];
    },
    enabled: search.length >= 2,
  });

  const addProduct = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from("collection_products").insert({
        collection_id: collectionId,
        product_id: productId,
        display_order: existingProducts.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] });
      toast.success("Product added to collection");
    },
  });

  const removeProduct = useMutation({
    mutationFn: async (cpId: string) => {
      const { error } = await supabase.from("collection_products").delete().eq("id", cpId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] });
      toast.success("Product removed");
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Products in Collection</label>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-3 w-3 mr-1" /> Add Products
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Products</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-1">
                {searchResults?.filter((p) => !existingIds.includes(p.id)).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brand} · AED {product.price}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addProduct.mutate(product.id)}
                      disabled={addProduct.isPending}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {search.length >= 2 && !searchResults?.filter((p) => !existingIds.includes(p.id)).length && (
                  <p className="text-sm text-muted-foreground text-center py-4">No matching products found</p>
                )}
                {search.length < 2 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Type at least 2 characters to search</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {existingProducts.length > 0 ? (
        <DraggableProductList
          products={existingProducts}
          onReorder={async (reordered) => {
            const updates = reordered.map((cp: any, i: number) =>
              supabase.from("collection_products").update({ display_order: i }).eq("id", cp.id)
            );
            await Promise.all(updates);
            queryClient.invalidateQueries({ queryKey: ["admin-collections"] });
          }}
          onRemove={(cpId) => removeProduct.mutate(cpId)}
        />
      ) : (
        <p className="text-xs text-muted-foreground py-2">No products added yet</p>
      )}
    </div>
  );
}

function DraggableProductList({
  products,
  onReorder,
  onRemove,
}: {
  products: any[];
  onReorder: (reordered: any[]) => void;
  onRemove: (cpId: string) => void;
}) {
  const sorted = [...products].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const { getDragProps } = useDragReorder(sorted, onReorder);

  return (
    <div className="space-y-1">
      {sorted.map((cp: any, i: number) => {
        const dragProps = getDragProps(i);
        return (
          <div
            key={cp.id}
            className={`flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50 ${dragProps.className}`}
            draggable={dragProps.draggable}
            onDragStart={dragProps.onDragStart}
            onDragOver={dragProps.onDragOver}
            onDrop={dragProps.onDrop}
            onDragEnd={dragProps.onDragEnd}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing" />
              <p className="text-sm">{(cp.products as any)?.name || "Unknown product"}</p>
              <span className="text-xs text-muted-foreground">
                {(cp.products as any)?.brand} · AED {(cp.products as any)?.price}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={() => onRemove(cp.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}


export default AdminCollections;

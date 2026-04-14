import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  GripVertical,
  Plus,
  Trash2,
  Package,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  Tag,
  Edit2,
  Check,
} from "lucide-react";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  badge_text: string | null;
}

interface CollectionProduct {
  id: string;
  collection_id: string;
  product_id: string;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  slug: string;
}

const AdminCategories = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editBadge, setEditBadge] = useState("");
  const [draggedCollection, setDraggedCollection] = useState<string | null>(null);
  const [dragOverCollection, setDragOverCollection] = useState<string | null>(null);
  const [draggedProduct, setDraggedProduct] = useState<{ collectionId: string; productId: string } | null>(null);
  const [dragOverProduct, setDragOverProduct] = useState<string | null>(null);

  const { data: collections = [] } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as Collection[];
    },
  });

  const { data: collectionProducts = [] } = useQuery({
    queryKey: ["admin-collection-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collection_products")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as CollectionProduct[];
    },
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ["admin-products-for-collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, price, currency, slug")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Product[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-collections"] });
    qc.invalidateQueries({ queryKey: ["admin-collection-products"] });
  };

  const createCollection = useMutation({
    mutationFn: async (name: string) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const maxOrder = Math.max(0, ...collections.map((c) => c.display_order));
      const { error } = await supabase.from("collections").insert({
        name,
        slug,
        display_order: maxOrder + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); setNewName(""); toast({ title: "Collection created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateCollection = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Collection> }) => {
      const { error } = await supabase.from("collections").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); setEditingId(null); toast({ title: "Updated" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteCollection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast({ title: "Collection deleted" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addProduct = useMutation({
    mutationFn: async ({ collectionId, productId }: { collectionId: string; productId: string }) => {
      const existing = collectionProducts.filter((cp) => cp.collection_id === collectionId);
      const maxOrder = Math.max(0, ...existing.map((cp) => cp.display_order));
      const { error } = await supabase.from("collection_products").insert({
        collection_id: collectionId,
        product_id: productId,
        display_order: maxOrder + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast({ title: "Product added" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const removeProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collection_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast({ title: "Product removed" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const reorderCollections = async (dragId: string, dropId: string) => {
    if (dragId === dropId) return;
    const sorted = [...collections].sort((a, b) => a.display_order - b.display_order);
    const dragIdx = sorted.findIndex((c) => c.id === dragId);
    const dropIdx = sorted.findIndex((c) => c.id === dropId);
    if (dragIdx === -1 || dropIdx === -1) return;
    const [moved] = sorted.splice(dragIdx, 1);
    sorted.splice(dropIdx, 0, moved);
    await Promise.all(
      sorted.map((c, i) =>
        supabase.from("collections").update({ display_order: i }).eq("id", c.id)
      )
    );
    invalidate();
  };

  const reorderProducts = async (collectionId: string, dragProductId: string, dropProductId: string) => {
    if (dragProductId === dropProductId) return;
    const items = collectionProducts
      .filter((cp) => cp.collection_id === collectionId)
      .sort((a, b) => a.display_order - b.display_order);
    const dragIdx = items.findIndex((cp) => cp.product_id === dragProductId);
    const dropIdx = items.findIndex((cp) => cp.product_id === dropProductId);
    if (dragIdx === -1 || dropIdx === -1) return;
    const [moved] = items.splice(dragIdx, 1);
    items.splice(dropIdx, 0, moved);
    await Promise.all(
      items.map((cp, i) =>
        supabase.from("collection_products").update({ display_order: i }).eq("id", cp.id)
      )
    );
    invalidate();
  };

  const getCollectionProducts = (collectionId: string) => {
    const cpIds = collectionProducts
      .filter((cp) => cp.collection_id === collectionId)
      .sort((a, b) => a.display_order - b.display_order);
    return cpIds
      .map((cp) => {
        const product = allProducts.find((p) => p.id === cp.product_id);
        return product ? { ...product, cpId: cp.id } : null;
      })
      .filter(Boolean) as (Product & { cpId: string })[];
  };

  const getAvailableProducts = (collectionId: string) => {
    const assignedIds = new Set(
      collectionProducts.filter((cp) => cp.collection_id === collectionId).map((cp) => cp.product_id)
    );
    return allProducts.filter(
      (p) => !assignedIds.has(p.id) && (!productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Category Manager</h1>
        <p className="text-sm text-muted-foreground">
          Drag to reorder collections and products. Manage Flash Sales, Ramadan Deals, and more.
        </p>
      </div>

      {/* Create new */}
      <Card className="glass border-border/50">
        <CardContent className="p-4 flex gap-3">
          <Input
            placeholder="New collection name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newName.trim() && createCollection.mutate(newName.trim())}
            className="flex-1"
          />
          <Button
            onClick={() => newName.trim() && createCollection.mutate(newName.trim())}
            disabled={!newName.trim() || createCollection.isPending}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Collection
          </Button>
        </CardContent>
      </Card>

      {/* Collection List */}
      <div className="space-y-3">
        {collections.map((col) => {
          const isExpanded = expandedId === col.id;
          const products = getCollectionProducts(col.id);
          const isEditing = editingId === col.id;
          const isDragOver = dragOverCollection === col.id;

          return (
            <Card
              key={col.id}
              className={`glass border-border/50 transition-all ${isDragOver ? "ring-2 ring-primary/50" : ""}`}
              draggable
              onDragStart={() => setDraggedCollection(col.id)}
              onDragEnd={() => { setDraggedCollection(null); setDragOverCollection(null); }}
              onDragOver={(e) => { e.preventDefault(); setDragOverCollection(col.id); }}
              onDragLeave={() => setDragOverCollection(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverCollection(null);
                if (draggedCollection && draggedCollection !== col.id) {
                  reorderCollections(draggedCollection, col.id);
                }
              }}
            >
              <CardContent className="p-0">
                {/* Collection Header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />

                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 text-sm flex-1"
                        autoFocus
                      />
                      <Input
                        value={editBadge}
                        onChange={(e) => setEditBadge(e.target.value)}
                        placeholder="Badge"
                        className="h-8 text-sm w-20"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7"
                        onClick={() =>
                          updateCollection.mutate({
                            id: col.id,
                            updates: { name: editName, badge_text: editBadge || null },
                          })
                        }
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-medium text-sm">{col.name}</span>
                          {col.badge_text && (
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                              {col.badge_text}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">({products.length} products)</span>
                        </div>
                        {col.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 ml-6">{col.description}</p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={col.is_active}
                      onCheckedChange={(checked) =>
                        updateCollection.mutate({ id: col.id, updates: { is_active: checked } })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        setEditingId(col.id);
                        setEditName(col.name);
                        setEditBadge(col.badge_text || "");
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteCollection.mutate(col.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setExpandedId(isExpanded ? null : col.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded: Product list + add products */}
                {isExpanded && (
                  <div className="border-t border-border/50 px-4 py-3 space-y-3">
                    {/* Current products */}
                    {products.length > 0 ? (
                      <div className="space-y-1">
                        {products.map((p) => (
                          <div
                            key={p.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/30 transition-all ${
                              dragOverProduct === p.id ? "ring-1 ring-primary/50" : ""
                            }`}
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              setDraggedProduct({ collectionId: col.id, productId: p.id });
                            }}
                            onDragEnd={() => { setDraggedProduct(null); setDragOverProduct(null); }}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverProduct(p.id); }}
                            onDragLeave={() => setDragOverProduct(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDragOverProduct(null);
                              if (draggedProduct && draggedProduct.collectionId === col.id) {
                                reorderProducts(col.id, draggedProduct.productId, p.id);
                              }
                            }}
                          >
                            <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab shrink-0" />
                            <Package className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-sm flex-1 truncate">{p.name}</span>
                            <span className="text-xs text-muted-foreground">{p.brand}</span>
                            <span className="text-xs font-medium">{p.currency} {p.price.toLocaleString()}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeProduct.mutate(p.cpId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No products in this collection. Search and add below.
                      </p>
                    )}

                    {/* Add products */}
                    <div className="border-t border-border/30 pt-3">
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Search products to add..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="pl-9 h-8 text-sm"
                        />
                      </div>
                      {productSearch && (
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {getAvailableProducts(col.id).slice(0, 8).map((p) => (
                            <button
                              key={p.id}
                              onClick={() => addProduct.mutate({ collectionId: col.id, productId: p.id })}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                            >
                              <Plus className="h-3 w-3 text-primary shrink-0" />
                              <span className="text-sm flex-1 truncate">{p.name}</span>
                              <span className="text-xs text-muted-foreground">{p.brand}</span>
                              <span className="text-xs">{p.currency} {p.price.toLocaleString()}</span>
                            </button>
                          ))}
                          {getAvailableProducts(col.id).length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2">No matching products</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {collections.length === 0 && (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Tag className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No collections yet. Create your first one above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;

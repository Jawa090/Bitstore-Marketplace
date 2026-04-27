import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { mockProducts } from "@/data/mockData";
import {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCartApi,
} from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  imageUrl?: string;
  vendorId: string;
  vendorName: string;
  slug: string;
  stock: number; // available_stock from backend
}

// Guest cart stored in localStorage (minimal shape)
interface GuestCartItem {
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  imageUrl?: string;
  vendorId: string;
  vendorName: string;
  slug: string;
  stock: number;
}

const GUEST_CART_KEY = "bitstores_guest_cart";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  itemsByVendor: Record<string, { vendorName: string; vendorId: string; items: CartItem[] }>;
  cartLoading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [], addItem: () => {}, removeItem: () => {}, updateQuantity: () => {}, clearCart: () => {},
  totalItems: 0, totalAmount: 0, itemsByVendor: {}, cartLoading: false, refreshCart: async () => {},
});

export const useCart = () => useContext(CartContext);

// ── Guest cart helpers ────────────────────────────────────────────────
const getGuestCart = (): GuestCartItem[] => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveGuestCart = (items: GuestCartItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

export const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
};

export const getGuestCartForSync = (): { productId: string; quantity: number }[] => {
  return getGuestCart().map((i) => ({ productId: i.productId, quantity: i.quantity }));
};

// ── Hydrate backend items from mockData ──────────────────────────────
// The backend only stores product_id + quantity. We look up the product
// catalog (mockData for now, real API later) to fill in name, price, etc.
const hydrateBackendItem = (bi: any): CartItem => {
  const product = mockProducts.find((p) => p.id === bi.product_id);
  // Defensive stock chain: backend available_stock → mockData stock_quantity → fallback 10
  const resolvedStock = Number(bi.available_stock) || Number(product?.stock_quantity) || 10;
  return {
    productId: bi.product_id,
    name: product?.name || "Unknown Product",
    price: product?.price || 0,
    currency: product?.currency || "AED",
    quantity: bi.quantity,
    imageUrl: product?.images?.[0]?.image_url,
    vendorId: product?.vendor_id || "unknown",
    vendorName: product?.vendor?.store_name || "BitStores",
    slug: product?.slug || bi.product_id,
    stock: resolvedStock,
  };
};

// ── Provider ──────────────────────────────────────────────────────────
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  // ── Load cart from backend or localStorage ────────────────────────
  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      setCartLoading(true);
      try {
        const res = await fetchCart();
        const backendItems = res.data.data.cart.items || [];
        const mapped: CartItem[] = backendItems.map(hydrateBackendItem);
        setItems(mapped);
      } catch {
        // Silently fail — keep current items
      } finally {
        setCartLoading(false);
      }
    } else {
      // Load from localStorage for guests
      setItems(getGuestCart());
    }
  }, [isAuthenticated]);

  // Reload when auth state changes
  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, refreshCart]);

  // ── Add Item ──────────────────────────────────────────────────────
  const addItem = useCallback(
    async (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const qty = item.quantity ?? 1;

      if (isAuthenticated) {
        try {
          await addCartItem(item.productId, qty);
          // Refresh from backend to get authoritative quantities + stock
          await refreshCart();
        } catch (error: any) {
          toast({
            title: "Cannot add item",
            description: error.displayMessage || "Requested quantity exceeds available stock.",
            variant: "destructive",
          });
        }
      } else {
        // Guest: save to localStorage
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === item.productId);
          let updated: GuestCartItem[];
          if (existing) {
            updated = prev.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.quantity + qty, i.stock) }
                : i
            );
          } else {
            updated = [...prev, { ...item, quantity: qty, stock: item.stock || 10 }];
          }
          saveGuestCart(updated);
          return updated;
        });
      }
    },
    [isAuthenticated, refreshCart, toast]
  );

  // ── Remove Item ───────────────────────────────────────────────────
  const removeItem = useCallback(
    async (productId: string) => {
      if (isAuthenticated) {
        try {
          await removeCartItem(productId);
          setItems((prev) => prev.filter((i) => i.productId !== productId));
        } catch {
          toast({ title: "Failed to remove item", variant: "destructive" });
        }
      } else {
        setItems((prev) => {
          const updated = prev.filter((i) => i.productId !== productId);
          saveGuestCart(updated);
          return updated;
        });
      }
    },
    [isAuthenticated, toast]
  );

  // ── Update Quantity ───────────────────────────────────────────────
  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      if (isAuthenticated) {
        try {
          await updateCartItem(productId, quantity);
          setItems((prev) =>
            prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
          );
        } catch (error: any) {
          toast({
            title: "Cannot update quantity",
            description: error.displayMessage || "Requested quantity exceeds available stock.",
            variant: "destructive",
          });
        }
      } else {
        setItems((prev) => {
          const updated = prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          );
          saveGuestCart(updated);
          return updated;
        });
      }
    },
    [isAuthenticated, removeItem, toast]
  );

  // ── Clear Cart ────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await clearCartApi();
      } catch {
        // Silently fail
      }
    } else {
      clearGuestCart();
    }
    setItems([]);
  }, [isAuthenticated]);

  // ── Derived state ──────────────────────────────────────────────────
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const itemsByVendor = items.reduce<CartContextType["itemsByVendor"]>((acc, item) => {
    if (!acc[item.vendorId]) acc[item.vendorId] = { vendorName: item.vendorName, vendorId: item.vendorId, items: [] };
    acc[item.vendorId].items.push(item);
    return acc;
  }, {});

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount, itemsByVendor, cartLoading, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

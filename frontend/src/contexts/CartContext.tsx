import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cartService } from "@/services/api/cart.service";
import { productService } from "@/services/api/product.service";

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
  stock: number;
}

// Guest cart stored in localStorage
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
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
  itemsByVendor: Record<string, { vendorName: string; vendorId: string; items: CartItem[] }>;
  cartLoading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: async () => {},
  removeItem: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  totalItems: 0,
  totalAmount: 0,
  itemsByVendor: {},
  cartLoading: false,
  refreshCart: async () => {},
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

// ── Product cache to avoid repeated API calls ────────────────────────
const productCache = new Map<string, any>();

const fetchProductDetails = async (productId: string) => {
  if (productCache.has(productId)) {
    return productCache.get(productId);
  }
  
  try {
    const product = await productService.getProductById(productId);
    productCache.set(productId, product);
    return product;
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return null;
  }
};

// ── Hydrate backend items with product details ───────────────────────
const hydrateBackendItem = async (backendItem: any): Promise<CartItem> => {
  const product = await fetchProductDetails(backendItem.product_id);
  
  if (!product) {
    // Fallback if product fetch fails
    return {
      productId: backendItem.product_id,
      name: "Unknown Product",
      price: 0,
      currency: "AED",
      quantity: backendItem.quantity,
      imageUrl: undefined,
      vendorId: "unknown",
      vendorName: "BitStores",
      slug: backendItem.product_id,
      stock: backendItem.available_stock || 0,
    };
  }

  return {
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    currency: "AED",
    quantity: backendItem.quantity,
    imageUrl: product.images?.[0]?.image_url,
    vendorId: product.vendor_id || "unknown",
    vendorName: product.vendor?.store_name || "BitStores",
    slug: product.slug,
    stock: backendItem.available_stock || product.stock_quantity || 0,
  };
};

// ── Provider ──────────────────────────────────────────────────────────
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // ── Load cart from backend or localStorage ────────────────────────
  const refreshCart = useCallback(async () => {
    if (isAuthenticated && user) {
      setCartLoading(true);
      try {
        const cartData = await cartService.getCart();
        const backendItems = cartData.cart.items || [];
        
        // Hydrate all items with product details
        const hydratedItems = await Promise.all(
          backendItems.map((item) => hydrateBackendItem(item))
        );
        
        setItems(hydratedItems);
      } catch (error: any) {
        // If cart doesn't exist yet (404), that's okay - start with empty cart
        if (error.response?.status !== 404) {
          console.error("Failed to load cart:", error);
        }
        setItems([]);
      } finally {
        setCartLoading(false);
        setHasLoadedOnce(true);
      }
    } else {
      // Load from localStorage for guests
      setItems(getGuestCart());
      setHasLoadedOnce(true);
    }
  }, [isAuthenticated, user]);

  // ── Sync guest cart after login ───────────────────────────────────
  useEffect(() => {
    const syncGuestCart = async () => {
      if (isAuthenticated && user && hasLoadedOnce) {
        const guestItems = getGuestCartForSync();
        if (guestItems.length > 0) {
          try {
            await cartService.syncCart(guestItems);
            clearGuestCart();
            await refreshCart();
            toast({
              title: "Cart synced",
              description: "Your cart items have been saved.",
            });
          } catch (error) {
            console.error("Failed to sync guest cart:", error);
          }
        }
      }
    };

    syncGuestCart();
  }, [isAuthenticated, user, hasLoadedOnce, refreshCart, toast]);

  // Reload when auth state changes
  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, refreshCart]);

  // ── Add Item ──────────────────────────────────────────────────────
  const addItem = useCallback(
    async (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const qty = item.quantity ?? 1;

      if (isAuthenticated && user) {
        try {
          await cartService.addItem(item.productId, qty);
          await refreshCart();
          toast({
            title: "Added to cart",
            description: `${item.name} has been added to your cart.`,
          });
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
          toast({
            title: "Added to cart",
            description: `${item.name} has been added to your cart.`,
          });
          return updated;
        });
      }
    },
    [isAuthenticated, user, refreshCart, toast]
  );

  // ── Remove Item ───────────────────────────────────────────────────
  const removeItem = useCallback(
    async (productId: string) => {
      if (isAuthenticated && user) {
        try {
          await cartService.removeItem(productId);
          setItems((prev) => prev.filter((i) => i.productId !== productId));
          toast({
            title: "Item removed",
            description: "Item has been removed from your cart.",
          });
        } catch (error) {
          toast({
            title: "Failed to remove item",
            variant: "destructive",
          });
        }
      } else {
        setItems((prev) => {
          const updated = prev.filter((i) => i.productId !== productId);
          saveGuestCart(updated);
          toast({
            title: "Item removed",
            description: "Item has been removed from your cart.",
          });
          return updated;
        });
      }
    },
    [isAuthenticated, user, toast]
  );

  // ── Update Quantity ───────────────────────────────────────────────
  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItem(productId);
        return;
      }

      if (isAuthenticated && user) {
        try {
          await cartService.updateItem(productId, quantity);
          setItems((prev) =>
            prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
          );
        } catch (error: any) {
          toast({
            title: "Cannot update quantity",
            description: error.displayMessage || "Requested quantity exceeds available stock.",
            variant: "destructive",
          });
          // Refresh to get correct quantities from backend
          await refreshCart();
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
    [isAuthenticated, user, removeItem, toast, refreshCart]
  );

  // ── Clear Cart ────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        await cartService.clearCart();
      } catch (error) {
        console.error("Failed to clear cart:", error);
      }
    } else {
      clearGuestCart();
    }
    setItems([]);
  }, [isAuthenticated, user]);

  // ── Derived state ──────────────────────────────────────────────────
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const itemsByVendor = items.reduce<CartContextType["itemsByVendor"]>((acc, item) => {
    if (!acc[item.vendorId]) {
      acc[item.vendorId] = {
        vendorName: item.vendorName,
        vendorId: item.vendorId,
        items: [],
      };
    }
    acc[item.vendorId].items.push(item);
    return acc;
  }, {});

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        itemsByVendor,
        cartLoading,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

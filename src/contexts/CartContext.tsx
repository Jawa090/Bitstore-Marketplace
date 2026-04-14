import { createContext, useContext, useState, ReactNode, useCallback } from "react";

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

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  itemsByVendor: Record<string, { vendorName: string; vendorId: string; items: CartItem[] }>;
}

const CartContext = createContext<CartContextType>({
  items: [], addItem: () => {}, removeItem: () => {}, updateQuantity: () => {}, clearCart: () => {},
  totalItems: 0, totalAmount: 0, itemsByVendor: {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const qty = item.quantity ?? 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) => i.productId === item.productId ? { ...i, quantity: Math.min(i.quantity + qty, i.stock) } : i);
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) { setItems((prev) => prev.filter((i) => i.productId !== productId)); return; }
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const itemsByVendor = items.reduce<CartContextType["itemsByVendor"]>((acc, item) => {
    if (!acc[item.vendorId]) acc[item.vendorId] = { vendorName: item.vendorName, vendorId: item.vendorId, items: [] };
    acc[item.vendorId].items.push(item);
    return acc;
  }, {});

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount, itemsByVendor }}>
      {children}
    </CartContext.Provider>
  );
};

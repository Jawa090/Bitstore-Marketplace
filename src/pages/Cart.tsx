import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Store } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Cart = () => {
  const { items, itemsByVendor, updateQuantity, removeItem, totalAmount, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Browse our marketplace and add some items</p>
          <Link to="/">
            <Button><ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-16">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">
          Shopping Cart <span className="text-muted-foreground font-normal text-lg">({totalItems} items)</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items grouped by vendor */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {Object.entries(itemsByVendor).map(([vendorId, group]) => (
                <motion.div
                  key={vendorId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-border overflow-hidden"
                >
                  {/* Vendor header */}
                  <div className="flex items-center gap-2 px-5 py-3 bg-secondary/50 border-b border-border">
                    <Store className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Shipped by {group.vendorName}</span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-border">
                    {group.items.map((item) => (
                      <div key={item.productId} className="flex gap-4 p-5">
                        <Link to={`/product/${item.slug}`} className="shrink-0">
                          <div className="h-20 w-20 rounded-lg bg-secondary overflow-hidden">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.slug}`}>
                            <h3 className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-lg font-bold text-foreground mt-1">
                            {item.currency} {(item.price * item.quantity).toLocaleString()}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-border rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="p-1.5 hover:bg-secondary transition-colors rounded-l-lg"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="px-3 text-sm font-medium min-w-[32px] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="p-1.5 hover:bg-secondary transition-colors rounded-r-lg"
                                disabled={item.quantity >= item.stock}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border p-5 space-y-4 sticky top-24">
              <h2 className="text-lg font-display font-semibold text-foreground">Order Summary</h2>

              {Object.entries(itemsByVendor).map(([vendorId, group]) => {
                const subtotal = group.items.reduce((s, i) => s + i.price * i.quantity, 0);
                return (
                  <div key={vendorId} className="text-sm space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{group.vendorName}</span>
                      <span>AED {subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-border pt-3 flex justify-between text-foreground font-semibold">
                <span>Total</span>
                <span>AED {totalAmount.toLocaleString()}</span>
              </div>

              <Link to="/checkout" className="block">
                <Button className="w-full h-11 glow">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link to="/" className="block">
                <Button variant="ghost" className="w-full text-muted-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;

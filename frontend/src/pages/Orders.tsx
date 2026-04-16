import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Package, Truck, CheckCircle, XCircle, ArrowLeft, ShoppingBag, Calendar, DollarSign, Hash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: "delivered" | "shipped" | "processing" | "cancelled" | "returned";
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    date: "2024-04-10",
    total: 1299.99,
    status: "delivered",
    items: [
      {
        id: "1",
        name: "iPhone 15 Pro Max 256GB - Natural Titanium",
        image: "/api/placeholder/80/80",
        price: 1299.99,
        quantity: 1,
      },
    ],
    trackingNumber: "TRK123456789",
  },
  {
    id: "ORD-2024-002", 
    date: "2024-04-12",
    total: 899.99,
    status: "shipped",
    items: [
      {
        id: "2",
        name: "MacBook Air M3 13-inch - Midnight",
        image: "/api/placeholder/80/80",
        price: 899.99,
        quantity: 1,
      },
    ],
    trackingNumber: "TRK987654321",
    estimatedDelivery: "2024-04-16",
  },
  {
    id: "ORD-2024-003",
    date: "2024-04-08",
    total: 199.99,
    status: "cancelled",
    items: [
      {
        id: "3",
        name: "AirPods Pro (2nd generation)",
        image: "/api/placeholder/80/80",
        price: 199.99,
        quantity: 1,
      },
    ],
  },
];

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnComments, setReturnComments] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Simulate loading orders
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Filter orders based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-600" />;
      case "processing":
        return <Package className="h-4 w-4 text-yellow-600" />;
      case "cancelled":
      case "returned":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
      case "returned":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleReturnSubmit = () => {
    if (selectedOrder && returnReason) {
      // Update order status to returned
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: "returned" as const }
          : order
      ));
      
      setReturnModalOpen(false);
      setReturnReason("");
      setReturnComments("");
      setSelectedOrder(null);
    }
  };

  const getOrdersByStatus = (status?: string) => {
    if (!status) return filteredOrders;
    
    switch (status) {
      case "orders":
        return filteredOrders.filter(order => 
          !["cancelled", "returned"].includes(order.status)
        );
      case "cancelled":
        return filteredOrders.filter(order => 
          ["cancelled", "returned"].includes(order.status)
        );
      case "buy-again":
        return filteredOrders.filter(order => order.status === "delivered");
      default:
        return filteredOrders;
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shopping
              </Button>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Orders</h1>
          <p className="text-muted-foreground">Track, return, or buy things again</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="buy-again">Buy Again</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled/Returned</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading your orders...</span>
            </div>
          ) : (
            <>
              <TabsContent value="orders">
                <OrdersList orders={getOrdersByStatus("orders")} onReturn={(order) => {
                  setSelectedOrder(order);
                  setReturnModalOpen(true);
                }} />
              </TabsContent>

              <TabsContent value="buy-again">
                <OrdersList orders={getOrdersByStatus("buy-again")} showBuyAgain onReturn={(order) => {
                  setSelectedOrder(order);
                  setReturnModalOpen(true);
                }} />
              </TabsContent>

              <TabsContent value="cancelled">
                <OrdersList orders={getOrdersByStatus("cancelled")} onReturn={(order) => {
                  setSelectedOrder(order);
                  setReturnModalOpen(true);
                }} />
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Return Modal */}
        <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Return or Replace Items</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Reason for return
                </label>
                <Select value={returnReason} onValueChange={setReturnReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defective">Item is defective</SelectItem>
                    <SelectItem value="wrong-item">Wrong item received</SelectItem>
                    <SelectItem value="not-as-described">Not as described</SelectItem>
                    <SelectItem value="damaged">Item arrived damaged</SelectItem>
                    <SelectItem value="changed-mind">Changed my mind</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Additional comments (optional)
                </label>
                <Textarea
                  placeholder="Tell us more about the issue..."
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleReturnSubmit}
                  disabled={!returnReason}
                  className="flex-1"
                >
                  Submit Return Request
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setReturnModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

interface OrdersListProps {
  orders: Order[];
  showBuyAgain?: boolean;
  onReturn: (order: Order) => void;
}

const OrdersList = ({ orders, showBuyAgain, onReturn }: OrdersListProps) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No orders found</h3>
        <p className="text-muted-foreground mb-6">You haven't placed any orders yet</p>
        <Link to="/">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="bg-white border border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Order placed: {new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Total: ${order.total.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  <span>{order.id}</span>
                </div>
              </div>
              
              <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 mb-4 last:mb-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground mb-1 line-clamp-2">
                    {item.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Quantity: {item.quantity} • ${item.price.toFixed(2)}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    
                    {order.status === "shipped" && (
                      <Button size="sm" variant="outline">
                        Track Package
                      </Button>
                    )}
                    
                    {order.status === "delivered" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onReturn(order)}
                      >
                        Return or Replace
                      </Button>
                    )}
                    
                    {showBuyAgain && (
                      <Button size="sm">
                        Buy Again
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {order.trackingNumber && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Tracking:</strong> {order.trackingNumber}
                  {order.estimatedDelivery && (
                    <span className="ml-4">
                      <strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const getStatusIcon = (status: Order["status"]) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "shipped":
      return <Truck className="h-4 w-4 text-blue-600" />;
    case "processing":
      return <Package className="h-4 w-4 text-yellow-600" />;
    case "cancelled":
    case "returned":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Package className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200";
    case "shipped":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "processing":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "cancelled":
    case "returned":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default Orders;
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import BitBotWidget from "@/components/bitbot/BitBotWidget";
import Index from "./pages/Index.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Cart from "./pages/Cart.tsx";
import Orders from "./pages/Orders.tsx";
import Checkout from "./pages/Checkout.tsx";
import OrderConfirmation from "./pages/OrderConfirmation.tsx";
import VendorLayout from "./pages/vendor/VendorLayout.tsx";
import VendorOverview from "./pages/vendor/VendorOverview.tsx";
import VendorProducts from "./pages/vendor/VendorProducts.tsx";
import ProductForm from "./pages/vendor/ProductForm.tsx";
import VendorOrders from "./pages/vendor/VendorOrders.tsx";
import VendorShipping from "./pages/vendor/VendorShipping.tsx";
import VendorAnalytics from "./pages/vendor/VendorAnalytics.tsx";
import VendorSettings from "./pages/vendor/VendorSettings.tsx";
import VendorApply from "./pages/vendor/VendorApply.tsx";
import VendorPayouts from "./pages/vendor/VendorPayouts.tsx";
import LanguageSettings from "./pages/LanguageSettings.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminOverview from "./pages/admin/AdminOverview.tsx";
import AdminVendors from "./pages/admin/AdminVendors.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminFinancials from "./pages/admin/AdminFinancials.tsx";
import AdminCategories from "./pages/admin/AdminCategories.tsx";
import AdminRemittance from "./pages/admin/AdminRemittance.tsx";
import AdminAITuning from "./pages/admin/AdminAITuning.tsx";
import AdminTradeLicenses from "./pages/admin/AdminTradeLicenses.tsx";
import AdminVATEngine from "./pages/admin/AdminVATEngine.tsx";
import AdminDisputes from "./pages/admin/AdminDisputes.tsx";
import AdminIntegrations from "./pages/admin/AdminIntegrations.tsx";
import AdminFlashSales from "./pages/admin/AdminFlashSales.tsx";
import AdminAbandonedCarts from "./pages/admin/AdminAbandonedCarts.tsx";
import AdminSEOEditor from "./pages/admin/AdminSEOEditor.tsx";
import AdminCSVImporter from "./pages/admin/AdminCSVImporter.tsx";
import AdminBenchmarking from "./pages/admin/AdminBenchmarking.tsx";
import AdminAttributeSets from "./pages/admin/AdminAttributeSets.tsx";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs.tsx";
import AdminStaffAccess from "./pages/admin/AdminStaffAccess.tsx";
import AdminWarehouseLocations from "./pages/admin/AdminWarehouseLocations.tsx";
import AdminStorefront from "./pages/admin/AdminStorefront.tsx";
import AdminCollections from "./pages/admin/AdminCollections.tsx";
import AdminSearchFilters from "./pages/admin/AdminSearchFilters.tsx";
import AdminPromoBanners from "./pages/admin/AdminPromoBanners.tsx";
import CollectionPage from "./pages/CollectionPage.tsx";
import SearchPage from "./pages/Search.tsx";
import AuctionDetail from "./pages/AuctionDetail.tsx";
import AdminAuctions from "./pages/admin/AdminAuctions.tsx";
import AdminProductImport from "./pages/admin/AdminProductImport.tsx";
import AdminFulfillment from "./pages/admin/AdminFulfillment.tsx";
import AdminStoreSettings from "./pages/admin/AdminStoreSettings.tsx";
import VendorAuctions from "./pages/vendor/VendorAuctions.tsx";
import Wholesale from "./pages/Wholesale.tsx";
import Auctions from "./pages/Auctions.tsx";
import ShippingGuide from "./pages/ShippingGuide.tsx";
import HelpCenter from "./pages/HelpCenter.tsx";
import Returns from "./pages/Returns.tsx";
import ContactUs from "./pages/ContactUs.tsx";
import TradeIn from "./pages/TradeIn.tsx";
import Accessories from "./pages/Accessories.tsx";
import Dropshipping from "./pages/Dropshipping.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/collection/:slug" element={<CollectionPage />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/auction/:id" element={<AuctionDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
              <Route path="/wholesale" element={<Wholesale />} />
              <Route path="/auctions" element={<Auctions />} />
              <Route path="/shipping" element={<ShippingGuide />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/trade-in" element={<TradeIn />} />
              <Route path="/accessories" element={<Accessories />} />
              <Route path="/dropshipping" element={<Dropshipping />} />
              <Route path="/settings/language" element={<LanguageSettings />} />
              <Route path="/vendor/apply" element={<VendorApply />} />
              <Route path="/vendor" element={<VendorLayout />}>
                <Route index element={<VendorOverview />} />
                <Route path="products" element={<VendorProducts />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
                <Route path="orders" element={<VendorOrders />} />
                <Route path="shipping" element={<VendorShipping />} />
                <Route path="analytics" element={<VendorAnalytics />} />
                <Route path="settings" element={<VendorSettings />} />
                <Route path="payouts" element={<VendorPayouts />} />
                <Route path="auctions" element={<VendorAuctions />} />
              </Route>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="vendors" element={<AdminVendors />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="financials" element={<AdminFinancials />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="remittance" element={<AdminRemittance />} />
                <Route path="ai-tuning" element={<AdminAITuning />} />
                <Route path="trade-licenses" element={<AdminTradeLicenses />} />
                <Route path="vat" element={<AdminVATEngine />} />
                <Route path="disputes" element={<AdminDisputes />} />
                <Route path="integrations" element={<AdminIntegrations />} />
                <Route path="flash-sales" element={<AdminFlashSales />} />
                <Route path="abandoned-carts" element={<AdminAbandonedCarts />} />
                <Route path="seo" element={<AdminSEOEditor />} />
                <Route path="csv-import" element={<AdminCSVImporter />} />
                <Route path="benchmarking" element={<AdminBenchmarking />} />
                <Route path="attribute-sets" element={<AdminAttributeSets />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="staff-access" element={<AdminStaffAccess />} />
                <Route path="warehouses" element={<AdminWarehouseLocations />} />
                <Route path="storefront" element={<AdminStorefront />} />
                <Route path="collections" element={<AdminCollections />} />
                <Route path="search-filters" element={<AdminSearchFilters />} />
                <Route path="promo-banners" element={<AdminPromoBanners />} />
                <Route path="auctions" element={<AdminAuctions />} />
                <Route path="store-settings" element={<AdminStoreSettings />} />
                <Route path="product-import" element={<AdminProductImport />} />
                <Route path="fulfillment" element={<AdminFulfillment />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BitBotWidget />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

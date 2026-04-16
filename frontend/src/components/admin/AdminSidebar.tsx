import { LayoutDashboard, Store, Users, ShoppingBag, Shield, Package, DollarSign, Layers, Truck, Brain, FileCheck, Receipt, MessageSquare, Plug, Zap, ShoppingCart, Globe, FileSpreadsheet, BarChart3, History, ShieldCheck, Warehouse, Settings, TrendingUp, ChevronRight, PaintBucket, FolderHeart, Filter, Megaphone, Gavel, CloudDownload, PackageCheck } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const coreItems = [
  { title: "The Pulse", url: "/admin", icon: LayoutDashboard },
  { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Vendors", url: "/admin/vendors", icon: Store },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Disputes", url: "/admin/disputes", icon: MessageSquare },
  { title: "Storefront CMS", url: "/admin/storefront", icon: PaintBucket },
];

const commerceItems = [
  { title: "Financials", url: "/admin/financials", icon: DollarSign },
  { title: "Remittance", url: "/admin/remittance", icon: Truck },
  { title: "Flash Sales", url: "/admin/flash-sales", icon: Zap },
  { title: "Promo Banners", url: "/admin/promo-banners", icon: Megaphone },
  { title: "Abandoned Carts", url: "/admin/abandoned-carts", icon: ShoppingCart },
  { title: "Auctions", url: "/admin/auctions", icon: Gavel },
  { title: "Fulfillment", url: "/admin/fulfillment", icon: PackageCheck },
];

const catalogItems = [
  { title: "Categories", url: "/admin/categories", icon: Layers },
  { title: "Collections", url: "/admin/collections", icon: FolderHeart },
  { title: "Search Filters", url: "/admin/search-filters", icon: Filter },
  { title: "CSV Importer", url: "/admin/csv-import", icon: FileSpreadsheet },
  { title: "Product Import", url: "/admin/product-import", icon: CloudDownload },
  { title: "Benchmarking", url: "/admin/benchmarking", icon: BarChart3 },
  { title: "SEO Editor", url: "/admin/seo", icon: Globe },
];

const settingsItems = [
  { title: "Store Settings", url: "/admin/store-settings", icon: Store },
  { title: "Staff Access", url: "/admin/staff-access", icon: ShieldCheck },
  { title: "Trade Licenses", url: "/admin/trade-licenses", icon: FileCheck },
  { title: "VAT Engine", url: "/admin/vat", icon: Receipt },
  { title: "Attribute Sets", url: "/admin/attribute-sets", icon: Layers },
  { title: "Warehouses", url: "/admin/warehouses", icon: Warehouse },
  { title: "AI Tuning", url: "/admin/ai-tuning", icon: Brain },
  { title: "Integrations", url: "/admin/integrations", icon: Plug },
  { title: "Audit Logs", url: "/admin/audit-logs", icon: History },
];

const sections = [
  { label: "Admin Panel", icon: Shield, items: coreItems },
  { label: "Commerce", icon: TrendingUp, items: commerceItems },
  { label: "Catalog", icon: Package, items: catalogItems },
  { label: "Settings", icon: Settings, items: settingsItems },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent>
        {sections.map((section) => {
          const hasActiveRoute = section.items.some(
            (item) =>
              item.url === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.url)
          );

          return (
            <Collapsible
              key={section.label}
              defaultOpen={hasActiveRoute || section.label === "Admin Panel"}
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center gap-2 hover:text-foreground transition-colors">
                    <section.icon className="h-4 w-4" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{section.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </>
                    )}
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={item.url}
                              end={item.url === "/admin"}
                              className="hover:bg-muted/50"
                              activeClassName="bg-muted text-primary font-medium"
                            >
                              <item.icon className="mr-2 h-4 w-4" />
                              {!collapsed && <span>{item.title}</span>}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}

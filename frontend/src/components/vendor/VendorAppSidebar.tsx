import {
  BarChart3, Package, ShoppingBag, Truck, DollarSign, Settings, ArrowLeft, Store, Banknote, Gavel,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useVendor } from "./VendorGuard";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const MAIN_NAV = [
  { title: "Overview", url: "/vendor", icon: BarChart3 },
  { title: "Products", url: "/vendor/products", icon: Package },
  { title: "Orders", url: "/vendor/orders", icon: ShoppingBag },
  { title: "Shipping", url: "/vendor/shipping", icon: Truck },
  { title: "Analytics", url: "/vendor/analytics", icon: DollarSign },
  { title: "Payouts", url: "/vendor/payouts", icon: Banknote },
  { title: "Auctions", url: "/vendor/auctions", icon: Gavel },
  { title: "Settings", url: "/vendor/settings", icon: Settings },
];

const VendorAppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { vendor } = useVendor();
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/vendor" ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        {/* Store branding */}
        <div className={`px-4 py-5 border-b border-border ${collapsed ? "px-2 py-3" : ""}`}>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Store className="h-4 w-4 text-primary" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{vendor?.store_name}</p>
                <p className="text-[11px] text-muted-foreground">{vendor?.emirate}</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAV.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/vendor"}
                      className="hover:bg-secondary/60"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                {!collapsed && <span>Back to Store</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default VendorAppSidebar;

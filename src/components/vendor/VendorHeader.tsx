import { Bell, Wallet, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useVendor } from "./VendorGuard";
import { useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const VendorHeader = () => {
  const { vendor } = useVendor();
  const [online, setOnline] = useState(true);

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-muted-foreground" />
        <span className="text-sm font-medium text-foreground hidden sm:block">Seller Portal</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Store status toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-1.5 text-xs font-medium ${
            online ? "text-emerald-500" : "text-muted-foreground"
          }`}
          onClick={() => setOnline(!online)}
        >
          {online ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{online ? "Online" : "Vacation"}</span>
        </Button>

        {/* Wallet */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm">
          <Wallet className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground">AED 0</span>
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-accent" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem className="text-sm text-muted-foreground">
              No new notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default VendorHeader;

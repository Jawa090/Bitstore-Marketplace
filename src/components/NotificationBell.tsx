// NotificationBell — mock version (no Supabase)
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotificationBell = () => {
  return (
    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative h-9 w-9">
      <Bell className="h-5 w-5" />
    </Button>
  );
};

export default NotificationBell;

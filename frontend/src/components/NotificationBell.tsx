import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle, Loader2, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { getNotifications, markNotificationRead } from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data.data.notifications);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on mount when logged in, and whenever the popover opens
  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) fetchNotifications();
  };

  const handleMarkRead = async (id: string) => {
    setMarkingId(id);
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // silently ignore
    } finally {
      setMarkingId(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const recent = notifications.slice(0, 10);

  // Don't render the bell for guests
  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Notifications</span>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BellOff className="h-6 w-6 text-primary/50" />
            </div>
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground">No notifications right now.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="divide-y divide-border">
              {recent.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 transition-colors ${
                    notif.is_read
                      ? "opacity-60"
                      : "bg-primary/5 hover:bg-primary/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread dot */}
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                        notif.is_read ? "bg-muted-foreground/30" : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-medium text-foreground leading-snug">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                          {new Date(notif.created_at).toLocaleDateString("en-AE", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      {notif.message && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      )}
                      {!notif.is_read && (
                        <button
                          className="mt-1.5 flex items-center gap-1 text-[11px] text-primary hover:underline disabled:opacity-50"
                          disabled={markingId === notif.id}
                          onClick={() => handleMarkRead(notif.id)}
                        >
                          {markingId === notif.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;

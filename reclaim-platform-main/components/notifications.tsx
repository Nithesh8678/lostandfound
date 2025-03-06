"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { truncateAddress } from "@/lib/utils";

type Notification = {
  type: string;
  itemId: string;
  finder: string;
  owner: string;
  details: {
    description: string;
    location: string;
    contactInfo: string;
  };
  timestamp: string;
  status?: "pending" | "accepted" | "rejected";
};

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { address } = useAccount();

  useEffect(() => {
    // Load notifications from localStorage
    const loadNotifications = () => {
      if (!address) return;

      const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
      const userNotifications = stored.filter(
        (n: Notification) => n.owner.toLowerCase() === address.toLowerCase()
      );
      setNotifications(userNotifications);
      setUnreadCount(
        userNotifications.filter((n: Notification) => !n.status).length
      );
    };

    loadNotifications();
    // Set up interval to check for new notifications
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [address]);

  const handleAccept = async (notification: Notification) => {
    try {
      // Here you would typically:
      // 1. Verify the finder's claim
      // 2. Release the bounty
      // 3. Update the item status
      // For now, we'll just update the notification status
      const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
      const updated = stored.map((n: Notification) =>
        n.itemId === notification.itemId ? { ...n, status: "accepted" } : n
      );
      localStorage.setItem("notifications", JSON.stringify(updated));

      // Update local state
      setNotifications(
        notifications.map((n) =>
          n.itemId === notification.itemId ? { ...n, status: "accepted" } : n
        )
      );

      alert("Finder's claim accepted! Bounty will be released.");
    } catch (error) {
      console.error("Error accepting claim:", error);
      alert("Error accepting claim. Please try again.");
    }
  };

  const handleReject = (notification: Notification) => {
    // Update notification status in localStorage
    const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
    const updated = stored.map((n: Notification) =>
      n.itemId === notification.itemId ? { ...n, status: "rejected" } : n
    );
    localStorage.setItem("notifications", JSON.stringify(updated));

    // Update local state
    setNotifications(
      notifications.map((n) =>
        n.itemId === notification.itemId ? { ...n, status: "rejected" } : n
      )
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="space-y-4 mt-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No notifications yet
              </p>
            ) : (
              notifications.map((notification, index) => (
                <div key={`${notification.itemId}-${index}`}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Item Found Notification
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Finder: {truncateAddress(notification.finder)}
                        </p>
                      </div>
                      {notification.status ? (
                        <Badge
                          variant={
                            notification.status === "accepted"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {notification.status}
                        </Badge>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => handleAccept(notification)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => handleReject(notification)}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <div className="space-y-2 text-sm">
                        <p>{notification.details.description}</p>
                        <p>
                          <strong>Location:</strong>{" "}
                          {notification.details.location}
                        </p>
                        <p>
                          <strong>Contact:</strong>{" "}
                          {notification.details.contactInfo}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {index < notifications.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

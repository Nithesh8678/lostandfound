"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  ChevronDown,
  Wallet,
  Bell,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "wagmi";
import { truncateAddress } from "@/lib/utils";
import { getEthereumContract } from "@/src/utils/blockchain";
import { LOST_AND_FOUND_ADDRESS, BOUNTY_ESCROW_ADDRESS } from "@/src/config";
import LostAndFoundABI from "../../../blockchain/artifacts/contracts/LostAndFound.sol/LostAndFound.json";
import BountyEscrowABI from "../../../blockchain/artifacts/contracts/BountyEscrow.sol/BountyEscrow.json";

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

const NOTIFICATION_CHECK_INTERVAL = 3000; // 3 seconds

type WalletAddress = `0x${string}`;

const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { address } = useAccount();

  // Transform values for width and padding
  const width = useTransform(scrollY, [0, 100], ["100vw", "70%"]);
  const padding = useTransform(scrollY, [0, 100], ["0px", "16px"]);
  const background = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.95)"]
  );

  useEffect(() => {
    const updateScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    const loadNotifications = () => {
      if (!address) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      try {
        const allNotifications = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );

        // Filter notifications for the current user and sort by timestamp
        const currentUserNotifications = allNotifications
          .filter(
            (n: Notification) => n.owner.toLowerCase() === address.toLowerCase()
          )
          .sort(
            (a: Notification, b: Notification) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

        setNotifications(currentUserNotifications);

        // Count unread (pending) notifications
        const unread = currentUserNotifications.filter(
          (n: Notification) => n.status === "pending"
        ).length;

        setUnreadCount(unread);

        // If there are unread notifications and we haven't shown an alert yet
        if (
          unread > 0 &&
          !localStorage.getItem(`notification-alert-${address}`)
        ) {
          // Show a notification alert
          const audio = new Audio("/notification-sound.mp3"); // Add a sound file to your public folder
          audio.play().catch(() => {}); // Ignore if audio fails to play

          // Mark that we've shown the alert for this session
          localStorage.setItem(`notification-alert-${address}`, "true");
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    // Load immediately
    loadNotifications();

    // Set up interval
    const interval = setInterval(
      loadNotifications,
      NOTIFICATION_CHECK_INTERVAL
    );

    // Clean up
    return () => {
      clearInterval(interval);
      // Clear the notification alert flag when unmounting
      if (address) {
        localStorage.removeItem(`notification-alert-${address}`);
      }
    };
  }, [address]);

  const handleAccept = async (notification: Notification) => {
    try {
      // First verify the finder's claim on the blockchain
      const contract = await getEthereumContract(
        LOST_AND_FOUND_ADDRESS,
        LostAndFoundABI.abi
      );
      if (!contract) {
        throw new Error("Failed to connect to contract");
      }

      // Get the item details
      const item = await contract.items(notification.itemId);
      if (!item) {
        throw new Error("Item not found");
      }

      // Verify that the item hasn't been found yet
      if (item.isFound) {
        throw new Error("Item has already been found");
      }

      // Mark the item as found on the blockchain
      console.log("Marking item as found on blockchain...");
      const tx = await contract.verifyFoundItem(
        notification.itemId,
        notification.finder
      );
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      if (receipt.status !== 1) {
        throw new Error("Failed to verify item on blockchain");
      }

      // If there's a bounty, release it to the finder
      try {
        const bountyContract = await getEthereumContract(
          BOUNTY_ESCROW_ADDRESS,
          BountyEscrowABI.abi
        );
        if (bountyContract) {
          const bountyTx = await bountyContract.releaseBounty(
            notification.itemId,
            notification.finder
          );
          await bountyTx.wait();
        }
      } catch (error) {
        console.error("Error releasing bounty:", error);
        // Continue even if bounty release fails
      }

      // Update notification in localStorage
      const allStoredNotifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );

      const updatedNotifications = allStoredNotifications.map(
        (n: Notification) =>
          n.itemId === notification.itemId && n.finder === notification.finder
            ? {
                ...n,
                status: "accepted",
                acceptedAt: new Date().toISOString(),
                bountyReleased: true,
              }
            : n
      );

      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );

      // Update local state
      setNotifications(
        notifications.map((n) =>
          n.itemId === notification.itemId && n.finder === notification.finder
            ? {
                ...n,
                status: "accepted",
                acceptedAt: new Date().toISOString(),
                bountyReleased: true,
              }
            : n
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Update finder's stats in localStorage for leaderboard
      const finderStats = JSON.parse(
        localStorage.getItem("finderStats") || "{}"
      );
      const currentStats = finderStats[notification.finder] || {
        itemsFound: 0,
        totalRewards: 0,
        lastActive: new Date().toISOString(),
      };

      finderStats[notification.finder] = {
        ...currentStats,
        itemsFound: currentStats.itemsFound + 1,
        lastActive: new Date().toISOString(),
      };

      localStorage.setItem("finderStats", JSON.stringify(finderStats));

      // Show success message
      alert(
        "Finder's claim accepted! Item has been marked as found and bounty will be released if available."
      );
    } catch (error) {
      console.error("Error accepting claim:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error accepting claim. Please try again."
      );
    }
  };

  const handleReject = (notification: Notification) => {
    try {
      // Get all notifications
      const allStoredNotifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );

      // Update the status of the specific notification
      const updatedNotifications = allStoredNotifications.map(
        (n: Notification) =>
          n.itemId === notification.itemId && n.finder === notification.finder
            ? { ...n, status: "rejected", rejectedAt: new Date().toISOString() }
            : n
      );

      // Save back to localStorage
      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );

      // Update local state
      setNotifications(
        notifications.map((n) =>
          n.itemId === notification.itemId && n.finder === notification.finder
            ? { ...n, status: "rejected", rejectedAt: new Date().toISOString() }
            : n
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error rejecting claim:", error);
      alert("Error rejecting claim. Please try again.");
    }
  };

  const navLinks = [
    { href: "/bounty", label: "Bounty" },
    { href: "/report-lost", label: "Report Lost" },
    { href: "/leader-board", label: "Leader Board" },
    { href: "/how-it-works", label: "How It Works" },
  ];

  return (
    <div
      className={`fixed top-0 left-0 w-full flex justify-center z-50 ${
        isScrolled ? "text-primary-foreground" : "text-white"
      }`}
    >
      <motion.nav
        style={{
          width,
          background,
          padding,
        }}
        className={`
          flex items-center justify-between
          h-16 transition-all duration-300 ease-in-out backdrop-blur-sm
          ${isScrolled ? "rounded-full mt-4 px-8" : "px-8 md:px-16"}
          relative
        `}
      >
        {/* Logo */}
        <Link href="/" className="pl-4 text-xl font-bold">
          <span className="text-primary font-serif">Reclaim</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={`hidden md:flex gap-6`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Connect Button and Notifications */}
        <div className="hidden md:flex items-center gap-4">
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

          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button
                          onClick={openConnectModal}
                          variant={isScrolled ? "default" : "secondary"}
                          className="transition-colors rounded-full"
                        >
                          <Wallet className="mr-2 h-4 w-4" />
                          Connect Wallet
                        </Button>
                      );
                    }

                    return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant={isScrolled ? "default" : "secondary"}
                            className="transition-colors rounded-full"
                          >
                            {account.displayName}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>My Account</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={openChainModal}
                            className="gap-2"
                          >
                            {chain.hasIcon && chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl}
                                className="h-4 w-4"
                              />
                            )}
                            {chain.name}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard" className="gap-2">
                              <LayoutDashboard className="h-4 w-4" />
                              Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={openAccountModal}>
                            Wallet Settings
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span
              className={`w-full h-0.5 bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`w-full h-0.5 bg-current transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-full h-0.5 bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </button>

        {/* Mobile Menu */}
        <div
          className={`
            absolute top-full right-0 mt-2 w-48 py-2 bg-background rounded-lg shadow-lg
            transform transition-all duration-300 origin-top-right
            md:hidden
            ${
              isMobileMenuOpen
                ? "scale-100 opacity-100"
                : "scale-95 opacity-0 pointer-events-none"
            }
          `}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 hover:bg-muted transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="my-2 border-border" />
          <div className="px-4 py-2">
            <ConnectButton />
          </div>
        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;

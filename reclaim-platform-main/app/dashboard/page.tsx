"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import {
  MapPin,
  Clock,
  DollarSign,
  Search,
  Hexagon,
  CircuitBoard,
  Box,
  Wallet,
  type LucideIcon,
  ClipboardCopy,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IMAGES } from "@/lib/constants";
import { fetchLostItems, fetchFoundItems } from "@/src/utils/blockchain";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { truncateAddress } from "@/lib/utils";

// Initialize Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const FloatingIcon = ({ Icon, index }: { Icon: LucideIcon; index: number }) => (
  <motion.div
    className="absolute text-primary/10"
    initial={{ y: 0 }}
    animate={{
      y: [-20, 20, -20],
      rotate: [0, 180, 360],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      delay: index * 2,
      ease: "linear",
    }}
    style={{
      left: `${20 + index * 30}%`,
      top: `${10 + index * 20}%`,
    }}
  >
    <Icon size={80} />
  </motion.div>
);

export default function DashboardPage() {
  const floatingIcons = [Hexagon, CircuitBoard, Box];
  const [lostItems, setLostItems] = useState<any[]>([]);
  const [foundItems, setFoundItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { address } = useAccount();

  const fetchItems = async () => {
    try {
      const [lost, found] = await Promise.all([
        fetchLostItems(),
        fetchFoundItems(),
      ]);
      setLostItems(lost);
      setFoundItems(found);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchItems();
    }
  }, [address]);

  // Add notification listener to refresh items when status changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "notifications") {
        // Refresh items when notifications change
        fetchItems();
      }
    };

    // Listen for changes in localStorage
    window.addEventListener("storage", handleStorageChange);

    // Also set up an interval to check for updates
    const interval = setInterval(fetchItems, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [address]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const stats = [
    {
      title: "Lost Items",
      value: lostItems.length,
      description: "Total items reported as lost",
      icon: Search,
    },
    {
      title: "Found Items",
      value: foundItems.length,
      description: "Total items reported as found",
      icon: CheckCircle,
    },
    {
      title: "Active Items",
      value: lostItems.filter((item) => !item.isFound).length,
      description: "Items still being searched",
      icon: AlertCircle,
    },
  ];

  if (!address) {
    return (
      <div className="min-h-screen w-full mt-16 flex items-center justify-center bg-gradient-to-b from-background via-background/95 to-background">
        <Card className="w-full max-w-md mx-4 border-primary/20 bg-black/40 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground text-center mb-6">
              Please connect your wallet to view your profile and items
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full mt-16 bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden ${montserrat.className}`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      {/* Floating elements */}
      {floatingIcons.map((Icon, index) => (
        <FloatingIcon key={index} Icon={Icon} index={index} />
      ))}

      <motion.div
        className="container px-4 py-8 md:px-6 md:py-12 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Profile Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card className="border-primary/20 bg-black/40 backdrop-blur-xl overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarFallback className="bg-primary/20 text-lg">
                    {address ? address.slice(2, 4).toUpperCase() : "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-2">My Profile</h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <Wallet className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      {truncateAddress(address)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={copyAddress}
                    >
                      {copiedAddress ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <ClipboardCopy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/report-lost">
                    <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                      Report Lost Item
                    </Button>
                  </Link>
                  <Link href="/report-found">
                    <Button
                      variant="outline"
                      className="border-primary/20 hover:border-primary/40 backdrop-blur-sm"
                    >
                      Report Found Item
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-primary/20 bg-black/40 backdrop-blur-xl"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Items Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="lost" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/20 backdrop-blur-sm border border-white/10">
              <TabsTrigger
                value="lost"
                className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md transition-all duration-300"
              >
                Lost Items
              </TabsTrigger>
              <TabsTrigger
                value="found"
                className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md transition-all duration-300"
              >
                Found Items
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lost" className="space-y-4">
              {isLoading ? (
                <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-lg font-medium mb-2">Loading items...</p>
                  </CardContent>
                </Card>
              ) : lostItems.length === 0 ? (
                <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-primary mb-4" />
                    <p className="text-lg font-medium mb-2">
                      No lost items reported
                    </p>
                    <p className="text-muted-foreground mb-4">
                      You haven't reported any lost items yet.
                    </p>
                    <Link href="/report-lost">
                      <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                        Report Lost Item
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lostItems.map((item) => (
                    <Card
                      key={item.id}
                      className="group border-primary/20 bg-black/40 backdrop-blur-xl hover:bg-black/50 transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {item.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {item.description}
                            </p>
                          </div>
                          <Badge
                            variant={
                              item.status === "found" ? "default" : "outline"
                            }
                            className="capitalize"
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {item.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {item.date}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="found" className="space-y-4">
              {isLoading ? (
                <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-lg font-medium mb-2">Loading items...</p>
                  </CardContent>
                </Card>
              ) : foundItems.length === 0 ? (
                <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-primary mb-4" />
                    <p className="text-lg font-medium mb-2">
                      No found items reported
                    </p>
                    <p className="text-muted-foreground mb-4">
                      You haven't reported any found items yet.
                    </p>
                    <Link href="/report-found">
                      <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                        Report Found Item
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {foundItems.map((item) => (
                    <Card
                      key={item.id}
                      className="group border-primary/20 bg-black/40 backdrop-blur-xl hover:bg-black/50 transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {item.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {item.description}
                            </p>
                          </div>
                          <Badge
                            variant={
                              item.status === "matched" ? "default" : "outline"
                            }
                            className="capitalize"
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {item.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {item.date}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}

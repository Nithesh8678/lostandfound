"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IMAGES } from "@/lib/constants";
import { fetchLostItems, fetchFoundItems } from "@/src/utils/blockchain";
import { useEffect, useState } from "react";

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

  useEffect(() => {
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

    fetchItems();
  }, []);

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
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
          variants={itemVariants}
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur" />
            <div className="relative">
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-purple-500">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your lost and found items
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
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
        </motion.div>

        <motion.div className="grid gap-8" variants={itemVariants}>
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
            <AnimatePresence mode="wait">
              <TabsContent value="lost" className="space-y-4">
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-lg font-medium mb-2">
                          Loading items...
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : lostItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
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
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {lostItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        className="group"
                      >
                        <Card className="overflow-hidden border-primary/20 bg-black/40 backdrop-blur-xl hover:bg-black/50 transition-all duration-300">
                          <div className="flex flex-col md:flex-row">
                            <div className="relative w-full md:w-[100px] h-[100px] overflow-hidden bg-primary/10 flex items-center justify-center">
                              <Search className="h-8 w-8 text-primary/50" />
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="flex-1 p-6">
                              <div className="flex flex-col md:flex-row justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold mb-2">
                                    {item.name}
                                  </h3>
                                  <p className="text-muted-foreground text-sm mb-4">
                                    {item.description}
                                  </p>
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
                                </div>
                                <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                                  <Badge
                                    variant={
                                      item.status === "found"
                                        ? "default"
                                        : item.status === "matched"
                                        ? "secondary"
                                        : "outline"
                                    }
                                    className="capitalize"
                                  >
                                    {item.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
              <TabsContent value="found" className="space-y-4">
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-lg font-medium mb-2">
                          Loading items...
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : foundItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
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
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {foundItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        className="group"
                      >
                        <Card className="overflow-hidden border-primary/20 bg-black/40 backdrop-blur-xl hover:bg-black/50 transition-all duration-300">
                          <div className="flex flex-col md:flex-row">
                            <div className="relative w-full md:w-[100px] h-[100px] overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="flex-1 p-6">
                              <div className="flex flex-col md:flex-row justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                                      {item.name}
                                    </h3>
                                    {item.status === "reported" && (
                                      <Badge
                                        variant="outline"
                                        className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                                      >
                                        Reported
                                      </Badge>
                                    )}
                                    {item.status === "matched" && (
                                      <Badge
                                        variant="outline"
                                        className="bg-green-500/10 text-green-500 border-green-500/20"
                                      >
                                        Matched
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground mt-1">
                                    {item.description}
                                  </p>
                                </div>
                                <div className="mt-4 md:mt-0">
                                  <Link href={`/items/found/${item.id}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-primary/20 hover:border-primary/40 backdrop-blur-sm"
                                    >
                                      View Details
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                              <div className="flex flex-col md:flex-row gap-4 mt-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1 text-primary" />
                                  <span>{item.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1 text-primary" />
                                  <span>
                                    {new Date(item.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Clock,
  Search,
  Target,
  Sparkles,
  Compass,
  Filter,
  SlidersHorizontal,
  Crosshair,
  DollarSign,
  Trophy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllLostItems } from "@/src/utils/blockchain";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";

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

type LostItem = {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
  status: string;
  owner: string;
  reward?: string;
};

export default function BountyPage() {
  const [items, setItems] = useState<LostItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [rewardRange, setRewardRange] = useState([0]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        console.log("Fetching lost items...");
        const allItems = await fetchAllLostItems();
        console.log("Fetched items:", allItems);
        setItems(allItems);
        setFilteredItems(allItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== "undefined" && window.ethereum) {
      fetchItems();
    } else {
      console.log("Please install MetaMask to view lost items");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let filtered = [...items];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter((item) =>
        item.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Filter by timeframe
    if (selectedTimeframe) {
      const now = new Date();
      const itemDate = new Date();
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        switch (selectedTimeframe) {
          case "today":
            return itemDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return itemDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return itemDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Filter by status
    if (showActiveOnly) {
      filtered = filtered.filter((item) => item.status === "active");
    }

    // Filter by reward range
    if (rewardRange[0] > 0) {
      filtered = filtered.filter(
        (item) => item.reward && parseFloat(item.reward) >= rewardRange[0]
      );
    }

    setFilteredItems(filtered);
  }, [
    items,
    searchQuery,
    selectedLocation,
    selectedTimeframe,
    showActiveOnly,
    rewardRange,
  ]);

  const locations = Array.from(new Set(items.map((item) => item.location)));

  return (
    <div className="min-h-screen w-full mt-16 bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <motion.div
        className="container px-4 py-8 md:px-6 md:py-12 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-purple-500 mb-2">
                Bounty Board
              </h1>
              <p className="text-muted-foreground">
                Help others find their lost items and earn rewards
              </p>
            </div>
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              className="border-primary/20 hover:border-primary/40 backdrop-blur-sm"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Card className="border-primary/20 bg-black/40 backdrop-blur-xl mb-8">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Search */}
                    <div className="space-y-2">
                      <Label>Search</Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search items..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select
                        value={selectedLocation}
                        onValueChange={setSelectedLocation}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All locations</SelectItem>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Timeframe */}
                    <div className="space-y-2">
                      <Label>Timeframe</Label>
                      <Select
                        value={selectedTimeframe}
                        onValueChange={setSelectedTimeframe}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">Past week</SelectItem>
                          <SelectItem value="month">Past month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Active Only Switch */}
                    <div className="space-y-2">
                      <Label>Show active only</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={showActiveOnly}
                          onCheckedChange={setShowActiveOnly}
                        />
                        <Label>Active items only</Label>
                      </div>
                    </div>

                    {/* Reward Range */}
                    <div className="space-y-2 col-span-full">
                      <Label>Minimum Reward (ETH)</Label>
                      <div className="pt-4">
                        <Slider
                          value={rewardRange}
                          onValueChange={setRewardRange}
                          max={10}
                          step={0.1}
                        />
                        <div className="mt-2 text-muted-foreground text-sm">
                          {rewardRange[0]} ETH
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items Grid */}
        <motion.div variants={itemVariants}>
          {isLoading ? (
            <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-lg font-medium mb-2">Loading bounties...</p>
                <p className="text-muted-foreground text-center">
                  Connecting to blockchain and fetching lost items...
                </p>
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-primary mb-4" />
                <p className="text-lg font-medium mb-2">
                  No bounties available
                </p>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  {!window.ethereum
                    ? "Please install MetaMask to view lost items and bounties."
                    : "There are currently no lost items reported. Check back later or report a lost item yourself."}
                </p>
                {window.ethereum && (
                  <Link href="/report-lost">
                    <Button>Report Lost Item</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-primary mb-4" />
                <p className="text-lg font-medium mb-2">No bounties found</p>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  No items match your current filters. Try adjusting your search
                  criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  <Card className="relative border-primary/20 bg-black/40 backdrop-blur-xl group-hover:border-primary/40 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {item.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            item.status === "active" ? "default" : "outline"
                          }
                          className="capitalize"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-primary" />
                            {item.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-primary" />
                            {item.date}
                          </div>
                        </div>
                        {item.reward && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span className="text-green-500 font-medium">
                              {item.reward} ETH Reward
                            </span>
                          </div>
                        )}
                        <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group">
                          <Trophy className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                          Claim Bounty
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

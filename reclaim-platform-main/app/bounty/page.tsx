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
  finder: string;
  reward: string;
  ipfsHash: string;
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
        setIsLoading(true);
        console.log("Fetching lost items...");
        const allItems = await fetchAllLostItems();
        console.log("Fetched items:", allItems);

        if (allItems.length === 0) {
          console.log("No items found in the blockchain");
        } else {
          console.log(`Found ${allItems.length} items in the blockchain`);
        }

        setItems(allItems);
        setFilteredItems(allItems);
      } catch (error) {
        console.error("Error fetching items:", error);
        alert("Error fetching items. Please check console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== "undefined") {
      if (!window.ethereum) {
        console.log("Please install MetaMask to view lost items");
        setIsLoading(false);
        return;
      }
      fetchItems();
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
        ) : !window.ethereum ? (
          <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-primary mb-4" />
              <p className="text-lg font-medium mb-2">MetaMask Required</p>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                Please install MetaMask to view lost items and bounties.
                <a
                  href="https://metamask.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1"
                >
                  Install MetaMask
                </a>
              </p>
            </CardContent>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-primary mb-4" />
              <p className="text-lg font-medium mb-2">No bounties found</p>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                {items.length === 0
                  ? "There are currently no lost items reported. Check back later or report a lost item yourself."
                  : "No items match your current filters. Try adjusting your search criteria."}
              </p>
              {items.length === 0 && (
                <Link href="/report-lost">
                  <Button>Report Lost Item</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="group relative cursor-pointer"
                onClick={() => (window.location.href = `/bounty/${item.id}`)}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <Card className="relative border-primary/20 bg-black/40 backdrop-blur-xl hover:border-primary/40 transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {item.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.status === "active" ? "default" : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {item.location}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {item.date}
                      </div>
                      {parseFloat(item.reward) > 0 && (
                        <div className="flex items-center text-sm text-primary">
                          <DollarSign className="mr-2 h-4 w-4" />
                          {item.reward} ETH Reward
                        </div>
                      )}
                      {item.status === "active" && (
                        <Button
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert("Claiming feature coming soon!");
                          }}
                        >
                          Claim Bounty
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

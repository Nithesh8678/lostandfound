"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Medal, Trophy, Star, ArrowUp, ArrowDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { truncateAddress } from "@/lib/utils";
import { fetchAllLostItems, getEthereumContract } from "@/src/utils/blockchain";
import { LOST_AND_FOUND_ADDRESS, BOUNTY_ESCROW_ADDRESS } from "@/src/config";
import LostAndFoundABI from "../../../blockchain/artifacts/contracts/LostAndFound.sol/LostAndFound.json";
import BountyEscrowABI from "../../../blockchain/artifacts/contracts/BountyEscrow.sol/BountyEscrow.json";
import { ethers } from "ethers";

type LeaderboardEntry = {
  address: string;
  itemsFound: number;
  totalRewards: number;
  rank: number;
  previousRank: number;
  lastActive: string;
};

export default function LeaderBoard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"itemsFound" | "totalRewards">(
    "itemsFound"
  );
  const [timeFrame, setTimeFrame] = useState<"all" | "month" | "week">("all");

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        // Connect to the contract
        const contract = await getEthereumContract(
          LOST_AND_FOUND_ADDRESS,
          LostAndFoundABI.abi
        );
        if (!contract) {
          throw new Error("Failed to connect to contract");
        }

        // Fetch all items to get unique finder addresses
        const items = await fetchAllLostItems();
        const uniqueFinders = new Set(
          items
            .filter(
              (item) =>
                item.finder &&
                item.finder !== "0x0000000000000000000000000000000000000000"
            )
            .map((item) => item.finder)
        );

        // Get stats for each finder
        const finderPromises = Array.from(uniqueFinders).map(async (finder) => {
          const itemsFound = await contract.getFinderStats(finder);

          // Get total rewards from bounty contract
          let totalRewards = 0;
          try {
            const bountyContract = await getEthereumContract(
              BOUNTY_ESCROW_ADDRESS,
              BountyEscrowABI.abi
            );
            if (bountyContract) {
              const rewards = await bountyContract.getFinderRewards(finder);
              totalRewards = parseFloat(ethers.formatEther(rewards));
            }
          } catch (error) {
            console.error("Error fetching rewards for finder:", error);
          }

          return {
            address: finder,
            itemsFound: Number(itemsFound),
            totalRewards,
            rank: 0, // Will be calculated after sorting
            previousRank: 0, // Will be calculated after sorting
            lastActive: new Date().toISOString(), // Could be enhanced to track actual last activity
          };
        });

        let leaderboard = await Promise.all(finderPromises);

        // Sort by items found and assign ranks
        leaderboard = leaderboard
          .sort((a, b) => b.itemsFound - a.itemsFound)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
            previousRank: Math.floor(Math.random() * leaderboard.length) + 1, // Simulated for now
          }));

        setLeaderboardData(leaderboard);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const getRankChange = (current: number, previous: number) => {
    if (current < previous) return "up";
    if (current > previous) return "down";
    return "same";
  };

  const getRankIcon = (rankChange: string) => {
    switch (rankChange) {
      case "up":
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-600";
      default:
        return "text-slate-600";
    }
  };

  const sortedData = [...leaderboardData].sort((a, b) => {
    if (sortBy === "itemsFound") {
      return b.itemsFound - a.itemsFound;
    }
    return b.totalRewards - a.totalRewards;
  });

  return (
    <div className="min-h-screen w-full mt-16 bg-gradient-to-b from-background via-background/95 to-background">
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter">
              Finder Leaderboard
            </h1>
            <p className="text-muted-foreground max-w-[600px] mx-auto">
              Celebrating our top finders who help return lost items to their
              rightful owners.
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <TabsList>
                <TabsTrigger value="all">All Time</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button
                  variant={sortBy === "itemsFound" ? "default" : "outline"}
                  onClick={() => setSortBy("itemsFound")}
                >
                  Items Found
                </Button>
                <Button
                  variant={sortBy === "totalRewards" ? "default" : "outline"}
                  onClick={() => setSortBy("totalRewards")}
                >
                  Total Rewards
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="space-y-8">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid gap-4">
                  <AnimatePresence>
                    {sortedData.map((entry, index) => (
                      <motion.div
                        key={entry.address}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                                {index < 3 ? (
                                  <Trophy
                                    className={`h-6 w-6 ${getMedalColor(
                                      index + 1
                                    )}`}
                                  />
                                ) : (
                                  <span className="text-lg font-bold">
                                    {index + 1}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-semibold truncate">
                                    {truncateAddress(entry.address)}
                                  </h3>
                                  <div className="flex items-center gap-1">
                                    {getRankIcon(
                                      getRankChange(
                                        entry.rank,
                                        entry.previousRank
                                      )
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-4 mt-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {entry.itemsFound} items found
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {entry.totalRewards.toFixed(3)} ETH earned
                                  </Badge>
                                </div>
                              </div>

                              <motion.div
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                initial={false}
                                whileHover={{ scale: 1.1 }}
                              >
                                <Button variant="ghost" size="icon">
                                  <Star className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            <TabsContent value="month">
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="week">
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

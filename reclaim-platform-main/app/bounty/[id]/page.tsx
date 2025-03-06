"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  DollarSign,
  ArrowLeft,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchAllLostItems, submitFoundItem } from "@/src/utils/blockchain";
import { truncateAddress } from "@/lib/utils";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function BountyDetailsPage() {
  const params = useParams();
  const [item, setItem] = useState<LostItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFoundDialogOpen, setIsFoundDialogOpen] = useState(false);
  const [foundDetails, setFoundDetails] = useState({
    description: "",
    location: "",
    contactInfo: "",
  });
  const { address } = useAccount();

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setIsLoading(true);
        const items = await fetchAllLostItems();
        const foundItem = items.find((i) => i.id === params.id);
        if (foundItem) {
          setItem(foundItem);
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchItemDetails();
    }
  }, [params.id]);

  const handleFoundSubmit = async () => {
    if (!item || !address) return;

    try {
      // Create notification data
      const notificationData = {
        type: "FOUND_ITEM",
        itemId: item.id,
        finder: address,
        owner: item.owner,
        details: foundDetails,
        timestamp: new Date().toISOString(),
      };

      // Submit the found item to the blockchain
      await submitFoundItem(
        foundDetails.description,
        foundDetails.location,
        foundDetails.contactInfo,
        item.id
      );

      // Store notification (this would typically go to your backend)
      // For now, we'll use localStorage as a demo
      const notifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );
      notifications.push(notificationData);
      localStorage.setItem("notifications", JSON.stringify(notifications));

      alert("Item found notification sent to the owner!");
      setIsFoundDialogOpen(false);
    } catch (error) {
      console.error("Error submitting found item:", error);
      alert("Error submitting found item. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full mt-16 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen w-full mt-16 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Item not found</h1>
        <Link href="/bounty">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bounty Board
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = address?.toLowerCase() === item.owner.toLowerCase();

  return (
    <div className="min-h-screen w-full mt-16 bg-gradient-to-b from-background via-background/95 to-background">
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <Link href="/bounty">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bounty Board
            </Button>
          </Link>

          {/* Main Content */}
          <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {item.name}
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
                <Badge
                  variant={item.status === "active" ? "default" : "secondary"}
                  className="text-sm"
                >
                  {item.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Details */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Item Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-primary" />
                        <span>Location: {item.location}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-primary" />
                        <span>Date Lost: {item.date}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4 text-primary" />
                        <span>Owner: {truncateAddress(item.owner)}</span>
                      </div>
                      {item.finder !==
                        "0x0000000000000000000000000000000000000000" && (
                        <div className="flex items-center text-sm">
                          <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                          <span>Found by: {truncateAddress(item.finder)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {parseFloat(item.reward) > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Reward</h3>
                      <div className="flex items-center text-xl font-bold text-primary">
                        <DollarSign className="mr-2 h-6 w-6" />
                        {item.reward} ETH
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Actions</h3>
                    {item.status === "active" ? (
                      <div className="space-y-4">
                        {!isOwner ? (
                          <>
                            <p className="text-sm text-muted-foreground">
                              If you have found this item, click the button
                              below to notify the owner.
                            </p>
                            <Button
                              className="w-full"
                              size="lg"
                              onClick={() => setIsFoundDialogOpen(true)}
                            >
                              I Found This Item
                            </Button>
                          </>
                        ) : (
                          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                            <div className="flex items-center gap-2 text-yellow-500">
                              <AlertCircle className="h-4 w-4" />
                              <p className="text-sm font-medium">Owner View</p>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              This is your item. You'll be notified when someone
                              finds it.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        This item has been found and is no longer active.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Found Item Dialog */}
      <Dialog open={isFoundDialogOpen} onOpenChange={setIsFoundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Found Item</DialogTitle>
            <DialogDescription>
              Provide details about how you found the item. The owner will
              verify your claim.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe where and how you found the item..."
                value={foundDetails.description}
                onChange={(e) =>
                  setFoundDetails((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Current Location</Label>
              <Input
                placeholder="Where is the item now?"
                value={foundDetails.location}
                onChange={(e) =>
                  setFoundDetails((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Information</Label>
              <Input
                placeholder="How can the owner reach you?"
                value={foundDetails.contactInfo}
                onChange={(e) =>
                  setFoundDetails((prev) => ({
                    ...prev,
                    contactInfo: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFoundDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleFoundSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Upload,
  AlertCircle,
  Info,
  Camera,
  Calendar,
  Tag,
  DollarSign,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { submitLostItem } from "@/src/utils/blockchain";

const formSteps = [
  { id: "details", title: "Basic Details", icon: Tag },
  { id: "location", title: "Location & Date", icon: MapPin },
  { id: "bounty", title: "Bounty", icon: DollarSign },
];

interface FormData {
  name: string;
  description: string;
  category: string;
  lastLocation: string;
  date: string;
  bounty: number;
  enableBounty: boolean;
  image: File | null;
}

export default function ReportLostPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formProgress, setFormProgress] = useState(33);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    lastLocation: "",
    date: "",
    bounty: 0,
    enableBounty: false,
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, enableBounty: checked }));
  };

  const handleSliderChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, bounty: value[0] }));
  };

  const nextStep = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setFormProgress((currentStep + 2) * 33);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setFormProgress(currentStep * 33);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitLostItem(
        formData.name,
        formData.description,
        formData.lastLocation,
        () => {}
      );
    } catch (error) {
      console.error("Error submitting lost item:", error);
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen w-full mt-16 bg-gradient-to-b from-background via-background/95 to-background">
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-2xl mx-auto space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Report Lost Item
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Provide details about your lost item to help others find it
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-4">
            <Progress value={formProgress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              {formSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 ${
                    index <= currentStep ? "text-primary" : ""
                  }`}
                >
                  <div className="text-primary">
                    {React.createElement(step.icon, {
                      className: "h-5 w-5",
                    })}
                  </div>
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {formSteps[currentStep].icon && (
                    <div className="text-primary">
                      {React.createElement(formSteps[currentStep].icon, {
                        className: "h-5 w-5",
                      })}
                    </div>
                  )}
                  {formSteps[currentStep].title}
                </CardTitle>
                <CardDescription>
                  {currentStep === 0 &&
                    "Provide accurate information about your lost item"}
                  {currentStep === 1 && "Help others locate your item"}
                  {currentStep === 2 &&
                    "Optionally set a bounty to increase visibility"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <AnimatePresence mode="wait">
                  {currentStep === 0 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="name">Item Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., Blue Backpack, iPhone 14 Pro"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="bg-black/20 border-primary/20 focus:border-primary/40"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Provide detailed description including color, brand, distinguishing features, etc."
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          className="bg-black/20 border-primary/20 focus:border-primary/40 min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            handleSelectChange("category", value)
                          }
                        >
                          <SelectTrigger
                            id="category"
                            className="bg-black/20 border-primary/20"
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="electronics">
                              Electronics
                            </SelectItem>
                            <SelectItem value="accessories">
                              Accessories
                            </SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="documents">Documents</SelectItem>
                            <SelectItem value="keys">Keys</SelectItem>
                            <SelectItem value="bags">Bags</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 1 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="lastLocation">
                          Last Known Location
                        </Label>
                        <div className="relative">
                          <Input
                            id="lastLocation"
                            name="lastLocation"
                            placeholder="e.g., Central Park, Starbucks on 5th Avenue"
                            value={formData.lastLocation}
                            onChange={handleInputChange}
                            required
                            className="bg-black/20 border-primary/20 focus:border-primary/40 pr-10"
                          />
                          <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-primary" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Date Lost</Label>
                        <div className="relative">
                          <Input
                            id="date"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                            className="bg-black/20 border-primary/20 focus:border-primary/40"
                          />
                          <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-primary" />
                        </div>
                      </div>

                      <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-colors duration-300">
                        <div className="flex flex-col items-center justify-center">
                          <Camera className="h-8 w-8 text-primary mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Add photos to help identify your item
                          </p>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setFormData((prev) => ({
                                  ...prev,
                                  image: e.target.files?.[0] || null,
                                }));
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("image")?.click()
                            }
                            className="border-primary/20"
                          >
                            Choose File
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="enableBounty">Enable Bounty</Label>
                            <p className="text-sm text-muted-foreground">
                              Offering a bounty can increase the chances of
                              finding your item
                            </p>
                          </div>
                          <Switch
                            id="enableBounty"
                            checked={formData.enableBounty}
                            onCheckedChange={handleSwitchChange}
                          />
                        </div>

                        <AnimatePresence>
                          {formData.enableBounty && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="bounty">
                                    Bounty Amount (USD)
                                  </Label>
                                  <span className="text-2xl font-bold text-primary">
                                    ${formData.bounty}
                                  </span>
                                </div>
                                <Slider
                                  id="bounty"
                                  min={0}
                                  max={500}
                                  step={5}
                                  value={[formData.bounty]}
                                  onValueChange={handleSliderChange}
                                  className="py-4"
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>$0</span>
                                  <span>$500</span>
                                </div>
                              </div>

                              <Alert className="bg-primary/5 border-primary/20">
                                <AlertCircle className="h-4 w-4 text-primary" />
                                <AlertDescription className="text-primary/80">
                                  The bounty will be held in escrow and only
                                  released when you confirm item recovery.
                                </AlertDescription>
                              </Alert>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>

              <CardFooter className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="border-primary/20"
                >
                  Previous
                </Button>

                {currentStep < formSteps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Report
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

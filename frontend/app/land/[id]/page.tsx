"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  MapPin, 
  Droplets, 
  Leaf, 
  Star,
  ArrowLeft,
  Heart,
  Share2,
  Phone,
  MessageSquare,
  CheckCircle,
  Thermometer,
  Wind,
  Sun,
  Calendar,
  TrendingUp,
  Wheat,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Ruler
} from "lucide-react"
import Link from "next/link"

// Mock land data
const landData = {
  id: 1,
  title: "Premium Farmland in Karnataka",
  location: "Hassan, Karnataka",
  fullAddress: "Village Belur, Taluk Hassan, District Hassan, Karnataka 573201",
  size: "25 Acres",
  price: "₹15,000/month",
  waterLevel: 85,
  soilType: "Black Soil",
  soilHealth: 92,
  crops: ["Rice", "Sugarcane", "Cotton", "Ragi", "Maize"],
  images: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop",
  ],
  rating: 4.8,
  verified: true,
  owner: {
    name: "Rajesh Gowda",
    verified: true,
    memberSince: "2021",
    totalLands: 3,
    responseRate: "98%",
  },
  features: [
    "Borewell Water",
    "Canal Irrigation",
    "Electricity Available",
    "Road Access",
    "Fencing Done",
    "Storage Shed"
  ],
  climate: {
    avgTemp: "28°C",
    rainfall: "850mm/year",
    humidity: "65%",
    bestSeason: "June - February"
  },
  analytics: {
    soilPH: 6.8,
    nitrogen: 75,
    phosphorus: 60,
    potassium: 80,
    organic: 3.2
  }
}

export default function LandDetailPage() {
  const [currentImage, setCurrentImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % landData.images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + landData.images.length) % landData.images.length)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href="/explore">
              <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Explore
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
                  <img
                    src={landData.images[currentImage]}
                    alt={landData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-primary/20 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-primary/20 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {landData.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImage ? "bg-primary w-6" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {landData.verified && (
                      <Badge className="bg-primary text-primary-foreground">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge className="glass">
                      <Star className="h-3 w-3 mr-1 text-yellow-400 fill-yellow-400" />
                      {landData.rating}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`p-2 rounded-full glass transition-colors ${
                        isFavorite ? "text-red-500" : "text-white"
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                    </button>
                    <button className="p-2 rounded-full glass text-white hover:text-primary transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 mt-4">
                  {landData.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden transition-all ${
                        index === currentImage ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Title & Location */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{landData.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{landData.fullAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-primary" />
                    <span>{landData.size}</span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <Droplets className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{landData.waterLevel}%</div>
                    <div className="text-sm text-muted-foreground">Water Level</div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <Leaf className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{landData.soilHealth}%</div>
                    <div className="text-sm text-muted-foreground">Soil Health</div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <Thermometer className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{landData.climate.avgTemp}</div>
                    <div className="text-sm text-muted-foreground">Avg Temp</div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <Wind className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{landData.climate.rainfall}</div>
                    <div className="text-sm text-muted-foreground">Rainfall</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Soil Analytics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Soil Analytics
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Soil pH Level</span>
                          <span className="text-sm font-medium text-foreground">{landData.analytics.soilPH}</span>
                        </div>
                        <Progress value={landData.analytics.soilPH * 10} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Nitrogen (N)</span>
                          <span className="text-sm font-medium text-foreground">{landData.analytics.nitrogen}%</span>
                        </div>
                        <Progress value={landData.analytics.nitrogen} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Phosphorus (P)</span>
                          <span className="text-sm font-medium text-foreground">{landData.analytics.phosphorus}%</span>
                        </div>
                        <Progress value={landData.analytics.phosphorus} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Potassium (K)</span>
                          <span className="text-sm font-medium text-foreground">{landData.analytics.potassium}%</span>
                        </div>
                        <Progress value={landData.analytics.potassium} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Organic Matter</span>
                          <span className="text-sm font-medium text-foreground">{landData.analytics.organic}%</span>
                        </div>
                        <Progress value={landData.analytics.organic * 20} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Crop Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Wheat className="h-5 w-5 text-primary" />
                      Recommended Crops
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {landData.crops.map((crop) => (
                        <Badge key={crop} className="px-4 py-2 text-base bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20">
                          {crop}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Land Features</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {landData.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Map Placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="glass-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="h-80 bg-secondary flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Interactive Map View</p>
                        <p className="text-sm text-muted-foreground mt-2">{landData.fullAddress}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24"
              >
                <Card className="glass-card neon-border">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-primary mb-2">{landData.price}</div>
                      <div className="text-muted-foreground">Lease Amount</div>
                    </div>

                    <div className="space-y-4">
                      <Link href="/contact-unlock">
                        <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                          <Phone className="h-5 w-5 mr-2" />
                          Request Lease
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full h-12 neon-border hover:bg-primary/10">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Message Owner
                      </Button>
                    </div>

                    {/* Owner Info */}
                    <div className="mt-8 pt-6 border-t border-border">
                      <h3 className="font-semibold mb-4">Land Owner</h3>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">
                            {landData.owner.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2 text-foreground">
                            {landData.owner.name}
                            {landData.owner.verified && (
                              <ShieldCheck className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Member since {landData.owner.memberSince}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center p-3 rounded-lg bg-secondary">
                          <div className="text-lg font-semibold text-foreground">{landData.owner.totalLands}</div>
                          <div className="text-xs text-muted-foreground">Total Lands</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-secondary">
                          <div className="text-lg font-semibold text-foreground">{landData.owner.responseRate}</div>
                          <div className="text-xs text-muted-foreground">Response Rate</div>
                        </div>
                      </div>
                    </div>

                    {/* Climate Info */}
                    <div className="mt-6 pt-6 border-t border-border">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Sun className="h-5 w-5 text-yellow-400" />
                        Climate Info
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Humidity</span>
                          <span className="font-medium text-foreground">{landData.climate.humidity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Best Season</span>
                          <span className="font-medium text-foreground">{landData.climate.bestSeason}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

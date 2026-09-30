"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { 
  Search, 
  MapPin, 
  Droplets, 
  Leaf, 
  Star,
  Filter,
  Grid,
  List,
  ArrowRight,
  X,
  SlidersHorizontal
} from "lucide-react"
import { apiRequest, mediaUrl } from "@/lib/api"

const lands = [
  {
    id: 1,
    title: "Premium Farmland in Karnataka",
    location: "Hassan, Karnataka",
    size: "25 Acres",
    price: 15000,
    waterLevel: "High",
    soilType: "Black Soil",
    crops: ["Rice", "Sugarcane", "Cotton"],
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070&auto=format&fit=crop",
    rating: 4.8,
    verified: true,
    state: "Karnataka",
    district: "Hassan"
  },
  {
    id: 2,
    title: "Fertile Plains in Punjab",
    location: "Ludhiana, Punjab",
    size: "40 Acres",
    price: 25000,
    waterLevel: "Medium",
    soilType: "Alluvial Soil",
    crops: ["Wheat", "Rice", "Maize"],
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2070&auto=format&fit=crop",
    rating: 4.9,
    verified: true,
    state: "Punjab",
    district: "Ludhiana"
  },
  {
    id: 3,
    title: "Orchard Land in Maharashtra",
    location: "Nashik, Maharashtra",
    size: "15 Acres",
    price: 12000,
    waterLevel: "High",
    soilType: "Red Soil",
    crops: ["Grapes", "Pomegranate", "Onion"],
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop",
    rating: 4.7,
    verified: true,
    state: "Maharashtra",
    district: "Nashik"
  },
  {
    id: 4,
    title: "River-Adjacent Farmland",
    location: "Thanjavur, Tamil Nadu",
    size: "30 Acres",
    price: 18000,
    waterLevel: "Very High",
    soilType: "Alluvial Soil",
    crops: ["Rice", "Banana", "Coconut"],
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop",
    rating: 4.6,
    verified: true,
    state: "Tamil Nadu",
    district: "Thanjavur"
  },
  {
    id: 5,
    title: "Highland Tea Estate",
    location: "Munnar, Kerala",
    size: "50 Acres",
    price: 35000,
    waterLevel: "High",
    soilType: "Laterite Soil",
    crops: ["Tea", "Cardamom", "Pepper"],
    image: "https://images.unsplash.com/photo-1582639590347-91d07f6d52c8?q=80&w=2070&auto=format&fit=crop",
    rating: 4.9,
    verified: true,
    state: "Kerala",
    district: "Idukki"
  },
  {
    id: 6,
    title: "Cotton Belt Farmland",
    location: "Guntur, Andhra Pradesh",
    size: "35 Acres",
    price: 20000,
    waterLevel: "Medium",
    soilType: "Black Soil",
    crops: ["Cotton", "Chilli", "Tobacco"],
    image: "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?q=80&w=2070&auto=format&fit=crop",
    rating: 4.5,
    verified: true,
    state: "Andhra Pradesh",
    district: "Guntur"
  },
]

const states = ["All States", "Karnataka", "Punjab", "Maharashtra", "Tamil Nadu", "Kerala", "Andhra Pradesh", "Gujarat", "Rajasthan"]
const soilTypes = ["All Soils", "Black Soil", "Alluvial Soil", "Red Soil", "Laterite Soil", "Sandy Soil"]
const waterLevels = ["All Levels", "Very High", "High", "Medium", "Low"]
const cropTypes = ["All Crops", "Rice", "Wheat", "Cotton", "Sugarcane", "Tea", "Grapes", "Banana"]

type LandCard = {
  id: string
  title: string
  location: string
  size: string
  acres: number
  price: number
  waterLevel: string
  soilType: string
  crops: string[]
  image: string
  verified: boolean
  state: string
  district: string
}

type ApiLand = {
  id: string
  title: string
  state: string
  district: string
  sizeAcres: number
  annualRentInr: number
  waterLevel: string
  waterSources: string[]
  soilType: string
  crops: string[]
  images: string[]
}

export default function ExplorePage() {
  const [lands, setLands] = useState<LandCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState("All States")
  const [selectedSoil, setSelectedSoil] = useState("All Soils")
  const [selectedWater, setSelectedWater] = useState("All Levels")
  const [selectedCrop, setSelectedCrop] = useState("All Crops")
  const [priceRange, setPriceRange] = useState([0, 5000000])
  const [acreRange, setAcreRange] = useState([0, 100])

  useEffect(() => {
    apiRequest<{ items: ApiLand[] }>("/lands?limit=100")
      .then(({ items }) => setLands(items.map(land => ({
        id: land.id,
        title: land.title,
        location: `${land.district}, ${land.state}`,
        size: `${land.sizeAcres} Acres`,
        acres: land.sizeAcres,
        price: land.annualRentInr,
        waterLevel: land.waterLevel || (land.waterSources.length ? "Available" : "Not listed"),
        soilType: land.soilType,
        crops: land.crops,
        image: mediaUrl(land.images[0]),
        verified: true,
        state: land.state,
        district: land.district,
      }))))
      .catch(cause => setLoadError(cause instanceof Error ? cause.message : "Unable to load land listings"))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredLands = lands.filter((land) => {
    const matchesSearch = land.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      land.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesState = selectedState === "All States" || land.state === selectedState
    const matchesSoil = selectedSoil === "All Soils" || land.soilType === selectedSoil
    const matchesWater = selectedWater === "All Levels" || land.waterLevel.toLowerCase() === selectedWater.toLowerCase()
    const matchesCrop = selectedCrop === "All Crops" || land.crops.includes(selectedCrop)
    const matchesPrice = land.price >= priceRange[0] && land.price <= priceRange[1]
    const matchesAcres = land.acres >= acreRange[0] && land.acres <= acreRange[1]
    
    return matchesSearch && matchesState && matchesSoil && matchesWater && matchesCrop && matchesPrice && matchesAcres
  })

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedState("All States")
    setSelectedSoil("All Soils")
    setSelectedWater("All Levels")
    setSelectedCrop("All Crops")
    setPriceRange([0, 5000000])
    setAcreRange([0, 100])
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Explore <span className="text-gradient">Agricultural Lands</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Find the perfect land for your farming needs
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by location, land type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-secondary border-border focus:border-primary"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-6 neon-border"
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                Filters
              </Button>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-12 w-12"
                >
                  <Grid className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-12 w-12"
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-80 flex-shrink-0"
              >
                <Card className="glass-card sticky top-24">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        Filters
                      </h3>
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-primary">
                        Clear All
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {/* State Filter */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">State</Label>
                        <Select value={selectedState} onValueChange={setSelectedState}>
                          <SelectTrigger className="bg-secondary border-border">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Soil Type Filter */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Soil Type</Label>
                        <Select value={selectedSoil} onValueChange={setSelectedSoil}>
                          <SelectTrigger className="bg-secondary border-border">
                            <SelectValue placeholder="Select soil type" />
                          </SelectTrigger>
                          <SelectContent>
                            {soilTypes.map((soil) => (
                              <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Water Availability Filter */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Water Availability</Label>
                        <Select value={selectedWater} onValueChange={setSelectedWater}>
                          <SelectTrigger className="bg-secondary border-border">
                            <SelectValue placeholder="Select water level" />
                          </SelectTrigger>
                          <SelectContent>
                            {waterLevels.map((level) => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Crop Type Filter */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Crop Type</Label>
                        <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                          <SelectTrigger className="bg-secondary border-border">
                            <SelectValue placeholder="Select crop" />
                          </SelectTrigger>
                          <SelectContent>
                            {cropTypes.map((crop) => (
                              <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Range */}
                      <div>
                        <Label className="text-sm font-medium mb-4 block">
                          Annual Rent: ₹{priceRange[0].toLocaleString("en-IN")} - ₹{priceRange[1].toLocaleString("en-IN")}/year
                        </Label>
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          min={0}
                          max={5000000}
                          step={50000}
                          className="py-2"
                        />
                      </div>

                      {/* Acre Range */}
                      <div>
                        <Label className="text-sm font-medium mb-4 block">
                          Land Size: {acreRange[0]} - {acreRange[1]} Acres
                        </Label>
                        <Slider
                          value={acreRange}
                          onValueChange={setAcreRange}
                          min={0}
                          max={100}
                          step={5}
                          className="py-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.aside>
            )}

            {/* Results */}
            <div className="flex-grow">
              {/* Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing <span className="text-primary font-semibold">{filteredLands.length}</span> lands
                </p>
              </div>
              {isLoading && <p className="mb-6 text-sm text-muted-foreground">Loading approved listings...</p>}
              {loadError && <p role="alert" className="mb-6 text-sm text-red-500">{loadError}</p>}

              {/* Land Cards */}
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {filteredLands.map((land, index) => (
                  <motion.div
                    key={land.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`glass-card overflow-hidden group hover:border-primary/30 transition-all duration-300 ${viewMode === "list" ? "flex flex-col md:flex-row" : ""}`}>
                      {/* Image */}
                      <div className={`relative overflow-hidden ${viewMode === "list" ? "md:w-72 h-48 md:h-auto" : "h-56"}`}>
                        <img
                          src={land.image}
                          alt={land.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          {land.verified && (
                            <Badge className="bg-primary text-primary-foreground">
                              Verified listing
                            </Badge>
                          )}
                        </div>
                        
                        {/* Price */}
                        <div className="absolute bottom-4 right-4">
                          <div className="text-xl font-bold text-primary">₹{land.price.toLocaleString("en-IN")}/year</div>
                        </div>
                      </div>

                      <CardContent className={`p-6 ${viewMode === "list" ? "flex-grow" : ""}`}>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {land.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{land.location}</span>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-2 rounded-lg bg-secondary">
                            <div className="text-sm font-semibold text-foreground">{land.size}</div>
                            <div className="text-xs text-muted-foreground">Size</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-secondary">
                            <div className="flex items-center justify-center gap-1">
                              <Droplets className="h-3 w-3 text-blue-400" />
                              <span className="text-sm font-semibold text-foreground">{land.waterLevel}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Water</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-secondary">
                            <div className="flex items-center justify-center gap-1">
                              <Leaf className="h-3 w-3 text-primary" />
                              <span className="text-sm font-semibold text-foreground truncate">{land.soilType.split(' ')[0]}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Soil</div>
                          </div>
                        </div>

                        {/* Crops */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {land.crops.map((crop) => (
                            <Badge key={crop} variant="secondary" className="text-xs">
                              {crop}
                            </Badge>
                          ))}
                        </div>

                        <Link href={`/land/${land.id}`}>
                          <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground group/btn">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {!isLoading && !loadError && filteredLands.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🌾</div>
                  <h3 className="text-xl font-semibold mb-2">No lands found</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your filters to see more results</p>
                  <Button onClick={clearFilters} variant="outline" className="neon-border">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

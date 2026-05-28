"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Wheat, 
  Droplets, 
  Sun, 
  Thermometer, 
  TrendingUp,
  Calendar
} from "lucide-react"

const crops = [
  {
    name: "Rice",
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=300&auto=format&fit=crop",
    season: "Kharif",
    water: "High",
    soil: ["Alluvial", "Clay"],
    growth: "120-150 days",
    yield: "4-6 tons/hectare",
    profit: "High",
    states: ["Punjab", "West Bengal", "Andhra Pradesh"]
  },
  {
    name: "Wheat",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=300&auto=format&fit=crop",
    season: "Rabi",
    water: "Medium",
    soil: ["Loamy", "Alluvial"],
    growth: "100-120 days",
    yield: "3-5 tons/hectare",
    profit: "High",
    states: ["Punjab", "Haryana", "UP"]
  },
  {
    name: "Cotton",
    image: "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?q=80&w=300&auto=format&fit=crop",
    season: "Kharif",
    water: "Medium",
    soil: ["Black", "Alluvial"],
    growth: "150-180 days",
    yield: "2-3 tons/hectare",
    profit: "Very High",
    states: ["Gujarat", "Maharashtra", "Telangana"]
  },
  {
    name: "Sugarcane",
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?q=80&w=300&auto=format&fit=crop",
    season: "Year-round",
    water: "Very High",
    soil: ["Loamy", "Clay"],
    growth: "12-18 months",
    yield: "70-100 tons/hectare",
    profit: "High",
    states: ["UP", "Maharashtra", "Karnataka"]
  },
  {
    name: "Soybean",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=300&auto=format&fit=crop",
    season: "Kharif",
    water: "Medium",
    soil: ["Black", "Red"],
    growth: "90-100 days",
    yield: "1.5-2.5 tons/hectare",
    profit: "Medium",
    states: ["MP", "Maharashtra", "Rajasthan"]
  },
  {
    name: "Groundnut",
    image: "https://images.unsplash.com/photo-1567892737950-30c4db37cd89?q=80&w=300&auto=format&fit=crop",
    season: "Kharif/Rabi",
    water: "Low",
    soil: ["Sandy", "Red"],
    growth: "100-130 days",
    yield: "1.5-2 tons/hectare",
    profit: "Medium",
    states: ["Gujarat", "AP", "Tamil Nadu"]
  },
]

const getWaterColor = (level: string) => {
  switch (level) {
    case "Very High": return "text-blue-400 bg-blue-400/10"
    case "High": return "text-blue-400 bg-blue-400/10"
    case "Medium": return "text-yellow-400 bg-yellow-400/10"
    case "Low": return "text-orange-400 bg-orange-400/10"
    default: return "text-muted-foreground bg-secondary"
  }
}

const getProfitColor = (level: string) => {
  switch (level) {
    case "Very High": return "text-green-400 bg-green-400/10"
    case "High": return "text-green-400 bg-green-400/10"
    case "Medium": return "text-yellow-400 bg-yellow-400/10"
    case "Low": return "text-orange-400 bg-orange-400/10"
    default: return "text-muted-foreground bg-secondary"
  }
}

export function CropRecommendations() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
            <Wheat className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI Recommendations</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Smart <span className="text-gradient">Crop Selection</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover the best crops for your land based on soil type, water availability, and climate conditions
          </p>
        </motion.div>

        {/* Crop Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop, index) => (
            <motion.div
              key={crop.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card h-full group hover:border-primary/30 transition-all duration-300 overflow-hidden">
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={crop.image}
                    alt={crop.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  
                  {/* Season Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary text-primary-foreground">
                      {crop.season}
                    </Badge>
                  </div>
                  
                  {/* Crop Name */}
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-xl font-bold text-foreground">{crop.name}</h3>
                  </div>
                </div>

                <CardContent className="p-5">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      <Badge className={getWaterColor(crop.water)}>
                        {crop.water} Water
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <Badge className={getProfitColor(crop.profit)}>
                        {crop.profit} Profit
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Growth Period
                      </span>
                      <span className="font-medium text-foreground">{crop.growth}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Wheat className="h-4 w-4" /> Yield
                      </span>
                      <span className="font-medium text-foreground">{crop.yield}</span>
                    </div>
                  </div>
                  
                  {/* Soil Types */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground mb-2">Suitable Soil Types</div>
                    <div className="flex flex-wrap gap-1">
                      {crop.soil.map((soil) => (
                        <Badge key={soil} variant="secondary" className="text-xs">
                          {soil}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Top States */}
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-2">Top Growing States</div>
                    <div className="flex flex-wrap gap-1">
                      {crop.states.map((state) => (
                        <Badge key={state} variant="outline" className="text-xs border-primary/30 text-primary">
                          {state}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

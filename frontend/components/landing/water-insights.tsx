"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Droplets, 
  Cloud, 
  Thermometer, 
  Waves,
  TrendingUp,
  AlertCircle
} from "lucide-react"

const waterData = [
  {
    region: "Northern Plains",
    level: 85,
    status: "excellent",
    sources: ["Tube Well", "Canal", "River"],
    rainfall: "850mm/year",
    trend: "stable"
  },
  {
    region: "Western Region",
    level: 45,
    status: "moderate",
    sources: ["Borewell", "Rainwater"],
    rainfall: "400mm/year",
    trend: "declining"
  },
  {
    region: "Southern Peninsula",
    level: 70,
    status: "good",
    sources: ["Lake", "Pond", "Well"],
    rainfall: "1200mm/year",
    trend: "rising"
  },
  {
    region: "Eastern Delta",
    level: 95,
    status: "excellent",
    sources: ["River", "Canal", "Flood Plains"],
    rainfall: "1600mm/year",
    trend: "stable"
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "excellent": return "text-green-400 bg-green-400/10"
    case "good": return "text-blue-400 bg-blue-400/10"
    case "moderate": return "text-yellow-400 bg-yellow-400/10"
    case "low": return "text-red-400 bg-red-400/10"
    default: return "text-muted-foreground bg-secondary"
  }
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "rising": return <TrendingUp className="h-4 w-4 text-green-400 rotate-0" />
    case "declining": return <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />
    default: return <TrendingUp className="h-4 w-4 text-muted-foreground rotate-90" />
  }
}

export function WaterInsights() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
            <Droplets className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Real-Time Data</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Water <span className="text-gradient">Availability Insights</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Make informed decisions with real-time water availability data across regions
          </p>
        </motion.div>

        {/* Water Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {waterData.map((data, index) => (
            <motion.div
              key={data.region}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card h-full hover:border-blue-400/30 transition-all duration-300">
                <CardContent className="p-6">
                  {/* Region Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">{data.region}</h3>
                    {getTrendIcon(data.trend)}
                  </div>
                  
                  {/* Water Level Indicator */}
                  <div className="relative mb-6">
                    <div className="h-32 w-full rounded-xl bg-secondary/50 overflow-hidden relative">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${data.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400/50 rounded-b-xl"
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Waves className="h-8 w-8 text-white/30 animate-pulse" />
                        </div>
                      </motion.div>
                      
                      {/* Level Text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-foreground">{data.level}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center justify-center mb-4">
                    <Badge className={`capitalize ${getStatusColor(data.status)}`}>
                      {data.status}
                    </Badge>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Cloud className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{data.rainfall}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {data.sources.map((source) => (
                        <Badge key={source} variant="secondary" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="glass-card border-blue-400/30">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="p-4 rounded-2xl bg-blue-400/10">
                    <AlertCircle className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                <div className="flex-grow text-center md:text-left">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Water Data Updated Daily</h3>
                  <p className="text-muted-foreground">
                    Our water availability data is sourced from government agencies and IoT sensors across farmlands. 
                    Data is refreshed daily to ensure you have the most accurate information for planning.
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">500+</div>
                    <div className="text-xs text-muted-foreground">Sensors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">28</div>
                    <div className="text-xs text-muted-foreground">States</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

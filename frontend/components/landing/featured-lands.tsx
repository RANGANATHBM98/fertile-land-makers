"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  MapPin, 
  Droplets, 
  Leaf, 
  ArrowRight
} from "lucide-react"
import { apiRequest, mediaUrl } from "@/lib/api"

type FeaturedLand = {
  id: string
  title: string
  location: string
  size: string
  price: string
  waterLevel: string
  soilType: string
  crops: string[]
  image: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function FeaturedLands() {
  const [featuredLands, setFeaturedLands] = useState<FeaturedLand[]>([])

  useEffect(() => {
    apiRequest<{ items: Array<{
      id: string
      title: string
      district: string
      state: string
      sizeAcres: number
      monthlyRentInr: number
      waterLevel: string
      waterSources: string[]
      soilType: string
      crops: string[]
      images: string[]
    }> }>("/lands?limit=3")
      .then(({ items }) => setFeaturedLands(items.map(land => ({
        id: land.id,
        title: land.title,
        location: `${land.district}, ${land.state}`,
        size: `${land.sizeAcres} Acres`,
        price: `₹${land.monthlyRentInr.toLocaleString("en-IN")}/month`,
        waterLevel: land.waterLevel || land.waterSources.join(", "),
        soilType: land.soilType,
        crops: land.crops,
        image: mediaUrl(land.images[0]),
      }))))
      .catch(() => setFeaturedLands([]))
  }, [])

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1 text-primary border-primary/30">
            Featured Listings
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Discover <span className="text-gradient">Premium Lands</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Explore our handpicked selection of fertile agricultural lands ready for cultivation
          </p>
        </motion.div>

        {/* Land Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featuredLands.map((land) => (
            <motion.div key={land.id} variants={item}>
              <Card className="glass-card overflow-hidden group hover:border-primary/30 transition-all duration-300">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={land.image}
                    alt={land.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-primary text-primary-foreground">Verified listing</Badge>
                  </div>
                  
                  {/* Price */}
                  <div className="absolute bottom-4 right-4">
                    <div className="text-xl font-bold text-primary">{land.price}</div>
                  </div>
                </div>

                <CardContent className="p-6">
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
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/explore">
            <Button size="lg" variant="outline" className="neon-border hover:bg-primary/10">
              View All Listings
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

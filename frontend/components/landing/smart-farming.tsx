"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Cpu, 
  Droplets, 
  Leaf, 
  Sun, 
  Wind, 
  BarChart3,
  Satellite,
  CloudRain
} from "lucide-react"

const features = [
  {
    icon: Satellite,
    title: "Drone Mapping",
    description: "High-resolution aerial imagery for precise land assessment and monitoring",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-cyan-400"
  },
  {
    icon: Cpu,
    title: "AI Crop Analysis",
    description: "Machine learning algorithms recommend optimal crops based on soil and climate data",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400"
  },
  {
    icon: Droplets,
    title: "Water Intelligence",
    description: "Real-time water availability insights and irrigation optimization",
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400"
  },
  {
    icon: Leaf,
    title: "Soil Health Score",
    description: "Comprehensive soil analysis with fertility levels and nutrient mapping",
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400"
  },
  {
    icon: Sun,
    title: "Climate Insights",
    description: "Historical weather patterns and future climate predictions for planning",
    color: "from-orange-500/20 to-yellow-500/20",
    iconColor: "text-orange-400"
  },
  {
    icon: BarChart3,
    title: "Yield Prediction",
    description: "Data-driven yield forecasting to maximize your farming returns",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400"
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function SmartFarming() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      
      {/* Animated Orbs */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
            <Cpu className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Smart Technology</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Smart Farming</span> Technology
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Leverage cutting-edge AI and IoT technologies to make informed farming decisions
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={item}>
              <Card className="glass-card h-full group hover:border-primary/30 transition-all duration-300 overflow-hidden">
                <CardContent className="p-6 relative">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="relative">
                    {/* Icon */}
                    <div className="mb-4">
                      <div className="inline-flex p-3 rounded-xl bg-secondary group-hover:bg-background/50 transition-colors">
                        <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { icon: Satellite, value: "98%", label: "Mapping Accuracy" },
            { icon: CloudRain, value: "85%", label: "Weather Accuracy" },
            { icon: Leaf, value: "40%", label: "Yield Increase" },
            { icon: Wind, value: "60%", label: "Water Savings" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex p-4 rounded-2xl glass-card mb-4">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

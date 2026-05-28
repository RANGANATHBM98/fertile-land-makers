"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote, Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Farmer, Punjab",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    content: "FertileLandMakers helped me find the perfect land for wheat cultivation. The soil analysis was spot on, and I achieved 40% higher yield than expected!",
    rating: 5,
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Land Owner, Karnataka",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    content: "I had unused land for years. Through this platform, I found trustworthy farmers and now earn a steady income while my land is productively used.",
    rating: 5,
  },
  {
    id: 3,
    name: "Amit Patel",
    role: "Organic Farmer, Gujarat",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
    content: "The water availability insights and crop recommendations are incredibly accurate. It&apos;s like having an agricultural expert by your side 24/7.",
    rating: 5,
  },
  {
    id: 4,
    name: "Lakshmi Devi",
    role: "Farmer, Tamil Nadu",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    content: "As a woman farmer, I was initially skeptical. But the verification system gave me confidence, and now I&apos;m successfully farming 10 acres!",
    rating: 5,
  },
]

const successStories = [
  {
    id: 1,
    title: "From IT Professional to Successful Farmer",
    description: "Suresh left his IT job and now runs a 50-acre organic farm with support from FertileLandMakers",
    image: "https://images.unsplash.com/photo-1589923188651-268a9765e432?q=80&w=400&auto=format&fit=crop",
    stats: { yield: "+65%", income: "₹15L/year", land: "50 Acres" }
  },
  {
    id: 2,
    title: "Women-Led Farming Collective",
    description: "A group of 15 women farmers now cultivate 200 acres collectively, transforming their village economy",
    image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=400&auto=format&fit=crop",
    stats: { yield: "+80%", income: "₹50L/year", land: "200 Acres" }
  },
]

export function Testimonials() {
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
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Success <span className="text-gradient">Stories</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Hear from farmers and landowners who transformed their lives with FertileLandMakers
          </p>
        </motion.div>

        {/* Featured Success Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
        >
          {successStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="glass-card overflow-hidden h-full group hover:border-primary/30 transition-all duration-300">
                <div className="relative h-64">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  
                  {/* Stats Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-around">
                    {Object.entries(story.stats).map(([key, value]) => (
                      <div key={key} className="text-center glass rounded-xl px-4 py-2">
                        <div className="text-lg font-bold text-primary">{value}</div>
                        <div className="text-xs text-muted-foreground capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
                  <p className="text-muted-foreground">{story.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card h-full hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  
                  {/* Content */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {testimonial.content}
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/30">
                        <AvatarImage src={testimonial.image} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MapPin,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Bell,
  Star,
  ArrowRight,
  Calendar,
  Sparkles,
  Droplets,
  Leaf,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

const savedLands = [
  {
    id: 1,
    title: "Premium Farmland in Karnataka",
    location: "Hassan, Karnataka",
    size: "25 Acres",
    price: "₹15,000/mo",
    waterLevel: "High",
    soilType: "Black Soil",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Fertile Plains in Punjab",
    location: "Ludhiana, Punjab",
    size: "40 Acres",
    price: "₹25,000/mo",
    waterLevel: "Medium",
    soilType: "Alluvial Soil",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=400&auto=format&fit=crop",
    rating: 4.9,
  },
]

const applications = [
  {
    id: 1,
    land: "Premium Farmland in Karnataka",
    owner: "Rajesh Gowda",
    date: "2024-01-15",
    status: "pending",
    location: "Hassan, Karnataka"
  },
  {
    id: 2,
    land: "Orchard Land in Maharashtra",
    owner: "Sunita Deshmukh",
    date: "2024-01-10",
    status: "approved",
    location: "Nashik, Maharashtra"
  },
  {
    id: 3,
    land: "Cotton Belt Farmland",
    owner: "Venkat Rao",
    date: "2024-01-05",
    status: "rejected",
    location: "Guntur, AP"
  },
]

const recommendedLands = [
  {
    id: 4,
    title: "River-Adjacent Farmland",
    location: "Thanjavur, Tamil Nadu",
    size: "30 Acres",
    price: "₹18,000/mo",
    waterLevel: "Very High",
    soilType: "Alluvial Soil",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=400&auto=format&fit=crop",
    rating: 4.6,
    match: 95,
  },
  {
    id: 5,
    title: "Highland Tea Estate",
    location: "Munnar, Kerala",
    size: "50 Acres",
    price: "₹35,000/mo",
    waterLevel: "High",
    soilType: "Laterite Soil",
    image: "https://images.unsplash.com/photo-1582639590347-91d07f6d52c8?q=80&w=400&auto=format&fit=crop",
    rating: 4.9,
    match: 88,
  },
  {
    id: 6,
    title: "Cotton Belt Farmland",
    location: "Guntur, AP",
    size: "35 Acres",
    price: "₹20,000/mo",
    waterLevel: "Medium",
    soilType: "Black Soil",
    image: "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?q=80&w=400&auto=format&fit=crop",
    rating: 4.5,
    match: 82,
  },
]

const notifications = [
  {
    id: 1,
    type: "approval",
    message: "Your lease request for Orchard Land in Maharashtra has been approved!",
    time: "2 hours ago",
    read: false
  },
  {
    id: 2,
    type: "recommendation",
    message: "New land matching your preferences is available in Tamil Nadu",
    time: "1 day ago",
    read: false
  },
  {
    id: 3,
    type: "reminder",
    message: "Complete your profile to get better recommendations",
    time: "3 days ago",
    read: true
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved": return "bg-green-400/10 text-green-400"
    case "pending": return "bg-yellow-400/10 text-yellow-400"
    case "rejected": return "bg-red-400/10 text-red-400"
    default: return "bg-secondary text-muted-foreground"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved": return <CheckCircle className="h-4 w-4" />
    case "pending": return <Clock className="h-4 w-4" />
    case "rejected": return <XCircle className="h-4 w-4" />
    default: return null
  }
}

export default function FarmerDashboard() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="text-gradient">Farmer</span> Dashboard
              </h1>
              <p className="text-muted-foreground">Find and manage your farming opportunities</p>
            </div>
            <Link href="/explore">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Search className="h-5 w-5 mr-2" />
                Explore Lands
              </Button>
            </Link>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Saved Lands</p>
                    <p className="text-3xl font-bold text-foreground">{savedLands.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-400/10">
                    <Heart className="h-6 w-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Applications</p>
                    <p className="text-3xl font-bold text-foreground">{applications.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-400/10">
                    <Clock className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Approved</p>
                    <p className="text-3xl font-bold text-foreground">1</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-400/10">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notifications</p>
                    <p className="text-3xl font-bold text-foreground">{notifications.filter(n => !n.read).length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="saved" className="space-y-6">
                <TabsList className="glass-card p-1">
                  <TabsTrigger value="saved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Saved Lands
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Applications
                  </TabsTrigger>
                  <TabsTrigger value="recommended" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    For You
                  </TabsTrigger>
                </TabsList>

                {/* Saved Lands Tab */}
                <TabsContent value="saved" className="space-y-4">
                  {savedLands.map((land, index) => (
                    <motion.div
                      key={land.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-card hover:border-primary/30 transition-all">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-40 h-32 rounded-lg overflow-hidden">
                              <img src={land.image} alt={land.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg text-foreground">{land.title}</h3>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-4 w-4" />
                                    {land.location}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-400">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="text-sm font-medium">{land.rating}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 mt-4">
                                <div className="flex items-center gap-1 text-sm">
                                  <Leaf className="h-4 w-4 text-primary" />
                                  <span className="text-muted-foreground">{land.size}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Droplets className="h-4 w-4 text-blue-400" />
                                  <span className="text-muted-foreground">{land.waterLevel}</span>
                                </div>
                                <div className="text-lg font-bold text-primary">{land.price}</div>
                              </div>

                              <div className="flex gap-2 mt-4">
                                <Link href={`/land/${land.id}`}>
                                  <Button size="sm" className="bg-primary text-primary-foreground">
                                    View Details
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                  </Button>
                                </Link>
                                <Button size="sm" variant="outline" className="text-red-400 hover:bg-red-400/10">
                                  <Heart className="h-4 w-4 mr-1 fill-current" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                {/* Applications Tab */}
                <TabsContent value="applications" className="space-y-4">
                  {applications.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-card hover:border-primary/30 transition-all">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">{app.land}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Owner: {app.owner}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-4 w-4" />
                                {app.location}
                              </p>
                            </div>
                            <Badge className={`capitalize ${getStatusColor(app.status)}`}>
                              {getStatusIcon(app.status)}
                              <span className="ml-1">{app.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 inline mr-1" />
                              Applied on {app.date}
                            </p>
                            {app.status === "approved" && (
                              <Link href="/contact-unlock">
                                <Button size="sm" className="bg-primary text-primary-foreground">
                                  Contact Owner
                                </Button>
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                {/* Recommended Tab */}
                <TabsContent value="recommended" className="space-y-4">
                  {recommendedLands.map((land, index) => (
                    <motion.div
                      key={land.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-card hover:border-primary/30 transition-all">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative w-full sm:w-40 h-32 rounded-lg overflow-hidden">
                              <img src={land.image} alt={land.title} className="w-full h-full object-cover" />
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-primary text-primary-foreground">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  {land.match}% Match
                                </Badge>
                              </div>
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg text-foreground">{land.title}</h3>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-4 w-4" />
                                    {land.location}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-400">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="text-sm font-medium">{land.rating}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 mt-4">
                                <div className="flex items-center gap-1 text-sm">
                                  <Leaf className="h-4 w-4 text-primary" />
                                  <span className="text-muted-foreground">{land.size}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Droplets className="h-4 w-4 text-blue-400" />
                                  <span className="text-muted-foreground">{land.waterLevel}</span>
                                </div>
                                <div className="text-lg font-bold text-primary">{land.price}</div>
                              </div>

                              <div className="flex gap-2 mt-4">
                                <Link href={`/land/${land.id}`}>
                                  <Button size="sm" className="bg-primary text-primary-foreground">
                                    View Details
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                  </Button>
                                </Link>
                                <Button size="sm" variant="outline" className="neon-border hover:bg-primary/10">
                                  <Heart className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Notifications */}
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg ${
                        notification.read ? "bg-secondary/50" : "bg-primary/10 border border-primary/20"
                      }`}
                    >
                      <p className={`text-sm ${notification.read ? "text-muted-foreground" : "text-foreground"}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="glass-card neon-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Farming Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      Complete your profile for better land recommendations
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      Check soil reports before applying for a lease
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      Verify water availability during site visits
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

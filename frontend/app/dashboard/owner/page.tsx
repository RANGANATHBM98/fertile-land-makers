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
  LayoutDashboard,
  MapPin,
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Calendar,
  Bell,
  Settings,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import Link from "next/link"

const ownerLands = [
  {
    id: 1,
    title: "Premium Farmland in Karnataka",
    location: "Hassan, Karnataka",
    size: "25 Acres",
    price: "₹15,000/mo",
    status: "active",
    views: 245,
    inquiries: 12,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "River-side Land in Tamil Nadu",
    location: "Thanjavur, Tamil Nadu",
    size: "30 Acres",
    price: "₹18,000/mo",
    status: "pending",
    views: 89,
    inquiries: 5,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Highland Tea Estate",
    location: "Munnar, Kerala",
    size: "50 Acres",
    price: "₹35,000/mo",
    status: "leased",
    views: 567,
    inquiries: 34,
    image: "https://images.unsplash.com/photo-1582639590347-91d07f6d52c8?q=80&w=400&auto=format&fit=crop"
  },
]

const leaseRequests = [
  {
    id: 1,
    farmer: "Ramesh Kumar",
    land: "Premium Farmland in Karnataka",
    date: "2024-01-15",
    status: "pending",
    message: "I am interested in leasing this land for rice cultivation."
  },
  {
    id: 2,
    farmer: "Priya Sharma",
    land: "River-side Land in Tamil Nadu",
    date: "2024-01-14",
    status: "approved",
    message: "Looking to grow organic vegetables."
  },
  {
    id: 3,
    farmer: "Suresh Patel",
    land: "Premium Farmland in Karnataka",
    date: "2024-01-13",
    status: "rejected",
    message: "Want to try cotton farming."
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-400/10 text-green-400"
    case "pending": return "bg-yellow-400/10 text-yellow-400"
    case "leased": return "bg-blue-400/10 text-blue-400"
    case "approved": return "bg-green-400/10 text-green-400"
    case "rejected": return "bg-red-400/10 text-red-400"
    default: return "bg-secondary text-muted-foreground"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
    case "approved":
      return <CheckCircle className="h-4 w-4" />
    case "pending":
      return <Clock className="h-4 w-4" />
    case "rejected":
      return <XCircle className="h-4 w-4" />
    default:
      return null
  }
}

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

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
                <span className="text-gradient">Land Owner</span> Dashboard
              </h1>
              <p className="text-muted-foreground">Manage your lands and lease requests</p>
            </div>
            <Link href="/upload">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-5 w-5 mr-2" />
                List New Land
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
                    <p className="text-sm text-muted-foreground mb-1">Total Lands</p>
                    <p className="text-3xl font-bold text-foreground">3</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">+1</span>
                  <span className="text-muted-foreground">this month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                    <p className="text-3xl font-bold text-foreground">901</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-400/10">
                    <Eye className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">+23%</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Leases</p>
                    <p className="text-3xl font-bold text-foreground">1</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-400/10">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm">
                  <span className="text-muted-foreground">50 Acres leased</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Earnings</p>
                    <p className="text-3xl font-bold text-foreground">₹35K</p>
                  </div>
                  <div className="p-3 rounded-xl bg-yellow-400/10">
                    <DollarSign className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">+15%</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="lands" className="space-y-6">
              <TabsList className="glass-card p-1">
                <TabsTrigger value="lands" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  My Lands
                </TabsTrigger>
                <TabsTrigger value="requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Lease Requests
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* My Lands Tab */}
              <TabsContent value="lands" className="space-y-4">
                {ownerLands.map((land, index) => (
                  <motion.div
                    key={land.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card hover:border-primary/30 transition-all">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden">
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
                              <Badge className={`capitalize ${getStatusColor(land.status)}`}>
                                {getStatusIcon(land.status)}
                                <span className="ml-1">{land.status}</span>
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-6 mt-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Size</p>
                                <p className="font-medium text-foreground">{land.size}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Price</p>
                                <p className="font-medium text-primary">{land.price}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Views</p>
                                <p className="font-medium text-foreground">{land.views}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Inquiries</p>
                                <p className="font-medium text-foreground">{land.inquiries}</p>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button variant="outline" size="sm" className="neon-border hover:bg-primary/10">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Link href={`/land/${land.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              {/* Lease Requests Tab */}
              <TabsContent value="requests" className="space-y-4">
                {leaseRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card hover:border-primary/30 transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-xl font-bold text-primary">
                                {request.farmer.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{request.farmer}</h3>
                              <p className="text-sm text-muted-foreground">for {request.land}</p>
                            </div>
                          </div>
                          <Badge className={`capitalize ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </Badge>
                        </div>
                        
                        <p className="mt-4 text-muted-foreground p-4 rounded-lg bg-secondary">
                          {request.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {request.date}
                          </p>
                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-primary text-primary-foreground">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-400 border-red-400/30 hover:bg-red-400/10">
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Views Over Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center bg-secondary/50 rounded-lg">
                        <p className="text-muted-foreground">Analytics Chart Placeholder</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Earnings Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center bg-secondary/50 rounded-lg">
                        <p className="text-muted-foreground">Earnings Chart Placeholder</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

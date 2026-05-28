"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LayoutDashboard,
  Users,
  MapPin,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Eye,
  MoreVertical,
  Download,
  RefreshCw,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

const stats = [
  { label: "Total Users", value: "12,458", change: "+12%", icon: Users, color: "text-blue-400", bgColor: "bg-blue-400/10" },
  { label: "Total Lands", value: "5,892", change: "+8%", icon: MapPin, color: "text-green-400", bgColor: "bg-green-400/10" },
  { label: "Active Leases", value: "1,234", change: "+15%", icon: Activity, color: "text-purple-400", bgColor: "bg-purple-400/10" },
  { label: "Revenue", value: "₹45.2L", change: "+22%", icon: DollarSign, color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
]

const pendingLands = [
  {
    id: 1,
    title: "Premium Farmland in Karnataka",
    owner: "Rajesh Kumar",
    location: "Hassan, Karnataka",
    size: "25 Acres",
    submitted: "2024-01-15",
    status: "pending",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "River Valley Farm",
    owner: "Sunita Sharma",
    location: "Thanjavur, TN",
    size: "30 Acres",
    submitted: "2024-01-14",
    status: "pending",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Organic Tea Estate",
    owner: "Venkat Rao",
    location: "Munnar, Kerala",
    size: "50 Acres",
    submitted: "2024-01-13",
    status: "pending",
    image: "https://images.unsplash.com/photo-1582639590347-91d07f6d52c8?q=80&w=200&auto=format&fit=crop"
  },
]

const recentUsers = [
  { id: 1, name: "Amit Patel", email: "amit@email.com", role: "Farmer", joined: "2024-01-15", status: "active" },
  { id: 2, name: "Priya Desai", email: "priya@email.com", role: "Land Owner", joined: "2024-01-14", status: "active" },
  { id: 3, name: "Suresh Kumar", email: "suresh@email.com", role: "Farmer", joined: "2024-01-13", status: "pending" },
  { id: 4, name: "Lakshmi Devi", email: "lakshmi@email.com", role: "Land Owner", joined: "2024-01-12", status: "active" },
]

const fraudAlerts = [
  { id: 1, type: "Duplicate Listing", land: "Farm in Gujarat", severity: "high", date: "2024-01-15" },
  { id: 2, type: "Suspicious Activity", user: "Unknown User", severity: "medium", date: "2024-01-14" },
  { id: 3, type: "Document Mismatch", land: "Land in MP", severity: "low", date: "2024-01-13" },
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high": return "bg-red-400/10 text-red-400"
    case "medium": return "bg-yellow-400/10 text-yellow-400"
    case "low": return "bg-blue-400/10 text-blue-400"
    default: return "bg-secondary text-muted-foreground"
  }
}

export default function AdminPanel() {
  const [searchQuery, setSearchQuery] = useState("")

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
                <span className="text-gradient">Admin</span> Dashboard
              </h1>
              <p className="text-muted-foreground">Platform overview and management</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="neon-border">
                <Download className="h-5 w-5 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" className="neon-border">
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <Card key={stat.label} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-4 text-sm">
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">{stat.change}</span>
                    <span className="text-muted-foreground">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="pending" className="space-y-6">
                <TabsList className="glass-card p-1">
                  <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Pending Approvals
                  </TabsTrigger>
                  <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    User Management
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Analytics
                  </TabsTrigger>
                </TabsList>

                {/* Pending Approvals Tab */}
                <TabsContent value="pending" className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Search pending listings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-11 bg-secondary border-border"
                      />
                    </div>
                    <Button variant="outline" className="h-11 neon-border">
                      <Filter className="h-5 w-5" />
                    </Button>
                  </div>

                  {pendingLands.map((land, index) => (
                    <motion.div
                      key={land.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-card hover:border-primary/30 transition-all">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden">
                              <img src={land.image} alt={land.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-foreground">{land.title}</h3>
                                  <p className="text-sm text-muted-foreground">{land.owner}</p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-4 w-4" />
                                    {land.location} • {land.size}
                                  </p>
                                </div>
                                <Badge className="bg-yellow-400/10 text-yellow-400">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              </div>
                              
                              <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                  Submitted: {land.submitted}
                                </p>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="neon-border hover:bg-primary/10">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Review
                                  </Button>
                                  <Button size="sm" className="bg-green-500/10 text-green-400 hover:bg-green-500/20">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button size="sm" className="bg-red-500/10 text-red-400 hover:bg-red-500/20">
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                {/* User Management Tab */}
                <TabsContent value="users" className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-12 h-11 bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <Card className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-secondary">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {recentUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-secondary/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                                    <span className="text-sm font-bold text-primary">{user.name.charAt(0)}</span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="secondary">{user.role}</Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                {user.joined}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={user.status === "active" ? "bg-green-400/10 text-green-400" : "bg-yellow-400/10 text-yellow-400"}>
                                  {user.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          Land Listings Over Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center bg-secondary/50 rounded-lg">
                          <p className="text-muted-foreground">Chart Visualization</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5 text-primary" />
                          User Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center bg-secondary/50 rounded-lg">
                          <p className="text-muted-foreground">Chart Visualization</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Fraud Alerts */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    Fraud Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fraudAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 rounded-lg bg-secondary/50 border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{alert.date}</span>
                      </div>
                      <p className="font-medium text-sm text-foreground">{alert.type}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.land || alert.user}
                      </p>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full neon-border">
                    View All Alerts
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="glass-card neon-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start neon-border hover:bg-primary/10">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Roles
                  </Button>
                  <Button variant="outline" className="w-full justify-start neon-border hover:bg-primary/10">
                    <MapPin className="h-4 w-4 mr-2" />
                    Bulk Approve Lands
                  </Button>
                  <Button variant="outline" className="w-full justify-start neon-border hover:bg-primary/10">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start neon-border hover:bg-primary/10">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Review Flagged Content
                  </Button>
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

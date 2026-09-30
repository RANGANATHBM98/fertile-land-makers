"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { API_BASE_URL, apiRequest, getAccessToken, mediaUrl } from "@/lib/api"
import Link from "next/link"

type PendingLand = {
  id: string
  title: string
  owner: { name: string; phone?: string } | null
  state: string
  district: string
  sizeAcres: number
  ownerListingFeePaid: boolean | null
  verificationStage: string | null
  createdAt: string
  images: string[]
}

type PendingDocument = { id: string; userId: string; landId: string | null; kind: string; createdAt: string }
type AdminUser = { id: string; name: string; email: string; role: string; joined: string; status: string; identityStatus: string }
type AdminSummary = { users: number; lands: number; pendingLands: number; pendingDocuments: number; capturedPaymentsInr: number }
type AdminTicket = { id: string; userId: string; category: string; subject: string; message: string; status: string; staffResponse: string }

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
  const [activeTab, setActiveTab] = useState("pending")
  const [pendingLands, setPendingLands] = useState<PendingLand[]>([])
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([])
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([])
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [dashboardError, setDashboardError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [documentPreview, setDocumentPreview] = useState<{ url: string; type: string } | null>(null)
  const [supportTickets, setSupportTickets] = useState<AdminTicket[]>([])
  const [supportReplies, setSupportReplies] = useState<Record<string, string>>({})
  const [verificationNotes, setVerificationNotes] = useState<Record<string, string>>({})

  const loadDashboard = async () => {
    setIsLoading(true)
    setDashboardError("")
    try {
      const [nextSummary, nextLands, nextDocuments, nextUsers, nextTickets] = await Promise.all([
        apiRequest<AdminSummary>("/admin/summary"),
        apiRequest<PendingLand[]>("/admin/lands/pending"),
        apiRequest<PendingDocument[]>("/admin/documents/pending"),
        apiRequest<AdminUser[]>("/admin/users"),
        apiRequest<AdminTicket[]>("/admin/support/tickets"),
      ])
      setSummary(nextSummary)
      setPendingLands(nextLands)
      setPendingDocuments(nextDocuments)
      setRecentUsers(nextUsers)
      setSupportTickets(nextTickets)
    } catch (cause) {
      setDashboardError(cause instanceof Error ? cause.message : "Unable to load admin data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void loadDashboard() }, [])

  const reviewDocument = async (documentId: string, decision: "approved" | "rejected") => {
    setDashboardError("")
    try {
      await apiRequest(`/admin/documents/${documentId}/review`, {
        method: "POST",
        body: JSON.stringify({ decision, note: "" }),
      })
      await loadDashboard()
    } catch (cause) {
      setDashboardError(cause instanceof Error ? cause.message : "Unable to review document")
    }
  }

  const reviewListing = async (landId: string, decision: "approved" | "rejected") => {
    setDashboardError("")
    try {
      await apiRequest(`/admin/lands/${landId}/review`, {
        method: "POST",
        body: JSON.stringify({ decision, note: "" }),
      })
      await loadDashboard()
    } catch (cause) {
      setDashboardError(cause instanceof Error ? cause.message : "Unable to review listing")
    }
  }

  const updateVerification = async (landId: string, stage: string) => {
    setDashboardError("")
    try {
      await apiRequest(`/admin/lands/${landId}/verification`, {
        method: "PUT",
        body: JSON.stringify({ stage, note: verificationNotes[landId] || "" }),
      })
      await loadDashboard()
    } catch (cause) {
      setDashboardError(cause instanceof Error ? cause.message : "Unable to update land verification")
    }
  }

  const replyToTicket = async (ticketId: string) => {
    const response = supportReplies[ticketId]?.trim()
    if (!response) return
    setDashboardError("")
    try {
      await apiRequest(`/admin/support/tickets/${ticketId}`, {
        method: "PUT",
        body: JSON.stringify({ response, status: "resolved" }),
      })
      setSupportReplies(current => ({ ...current, [ticketId]: "" }))
      await loadDashboard()
    } catch (cause) {
      setDashboardError(cause instanceof Error ? cause.message : "Unable to reply to support ticket")
    }
  }

  const previewDocument = async (documentId: string) => {
    setDashboardError("")
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_BASE_URL}/admin/documents/${documentId}/file`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error("Unable to open private proof document")
      const blob = await response.blob()
      setDocumentPreview({ url: URL.createObjectURL(blob), type: blob.type })
    } catch (cause) {
      setDashboardError(cause instanceof Error ? cause.message : "Unable to open document")
    }
  }

  const closeDocumentPreview = () => {
    if (documentPreview) URL.revokeObjectURL(documentPreview.url)
    setDocumentPreview(null)
  }

  const stats = [
    { label: "Total Users", value: summary?.users ?? 0, icon: Users, color: "text-blue-400", bgColor: "bg-blue-400/10" },
    { label: "Total Lands", value: summary?.lands ?? 0, icon: MapPin, color: "text-green-400", bgColor: "bg-green-400/10" },
    { label: "Pending Reviews", value: (summary?.pendingLands ?? 0) + (summary?.pendingDocuments ?? 0), icon: Activity, color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
    { label: "Unlock Revenue", value: `₹${(summary?.capturedPaymentsInr ?? 0).toLocaleString("en-IN")}`, icon: DollarSign, color: "text-primary", bgColor: "bg-primary/10" },
  ]

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
              <Button variant="outline" disabled title="Report export is not configured" className="neon-border">
                <Download className="h-5 w-5 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" onClick={loadDashboard} disabled={isLoading} className="neon-border">
                <RefreshCw className="h-5 w-5 mr-2" />
                {isLoading ? "Refreshing..." : "Refresh"}
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
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="glass-card p-1">
                  <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Pending Approvals
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Proof Documents
                  </TabsTrigger>
                  <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    User Management
                  </TabsTrigger>
                  <TabsTrigger value="support" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Support Inbox
                  </TabsTrigger>
                </TabsList>

                {dashboardError && <p role="alert" className="text-sm text-red-500">{dashboardError}</p>}

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

                  {pendingLands.filter(land => `${land.title} ${land.district} ${land.state}`.toLowerCase().includes(searchQuery.toLowerCase())).map((land, index) => (
                    <motion.div
                      key={land.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-card hover:border-primary/30 transition-all">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden bg-secondary">
                              {land.images[0] && <img src={mediaUrl(land.images[0])} alt={land.title} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-foreground">{land.title}</h3>
                                  <p className="text-sm text-muted-foreground">{land.owner?.name ?? "Owner"}</p>
                                  {land.owner?.phone && <a href={`tel:${land.owner.phone}`} className="text-sm text-primary underline">Call owner: {land.owner.phone}</a>}
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-4 w-4" />
                                    {land.district}, {land.state} • {land.sizeAcres} acres
                                  </p>
                                </div>
                                <Badge className="bg-yellow-400/10 text-yellow-400">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              </div>
                              
                              <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                  Submitted: {new Date(land.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex gap-2">
                                  <Link href={`/land/${land.id}`} target="_blank"><Button size="sm" variant="outline" className="neon-border hover:bg-primary/10"><Eye className="h-4 w-4 mr-1" />Review</Button></Link>
                                  <Button disabled={!land.ownerListingFeePaid || land.verificationStage !== "field_verified"} onClick={() => reviewListing(land.id, "approved")} size="sm" className="bg-green-500/10 text-green-400 hover:bg-green-500/20">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button onClick={() => reviewListing(land.id, "rejected")} size="sm" className="bg-red-500/10 text-red-400 hover:bg-red-500/20">
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-4 space-y-3 border-t border-border pt-4">
                                <p className="text-sm">Verification stage: <span className="font-medium capitalize">{(land.verificationStage || "documents_pending").replaceAll("_", " ")}</span></p>
                                <p className="text-sm text-muted-foreground">{land.ownerListingFeePaid ? "Owner listing fee paid" : "Waiting for owner to pay ₹50 per acre after document approval"}</p>
                                <Input aria-label="Verification note" placeholder="Callback or site-visit notes" value={verificationNotes[land.id] || ""} onChange={event => setVerificationNotes(current => ({ ...current, [land.id]: event.target.value }))} />
                                {land.verificationStage === "callback_required" && <Button size="sm" variant="outline" onClick={() => updateVerification(land.id, "callback_completed")}>Mark callback complete</Button>}
                                {land.verificationStage === "callback_completed" && <Button size="sm" variant="outline" onClick={() => updateVerification(land.id, "field_visit_scheduled")}>Schedule field visit</Button>}
                                {land.verificationStage === "field_visit_scheduled" && <Button size="sm" variant="outline" onClick={() => updateVerification(land.id, "field_verified")}>Mark field verified</Button>}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                <TabsContent value="support" className="space-y-4">
                  {supportTickets.length === 0 && <p className="py-10 text-center text-muted-foreground">No support tickets are open.</p>}
                  {supportTickets.map(ticket => <Card key={ticket.id} className="glass-card"><CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{ticket.subject}</h3><p className="text-xs capitalize text-muted-foreground">{ticket.category} · {ticket.status.replaceAll("_", " ")} · {ticket.userId}</p></div><Badge variant="secondary">{ticket.status.replaceAll("_", " ")}</Badge></div>
                    <p className="whitespace-pre-wrap text-sm">{ticket.message}</p>
                    {ticket.staffResponse && <p className="rounded-md bg-secondary p-3 text-sm">Previous response: {ticket.staffResponse}</p>}
                    <Textarea value={supportReplies[ticket.id] || ""} onChange={event => setSupportReplies(current => ({ ...current, [ticket.id]: event.target.value }))} maxLength={5000} placeholder="Write a customer response" aria-label={`Reply to ${ticket.subject}`} />
                    <Button size="sm" disabled={!supportReplies[ticket.id]?.trim()} onClick={() => replyToTicket(ticket.id)}>Send reply and resolve</Button>
                  </CardContent></Card>)}
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  {pendingDocuments.length === 0 && <p className="py-10 text-center text-muted-foreground">No proof documents are awaiting review.</p>}
                  {pendingDocuments.map(document => {
                    const account = recentUsers.find(user => user.id === document.userId)
                    return <Card key={document.id} className="glass-card"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div><h3 className="font-semibold">{document.kind === "identity_proof" ? "Farmer identity proof" : "Land ownership proof"}</h3><p className="text-sm text-muted-foreground">{account?.name ?? document.userId}{account?.email ? ` · ${account.email}` : ""}</p><p className="text-xs text-muted-foreground">{document.landId ? `Land ${document.landId}` : "Account identity check"}</p></div>
                      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => previewDocument(document.id)}>View private file</Button><Button onClick={() => reviewDocument(document.id, "approved")} className="bg-green-500/10 text-green-400">Approve</Button><Button variant="destructive" onClick={() => reviewDocument(document.id, "rejected")}>Reject</Button></div>
                    </CardContent></Card>
                  })}
                </TabsContent>

                {/* User Management Tab */}
                <TabsContent value="users" className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Identity review</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {recentUsers.filter(user => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
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
                                {new Date(user.joined).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={user.status === "active" ? "bg-green-400/10 text-green-400" : "bg-yellow-400/10 text-yellow-400"}>
                                  {user.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={user.identityStatus === "approved" ? "bg-green-400/10 text-green-400" : user.identityStatus === "rejected" ? "bg-red-400/10 text-red-400" : "bg-yellow-400/10 text-yellow-400"}>{user.identityStatus}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </TabsContent>

              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Review Queue */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Review Queue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" onClick={() => setActiveTab("documents")} className="w-full justify-between"><span>Proof documents</span><Badge>{pendingDocuments.length}</Badge></Button>
                  <Button variant="outline" onClick={() => setActiveTab("pending")} className="w-full justify-between"><span>Land listings</span><Badge>{pendingLands.length}</Badge></Button>
                  <Button variant="outline" onClick={() => setActiveTab("users")} className="w-full justify-between"><span>Registered accounts</span><Badge>{recentUsers.length}</Badge></Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(documentPreview)} onOpenChange={(open) => { if (!open) closeDocumentPreview() }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Private verification document</DialogTitle></DialogHeader>
          {documentPreview?.type === "application/pdf"
            ? <iframe title="Private verification document" src={documentPreview.url} className="h-[70vh] w-full rounded-md" />
            : documentPreview && <img src={documentPreview.url} alt="Private verification document" className="max-h-[70vh] w-full object-contain" />}
        </DialogContent>
      </Dialog>
      <Footer />
    </main>
  )
}

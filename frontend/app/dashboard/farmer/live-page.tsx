"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Droplets, Leaf, MapPin, Phone, Ruler, ShieldCheck } from "lucide-react"
import { apiRequest, mediaUrl } from "@/lib/api"

type ApiLand = {
  id: string
  title: string
  district: string
  state: string
  sizeAcres: number
  annualRentInr: number
  soilType: string
  waterSources: string[]
  waterLevel: string
  crops: string[]
  images: string[]
}

type FarmerContact = {
  id: string
  landId: string
  landTitle: string
  unlockedAt: string
  ownerName: string | null
  ownerId: string | null
  ownerPhone: string | null
}

type FarmerProfile = { identity_status: string }

export default function LiveFarmerDashboard() {
  const [lands, setLands] = useState<ApiLand[]>([])
  const [contacts, setContacts] = useState<FarmerContact[]>([])
  const [identityStatus, setIdentityStatus] = useState("pending")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiRequest<{ items: ApiLand[] }>("/lands?limit=12"),
      apiRequest<FarmerContact[]>("/users/me/contact-unlocks"),
      apiRequest<FarmerProfile>("/users/me"),
    ]).then(([listingResult, unlockedContacts, profile]) => {
      setLands(listingResult.items)
      setContacts(unlockedContacts)
      setIdentityStatus(profile.identity_status)
    }).catch(cause => setError(cause instanceof Error ? cause.message : "Unable to load your farmer dashboard"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold"><span className="text-gradient">Farmer</span> Dashboard</h1>
            <p className="text-muted-foreground">Approved farmland and your unlocked owner contacts</p>
          </div>
          <Link href="/explore"><Button>Explore all lands</Button></Link>
        </header>

        {error && <div role="alert" className="mb-8 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">{error} {error.toLowerCase().includes("sign in") || error.toLowerCase().includes("token") ? <Link href="/login" className="underline">Sign in</Link> : null}</div>}

        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="glass-card"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Approved lands</p><p className="mt-1 text-2xl font-semibold">{lands.length}</p></div><MapPin className="h-6 w-6 text-primary" /></CardContent></Card>
          <Card className="glass-card"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Unlocked contacts</p><p className="mt-1 text-2xl font-semibold">{contacts.length}</p></div><Phone className="h-6 w-6 text-primary" /></CardContent></Card>
          <Card className="glass-card"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Identity review</p><p className="mt-1 text-lg font-semibold capitalize">{identityStatus}</p></div>{identityStatus === "approved" ? <CheckCircle className="h-6 w-6 text-green-500" /> : <ShieldCheck className="h-6 w-6 text-primary" />}</CardContent></Card>
        </section>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <section>
            <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">Recently approved farmland</h2>{loading && <span className="text-sm text-muted-foreground">Loading...</span>}</div>
            {lands.length === 0 && !loading && !error && <p className="py-12 text-center text-muted-foreground">No approved listings are available right now.</p>}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {lands.map(land => <Card key={land.id} className="overflow-hidden glass-card">
                <div className="h-44 bg-secondary">{land.images[0] && <img src={mediaUrl(land.images[0])} alt={land.title} className="h-full w-full object-cover" />}</div>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{land.title}</h3><p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{land.district}, {land.state}</p></div><Badge><ShieldCheck className="mr-1 h-3 w-3" />Verified</Badge></div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1"><Ruler className="h-4 w-4" />{land.sizeAcres} acres</span><span className="inline-flex items-center gap-1"><Leaf className="h-4 w-4" />{land.soilType}</span><span className="inline-flex items-center gap-1"><Droplets className="h-4 w-4" />{land.waterLevel || land.waterSources.join(", ")}</span></div>
                  <div className="flex flex-wrap gap-1.5">{land.crops.slice(0, 4).map(crop => <Badge key={crop} variant="secondary">{crop}</Badge>)}</div>
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-4"><span className="font-semibold text-primary">₹{land.annualRentInr.toLocaleString("en-IN")}/year</span><Link href={`/land/${land.id}`}><Button size="sm" variant="outline">View land</Button></Link></div>
                </CardContent>
              </Card>)}
            </div>
          </section>

          <aside>
            <h2 className="mb-5 text-xl font-semibold">Unlocked owner contacts</h2>
            {contacts.length === 0 && !loading && <p className="py-8 text-sm text-muted-foreground">Contacts you unlock will appear here.</p>}
            <div className="space-y-3">{contacts.map(contact => <Card key={contact.id} className="glass-card"><CardContent className="space-y-2 p-4"><p className="font-medium">{contact.landTitle}</p><p className="text-sm text-muted-foreground">{contact.ownerName}</p>{contact.ownerPhone && <a href={`tel:${contact.ownerPhone}`} className="inline-flex items-center gap-2 text-sm text-primary"><Phone className="h-4 w-4" />{contact.ownerPhone}</a>}<p className="text-xs text-muted-foreground">Unlocked {new Date(contact.unlockedAt).toLocaleDateString()}</p>{contact.ownerId && <Link href={`/messages?landId=${contact.landId}&userId=${contact.ownerId}`}><Button size="sm" variant="outline">Message owner</Button></Link>}</CardContent></Card>)}</div>
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  )
}

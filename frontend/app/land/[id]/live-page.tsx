"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ChevronLeft, ChevronRight, Droplets, Leaf, MapPin, Phone, Ruler, Share2, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { apiRequest, mediaUrl } from "@/lib/api"

type LandDetails = {
  id: string
  title: string
  description: string
  state: string
  district: string
  address: string | null
  latitude: number | null
  longitude: number | null
  sizeAcres: number
  soilType: string
  waterSources: string[]
  crops: string[]
  fertilityLevel: string
  annualRentInr: number
  annualRentPerAcreInr: number
  leaseDurationMonths: number
  roadAccess: boolean
  roadType: string
  transportAccess: string
  waterLevel: string
  irrigationType: string
  electricityAvailable: boolean
  fertilizerPractices: string
  pesticideHistory: string
  soilTestSummary: string
  drainageNotes: string
  images: string[]
  contactUnlocked: boolean
  owner: { id: string; name: string; phone: string } | null
}

export default function LiveLandDetailPage() {
  const params = useParams<{ id: string }>()
  const [land, setLand] = useState<LandDetails | null>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    apiRequest<LandDetails>(`/lands/${params.id}`)
      .then(setLand)
      .catch(cause => setLoadError(cause instanceof Error ? cause.message : "Unable to load this listing"))
  }, [params.id])

  const shareListing = async () => {
    if (!land) return
    if (navigator.share) {
      await navigator.share({ title: land.title, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  const imageUrl = land?.images[currentImage] ? mediaUrl(land.images[currentImage]) : ""
  const mapBox = land?.latitude != null && land.longitude != null
    ? `${land.longitude - 0.01},${land.latitude - 0.01},${land.longitude + 0.01},${land.latitude + 0.01}`
    : null

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/explore">
            <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />Back to Explore
            </Button>
          </Link>

          {loadError && <p role="alert" className="py-16 text-center text-red-500">{loadError}</p>}
          {!land && !loadError && <p className="py-16 text-center text-muted-foreground">Loading land details...</p>}

          {land && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <div>
                  <div className="relative h-[340px] overflow-hidden rounded-xl bg-secondary md:h-[500px]">
                    {imageUrl ? <img src={imageUrl} alt={land.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-muted-foreground">No land photos provided</div>}
                    {land.images.length > 1 && <>
                      <button aria-label="Previous photo" onClick={() => setCurrentImage(index => (index - 1 + land.images.length) % land.images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"><ChevronLeft /></button>
                      <button aria-label="Next photo" onClick={() => setCurrentImage(index => (index + 1) % land.images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"><ChevronRight /></button>
                    </>}
                    <Badge className="absolute left-4 top-4 bg-primary text-primary-foreground"><ShieldCheck className="mr-1 h-3 w-3" />Verified listing</Badge>
                    <Button aria-label="Share listing" title="Share listing" size="icon" variant="secondary" onClick={shareListing} className="absolute right-4 top-4"><Share2 className="h-4 w-4" /></Button>
                  </div>
                  {land.images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto">
                    {land.images.map((image, index) => <button key={image} onClick={() => setCurrentImage(index)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-md ${index === currentImage ? "ring-2 ring-primary" : "opacity-60"}`}><img src={mediaUrl(image)} alt={`${land.title} photo ${index + 1}`} className="h-full w-full object-cover" /></button>)}
                  </div>}
                </div>

                <section>
                  <h1 className="mb-3 text-3xl font-bold">{land.title}</h1>
                  <div className="flex flex-wrap gap-5 text-muted-foreground">
                    <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{land.district}, {land.state}</span>
                    <span className="inline-flex items-center gap-2"><Ruler className="h-4 w-4 text-primary" />{land.sizeAcres} acres</span>
                  </div>
                  {land.address ? <p className="mt-2 text-sm text-muted-foreground">{land.address}</p> : <p className="mt-2 text-sm text-muted-foreground">Exact location is shared after contact verification and payment.</p>}
                </section>

                <section>
                  <h2 className="mb-3 text-xl font-semibold">About this land</h2>
                  <p className="whitespace-pre-wrap leading-7 text-muted-foreground">{land.description}</p>
                </section>

                <Card className="glass-card"><CardContent className="p-6">
                  <h2 className="mb-5 text-xl font-semibold">Land and access details</h2>
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                    <div><dt className="text-sm text-muted-foreground">Soil type</dt><dd className="mt-1 inline-flex items-center gap-2"><Leaf className="h-4 w-4 text-primary" />{land.soilType}</dd></div>
                    <div><dt className="text-sm text-muted-foreground">Water sources</dt><dd className="mt-1 inline-flex items-center gap-2"><Droplets className="h-4 w-4 text-sky-500" />{land.waterSources.join(", ")}</dd></div>
                    <div><dt className="text-sm text-muted-foreground">Water availability</dt><dd className="mt-1">{land.waterLevel || "Not provided"}</dd></div>
                    <div><dt className="text-sm text-muted-foreground">Fertility</dt><dd className="mt-1 capitalize">{land.fertilityLevel}</dd></div>
                    <div><dt className="text-sm text-muted-foreground">Road access</dt><dd className="mt-1">{land.roadAccess ? `Yes${land.roadType ? `, ${land.roadType}` : ""}` : "Not available"}</dd></div>
                    <div><dt className="text-sm text-muted-foreground">Transport / nearest road</dt><dd className="mt-1">{land.transportAccess || "Not provided"}</dd></div>
                    <div><dt className="text-sm text-muted-foreground">Minimum lease</dt><dd className="mt-1">{land.leaseDurationMonths} months</dd></div>
                    <div><dt className="text-sm text-muted-foreground">Irrigation method</dt><dd className="mt-1">{land.irrigationType || "Not provided"}</dd></div>
                    <div><dt className="text-sm text-muted-foreground">Electricity</dt><dd className="mt-1">{land.electricityAvailable ? "Available" : "Not listed"}</dd></div>
                    <div><dt className="text-sm text-muted-foreground">Fertilizers and amendments (owner-reported)</dt><dd className="mt-1 whitespace-pre-wrap">{land.fertilizerPractices || "Not provided"}</dd></div>
                    <div><dt className="text-sm text-muted-foreground">Pesticide history (owner-reported)</dt><dd className="mt-1 whitespace-pre-wrap">{land.pesticideHistory || "Not provided"}</dd></div>
                    <div><dt className="text-sm text-muted-foreground">Soil test summary</dt><dd className="mt-1 whitespace-pre-wrap">{land.soilTestSummary || "Not provided"}</dd></div>
                    <div><dt className="text-sm text-muted-foreground">Drainage and seasonal risks</dt><dd className="mt-1 whitespace-pre-wrap">{land.drainageNotes || "Not provided"}</dd></div>
                  </dl>
                </CardContent></Card>

                <section>
                  <h2 className="mb-3 text-xl font-semibold">Property map</h2>
                  {mapBox && land.latitude != null && land.longitude != null ? <div className="space-y-3">
                    <div className="aspect-[16/9] overflow-hidden rounded-lg border border-border bg-secondary">
                      <iframe title={`Map of ${land.title}`} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer" src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapBox}&layer=mapnik&marker=${land.latitude},${land.longitude}`} />
                    </div>
                    <a className="text-sm font-medium text-primary underline" href={`https://www.google.com/maps/search/?api=1&query=${land.latitude},${land.longitude}`} target="_blank" rel="noreferrer">Open exact pin in Google Maps</a>
                  </div> : <p className="rounded-md bg-secondary p-4 text-sm text-muted-foreground">The public map shows the district only. The owner’s exact pin is shared after contact verification and payment.</p>}
                </section>

                <section>
                  <h2 className="mb-3 text-xl font-semibold">Crops grown</h2>
                  <div className="flex flex-wrap gap-2">{land.crops.length ? land.crops.map(crop => <Badge key={crop} variant="secondary">{crop}</Badge>) : <span className="text-muted-foreground">Crop history not provided</span>}</div>
                </section>
              </div>

              <aside>
                <Card className="sticky top-24 glass-card"><CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Annual rent for {land.sizeAcres} acres</p>
                  <p className="text-3xl font-bold text-primary">₹{land.annualRentInr.toLocaleString("en-IN")}/year</p>
                  <p className="mb-6 text-sm text-muted-foreground">₹{land.annualRentPerAcreInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })} per acre/year</p>
                  {land.owner ? <div className="space-y-4 border-t border-border pt-5">
                    <h2 className="font-semibold">Owner contact</h2>
                    <p>{land.owner.name}</p>
                    <a href={`tel:${land.owner.phone}`} className="inline-flex items-center gap-2 text-primary"><Phone className="h-4 w-4" />{land.owner.phone}</a>
                    {land.address && <p className="text-sm text-muted-foreground">{land.address}</p>}
                    <Link href={`/messages?landId=${land.id}&userId=${land.owner.id}`}><Button variant="outline" className="w-full">Message owner</Button></Link>
                  </div> : <div className="space-y-4 border-t border-border pt-5">
                    <p className="text-sm text-muted-foreground">Verify your identity and pay ₹10-₹20 to reveal the owner&apos;s phone and exact land location.</p>
                    <Link href={`/contact-unlock?landId=${land.id}`}><Button className="w-full"><Phone className="mr-2 h-4 w-4" />Verify and unlock contact</Button></Link>
                  </div>}
                </CardContent></Card>
              </aside>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

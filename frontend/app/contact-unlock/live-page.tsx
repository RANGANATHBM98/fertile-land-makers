"use client"

import { ChangeEvent, useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, FileText, Lock, MapPin, Phone, ShieldCheck } from "lucide-react"
import { apiRequest } from "@/lib/api"
import { openRazorpayCheckout, RazorpayOrder, RazorpayPaymentResult } from "@/lib/razorpay"

type UserInfo = { identity_status: string }
type UserDocument = { kind: string; status: string }
type PaymentOrder = RazorpayOrder
type LandAccess = {
  id: string
  title: string
  address: string | null
  contactUnlocked: boolean
  owner: { id: string; name: string; phone: string } | null
}

export default function LiveContactUnlockPage() {
  const [landId, setLandId] = useState("")
  const [land, setLand] = useState<LandAccess | null>(null)
  const [identityStatus, setIdentityStatus] = useState("pending")
  const [hasIdentityProof, setHasIdentityProof] = useState(false)
  const [identityFile, setIdentityFile] = useState<File | null>(null)
  const [step, setStep] = useState(1)
  const [agreed, setAgreed] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState("")

  const refreshStatus = async (targetLandId: string) => {
    const [user, documents, listing] = await Promise.all([
      apiRequest<UserInfo>("/users/me"),
      apiRequest<UserDocument[]>("/users/me/documents"),
      apiRequest<LandAccess>(`/lands/${targetLandId}`),
    ])
    setIdentityStatus(user.identity_status)
    setHasIdentityProof(documents.some(document => document.kind === "identity_proof" && document.status === "pending"))
    setLand(listing)
    if (listing.contactUnlocked) setStep(4)
  }

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("landId") || ""
    setLandId(id)
    if (!id) {
      setError("Choose a land listing before requesting contact access.")
      return
    }
    refreshStatus(id).catch(cause => setError(cause instanceof Error ? cause.message : "Sign in to continue"))
  }, [])

  const submitIdentityProof = async () => {
    if (!identityFile || !landId) return
    if (/aadhaar|aadhar|uidai/i.test(identityFile.name)) {
      setError("Do not upload Aadhaar. Use another government photo ID or an approved KYC provider.")
      return
    }
    setError("")
    setIsBusy(true)
    const form = new FormData()
    form.append("kind", "identity_proof")
    form.append("attest_non_aadhaar", "true")
    form.append("file", identityFile)
    try {
      await apiRequest("/users/me/documents", { method: "POST", body: form })
      setHasIdentityProof(true)
      setIdentityFile(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit identity proof")
    } finally {
      setIsBusy(false)
    }
  }

  const checkVerification = async () => {
    if (!landId) return
    setError("")
    setIsBusy(true)
    try {
      await refreshStatus(landId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to refresh verification status")
    } finally {
      setIsBusy(false)
    }
  }

  const payAndUnlock = async () => {
    if (!landId || !agreed) return
    setError("")
    setIsBusy(true)
    try {
      const order = await apiRequest<PaymentOrder>(`/lands/${landId}/unlock-order`, {
        method: "POST",
        body: JSON.stringify({ consent: true }),
      })
      if (order.alreadyUnlocked) {
        await refreshStatus(landId)
        setIsBusy(false)
        return
      }
      await openRazorpayCheckout(order, "Land owner contact unlock", async (payment: RazorpayPaymentResult) => {
          try {
            await apiRequest("/payments/verify", { method: "POST", body: JSON.stringify(payment) })
            await refreshStatus(landId)
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Payment verification failed")
          } finally {
            setIsBusy(false)
          }
        },
        () => setIsBusy(false),
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start payment")
      setIsBusy(false)
    }
  }

  const handleIdentityFile = (event: ChangeEvent<HTMLInputElement>) => setIdentityFile(event.target.files?.[0] ?? null)
  const isUnlocked = Boolean(land?.contactUnlocked && land.owner)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-200px)] items-center px-4 pb-16 pt-24">
        <div className="mx-auto w-full max-w-lg">
          <header className="mb-8 text-center">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-4"><ShieldCheck className="h-10 w-10 text-primary" /></div>
            <h1 className="mb-2 text-3xl font-bold">{isUnlocked ? "Owner contact unlocked" : "Verify and unlock contact"}</h1>
            <p className="text-muted-foreground">{land?.title || "Land listing contact access"}</p>
          </header>

          {!isUnlocked && <div className="mb-7 flex justify-center gap-4">
            {["Identity", "Consent", "Payment"].map((label, index) => <div key={label} className={`rounded-full px-3 py-1 text-sm ${step === index + 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{index + 1}. {label}</div>)}
          </div>}

          <Card className="glass-card"><CardContent className="space-y-6 p-7">
            {error && <div role="alert" className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}{error.includes("Sign in") && <Link href="/login" className="underline">Sign in</Link>}</div>}

            {!isUnlocked && step === 1 && <section className="space-y-5">
              <div className="text-center"><FileText className="mx-auto mb-2 h-9 w-9 text-primary" /><h2 className="text-xl font-semibold">Identity review</h2><p className="text-sm text-muted-foreground">A reviewer checks your non-Aadhaar photo ID before contact details can be unlocked.</p></div>
              {identityStatus === "approved" ? <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-600"><CheckCircle className="mr-2 inline h-4 w-4" />Your identity review is approved.</div> : <>
                <div className="space-y-2"><Label htmlFor="identityProof">Non-Aadhaar photo ID</Label><Input id="identityProof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleIdentityFile} /><p className="text-xs text-muted-foreground">Do not upload Aadhaar cards, Aadhaar numbers, or unmasked Aadhaar documents.</p></div>
                {hasIdentityProof && <p className="text-sm text-amber-600">Your identity document is pending review. Refresh after the verification team reviews it.</p>}
                <div className="flex gap-3"><Button variant="outline" onClick={checkVerification} disabled={isBusy} className="flex-1">Check review status</Button><Button onClick={submitIdentityProof} disabled={isBusy || !identityFile} className="flex-1">{isBusy ? "Submitting..." : "Submit ID for review"}</Button></div>
              </>}
              {identityStatus === "approved" && <Button onClick={() => setStep(2)} className="w-full">Continue</Button>}
            </section>}

            {!isUnlocked && step === 2 && <section className="space-y-5">
              <div className="text-center"><h2 className="text-xl font-semibold">Contact sharing consent</h2><p className="text-sm text-muted-foreground">Your name and phone may be shared with the land owner when you unlock this listing.</p></div>
              <div className="rounded-md bg-secondary/60 p-4 text-sm text-muted-foreground">Use the owner&apos;s contact only for a genuine land-leasing inquiry. Do not redistribute their contact details.</div>
              <div className="flex items-start gap-3"><Checkbox id="contactConsent" checked={agreed} onCheckedChange={value => setAgreed(value === true)} /><Label htmlFor="contactConsent" className="cursor-pointer text-sm">I agree to share my account contact details with this land owner and to use the information for this inquiry.</Label></div>
              <div className="flex gap-3"><Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button><Button onClick={() => setStep(3)} disabled={!agreed} className="flex-1">Continue</Button></div>
            </section>}

            {!isUnlocked && step === 3 && <section className="space-y-5 text-center">
              <Lock className="mx-auto h-9 w-9 text-primary" /><h2 className="text-xl font-semibold">Pay to reveal owner details</h2>
              <p className="text-sm text-muted-foreground">A one-time ₹10-₹20 contact-access fee is charged for this listing. The exact amount appears in Razorpay checkout.</p>
              <Button variant="outline" onClick={() => setStep(2)} className="w-full">Back</Button>
              <Button onClick={payAndUnlock} disabled={isBusy} className="w-full">{isBusy ? "Opening secure checkout..." : "Continue to secure payment"}</Button>
            </section>}

            {isUnlocked && land && <section className="space-y-5">
              <div className="text-center"><CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500" /><h2 className="text-xl font-semibold">Payment verified</h2><p className="text-sm text-muted-foreground">The exact location and owner contact for this listing are now available.</p></div>
              <div className="space-y-4 rounded-md bg-secondary p-4">
                <p className="font-medium">{land.owner?.name}</p>
                {land.owner?.phone && <a href={`tel:${land.owner.phone}`} className="flex items-center gap-2 text-primary"><Phone className="h-4 w-4" />{land.owner.phone}</a>}
                {land.address && <p className="flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{land.address}</p>}
              </div>
              {land.owner && <Link href={`/messages?landId=${land.id}&userId=${land.owner.id}`}><Button className="w-full">Message owner</Button></Link>}
              <Link href={`/land/${land.id}`}><Button variant="outline" className="w-full">Return to land listing</Button></Link>
            </section>}
          </CardContent></Card>
        </div>
      </div>
      <Footer />
    </main>
  )
}

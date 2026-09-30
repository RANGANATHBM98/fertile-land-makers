"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Headset, Send } from "lucide-react"
import { apiRequest } from "@/lib/api"

type FAQ = { question: string; answer: string }
type Ticket = { id: string; category: string; subject: string; status: string; staffResponse: string; createdAt: string }
type AssistantAnswer = { answer: string; needsHumanSupport: boolean }

export default function HelpPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [needsHuman, setNeedsHuman] = useState(false)
  const [category, setCategory] = useState("other")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadTickets = async () => {
    try {
      setTickets(await apiRequest<Ticket[]>("/support/tickets"))
    } catch {
      setTickets([])
    }
  }

  useEffect(() => {
    apiRequest<FAQ[]>("/support/faqs").then(setFaqs).catch(() => setFaqs([]))
    void loadTickets()
  }, [])

  const askAssistant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!question.trim()) return
    setError("")
    try {
      const result = await apiRequest<AssistantAnswer>("/support/assistant", {
        method: "POST",
        body: JSON.stringify({ question: question.trim() }),
      })
      setAnswer(result.answer)
      setNeedsHuman(result.needsHumanSupport)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to get an answer")
    }
  }

  const submitTicket = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError("")
    try {
      await apiRequest("/support/tickets", {
        method: "POST",
        body: JSON.stringify({ category, subject: subject.trim(), message: message.trim() }),
      })
      setSubject("")
      setMessage("")
      await loadTickets()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit your request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center gap-3">
          <Headset className="h-7 w-7 text-primary" />
          <div><h1 className="text-3xl font-bold">Help Center</h1><p className="text-sm text-muted-foreground">Answers, ticket follow-up, and human support</p></div>
        </header>
        {error && <p role="alert" className="mb-5 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error} {error.toLowerCase().includes("sign in") && <Link href="/login" className="underline">Sign in</Link>}</p>}
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-5">
            <Card className="glass-card"><CardContent className="space-y-4 p-5">
              <h2 className="text-lg font-semibold">Ask the assistant</h2>
              <form onSubmit={askAssistant} className="flex gap-2">
                <Input value={question} onChange={event => setQuestion(event.target.value)} maxLength={2000} placeholder="Ask about rent, verification, or contact access" aria-label="Question" />
                <Button type="submit" size="icon" aria-label="Ask question" title="Ask question"><Send className="h-4 w-4" /></Button>
              </form>
              {answer && <div className="rounded-md bg-secondary p-4 text-sm" aria-live="polite"><p>{answer}</p>{needsHuman && <a href="#support-ticket" className="mt-2 inline-block font-medium text-primary underline">Create a support ticket</a>}</div>}
            </CardContent></Card>
            <Card className="glass-card"><CardContent className="space-y-4 p-5">
              <h2 className="text-lg font-semibold">Common questions</h2>
              <div className="divide-y divide-border">{faqs.map(faq => <details key={faq.question} className="py-3"><summary className="cursor-pointer font-medium">{faq.question}</summary><p className="pt-2 text-sm text-muted-foreground">{faq.answer}</p></details>)}</div>
            </CardContent></Card>
          </section>
          <section className="space-y-5">
            <Card id="support-ticket" className="glass-card"><CardContent className="space-y-4 p-5">
              <h2 className="text-lg font-semibold">Contact support</h2>
              <form onSubmit={submitTicket} className="space-y-3">
                <label className="block space-y-1 text-sm"><span>Category</span><select value={category} onChange={event => setCategory(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3"><option value="account">Account</option><option value="listing">Land listing</option><option value="payment">Payment</option><option value="verification">Verification</option><option value="safety">Safety report</option><option value="other">Other</option></select></label>
                <Input value={subject} onChange={event => setSubject(event.target.value)} minLength={5} maxLength={160} placeholder="Subject" aria-label="Subject" required />
                <Textarea value={message} onChange={event => setMessage(event.target.value)} minLength={10} maxLength={5000} placeholder="Describe the issue. Do not include Aadhaar or bank details." aria-label="Support request" required />
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit support request"}</Button>
              </form>
            </CardContent></Card>
            <Card className="glass-card"><CardContent className="space-y-3 p-5">
              <h2 className="text-lg font-semibold">Your requests</h2>
              {tickets.length === 0 ? <p className="text-sm text-muted-foreground">Sign in to submit and track support requests.</p> : tickets.map(ticket => <article key={ticket.id} className="border-t border-border pt-3"><div className="flex items-center justify-between gap-3"><p className="font-medium">{ticket.subject}</p><span className="text-xs capitalize text-muted-foreground">{ticket.status.replace("_", " ")}</span></div><p className="mt-1 text-xs text-muted-foreground">{ticket.category} · {new Date(ticket.createdAt).toLocaleDateString()}</p>{ticket.staffResponse && <p className="mt-2 rounded bg-secondary p-3 text-sm">{ticket.staffResponse}</p>}</article>)}
            </CardContent></Card>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}

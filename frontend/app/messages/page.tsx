"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send } from "lucide-react"
import { apiRequest } from "@/lib/api"

type ThreadMessage = { id: string; senderId: string; body: string; createdAt: string }
type LandSummary = { id: string; title: string }
type Profile = { id: string; full_name: string }

export default function MessagesPage() {
  const [landId, setLandId] = useState("")
  const [counterpartyId, setCounterpartyId] = useState("")
  const [land, setLand] = useState<LandSummary | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setLandId(params.get("landId") || "")
    setCounterpartyId(params.get("userId") || "")
  }, [])

  useEffect(() => {
    if (!landId || !counterpartyId) return
    let active = true
    const refresh = async () => {
      try {
        const [thread, listing, currentUser] = await Promise.all([
          apiRequest<ThreadMessage[]>(`/lands/${landId}/messages?with_user_id=${encodeURIComponent(counterpartyId)}`),
          apiRequest<LandSummary>(`/lands/${landId}`),
          apiRequest<Profile>("/users/me"),
        ])
        if (active) {
          setMessages(thread)
          setLand(listing)
          setProfile(currentUser)
          setError("")
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load this conversation")
      }
    }
    void refresh()
    const interval = window.setInterval(() => void refresh(), 5000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [landId, counterpartyId])

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body || isSending) return
    setIsSending(true)
    setError("")
    try {
      const sent = await apiRequest<ThreadMessage>(
        `/lands/${landId}/messages?with_user_id=${encodeURIComponent(counterpartyId)}`,
        { method: "POST", body: JSON.stringify({ body }) },
      )
      setMessages(current => [...current, sent])
      setDraft("")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send your message")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-24 sm:px-6">
        <header className="mb-6 flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold">Land conversation</h1>
            <p className="text-sm text-muted-foreground">{land?.title || "Paid contact conversation"}</p>
          </div>
        </header>
        {error && <p role="alert" className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error} {error.includes("Sign in") && <Link href="/login" className="underline">Sign in</Link>}</p>}
        {!landId || !counterpartyId ? <p className="py-12 text-center text-muted-foreground">Choose a paid contact from your dashboard to open a conversation.</p> : (
          <Card className="glass-card">
            <CardContent className="flex min-h-[60vh] flex-col gap-4 p-4 sm:p-6">
              <div className="flex-1 space-y-3 overflow-y-auto" aria-live="polite">
                {messages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Start the conversation with a question about the land or lease.</p>}
                {messages.map(message => {
                  const mine = message.senderId === profile?.id
                  return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-lg px-4 py-3 ${mine ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                      <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
                      <time className={`mt-1 block text-right text-[11px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`} dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString()}</time>
                    </div>
                  </div>
                })}
              </div>
              <form onSubmit={sendMessage} className="flex items-end gap-3 border-t border-border pt-4">
                <Textarea value={draft} onChange={event => setDraft(event.target.value)} maxLength={4000} placeholder="Write a message" aria-label="Message" className="min-h-12 flex-1 resize-y" />
                <Button type="submit" size="icon" aria-label="Send message" title="Send message" disabled={!draft.trim() || isSending}><Send className="h-4 w-4" /></Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </main>
  )
}

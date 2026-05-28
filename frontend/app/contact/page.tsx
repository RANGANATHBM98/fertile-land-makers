"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare,
  Clock,
  Send,
  Headphones
} from "lucide-react"

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    details: "support@fertilelandmakers.com",
    subtitle: "We'll respond within 24 hours"
  },
  {
    icon: Phone,
    title: "Call Us",
    details: "+91 1800-123-4567",
    subtitle: "Mon-Sat, 9 AM - 6 PM IST"
  },
  {
    icon: MapPin,
    title: "Visit Us",
    details: "Bangalore, Karnataka",
    subtitle: "India"
  },
]

const faqs = [
  {
    question: "How do I list my land?",
    answer: "Simply create an account, go to your dashboard, and click 'List New Land'. Fill in the details about your property and submit for verification."
  },
  {
    question: "Is there a fee for listing?",
    answer: "Basic listing is free. We charge a small commission only when a successful lease agreement is made."
  },
  {
    question: "How are farmers verified?",
    answer: "We verify farmers through ID verification, phone verification, and optional background checks for premium listings."
  },
  {
    question: "What if there's a dispute?",
    answer: "We have a dedicated support team to help resolve disputes. All agreements are documented for your protection."
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get In <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have questions about leasing land or listing your property? 
              We&apos;re here to help you every step of the way.
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            {contactInfo.map((info, index) => (
              <Card key={info.title} className="glass-card hover:border-primary/30 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
                    <info.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{info.title}</h3>
                  <p className="text-primary font-medium mb-1">{info.details}</p>
                  <p className="text-sm text-muted-foreground">{info.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card neon-border">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-semibold text-foreground">Send us a Message</h2>
                  </div>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          className="mt-2 h-12 bg-secondary border-border"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          className="mt-2 h-12 bg-secondary border-border"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="mt-2 h-12 bg-secondary border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select>
                        <SelectTrigger className="mt-2 h-12 bg-secondary border-border">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="listing">Land Listing Help</SelectItem>
                          <SelectItem value="lease">Lease Questions</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="How can we help you?"
                        className="mt-2 min-h-[150px] bg-secondary border-border"
                      />
                    </div>

                    <Button className="w-full h-12 bg-primary text-primary-foreground">
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Headphones className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={faq.question}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Card className="glass-card hover:border-primary/30 transition-all">
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-2 text-foreground">{faq.question}</h3>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Support Hours */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Support Hours</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monday - Friday</span>
                      <span className="font-medium text-foreground">9:00 AM - 8:00 PM IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saturday</span>
                      <span className="font-medium text-foreground">9:00 AM - 6:00 PM IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunday</span>
                      <span className="font-medium text-foreground">Closed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

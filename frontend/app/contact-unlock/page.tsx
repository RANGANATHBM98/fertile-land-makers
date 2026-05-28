"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ShieldCheck,
  Phone,
  Mail,
  Lock,
  CheckCircle,
  ArrowRight,
  User,
  FileText,
  AlertCircle
} from "lucide-react"

export default function ContactUnlockPage() {
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [agreed, setAgreed] = useState(false)
  const [verified, setVerified] = useState(false)

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleVerify = () => {
    // Simulate verification
    setTimeout(() => {
      setVerified(true)
      setStep(4)
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 min-h-[calc(100vh-200px)] flex items-center">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
              <ShieldCheck className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {verified ? "Contact Unlocked!" : "Verify Your Identity"}
            </h1>
            <p className="text-muted-foreground">
              {verified 
                ? "You can now contact the land owner" 
                : "Complete verification to access owner contact details"
              }
            </p>
          </motion.div>

          {/* Progress Steps */}
          {!verified && (
            <div className="flex items-center justify-center gap-4 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-12 h-1 mx-2 rounded ${
                      step > s ? "bg-primary" : "bg-secondary"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <Card className="glass-card neon-border">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Identity Verification */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <User className="h-10 w-10 text-primary mx-auto mb-2" />
                      <h2 className="text-xl font-semibold">Personal Information</h2>
                      <p className="text-sm text-muted-foreground">Enter your details to proceed</p>
                    </div>

                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        className="mt-2 h-12 bg-secondary border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          className="h-12 pl-12 bg-secondary border-border"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="h-12 pl-12 bg-secondary border-border"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={() => setStep(2)}
                      className="w-full h-12 bg-primary text-primary-foreground"
                    >
                      Continue
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Consent */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <FileText className="h-10 w-10 text-primary mx-auto mb-2" />
                      <h2 className="text-xl font-semibold">Terms & Consent</h2>
                      <p className="text-sm text-muted-foreground">Please review and agree to proceed</p>
                    </div>

                    <div className="p-4 rounded-lg bg-secondary/50 space-y-4 text-sm text-muted-foreground max-h-48 overflow-y-auto">
                      <p>By proceeding, you agree to the following:</p>
                      <ul className="list-disc pl-4 space-y-2">
                        <li>You will use the contact information solely for legitimate farming inquiry purposes.</li>
                        <li>You will not share the owner&apos;s contact details with third parties.</li>
                        <li>You understand that all communications may be monitored for security purposes.</li>
                        <li>You agree to our Terms of Service and Privacy Policy.</li>
                        <li>Any misuse of contact information may result in account termination.</li>
                      </ul>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="consent"
                        checked={agreed}
                        onCheckedChange={(checked) => setAgreed(checked as boolean)}
                        className="mt-1"
                      />
                      <Label htmlFor="consent" className="text-sm text-muted-foreground cursor-pointer">
                        I have read and agree to the terms and conditions. I understand that my information will be shared with the land owner.
                      </Label>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 h-12 neon-border"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={() => setStep(3)}
                        disabled={!agreed}
                        className="flex-1 h-12 bg-primary text-primary-foreground"
                      >
                        Continue
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: OTP Verification */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <Lock className="h-10 w-10 text-primary mx-auto mb-2" />
                      <h2 className="text-xl font-semibold">Verify OTP</h2>
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to your phone
                      </p>
                    </div>

                    <div className="flex justify-center gap-3">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          className="w-12 h-14 text-center text-xl font-bold bg-secondary border-border focus:border-primary"
                        />
                      ))}
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Didn&apos;t receive the code?{" "}
                        <button className="text-primary hover:underline">Resend OTP</button>
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex-1 h-12 neon-border"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleVerify}
                        disabled={otp.some(d => !d)}
                        className="flex-1 h-12 bg-primary text-primary-foreground"
                      >
                        Verify
                        <CheckCircle className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 4 && verified && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="inline-flex p-6 rounded-full bg-green-400/10"
                    >
                      <CheckCircle className="h-16 w-16 text-green-400" />
                    </motion.div>

                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-foreground">Verification Successful!</h2>
                      <p className="text-muted-foreground">You can now contact the land owner</p>
                    </div>

                    <Card className="glass-card">
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4 text-foreground">Owner Contact Details</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                            <User className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Name</p>
                              <p className="font-medium text-foreground">Rajesh Gowda</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                            <Phone className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="font-medium text-foreground">+91 98765 43210</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                            <Mail className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-medium text-foreground">rajesh.gowda@email.com</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                        <p className="text-sm text-left text-muted-foreground">
                          Please be respectful when contacting the owner. Mention that you found their listing on FertileLandMakers.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" className="flex-1 h-12 neon-border">
                        <Phone className="h-5 w-5 mr-2" />
                        Call Now
                      </Button>
                      <Button className="flex-1 h-12 bg-primary text-primary-foreground">
                        <Mail className="h-5 w-5 mr-2" />
                        Send Email
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  )
}

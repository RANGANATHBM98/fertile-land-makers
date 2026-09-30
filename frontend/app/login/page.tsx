"use client"

import { FormEvent, useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Leaf,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Chrome
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiRequest, storeAccessToken } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [activeRole, setActiveRole] = useState<"farmer" | "owner">("farmer")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const finishAuthentication = (result: { accessToken: string; user: { role: string } }) => {
    storeAccessToken(result.accessToken)
    router.push(result.user.role === "owner" ? "/dashboard/owner" : "/dashboard/farmer")
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const result = await apiRequest<{ accessToken: string; user: { role: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      finishAuthentication(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const result = await apiRequest<{ accessToken: string; user: { role: string } }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: `${firstName} ${lastName}`.trim(),
          email: registerEmail,
          phone,
          password: registerPassword,
          role: activeRole,
        }),
      })
      finishAuthentication(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create account")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 min-h-[calc(100vh-200px)] flex items-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Leaf className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold text-gradient">FertileLandMakers</span>
            </Link>
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue your farming journey</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card neon-border">
              <CardContent className="p-8">
                {error && <p role="alert" className="mb-4 text-sm text-red-500">{error}</p>}
                <Tabs defaultValue="login" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* Login Tab */}
                  <TabsContent value="login" className="space-y-6">
                    <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={loginEmail}
                          onChange={(event) => setLoginEmail(event.target.value)}
                          className="h-12 pl-12 bg-secondary border-border"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative mt-2">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          required
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                          className="h-12 pl-12 pr-12 bg-secondary border-border"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full h-12 bg-primary text-primary-foreground">
                      {submitting ? "Signing in..." : "Sign In"}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    </form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <Button type="button" variant="outline" disabled title="Google sign-in is not configured" className="w-full h-12 neon-border">
                      <Chrome className="h-5 w-5 mr-2" />
                      Continue with Google
                    </Button>
                  </TabsContent>

                  {/* Register Tab */}
                  <TabsContent value="register" className="space-y-6">
                    <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative mt-2">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="John"
                            required
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            className="h-12 pl-12 bg-secondary border-border"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                            required
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                          className="h-12 mt-2 bg-secondary border-border"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="registerEmail">Email Address</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="registerEmail"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={registerEmail}
                          onChange={(event) => setRegisterEmail(event.target.value)}
                          className="h-12 pl-12 bg-secondary border-border"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          required
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          className="h-12 pl-12 bg-secondary border-border"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="registerPassword">Password</Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="registerPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                            minLength={10}
                            required
                            value={registerPassword}
                            onChange={(event) => setRegisterPassword(event.target.value)}
                          className="h-12 pl-12 pr-12 bg-secondary border-border"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label>I am a</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <Button type="button" variant={activeRole === "farmer" ? "default" : "outline"} onClick={() => setActiveRole("farmer")} className="h-12 neon-border hover:bg-primary/10">
                          <Leaf className="h-5 w-5 mr-2" />
                          Farmer
                        </Button>
                        <Button type="button" variant={activeRole === "owner" ? "default" : "outline"} onClick={() => setActiveRole("owner")} className="h-12 neon-border hover:bg-primary/10">
                          <User className="h-5 w-5 mr-2" />
                          Land Owner
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full h-12 bg-primary text-primary-foreground">
                      {submitting ? "Creating account..." : "Create Account"}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  )
}

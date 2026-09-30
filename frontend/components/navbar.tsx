"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, 
  X, 
  Leaf, 
  Home, 
  Search, 
  Info, 
  Mail, 
  LifeBuoy,
  LogIn, 
  LayoutDashboard,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/help", label: "Help", icon: LifeBuoy },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [dashboardOpen, setDashboardOpen] = useState(false)

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Leaf className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
            <span className="text-xl font-bold text-gradient">FertileLandMakers</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
            
            <div className="relative">
              <Button 
                onClick={() => setDashboardOpen(!dashboardOpen)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${dashboardOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              <AnimatePresence>
                {dashboardOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 glass-card rounded-xl overflow-hidden"
                  >
                    <Link 
                      href="/dashboard/owner" 
                      className="block px-4 py-3 text-sm hover:bg-primary/10 transition-colors"
                      onClick={() => setDashboardOpen(false)}
                    >
                      Land Owner Dashboard
                    </Link>
                    <Link 
                      href="/dashboard/farmer" 
                      className="block px-4 py-3 text-sm hover:bg-primary/10 transition-colors"
                      onClick={() => setDashboardOpen(false)}
                    >
                      Farmer Dashboard
                    </Link>
                    <Link 
                      href="/admin" 
                      className="block px-4 py-3 text-sm hover:bg-primary/10 transition-colors border-t border-border"
                      onClick={() => setDashboardOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-card border-t border-border"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border space-y-2">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/dashboard/owner" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    Owner Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/farmer" onClick={() => setIsOpen(false)}>
                  <Button className="w-full justify-start bg-primary text-primary-foreground">
                    Farmer Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

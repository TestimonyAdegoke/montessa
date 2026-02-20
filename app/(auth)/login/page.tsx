"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { GraduationCap, Loader2, Sparkles, ShieldCheck, Zap, ArrowRight, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Welcome Back!",
          description: "Login successful. Redirecting...",
        })
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Something went wrong. Please check your internet connection.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-[128px] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-2xl shadow-primary/40">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">Montessa</span>
            </Link>
          </div>

          <div className="space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl font-black text-white leading-tight tracking-tighter"
            >
              The Next Frontier <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-indigo-600">of Education.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { icon: ShieldCheck, title: "Enterprise grade", desc: "Military level security" },
                { icon: Zap, title: "Blazing fast", desc: "Optimized performance" }
              ].map((item, i) => (
                <div key={item.title} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <item.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-white font-bold text-lg">{item.title}</h3>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <p>© 2026 Montessa SMS. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to website
          </Link>

          <div className="mb-10">
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground">Sign In</h2>
            <p className="text-muted-foreground mt-3 text-lg">Enter your details and get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@school.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                className="h-14 rounded-2xl bg-muted/30 border-muted-foreground/10 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all text-base px-6"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Password</Label>
                <Link href="/forgot-password" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                className="h-14 rounded-2xl bg-muted/30 border-muted-foreground/10 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all text-base px-6 shadow-sm"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <>Sign In Securely <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50"></span>
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-wider">
                <span className="bg-background px-4 text-muted-foreground/40 italic">New Here?</span>
              </div>
            </div>

            <Button variant="outline" asChild className="w-full h-14 rounded-2xl border-2 font-bold hover:bg-muted transition-all">
              <Link href="/signup">Create an Account</Link>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

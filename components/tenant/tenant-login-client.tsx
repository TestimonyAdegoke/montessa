"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowRight, GraduationCap, Star, Menu, X } from "lucide-react"
import { cn, hexToHSL } from "@/lib/utils"
import { Block } from "@/components/site-builder/types"
import { BLOCK_DEFINITIONS } from "@/components/site-builder/registry"

interface TenantBranding {
  id: string
  name: string
  subdomain: string
  logo?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  accentColor?: string | null
  backgroundColor?: string | null
  backgroundImage?: string | null
  loginBanner?: string | null
  favicon?: string | null
  tagline?: string | null
  customCSS?: string | null
  loginLayout: string
  fontFamily?: string | null
  darkModeLogo?: string | null
  buttonStyle?: string
  inputStyle?: string
  cardGlass?: boolean
  landingPage?: {
    heroTitle?: string
    heroDescription?: string
    ctaText?: string
    ctaLink?: string
    features?: Array<{ title: string, description: string, icon?: string }>
    showFeatures?: boolean
    menuItems?: Array<{ label: string, href: string }>
    blocks?: Block[]
  }
}


export function TenantLoginClient({ branding }: { branding: TenantBranding }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })

  // View state: default to 'landing' if configured (either legacy hero or Site Builder blocks), otherwise 'login'
  const hasLandingPage = !!(branding.landingPage?.heroTitle || branding.landingPage?.blocks?.length)
  const [view, setView] = useState<'landing' | 'login'>(hasLandingPage ? 'landing' : 'login')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (branding.primaryColor) {
      root.style.setProperty("--primary", hexToHSL(branding.primaryColor))
      root.style.setProperty("--ring", hexToHSL(branding.primaryColor))
    }
    if (branding.fontFamily) {
      document.body.style.fontFamily = branding.fontFamily
    }
    return () => {
      root.style.removeProperty("--primary")
      root.style.removeProperty("--ring")
      document.body.style.fontFamily = ""
    }
  }, [branding])

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
        toast({ title: "Error", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Welcome!", description: `Signed in to ${branding.name}` })
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Styles Helpers
  const getButtonClass = () => {
    switch (branding.buttonStyle) {
      case "pill": return "rounded-full"
      case "sharp": return "rounded-none"
      default: return "rounded-lg"
    }
  }

  const getInputClass = () => {
    switch (branding.inputStyle) {
      case "filled": return "bg-muted/50 border-transparent focus:bg-background"
      case "underlined": return "rounded-none border-b border-t-0 border-x-0 px-0 bg-transparent focus:ring-0 shadow-none"
      default: return "bg-background"
    }
  }

  const cardStyle = branding.cardGlass
    ? {
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(12px)",
      borderColor: "rgba(255, 255, 255, 0.2)",
    }
    : {}

  // Landing Page Render
  if (view === 'landing' && branding.landingPage) {
    const { heroTitle, heroDescription, ctaText, ctaLink, features = [], showFeatures, menuItems = [], blocks } = branding.landingPage

    // If blocks are present, render them
    if (blocks && blocks.length > 0) {
      return (
        <div className="min-h-screen bg-background flex flex-col text-foreground" style={{ fontFamily: branding.fontFamily || 'Inter' }}>
          <style dangerouslySetInnerHTML={{
            __html: `
            :root {
              --primary: ${hexToHSL(branding.primaryColor || '#6366f1')};
              --primary-foreground: 0 0% 100%;
            }
            .text-primary { color: hsl(var(--primary)); }
            .bg-primary { background-color: hsl(var(--primary)); }
            .border-primary { border-color: hsl(var(--primary)); }
          ` }} />
          {branding.customCSS && <style dangerouslySetInnerHTML={{ __html: branding.customCSS }} />}

          {!blocks.some(b => b.type === 'navigation') && (
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center px-4 md:px-8 mx-auto max-w-7xl">
                <div className="flex items-center gap-2 font-bold text-xl mr-8">
                  {branding.logo ? <img src={branding.logo} className="h-8 w-auto object-contain" alt={branding.name} /> : <GraduationCap className="h-6 w-6" />}
                  <span className="hidden sm:inline-block">{branding.name}</span>
                </div>
                <nav className="flex items-center gap-6 text-sm font-medium ml-auto hidden md:flex">
                  {menuItems.map((item, i) => (
                    <a key={i} href={item.href} className="hover:text-primary transition-colors">{item.label}</a>
                  ))}
                  <Button size="sm" onClick={() => setView('login')} style={{ backgroundColor: branding.primaryColor || undefined }}>Portal Login</Button>
                </nav>
              </div>
            </header>
          )}

          <main className="flex-1">
            {blocks.map((block) => {
              const def = BLOCK_DEFINITIONS[block.type]
              if (!def) return null
              const Component = def.component
              return (
                <Component
                  key={block.id}
                  block={block}
                  onChange={() => { }} // No-op for live site
                  selected={false}
                />
              )
            })}
          </main>

          {!blocks.some(b => b.type === 'footer') && (
            <footer className="border-t py-12 px-6 bg-background">
              <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2 font-bold text-lg text-muted-foreground">
                  {branding.logo && <img src={branding.logo} className="h-6 w-auto object-contain opacity-50 grayscale" />}
                  <span>{branding.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {branding.name}. All rights reserved.</p>
              </div>
            </footer>
          )}
        </div>
      )
    }

    const handleCtaClick = () => {
      if (!ctaLink || ctaLink === "#" || ctaLink.startsWith("/")) {
        setView('login')
      } else {
        window.location.href = ctaLink
      }
    }

    return (
      <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
        {branding.customCSS && <style dangerouslySetInnerHTML={{ __html: branding.customCSS }} />}

        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center px-4 md:px-8 mx-auto max-w-7xl">
            <div className="flex items-center gap-2 font-bold text-xl mr-8">
              {branding.logo ? <img src={branding.logo} className="h-8 w-auto object-contain" alt={branding.name} /> : <GraduationCap className="h-6 w-6" />}
              <span className="hidden sm:inline-block">{branding.name}</span>
            </div>
            <nav className="flex items-center gap-6 text-sm font-medium ml-auto hidden md:flex">
              {menuItems.map((item, i) => (
                <a key={i} href={item.href} className="hover:text-primary transition-colors">{item.label}</a>
              ))}
              <Button size="sm" onClick={() => setView('login')} style={{ backgroundColor: branding.primaryColor || undefined }}>Portal Login</Button>
            </nav>
            <div className="ml-auto md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden border-t p-4 bg-background">
              <Button className="w-full" onClick={() => setView('login')} style={{ backgroundColor: branding.primaryColor || undefined }}>Portal Login</Button>
            </div>
          )}
        </header>

        {/* Hero */}
        <main className="flex-1">
          <section className="relative py-24 px-6 md:py-32 lg:px-8 overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div
              className="absolute inset-0 -z-20 opacity-10"
              style={branding.backgroundImage ? { backgroundImage: `url(${branding.backgroundImage})`, backgroundSize: 'cover' } : { backgroundColor: branding.primaryColor || undefined }}
            />

            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6 leading-tight">
                {heroTitle || "Welcome to Our School"}
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
                {heroDescription || "Empowering students to achieve their full potential."}
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" onClick={handleCtaClick} className={cn("h-12 px-8 text-lg shadow-xl", getButtonClass())} style={{ backgroundColor: branding.primaryColor || undefined }}>
                  {ctaText || "Get Started"} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>

          {/* Features */}
          {showFeatures && features && features.length > 0 && (
            <section className="py-24 bg-muted/30">
              <div className="container px-6 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex flex-col items-start bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all">
                      <div className="rounded-lg p-3 mb-4 text-white shadow-md" style={{ backgroundColor: branding.primaryColor || "#000" }}>
                        <Star className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t py-12 px-6 bg-background">
          <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-lg text-muted-foreground">
              {branding.logo && <img src={branding.logo} className="h-6 w-auto object-contain opacity-50 grayscale" />}
              <span>{branding.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {branding.name}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    )
  }

  // LOGIN PAGE LOGIC (Existing + Back to Landing Button)
  const formContent = (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@school.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
            className={getInputClass()}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={isLoading}
            className={getInputClass()}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button
          type="submit"
          className={cn("w-full shadow-lg transition-all hover:shadow-xl", getButtonClass())}
          disabled={isLoading}
          style={branding.primaryColor ? { backgroundColor: branding.primaryColor } : {}}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
        {hasLandingPage && (
          <Button variant="link" size="sm" onClick={() => setView('landing')} className="text-muted-foreground">
            ← Back to Home
          </Button>
        )}
      </CardFooter>
    </form>
  )

  // ... (Rest of existing layout logic for split/fullscreen/centered)
  // I need to paste the layouts here again.

  const bgStyle: React.CSSProperties = {}
  if (branding.backgroundImage) {
    bgStyle.backgroundImage = `url(${branding.backgroundImage})`
    bgStyle.backgroundSize = "cover"
    bgStyle.backgroundPosition = "center"
  } else if (branding.backgroundColor) {
    bgStyle.backgroundColor = branding.backgroundColor
  }

  if (branding.loginLayout === "split") {
    return (
      <>
        {branding.customCSS && <style dangerouslySetInnerHTML={{ __html: branding.customCSS }} />}
        <div className="flex min-h-screen">
          <div
            className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white relative"
            style={{
              backgroundColor: branding.primaryColor || "#1e40af",
              ...(branding.loginBanner ? { backgroundImage: `url(${branding.loginBanner})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
            }}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
            <div className="relative z-10 text-center space-y-6">
              {branding.logo && (
                <img src={branding.logo} alt={branding.name} className="h-24 mx-auto object-contain drop-shadow-lg" />
              )}
              <h1 className="text-4xl font-bold drop-shadow-lg">{branding.name}</h1>
              {branding.tagline && (
                <p className="text-xl opacity-90 max-w-md drop-shadow mx-auto">{branding.tagline}</p>
              )}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
            {hasLandingPage && (
              <Button variant="ghost" size="sm" onClick={() => setView('landing')} className="absolute top-4 right-4 text-muted-foreground">
                Home
              </Button>
            )}
            <div className="w-full max-w-md space-y-8">
              <div className="lg:hidden text-center mb-8">
                {branding.logo && <img src={branding.logo} alt={branding.name} className="h-16 mx-auto mb-4" />}
                <h1 className="text-2xl font-bold">{branding.name}</h1>
              </div>
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold">Welcome Back</h2>
                <p className="text-muted-foreground">Sign in to your account</p>
              </div>

              {formContent}

              <p className="text-center text-xs text-muted-foreground mt-6">
                Powered by <Link href="/" className="text-primary hover:underline">OnebitMS</Link>
              </p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (branding.loginLayout === "fullscreen") {
    return (
      <>
        {branding.customCSS && <style dangerouslySetInnerHTML={{ __html: branding.customCSS }} />}
        <div
          className="flex min-h-screen items-center justify-center p-4 relative"
          style={{
            ...(branding.loginBanner ? { backgroundImage: `url(${branding.loginBanner})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
            ...(branding.backgroundColor ? { backgroundColor: branding.backgroundColor } : {}),
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md">
            <div className="text-center mb-8">
              {branding.logo && <img src={branding.logo} alt={branding.name} className="h-20 mx-auto mb-4 drop-shadow-lg" />}
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">{branding.name}</h1>
              {branding.tagline && <p className="text-white/80 mt-2 drop-shadow">{branding.tagline}</p>}
            </div>

            <Card className="shadow-2xl border-none" style={branding.cardGlass ? cardStyle : { backgroundColor: "rgba(255,255,255,0.95)" }}>
              <CardHeader className="text-center">
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to continue</CardDescription>
              </CardHeader>
              {formContent}
            </Card>

            <p className="text-center text-xs text-white/60 mt-6">
              Powered by <Link href="/" className="text-white/80 hover:underline">OnebitMS</Link>
            </p>
          </div>
        </div>
      </>
    )
  }

  // Default: centered layout
  return (
    <>
      {branding.customCSS && <style dangerouslySetInnerHTML={{ __html: branding.customCSS }} />}
      <div className="flex min-h-screen items-center justify-center px-4" style={bgStyle}>
        <div className="bg-white/50 absolute inset-0 backdrop-blur-[2px]" />
        {hasLandingPage && (
          <Button variant="ghost" size="sm" onClick={() => setView('landing')} className="absolute top-4 left-4 z-20">
            ← Home
          </Button>
        )}
        <Card className="w-full max-w-md shadow-2xl relative z-10 border-border/50" style={cardStyle}>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center">
              {branding.logo ? (
                <img src={branding.logo} alt={branding.name} className="h-16 object-contain" />
              ) : (
                <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg" style={{ backgroundColor: branding.primaryColor || "#3b82f6" }}>
                  {branding.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold">{branding.name}</CardTitle>
              <CardDescription className="text-base">{branding.tagline || "Sign in to your account"}</CardDescription>
            </div>
          </CardHeader>
          {formContent}
          <div className="pb-6">
            <p className="text-center text-xs text-muted-foreground">
              Powered by <Link href="/" className="text-primary hover:underline">OnebitMS</Link>
            </p>
          </div>
        </Card>
      </div>
    </>
  )
}

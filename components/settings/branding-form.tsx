"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, ExternalLink, Palette, Image as ImageIcon, Layout, Code2, MonitorPlay, Globe, ArrowLeft, Menu, Plus, Trash2, Type } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import FileUpload from "@/components/common/file-upload"
import { SiteBuilder } from "@/components/site-builder/site-builder"
import { Block } from "@/components/site-builder/types"
import { LiveSiteRenderer } from "@/components/site-builder/live-site-renderer"
import { cn } from "@/lib/utils"

interface BrandingFormProps {
  tenantId: string
  subdomain?: string
  currentLogo?: string | null
  currentColor?: string | null
  currentSecondaryColor?: string | null
  currentAccentColor?: string | null
  currentBackgroundColor?: string | null
  currentBackgroundImage?: string | null
  currentLoginBanner?: string | null
  currentFavicon?: string | null
  currentTagline?: string | null
  currentCustomCSS?: string | null
  currentLoginLayout?: string | null
  currentHeaderStyle?: string | null
  currentFontFamily?: string | null
  currentDarkModeLogo?: string | null
  currentButtonStyle?: string
  currentInputStyle?: string
  currentCardGlass?: boolean
  currentLandingPage?: any
  dedicatedRoute?: boolean
}

export default function BrandingForm({
  tenantId,
  subdomain,
  currentLogo,
  currentColor,
  currentSecondaryColor,
  currentAccentColor,
  currentBackgroundColor,
  currentBackgroundImage,
  currentLoginBanner,
  currentFavicon,
  currentTagline,
  currentCustomCSS,
  currentLoginLayout,
  currentHeaderStyle,
  currentFontFamily,
  currentDarkModeLogo,
  currentButtonStyle,
  currentInputStyle,
  currentCardGlass,
  currentLandingPage,
  dedicatedRoute = false,
}: BrandingFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Appearance
  const [logo, setLogo] = useState(currentLogo || "")
  const [primaryColor, setPrimaryColor] = useState(currentColor || "#3b82f6")
  const [secondaryColor, setSecondaryColor] = useState(currentSecondaryColor || "")
  const [accentColor, setAccentColor] = useState(currentAccentColor || "")
  const [backgroundColor, setBackgroundColor] = useState(currentBackgroundColor || "")
  const [backgroundImage, setBackgroundImage] = useState(currentBackgroundImage || "")
  const [loginBanner, setLoginBanner] = useState(currentLoginBanner || "")
  const [favicon, setFavicon] = useState(currentFavicon || "")
  const [tagline, setTagline] = useState(currentTagline || "")
  const [customCSS, setCustomCSS] = useState(currentCustomCSS || "")
  const [fontFamily, setFontFamily] = useState(currentFontFamily || "")
  const [darkModeLogo, setDarkModeLogo] = useState(currentDarkModeLogo || "")

  // Login Portal
  const [loginLayout, setLoginLayout] = useState(currentLoginLayout || "centered")
  const [buttonStyle, setButtonStyle] = useState(currentButtonStyle || "rounded")
  const [inputStyle, setInputStyle] = useState(currentInputStyle || "outlined")
  const [cardGlass, setCardGlass] = useState(currentCardGlass || false)

  // Landing Page Fields (Fallback/Legacy)
  const [landingHeroTitle, setLandingHeroTitle] = useState(currentLandingPage?.heroTitle || "Welcome to Our School")
  const [landingHeroDescription, setLandingHeroDescription] = useState(currentLandingPage?.heroDescription || "Your partner in educational excellence.")
  const [landingCtaText, setLandingCtaText] = useState(currentLandingPage?.ctaText || "Get Started")
  const [landingCtaLink, setLandingCtaLink] = useState(currentLandingPage?.ctaLink || "#")
  const [landingShowFeatures, setLandingShowFeatures] = useState(currentLandingPage?.showFeatures ?? true)

  const [landingFeatures, setLandingFeatures] = useState<Array<any>>(currentLandingPage?.features || [
    { title: "Personalized Learning", description: "Curriculum tailored to each student's unique needs and pace." },
    { title: "Expert Faculty", description: "Dedicated educators committed to nurturing student growth." },
    { title: "Modern Facilities", description: "State-of-the-art campus designed for collaborative learning." }
  ])

  const [landingMenuItems, setLandingMenuItems] = useState<Array<any>>(currentLandingPage?.menuItems || [
    { label: "Programs", href: "#" },
    { label: "Admissions", href: "#" },
    { label: "Contact", href: "#" }
  ])

  // Builder State
  const [builderBlocks, setBuilderBlocks] = useState<Block[]>(currentLandingPage?.blocks || [])
  const [builderMode, setBuilderMode] = useState(dedicatedRoute)
  const [activeTab, setActiveTab] = useState("identity")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (builderBlocks.length === 0 && currentLandingPage) {
      const migrated: Block[] = []
      migrated.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'hero',
        props: {
          title: currentLandingPage.heroTitle || "Welcome to Our School",
          subtitle: currentLandingPage.heroDescription || "Your partner in educational excellence.",
          ctaText: currentLandingPage.ctaText || "Get Started",
          ctaLink: currentLandingPage.ctaLink || "#",
          align: 'center',
          showOverlay: true,
          backgroundImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop'
        }
      })
      if (currentLandingPage.showFeatures !== false) {
        migrated.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'features',
          props: {
            title: "Why Choose Us",
            description: "We provide a nurturing environment.",
            features: currentLandingPage.features || [],
            columns: 3,
            iconStyle: 'circle'
          }
        })
      }
      setBuilderBlocks(migrated)
    }
  }, [currentLandingPage, builderBlocks.length])

  const handleSave = async () => {
    setLoading(true)
    try {
      const landingPageData = {
        heroTitle: landingHeroTitle,
        heroDescription: landingHeroDescription,
        ctaText: landingCtaText,
        ctaLink: landingCtaLink,
        showFeatures: landingShowFeatures,
        features: landingFeatures,
        menuItems: landingMenuItems,
        blocks: builderBlocks,
      }

      const res = await fetch("/api/tenant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo, primaryColor, secondaryColor, accentColor,
          backgroundColor, backgroundImage, loginBanner, favicon,
          tagline, customCSS, loginLayout, fontFamily, darkModeLogo,
          buttonStyle, inputStyle, cardGlass,
          landingPage: landingPageData,
          landingPageDraft: landingPageData
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `Failed to save: ${res.statusText}`)
      }

      toast({ title: "Configuration Saved", description: "Your website settings have been published." })
    } catch (error: any) {
      console.error("Save error:", error)
      toast({ title: "Save Failed", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleBuilderSave = async (newBlocks: Block[], options?: { auto?: boolean }) => {
    setBuilderBlocks(newBlocks)

    const isAuto = options?.auto
    if (!isAuto) {
      setLoading(true)
    }

    try {
      const landingPageData = {
        heroTitle: landingHeroTitle,
        heroDescription: landingHeroDescription,
        ctaText: landingCtaText,
        ctaLink: landingCtaLink,
        showFeatures: landingShowFeatures,
        features: landingFeatures,
        menuItems: landingMenuItems,
        blocks: newBlocks
      }

      const payload: any = {
        logo, primaryColor, secondaryColor, accentColor,
        backgroundColor, backgroundImage, loginBanner, favicon,
        tagline, customCSS, loginLayout, fontFamily, darkModeLogo,
        buttonStyle, inputStyle, cardGlass,
        // Always persist drafts for the builder
        landingPageDraft: landingPageData,
      }

      // For explicit saves (publish), also update the published version
      if (!isAuto) {
        payload.landingPagePublished = landingPageData
        // Keep legacy landingPage in sync for any older consumers
        payload.landingPage = landingPageData
      }

      const res = await fetch("/api/tenant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `Failed to save: ${res.statusText}`)
      }

      // Only surface a prominent notification for explicit publishes
      if (!isAuto) {
        toast({ title: "Landing Page Updated", description: "Your design changes have been saved." })
      }
    } catch (e: any) {
      if (!isAuto) {
        toast({ title: "Error", description: e.message || "Failed to save", variant: "destructive" })
      }
    } finally {
      if (!isAuto) {
        setLoading(false)
      }
    }
  }

  // Handle updates from Preview (Inline Edit)
  const handleUpdate = useCallback((path: string, value: any) => {
    if (path === 'landingPage.heroTitle') setLandingHeroTitle(value)
    else if (path === 'landingPage.heroDescription') setLandingHeroDescription(value)
    else if (path === 'landingPage.ctaText') setLandingCtaText(value)
    else if (path.startsWith('landingPage.features[')) {
      const match = path.match(/landingPage\.features\[(\d+)\]\.(\w+)/)
      if (match) {
        const index = parseInt(match[1])
        const field = match[2]
        const newFeatures = [...landingFeatures]
        if (newFeatures[index]) {
          newFeatures[index] = { ...newFeatures[index], [field]: value }
          setLandingFeatures(newFeatures)
        }
      }
    }
    else if (path.startsWith('landingPage.menuItems[')) {
      const match = path.match(/landingPage\.menuItems\[(\d+)\]\.(\w+)/)
      if (match) {
        const index = parseInt(match[1])
        const field = match[2]
        const newItems = [...landingMenuItems]
        if (newItems[index]) {
          newItems[index] = { ...newItems[index], [field]: value }
          setLandingMenuItems(newItems)
        }
      }
    }
  }, [landingFeatures, landingMenuItems])

  function ColorField({ label, value, onChange, id }: { label: string; value: string; onChange: (v: string) => void; id: string }) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{label}</Label>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Input
              type="color"
              value={value || "#ffffff"}
              onChange={(e) => onChange(e.target.value)}
              className="w-10 h-10 p-0.5 cursor-pointer rounded-xl border-2 border-muted-foreground/10 hover:border-primary/30 transition-colors"
              id={id}
            />
          </div>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#3b82f6"
            className="flex-1 rounded-xl h-10 font-mono text-sm border-muted-foreground/10"
          />
        </div>
      </div>
    )
  }

  if (builderMode) {
    return (
      <SiteBuilder
        initialBlocks={builderBlocks}
        onSave={handleBuilderSave}
        onExit={() => dedicatedRoute ? router.push("/dashboard") : setBuilderMode(false)}
        loading={loading}
        globalStyles={{
          primaryColor,
          secondaryColor,
          accentColor,
          backgroundColor,
          fontFamily
        }}
        onGlobalStyleChange={(styles) => {
          setPrimaryColor(styles.primaryColor)
          setSecondaryColor(styles.secondaryColor)
          setAccentColor(styles.accentColor)
          setBackgroundColor(styles.backgroundColor)
          setFontFamily(styles.fontFamily)
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col md:flex-row overflow-hidden">
      {/* HEADER for Mobile */}
      <div className="md:hidden h-14 border-b flex items-center justify-between px-4 bg-background">
        <span className="font-bold text-sm uppercase tracking-wider">Site Branding</span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => router.push("/dashboard/settings")}>Exit</Button>
          <Button size="sm" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
        </div>
      </div>

      {/* LEFT SIDEBAR: Controls */}
      <div className="w-full md:w-[400px] lg:w-[450px] border-r bg-muted/10 flex flex-col h-[calc(100vh-56px)] md:h-screen overflow-hidden">
        <div className="p-6 border-b bg-background sticky top-0 z-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.push("/dashboard/settings")} title="Back to Settings">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h2 className="font-bold text-lg leading-none tracking-tight">Site Branding</h2>
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 mt-1 tracking-widest">Global Style & Presence</span>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={loading} className={cn("rounded-xl shadow-lg shadow-primary/20", loading && "opacity-80")}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Saving..." : "Publish Styles"}
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8 pb-32">
            {!dedicatedRoute && (
              <div className="bg-primary/[0.03] border border-primary/10 rounded-2xl p-6 text-center space-y-4 shadow-sm ring-1 ring-primary/5">
                <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-inner">
                  <Globe className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight">Launch Designer</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-2 leading-relaxed">
                    Open the full-screen visual editor to design your professional landing page with our modern components.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/dashboard/site-builder")}
                  className="w-full max-w-xs shadow-xl rounded-xl h-11 font-bold tracking-tight"
                >
                  Open Site Builder
                </Button>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-12 mb-8 gap-1 p-1 bg-muted/30 rounded-xl">
                <TabsTrigger value="identity" title="Identity" className="rounded-lg"><ImageIcon className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="login" title="Login Portal" className="rounded-lg"><MonitorPlay className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="advanced" title="Advanced" className="rounded-lg"><Code2 className="h-4 w-4" /></TabsTrigger>
              </TabsList>

              <TabsContent value="identity" className="space-y-8 mt-0 outline-none">
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60">Core Assets</h3>
                  </div>
                  <FileUpload value={logo} onChange={setLogo} folder="branding" accept="image/*" label="Primary Logo" preview="image" />
                  <FileUpload value={favicon} onChange={setFavicon} folder="branding" accept="image/*" label="Favicon (Tab Icon)" preview="icon" maxSizeMB={1} />
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Brand Tagline</Label>
                    <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Excellence in Education" className="h-11 rounded-xl" />
                  </div>
                </div>
                
                <div className="space-y-5 pt-8 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60">Brand Palette</h3>
                  </div>
                  <ColorField label="Signature Primary" value={primaryColor} onChange={setPrimaryColor} id="primary" />
                  <ColorField label="Accent Secondary" value={secondaryColor} onChange={setSecondaryColor} id="secondary" />
                  <ColorField label="Surface Background" value={backgroundColor} onChange={setBackgroundColor} id="bg" />
                </div>

                <div className="space-y-5 pt-8 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Type className="h-4 w-4 text-primary" />
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60">Typography</h3>
                  </div>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger className="h-12 rounded-xl shadow-sm"><SelectValue placeholder="Font Family" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="Inter">Inter (Global Standard)</SelectItem>
                      <SelectItem value="Poppins">Poppins (Modern & Round)</SelectItem>
                      <SelectItem value="Roboto">Roboto (Precise Geometric)</SelectItem>
                      <SelectItem value="Playfair Display">Playfair (Elegant Serif)</SelectItem>
                      <SelectItem value="Outfit">Outfit (High-End Tech)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="login" className="space-y-8 mt-0 outline-none">
                <div className="space-y-5">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60">Portal Layout</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {["centered", "split", "fullscreen"].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLoginLayout(l)}
                        className={cn(
                          "py-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                          loginLayout === l ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" : "hover:bg-muted bg-card"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-5 pt-8 border-t">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60">UI Elements</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Button Radius</Label>
                      <Select value={buttonStyle} onValueChange={setButtonStyle}>
                        <SelectTrigger className="h-11 rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="pill">Pill Shape</SelectItem>
                          <SelectItem value="sharp">Sharp Edge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Input Style</Label>
                      <Select value={inputStyle} onValueChange={setInputStyle}>
                        <SelectTrigger className="h-11 rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="outlined">Outlined</SelectItem>
                          <SelectItem value="filled">Soft Fill</SelectItem>
                          <SelectItem value="underlined">Underlined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border bg-card/50 rounded-2xl shadow-sm ring-1 ring-black/5 transition-all hover:bg-card">
                    <Label className="cursor-pointer font-bold text-sm" htmlFor="glass">Glassmorphism Effect</Label>
                    <Switch id="glass" checked={cardGlass} onCheckedChange={setCardGlass} />
                  </div>
                </div>
                <div className="space-y-5 pt-8 border-t">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60">Visual Themes</h3>
                  <FileUpload value={backgroundImage} onChange={setBackgroundImage} folder="branding" accept="image/*" label="Portal Background" preview="image" />
                  <FileUpload value={loginBanner} onChange={setLoginBanner} folder="branding" accept="image/*" label="Marketing Banner (Split Layout)" preview="image" />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6 mt-0 outline-none">
                <div className="space-y-3">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60">Custom Injection</h3>
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 ml-1">Universal CSS Overrides</Label>
                  <Textarea 
                    value={customCSS} 
                    onChange={(e) => setCustomCSS(e.target.value)} 
                    className="font-mono text-[11px] rounded-2xl min-h-[400px] border-muted-foreground/10 focus:ring-primary/20 bg-muted/5 p-5 leading-relaxed" 
                    placeholder="/* Enter custom CSS rules here */\n.hero-title {\n  letter-spacing: -0.05em;\n}" 
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>

      {/* CENTER: Live Preview Area */}
      <div className="flex-1 bg-muted/20 relative flex flex-col h-full overflow-hidden">
        <div className="absolute inset-0 p-6 md:p-12 flex items-center justify-center">
          <div className="w-full h-full max-w-6xl rounded-[32px] border-8 border-muted bg-background shadow-2xl overflow-hidden relative group ring-1 ring-black/[0.05]">
            <div className="absolute top-0 left-0 right-0 h-10 bg-muted border-b flex items-center px-4 gap-2 z-10 shrink-0 select-none">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/20" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                <div className="w-3 h-3 rounded-full bg-green-500/20" />
              </div>
              <div className="flex-1 flex justify-center pr-12">
                <div className="bg-background/50 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full border shadow-sm text-foreground/40">
                  Live System Preview
                </div>
              </div>
            </div>
            <div className="absolute inset-0 pt-10 overflow-auto">
              <LiveSiteRenderer
                blocks={builderBlocks}
                primaryColor={primaryColor}
                fontFamily={fontFamily}
                previewMode={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

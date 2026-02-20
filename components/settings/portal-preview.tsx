"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Monitor, Smartphone, Tablet, ExternalLink, ArrowRight, Menu, X, Check, Star, GraduationCap, Plus } from "lucide-react"
import { InlineText } from "./inline-text"
import { Block } from "@/components/site-builder/types"
import { BLOCK_DEFINITIONS } from "@/components/site-builder/registry"

interface PreviewProps {
    mode: "login" | "landing"
    settings: {
        logo?: string
        primaryColor?: string
        secondaryColor?: string
        accentColor?: string
        backgroundColor?: string
        backgroundImage?: string
        loginBanner?: string
        layout?: string
        buttonStyle?: string
        inputStyle?: string
        cardGlass?: boolean
        fontFamily?: string
        schoolName?: string
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
    onUpdate?: (path: string, value: any) => void
}

export function PortalPreview({ mode, settings, onUpdate }: PreviewProps) {
    const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
    const [scale, setScale] = useState(1)
    const containerRef = useRef<HTMLDivElement>(null)

    // Auto-scale logic
    useEffect(() => {
        const updateScale = () => {
            if (!containerRef.current) return
            const containerWidth = containerRef.current.offsetWidth
            const targetWidth = device === "desktop" ? 1440 : device === "tablet" ? 768 : 375
            const s = (containerWidth - 48) / targetWidth
            setScale(Math.min(s, 1))
        }
        updateScale()
        window.addEventListener("resize", updateScale)
        return () => window.removeEventListener("resize", updateScale)
    }, [device])

    const {
        logo,
        primaryColor = "#6366f1",
        secondaryColor = "#f3f4f6",
        accentColor = "#4f46e5",
        backgroundColor = "#ffffff",
        backgroundImage,
        loginBanner,
        layout = "centered",
        buttonStyle = "rounded",
        inputStyle = "outlined",
        cardGlass = false,
        fontFamily = "Inter",
        schoolName = "Montessa School",
        landingPage = {}
    } = settings

    const {
        heroTitle = "Welcome to Our Learning Community",
        heroDescription = "Empowering students to achieve their full potential through personalized education and innovative learning environments.",
        ctaText = "Get Started",
        ctaLink = "#",
        features = [
            { title: "Personalized Learning", description: "Curriculum tailored to each student's unique needs and pace." },
            { title: "Expert Faculty", description: "Dedicated educators committed to nurturing student growth." },
            { title: "Modern Facilities", description: "State-of-the-art campus designed for collaborative learning." }
        ],
        showFeatures = true,
        menuItems = [
            { label: "Programs", href: "#" },
            { label: "Admissions", href: "#" },
            { label: "Faculty", href: "#" },
            { label: "About", href: "#" }
        ]
    } = landingPage

    const getButtonClass = () => {
        switch (buttonStyle) {
            case "pill": return "rounded-full"
            case "sharp": return "rounded-none"
            default: return "rounded-lg"
        }
    }

    const getInputClass = () => {
        switch (inputStyle) {
            case "filled": return "bg-muted/50 border-transparent focus:bg-background"
            case "underlined": return "rounded-none border-b border-t-0 border-x-0 px-0 bg-transparent focus:ring-0"
            default: return "bg-background border-input"
        }
    }

    const cardStyle = cardGlass
        ? {
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(255, 255, 255, 0.2)",
        }
        : { backgroundColor: "#ffffff" }

    const LoginContent = () => (
        <div
            className={cn(
                "w-full h-full relative overflow-hidden flex",
                layout === "centered" && "items-center justify-center p-8",
                layout === "split" && "flex-row",
                layout === "fullscreen" && "items-center justify-center p-8"
            )}
            style={{
                backgroundColor: layout !== "split" ? backgroundColor : undefined,
                backgroundImage: layout !== "split" && backgroundImage ? `url(${backgroundImage})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                fontFamily,
            }}
        >
            {(layout === "fullscreen" || (layout === "centered" && backgroundImage)) && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
            )}

            {layout === "split" && (
                <div
                    className="hidden md:flex flex-1 flex-col justify-between p-12 relative overflow-hidden text-white"
                    style={{
                        backgroundColor: primaryColor,
                        backgroundImage: loginBanner ? `url(${loginBanner})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10">
                        {logo && <img src={logo} alt="Logo" className="w-12 h-12 object-contain bg-white/10 p-2 rounded-lg mb-6 backdrop-blur-sm" />}
                        <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
                        <p className="opacity-90 text-lg max-w-md">Access your {schoolName} dashboard securely.</p>
                    </div>
                </div>
            )}

            <div
                className={cn(
                    "relative z-10 w-full max-w-md transition-all duration-300",
                    layout === "split" ? "bg-white p-12 flex flex-col justify-center h-full w-[500px]" : "p-10 rounded-2xl shadow-2xl",
                )}
                style={layout !== "split" ? cardStyle : { backgroundColor }}
            >
                {layout !== "split" && logo && (
                    <div className="flex justify-center mb-8">
                        <div className="p-4 rounded-2xl bg-white/90 shadow-sm">
                            <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                        </div>
                    </div>
                )}

                <div className="mb-8 text-center">
                    <h3 className="text-2xl font-bold" style={{ color: primaryColor }}>Sign In</h3>
                    <p className="text-sm text-muted-foreground mt-2">Enter your credentials to continue</p>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input placeholder="name@school.com" className={cn("h-11", getInputClass())} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Password</Label>
                            <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
                        </div>
                        <Input type="password" placeholder="••••••••" className={cn("h-11", getInputClass())} />
                    </div>
                    <Button
                        className={cn("w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all mt-2", getButtonClass())}
                        style={{ backgroundColor: primaryColor, color: "#fff" }}
                    >
                        Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )

    const LandingContent = () => {
        // If we have blocks, render them instead of legacy structure
        if (landingPage.blocks && landingPage.blocks.length > 0) {
            return (
                <div className="w-full min-h-full bg-background flex flex-col pointer-events-auto" style={{ fontFamily }}>
                    {/* We can re-use the Header if needed, or assume Navigation Block */}
                    {/* For now, render blocks. If no Nav block, render legacy header? */}
                    {/* Let's render legacy header ONLY if no 'navigation' block exists */}
                    {/* But for now, just render all blocks. Assuming blocks cover everything including footer */}

                    {!landingPage.blocks.some(b => b.type === 'navigation') && (
                        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            <div className="container flex h-16 items-center px-6">
                                <div className="flex items-center gap-2 font-bold text-xl mr-8">
                                    {logo ? <img src={logo} className="h-8 w-8 object-contain" /> : <GraduationCap className="h-6 w-6" />}
                                    <span>{schoolName}</span>
                                </div>
                                <nav className="flex items-center gap-6 text-sm font-medium ml-auto hidden md:flex">
                                    {menuItems.map((item, i) => (
                                        <a key={i} href={item.href} className="hover:text-primary transition-colors">{item.label}</a>
                                    ))}
                                    <Button size="sm" style={{ backgroundColor: primaryColor }}>Portal Login</Button>
                                </nav>
                            </div>
                        </header>
                    )}

                    {landingPage.blocks.map((block) => {
                        const def = BLOCK_DEFINITIONS[block.type]
                        if (!def) return null
                        const Component = def.component
                        return (
                            <Component
                                key={block.id}
                                block={block}
                                // In Preview, we don't want editable unless onUpdate handles it specific blocks
                                // For now, pass no-op or handle text updates if mapped
                                onChange={(id, props) => {
                                    // Complex mapping or just ignore in legacy preview
                                    // Users should use Builder for block editing.
                                }}
                                selected={false}
                            />
                        )
                    })}
                </div>
            )
        }

        return (
            <div className="w-full min-h-full bg-background flex flex-col pointer-events-auto" style={{ fontFamily }}>
                {/* Header */}
                <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-16 items-center px-6">
                        <div className="flex items-center gap-2 font-bold text-xl mr-8">
                            {logo ? <img src={logo} className="h-8 w-8 object-contain" /> : <GraduationCap className="h-6 w-6" />}
                            <span>{schoolName}</span>
                        </div>
                        <nav className="flex items-center gap-6 text-sm font-medium ml-auto hidden md:flex">
                            {menuItems.map((item, i) => (
                                <InlineText
                                    key={i}
                                    value={item.label}
                                    onChange={(val) => onUpdate?.(`landingPage.menuItems[${i}].label`, val)}
                                    tagName="span"
                                    className="hover:text-primary transition-colors cursor-pointer"
                                    editable={!!onUpdate}
                                />
                            ))}
                            {onUpdate && (
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-50 hover:opacity-100" title="Add Menu Item (Edit in Sidebar)">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            )}
                            <Button size="sm" style={{ backgroundColor: primaryColor }} className="pointer-events-none">Portal Login</Button>
                        </nav>
                    </div>
                </header>

                {/* Hero */}
                <section className="relative py-24 px-6 md:py-32 lg:px-8 overflow-hidden">
                    <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                    <div
                        className="absolute inset-0 -z-20 opacity-30"
                        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' } : { backgroundColor }}
                    />

                    <div className="mx-auto max-w-3xl text-center">
                        <div className="flex justify-center mb-6">
                            <InlineText
                                value={heroTitle}
                                onChange={(val) => onUpdate?.('landingPage.heroTitle', val)}
                                tagName="h1"
                                className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-center w-full"
                                style={{ color: primaryColor }}
                                multiline
                                editable={!!onUpdate}
                            />
                        </div>
                        <div className="flex justify-center">
                            <InlineText
                                value={heroDescription}
                                onChange={(val) => onUpdate?.('landingPage.heroDescription', val)}
                                tagName="p"
                                className="mt-6 text-lg leading-8 text-muted-foreground w-full"
                                multiline
                                editable={!!onUpdate}
                            />
                        </div>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Button size="lg" className={cn("h-12 px-8 text-lg shadow-xl", getButtonClass())} style={{ backgroundColor: primaryColor }}>
                                <InlineText
                                    value={ctaText}
                                    onChange={(val) => onUpdate?.('landingPage.ctaText', val)}
                                    tagName="span"
                                    editable={!!onUpdate}
                                />
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Features */}
                {showFeatures && features && (
                    <section className="py-24 bg-muted/30">
                        <div className="container px-6 mx-auto">
                            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex flex-col items-start bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all group">
                                        <div className="rounded-lg p-3 mb-4 text-white shadow-md" style={{ backgroundColor: i % 2 === 0 ? primaryColor : accentColor }}>
                                            <Star className="h-6 w-6" />
                                        </div>
                                        <InlineText
                                            value={feature.title}
                                            onChange={(val) => onUpdate?.(`landingPage.features[${i}].title`, val)}
                                            tagName="h3"
                                            className="text-xl font-bold mb-2 w-full"
                                            editable={!!onUpdate}
                                        />
                                        <InlineText
                                            value={feature.description}
                                            onChange={(val) => onUpdate?.(`landingPage.features[${i}].description`, val)}
                                            tagName="p"
                                            className="text-muted-foreground leading-relaxed w-full"
                                            multiline
                                            editable={!!onUpdate}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="border-t py-12 px-6 bg-background">
                    <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 font-bold text-lg text-muted-foreground">
                            {logo && <img src={logo} className="h-6 w-6 object-contain opacity-50 grayscale" />}
                            <span>{schoolName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {schoolName}. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        )
    }

    const targetWidth = device === "desktop" ? "1440px" : device === "tablet" ? "768px" : "375px"
    const targetHeight = device === "desktop" ? "900px" : device === "tablet" ? "1024px" : "667px"

    return (
        <div className="flex flex-col h-full bg-muted/10 rounded-xl overflow-hidden border shadow-sm">
            {/* Toolbar */}
            <div className="h-12 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-20">
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                    <Button variant={device === "desktop" ? "secondary" : "ghost"} size="icon" className="h-7 w-7 rounded-md" onClick={() => setDevice("desktop")}><Monitor className="h-4 w-4" /></Button>
                    <Button variant={device === "tablet" ? "secondary" : "ghost"} size="icon" className="h-7 w-7 rounded-md" onClick={() => setDevice("tablet")}><Tablet className="h-4 w-4" /></Button>
                    <Button variant={device === "mobile" ? "secondary" : "ghost"} size="icon" className="h-7 w-7 rounded-md" onClick={() => setDevice("mobile")}><Smartphone className="h-4 w-4" /></Button>
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                    {Math.round(scale * 100)}% Scale • {device.charAt(0).toUpperCase() + device.slice(1)} Mode
                </div>
            </div>

            {/* Viewport */}
            <div ref={containerRef} className="flex-1 w-full relative overflow-hidden bg-muted/30 flex items-center justify-center p-8">
                <div
                    style={{
                        width: targetWidth,
                        height: targetHeight,
                        transform: `scale(${scale})`,
                        transformOrigin: "center center",
                        boxShadow: "0 50px 100px -20px rgba(0,0,0,0.15), 0 30px 60px -30px rgba(0,0,0,0.2)",
                    }}
                    className="bg-background relative overflow-y-auto overflow-x-hidden rounded-md no-scrollbar"
                >
                    {mode === "login" ? <LoginContent /> : <LandingContent />}
                </div>
            </div>
        </div>
    )
}

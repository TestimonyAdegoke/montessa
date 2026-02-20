"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Loader2, GraduationCap, Lock, Mail, Users, ArrowRight } from "lucide-react"

interface PreviewProps {
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
    }
}

export function LoginPortalPreview({ settings }: PreviewProps) {
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
    } = settings

    // Button Style Classes
    const getButtonClass = () => {
        switch (buttonStyle) {
            case "pill": return "rounded-full"
            case "sharp": return "rounded-none"
            default: return "rounded-lg"
        }
    }

    // Input Style Classes
    const getInputClass = () => {
        switch (inputStyle) {
            case "filled": return "bg-muted/50 border-transparent focus:bg-background"
            case "underlined": return "rounded-none border-b border-t-0 border-x-0 px-0 bg-transparent focus:ring-0"
            default: return "bg-background border-input"
        }
    }

    // Card Style (Glass Effect)
    const cardStyle = cardGlass
        ? {
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(255, 255, 255, 0.2)",
        }
        : { backgroundColor: "#ffffff" }

    return (
        <div className="w-full aspect-video rounded-xl border overflow-hidden relative shadow-2xl flex flex-col">
            {/* Top Bar (Mock Browser) */}
            <div className="h-6 bg-muted border-b flex items-center px-3 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="ml-4 w-1/3 h-3 bg-background rounded text-[8px] flex items-center px-2 text-muted-foreground">
                    portal.{schoolName.toLowerCase().replace(/\s/g, "")}.com
                </div>
            </div>

            {/* Content Area */}
            <div
                className={cn(
                    "flex-1 relative overflow-hidden transition-all duration-500",
                    layout === "centered" && "flex items-center justify-center p-8",
                    layout === "split" && "grid grid-cols-2",
                    layout === "fullscreen" && "flex items-center justify-center p-8"
                )}
                style={{
                    backgroundColor: layout !== "split" ? backgroundColor : undefined,
                    backgroundImage: layout !== "split" && backgroundImage ? `url(${backgroundImage})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    fontFamily,
                }}
            >
                {/* Overlay for Fullscreen BG */}
                {(layout === "fullscreen" || (layout === "centered" && backgroundImage)) && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
                )}

                {/* Left Side (Split Layout Only) */}
                {layout === "split" && (
                    <div
                        className="hidden md:flex flex-col justify-between p-8 relative overflow-hidden"
                        style={{
                            backgroundColor: primaryColor,
                            backgroundImage: loginBanner ? `url(${loginBanner})` : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="relative z-10 text-white">
                            {logo && <Image src={logo} alt="Logo" width={40} height={40} className="rounded object-contain bg-white/10 p-1 mb-4" />}
                            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                            <p className="opacity-90 text-sm">Access your {schoolName} dashboard.</p>
                        </div>

                        <div className="relative z-10 flex gap-4 text-white/60 text-xs">
                            <span>© 2024 {schoolName}</span>
                            <span>Privacy</span>
                        </div>
                    </div>
                )}

                {/* Login Card/Form Area */}
                <div
                    className={cn(
                        "relative z-10 w-full max-w-sm transition-all duration-300",
                        layout === "split" ? "bg-white p-8 flex flex-col justify-center h-full" : "p-8 rounded-2xl shadow-xl",
                    )} // layout === split uses 'bg-white' assuming right side is white 
                    style={layout !== "split" ? cardStyle : { backgroundColor }} // Apply custom bg color to right side if split
                >
                    {/* Logo (Centered/Fullscreen) */}
                    {layout !== "split" && logo && (
                        <div className="flex justify-center mb-6">
                            <div className="p-3 rounded-xl bg-white/90 shadow-sm">
                                <Image src={logo} alt="Logo" width={48} height={48} className="object-contain" />
                            </div>
                        </div>
                    )}

                    {layout !== "split" && (
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold" style={{ color: primaryColor }}>Sign in to your account</h3>
                            <p className="text-xs text-muted-foreground mt-1">Enter your details specifically for {schoolName}</p>
                        </div>
                    )}

                    {layout === "split" && (
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-foreground">Sign In</h3>
                            <p className="text-sm text-muted-foreground mt-2">Enter your email and password to access your account.</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="name@example.com"
                                    className={cn("pl-9 h-9 text-sm", getInputClass())}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs">Password</Label>
                                <a href="#" className="text-[10px] text-muted-foreground hover:text-primary">Forgot?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className={cn("pl-9 h-9 text-sm", getInputClass())}
                                />
                            </div>
                        </div>

                        <Button
                            className={cn("w-full h-9 text-sm font-medium shadow-md hover:shadow-lg transition-all", getButtonClass())}
                            style={{ backgroundColor: primaryColor, color: "#fff" }}
                        >
                            Sign In <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Button>

                        {layout !== "split" && (
                            <div className="text-center text-[10px] text-muted-foreground mt-4">
                                Protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

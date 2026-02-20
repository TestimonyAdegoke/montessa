"use client"

import { useState } from "react"
import {
    Settings2,
    Check,
    Palette,
    Monitor,
    Moon,
    Sun,
    Layout,
    Type
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const PRESET_COLORS = [
    { name: "Indigo", value: "243 75% 59%", class: "bg-[#6366f1]" },
    { name: "Emerald", value: "142 71% 45%", class: "bg-[#10b981]" },
    { name: "Rose", value: "346 84% 61%", class: "bg-[#f43f5e]" },
    { name: "Amber", value: "38 92% 50%", class: "bg-[#f59e0b]" },
    { name: "Violet", value: "262 83% 58%", class: "bg-[#8b5cf6]" },
    { name: "Sky", value: "199 89% 48%", class: "bg-[#0ea5e9]" },
]

export function ThemeCustomizer() {
    const { theme, setTheme } = useTheme()
    const [activeColor, setActiveColor] = useState("Indigo")

    const setPrimaryColor = (colorValue: string, name: string) => {
        document.documentElement.style.setProperty("--primary", colorValue)
        document.documentElement.style.setProperty("--ring", colorValue)
        setActiveColor(name)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="fixed bottom-8 right-8 h-14 w-14 rounded-2xl shadow-2xl bg-primary text-primary-foreground hover:bg-primary/90 border-none transition-all hover:scale-110 active:scale-95 z-50"
                >
                    <Settings2 className="h-6 w-6 animate-spin-slow" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-6 rounded-[2rem] shadow-3xl border-border/50 backdrop-blur-xl bg-background/95" align="end" sideOffset={16}>
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Palette className="w-4 h-4 text-primary" />
                            <h4 className="font-bold text-sm tracking-tight uppercase">Appearance</h4>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setTheme("light")}
                                className={cn(
                                    "flex flex-col gap-2 h-20 rounded-2xl border-2 transition-all",
                                    theme === "light" ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
                                )}
                            >
                                <Sun className="h-4 w-4" />
                                <span className="text-[10px] font-bold">Light</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setTheme("dark")}
                                className={cn(
                                    "flex flex-col gap-2 h-20 rounded-2xl border-2 transition-all",
                                    theme === "dark" ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
                                )}
                            >
                                <Moon className="h-4 w-4" />
                                <span className="text-[10px] font-bold">Dark</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setTheme("system")}
                                className={cn(
                                    "flex flex-col gap-2 h-20 rounded-2xl border-2 transition-all",
                                    theme === "system" ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
                                )}
                            >
                                <Monitor className="h-4 w-4" />
                                <span className="text-[10px] font-bold">System</span>
                            </Button>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Layout className="w-4 h-4 text-primary" />
                            <h4 className="font-bold text-sm tracking-tight uppercase">Accent Color</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => setPrimaryColor(color.value, color.name)}
                                    className={cn(
                                        "group relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all hover:bg-muted",
                                        activeColor === color.name ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                                    )}
                                >
                                    <div className={cn("h-8 w-8 rounded-xl shadow-inner", color.class)} />
                                    <span className="text-[10px] font-semibold">{color.name}</span>
                                    {activeColor === color.name && (
                                        <div className="absolute top-1 right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm">
                                            <Check className="w-2 h-2 text-primary" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                        <Button className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold text-xs h-10">
                            Save Preferences
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

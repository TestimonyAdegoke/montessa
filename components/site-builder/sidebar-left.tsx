"use client"

import React, { useState } from "react"
import { Block, GlobalStyles } from "./types"
import { BLOCK_DEFINITIONS, AVAILABLE_BLOCKS } from "./registry"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Layers, Search, Settings, ArrowUp, ArrowDown, Palette, Type, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Template, TEMPLATES } from "./templates"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Canvas } from "./canvas"

interface SidebarLeftProps {
    blocks: Block[]
    selectedBlockId: string | null
    onSelectBlock: (id: string | null) => void
    onAddBlock: (type: string) => void
    onDeleteBlock: (id: string) => void
    onReorderBlocks: (newBlocks: Block[]) => void
    onApplyTemplate: (template: Template) => void
    globalStyles?: GlobalStyles
    onGlobalStyleChange?: (styles: GlobalStyles) => void
}

const THEME_PRESETS = [
    {
        name: "Modern Minimal",
        primary: "#3b82f6",
        secondary: "#6366f1",
        background: "#ffffff",
        fontFamily: "Inter"
    },
    {
        name: "Classic Academic",
        primary: "#1e3a8a",
        secondary: "#94a3b8",
        background: "#f8fafc",
        fontFamily: "Playfair Display"
    },
    {
        name: "Dark Tech",
        primary: "#10b981",
        secondary: "#3b82f6",
        background: "#0f172a",
        fontFamily: "Outfit"
    },
    {
        name: "Warm Montessori",
        primary: "#f59e0b",
        secondary: "#fbbf24",
        background: "#fffbeb",
        fontFamily: "Poppins"
    },
    {
        name: "Elegant Arts",
        primary: "#db2777",
        secondary: "#f472b6",
        background: "#fafaf9",
        fontFamily: "Poppins"
    },
    {
        name: "Nordic Frost",
        primary: "#0f172a",
        secondary: "#334155",
        background: "#f1f5f9",
        fontFamily: "Inter"
    },
    {
        name: "Midnight Luxury",
        primary: "#8b5cf6",
        secondary: "#d946ef",
        background: "#020617",
        fontFamily: "Playfair Display"
    },
    {
        name: "Industrial Loft",
        primary: "#475569",
        secondary: "#64748b",
        background: "#f8fafc",
        fontFamily: "Outfit"
    },
    {
        name: "Tokyo Midnight",
        primary: "#f43f5e",
        secondary: "#fb7185",
        background: "#09090b",
        fontFamily: "Inter"
    },
    {
        name: "Swiss High-End",
        primary: "#000000",
        secondary: "#404040",
        background: "#ffffff",
        fontFamily: "Inter"
    }
]

export const SidebarLeft = ({ blocks, selectedBlockId, onSelectBlock, onAddBlock, onDeleteBlock, onReorderBlocks, onApplyTemplate, globalStyles, onGlobalStyleChange }: SidebarLeftProps) => {
    const [activeTab, setActiveTab] = useState("layers")
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    const handleBlockDragStart = (event: React.DragEvent<HTMLButtonElement>, type: string) => {
        event.dataTransfer.setData("site-builder/block-type", type)
        event.dataTransfer.effectAllowed = "copyMove"
    }

    const applyThemePreset = (preset: typeof THEME_PRESETS[0]) => {
        onGlobalStyleChange?.({
            ...globalStyles!,
            primaryColor: preset.primary,
            secondaryColor: preset.secondary,
            backgroundColor: preset.background,
            fontFamily: preset.fontFamily
        })
    }

    const handleMove = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return

        const newBlocks = [...blocks]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        const temp = newBlocks[index]
        newBlocks[index] = newBlocks[targetIndex]
        newBlocks[targetIndex] = temp

        onReorderBlocks(newBlocks)
    }

    return (
        <div className="w-[300px] border-r h-full bg-background z-[100] shrink-0 overflow-hidden select-none grid grid-rows-[60px,56px,1fr]">
            {/* 1. Header - Fixed height */}
            <div className="h-[60px] border-b flex items-center justify-between px-4 bg-card/30 shrink-0">
                <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-foreground/40">Site Builder</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-xl transition-colors">
                    <Settings className="h-4 w-4" />
                </Button>
            </div>

            {/* 2. Custom Navigation - Fixed height */}
            <div className="h-[56px] px-3 flex items-center bg-muted/10 border-b shrink-0">
                <div className="flex w-full bg-background p-1 rounded-xl border shadow-sm ring-1 ring-black/[0.03]">
                    {(['layers', 'insert', 'theme', 'templates'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 text-[9px] uppercase font-black tracking-widest py-2 rounded-xl transition-all duration-300",
                                activeTab === tab
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary/10 scale-[1.02]"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Content Area - ABSOLUTE STACK FOR RELIABLE HEIGHT */}
            <div className="flex-1 relative bg-background overflow-hidden min-h-0">
                {/* Each panel uses absolute inset-0 to force fill the flex-1 parent */}

                {/* LAYERS PANEL */}
                <div className={cn("absolute inset-0 flex flex-col min-h-0 transition-all duration-300", activeTab === 'layers' ? "opacity-100 z-10 visible translate-y-0" : "opacity-0 z-0 invisible translate-y-4 pointer-events-none")}>
                    <ScrollArea className="flex-1 h-full w-full">
                        <div className="p-3 space-y-1 pb-32">
                            {blocks.map((block, i) => {
                                const def = BLOCK_DEFINITIONS[block.type]
                                return (
                                    <div
                                        key={block.id}
                                        className={cn(
                                            "group flex items-center justify-between p-2.5 rounded-2xl text-[11px] border border-transparent hover:bg-muted/50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md",
                                            selectedBlockId === block.id && "bg-primary/[0.04] border-primary/20 text-primary font-bold ring-1 ring-primary/10"
                                        )}
                                        onClick={() => onSelectBlock(block.id)}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={cn(
                                            "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-all duration-300 border border-transparent",
                                            selectedBlockId === block.id ? "bg-primary/20 border-primary/20 scale-110 shadow-lg shadow-primary/10" : "bg-muted/80 group-hover:bg-muted"
                                        )}>
                                            {def?.icon && <def.icon className={cn("h-5 w-5 transition-colors duration-300", selectedBlockId === block.id ? "text-primary" : "opacity-40 group-hover:opacity-100")} />}
                                        </div>
                                            <span className="truncate tracking-tight font-medium uppercase opacity-80">{block.label || def?.label || block.type}</span>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 hover:text-primary rounded-lg" onClick={(e) => { e.stopPropagation(); handleMove(i, 'up') }}>
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 hover:text-primary rounded-lg" onClick={(e) => { e.stopPropagation(); handleMove(i, 'down') }}>
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id) }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}

                            {blocks.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-32 px-10 text-center animate-in fade-in duration-700">
                                    <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6 shadow-inner border border-black/[0.03]">
                                        <Layers className="h-10 w-10 text-muted-foreground opacity-10" />
                                    </div>
                                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground opacity-30">No Layers</p>
                                    <p className="text-xs text-muted-foreground mt-4 leading-relaxed font-medium">Add components to start designing</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* INSERT PANEL */}
                <div className={cn("absolute inset-0 flex flex-col min-h-0 overflow-hidden transition-all duration-300", activeTab === 'insert' ? "opacity-100 z-10 visible translate-y-0" : "opacity-0 z-0 invisible translate-y-4 pointer-events-none")}>
                    <div className="px-4 py-4 border-b bg-muted/5 shrink-0">
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <input
                                placeholder="Search blocks..."
                                className="w-full bg-background border border-muted-foreground/10 h-11 rounded-2xl pl-11 pr-4 text-xs focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all shadow-sm placeholder:text-muted-foreground/40 font-medium"
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1 h-full w-full">
                        <div className="p-4 grid grid-cols-2 gap-3 pb-32">
                            {AVAILABLE_BLOCKS.map((def) => (
                                <button
                                    key={def.type}
                                    draggable
                                    onDragStart={(e) => handleBlockDragStart(e, def.type)}
                                    className="flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] border border-muted-foreground/10 bg-card hover:border-primary/30 hover:bg-primary/[0.01] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group text-center active:scale-95 shadow-sm"
                                    onClick={() => onAddBlock(def.type)}
                                >
                                    <div className="h-14 w-full rounded-2xl border border-muted-foreground/10 bg-muted/5 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/[0.02] transition-all duration-500 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <def.icon className="h-6 w-6 text-muted-foreground/40 group-hover:text-primary transition-all duration-500 group-hover:scale-110" />
                                    </div>
                                    <span className="text-[10px] font-bold tracking-tight text-foreground/60 group-hover:text-primary transition-colors">{def.label}</span>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* TEMPLATES PANEL */}
                <div className={cn("absolute inset-0 flex flex-col min-h-0 overflow-hidden transition-all duration-300", activeTab === 'templates' ? "opacity-100 z-10 visible translate-y-0" : "opacity-0 z-0 invisible translate-y-4 pointer-events-none")}>
                    <ScrollArea className="flex-1 h-full w-full">
                        <div className="p-4 space-y-6 pb-32">
                            {TEMPLATES.length === 0 && (
                                <div className="py-32 text-center">
                                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground opacity-20">No designs</p>
                                </div>
                            )}
                            {TEMPLATES.map((template) => (
                                <button
                                    key={template.id}
                                    className="w-full group text-left flex flex-col border border-muted-foreground/10 rounded-[32px] overflow-hidden bg-card hover:border-primary/40 hover:shadow-2xl transition-all duration-700 shadow-xl active:scale-[0.97]"
                                    onClick={() => {
                                        setPreviewTemplate(template)
                                        setIsPreviewOpen(true)
                                    }}
                                >
                                    <div className="aspect-[16/10] w-full relative overflow-hidden bg-muted">
                                        <img
                                            src={template.thumbnail}
                                            alt={template.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                            onError={(e) => {
                                                const img = e.currentTarget
                                                img.onerror = null
                                                img.src = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop"
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 flex flex-col items-center justify-end pb-8 transition-all backdrop-blur-[1px]">
                                            <div className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.25em] shadow-2xl transform translate-y-6 group-hover:translate-y-0 transition-all duration-700 ring-4 ring-white/10 hover:scale-105 active:scale-95">
                                                Activate Theme
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-2 bg-gradient-to-b from-card to-background">
                                        <h3 className="font-black text-xs uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{template.name}</h3>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 italic font-medium opacity-70">
                                            {template.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* THEME PANEL */}
                <div className={cn("absolute inset-0 flex flex-col min-h-0 overflow-hidden transition-all duration-300", activeTab === 'theme' ? "opacity-100 z-10 visible translate-y-0" : "opacity-0 z-0 invisible translate-y-4 pointer-events-none")}>
                    <ScrollArea className="flex-1 h-full w-full">
                        <div className="p-6 space-y-12 pb-32">
                            {/* Theme Presets Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-foreground/80">Theme Presets</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {THEME_PRESETS.map((preset) => (
                                        <button
                                            key={preset.name}
                                            onClick={() => applyThemePreset(preset)}
                                            className="group flex items-center gap-4 p-3 rounded-2xl border bg-card hover:border-primary/30 transition-all hover:shadow-md text-left"
                                        >
                                            <div className="flex -space-x-2 shrink-0">
                                                <div className="w-8 h-8 rounded-full border-2 border-background" style={{ backgroundColor: preset.primary }} />
                                                <div className="w-8 h-8 rounded-full border-2 border-background" style={{ backgroundColor: preset.secondary }} />
                                                <div className="w-8 h-8 rounded-full border-2 border-background" style={{ backgroundColor: preset.background }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold uppercase tracking-tight truncate">{preset.name}</p>
                                                <p className="text-[9px] text-muted-foreground font-medium">{preset.fontFamily}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Separator className="opacity-20" />

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                                        <Palette className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-foreground/80">Global Branding</h3>
                                </div>
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 ml-1">Signature Color</Label>
                                        <div className="flex gap-4 items-center">
                                            <div className="h-14 w-14 rounded-[20px] shadow-2xl border-4 border-background overflow-hidden relative shrink-0 active:scale-90 transition-transform cursor-pointer ring-1 ring-black/10">
                                                <input
                                                    type="color"
                                                    value={globalStyles?.primaryColor || "#000000"}
                                                    onChange={(e) => onGlobalStyleChange?.({ ...globalStyles!, primaryColor: e.target.value })}
                                                    className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer opacity-0"
                                                />
                                                <div className="w-full h-full" style={{ backgroundColor: globalStyles?.primaryColor || "#000000" }} />
                                            </div>
                                            <div className="flex-1 relative group">
                                                <Input
                                                    value={globalStyles?.primaryColor || ""}
                                                    onChange={(e) => onGlobalStyleChange?.({ ...globalStyles!, primaryColor: e.target.value })}
                                                    className="h-12 text-xs font-mono font-bold rounded-[18px] border-muted-foreground/10 bg-muted/20 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all pl-5"
                                                    placeholder="#HEX_CODE"
                                                />
                                                <div className="absolute right-4 top-4 h-4 w-4 rounded-full border shadow-inner opacity-40" style={{ backgroundColor: globalStyles?.primaryColor }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 ml-1">Accent Contrast</Label>
                                        <div className="flex gap-4 items-center">
                                            <div className="h-14 w-14 rounded-[20px] shadow-2xl border-4 border-background overflow-hidden relative shrink-0 active:scale-90 transition-transform cursor-pointer ring-1 ring-black/10">
                                                <input
                                                    type="color"
                                                    value={globalStyles?.secondaryColor || "#000000"}
                                                    onChange={(e) => onGlobalStyleChange?.({ ...globalStyles!, secondaryColor: e.target.value })}
                                                    className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer opacity-0"
                                                />
                                                <div className="w-full h-full" style={{ backgroundColor: globalStyles?.secondaryColor || "#000000" }} />
                                            </div>
                                            <div className="flex-1 relative group">
                                                <Input
                                                    value={globalStyles?.secondaryColor || ""}
                                                    onChange={(e) => onGlobalStyleChange?.({ ...globalStyles!, secondaryColor: e.target.value })}
                                                    className="h-12 text-xs font-mono font-bold rounded-[18px] border-muted-foreground/10 bg-muted/20 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all pl-5"
                                                    placeholder="#HEX_CODE"
                                                />
                                                <div className="absolute right-4 top-4 h-4 w-4 rounded-full border shadow-inner opacity-40" style={{ backgroundColor: globalStyles?.secondaryColor }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="opacity-20" />

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                                        <Type className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-foreground/80">Typography</h3>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 ml-1">Universal Font Stack</Label>
                                    <Select
                                        value={globalStyles?.fontFamily}
                                        onValueChange={(val) => onGlobalStyleChange?.({ ...globalStyles!, fontFamily: val })}
                                    >
                                        <SelectTrigger className="h-14 text-xs font-bold rounded-2xl shadow-sm border-muted-foreground/10 bg-muted/20 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-5">
                                            <SelectValue placeholder="Select curated font" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-[24px] shadow-2xl border-muted ring-1 ring-black/5 overflow-hidden">
                                            <SelectItem value="Inter" className="text-xs py-4 px-5">Inter (Standard Modern)</SelectItem>
                                            <SelectItem value="Poppins" className="text-xs py-4 px-5" style={{ fontFamily: 'Poppins' }}>Poppins (Friendly & Bold)</SelectItem>
                                            <SelectItem value="Roboto" className="text-xs py-4 px-5" style={{ fontFamily: 'Roboto' }}>Roboto (Clean Geometric)</SelectItem>
                                            <SelectItem value="Playfair Display" className="text-xs py-4 px-5" style={{ fontFamily: 'Playfair Display' }}>Playfair (Prestigious Serif)</SelectItem>
                                            <SelectItem value="Outfit" className="text-xs py-4 px-5" style={{ fontFamily: 'Outfit' }}>Outfit (High-End Tech)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Template Full-Screen Preview */}
            <Dialog open={isPreviewOpen} onOpenChange={(open) => {
                setIsPreviewOpen(open)
                if (!open) setPreviewTemplate(null)
            }}>
                <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 overflow-hidden flex flex-col rounded-3xl">
                    <DialogHeader className="px-6 pt-4 pb-3 border-b bg-background/80 backdrop-blur-sm flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-base font-bold tracking-tight">{previewTemplate?.name}</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground max-w-xl">
                                Preview this template in an interactive viewport. Your current design will not change until you confirm.
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            {previewTemplate && (
                                <Button
                                    size="sm"
                                    className="rounded-xl"
                                    onClick={() => {
                                        onApplyTemplate(previewTemplate)
                                        setIsPreviewOpen(false)
                                        setPreviewTemplate(null)
                                    }}
                                >
                                    Use this template
                                </Button>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="flex-1 bg-muted/20 p-2 overflow-hidden flex">
                        <div className="w-full h-full rounded-xl border bg-background shadow-2xl overflow-auto">
                            {previewTemplate && (
                                <div className="min-h-full">
                                    {previewTemplate.blocks.map((block) => {
                                        const def = BLOCK_DEFINITIONS[block.type]
                                        if (!def) return null
                                        const Component = def.component
                                        return (
                                            <Component
                                                key={block.id}
                                                block={block}
                                                onChange={() => {}}
                                                selected={false}
                                            />
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

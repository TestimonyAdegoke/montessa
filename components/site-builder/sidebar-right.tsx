"use client"

import { Block, PropSchema } from "./types"
import { BLOCK_DEFINITIONS } from "./registry"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import FileUpload from "@/components/common/file-upload"
import { cn } from "@/lib/utils"
import { Palette, Plus, Trash2, Star, Zap, Heart, Shield, Award, Target, Lightbulb, Rocket, Globe, Users, BookOpen, GraduationCap, Building, Phone, Mail, MapPin, Clock, Calendar, Check, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Default icon library for blocks
const ICON_LIBRARY = [
    { name: "star", icon: Star, label: "Star" },
    { name: "zap", icon: Zap, label: "Lightning" },
    { name: "heart", icon: Heart, label: "Heart" },
    { name: "shield", icon: Shield, label: "Shield" },
    { name: "award", icon: Award, label: "Award" },
    { name: "target", icon: Target, label: "Target" },
    { name: "lightbulb", icon: Lightbulb, label: "Idea" },
    { name: "rocket", icon: Rocket, label: "Rocket" },
    { name: "globe", icon: Globe, label: "Globe" },
    { name: "users", icon: Users, label: "Users" },
    { name: "book", icon: BookOpen, label: "Book" },
    { name: "graduation", icon: GraduationCap, label: "Education" },
    { name: "building", icon: Building, label: "Building" },
    { name: "phone", icon: Phone, label: "Phone" },
    { name: "mail", icon: Mail, label: "Email" },
    { name: "location", icon: MapPin, label: "Location" },
    { name: "clock", icon: Clock, label: "Clock" },
    { name: "calendar", icon: Calendar, label: "Calendar" },
    { name: "check", icon: Check, label: "Check" },
]

interface SidebarRightProps {
    selectedBlock: Block | null
    onBlockChange: (id: string, newProps: any) => void
}

export const SidebarRight = ({ selectedBlock, onBlockChange }: SidebarRightProps) => {
    if (!selectedBlock) {
        return (
            <div className="w-[300px] border-l h-full bg-background/50 backdrop-blur-sm p-6 text-center text-muted-foreground text-sm shrink-0 flex flex-col items-center justify-center">
                Select a block in the Canvas to edit its properties.
            </div>
        )
    }

    const def = BLOCK_DEFINITIONS[selectedBlock.type]
    if (!def) return null

    const Icon = def.icon

    const handlePropChange = (key: string, value: any) => {
        let newProps = { ...selectedBlock.props, [key]: value }

        // Intelligent sync for background settings across blocks
        if (key === "backgroundColor" && value && value !== "transparent") {
            newProps.backgroundType = "color"
        } else if (key === "backgroundGradient" && value && value !== "none" && value !== "") {
            newProps.backgroundType = "gradient"
        } else if (key === "backgroundImage" && value) {
            // When a background image is uploaded, automatically switch to image mode
            newProps.backgroundType = "image"
        } else if (key === "backgroundVideo" && value) {
            // Video URL should switch background to video mode
            newProps.backgroundType = "video"
        }

        onBlockChange(selectedBlock.id, newProps)
    }

    const groups = def.propSchema.reduce((acc, schema) => {
        const group = schema.group || "Content"
        if (!acc[group]) acc[group] = []
        acc[group].push(schema)
        return acc
    }, {} as Record<string, PropSchema[]>)

    const renderInput = (schema: PropSchema) => {
        const value = selectedBlock.props[schema.name]

        switch (schema.type) {
            case "text":
                return <Input value={value || ""} onChange={(e) => handlePropChange(schema.name, e.target.value)} className="h-9 rounded-xl text-xs border-muted-foreground/10 focus:ring-primary/20" />
            case "textarea":
                return <Textarea value={value || ""} onChange={(e) => handlePropChange(schema.name, e.target.value)} className="text-xs min-h-[100px] rounded-xl border-muted-foreground/10 focus:ring-primary/20" />
            case "number":
                return (
                    <Input 
                        type="number" 
                        value={value ?? schema.default ?? 0} 
                        min={schema.min} 
                        max={schema.max} 
                        step={schema.step}
                        onChange={(e) => handlePropChange(schema.name, parseFloat(e.target.value))} 
                        className="h-9 rounded-xl text-xs font-mono border-muted-foreground/10 focus:ring-primary/20" 
                    />
                )
            case "gradient":
                const gradients = [
                    "linear-gradient(to right, #3b82f6, #6366f1)",
                    "linear-gradient(to right, #10b981, #3b82f6)",
                    "linear-gradient(to right, #f59e0b, #ef4444)",
                    "linear-gradient(to right, #8b5cf6, #ec4899)",
                    "linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)",
                    "linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)",
                    "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
                    "linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)",
                    "linear-gradient(to top, #30cfd0 0%, #330867 100%)",
                    "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
                    "linear-gradient(to right, #43e97b 0%, #38f9d7 100%)",
                    "linear-gradient(to right, #fa709a 0%, #fee140 100%)",
                    "linear-gradient(to top, #505285 0%, #585e92 12%, #65689e 25%, #7474b0 37%, #7e7ebb 50%, #8389c7 62%, #9795d4 75%, #a2a1dc 87%, #b5aee4 100%)",
                    "none"
                ]
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-2">
                            {gradients.map((g) => (
                                <button
                                    key={g}
                                    onClick={() => handlePropChange(schema.name, g)}
                                    className={cn(
                                        "h-10 rounded-xl border border-black/5 shadow-sm transition-all hover:scale-110 active:scale-95 overflow-hidden relative",
                                        value === g && "ring-2 ring-primary ring-offset-1"
                                    )}
                                    style={{ background: g === "none" ? "#f1f5f9" : g }}
                                    title={g}
                                >
                                    {g === "none" && <span className="text-[8px] uppercase font-black text-muted-foreground/40">None</span>}
                                    {value === g && g !== "none" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        
                        <div className="p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5 space-y-4">
                            <div className="flex items-center gap-2">
                                <Palette className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Gradient Builder</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/60 ml-1">Start Color</Label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="color" 
                                            defaultValue="#3b82f6"
                                            onChange={(e) => {
                                                const end = (value?.match(/#[a-f\d]{6}/gi) || ["#3b82f6", "#6366f1"])[1] || "#6366f1";
                                                handlePropChange(schema.name, `linear-gradient(to right, ${e.target.value}, ${end})`);
                                            }}
                                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                                        />
                                        <Input className="h-8 text-[10px] font-mono rounded-lg" placeholder="#HEX" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/60 ml-1">End Color</Label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="color" 
                                            defaultValue="#6366f1"
                                            onChange={(e) => {
                                                const start = (value?.match(/#[a-f\d]{6}/gi) || ["#3b82f6", "#6366f1"])[0] || "#3b82f6";
                                                handlePropChange(schema.name, `linear-gradient(to right, ${start}, ${e.target.value})`);
                                            }}
                                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                                        />
                                        <Input className="h-8 text-[10px] font-mono rounded-lg" placeholder="#HEX" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/60 ml-1">Custom CSS</Label>
                                <Input 
                                    value={value || ""} 
                                    onChange={(e) => handlePropChange(schema.name, e.target.value)}
                                    placeholder="linear-gradient(...)"
                                    className="h-9 text-[10px] font-mono rounded-xl bg-background/50"
                                />
                            </div>
                        </div>
                    </div>
                )
            case "color":
                return (
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <div className="h-10 w-10 rounded-xl border-2 border-muted-foreground/10 overflow-hidden relative shrink-0 shadow-inner group transition-all hover:border-primary/30">
                                <input 
                                    type="color" 
                                    value={value || "#000000"} 
                                    onChange={(e) => handlePropChange(schema.name, e.target.value)} 
                                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer opacity-0" 
                                />
                                <div className="w-full h-full transition-transform group-active:scale-90" style={{ backgroundColor: value || "#000000" }} />
                            </div>
                            <div className="flex-1 space-y-1.5 min-w-0">
                                <Input 
                                    value={value || ""} 
                                    onChange={(e) => handlePropChange(schema.name, e.target.value)} 
                                    className="h-10 text-xs font-mono font-bold rounded-xl border-muted-foreground/10 focus:ring-primary/20"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                        {/* Quick Swatches */}
                        <div className="flex flex-wrap gap-1.5">
                            {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ffffff', '#000000'].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => handlePropChange(schema.name, c)}
                                    className={cn(
                                        "w-5 h-5 rounded-full border border-black/5 shadow-sm transition-transform hover:scale-125 active:scale-90",
                                        value === c && "ring-2 ring-primary ring-offset-1"
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                )
            case "boolean":
                return (
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-normal text-muted-foreground">{schema.label}</Label>
                        <Switch checked={!!value} onCheckedChange={(val) => handlePropChange(schema.name, val)} />
                    </div>
                )
            case "select":
                return (
                    <Select value={value} onValueChange={(val) => handlePropChange(schema.name, val)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {schema.options?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )
            case "image":
                return (
                    <FileUpload
                        value={value}
                        onChange={(url) => handlePropChange(schema.name, url)}
                        folder="site-builder"
                        label={`Upload ${schema.label}`}
                        preview="image"
                        className="scale-90 origin-top-left"
                    />
                )
            case "array":
                // Universal array editor for all block types with arrayItemSchema
                if (schema.arrayItemSchema && schema.arrayItemSchema.length > 0) {
                    const items = (value as any[]) || []

                    const updateItem = (index: number, field: string, fieldValue: any) => {
                        const next = [...items]
                        next[index] = { ...(next[index] || {}), [field]: fieldValue }
                        handlePropChange(schema.name, next)
                    }

                    const removeItem = (index: number) => {
                        const next = [...items]
                        next.splice(index, 1)
                        handlePropChange(schema.name, next)
                    }

                    const addItem = () => {
                        const newItem: any = {}
                        schema.arrayItemSchema?.forEach(field => {
                            newItem[field.name] = field.default || ""
                        })
                        handlePropChange(schema.name, [...items, newItem])
                    }

                    return (
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <Collapsible key={index} defaultOpen={index === 0}>
                                    <div className="rounded-xl border border-muted-foreground/10 bg-muted/10 overflow-hidden">
                                        <CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                                {item.title || item.label || item.name || `Item ${index + 1}`}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => { e.stopPropagation(); removeItem(index) }}
                                                    type="button"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="p-3 pt-0 space-y-3 border-t border-muted-foreground/5">
                                                {schema.arrayItemSchema?.map((fieldSchema) => (
                                                    <div key={fieldSchema.name} className="space-y-1.5">
                                                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                                                            {fieldSchema.label}
                                                        </Label>
                                                        {fieldSchema.type === "text" && (
                                                            <Input
                                                                value={item[fieldSchema.name] || ""}
                                                                onChange={(e) => updateItem(index, fieldSchema.name, e.target.value)}
                                                                className="h-8 text-[11px] rounded-lg border-muted-foreground/10"
                                                                placeholder={fieldSchema.label}
                                                            />
                                                        )}
                                                        {fieldSchema.type === "textarea" && (
                                                            <Textarea
                                                                value={item[fieldSchema.name] || ""}
                                                                onChange={(e) => updateItem(index, fieldSchema.name, e.target.value)}
                                                                className="text-[11px] min-h-[60px] rounded-lg border-muted-foreground/10"
                                                                placeholder={fieldSchema.label}
                                                            />
                                                        )}
                                                        {fieldSchema.type === "image" && (
                                                            <FileUpload
                                                                value={item[fieldSchema.name] || ""}
                                                                onChange={(url) => updateItem(index, fieldSchema.name, url)}
                                                                folder="site-builder"
                                                                label={fieldSchema.label}
                                                                preview="image"
                                                                className="scale-95 origin-top-left"
                                                            />
                                                        )}
                                                        {fieldSchema.type === "boolean" && (
                                                            <div className="flex items-center gap-2">
                                                                <Switch
                                                                    checked={!!item[fieldSchema.name]}
                                                                    onCheckedChange={(val) => updateItem(index, fieldSchema.name, val)}
                                                                />
                                                                <span className="text-[10px] text-muted-foreground">{fieldSchema.label}</span>
                                                            </div>
                                                        )}
                                                        {fieldSchema.type === "number" && (
                                                            <Input
                                                                type="number"
                                                                value={item[fieldSchema.name] ?? fieldSchema.default ?? 0}
                                                                min={fieldSchema.min}
                                                                max={fieldSchema.max}
                                                                onChange={(e) => updateItem(index, fieldSchema.name, parseFloat(e.target.value))}
                                                                className="h-8 text-[11px] rounded-lg border-muted-foreground/10"
                                                            />
                                                        )}
                                                        {fieldSchema.type === "select" && fieldSchema.options && (
                                                            <Select
                                                                value={item[fieldSchema.name] || ""}
                                                                onValueChange={(val) => updateItem(index, fieldSchema.name, val)}
                                                            >
                                                                <SelectTrigger className="h-8 text-[11px] rounded-lg">
                                                                    <SelectValue placeholder={fieldSchema.label} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {fieldSchema.options.map((opt) => (
                                                                        <SelectItem key={opt.value} value={opt.value} className="text-[11px]">
                                                                            {opt.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                        {fieldSchema.name === "icon" && (
                                                            <div className="space-y-2">
                                                                <div className="grid grid-cols-6 gap-1">
                                                                    {ICON_LIBRARY.map((iconDef) => {
                                                                        const IconComp = iconDef.icon
                                                                        return (
                                                                            <button
                                                                                key={iconDef.name}
                                                                                type="button"
                                                                                onClick={() => updateItem(index, fieldSchema.name, iconDef.name)}
                                                                                className={cn(
                                                                                    "h-8 w-8 rounded-lg flex items-center justify-center transition-all hover:bg-primary/10",
                                                                                    item[fieldSchema.name] === iconDef.name && "bg-primary/20 ring-2 ring-primary"
                                                                                )}
                                                                                title={iconDef.label}
                                                                            >
                                                                                <IconComp className="h-4 w-4" />
                                                                            </button>
                                                                        )
                                                                    })}
                                                                </div>
                                                                <FileUpload
                                                                    value={item.customIcon || ""}
                                                                    onChange={(url) => updateItem(index, "customIcon", url)}
                                                                    folder="site-builder"
                                                                    label="Or upload custom icon"
                                                                    preview="image"
                                                                    className="scale-90 origin-top-left"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                
                                                {/* Mega Menu Sub-Items Editor */}
                                                {item.isMegaMenu && (
                                                    <div className="mt-4 pt-4 border-t border-dashed border-muted-foreground/20">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <Label className="text-[9px] font-bold uppercase tracking-widest text-primary/80">
                                                                Mega Menu Items
                                                            </Label>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 px-2 text-[9px] font-bold uppercase"
                                                                onClick={() => {
                                                                    const subItems = item.subItems || []
                                                                    updateItem(index, "subItems", [...subItems, { label: "New Link", href: "#", description: "" }])
                                                                }}
                                                            >
                                                                <Plus className="h-3 w-3 mr-1" /> Add
                                                            </Button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {(item.subItems || []).map((subItem: any, subIndex: number) => (
                                                                <div key={subIndex} className="p-2 rounded-lg bg-muted/30 border border-muted-foreground/10 space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[9px] font-bold uppercase text-muted-foreground/60">Link {subIndex + 1}</span>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                                                            onClick={() => {
                                                                                const subItems = [...(item.subItems || [])]
                                                                                subItems.splice(subIndex, 1)
                                                                                updateItem(index, "subItems", subItems)
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                    <Input
                                                                        value={subItem.label || ""}
                                                                        onChange={(e) => {
                                                                            const subItems = [...(item.subItems || [])]
                                                                            subItems[subIndex] = { ...subItems[subIndex], label: e.target.value }
                                                                            updateItem(index, "subItems", subItems)
                                                                        }}
                                                                        placeholder="Link Label"
                                                                        className="h-7 text-[10px] rounded-md"
                                                                    />
                                                                    <Input
                                                                        value={subItem.href || ""}
                                                                        onChange={(e) => {
                                                                            const subItems = [...(item.subItems || [])]
                                                                            subItems[subIndex] = { ...subItems[subIndex], href: e.target.value }
                                                                            updateItem(index, "subItems", subItems)
                                                                        }}
                                                                        placeholder="URL or #section"
                                                                        className="h-7 text-[10px] rounded-md font-mono"
                                                                    />
                                                                    <Input
                                                                        value={subItem.description || ""}
                                                                        onChange={(e) => {
                                                                            const subItems = [...(item.subItems || [])]
                                                                            subItems[subIndex] = { ...subItems[subIndex], description: e.target.value }
                                                                            updateItem(index, "subItems", subItems)
                                                                        }}
                                                                        placeholder="Description (optional)"
                                                                        className="h-7 text-[10px] rounded-md"
                                                                    />
                                                                </div>
                                                            ))}
                                                            {(!item.subItems || item.subItems.length === 0) && (
                                                                <p className="text-[10px] text-muted-foreground/50 text-center py-2 italic">
                                                                    No sub-items yet. Click "Add" to create mega menu links.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full rounded-xl text-[10px] font-bold uppercase tracking-widest gap-1"
                                onClick={addItem}
                            >
                                <Plus className="h-3 w-3" />
                                Add {schema.label?.replace(/s$/, "") || "Item"}
                            </Button>
                        </div>
                    )
                }

                // Default fallback for arrays without schema
                return (
                    <div className="border rounded-md p-2 bg-muted/20 text-xs text-muted-foreground">
                        Array editing is handled in Canvas or specifically configured components.
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="w-[300px] border-l h-full bg-background/50 backdrop-blur-sm flex flex-col shrink-0 z-50">
            <div className="h-14 border-b px-4 flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <h3 className="font-bold text-xs tracking-wide uppercase leading-none">{def.label}</h3>
                    <span className="text-[9px] text-muted-foreground font-mono mt-1 opacity-60">ID: {selectedBlock.id.slice(0, 8)}</span>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-8 pb-32">
                    {Object.entries(groups).map(([groupName, schemas]) => (
                        <div key={groupName} className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-primary" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{groupName}</h4>
                            </div>
                            <div className="space-y-5">
                                {schemas.map((schema) => (
                                    <div key={schema.name} className="space-y-2">
                                        {schema.type !== "boolean" && (
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">{schema.label}</Label>
                                        )}
                                        {renderInput(schema)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <Separator className="opacity-20" />

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Advanced</h4>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Custom CSS Class</Label>
                            <Input
                                value={selectedBlock.props.className || ""}
                                onChange={(e) => handlePropChange("className", e.target.value)}
                                placeholder="e.g. custom-section"
                                className="h-9 rounded-xl text-xs font-mono border-muted-foreground/10 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}

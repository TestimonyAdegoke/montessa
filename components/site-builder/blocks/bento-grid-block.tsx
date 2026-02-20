"use client"

import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"

interface BentoGridBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const BentoGridBlock = ({ block, onChange, selected }: BentoGridBlockProps) => {
    const {
        title,
        subtitle,
        items = [],
        backgroundType = "color",
        backgroundColor = "transparent",
        backgroundGradient,
        backgroundPattern = "none",
        animation = "slideUp",
        paddingTop = "py-24",
        paddingBottom = "py-24"
    } = block.props

    const handleChange = (key: string, value: any) => {
        onChange(block.id, { ...block.props, [key]: value })
    }

    const handleItemUpdate = (index: number, field: string, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        handleChange("items", newItems)
    }

    const addItem = () => {
        handleChange("items", [...items, { title: "New Item", description: "Description here...", span: "1x1", accent: "primary" }])
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.2 }
        }
    }

    const itemVariants = {
        none: { opacity: 1, y: 0 },
        fade: {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5 } }
        },
        slideUp: {
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
        },
        zoom: {
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
        }
    }

    const getItemVariants = () => {
        if (animation === "none") return itemVariants.none
        return itemVariants[animation as keyof typeof itemVariants] || itemVariants.fade
    }

    const getSpanClasses = (span: string) => {
        switch (span) {
            case "2x1": return "md:col-span-2"
            case "1x2": return "md:row-span-2"
            case "2x2": return "md:col-span-2 md:row-span-2"
            default: return ""
        }
    }

    const accentColors: Record<string, string> = {
        primary: "from-primary/20 to-primary/5 border-primary/20",
        blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
        green: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
        purple: "from-violet-500/20 to-violet-500/5 border-violet-500/20",
        orange: "from-orange-500/20 to-orange-500/5 border-orange-500/20",
        pink: "from-pink-500/20 to-pink-500/5 border-pink-500/20",
    }

    return (
        <section
            className={cn(
                "px-6 md:px-12 relative overflow-hidden",
                paddingTop,
                paddingBottom,
                selected && "ring-2 ring-primary ring-offset-2"
            )}
            style={{
                backgroundColor: backgroundType === "color" ? backgroundColor : undefined,
                background: backgroundType === "gradient" ? backgroundGradient : undefined
            }}
        >
            {backgroundPattern !== "none" && (
                <div className={cn(
                    "absolute inset-0 opacity-[0.03]",
                    backgroundPattern === "dots" && "bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]",
                    backgroundPattern === "grid" && "bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:40px_40px]",
                    backgroundPattern === "mesh" && "bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%,transparent)] [background-size:20px_20px]",
                    backgroundPattern === "waves" && "bg-[radial-gradient(circle_at_0_50%,transparent_9px,#000_10px,transparent_11px),radial-gradient(circle_at_100%_50%,transparent_9px,#000_10px,transparent_11px)] [background-size:20px_40px]"
                )} />
            )}

            <div className="max-w-7xl mx-auto space-y-16">
                {/* Header */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={getItemVariants() as any}
                    className="text-center max-w-2xl mx-auto space-y-4"
                >
                    {subtitle && (
                        <InlineText
                            value={subtitle}
                            onChange={(val) => handleChange("subtitle", val)}
                            tagName="p"
                            className="text-sm font-bold uppercase tracking-widest text-primary"
                            editable={selected}
                        />
                    )}
                    <InlineText
                        value={title}
                        onChange={(val) => handleChange("title", val)}
                        tagName="h2"
                        className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]"
                        editable={selected}
                    />
                </motion.div>

                {/* Bento Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]"
                >
                    {items.map((item: any, i: number) => (
                        <motion.div
                            key={i}
                            variants={getItemVariants() as any}
                            className={cn(
                                "relative group rounded-3xl border p-8 overflow-hidden bg-gradient-to-br transition-all duration-500 hover:shadow-xl hover:-translate-y-1",
                                getSpanClasses(item.span || "1x1"),
                                accentColors[item.accent || "primary"] || accentColors.primary
                            )}
                        >
                            {/* Decorative gradient blob */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="space-y-3">
                                    {item.icon && (
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                            <div className="w-5 h-5 bg-primary rounded-lg opacity-60" />
                                        </div>
                                    )}
                                    <InlineText
                                        value={item.title}
                                        onChange={(val) => handleItemUpdate(i, "title", val)}
                                        tagName="h3"
                                        className="text-xl font-bold tracking-tight"
                                        editable={selected}
                                    />
                                    <InlineText
                                        value={item.description}
                                        onChange={(val) => handleItemUpdate(i, "description", val)}
                                        tagName="p"
                                        className="text-sm text-muted-foreground leading-relaxed"
                                        multiline
                                        editable={selected}
                                    />
                                </div>

                                {item.image && (
                                    <div className="mt-6 rounded-2xl overflow-hidden">
                                        <img src={item.image} alt={item.title} className="w-full h-auto object-cover" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {selected && (
                        <motion.div
                            variants={getItemVariants() as any}
                            className="flex items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer hover:border-primary/50 transition-all min-h-[200px] opacity-50 hover:opacity-100"
                            onClick={addItem}
                        >
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold tracking-tight">Add Item</span>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}

export const bentoGridBlockSchema: PropSchema[] = [
    { name: "title", label: "Heading", type: "text", group: "Content" },
    { name: "subtitle", label: "Subtitle", type: "text", group: "Content" },
    {
        name: "items",
        label: "Grid Items",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "title", label: "Title", type: "text" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "image", label: "Image", type: "image" },
            {
                name: "span",
                label: "Size",
                type: "select",
                options: [
                    { label: "Normal (1×1)", value: "1x1" },
                    { label: "Wide (2×1)", value: "2x1" },
                    { label: "Tall (1×2)", value: "1x2" },
                    { label: "Large (2×2)", value: "2x2" }
                ]
            },
            {
                name: "accent",
                label: "Accent Color",
                type: "select",
                options: [
                    { label: "Primary", value: "primary" },
                    { label: "Blue", value: "blue" },
                    { label: "Green", value: "green" },
                    { label: "Purple", value: "purple" },
                    { label: "Orange", value: "orange" },
                    { label: "Pink", value: "pink" }
                ]
            }
        ]
    },
    {
        name: "backgroundType",
        label: "Background Type",
        type: "select",
        group: "Style",
        options: [
            { label: "Transparent", value: "color" },
            { label: "Solid Color", value: "color" },
            { label: "Gradient", value: "gradient" }
        ],
        default: "color"
    },
    { name: "backgroundColor", label: "Background Color", type: "color", group: "Style" },
    { name: "backgroundGradient", label: "Background Gradient", type: "gradient", group: "Style" },
    {
        name: "backgroundPattern",
        label: "Background Pattern",
        type: "select",
        group: "Style",
        options: [
            { label: "None", value: "none" },
            { label: "Dots", value: "dots" },
            { label: "Grid", value: "grid" },
            { label: "Mesh", value: "mesh" },
            { label: "Waves", value: "waves" }
        ],
        default: "none"
    },
    {
        name: "animation",
        label: "Entrance Animation",
        type: "select",
        group: "Style",
        options: [
            { label: "Fade In", value: "fade" },
            { label: "Slide Up", value: "slideUp" },
            { label: "Zoom In", value: "zoom" },
            { label: "None", value: "none" }
        ],
        default: "slideUp"
    },
    {
        name: "paddingTop",
        label: "Top Padding",
        type: "select",
        group: "Layout",
        options: [
            { label: "None", value: "py-0" },
            { label: "Small", value: "py-16" },
            { label: "Medium", value: "py-24" },
            { label: "Large", value: "py-32" }
        ],
        default: "py-24"
    },
    {
        name: "paddingBottom",
        label: "Bottom Padding",
        type: "select",
        group: "Layout",
        options: [
            { label: "None", value: "py-0" },
            { label: "Small", value: "py-16" },
            { label: "Medium", value: "py-24" },
            { label: "Large", value: "py-32" }
        ],
        default: "py-24"
    }
]

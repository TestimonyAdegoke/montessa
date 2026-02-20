"use client"

import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { motion } from "framer-motion"

interface StatsBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const StatsBlock = ({ block, onChange, selected }: StatsBlockProps) => {
    const { 
        stats = [], 
        backgroundType = "color",
        backgroundColor = "transparent",
        backgroundGradient,
        backgroundBlur = 0,
        backgroundPattern = "none",
        showOverlay = false,
        overlayOpacity = 50,
        paddingTop = "py-24",
        paddingBottom = "py-24",
        animation = "fade",
        columns = 4
    } = block.props

    const handleChange = (key: string, value: any) => {
        onChange(block.id, { ...block.props, [key]: value })
    }

    const handleStatUpdate = (index: number, field: string, value: any) => {
        const newStats = [...stats]
        newStats[index] = { ...newStats[index], [field]: value }
        handleChange("stats", newStats)
    }

    const variants = {
        none: { opacity: 1, y: 0 },
        fade: { opacity: 0 },
        slideUp: { opacity: 0, y: 30 },
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    }

    const itemVariants = {
        none: { opacity: 1, y: 0, scale: 1 },
        fade: { 
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5 } }
        },
        slideUp: { 
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
        },
        zoom: { 
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
        }
    }

    const getItemVariants = () => {
        if (animation === "none") return itemVariants.none;
        return itemVariants[animation as keyof typeof itemVariants] || itemVariants.fade;
    }

    return (
        <section 
            className={cn(
                "px-4 sm:px-6 md:px-12 relative overflow-hidden",
                "py-16 md:py-24",
                selected && "ring-2 ring-primary ring-offset-2"
            )}
            style={{ 
                backgroundColor: backgroundType === 'color' ? backgroundColor : undefined,
                background: backgroundType === 'gradient' ? backgroundGradient : undefined
            }}
        >
            {/* Background Effects Layer */}
            <div className="absolute inset-0 -z-10" style={{ filter: backgroundBlur > 0 ? `blur(${backgroundBlur}px)` : undefined }}>
                {backgroundPattern !== "none" && (
                    <div className={cn(
                        "absolute inset-0 opacity-[0.03]",
                        backgroundPattern === "dots" && "bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]",
                        backgroundPattern === "grid" && "bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:40px_40px]",
                        backgroundPattern === "mesh" && "bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%,transparent)] [background-size:20px_20px]",
                        backgroundPattern === "waves" && "bg-[radial-gradient(circle_at_0_50%,transparent_9px,#000_10px,transparent_11px),radial-gradient(circle_at_100%_50%,transparent_9px,#000_10px,transparent_11px)] [background-size:20px_40px]"
                    )} />
                )}
                {showOverlay && (
                    <div 
                        className="absolute inset-0 bg-black" 
                        style={{ opacity: overlayOpacity / 100 }}
                    />
                )}
            </div>
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={cn(
                        "grid gap-8 md:gap-12",
                        "grid-cols-1 sm:grid-cols-2",
                        columns === 3 && "lg:grid-cols-3",
                        columns === 4 && "lg:grid-cols-4"
                    )}
                >
                    {stats.map((stat: any, i: number) => (
                        <motion.div 
                            key={i}
                            variants={getItemVariants() as any}
                            className="flex flex-col items-center text-center space-y-2"
                        >
                            <div className="flex items-baseline gap-1">
                                <InlineText
                                    value={stat.value}
                                    onChange={(val) => handleStatUpdate(i, "value", val)}
                                    tagName="span"
                                    className="font-black tracking-tighter text-primary"
                                    style={{ fontSize: 'clamp(36px, 8vw, 64px)' }}
                                    editable={selected}
                                />
                                <InlineText
                                    value={stat.suffix}
                                    onChange={(val) => handleStatUpdate(i, "suffix", val)}
                                    tagName="span"
                                    className="font-bold text-primary/60"
                                    style={{ fontSize: 'clamp(18px, 3vw, 28px)' }}
                                    editable={selected}
                                />
                            </div>
                            <InlineText
                                value={stat.label}
                                onChange={(val) => handleStatUpdate(i, "label", val)}
                                tagName="p"
                                className="font-bold uppercase tracking-widest text-muted-foreground/80"
                                style={{ fontSize: 'clamp(12px, 1.5vw, 16px)' }}
                                editable={selected}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export const statsBlockSchema: PropSchema[] = [
    {
        name: "stats",
        label: "Stats",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "value", label: "Value", type: "text" },
            { name: "suffix", label: "Suffix (e.g. +)", type: "text" },
            { name: "label", label: "Label", type: "text" }
        ]
    },
    {
        name: "backgroundType",
        label: "Background Type",
        type: "select",
        group: "Style",
        options: [
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
        name: "backgroundBlur",
        label: "Background Blur",
        type: "number",
        group: "Style",
        min: 0,
        max: 20,
        step: 1,
        default: 0
    },
    { name: "showOverlay", label: "Dark Overlay", type: "boolean", group: "Style" },
    {
        name: "overlayOpacity",
        label: "Overlay Opacity",
        type: "number",
        group: "Style",
        min: 0,
        max: 100,
        step: 10,
        default: 50
    },
    {
        name: "animation",
        label: "Entrance Animation",
        type: "select",
        group: "Style",
        options: [
            { label: "Fade In", value: "fade" },
            { label: "Slide Up", value: "slideUp" },
            { label: "None", value: "none" }
        ],
        default: "slideUp"
    },
    {
        name: "columns",
        label: "Grid Columns",
        type: "select",
        group: "Layout",
        options: [
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" },
            { label: "4 Columns", value: "4" }
        ],
        default: "4"
    },
    {
        name: "paddingTop",
        label: "Top Padding",
        type: "select",
        group: "Layout",
        options: [
            { label: "None", value: "py-0" },
            { label: "Small", value: "py-12" },
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
            { label: "Small", value: "py-12" },
            { label: "Medium", value: "py-24" },
            { label: "Large", value: "py-32" }
        ],
        default: "py-24"
    }
]

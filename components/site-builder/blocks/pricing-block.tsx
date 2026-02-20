"use client"

import { Button } from "@/components/ui/button"
import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { Check, ArrowRight, Plus } from "lucide-react"
import { motion } from "framer-motion"

interface PricingBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const PricingBlock = ({ block, onChange, selected }: PricingBlockProps) => {
    const { 
        title, 
        subtitle, 
        plans = [], 
        backgroundType = "color",
        backgroundColor = "transparent",
        backgroundGradient,
        backgroundBlur = 0,
        backgroundPattern = "none",
        showOverlay = false,
        overlayOpacity = 50,
        paddingTop = "py-24",
        paddingBottom = "py-24",
        animation = "fade"
    } = block.props

    const handleChange = (key: string, value: any) => {
        onChange(block.id, { ...block.props, [key]: value })
    }

    const handlePlanUpdate = (index: number, field: string, value: any) => {
        const newPlans = [...plans]
        newPlans[index] = { ...newPlans[index], [field]: value }
        handleChange("plans", newPlans)
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
                "px-6 md:px-12 relative overflow-hidden",
                paddingTop,
                paddingBottom,
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
            <div className="max-w-7xl mx-auto space-y-16">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={getItemVariants() as any}
                    className="text-center max-w-2xl mx-auto space-y-4"
                >
                    <InlineText
                        value={subtitle}
                        onChange={(val) => handleChange("subtitle", val)}
                        tagName="span"
                        className="text-primary font-bold tracking-[0.2em] uppercase text-xs"
                        editable={selected}
                    />
                    <InlineText
                        value={title}
                        onChange={(val) => handleChange("title", val)}
                        tagName="h2"
                        className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]"
                        editable={selected}
                    />
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
                >
                    {plans.map((plan: any, i: number) => (
                        <motion.div 
                            key={i}
                            variants={getItemVariants() as any}
                            className={cn(
                                "relative flex flex-col p-8 rounded-[32px] border transition-all duration-500 hover:shadow-2xl",
                                plan.isFeatured ? "bg-primary text-primary-foreground border-primary md:scale-105 z-10 shadow-xl" : "bg-card border-muted-foreground/10 hover:border-primary/20 shadow-lg"
                            )}
                        >
                            {plan.isFeatured && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-foreground text-background text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                                    Recommended
                                </div>
                            )}
                            
                            <div className="mb-8 space-y-2">
                                <InlineText
                                    value={plan.name}
                                    onChange={(val) => handlePlanUpdate(i, "name", val)}
                                    tagName="h3"
                                    className="text-xl font-bold tracking-tight uppercase"
                                    editable={selected}
                                />
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">{plan.price}</span>
                                    <span className={cn("text-sm font-medium", plan.isFeatured ? "text-primary-foreground/70" : "text-muted-foreground")}>/term</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                {(plan.features || []).map((feature: string, j: number) => (
                                    <div key={j} className="flex items-start gap-3">
                                        <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5", plan.isFeatured ? "bg-primary-foreground/20" : "bg-primary/10")}>
                                            <Check className={cn("h-3 w-3", plan.isFeatured ? "text-primary-foreground" : "text-primary")} />
                                        </div>
                                        <span className={cn("text-sm font-medium leading-tight", plan.isFeatured ? "text-primary-foreground/90" : "text-muted-foreground")}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button 
                                className={cn(
                                    "w-full h-12 rounded-xl font-bold tracking-tight shadow-lg transition-all active:scale-95",
                                    plan.isFeatured ? "bg-background text-primary hover:bg-background/90" : "bg-primary text-primary-foreground"
                                )}
                            >
                                <InlineText
                                    value={plan.buttonText}
                                    onChange={(val) => handlePlanUpdate(i, "buttonText", val)}
                                    tagName="span"
                                    editable={selected}
                                />
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </motion.div>
                    ))}
                    {selected && (
                        <motion.div 
                            variants={getItemVariants() as any}
                            className="flex items-center justify-center p-8 border-2 border-dashed rounded-[32px] cursor-pointer hover:border-primary/50 transition-all min-h-[200px] opacity-50 hover:opacity-100" 
                            onClick={() => {/* add logic if needed */}}
                        >
                            <div className="text-center space-y-2">
                                <Plus className="h-6 w-6 mx-auto text-muted-foreground" />
                                <span className="text-sm font-bold tracking-tight">Add Plan</span>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}

export const pricingBlockSchema: PropSchema[] = [
    { name: "title", label: "Heading", type: "text", group: "Content" },
    { name: "subtitle", label: "Subheading", type: "text", group: "Content" },
    {
        name: "plans",
        label: "Pricing Plans",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "name", label: "Plan Name", type: "text" },
            { name: "price", label: "Price", type: "text" },
            { name: "buttonText", label: "Button Label", type: "text" },
            { name: "isFeatured", label: "Featured Plan", type: "boolean" }
        ]
    },
    {
        name: "backgroundType",
        label: "Background Type",
        type: "select",
        group: "Style",
        options: [
            { label: "Transparent", value: "transparent" },
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
            { label: "Zoom In", value: "zoom" },
            { label: "None", value: "none" }
        ],
        default: "fade"
    },
    {
        name: "paddingTop",
        label: "Top Padding",
        type: "select",
        group: "Layout",
        options: [
            { label: "None", value: "py-0" },
            { label: "Small", value: "py-4" },
            { label: "Medium", value: "py-8" },
            { label: "Large", value: "py-12" }
        ],
        default: "py-8"
    },
    {
        name: "paddingBottom",
        label: "Bottom Padding",
        type: "select",
        group: "Layout",
        options: [
            { label: "None", value: "py-0" },
            { label: "Small", value: "py-4" },
            { label: "Medium", value: "py-8" },
            { label: "Large", value: "py-12" }
        ],
        default: "py-8"
    }
]

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { motion } from "framer-motion"
import { Check, Plus } from "lucide-react"

interface PricingToggleBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const PricingToggleBlock = ({ block, onChange, selected }: PricingToggleBlockProps) => {
    const {
        title,
        subtitle,
        plans = [],
        showToggle = true,
        monthlyLabel = "Monthly",
        yearlyLabel = "Yearly",
        yearlyDiscount = "Save 20%",
        backgroundType = "color",
        backgroundColor = "transparent",
        backgroundGradient,
        backgroundPattern = "none",
        animation = "slideUp",
        paddingTop = "py-24",
        paddingBottom = "py-24"
    } = block.props

    const [isYearly, setIsYearly] = useState(false)

    const handleChange = (key: string, value: any) => {
        onChange(block.id, { ...block.props, [key]: value })
    }

    const handlePlanUpdate = (index: number, field: string, value: any) => {
        const newPlans = [...plans]
        newPlans[index] = { ...newPlans[index], [field]: value }
        handleChange("plans", newPlans)
    }

    const addPlan = () => {
        handleChange("plans", [...plans, {
            name: "New Plan",
            monthlyPrice: "$29",
            yearlyPrice: "$24",
            description: "Perfect for getting started",
            buttonText: "Get Started",
            isFeatured: false,
            features: ["Feature 1", "Feature 2", "Feature 3"]
        }])
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 }
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
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
        }
    }

    const getItemVariants = () => {
        if (animation === "none") return itemVariants.none
        return itemVariants[animation as keyof typeof itemVariants] || itemVariants.fade
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

            <div className="max-w-7xl mx-auto space-y-12">
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
                        className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]"
                        editable={selected}
                    />
                </motion.div>

                {/* Toggle */}
                {showToggle && (
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={getItemVariants() as any}
                        className="flex items-center justify-center gap-4"
                    >
                        <span className={cn(
                            "text-sm font-semibold transition-colors",
                            !isYearly ? "text-foreground" : "text-muted-foreground"
                        )}>
                            {monthlyLabel}
                        </span>

                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className={cn(
                                "relative w-14 h-7 rounded-full transition-colors duration-300",
                                isYearly ? "bg-primary" : "bg-muted-foreground/20"
                            )}
                        >
                            <motion.div
                                className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md"
                                animate={{ x: isYearly ? 28 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>

                        <span className={cn(
                            "text-sm font-semibold transition-colors",
                            isYearly ? "text-foreground" : "text-muted-foreground"
                        )}>
                            {yearlyLabel}
                        </span>

                        {yearlyDiscount && isYearly && (
                            <span className="text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full">
                                {yearlyDiscount}
                            </span>
                        )}
                    </motion.div>
                )}

                {/* Pricing Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={cn(
                        "grid gap-6 items-stretch",
                        plans.length === 1 && "grid-cols-1 max-w-md mx-auto",
                        plans.length === 2 && "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto",
                        plans.length >= 3 && "grid-cols-1 md:grid-cols-3"
                    )}
                >
                    {plans.map((plan: any, i: number) => (
                        <motion.div
                            key={i}
                            variants={getItemVariants() as any}
                            className={cn(
                                "relative rounded-3xl border p-8 flex flex-col transition-all duration-500",
                                plan.isFeatured
                                    ? "bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/20 scale-[1.02] z-10"
                                    : "bg-card border-muted-foreground/10 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1"
                            )}
                        >
                            {plan.isFeatured && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-foreground text-primary text-xs font-bold rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="space-y-4 mb-8">
                                <InlineText
                                    value={plan.name}
                                    onChange={(val) => handlePlanUpdate(i, "name", val)}
                                    tagName="h3"
                                    className="text-xl font-bold"
                                    editable={selected}
                                />

                                {plan.description && (
                                    <InlineText
                                        value={plan.description}
                                        onChange={(val) => handlePlanUpdate(i, "description", val)}
                                        tagName="p"
                                        className={cn(
                                            "text-sm leading-relaxed",
                                            plan.isFeatured ? "text-primary-foreground/80" : "text-muted-foreground"
                                        )}
                                        editable={selected}
                                    />
                                )}

                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">
                                        {isYearly ? (plan.yearlyPrice || plan.monthlyPrice) : plan.monthlyPrice}
                                    </span>
                                    {plan.monthlyPrice !== "Custom" && (
                                        <span className={cn(
                                            "text-sm",
                                            plan.isFeatured ? "text-primary-foreground/60" : "text-muted-foreground"
                                        )}>
                                            /{isYearly ? "yr" : "mo"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button
                                className={cn(
                                    "w-full rounded-xl py-6 font-bold text-base mb-8 transition-all hover:scale-[1.02] active:scale-[0.98]",
                                    plan.isFeatured
                                        ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                                        : ""
                                )}
                                variant={plan.isFeatured ? "default" : "outline"}
                            >
                                {plan.buttonText || "Get Started"}
                            </Button>

                            <ul className="space-y-3 flex-1">
                                {(plan.features || []).map((feature: string, j: number) => (
                                    <li key={j} className="flex items-start gap-3 text-sm">
                                        <Check className={cn(
                                            "h-4 w-4 mt-0.5 flex-shrink-0",
                                            plan.isFeatured ? "text-primary-foreground" : "text-primary"
                                        )} />
                                        <span className={plan.isFeatured ? "text-primary-foreground/90" : ""}>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}

                    {selected && (
                        <motion.div
                            variants={getItemVariants() as any}
                            className="flex items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer hover:border-primary/50 transition-all min-h-[300px] opacity-50 hover:opacity-100"
                            onClick={addPlan}
                        >
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold tracking-tight">Add Plan</span>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}

export const pricingToggleBlockSchema: PropSchema[] = [
    { name: "title", label: "Heading", type: "text", group: "Content" },
    { name: "subtitle", label: "Subtitle", type: "text", group: "Content" },
    { name: "showToggle", label: "Show Monthly/Yearly Toggle", type: "boolean", group: "Content" },
    { name: "monthlyLabel", label: "Monthly Label", type: "text", group: "Content" },
    { name: "yearlyLabel", label: "Yearly Label", type: "text", group: "Content" },
    { name: "yearlyDiscount", label: "Yearly Discount Badge", type: "text", group: "Content" },
    {
        name: "plans",
        label: "Pricing Plans",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "name", label: "Plan Name", type: "text" },
            { name: "description", label: "Description", type: "text" },
            { name: "monthlyPrice", label: "Monthly Price", type: "text" },
            { name: "yearlyPrice", label: "Yearly Price", type: "text" },
            { name: "buttonText", label: "Button Text", type: "text" },
            { name: "isFeatured", label: "Featured Plan", type: "boolean" },
            {
                name: "features",
                label: "Features",
                type: "array",
                arrayItemSchema: [
                    { name: "value", label: "Feature", type: "text" }
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

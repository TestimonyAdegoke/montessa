"use client"

import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { Check, X, Minus } from "lucide-react"
import { motion } from "framer-motion"
import { useDevice } from "../device-context"

interface ComparisonBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const ComparisonBlock = ({ block, onChange, selected }: ComparisonBlockProps) => {
    const { isMobile } = useDevice()
    const {
        title,
        subtitle,
        leftTitle = "Before",
        rightTitle = "After",
        features = [],
        style = "cards",
        highlightRight = true,
        backgroundType = "color",
        backgroundColor = "transparent",
        backgroundGradient,
        paddingTop = "py-24",
        paddingBottom = "py-24"
    } = block.props

    const handleChange = (key: string, value: any) => {
        onChange(block.id, { ...block.props, [key]: value })
    }

    const handleFeatureUpdate = (index: number, field: string, value: any) => {
        const newFeatures = [...features]
        newFeatures[index] = { ...newFeatures[index], [field]: value }
        handleChange("features", newFeatures)
    }

    const StatusIcon = ({ status }: { status: string }) => {
        if (status === "yes") return <Check className="h-5 w-5 text-green-500" />
        if (status === "no") return <X className="h-5 w-5 text-red-500" />
        return <Minus className="h-5 w-5 text-muted-foreground" />
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
            <div className="max-w-5xl mx-auto space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center space-y-4"
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
                        className="text-4xl md:text-5xl font-black tracking-tight"
                        editable={selected}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={cn(
                        "rounded-3xl overflow-hidden",
                        style === "cards" && "bg-card border shadow-2xl",
                        style === "minimal" && "border"
                    )}
                >
                    {/* Header */}
                    <div className={cn(
                        "grid",
                        isMobile ? "grid-cols-1" : "grid-cols-3"
                    )}>
                        <div className="p-6 bg-muted/30 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                            Features
                        </div>
                        <div className={cn(
                            "p-6 text-center font-bold",
                            !highlightRight && "bg-primary/10"
                        )}>
                            <InlineText
                                value={leftTitle}
                                onChange={(val) => handleChange("leftTitle", val)}
                                tagName="span"
                                editable={selected}
                            />
                        </div>
                        <div className={cn(
                            "p-6 text-center font-bold",
                            highlightRight && "bg-primary text-primary-foreground"
                        )}>
                            <InlineText
                                value={rightTitle}
                                onChange={(val) => handleChange("rightTitle", val)}
                                tagName="span"
                                editable={selected}
                            />
                        </div>
                    </div>

                    {/* Features */}
                    {features.map((feature: any, index: number) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "grid border-t",
                                isMobile ? "grid-cols-1" : "grid-cols-3"
                            )}
                        >
                            <div className="p-4 flex items-center">
                                <InlineText
                                    value={feature.name}
                                    onChange={(val) => handleFeatureUpdate(index, "name", val)}
                                    tagName="span"
                                    className="font-medium"
                                    editable={selected}
                                />
                            </div>
                            <div className={cn(
                                "p-4 flex items-center justify-center",
                                !highlightRight && "bg-primary/5"
                            )}>
                                <StatusIcon status={feature.left} />
                            </div>
                            <div className={cn(
                                "p-4 flex items-center justify-center",
                                highlightRight && "bg-primary/5"
                            )}>
                                <StatusIcon status={feature.right} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export const comparisonBlockSchema: PropSchema[] = [
    { name: "subtitle", label: "Subtitle", type: "text", group: "Content" },
    { name: "title", label: "Title", type: "text", group: "Content" },
    { name: "leftTitle", label: "Left Column Title", type: "text", group: "Content" },
    { name: "rightTitle", label: "Right Column Title", type: "text", group: "Content" },
    {
        name: "features",
        label: "Features",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "name", label: "Feature Name", type: "text" },
            { name: "left", label: "Left Status (yes/no/partial)", type: "select", options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
                { label: "Partial", value: "partial" }
            ]},
            { name: "right", label: "Right Status (yes/no/partial)", type: "select", options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
                { label: "Partial", value: "partial" }
            ]}
        ]
    },
    { name: "highlightRight", label: "Highlight Right Column", type: "boolean", group: "Style" },
    {
        name: "style",
        label: "Style",
        type: "select",
        group: "Style",
        options: [
            { label: "Cards", value: "cards" },
            { label: "Minimal", value: "minimal" }
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
        ]
    },
    { name: "backgroundColor", label: "Background Color", type: "color", group: "Style" },
    { name: "backgroundGradient", label: "Background Gradient", type: "gradient", group: "Style" },
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
        ]
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
        ]
    }
]

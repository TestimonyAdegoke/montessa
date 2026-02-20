"use client"

import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { Plus, Circle } from "lucide-react"
import { motion } from "framer-motion"
import { useDevice } from "../device-context"

interface TimelineBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const TimelineBlock = ({ block, onChange, selected }: TimelineBlockProps) => {
    const { isMobile } = useDevice()
    const {
        title,
        subtitle,
        items = [],
        style = "alternating",
        lineStyle = "solid",
        backgroundType = "color",
        backgroundColor = "transparent",
        backgroundGradient,
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
        handleChange("items", [...items, {
            year: "2024",
            title: "New Milestone",
            description: "Describe this milestone..."
        }])
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
            <div className="max-w-4xl mx-auto space-y-16">
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

                <div className="relative">
                    {/* Timeline Line */}
                    <div className={cn(
                        "absolute top-0 bottom-0 w-0.5 bg-primary/20",
                        style === "alternating" && !isMobile ? "left-1/2 -translate-x-1/2" : "left-4"
                    )} style={{
                        backgroundImage: lineStyle === "dashed" ? "repeating-linear-gradient(to bottom, hsl(var(--primary)) 0, hsl(var(--primary)) 8px, transparent 8px, transparent 16px)" : undefined
                    }} />

                    <div className="space-y-12">
                        {items.map((item: any, index: number) => {
                            const isLeft = style === "alternating" && !isMobile && index % 2 === 0
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn(
                                        "relative flex items-start gap-8",
                                        style === "alternating" && !isMobile && (isLeft ? "flex-row-reverse text-right" : ""),
                                        style === "alternating" && !isMobile ? "pl-0" : "pl-12"
                                    )}
                                >
                                    {/* Dot */}
                                    <div className={cn(
                                        "absolute w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/30 z-10",
                                        style === "alternating" && !isMobile ? "left-1/2 -translate-x-1/2" : "left-2"
                                    )}>
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 rounded-full bg-primary/30"
                                        />
                                    </div>

                                    <div className={cn(
                                        "flex-1 bg-card rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-shadow",
                                        style === "alternating" && !isMobile && "max-w-[calc(50%-2rem)]"
                                    )}>
                                        <InlineText
                                            value={item.year}
                                            onChange={(val) => handleItemUpdate(index, "year", val)}
                                            tagName="span"
                                            className="text-primary font-bold text-sm"
                                            editable={selected}
                                        />
                                        <InlineText
                                            value={item.title}
                                            onChange={(val) => handleItemUpdate(index, "title", val)}
                                            tagName="h3"
                                            className="text-xl font-bold mt-2"
                                            editable={selected}
                                        />
                                        <InlineText
                                            value={item.description}
                                            onChange={(val) => handleItemUpdate(index, "description", val)}
                                            tagName="p"
                                            className="text-muted-foreground mt-2 leading-relaxed"
                                            multiline
                                            editable={selected}
                                        />
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {selected && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={addItem}
                            className="mt-8 w-full p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            <span className="font-bold">Add Milestone</span>
                        </motion.button>
                    )}
                </div>
            </div>
        </section>
    )
}

export const timelineBlockSchema: PropSchema[] = [
    { name: "subtitle", label: "Subtitle", type: "text", group: "Content" },
    { name: "title", label: "Title", type: "text", group: "Content" },
    {
        name: "items",
        label: "Timeline Items",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "year", label: "Year/Date", type: "text" },
            { name: "title", label: "Title", type: "text" },
            { name: "description", label: "Description", type: "textarea" }
        ]
    },
    {
        name: "style",
        label: "Layout Style",
        type: "select",
        group: "Style",
        options: [
            { label: "Alternating", value: "alternating" },
            { label: "Left Aligned", value: "left" }
        ]
    },
    {
        name: "lineStyle",
        label: "Line Style",
        type: "select",
        group: "Style",
        options: [
            { label: "Solid", value: "solid" },
            { label: "Dashed", value: "dashed" }
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

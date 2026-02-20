"use client"

import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { Plus } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDevice } from "../device-context"

interface TabsBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const TabsBlock = ({ block, onChange, selected }: TabsBlockProps) => {
    const { device, isMobile } = useDevice()
    const {
        title,
        subtitle,
        tabs = [],
        style = "underline",
        backgroundType = "color",
        backgroundColor = "transparent",
        backgroundGradient,
        paddingTop = "py-24",
        paddingBottom = "py-24"
    } = block.props

    const [activeTab, setActiveTab] = useState(0)

    const handleChange = (key: string, value: any) => {
        onChange(block.id, { ...block.props, [key]: value })
    }

    const handleTabUpdate = (index: number, field: string, value: any) => {
        const newTabs = [...tabs]
        newTabs[index] = { ...newTabs[index], [field]: value }
        handleChange("tabs", newTabs)
    }

    const addTab = () => {
        handleChange("tabs", [...tabs, {
            label: "New Tab",
            content: "Tab content goes here...",
            image: ""
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
            <div className="max-w-6xl mx-auto space-y-12">
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

                {/* Tab Navigation */}
                <div className={cn(
                    "flex gap-2 justify-center",
                    isMobile && "flex-col"
                )}>
                    {tabs.map((tab: any, index: number) => (
                        <motion.button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "relative px-6 py-3 font-bold text-sm transition-all rounded-xl",
                                style === "underline" && "bg-transparent",
                                style === "pills" && (activeTab === index ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"),
                                style === "cards" && (activeTab === index ? "bg-card shadow-lg border-2 border-primary" : "bg-card/50 border border-muted-foreground/10"),
                                activeTab === index && style === "underline" && "text-primary"
                            )}
                        >
                            <InlineText
                                value={tab.label}
                                onChange={(val) => handleTabUpdate(index, "label", val)}
                                tagName="span"
                                editable={selected}
                            />
                            {style === "underline" && activeTab === index && (
                                <motion.div
                                    layoutId="tab-underline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                />
                            )}
                        </motion.button>
                    ))}
                    {selected && (
                        <button
                            onClick={addTab}
                            className="px-4 py-2 border-2 border-dashed rounded-xl text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {tabs[activeTab] && (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "grid gap-8",
                                tabs[activeTab].image && !isMobile ? "grid-cols-2" : "grid-cols-1"
                            )}
                        >
                            <div className="space-y-6">
                                <InlineText
                                    value={tabs[activeTab].content}
                                    onChange={(val) => handleTabUpdate(activeTab, "content", val)}
                                    tagName="p"
                                    className="text-lg text-muted-foreground leading-relaxed"
                                    multiline
                                    editable={selected}
                                />
                            </div>
                            {tabs[activeTab].image && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="rounded-2xl overflow-hidden shadow-2xl"
                                >
                                    <img
                                        src={tabs[activeTab].image}
                                        alt={tabs[activeTab].label}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    )
}

export const tabsBlockSchema: PropSchema[] = [
    { name: "subtitle", label: "Subtitle", type: "text", group: "Content" },
    { name: "title", label: "Title", type: "text", group: "Content" },
    {
        name: "tabs",
        label: "Tabs",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "label", label: "Tab Label", type: "text" },
            { name: "content", label: "Content", type: "textarea" },
            { name: "image", label: "Image", type: "image" }
        ]
    },
    {
        name: "style",
        label: "Tab Style",
        type: "select",
        group: "Style",
        options: [
            { label: "Underline", value: "underline" },
            { label: "Pills", value: "pills" },
            { label: "Cards", value: "cards" }
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

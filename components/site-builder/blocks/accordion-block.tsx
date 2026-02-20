"use client"

import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { ChevronDown, Plus } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AccordionBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const AccordionBlock = ({ block, onChange, selected }: AccordionBlockProps) => {
    const {
        title,
        subtitle,
        items = [],
        style = "minimal",
        allowMultiple = false,
        backgroundType = "color",
        backgroundColor = "transparent",
        backgroundGradient,
        animation = "fade",
        paddingTop = "py-24",
        paddingBottom = "py-24"
    } = block.props

    const [openItems, setOpenItems] = useState<number[]>([0])

    const handleChange = (key: string, value: any) => {
        onChange(block.id, { ...block.props, [key]: value })
    }

    const handleItemUpdate = (index: number, field: string, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        handleChange("items", newItems)
    }

    const toggleItem = (index: number) => {
        if (allowMultiple) {
            setOpenItems(prev => 
                prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
            )
        } else {
            setOpenItems(prev => prev.includes(index) ? [] : [index])
        }
    }

    const addItem = () => {
        handleChange("items", [...items, {
            question: "New Question",
            answer: "Enter your answer here..."
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
            <div className="max-w-4xl mx-auto space-y-12">
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

                <div className="space-y-3">
                    {items.map((item: any, index: number) => {
                        const isOpen = openItems.includes(index)
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "rounded-2xl overflow-hidden transition-all duration-300",
                                    style === "minimal" && "border border-muted-foreground/10",
                                    style === "cards" && "bg-card shadow-lg border",
                                    style === "filled" && "bg-muted/50",
                                    isOpen && "ring-2 ring-primary/20"
                                )}
                            >
                                <button
                                    onClick={() => toggleItem(index)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-6 text-left transition-colors",
                                        isOpen ? "bg-primary/5" : "hover:bg-muted/30"
                                    )}
                                >
                                    <InlineText
                                        value={item.question}
                                        onChange={(val) => handleItemUpdate(index, "question", val)}
                                        tagName="span"
                                        className="font-bold text-lg"
                                        editable={selected}
                                    />
                                    <motion.div
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6">
                                                <InlineText
                                                    value={item.answer}
                                                    onChange={(val) => handleItemUpdate(index, "answer", val)}
                                                    tagName="p"
                                                    className="text-muted-foreground leading-relaxed"
                                                    multiline
                                                    editable={selected}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}

                    {selected && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={addItem}
                            className="w-full p-6 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            <span className="font-bold">Add Item</span>
                        </motion.button>
                    )}
                </div>
            </div>
        </section>
    )
}

export const accordionBlockSchema: PropSchema[] = [
    { name: "subtitle", label: "Subtitle", type: "text", group: "Content" },
    { name: "title", label: "Title", type: "text", group: "Content" },
    {
        name: "items",
        label: "Accordion Items",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "question", label: "Question", type: "text" },
            { name: "answer", label: "Answer", type: "textarea" }
        ]
    },
    {
        name: "style",
        label: "Style",
        type: "select",
        group: "Style",
        options: [
            { label: "Minimal", value: "minimal" },
            { label: "Cards", value: "cards" },
            { label: "Filled", value: "filled" }
        ]
    },
    { name: "allowMultiple", label: "Allow Multiple Open", type: "boolean", group: "Settings" },
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

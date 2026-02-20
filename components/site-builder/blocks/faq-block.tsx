"use client"

import { Button } from "@/components/ui/button"
import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus } from "lucide-react"

import { motion } from "framer-motion"

interface FAQBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const FAQBlock = ({ block, onChange, selected }: FAQBlockProps) => {
    const { 
        title, 
        subtitle, 
        items = [], 
        align = "center", 
        columns = 1,
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

    const handleItemUpdate = (index: number, field: string, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        handleChange("items", newItems)
    }

    const addItem = () => {
        handleChange("items", [...items, { question: "New Question", answer: "Answer goes here." }])
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
        <section className={cn(
            "px-6 md:px-12 relative overflow-hidden border-t",
            paddingTop,
            paddingBottom,
            selected && "ring-2 ring-primary ring-offset-2"
        )} style={{ 
            backgroundColor: backgroundType === 'color' ? backgroundColor : undefined,
            background: backgroundType === 'gradient' ? backgroundGradient : undefined
        }}>
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
            <div className={cn(
                "max-w-7xl mx-auto grid gap-12 md:gap-16",
                columns === 2 && "grid-cols-1 lg:grid-cols-2",
                columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}>
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={getItemVariants() as any}
                    className="space-y-4"
                >
                    <InlineText
                        value={subtitle}
                        onChange={(val) => handleChange("subtitle", val)}
                        tagName="span"
                        className="text-primary font-bold tracking-widest uppercase text-xs"
                        editable={selected}
                    />
                    <InlineText
                        value={title}
                        onChange={(val) => handleChange("title", val)}
                        tagName="h2"
                        className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1]"
                        editable={selected}
                    />
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="w-full text-left"
                >
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {items.map((item: any, i: number) => (
                            <motion.div key={i} variants={getItemVariants() as any}>
                                <AccordionItem value={`item-${i}`} className="border rounded-[24px] px-8 data-[state=open]:bg-muted/30 transition-all duration-300 shadow-sm border-muted-foreground/10 overflow-hidden">
                                    <AccordionTrigger className="text-xl font-bold hover:no-underline py-6 tracking-tight text-left">
                                        <InlineText
                                            value={item.question}
                                            onChange={(val) => handleItemUpdate(i, "question", val)}
                                            tagName="span"
                                            editable={selected}
                                        />
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground pb-8 leading-relaxed text-lg font-medium">
                                        <InlineText
                                            value={item.answer}
                                            onChange={(val) => handleItemUpdate(i, "answer", val)}
                                            tagName="div"
                                            multiline
                                            editable={selected}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            </motion.div>
                        ))}
                    </Accordion>

                    {selected && (
                        <div className="mt-10 flex justify-center">
                            <Button variant="outline" onClick={addItem} className="gap-2 h-12 px-8 rounded-xl font-bold border-2 hover:bg-primary/5 transition-all">
                                <Plus className="h-4 w-4" /> Add Question
                            </Button>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}

export const faqBlockSchema: PropSchema[] = [
    { name: "title", label: "Heading", type: "text", group: "Content" },
    { name: "subtitle", label: "Subheading", type: "text", group: "Content" },
    {
        name: "items",
        label: "Questions",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "question", label: "Question", type: "text" },
            { name: "answer", label: "Answer", type: "textarea" }
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
        name: "align",
        label: "Alignment",
        type: "select",
        group: "Layout",
        options: [
            { label: "Center", value: "center" },
            { label: "Left", value: "left" }
        ]
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

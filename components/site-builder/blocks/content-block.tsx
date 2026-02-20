"use client"

import { Button } from "@/components/ui/button"
import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { ArrowRight, Check } from "lucide-react"

import { motion } from "framer-motion"

interface ContentBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const ContentBlock = ({ block, onChange, selected }: ContentBlockProps) => {
    const { 
        title, 
        subtitle, 
        description, 
        image, 
        align = "left", 
        showButton, 
        buttonText, 
        buttonLink, 
        listItems = [],
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

    const variants = {
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

    const getVariants = () => {
        if (animation === "none") return variants.none;
        return variants[animation as keyof typeof variants] || variants.fade;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
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

            <div className="max-w-7xl mx-auto">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={cn(
                        "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center",
                        align === "right" && "lg:flex-row-reverse"
                    )}
                >
                    <motion.div variants={getVariants() as any} className={cn("space-y-8", align === "right" && "lg:order-2")}>
                        <div className="space-y-4">
                            <InlineText
                                value={title}
                                onChange={(val) => handleChange("title", val)}
                                tagName="h2"
                                className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]"
                                editable={selected}
                            />
                            <InlineText
                                value={description}
                                onChange={(val) => handleChange("description", val)}
                                tagName="p"
                                className="text-lg text-muted-foreground leading-relaxed font-medium"
                                multiline
                                editable={selected}
                            />
                        </div>

                        {listItems.length > 0 && (
                            <ul className="space-y-4">
                                {listItems.map((item: string, i: number) => (
                                    <motion.li 
                                        key={i} 
                                        variants={getVariants() as any}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-muted-foreground font-medium">{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        )}

                        {showButton && (
                            <div className="pt-4">
                                <Button size="lg" className="rounded-2xl px-8 font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                    <InlineText
                                        value={buttonText}
                                        onChange={(val) => handleChange("buttonText", val)}
                                        tagName="span"
                                        editable={selected}
                                    />
                                </Button>
                            </div>
                        )}
                    </motion.div>

                    <motion.div 
                        variants={getVariants() as any}
                        className={cn(
                            "relative aspect-square lg:aspect-auto lg:h-[600px] rounded-[48px] overflow-hidden shadow-2xl border border-muted-foreground/10",
                            align === "right" && "lg:order-1"
                        )}
                    >
                        {image ? (
                            <img src={image} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full bg-muted/20 flex items-center justify-center text-muted-foreground">No image set</div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export const contentBlockSchema: PropSchema[] = [
    { name: "subtitle", label: "Tagline", type: "text", group: "Content" },
    { name: "title", label: "Heading", type: "text", group: "Content" },
    { name: "description", label: "Description", type: "textarea", group: "Content" },
    { name: "image", label: "Image URL", type: "image", group: "Content" },
    {
        name: "listItems",
        label: "Key Points",
        type: "array",
        group: "Content",
        arrayItemSchema: [{ name: "item", label: "Point", type: "text" }]
    },
    { name: "showButton", label: "Show Button", type: "boolean", group: "Button" },
    { name: "buttonText", label: "Button Label", type: "text", group: "Button" },
    { name: "buttonLink", label: "Button Link", type: "text", group: "Button" },
    {
        name: "backgroundType",
        label: "Background Type",
        type: "select",
        group: "Style",
        options: [
            { label: "Transparent", value: "color" }, // We use color type for both solid and transparent
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
            { label: "Grid", value: "grid" }
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
        label: "Image Position",
        type: "select",
        group: "Layout",
        options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" }
        ],
        default: "left"
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

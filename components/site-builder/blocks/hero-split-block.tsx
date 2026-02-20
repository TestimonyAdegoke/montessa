"use client"

import { Button } from "@/components/ui/button"
import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { motion } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"

interface HeroSplitBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const HeroSplitBlock = ({ block, onChange, selected }: HeroSplitBlockProps) => {
    const {
        title,
        subtitle,
        ctaText,
        ctaLink,
        secondaryCtaText,
        secondaryCtaLink,
        image,
        imagePosition = "right",
        badge,
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

    const variants = {
        none: { opacity: 1, y: 0, scale: 1 },
        fade: {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.8 } }
        },
        slideUp: {
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
        },
        zoom: {
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
        }
    }

    const getVariants = () => {
        if (animation === "none") return variants.none
        return variants[animation as keyof typeof variants] || variants.fade
    }

    return (
        <section
            className={cn(
                "relative overflow-hidden",
                paddingTop,
                paddingBottom,
                selected && "ring-2 ring-primary ring-offset-2"
            )}
            style={{
                backgroundColor: backgroundType === "color" ? backgroundColor : undefined,
                background: backgroundType === "gradient" ? backgroundGradient : undefined
            }}
        >
            {/* Pattern Overlay */}
            {backgroundPattern !== "none" && (
                <div className={cn(
                    "absolute inset-0 opacity-[0.03]",
                    backgroundPattern === "dots" && "bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]",
                    backgroundPattern === "grid" && "bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:40px_40px]",
                    backgroundPattern === "mesh" && "bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%,transparent)] [background-size:20px_20px]",
                    backgroundPattern === "waves" && "bg-[radial-gradient(circle_at_0_50%,transparent_9px,#000_10px,transparent_11px),radial-gradient(circle_at_100%_50%,transparent_9px,#000_10px,transparent_11px)] [background-size:20px_40px]"
                )} />
            )}

            <div className={cn(
                "max-w-7xl mx-auto px-6 md:px-12 grid gap-12 lg:gap-16 items-center",
                "grid-cols-1 lg:grid-cols-2",
                imagePosition === "left" && "lg:[direction:rtl] lg:[&>*]:[direction:ltr]"
            )}>
                {/* Text Content */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={getVariants() as any}
                    className="space-y-8"
                >
                    {badge && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <InlineText
                                value={badge}
                                onChange={(val) => handleChange("badge", val)}
                                tagName="span"
                                editable={selected}
                            />
                        </div>
                    )}

                    <InlineText
                        value={title}
                        onChange={(val) => handleChange("title", val)}
                        tagName="h1"
                        className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]"
                        multiline
                        editable={selected}
                    />

                    <InlineText
                        value={subtitle}
                        onChange={(val) => handleChange("subtitle", val)}
                        tagName="p"
                        className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg"
                        multiline
                        editable={selected}
                    />

                    <div className="flex flex-wrap gap-4 pt-2">
                        {ctaText && (
                            <Button size="lg" className="text-base px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all font-bold gap-2">
                                <InlineText
                                    value={ctaText}
                                    onChange={(val) => handleChange("ctaText", val)}
                                    tagName="span"
                                    editable={selected}
                                />
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        )}
                        {secondaryCtaText && (
                            <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-xl hover:scale-105 active:scale-95 transition-all font-bold gap-2">
                                <Play className="h-4 w-4" />
                                <InlineText
                                    value={secondaryCtaText}
                                    onChange={(val) => handleChange("secondaryCtaText", val)}
                                    tagName="span"
                                    editable={selected}
                                />
                            </Button>
                        )}
                    </div>
                </motion.div>

                {/* Image */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0, x: imagePosition === "right" ? 60 : -60 },
                        visible: { opacity: 1, x: 0, transition: { duration: 1, ease: "easeOut", delay: 0.2 } }
                    }}
                    className="relative"
                >
                    {image ? (
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent rounded-3xl blur-2xl" />
                            <img
                                src={image}
                                alt="Hero visual"
                                className="relative w-full h-auto rounded-3xl object-cover aspect-[4/3]"
                            />
                        </div>
                    ) : (
                        <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-dashed border-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-sm font-medium">Add an image</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}

export const heroSplitBlockSchema: PropSchema[] = [
    { name: "title", label: "Title", type: "textarea", group: "Content" },
    { name: "subtitle", label: "Subtitle", type: "textarea", group: "Content" },
    { name: "badge", label: "Badge Text", type: "text", group: "Content" },
    { name: "ctaText", label: "Primary Button", type: "text", group: "Content" },
    { name: "ctaLink", label: "Primary Link", type: "text", group: "Content" },
    { name: "secondaryCtaText", label: "Secondary Button", type: "text", group: "Content" },
    { name: "secondaryCtaLink", label: "Secondary Link", type: "text", group: "Content" },
    { name: "image", label: "Hero Image", type: "image", group: "Content" },
    {
        name: "imagePosition",
        label: "Image Position",
        type: "select",
        group: "Layout",
        options: [
            { label: "Right", value: "right" },
            { label: "Left", value: "left" }
        ],
        default: "right"
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
            { label: "Small", value: "py-16" },
            { label: "Medium", value: "py-24" },
            { label: "Large", value: "py-32" },
            { label: "Extra Large", value: "py-48" }
        ],
        default: "py-24"
    },
    {
        name: "paddingBottom",
        label: "Bottom Padding",
        type: "select",
        group: "Layout",
        options: [
            { label: "Small", value: "py-16" },
            { label: "Medium", value: "py-24" },
            { label: "Large", value: "py-32" },
            { label: "Extra Large", value: "py-48" }
        ],
        default: "py-24"
    }
]

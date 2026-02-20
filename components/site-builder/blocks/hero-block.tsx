"use client"

import { Button } from "@/components/ui/button"
import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"

import { motion } from "framer-motion"

interface HeroBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const HeroBlock = ({ block, onChange, selected }: HeroBlockProps) => {
    const { 
        title, 
        subtitle, 
        ctaText, 
        ctaLink, 
        align = "center", 
        backgroundImage, 
        backgroundVideo,
        backgroundGradient,
        backgroundColor,
        backgroundType = "image",
        showOverlay = true,
        overlayOpacity = 50,
        backgroundBlur = 0,
        backgroundPattern = "none",
        animation = "fade",
        paddingTop = "py-32",
        paddingBottom = "py-32",
        titleSize = "text-5xl md:text-7xl",
        titleWeight = "font-black",
        subtitleSize = "text-xl md:text-2xl",
        subtitleWeight = "font-medium",
        letterSpacing = "tracking-tight"
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
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
        },
        zoom: { 
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
        }
    }

    const getVariants = () => {
        if (animation === "none") return variants.none;
        return variants[animation as keyof typeof variants] || variants.fade;
    }

    return (
        <section 
            className={cn(
                "relative flex flex-col justify-center overflow-hidden w-full min-h-[400px] md:min-h-[500px]",
                "py-16 md:py-24 lg:py-32",
                align === "left" && "items-start text-left",
                align === "center" && "items-center text-center",
                align === "right" && "items-end text-right",
                selected && "ring-2 ring-primary ring-offset-2"
            )} 
            style={{ 
                backgroundColor: backgroundType === 'color' ? (backgroundColor || '#1e293b') : undefined,
                background: backgroundType === 'gradient' ? backgroundGradient : undefined,
            }}
        >
            {/* Background Image/Video Layer - rendered as absolute positioned element */}
            {backgroundType === 'image' && backgroundImage && (
                <div 
                    className="absolute inset-0 z-0"
                    style={{ filter: backgroundBlur > 0 ? `blur(${backgroundBlur}px)` : undefined }}
                >
                    <motion.div
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                </div>
            )}
            
            {backgroundType === 'video' && backgroundVideo && (
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                        src={backgroundVideo}
                    />
                </div>
            )}
            
            {/* Pattern Overlay */}
            {backgroundPattern !== "none" && (
                <div className={cn(
                    "absolute inset-0 z-[1] opacity-[0.03] pointer-events-none",
                    backgroundPattern === "dots" && "bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]",
                    backgroundPattern === "grid" && "bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:40px_40px]",
                    backgroundPattern === "mesh" && "bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%,transparent)] [background-size:20px_20px]",
                    backgroundPattern === "waves" && "bg-[radial-gradient(circle_at_0_50%,transparent_9px,#000_10px,transparent_11px),radial-gradient(circle_at_100%_50%,transparent_9px,#000_10px,transparent_11px)] [background-size:20px_40px]"
                )} />
            )}

            {/* Dark Overlay */}
            {showOverlay && (
                <div 
                    className="absolute inset-0 bg-black z-[2] pointer-events-none" 
                    style={{ opacity: overlayOpacity / 100 }}
                />
            )}

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-8">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={getVariants() as any}
                >
                    <InlineText
                        value={title}
                        onChange={(val) => handleChange("title", val)}
                        tagName="h1"
                        className={cn(titleSize, titleWeight, letterSpacing, "text-white drop-shadow-2xl leading-[1.1]")}
                        multiline
                        editable={selected}
                    />
                </motion.div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={getVariants() as any}
                    transition={{ delay: 0.2 }}
                >
                    <InlineText
                        value={subtitle}
                        onChange={(val) => handleChange("subtitle", val)}
                        tagName="p"
                        className={cn(subtitleSize, subtitleWeight, "text-white/90 drop-shadow-lg max-w-2xl mx-auto leading-relaxed")}
                        multiline
                        editable={selected}
                    />
                </motion.div>

                {ctaText && (
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={getVariants() as any}
                        transition={{ delay: 0.4 }}
                        className="pt-6"
                    >
                        <Button size="lg" className="text-xl px-10 py-8 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-tight">
                            <InlineText
                                value={ctaText}
                                onChange={(val) => handleChange("ctaText", val)}
                                tagName="span"
                                editable={selected}
                            />
                        </Button>
                    </motion.div>
                )}
            </div>
        </section>
    )
}

export const heroBlockSchema: PropSchema[] = [
    { name: "title", label: "Title", type: "textarea", group: "Content" },
    { name: "subtitle", label: "Subtitle", type: "textarea", group: "Content" },
    { name: "ctaText", label: "Button Text", type: "text", group: "Content" },
    { name: "ctaLink", label: "Button Link", type: "text", group: "Content" },
    {
        name: "backgroundType",
        label: "Background Type",
        type: "select",
        group: "Style",
        options: [
            { label: "Image", value: "image" },
            { label: "Video", value: "video" },
            { label: "Gradient", value: "gradient" },
            { label: "Solid Color", value: "color" }
        ]
    },
    { name: "backgroundImage", label: "Background Image", type: "image", group: "Style" },
    { name: "backgroundVideo", label: "Background Video URL", type: "text", group: "Style" },
    { name: "backgroundGradient", label: "Background Gradient", type: "gradient", group: "Style" },
    { name: "backgroundColor", label: "Background Color", type: "color", group: "Style" },
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
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" }
        ],
        default: "center"
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
        default: "py-32"
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
        ]
    },
    {
        name: "titleSize",
        label: "Title Size",
        type: "select",
        group: "Typography",
        options: [
            { label: "Small", value: "text-3xl md:text-4xl" },
            { label: "Medium", value: "text-4xl md:text-5xl" },
            { label: "Large", value: "text-5xl md:text-7xl" },
            { label: "Extra Large", value: "text-6xl md:text-8xl" }
        ],
        default: "text-5xl md:text-7xl"
    },
    {
        name: "titleWeight",
        label: "Title Weight",
        type: "select",
        group: "Typography",
        options: [
            { label: "Normal", value: "font-normal" },
            { label: "Medium", value: "font-medium" },
            { label: "Semibold", value: "font-semibold" },
            { label: "Bold", value: "font-bold" },
            { label: "Black", value: "font-black" }
        ],
        default: "font-black"
    },
    {
        name: "subtitleSize",
        label: "Subtitle Size",
        type: "select",
        group: "Typography",
        options: [
            { label: "Small", value: "text-base md:text-lg" },
            { label: "Medium", value: "text-lg md:text-xl" },
            { label: "Large", value: "text-xl md:text-2xl" },
            { label: "Extra Large", value: "text-2xl md:text-3xl" }
        ],
        default: "text-xl md:text-2xl"
    },
    {
        name: "letterSpacing",
        label: "Letter Spacing",
        type: "select",
        group: "Typography",
        options: [
            { label: "Tighter", value: "tracking-tighter" },
            { label: "Tight", value: "tracking-tight" },
            { label: "Normal", value: "tracking-normal" },
            { label: "Wide", value: "tracking-wide" },
            { label: "Wider", value: "tracking-wider" }
        ],
        default: "tracking-tight"
    }
]

"use client"

import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { motion } from "framer-motion"

interface LogoCloudBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const LogoCloudBlock = ({ block, onChange, selected }: LogoCloudBlockProps) => {
    const { 
        title, 
        logos = [], 
        backgroundType = "color",
        backgroundColor = "transparent",
        backgroundGradient,
        backgroundBlur = 0,
        backgroundPattern = "none",
        showOverlay = false,
        overlayOpacity = 50,
        paddingTop = "py-12",
        paddingBottom = "py-12",
        animation = "fade",
        animationMode = "static",
        marqueeSpeed = "medium",
    } = block.props

    const handleChange = (key: string, value: any) => {
        onChange(block.id, { ...block.props, [key]: value })
    }

    const handleLogoUpdate = (index: number, field: string, value: any) => {
        const newLogos = [...logos]
        newLogos[index] = { ...newLogos[index], [field]: value }
        handleChange("logos", newLogos)
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
            <div className="max-w-7xl mx-auto space-y-10">
                {title && (
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={getItemVariants() as any}
                        className="text-center"
                    >
                        <InlineText
                            value={title}
                            onChange={(val) => handleChange("title", val)}
                            tagName="p"
                            className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60"
                            editable={selected}
                        />
                    </motion.div>
                )}

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {animationMode === "marquee" ? (
                        <div className="relative overflow-hidden opacity-60 hover:opacity-100 transition-all duration-700">
                            <div
                                className="flex items-center gap-x-12 md:gap-x-20 whitespace-nowrap animate-marquee"
                                style={{
                                    animationDuration: marqueeSpeed === "fast" ? "15s" : marqueeSpeed === "slow" ? "40s" : "25s",
                                }}
                            >
                                {/* First set of logos */}
                                {logos.map((logo: any, i: number) => (
                                    <div
                                        key={`a-${i}`}
                                        className="h-8 md:h-10 w-auto flex-shrink-0 flex items-center justify-center group relative grayscale"
                                    >
                                        {logo.src ? (
                                            <img
                                                src={logo.src}
                                                alt={logo.alt || "Brand Logo"}
                                                className="h-full w-auto object-contain transition-transform group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="h-full px-4 flex items-center justify-center border-2 border-dashed rounded-lg text-[10px] font-bold uppercase text-muted-foreground/40">
                                                Logo
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {/* Duplicate set for seamless loop */}
                                {logos.map((logo: any, i: number) => (
                                    <div
                                        key={`b-${i}`}
                                        className="h-8 md:h-10 w-auto flex-shrink-0 flex items-center justify-center group relative grayscale"
                                    >
                                        {logo.src ? (
                                            <img
                                                src={logo.src}
                                                alt={logo.alt || "Brand Logo"}
                                                className="h-full w-auto object-contain transition-transform group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="h-full px-4 flex items-center justify-center border-2 border-dashed rounded-lg text-[10px] font-bold uppercase text-muted-foreground/40">
                                                Logo
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <style jsx>{`
                                @keyframes marquee {
                                    0% { transform: translateX(0); }
                                    100% { transform: translateX(-50%); }
                                }
                                .animate-marquee {
                                    animation: marquee linear infinite;
                                }
                            `}</style>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-20 opacity-60 grayscale hover:opacity-100 transition-all duration-700">
                            {logos.map((logo: any, i: number) => (
                                <motion.div 
                                    key={i}
                                    variants={getItemVariants() as any}
                                    className="h-8 md:h-10 w-auto flex items-center justify-center group relative"
                                >
                                    {logo.src ? (
                                        <img src={logo.src} alt={logo.alt || "Brand Logo"} className="h-full w-auto object-contain transition-transform group-hover:scale-110" />
                                    ) : (
                                        <div className="h-full px-4 flex items-center justify-center border-2 border-dashed rounded-lg text-[10px] font-bold uppercase text-muted-foreground/40">Logo</div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}

export const logoCloudBlockSchema: PropSchema[] = [
    { name: "title", label: "Intro Text", type: "text", group: "Content" },
    {
        name: "logos",
        label: "Brand Logos",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "src", label: "Logo URL", type: "image" },
            { name: "alt", label: "Alt Text", type: "text" }
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
            { label: "None", value: "none" }
        ],
        default: "fade"
    },
    {
        name: "animationMode",
        label: "Logo Animation Mode",
        type: "select",
        group: "Style",
        options: [
            { label: "Static Row", value: "static" },
            { label: "Marquee (Infinite)", value: "marquee" },
        ],
        default: "static",
    },
    {
        name: "marqueeSpeed",
        label: "Marquee Speed",
        type: "select",
        group: "Style",
        options: [
            { label: "Slow", value: "slow" },
            { label: "Medium", value: "medium" },
            { label: "Fast", value: "fast" },
        ],
        default: "medium",
    },
    {
        name: "paddingTop",
        label: "Top Padding",
        type: "select",
        group: "Layout",
        options: [
            { label: "None", value: "py-0" },
            { label: "Small", value: "py-8" },
            { label: "Medium", value: "py-12" },
            { label: "Large", value: "py-24" }
        ],
        default: "py-12"
    },
    {
        name: "paddingBottom",
        label: "Bottom Padding",
        type: "select",
        group: "Layout",
        options: [
            { label: "None", value: "py-0" },
            { label: "Small", value: "py-8" },
            { label: "Medium", value: "py-12" },
            { label: "Large", value: "py-24" }
        ],
        default: "py-12"
    }
]

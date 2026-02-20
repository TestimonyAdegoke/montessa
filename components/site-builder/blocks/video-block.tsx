"use client"

import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { motion } from "framer-motion"
import { Play } from "lucide-react"

interface VideoBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const VideoBlock = ({ block, onChange, selected }: VideoBlockProps) => {
    const { 
        url, 
        aspectRatio = "16/9", 
        autoPlay = false, 
        loop = false, 
        muted = false,
        controls = true,
        title,
        paddingTop = "py-20",
        paddingBottom = "py-20",
        backgroundType = "color",
        backgroundColor = "transparent",
        backgroundGradient,
        backgroundBlur = 0,
        backgroundPattern = "none",
        showOverlay = false,
        overlayOpacity = 50,
        animation = "fade"
    } = block.props

    const getEmbedUrl = (url: string) => {
        if (!url) return ""
        
        // YouTube
        const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/)
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
        
        // Vimeo
        const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(.+)/)
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
        
        return url
    }

    const embedUrl = getEmbedUrl(url)

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

    return (
        <section className={cn(
            "relative px-6 md:px-12 overflow-hidden",
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
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={getVariants() as any}
                    className={cn(
                        "relative w-full overflow-hidden rounded-[32px] shadow-2xl bg-black",
                        aspectRatio === "16/9" && "aspect-video",
                        aspectRatio === "4/3" && "aspect-[4/3]",
                        aspectRatio === "1/1" && "aspect-square"
                    )}
                >
                    {embedUrl ? (
                        <iframe
                            src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}${autoPlay ? 'autoplay=1&' : ''}${loop ? 'loop=1&' : ''}${muted ? 'muted=1&' : ''}${!controls ? 'controls=0&' : ''}`}
                            className="absolute inset-0 w-full h-full border-0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title={title || "Video content"}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 space-y-4">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Play className="w-10 h-10" />
                                </motion.div>
                            </div>
                            <p className="text-sm font-medium tracking-tight">Enter a YouTube or Vimeo URL to start</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}

export const videoBlockSchema: PropSchema[] = [
    { name: "url", label: "Video URL (YouTube/Vimeo)", type: "text", group: "Content" },
    { name: "title", label: "Video Title", type: "text", group: "Content" },
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
    { name: "autoPlay", label: "Auto Play", type: "boolean", group: "Settings" },
    { name: "loop", label: "Loop Video", type: "boolean", group: "Settings" },
    { name: "muted", label: "Muted", type: "boolean", group: "Settings" },
    { name: "controls", label: "Show Controls", type: "boolean", group: "Settings" },
    {
        name: "paddingTop",
        label: "Top Padding",
        type: "select",
        group: "Layout",
        options: [
            { label: "None", value: "py-0" },
            { label: "Small", value: "py-12" },
            { label: "Medium", value: "py-20" },
            { label: "Large", value: "py-32" }
        ],
        default: "py-20"
    },
    {
        name: "paddingBottom",
        label: "Bottom Padding",
        type: "select",
        group: "Layout",
        options: [
            { label: "None", value: "py-0" },
            { label: "Small", value: "py-12" },
            { label: "Medium", value: "py-20" },
            { label: "Large", value: "py-32" }
        ],
        default: "py-20"
    }
]

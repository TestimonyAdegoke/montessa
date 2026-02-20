"use client"

import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { motion } from "framer-motion"
import { Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NewsletterBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const NewsletterBlock = ({ block, onChange, selected }: NewsletterBlockProps) => {
    const variants = {
        none: { opacity: 1, y: 0, scale: 1 },
        fade: { opacity: 0 },
        slideUp: { opacity: 0, y: 30 },
        zoom: { opacity: 0, scale: 0.95 }
    }

    const { 
        title, 
        description, 
        placeholder = "Enter your email",
        buttonText = "Subscribe",
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
                        backgroundPattern === "grid" && "bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:40px_40px]"
                    )} />
                )}
                {showOverlay && (
                    <div 
                        className="absolute inset-0 bg-black" 
                        style={{ opacity: overlayOpacity / 100 }}
                    />
                )}
            </div>
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="bg-card border border-muted-foreground/10 p-8 md:p-16 rounded-[48px] shadow-2xl flex flex-col items-center text-center space-y-8 relative overflow-hidden group"
                >
                    <motion.div variants={getItemVariants() as any} className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Mail className="w-10 h-10" />
                    </motion.div>

                    <motion.div variants={getItemVariants() as any} className="space-y-4 max-w-2xl">
                        <InlineText
                            value={title}
                            onChange={(val) => handleChange("title", val)}
                            tagName="h2"
                            className="text-3xl md:text-5xl font-black tracking-tight leading-tight"
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
                    </motion.div>

                    <motion.form variants={getItemVariants() as any} className="w-full max-w-md flex flex-col sm:flex-row gap-3 pt-4" onSubmit={(e) => e.preventDefault()}>
                        <Input 
                            type="email"
                            placeholder={placeholder}
                            className="h-14 rounded-2xl border-muted-foreground/10 bg-muted/5 px-6 font-medium text-base focus:ring-primary/20"
                        />
                        <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            {buttonText}
                            <Send className="ml-2 h-4 w-4" />
                        </Button>
                    </motion.form>
                    
                    <motion.p variants={getItemVariants() as any} className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                        Join 2,000+ parents and stay updated
                    </motion.p>
                </motion.div>
            </div>
        </section>
    )
}

export const newsletterBlockSchema: PropSchema[] = [
    { name: "title", label: "Heading", type: "text", group: "Content" },
    { name: "description", label: "Description", type: "textarea", group: "Content" },
    { name: "placeholder", label: "Input Placeholder", type: "text", group: "Content" },
    { name: "buttonText", label: "Button Label", type: "text", group: "Content" },
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
        name: "paddingTop",
        label: "Top Padding",
        type: "select",
        group: "Layout",
        options: [
            { label: "None", value: "py-0" },
            { label: "Small", value: "py-12" },
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
            { label: "Small", value: "py-12" },
            { label: "Medium", value: "py-24" },
            { label: "Large", value: "py-32" }
        ],
        default: "py-24"
    }
]

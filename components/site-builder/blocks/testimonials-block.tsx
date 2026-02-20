"use client"

import { Button } from "@/components/ui/button"
import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { Quote, Plus } from "lucide-react"

import { motion } from "framer-motion"
import { useDevice, getResponsiveGridClasses } from "../device-context"

interface TestimonialsBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const TestimonialsBlock = ({ block, onChange, selected }: TestimonialsBlockProps) => {
    const { device } = useDevice()
    const { 
        title, 
        subtitle, 
        testimonials = [], 
        columns = 3, 
        bg = "light",
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

    const handleTestimonialUpdate = (index: number, field: string, value: any) => {
        const newItems = [...testimonials]
        newItems[index] = { ...newItems[index], [field]: value }
        handleChange("testimonials", newItems)
    }

    const addTestimonial = () => {
        handleChange("testimonials", [...testimonials, {
            name: "Jane Doe",
            role: "Parent",
            quote: "This school has been amazing for my child's growth. The teachers are incredibly supportive and the curriculum is engaging.",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        }])
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
        <section className={cn(
            "px-4 sm:px-6 md:px-12 relative overflow-hidden",
            "py-16 md:py-24",
            bg === "light" && backgroundType === "color" && backgroundColor === "transparent" && "bg-background",
            bg === "dark" && "bg-foreground text-background",
            bg === "muted" && "bg-muted/30",
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
            <div className="max-w-7xl mx-auto space-y-16">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={getItemVariants() as any}
                    className="text-center max-w-2xl mx-auto space-y-4"
                >
                    <InlineText
                        value={subtitle}
                        onChange={(val) => handleChange("subtitle", val)}
                        tagName="span"
                        className="text-primary font-bold tracking-[0.2em] uppercase"
                        style={{ fontSize: 'clamp(10px, 1.2vw, 12px)' }}
                        editable={selected}
                    />
                    <InlineText
                        value={title}
                        onChange={(val) => handleChange("title", val)}
                        tagName="h2"
                        className="font-black tracking-tight leading-[1.1]"
                        style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
                        editable={selected}
                    />
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={cn(
                        "grid gap-6",
                        "grid-cols-1 sm:grid-cols-2",
                        columns === 3 && "lg:grid-cols-3"
                    )}
                >
                    {testimonials.map((item: any, i: number) => (
                        <motion.div 
                            key={i}
                            variants={getItemVariants() as any}
                            className="bg-card rounded-[32px] p-10 border shadow-xl relative group hover:-translate-y-2 transition-all duration-500 hover:border-primary/20"
                        >
                            <Quote className="absolute top-8 right-8 h-10 w-10 text-primary/10" />
                            <div className="flex flex-col h-full justify-between space-y-8">
                                <InlineText
                                    value={item.quote}
                                    onChange={(val) => handleTestimonialUpdate(i, "quote", val)}
                                    tagName="p"
                                    className="text-muted-foreground italic leading-relaxed font-medium"
                                    style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
                                    multiline
                                    editable={selected}
                                />

                                <div className="flex items-center gap-5 pt-6 border-t border-muted-foreground/10">
                                    <div className="h-14 w-14 rounded-2xl bg-muted overflow-hidden shrink-0 shadow-inner">
                                        {item.avatar ? (
                                            <img src={item.avatar} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-primary/20" />
                                        )}
                                    </div>
                                    <div>
                                        <InlineText
                                            value={item.name}
                                            onChange={(val) => handleTestimonialUpdate(i, "name", val)}
                                            tagName="h4"
                                            className="font-black tracking-tight"
                                            style={{ fontSize: 'clamp(16px, 2vw, 18px)' }}
                                            editable={selected}
                                        />
                                        <InlineText
                                            value={item.role}
                                            onChange={(val) => handleTestimonialUpdate(i, "role", val)}
                                            tagName="p"
                                            className="text-muted-foreground uppercase font-bold tracking-[0.1em]"
                                            style={{ fontSize: 'clamp(10px, 1.2vw, 12px)' }}
                                            editable={selected}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {selected && (
                        <motion.div
                            variants={getItemVariants() as any}
                            className="flex items-center justify-center p-8 border-2 border-dashed rounded-[32px] cursor-pointer hover:border-primary/50 transition-all min-h-[200px] opacity-50 hover:opacity-100"
                            onClick={addTestimonial}
                        >
                            <div className="text-center space-y-2">
                                <Plus className="h-6 w-6 mx-auto text-muted-foreground" />
                                <span className="text-sm font-bold tracking-tight">Add Testimonial</span>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}

export const testimonialsBlockSchema: PropSchema[] = [
    { name: "subtitle", label: "Category", type: "text", group: "Content" },
    { name: "title", label: "Heading", type: "text", group: "Content" },
    {
        name: "testimonials",
        label: "Reviews",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "name", label: "Name", type: "text" },
            { name: "role", label: "Role/Title", type: "text" },
            { name: "quote", label: "Quote", type: "textarea" },
            { name: "avatar", label: "Avatar URL", type: "image" }
        ]
    },
    {
        name: "columns",
        label: "Columns",
        type: "select",
        group: "Layout",
        options: [
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" }
        ]
    },
    {
        name: "bg",
        label: "Style Preset",
        type: "select",
        group: "Style",
        options: [
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
            { label: "Muted", value: "muted" }
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
    }
]

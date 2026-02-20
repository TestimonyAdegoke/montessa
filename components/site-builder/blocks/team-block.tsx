"use client"

import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { motion } from "framer-motion"
import { Linkedin, Twitter, Github, Mail } from "lucide-react"

interface TeamBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const TeamBlock = ({ block, onChange, selected }: TeamBlockProps) => {
    const variants = {
        none: { opacity: 1, y: 0, scale: 1 },
        fade: { opacity: 0 },
        slideUp: { opacity: 0, y: 30 },
        zoom: { opacity: 0, scale: 0.95 }
    }

    const { 
        title, 
        subtitle, 
        members = [], 
        columns = 3,
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

    const handleMemberUpdate = (index: number, field: string, value: any) => {
        const newMembers = [...members]
        newMembers[index] = { ...newMembers[index], [field]: value }
        handleChange("members", newMembers)
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
            <div className="max-w-7xl mx-auto space-y-16">
                <motion.div 
                    initial={animation === "none" ? { opacity: 1 } : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-2xl mx-auto space-y-4"
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
                        className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]"
                        editable={selected}
                    />
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={cn(
                        "grid gap-12",
                        columns === 2 && "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto",
                        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                        columns === 4 && "grid-cols-2 lg:grid-cols-4"
                    )}
                >
                    {members.map((member: any, i: number) => (
                        <motion.div 
                            key={i}
                            variants={getItemVariants() as any}
                            className="group flex flex-col items-center text-center space-y-6"
                        >
                            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-[40px] overflow-hidden shadow-2xl border-4 border-background group-hover:scale-105 transition-all duration-500 group-hover:shadow-primary/20">
                                {member.image ? (
                                    <img src={member.image} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">No Image</div>
                                )}
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg">
                                        <Twitter className="w-4 h-4" />
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg">
                                        <Linkedin className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <InlineText
                                    value={member.name}
                                    onChange={(val) => handleMemberUpdate(i, "name", val)}
                                    tagName="h3"
                                    className="text-xl font-bold tracking-tight uppercase"
                                    editable={selected}
                                />
                                <InlineText
                                    value={member.role}
                                    onChange={(val) => handleMemberUpdate(i, "role", val)}
                                    tagName="p"
                                    className="text-sm text-primary font-black uppercase tracking-widest"
                                    editable={selected}
                                />
                                <InlineText
                                    value={member.bio}
                                    onChange={(val) => handleMemberUpdate(i, "bio", val)}
                                    tagName="p"
                                    className="text-sm text-muted-foreground max-w-[200px] leading-relaxed pt-2"
                                    multiline
                                    editable={selected}
                                />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export const teamBlockSchema: PropSchema[] = [
    { name: "title", label: "Heading", type: "text", group: "Content" },
    { name: "subtitle", label: "Subheading", type: "text", group: "Content" },
    {
        name: "members",
        label: "Team Members",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "name", label: "Name", type: "text" },
            { name: "role", label: "Role", type: "text" },
            { name: "bio", label: "Bio", type: "textarea" },
            { name: "image", label: "Profile Image", type: "image" }
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
            { label: "Mesh", value: "mesh" },
            { label: "Waves", value: "waves" },
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
        name: "columns",
        label: "Grid Columns",
        type: "select",
        group: "Layout",
        options: [
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" },
            { label: "4 Columns", value: "4" }
        ],
        default: "3"
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

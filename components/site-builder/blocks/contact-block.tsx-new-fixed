"use client"

import { Button } from "@/components/ui/button"
import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Send } from "lucide-react"

interface ContactBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const ContactBlock = ({ block, onChange, selected }: ContactBlockProps) => {
    const { 
        title, 
        subtitle, 
        description,
        email,
        phone,
        address,
        submitText = "Send Message",
        showDetails = true,
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
        const anim = animation || "fade"
        if (anim === "none") return itemVariants.none;
        return itemVariants[anim as keyof typeof itemVariants] || itemVariants.fade;
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
                    className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
                >
                    {/* Left: Info */}
                    <motion.div 
                        variants={getItemVariants() as any}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
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
                                className="text-4xl md:text-6xl font-black tracking-tight leading-tight"
                                editable={selected}
                            />
                            <InlineText
                                value={description}
                                onChange={(val) => handleChange("description", val)}
                                tagName="p"
                                className="text-lg text-muted-foreground leading-relaxed font-medium max-w-md"
                                multiline
                                editable={selected}
                            />
                        </div>

                        {showDetails && (
                            <div className="space-y-6 pt-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Email Us</p>
                                        <InlineText
                                            value={email}
                                            onChange={(val) => handleChange("email", val)}
                                            tagName="p"
                                            className="text-lg font-bold"
                                            editable={selected}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Call Us</p>
                                        <InlineText
                                            value={phone}
                                            onChange={(val) => handleChange("phone", val)}
                                            tagName="p"
                                            className="text-lg font-bold"
                                            editable={selected}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Visit Us</p>
                                        <InlineText
                                            value={address}
                                            onChange={(val) => handleChange("address", val)}
                                            tagName="p"
                                            className="text-lg font-bold"
                                            editable={selected}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Right: Form */}
                    <motion.div 
                        variants={getItemVariants() as any}
                        className="bg-card border border-muted-foreground/10 p-8 md:p-12 rounded-[40px] shadow-2xl space-y-6 relative overflow-hidden"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Full Name</Label>
                                <Input placeholder="John Doe" className="h-12 rounded-xl bg-muted/5 border-muted-foreground/10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Email Address</Label>
                                <Input placeholder="john@example.com" type="email" className="h-12 rounded-xl bg-muted/5 border-muted-foreground/10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Subject</Label>
                            <Input placeholder="How can we help?" className="h-12 rounded-xl bg-muted/5 border-muted-foreground/10" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Message</Label>
                            <Textarea placeholder="Tell us more about your inquiry..." className="min-h-[150px] rounded-xl bg-muted/5 border-muted-foreground/10 resize-none" />
                        </div>
                        <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                            {submitText}
                            <Send className="ml-2 h-4 w-4" />
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export const contactBlockSchema: PropSchema[] = [
    { name: "title", label: "Heading", type: "text", group: "Content" },
    { name: "subtitle", label: "Subheading", type: "text", group: "Content" },
    { name: "description", label: "Description", type: "textarea", group: "Content" },
    { name: "email", label: "Email Address", type: "text", group: "Details" },
    { name: "phone", label: "Phone Number", type: "text", group: "Details" },
    { name: "address", label: "Office Address", type: "text", group: "Details" },
    { name: "submitText", label: "Button Label", type: "text", group: "Details" },
    { name: "showDetails", label: "Show Contact Details", type: "boolean", group: "Details" },
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

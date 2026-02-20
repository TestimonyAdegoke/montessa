"use client"

import { Button } from "@/components/ui/button"
import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { Star, Zap, GraduationCap, CheckCircle, Plus, Heart, Shield, Award, Target, Lightbulb, Rocket, Globe, Users, BookOpen, Building, Phone, Mail, MapPin, Clock, Calendar, Check } from "lucide-react"

// Icon mapping for rendering
const ICON_MAP: Record<string, any> = {
    star: Star,
    zap: Zap,
    heart: Heart,
    shield: Shield,
    award: Award,
    target: Target,
    lightbulb: Lightbulb,
    rocket: Rocket,
    globe: Globe,
    users: Users,
    book: BookOpen,
    graduation: GraduationCap,
    building: Building,
    phone: Phone,
    mail: Mail,
    location: MapPin,
    clock: Clock,
    calendar: Calendar,
    check: Check,
}

import { motion } from "framer-motion"
import { useDevice, getResponsiveGridClasses } from "../device-context"

interface FeaturesBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const FeaturesBlock = ({ block, onChange, selected }: FeaturesBlockProps) => {
    const { device } = useDevice()
    const { 
        title, 
        description, 
        features = [], 
        iconStyle = "circle", 
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

    const handleFeatureUpdate = (index: number, field: string, value: any) => {
        const newFeatures = [...features]
        newFeatures[index] = { ...newFeatures[index], [field]: value }
        handleChange("features", newFeatures)
    }

    const addFeature = () => {
        handleChange("features", [...features, { title: "New Feature", description: "Details..." }])
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
                "px-4 sm:px-6 md:px-12 relative overflow-hidden",
                "py-16 md:py-24",
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
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={getItemVariants() as any}
                    className="text-center max-w-2xl mx-auto space-y-4"
                >
                    <InlineText
                        value={title}
                        onChange={(val) => handleChange("title", val)}
                        tagName="h2"
                        className="font-black tracking-tight leading-[1.1]"
                        style={{ fontSize: 'clamp(28px, 5vw, 56px)' }}
                        editable={selected}
                    />
                    <InlineText
                        value={description}
                        onChange={(val) => handleChange("description", val)}
                        tagName="p"
                        className="text-muted-foreground leading-relaxed font-medium"
                        style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
                        multiline
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
                        columns === 3 && "lg:grid-cols-3",
                        columns === 4 && "lg:grid-cols-4"
                    )}
                >
                    {features.map((feature: any, i: number) => (
                        <motion.div 
                            key={i} 
                            variants={getItemVariants() as any}
                            className="bg-card border border-muted-foreground/10 p-8 rounded-[32px] shadow-xl hover:-translate-y-2 transition-all duration-500 group"
                        >
                            <div className={cn(
                                "w-14 h-14 mb-6 flex items-center justify-center text-primary transition-transform duration-500 group-hover:scale-110 overflow-hidden",
                                iconStyle === "circle" && "rounded-full bg-primary/10 shadow-inner",
                                iconStyle === "square" && "rounded-2xl bg-primary/10 shadow-inner",
                                iconStyle === "none" && "hidden"
                            )}>
                                {feature.customIcon ? (
                                    <img
                                        src={feature.customIcon}
                                        alt={feature.title || "Feature icon"}
                                        className="w-8 h-8 object-contain"
                                    />
                                ) : feature.image ? (
                                    <img
                                        src={feature.image}
                                        alt={feature.title || "Feature icon"}
                                        className="w-8 h-8 object-contain"
                                    />
                                ) : feature.icon && ICON_MAP[feature.icon] ? (
                                    (() => {
                                        const IconComp = ICON_MAP[feature.icon]
                                        return <IconComp className="w-6 h-6" />
                                    })()
                                ) : (
                                    <Star className="w-6 h-6 opacity-40" />
                                )}
                            </div>
                            <div className="space-y-3">
                                <InlineText
                                    value={feature.title}
                                    onChange={(val) => handleFeatureUpdate(i, "title", val)}
                                    tagName="h3"
                                    className="font-bold tracking-tight uppercase"
                                    style={{ fontSize: 'clamp(18px, 2.5vw, 22px)' }}
                                    editable={selected}
                                />
                                <InlineText
                                    value={feature.description}
                                    onChange={(val) => handleFeatureUpdate(i, "description", val)}
                                    tagName="p"
                                    className="text-muted-foreground leading-relaxed"
                                    style={{ fontSize: 'clamp(14px, 1.8vw, 16px)' }}
                                    multiline
                                    editable={selected}
                                />
                            </div>
                        </motion.div>
                    ))}
                    {selected && (
                        <motion.div 
                            variants={getItemVariants() as any}
                            className="flex items-center justify-center p-8 border-2 border-dashed rounded-[32px] cursor-pointer hover:border-primary/50 transition-all min-h-[200px] opacity-50 hover:opacity-100" 
                            onClick={addFeature}
                        >
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold tracking-tight">Add Feature</span>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}

export const featuresBlockSchema: PropSchema[] = [
    { name: "title", label: "Heading", type: "text", group: "Content" },
    { name: "description", label: "Intro Text", type: "textarea", group: "Content" },
    {
        name: "features",
        label: "Features List",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "title", label: "Feature Name", type: "text" },
            { name: "description", label: "Detail", type: "textarea" },
            { name: "icon", label: "Icon", type: "text" },
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
        name: "iconStyle",
        label: "Icon Format",
        type: "select",
        group: "Style",
        options: [
            { label: "Rounded", value: "circle" },
            { label: "Square", value: "badge" },
            { label: "Plain", value: "none" }
        ]
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

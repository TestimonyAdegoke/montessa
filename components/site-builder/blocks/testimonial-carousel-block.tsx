"use client"

import { useState, useEffect } from "react"
import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Star, Plus, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TestimonialCarouselBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const TestimonialCarouselBlock = ({ block, onChange, selected }: TestimonialCarouselBlockProps) => {
    const {
        title,
        subtitle,
        testimonials = [],
        autoPlay = false,
        autoPlayDelay = 5,
        showStars = true,
        variant = "cards",
        backgroundType = "color",
        backgroundColor = "transparent",
        backgroundGradient,
        backgroundPattern = "none",
        animation = "fade",
        paddingTop = "py-24",
        paddingBottom = "py-24"
    } = block.props

    const [currentIndex, setCurrentIndex] = useState(0)

    const handleChange = (key: string, value: any) => {
        onChange(block.id, { ...block.props, [key]: value })
    }

    const handleTestimonialUpdate = (index: number, field: string, value: any) => {
        const newTestimonials = [...testimonials]
        newTestimonials[index] = { ...newTestimonials[index], [field]: value }
        handleChange("testimonials", newTestimonials)
    }

    const addTestimonial = () => {
        handleChange("testimonials", [...testimonials, {
            name: "New Person",
            role: "Role",
            company: "Company",
            quote: "This is an amazing testimonial...",
            avatar: "",
            rating: 5
        }])
    }

    const next = () => setCurrentIndex((prev) => (prev + 1) % Math.max(testimonials.length, 1))
    const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % Math.max(testimonials.length, 1))

    const variants = {
        none: { opacity: 1 },
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
        if (animation === "none") return variants.none
        return variants[animation as keyof typeof variants] || variants.fade
    }

    const currentTestimonial = testimonials[currentIndex]

    // Auto-play only for spotlight variant to mimic a continuous carousel
    useEffect(() => {
        if (!autoPlay || variant !== "spotlight" || testimonials.length <= 1) return

        const delayMs = Math.max(autoPlayDelay, 2) * 1000
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % Math.max(testimonials.length, 1))
        }, delayMs)

        return () => clearInterval(timer)
    }, [autoPlay, autoPlayDelay, testimonials.length, variant])

    return (
        <section
            className={cn(
                "px-6 md:px-12 relative overflow-hidden",
                paddingTop,
                paddingBottom,
                selected && "ring-2 ring-primary ring-offset-2"
            )}
            style={{
                backgroundColor: backgroundType === "color" ? backgroundColor : undefined,
                background: backgroundType === "gradient" ? backgroundGradient : undefined
            }}
        >
            {backgroundPattern !== "none" && (
                <div className={cn(
                    "absolute inset-0 opacity-[0.03]",
                    backgroundPattern === "dots" && "bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]",
                    backgroundPattern === "grid" && "bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:40px_40px]",
                    backgroundPattern === "mesh" && "bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%,transparent)] [background-size:20px_20px]",
                    backgroundPattern === "waves" && "bg-[radial-gradient(circle_at_0_50%,transparent_9px,#000_10px,transparent_11px),radial-gradient(circle_at_100%_50%,transparent_9px,#000_10px,transparent_11px)] [background-size:20px_40px]"
                )} />
            )}

            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={getVariants() as any}
                    className="text-center space-y-4"
                >
                    {subtitle && (
                        <InlineText
                            value={subtitle}
                            onChange={(val) => handleChange("subtitle", val)}
                            tagName="p"
                            className="text-sm font-bold uppercase tracking-widest text-primary"
                            editable={selected}
                        />
                    )}
                    <InlineText
                        value={title}
                        onChange={(val) => handleChange("title", val)}
                        tagName="h2"
                        className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]"
                        editable={selected}
                    />
                </motion.div>

                {/* Carousel */}
                {testimonials.length > 0 && (
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={getVariants() as any}
                    >
                        {variant === "spotlight" ? (
                            /* Spotlight variant — single large testimonial */
                            <div className="relative">
                                <AnimatePresence mode="wait">
                                    {currentTestimonial && (
                                        <motion.div
                                            key={currentIndex}
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            transition={{ duration: 0.4, ease: "easeInOut" }}
                                            className="text-center space-y-8 py-8"
                                        >
                                            <Quote className="h-12 w-12 text-primary/20 mx-auto" />

                                            <InlineText
                                                value={currentTestimonial.quote}
                                                onChange={(val) => handleTestimonialUpdate(currentIndex, "quote", val)}
                                                tagName="p"
                                                className="text-2xl md:text-3xl font-medium leading-relaxed max-w-3xl mx-auto italic"
                                                multiline
                                                editable={selected}
                                            />

                                            {showStars && currentTestimonial.rating && (
                                                <div className="flex justify-center gap-1">
                                                    {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                                                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-center gap-4">
                                                {currentTestimonial.avatar && (
                                                    <img
                                                        src={currentTestimonial.avatar}
                                                        alt={currentTestimonial.name}
                                                        className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                                                    />
                                                )}
                                                <div className="text-left">
                                                    <InlineText
                                                        value={currentTestimonial.name}
                                                        onChange={(val) => handleTestimonialUpdate(currentIndex, "name", val)}
                                                        tagName="p"
                                                        className="font-bold text-lg"
                                                        editable={selected}
                                                    />
                                                    <InlineText
                                                        value={`${currentTestimonial.role}${currentTestimonial.company ? ` at ${currentTestimonial.company}` : ""}`}
                                                        onChange={(val) => handleTestimonialUpdate(currentIndex, "role", val)}
                                                        tagName="p"
                                                        className="text-sm text-muted-foreground"
                                                        editable={selected}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Navigation */}
                                <div className="flex items-center justify-center gap-4 mt-8">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full h-10 w-10"
                                        onClick={prev}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <div className="flex gap-2">
                                        {testimonials.map((_: any, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentIndex(i)}
                                                className={cn(
                                                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                                    i === currentIndex ? "bg-primary w-8" : "bg-muted-foreground/20 hover:bg-muted-foreground/40"
                                                )}
                                            />
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full h-10 w-10"
                                        onClick={next}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* Cards variant — scrollable cards */
                            <div className="relative">
                                <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                                    {testimonials.map((testimonial: any, i: number) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex-shrink-0 w-[350px] snap-center"
                                        >
                                            <div className="bg-card border border-muted-foreground/10 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
                                                {showStars && testimonial.rating && (
                                                    <div className="flex gap-1 mb-4">
                                                        {Array.from({ length: testimonial.rating }).map((_, j) => (
                                                            <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        ))}
                                                    </div>
                                                )}

                                                <InlineText
                                                    value={testimonial.quote}
                                                    onChange={(val) => handleTestimonialUpdate(i, "quote", val)}
                                                    tagName="p"
                                                    className="text-base leading-relaxed flex-1 mb-6"
                                                    multiline
                                                    editable={selected}
                                                />

                                                <div className="flex items-center gap-3 pt-4 border-t border-muted-foreground/10">
                                                    {testimonial.avatar ? (
                                                        <img
                                                            src={testimonial.avatar}
                                                            alt={testimonial.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                            {testimonial.name?.charAt(0) || "?"}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <InlineText
                                                            value={testimonial.name}
                                                            onChange={(val) => handleTestimonialUpdate(i, "name", val)}
                                                            tagName="p"
                                                            className="font-bold text-sm"
                                                            editable={selected}
                                                        />
                                                        <InlineText
                                                            value={testimonial.role}
                                                            onChange={(val) => handleTestimonialUpdate(i, "role", val)}
                                                            tagName="p"
                                                            className="text-xs text-muted-foreground"
                                                            editable={selected}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Add button when selected */}
                {selected && (
                    <div className="flex justify-center">
                        <Button variant="outline" size="sm" onClick={addTestimonial} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Testimonial
                        </Button>
                    </div>
                )}
            </div>
        </section>
    )
}

export const testimonialCarouselBlockSchema: PropSchema[] = [
    { name: "title", label: "Heading", type: "text", group: "Content" },
    { name: "subtitle", label: "Subtitle", type: "text", group: "Content" },
    {
        name: "variant",
        label: "Display Style",
        type: "select",
        group: "Style",
        options: [
            { label: "Scrollable Cards", value: "cards" },
            { label: "Spotlight (Single)", value: "spotlight" }
        ],
        default: "cards"
    },
    { name: "showStars", label: "Show Star Ratings", type: "boolean", group: "Style" },
    { name: "autoPlay", label: "Auto-play Spotlight", type: "boolean", group: "Behavior" },
    {
        name: "autoPlayDelay",
        label: "Auto-play Delay (seconds)",
        type: "number",
        group: "Behavior",
        min: 2,
        max: 30,
        step: 1,
        default: 5,
    },
    {
        name: "testimonials",
        label: "Testimonials",
        type: "array",
        group: "Content",
        arrayItemSchema: [
            { name: "name", label: "Name", type: "text" },
            { name: "role", label: "Role", type: "text" },
            { name: "company", label: "Company", type: "text" },
            { name: "quote", label: "Quote", type: "textarea" },
            { name: "avatar", label: "Avatar", type: "image" },
            { name: "rating", label: "Rating (1-5)", type: "number", min: 1, max: 5, step: 1 }
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

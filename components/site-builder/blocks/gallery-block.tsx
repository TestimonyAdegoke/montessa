"use client"

import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"

import { motion } from "framer-motion"

interface GalleryBlockProps {
  block: Block
  onChange: (id: string, props: any) => void
  selected?: boolean
}

export const GalleryBlock = ({ block, onChange, selected }: GalleryBlockProps) => {
    const variants = {
        none: { opacity: 1, y: 0, scale: 1 },
        fade: { opacity: 0 },
        slideUp: { opacity: 0, y: 30 },
        zoom: { opacity: 0, scale: 0.95 }
    }

    const { 
        title, 
        subtitle, 
        columns = 3, 
        images = [],
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

  const handleImageUpdate = (index: number, field: string, value: any) => {
    const next = [...images]
    next[index] = { ...next[index], [field]: value }
    handleChange("images", next)
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
            <div className="max-w-7xl mx-auto space-y-16">
                <motion.div 
                    initial={animation === "none" ? variants.none : variants[animation as keyof typeof variants]}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
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
                        "grid gap-6 md:gap-8",
                        columns === 2 && "grid-cols-1 sm:grid-cols-2",
                        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                        columns === 4 && "grid-cols-2 lg:grid-cols-4"
                    )}
                >
                    {images.map((img: any, i: number) => (
                        <motion.figure
                            key={i}
                            variants={getItemVariants() as any}
                            className="relative overflow-hidden rounded-[32px] border border-muted-foreground/10 bg-card shadow-xl group cursor-pointer aspect-[4/5] hover:-translate-y-2 transition-all duration-500"
                        >
                            {img.src ? (
                                <img
                                    src={img.src}
                                    alt={img.alt || ""}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted/20">
                                    No image set
                                </div>
                            )}
                            <motion.figcaption 
                                initial={{ opacity: 0, y: 20 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-all duration-500"
                            >
                                <InlineText
                                    value={img.label}
                                    onChange={(val) => handleImageUpdate(i, "label", val)}
                                    tagName="div"
                                    className="font-black text-xl tracking-tight mb-1"
                                    editable={selected}
                                />
                                <InlineText
                                    value={img.alt}
                                    onChange={(val) => handleImageUpdate(i, "alt", val)}
                                    tagName="div"
                                    className="text-sm text-white/70 font-medium line-clamp-2 leading-relaxed"
                                    multiline
                                    editable={selected}
                                />
                            </motion.figcaption>
                        </motion.figure>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export const galleryBlockSchema: PropSchema[] = [
  { name: "title", label: "Heading", type: "text", group: "Content" },
  { name: "subtitle", label: "Subheading", type: "text", group: "Content" },
  {
    name: "images",
    label: "Images",
    type: "array",
    group: "Content",
    arrayItemSchema: [
      { name: "src", label: "Image URL", type: "image" },
      { name: "label", label: "Label", type: "text" },
      { name: "alt", label: "Alt Text", type: "textarea" },
    ],
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
    name: "columns",
    label: "Columns",
    type: "select",
    group: "Layout",
    options: [
      { label: "2 Columns", value: "2" },
      { label: "3 Columns", value: "3" },
      { label: "4 Columns", value: "4" },
    ],
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
  { name: "paddingBottom", label: "Bottom Padding", type: "select", group: "Layout", options: [ { label: "None", value: "py-0" }, { label: "Small", value: "py-16" }, { label: "Medium", value: "py-24" }, { label: "Large", value: "py-32" } ], default: "py-24" },
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

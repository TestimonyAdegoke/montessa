"use client"

import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { motion } from "framer-motion"
import { useDevice } from "../device-context"
import { Database, FileText, Users, Image as ImageIcon } from "lucide-react"

interface CMSBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
    cmsData?: any[] // Injected CMS data
}

export const CMSBlock = ({ block, onChange, selected, cmsData = [] }: CMSBlockProps) => {
    const { device, isMobile, isTablet } = useDevice()
    const {
        title,
        subtitle,
        collectionSlug,
        displayMode = "grid",
        template = "cards",
        columns = 3,
        limit = 6,
        showImage = true,
        imageField = "image",
        titleField = "title",
        descriptionField = "description",
        linkField = "slug",
        backgroundType = "color",
        backgroundColor = "transparent",
        backgroundGradient,
        paddingTop = "py-24",
        paddingBottom = "py-24",
        animation = "fade"
    } = block.props

    const handleChange = (key: string, value: any) => {
        onChange(block.id, { ...block.props, [key]: value })
    }

    // Determine grid columns based on device
    const getGridCols = (): number => {
        if (isMobile) return 1
        if (isTablet) return Math.min(columns as number, 2)
        return columns as number
    }

    const gridColsMap: Record<number, string> = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
    }
    const colCount = getGridCols()
    const gridColsClass = gridColsMap[colCount] || "grid-cols-3"

    const animationVariants = {
        fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
        slideUp: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
        zoom: { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } },
        none: { initial: {}, animate: {} }
    }

    const variant = animationVariants[animation as keyof typeof animationVariants] || animationVariants.fade

    // Mock data for preview when no CMS data
    const previewData = cmsData.length > 0 ? cmsData.slice(0, limit) : [
        { id: "1", title: "Sample Item 1", description: "This is a preview of your CMS content.", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=400" },
        { id: "2", title: "Sample Item 2", description: "Connect a collection to display real content.", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=400" },
        { id: "3", title: "Sample Item 3", description: "Your content will appear here automatically.", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400" },
    ]

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
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                {(title || subtitle) && (
                    <motion.div
                        {...variant}
                        viewport={{ once: true }}
                        className="text-center space-y-4"
                    >
                        {subtitle && (
                            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">
                                {subtitle}
                            </span>
                        )}
                        {title && (
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                                {title}
                            </h2>
                        )}
                    </motion.div>
                )}

                {/* Collection indicator for editor */}
                {selected && !collectionSlug && (
                    <div className="bg-muted/50 border-2 border-dashed rounded-xl p-8 text-center">
                        <Database className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="font-medium">No collection connected</p>
                        <p className="text-sm text-muted-foreground">
                            Select a CMS collection in the sidebar to display dynamic content
                        </p>
                    </div>
                )}

                {/* Content Grid */}
                {(collectionSlug || !selected) && (
                    <>
                        {displayMode === "grid" && (
                            <div className={cn("grid gap-6", gridColsClass)}>
                                {previewData.map((item: any, index: number) => (
                                    <motion.div
                                        key={item.id || index}
                                        initial={variant.initial}
                                        whileInView={variant.animate}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        {template === "cards" && (
                                            <div className="bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-shadow group">
                                                {showImage && item[imageField] && (
                                                    <div className="aspect-video overflow-hidden">
                                                        <img 
                                                            src={item[imageField]} 
                                                            alt={item[titleField] || ""}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-6 space-y-2">
                                                    <h3 className="font-bold text-lg">{item[titleField]}</h3>
                                                    {item[descriptionField] && (
                                                        <p className="text-muted-foreground text-sm line-clamp-2">
                                                            {item[descriptionField]}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {template === "minimal" && (
                                            <div className="p-4 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer">
                                                <div className="flex items-start gap-4">
                                                    {showImage && item[imageField] && (
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                            <img 
                                                                src={item[imageField]} 
                                                                alt={item[titleField] || ""}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold group-hover:text-primary transition-colors">
                                                            {item[titleField]}
                                                        </h3>
                                                        {item[descriptionField] && (
                                                            <p className="text-muted-foreground text-sm line-clamp-1">
                                                                {item[descriptionField]}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {template === "detailed" && (
                                            <div className="bg-card rounded-2xl overflow-hidden border">
                                                <div className="flex flex-col md:flex-row">
                                                    {showImage && item[imageField] && (
                                                        <div className="md:w-1/3 aspect-square md:aspect-auto overflow-hidden">
                                                            <img 
                                                                src={item[imageField]} 
                                                                alt={item[titleField] || ""}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 p-6 space-y-4">
                                                        <h3 className="font-bold text-xl">{item[titleField]}</h3>
                                                        {item[descriptionField] && (
                                                            <p className="text-muted-foreground">
                                                                {item[descriptionField]}
                                                            </p>
                                                        )}
                                                        <button className="text-primary font-medium hover:underline">
                                                            Read more →
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {displayMode === "list" && (
                            <div className="space-y-4">
                                {previewData.map((item: any, index: number) => (
                                    <motion.div
                                        key={item.id || index}
                                        initial={variant.initial}
                                        whileInView={variant.animate}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-colors"
                                    >
                                        {showImage && item[imageField] && (
                                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                <img 
                                                    src={item[imageField]} 
                                                    alt={item[titleField] || ""}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold">{item[titleField]}</h3>
                                            {item[descriptionField] && (
                                                <p className="text-muted-foreground text-sm line-clamp-1">
                                                    {item[descriptionField]}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {displayMode === "carousel" && (
                            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
                                {previewData.map((item: any, index: number) => (
                                    <motion.div
                                        key={item.id || index}
                                        initial={variant.initial}
                                        whileInView={variant.animate}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex-shrink-0 w-80 snap-center"
                                    >
                                        <div className="bg-card rounded-2xl overflow-hidden border shadow-sm">
                                            {showImage && item[imageField] && (
                                                <div className="aspect-video overflow-hidden">
                                                    <img 
                                                        src={item[imageField]} 
                                                        alt={item[titleField] || ""}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-6 space-y-2">
                                                <h3 className="font-bold text-lg">{item[titleField]}</h3>
                                                {item[descriptionField] && (
                                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                                        {item[descriptionField]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    )
}

export const cmsBlockSchema: PropSchema[] = [
    { name: "subtitle", label: "Subtitle", type: "text", group: "Content" },
    { name: "title", label: "Title", type: "text", group: "Content" },
    { name: "collectionSlug", label: "Collection", type: "text", group: "Content" },
    { name: "limit", label: "Items to Show", type: "number", group: "Content", min: 1, max: 50 },
    {
        name: "displayMode",
        label: "Display Mode",
        type: "select",
        group: "Layout",
        options: [
            { label: "Grid", value: "grid" },
            { label: "List", value: "list" },
            { label: "Carousel", value: "carousel" }
        ]
    },
    {
        name: "template",
        label: "Card Template",
        type: "select",
        group: "Layout",
        options: [
            { label: "Cards", value: "cards" },
            { label: "Minimal", value: "minimal" },
            { label: "Detailed", value: "detailed" }
        ]
    },
    {
        name: "columns",
        label: "Columns",
        type: "select",
        group: "Layout",
        options: [
            { label: "1 Column", value: "1" },
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" },
            { label: "4 Columns", value: "4" }
        ]
    },
    { name: "showImage", label: "Show Images", type: "boolean", group: "Layout" },
    { name: "imageField", label: "Image Field", type: "text", group: "Field Mapping" },
    { name: "titleField", label: "Title Field", type: "text", group: "Field Mapping" },
    { name: "descriptionField", label: "Description Field", type: "text", group: "Field Mapping" },
    { name: "linkField", label: "Link Field", type: "text", group: "Field Mapping" },
    {
        name: "animation",
        label: "Animation",
        type: "select",
        group: "Style",
        options: [
            { label: "Fade", value: "fade" },
            { label: "Slide Up", value: "slideUp" },
            { label: "Zoom", value: "zoom" },
            { label: "None", value: "none" }
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
        ]
    },
    { name: "backgroundColor", label: "Background Color", type: "color", group: "Style" },
    { name: "backgroundGradient", label: "Background Gradient", type: "gradient", group: "Style" },
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
        ]
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
        ]
    }
]

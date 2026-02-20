"use client"

import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"

import { motion } from "framer-motion"

interface FooterBlockProps {
  block: Block
  onChange: (id: string, props: any) => void
  selected?: boolean
}

export const FooterBlock = ({ block, onChange, selected }: FooterBlockProps) => {
  const { 
    title, 
    tagline, 
    columns = 3, 
    sections = [], 
    showCopyright,
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

  const handleSectionUpdate = (index: number, field: string, value: any) => {
    const next = [...sections]
    next[index] = { ...next[index], [field]: value }
    handleChange("sections", next)
  }

  const handleLinkUpdate = (sectionIndex: number, linkIndex: number, field: string, value: any) => {
    const next = [...sections]
    const links = next[sectionIndex]?.links || []
    const updated = [...links]
    updated[linkIndex] = { ...updated[linkIndex], [field]: value }
    next[sectionIndex] = { ...next[sectionIndex], links: updated }
    handleChange("sections", next)
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

  return (
    <footer
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
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className={cn(
            "grid gap-12 md:gap-16 mb-16",
            columns === 2 && "grid-cols-1 md:grid-cols-2",
            columns === 3 && "grid-cols-1 md:grid-cols-3",
            columns === 4 && "grid-cols-2 lg:grid-cols-4"
          )}
        >
          {sections.map((section: any, i: number) => (
            <motion.div key={i} variants={getItemVariants() as any} className="space-y-6">
              <InlineText
                value={section.heading}
                onChange={(val) => handleSectionUpdate(i, "heading", val)}
                tagName="h4"
                className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40"
                editable={selected}
              />
              <div className="flex flex-col gap-3">
                {(section.links || []).map((link: any, j: number) => (
                  <InlineText
                    key={j}
                    value={link.label}
                    onChange={(val) => handleLinkUpdate(i, j, "label", val)}
                    tagName="div"
                    className="text-sm font-medium text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                    editable={selected}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {showCopyright && (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={getItemVariants() as any}
            className="pt-8 border-t border-muted-foreground/10 flex flex-col md:flex-row justify-between items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <span>©</span>
              <span>{new Date().getFullYear()}</span>
              <InlineText
                value={title + ". All rights reserved."}
                onChange={(val) => handleChange("copyrightText", val)}
                tagName="span"
                editable={selected}
              />
            </div>
            <div className="flex gap-8 opacity-60">
              <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Cookie Settings</span>
            </div>
          </motion.div>
        )}
      </div>
    </footer>
  )
}

export const footerBlockSchema: PropSchema[] = [
  { name: "title", label: "Brand Heading", type: "text", group: "Content" },
  { name: "tagline", label: "Short Tagline", type: "textarea", group: "Content" },
  {
    name: "sections",
    label: "Link Sections",
    type: "array",
    group: "Content",
    arrayItemSchema: [
      { name: "heading", label: "Section Heading", type: "text" },
      {
        name: "links",
        label: "Links",
        type: "array",
        arrayItemSchema: [
          { name: "label", label: "Label", type: "text" },
          { name: "href", label: "URL", type: "text" },
        ],
      },
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
  },
  { name: "showCopyright", label: "Show Copyright Row", type: "boolean", group: "Settings" },
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

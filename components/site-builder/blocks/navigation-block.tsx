"use client"

import { Button } from "@/components/ui/button"
import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useDevice } from "../device-context"

interface NavigationBlockProps {
  block: Block
  onChange: (id: string, props: any) => void
  selected?: boolean
}

export const NavigationBlock = ({ block, onChange, selected }: NavigationBlockProps) => {
  const { device, isMobile, isTablet } = useDevice()
  const showMobileNav = isMobile || isTablet
  const { 
    logoText, 
    logoImage,
    align = "left", 
    sticky = true, 
    transparent = true, 
    menuItems = [], 
    animation = "fade",
    backgroundType = "color",
    backgroundColor = "transparent",
    backgroundGradient
  } = block.props
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (key: string, value: any) => {
    onChange(block.id, { ...block.props, [key]: value })
  }

  const handleItemUpdate = (index: number, field: string, value: any) => {
    const next = [...menuItems]
    next[index] = { ...next[index], [field]: value }
    handleChange("menuItems", next)
  }

    const variants = {
        none: { opacity: 1, y: 0 },
        fade: { 
            hidden: { opacity: 0, y: -20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
        }
    }

    const getVariants = () => {
        const anim = animation || "fade"
        if (anim === "none") return variants.none;
        return variants.fade; // Navigation usually only needs slide down
    }

    return (
        <motion.header
      initial="hidden"
      animate="visible"
      variants={getVariants() as any}
      className={cn(
        "w-full border-b transition-all duration-500",
        transparent && backgroundType === 'color' && backgroundColor === 'transparent' && "bg-background/70 backdrop-blur",
        (!transparent || backgroundType !== 'color' || backgroundColor !== 'transparent') && "bg-background",
        sticky && "sticky top-0 z-40",
        selected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{ 
        backgroundColor: backgroundType === 'color' ? backgroundColor : undefined,
        background: backgroundType === 'gradient' ? backgroundGradient : undefined
      }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2 shrink-0">
          {logoImage && (
            <img
              src={logoImage}
              alt={logoText || "Logo"}
              className="h-8 w-auto rounded-md object-contain"
            />
          )}
          <InlineText
            value={logoText}
            onChange={(val) => handleChange("logoText", val)}
            tagName="div"
            className={cn(
              "font-bold text-lg tracking-tight",
              logoImage && "hidden md:block"
            )}
            editable={selected}
          />
        </div>

        {/* Desktop Navigation - hidden on mobile/tablet in canvas preview */}
        <nav
          className={cn(
            "flex-1 gap-6 text-sm text-muted-foreground",
            showMobileNav ? "hidden" : "flex",
            align === "left" && "justify-start ml-8",
            align === "center" && "justify-center",
            align === "right" && "justify-end"
          )}
        >
          {menuItems.map((item: any, i: number) => {
            const linkHref = item.linkType === 'section' ? `#${item.href}` : item.href || '#'
            const linkTarget = item.openInNewTab ? '_blank' : undefined
            const linkRel = item.openInNewTab ? 'noopener noreferrer' : undefined
            
            return (
              <div key={i} className="relative group/menu">
                <a
                  href={linkHref}
                  target={linkTarget}
                  rel={linkRel}
                  className="cursor-pointer hover:text-primary transition-colors whitespace-nowrap"
                >
                  <InlineText
                    value={item.label}
                    onChange={(val) => handleItemUpdate(i, "label", val)}
                    tagName="span"
                    editable={selected}
                  />
                </a>
                {/* Mega Menu Dropdown */}
                {item.isMegaMenu && item.subItems?.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 bg-background border rounded-xl shadow-2xl p-6 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 min-w-[400px]">
                    <div className={cn(
                      "grid gap-4",
                      item.megaMenuColumns === 2 && "grid-cols-2",
                      item.megaMenuColumns === 3 && "grid-cols-3",
                      item.megaMenuColumns === 4 && "grid-cols-4",
                      !item.megaMenuColumns && "grid-cols-2"
                    )}>
                      {item.subItems?.map((sub: any, j: number) => (
                        <a
                          key={j}
                          href={sub.href || '#'}
                          className="p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="font-medium text-sm">{sub.label}</div>
                          {sub.description && (
                            <div className="text-xs text-muted-foreground mt-1">{sub.description}</div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Mobile Navigation - shown on mobile/tablet in canvas preview */}
        <div className={showMobileNav ? "block" : "hidden"}>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] pt-12">
                <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 font-bold text-lg tracking-tight mb-4">
                  {logoImage && (
                    <img
                      src={logoImage}
                      alt={logoText || "Logo"}
                      className="h-7 w-auto rounded-md object-contain"
                    />
                  )}
                  <span>{logoText}</span>
                </div>
                <nav className="flex flex-col gap-4">
                  {menuItems.map((item: any, i: number) => (
                    <div 
                      key={i} 
                      className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer border-b pb-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </div>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}

export const navigationBlockSchema: PropSchema[] = [
  { name: "logoText", label: "Logo Text", type: "text", group: "Content" },
  { name: "logoImage", label: "Logo Image", type: "image", group: "Content" },
  {
    name: "align",
    label: "Menu Alignment",
    type: "select",
    group: "Layout",
    options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ],
  },
  { name: "sticky", label: "Sticky on Scroll", type: "boolean", group: "Settings" },
  { name: "transparent", label: "Transparent Background", type: "boolean", group: "Settings" },
  {
    name: "menuItems",
    label: "Menu Items",
    type: "array",
    group: "Content",
    arrayItemSchema: [
      { name: "label", label: "Label", type: "text" },
      { name: "linkType", label: "Link Type", type: "select", options: [
        { label: "URL", value: "url" },
        { label: "Section (Anchor)", value: "section" },
        { label: "Page", value: "page" },
      ]},
      { name: "href", label: "URL / Section ID / Page Slug", type: "text" },
      { name: "openInNewTab", label: "Open in New Tab", type: "boolean" },
      { name: "isMegaMenu", label: "Mega Menu", type: "boolean" },
      { name: "megaMenuColumns", label: "Mega Menu Columns", type: "number", min: 2, max: 4 },
    ],
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
    name: "animation",
    label: "Entrance Animation",
    type: "select",
    group: "Style",
    options: [
      { label: "Fade In", value: "fade" },
      { label: "None", value: "none" }
    ],
    default: "fade"
  }
]

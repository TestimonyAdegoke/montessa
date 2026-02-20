import { LucideIcon } from "lucide-react"

export type BlockType =
  | "hero"
  | "hero_alt"
  | "hero_split"
  | "features"
  | "features_alt"
  | "bento_grid"
  | "content"
  | "content_alt"
  | "cta"
  | "gallery"
  | "footer"
  | "navigation"
  | "testimonials"
  | "testimonials_alt"
  | "testimonial_carousel"
  | "faq"
  | "faq_alt"
  | "video"
  | "pricing"
  | "pricing_toggle"
  | "team"
  | "logos"
  | "stats"
  | "newsletter"
  | "contact"
  | "map"
  | "accordion"
  | "tabs"
  | "countdown"
  | "timeline"
  | "comparison"
  | "cms"

export interface Block {
    id: string
    type: BlockType
    props: Record<string, any>
    label?: string
}

export interface BlockDefinition {
    type: BlockType
    label: string
    icon: LucideIcon
    defaultProps: Record<string, any>
    component: React.ComponentType<{ block: Block; onChange: (id: string, props: any) => void; selected: boolean }>
    propSchema: PropSchema[]
}

export interface PropSchema {
    name: string
    label: string
    type: "text" | "textarea" | "color" | "image" | "boolean" | "select" | "number" | "array" | "gradient"
    options?: { label: string; value: string }[] // For select
    arrayItemSchema?: PropSchema[] // For array
    min?: number // For number
    max?: number // For number
    step?: number // For number
    default?: any
    group?: string // For grouping in SidebarRight
}

export interface GlobalStyles {
    fontFamily: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    backgroundColor: string
    [key: string]: any
}

export interface SiteConfig {
    blocks: Block[]
    globalStyles: GlobalStyles
}

// Multi-page Site Builder types
export type PageStatus = "DRAFT" | "PUBLISHED"

export interface SitePage {
    id: string
    title: string
    slug: string
    sortOrder: number
    status: PageStatus
    draftBlocks: Block[]
    publishedBlocks: Block[]
    isHomePage?: boolean
    seoTitle?: string
    seoDescription?: string
    createdAt?: string
    updatedAt?: string
}

export interface Site {
    id: string
    tenantId: string
    name: string
    pages: SitePage[]
    globalStyles: GlobalStyles
    publishedAt?: string
    createdAt?: string
    updatedAt?: string
}

// CMS Types for Site Builder

export type FieldType = 
    | "text"
    | "richtext"
    | "number"
    | "boolean"
    | "date"
    | "datetime"
    | "image"
    | "file"
    | "url"
    | "email"
    | "color"
    | "select"
    | "multiselect"
    | "reference"
    | "json"

export interface CMSFieldDefinition {
    id: string
    name: string
    slug: string
    type: FieldType
    required: boolean
    helpText?: string
    defaultValue?: any
    options?: { label: string; value: string }[] // For select/multiselect
    referenceCollection?: string // For reference type
    validation?: {
        min?: number
        max?: number
        pattern?: string
        message?: string
    }
}

export interface CMSCollection {
    id: string
    name: string
    slug: string
    description?: string
    icon?: string
    fields: CMSFieldDefinition[]
    createdAt: string
    updatedAt: string
}

export interface CMSItem {
    id: string
    collectionId: string
    data: Record<string, any>
    status: "draft" | "published" | "archived"
    slug?: string
    createdAt: string
    updatedAt: string
    publishedAt?: string
}

// Pre-built collection templates
export const COLLECTION_TEMPLATES: Partial<CMSCollection>[] = [
    {
        name: "Blog Posts",
        slug: "blog-posts",
        description: "Articles and blog content",
        icon: "FileText",
        fields: [
            { id: "title", name: "Title", slug: "title", type: "text", required: true },
            { id: "slug", name: "Slug", slug: "slug", type: "text", required: true },
            { id: "excerpt", name: "Excerpt", slug: "excerpt", type: "text", required: false },
            { id: "content", name: "Content", slug: "content", type: "richtext", required: true },
            { id: "featuredImage", name: "Featured Image", slug: "featured-image", type: "image", required: false },
            { id: "author", name: "Author", slug: "author", type: "text", required: false },
            { id: "publishDate", name: "Publish Date", slug: "publish-date", type: "datetime", required: false },
            { id: "tags", name: "Tags", slug: "tags", type: "multiselect", required: false, options: [] },
        ]
    },
    {
        name: "Team Members",
        slug: "team-members",
        description: "Staff and team profiles",
        icon: "Users",
        fields: [
            { id: "name", name: "Name", slug: "name", type: "text", required: true },
            { id: "role", name: "Role/Title", slug: "role", type: "text", required: true },
            { id: "bio", name: "Bio", slug: "bio", type: "richtext", required: false },
            { id: "photo", name: "Photo", slug: "photo", type: "image", required: false },
            { id: "email", name: "Email", slug: "email", type: "email", required: false },
            { id: "linkedin", name: "LinkedIn", slug: "linkedin", type: "url", required: false },
            { id: "twitter", name: "Twitter", slug: "twitter", type: "url", required: false },
            { id: "order", name: "Display Order", slug: "order", type: "number", required: false },
        ]
    },
    {
        name: "Testimonials",
        slug: "testimonials",
        description: "Customer reviews and testimonials",
        icon: "Quote",
        fields: [
            { id: "quote", name: "Quote", slug: "quote", type: "richtext", required: true },
            { id: "authorName", name: "Author Name", slug: "author-name", type: "text", required: true },
            { id: "authorRole", name: "Author Role", slug: "author-role", type: "text", required: false },
            { id: "authorCompany", name: "Company", slug: "author-company", type: "text", required: false },
            { id: "authorPhoto", name: "Author Photo", slug: "author-photo", type: "image", required: false },
            { id: "rating", name: "Rating", slug: "rating", type: "number", required: false, validation: { min: 1, max: 5 } },
            { id: "featured", name: "Featured", slug: "featured", type: "boolean", required: false },
        ]
    },
    {
        name: "Projects",
        slug: "projects",
        description: "Portfolio projects and case studies",
        icon: "Briefcase",
        fields: [
            { id: "title", name: "Title", slug: "title", type: "text", required: true },
            { id: "slug", name: "Slug", slug: "slug", type: "text", required: true },
            { id: "description", name: "Description", slug: "description", type: "richtext", required: false },
            { id: "thumbnail", name: "Thumbnail", slug: "thumbnail", type: "image", required: false },
            { id: "images", name: "Gallery Images", slug: "images", type: "json", required: false },
            { id: "client", name: "Client", slug: "client", type: "text", required: false },
            { id: "category", name: "Category", slug: "category", type: "select", required: false, options: [] },
            { id: "completedDate", name: "Completed Date", slug: "completed-date", type: "date", required: false },
            { id: "url", name: "Project URL", slug: "url", type: "url", required: false },
        ]
    },
    {
        name: "Events",
        slug: "events",
        description: "Upcoming and past events",
        icon: "Calendar",
        fields: [
            { id: "title", name: "Title", slug: "title", type: "text", required: true },
            { id: "description", name: "Description", slug: "description", type: "richtext", required: false },
            { id: "startDate", name: "Start Date", slug: "start-date", type: "datetime", required: true },
            { id: "endDate", name: "End Date", slug: "end-date", type: "datetime", required: false },
            { id: "location", name: "Location", slug: "location", type: "text", required: false },
            { id: "image", name: "Event Image", slug: "image", type: "image", required: false },
            { id: "registrationUrl", name: "Registration URL", slug: "registration-url", type: "url", required: false },
            { id: "capacity", name: "Capacity", slug: "capacity", type: "number", required: false },
        ]
    },
    {
        name: "FAQs",
        slug: "faqs",
        description: "Frequently asked questions",
        icon: "HelpCircle",
        fields: [
            { id: "question", name: "Question", slug: "question", type: "text", required: true },
            { id: "answer", name: "Answer", slug: "answer", type: "richtext", required: true },
            { id: "category", name: "Category", slug: "category", type: "select", required: false, options: [] },
            { id: "order", name: "Display Order", slug: "order", type: "number", required: false },
        ]
    },
    {
        name: "Products",
        slug: "products",
        description: "Product catalog",
        icon: "Package",
        fields: [
            { id: "name", name: "Name", slug: "name", type: "text", required: true },
            { id: "slug", name: "Slug", slug: "slug", type: "text", required: true },
            { id: "description", name: "Description", slug: "description", type: "richtext", required: false },
            { id: "price", name: "Price", slug: "price", type: "number", required: true },
            { id: "salePrice", name: "Sale Price", slug: "sale-price", type: "number", required: false },
            { id: "images", name: "Images", slug: "images", type: "json", required: false },
            { id: "category", name: "Category", slug: "category", type: "select", required: false, options: [] },
            { id: "inStock", name: "In Stock", slug: "in-stock", type: "boolean", required: false, defaultValue: true },
            { id: "sku", name: "SKU", slug: "sku", type: "text", required: false },
        ]
    },
    {
        name: "Services",
        slug: "services",
        description: "Service offerings",
        icon: "Zap",
        fields: [
            { id: "name", name: "Name", slug: "name", type: "text", required: true },
            { id: "description", name: "Description", slug: "description", type: "richtext", required: false },
            { id: "icon", name: "Icon", slug: "icon", type: "text", required: false },
            { id: "image", name: "Image", slug: "image", type: "image", required: false },
            { id: "price", name: "Starting Price", slug: "price", type: "text", required: false },
            { id: "features", name: "Features", slug: "features", type: "json", required: false },
            { id: "order", name: "Display Order", slug: "order", type: "number", required: false },
        ]
    },
]

// Dynamic block that can display CMS content
export interface CMSBlockProps {
    collectionId: string
    displayMode: "list" | "grid" | "carousel" | "single"
    limit?: number
    filter?: Record<string, any>
    sortBy?: string
    sortOrder?: "asc" | "desc"
    template?: "cards" | "minimal" | "detailed" | "custom"
    columns?: number
}

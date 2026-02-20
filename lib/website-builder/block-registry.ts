import type { WBBlockDef, WBNode } from "./types"

// ─────────────────────────────────────────────────────────
// Block Registry — All available blocks for the builder
// ─────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function createNode(type: string, overrides?: Partial<WBNode>): WBNode {
  const def = BLOCK_REGISTRY.find((b) => b.type === type)
  return {
    id: uid(),
    type,
    props: { ...(def?.defaultProps || {}) },
    children: def?.defaultChildren?.map((c) => ({ ...c, id: uid() })) || [],
    styles: def?.defaultStyles,
    ...overrides,
  }
}

export const BLOCK_REGISTRY: WBBlockDef[] = [
  // ── Layout ──────────────────────────────────────────
  {
    type: "section",
    label: "Section",
    category: "layout",
    icon: "LayoutTemplate",
    isContainer: true,
    isDraggable: true,
    defaultProps: {
      fullWidth: false,
      paddingY: "py-16",
      paddingX: "px-4",
      background: "transparent",
      backgroundImage: "",
      overlay: false,
      overlayColor: "rgba(0,0,0,0.5)",
      maxWidth: "max-w-7xl",
      id: "",
    },
    propSchema: [
      { name: "fullWidth", label: "Full Width", type: "boolean" },
      {
        name: "paddingY", label: "Vertical Padding", type: "select", options: [
          { label: "None", value: "py-0" }, { label: "Small", value: "py-8" },
          { label: "Medium", value: "py-16" }, { label: "Large", value: "py-24" }, { label: "XL", value: "py-32" },
        ]
      },
      { name: "background", label: "Background", type: "color" },
      { name: "backgroundImage", label: "Background Image", type: "image" },
      { name: "overlay", label: "Overlay", type: "boolean" },
      { name: "overlayColor", label: "Overlay Color", type: "color" },
      { name: "id", label: "Section ID", type: "text" },
      {
        name: "animation", label: "Entrance Animation", type: "select", options: [
          { label: "None", value: "none" }, { label: "Fade Up", value: "fade-up" },
          { label: "Fade In", value: "fade-in" }, { label: "Slide Left", value: "slide-left" },
          { label: "Slide Right", value: "slide-right" }, { label: "Zoom In", value: "zoom-in" },
        ], group: "Animation"
      },
      { name: "hideOnMobile", label: "Hide on Mobile", type: "boolean", group: "Responsive" },
      { name: "hideOnTablet", label: "Hide on Tablet", type: "boolean", group: "Responsive" },
      { name: "hideOnDesktop", label: "Hide on Desktop", type: "boolean", group: "Responsive" },
    ],
  },
  {
    type: "container",
    label: "Container",
    category: "layout",
    icon: "Box",
    isContainer: true,
    isDraggable: true,
    defaultProps: { maxWidth: "max-w-7xl", padding: "p-0" },
    propSchema: [
      {
        name: "maxWidth", label: "Max Width", type: "select", options: [
          { label: "SM", value: "max-w-sm" }, { label: "MD", value: "max-w-md" },
          { label: "LG", value: "max-w-lg" }, { label: "XL", value: "max-w-xl" },
          { label: "2XL", value: "max-w-2xl" }, { label: "4XL", value: "max-w-4xl" },
          { label: "6XL", value: "max-w-6xl" }, { label: "7XL", value: "max-w-7xl" },
          { label: "Full", value: "max-w-full" },
        ]
      },
    ],
  },
  {
    type: "columns",
    label: "Columns",
    category: "layout",
    icon: "Columns",
    isContainer: true,
    isDraggable: true,
    defaultProps: { columns: 2, gap: "gap-8", align: "items-start" },
    defaultChildren: [
      { id: "col1", type: "column", props: { span: 1 }, children: [] },
      { id: "col2", type: "column", props: { span: 1 }, children: [] },
    ],
    propSchema: [
      { name: "columns", label: "Columns", type: "number" },
      {
        name: "gap", label: "Gap", type: "select", options: [
          { label: "None", value: "gap-0" }, { label: "Small", value: "gap-4" },
          { label: "Medium", value: "gap-8" }, { label: "Large", value: "gap-12" },
        ]
      },
      {
        name: "align", label: "Align", type: "select", options: [
          { label: "Start", value: "items-start" }, { label: "Center", value: "items-center" },
          { label: "End", value: "items-end" }, { label: "Stretch", value: "items-stretch" },
        ]
      },
    ],
  },
  {
    type: "column",
    label: "Column",
    category: "layout",
    icon: "RectangleVertical",
    isContainer: true,
    isDraggable: false,
    defaultProps: { span: 1, padding: "p-0" },
    propSchema: [
      { name: "span", label: "Span", type: "number" },
    ],
  },
  {
    type: "stack",
    label: "Stack",
    category: "layout",
    icon: "Layers",
    isContainer: true,
    isDraggable: true,
    defaultProps: {
      direction: "column",
      align: "stretch",
      justify: "start",
      gap: "gap-4",
      padding: "p-4",
      wrap: "nowrap",
      widthMode: "fill",
      heightMode: "hug",
      fixedWidth: "",
      fixedHeight: "",
      minWidth: "",
      maxWidth: "",
      minHeight: "",
      maxHeight: "",
      position: "static",
      zIndex: "",
      overflow: "visible",
    },
    propSchema: [
      {
        name: "direction", label: "Direction", type: "select", options: [
          { label: "Vertical (Column)", value: "column" },
          { label: "Horizontal (Row)", value: "row" },
        ]
      },
      {
        name: "align", label: "Align Items", type: "select", options: [
          { label: "Start", value: "start" }, { label: "Center", value: "center" },
          { label: "End", value: "end" }, { label: "Stretch", value: "stretch" },
        ]
      },
      {
        name: "justify", label: "Justify Content", type: "select", options: [
          { label: "Start", value: "start" }, { label: "Center", value: "center" },
          { label: "End", value: "end" }, { label: "Between", value: "between" },
          { label: "Around", value: "around" },
        ]
      },
      {
        name: "gap", label: "Gap", type: "select", options: [
          { label: "0", value: "gap-0" }, { label: "1", value: "gap-1" },
          { label: "2", value: "gap-2" }, { label: "4", value: "gap-4" },
          { label: "6", value: "gap-6" }, { label: "8", value: "gap-8" },
          { label: "12", value: "gap-12" }, { label: "16", value: "gap-16" },
        ]
      },
      {
        name: "padding", label: "Padding", type: "select", options: [
          { label: "0", value: "p-0" }, { label: "2", value: "p-2" },
          { label: "4", value: "p-4" }, { label: "6", value: "p-6" },
          { label: "8", value: "p-8" }, { label: "12", value: "p-12" },
        ]
      },
      {
        name: "wrap", label: "Wrap", type: "select", options: [
          { label: "No Wrap", value: "nowrap" }, { label: "Wrap", value: "wrap" },
        ]
      },
      {
        name: "widthMode", label: "Width", type: "select", group: "sizing", options: [
          { label: "Fill (100%)", value: "fill" },
          { label: "Hug (auto)", value: "hug" },
          { label: "Fixed (px)", value: "fixed" },
        ]
      },
      { name: "fixedWidth", label: "Width (px)", type: "text", group: "sizing" },
      {
        name: "heightMode", label: "Height", type: "select", group: "sizing", options: [
          { label: "Hug (auto)", value: "hug" },
          { label: "Fill (100%)", value: "fill" },
          { label: "Fixed (px)", value: "fixed" },
        ]
      },
      { name: "fixedHeight", label: "Height (px)", type: "text", group: "sizing" },
      { name: "minWidth", label: "Min Width", type: "text", group: "sizing" },
      { name: "maxWidth", label: "Max Width", type: "text", group: "sizing" },
      { name: "minHeight", label: "Min Height", type: "text", group: "sizing" },
      { name: "maxHeight", label: "Max Height", type: "text", group: "sizing" },
      {
        name: "position", label: "Position", type: "select", group: "layout", options: [
          { label: "Static", value: "static" },
          { label: "Relative", value: "relative" },
          { label: "Absolute", value: "absolute" },
        ]
      },
      { name: "zIndex", label: "Z-Index", type: "text", group: "layout" },
      {
        name: "overflow", label: "Overflow", type: "select", group: "layout", options: [
          { label: "Visible", value: "visible" },
          { label: "Hidden", value: "hidden" },
          { label: "Scroll", value: "scroll" },
          { label: "Auto", value: "auto" },
        ]
      },
    ],
  },
  {
    type: "spacer",
    label: "Spacer",
    category: "layout",
    icon: "Minus",
    isDraggable: true,
    defaultProps: { height: "h-8" },
    propSchema: [
      {
        name: "height", label: "Height", type: "select", options: [
          { label: "XS", value: "h-2" }, { label: "SM", value: "h-4" },
          { label: "MD", value: "h-8" }, { label: "LG", value: "h-16" }, { label: "XL", value: "h-24" },
        ]
      },
    ],
  },
  {
    type: "divider",
    label: "Divider",
    category: "layout",
    icon: "SeparatorHorizontal",
    isDraggable: true,
    defaultProps: { color: "#e2e8f0", thickness: "1px", width: "100%" },
    propSchema: [
      { name: "color", label: "Color", type: "color" },
      { name: "thickness", label: "Thickness", type: "text" },
      { name: "width", label: "Width", type: "text" },
    ],
  },

  // ── Content ─────────────────────────────────────────
  {
    type: "heading",
    label: "Heading",
    category: "content",
    icon: "Type",
    isDraggable: true,
    defaultProps: { text: "Heading Text", level: "h2", align: "left", color: "" },
    propSchema: [
      { name: "text", label: "Text", type: "richtext" },
      {
        name: "level", label: "Level", type: "select", options: [
          { label: "H1", value: "h1" }, { label: "H2", value: "h2" },
          { label: "H3", value: "h3" }, { label: "H4", value: "h4" },
        ]
      },
      { name: "align", label: "Align", type: "alignment" },
      { name: "color", label: "Color", type: "color" },
    ],
  },
  {
    type: "paragraph",
    label: "Paragraph",
    category: "content",
    icon: "AlignLeft",
    isDraggable: true,
    defaultProps: { text: "Write your content here...", align: "left", color: "", size: "base" },
    propSchema: [
      { name: "text", label: "Text", type: "richtext" },
      { name: "align", label: "Align", type: "alignment" },
      { name: "color", label: "Color", type: "color" },
      {
        name: "size", label: "Size", type: "select", options: [
          { label: "Small", value: "sm" }, { label: "Base", value: "base" },
          { label: "Large", value: "lg" }, { label: "XL", value: "xl" },
        ]
      },
    ],
  },
  {
    type: "richtext",
    label: "Rich Text",
    category: "content",
    icon: "FileText",
    isDraggable: true,
    defaultProps: { html: "<p>Rich text content...</p>" },
    propSchema: [
      { name: "html", label: "Content", type: "richtext" },
    ],
  },
  {
    type: "button",
    label: "Button",
    category: "content",
    icon: "MousePointerClick",
    isDraggable: true,
    defaultProps: {
      text: "Click Me", href: "#", variant: "primary", size: "md",
      align: "left", openInNewTab: false, icon: "", clickAction: "navigate", scrollTarget: "",
    },
    propSchema: [
      { name: "text", label: "Label", type: "text" },
      { name: "href", label: "Link", type: "url" },
      {
        name: "variant", label: "Variant", type: "select", options: [
          { label: "Primary", value: "primary" }, { label: "Secondary", value: "secondary" },
          { label: "Outline", value: "outline" }, { label: "Ghost", value: "ghost" },
        ]
      },
      {
        name: "size", label: "Size", type: "select", options: [
          { label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" },
        ]
      },
      { name: "align", label: "Align", type: "alignment" },
      { name: "openInNewTab", label: "Open in New Tab", type: "boolean" },
      {
        name: "hoverEffect", label: "Hover Effect", type: "select", options: [
          { label: "None", value: "none" }, { label: "Lift", value: "lift" },
          { label: "Scale", value: "scale" }, { label: "Glow", value: "glow" },
        ], group: "Animation"
      },
      {
        name: "clickAction", label: "Click Action", type: "select", options: [
          { label: "Navigate (Link)", value: "navigate" },
          { label: "Scroll to Section", value: "scroll" },
          { label: "Open URL", value: "open-url" },
        ], group: "Interaction"
      },
      { name: "scrollTarget", label: "Scroll Target (Section ID)", type: "text", group: "Interaction" },
    ],
  },
  {
    type: "list",
    label: "List",
    category: "content",
    icon: "List",
    isDraggable: true,
    defaultProps: { items: ["Item 1", "Item 2", "Item 3"], ordered: false, icon: "check" },
    propSchema: [
      { name: "items", label: "Items", type: "json" },
      { name: "ordered", label: "Ordered", type: "boolean" },
      {
        name: "icon", label: "Icon", type: "select", options: [
          { label: "None", value: "" }, { label: "Check", value: "check" },
          { label: "Arrow", value: "arrow" }, { label: "Star", value: "star" },
        ]
      },
    ],
  },
  {
    type: "badge",
    label: "Badge",
    category: "content",
    icon: "Tag",
    isDraggable: true,
    defaultProps: { text: "Badge", color: "primary" },
    propSchema: [
      { name: "text", label: "Text", type: "text" },
      {
        name: "color", label: "Color", type: "select", options: [
          { label: "Primary", value: "primary" }, { label: "Secondary", value: "secondary" },
          { label: "Success", value: "success" }, { label: "Warning", value: "warning" },
          { label: "Danger", value: "danger" },
        ]
      },
    ],
  },

  // ── Media ───────────────────────────────────────────
  {
    type: "image",
    label: "Image",
    category: "media",
    icon: "Image",
    isDraggable: true,
    defaultProps: { src: "", alt: "", width: "100%", height: "auto", rounded: "rounded-lg", objectFit: "cover" },
    propSchema: [
      { name: "src", label: "Image", type: "image" },
      { name: "alt", label: "Alt Text", type: "text" },
      {
        name: "rounded", label: "Rounded", type: "select", options: [
          { label: "None", value: "rounded-none" }, { label: "Small", value: "rounded-md" },
          { label: "Medium", value: "rounded-lg" }, { label: "Large", value: "rounded-xl" },
          { label: "Full", value: "rounded-full" },
        ]
      },
      {
        name: "objectFit", label: "Fit", type: "select", options: [
          { label: "Cover", value: "cover" }, { label: "Contain", value: "contain" },
          { label: "Fill", value: "fill" },
        ]
      },
    ],
  },
  {
    type: "video",
    label: "Video",
    category: "media",
    icon: "Play",
    isDraggable: true,
    defaultProps: { src: "", poster: "", autoplay: false, controls: true, loop: false, muted: true },
    propSchema: [
      { name: "src", label: "Video URL", type: "url" },
      { name: "poster", label: "Poster", type: "image" },
      { name: "autoplay", label: "Autoplay", type: "boolean" },
      { name: "controls", label: "Controls", type: "boolean" },
      { name: "loop", label: "Loop", type: "boolean" },
    ],
  },
  {
    type: "embed",
    label: "Embed",
    category: "media",
    icon: "Code",
    isDraggable: true,
    defaultProps: { url: "", aspectRatio: "16/9" },
    propSchema: [
      { name: "url", label: "URL (YouTube, Vimeo, etc.)", type: "url" },
      {
        name: "aspectRatio", label: "Aspect Ratio", type: "select", options: [
          { label: "16:9", value: "16/9" }, { label: "4:3", value: "4/3" }, { label: "1:1", value: "1/1" },
        ]
      },
    ],
  },
  {
    type: "icon",
    label: "Icon",
    category: "media",
    icon: "Smile",
    isDraggable: true,
    defaultProps: { name: "Star", size: 24, color: "" },
    propSchema: [
      { name: "name", label: "Icon Name", type: "icon" },
      { name: "size", label: "Size", type: "number" },
      { name: "color", label: "Color", type: "color" },
    ],
  },

  // ── Hero ────────────────────────────────────────────
  {
    type: "hero",
    label: "Hero Section",
    category: "hero",
    icon: "Sparkles",
    isContainer: false,
    isDraggable: true,
    defaultProps: {
      title: "Welcome to Our School",
      subtitle: "Nurturing young minds for a brighter future",
      ctaText: "Apply Now",
      ctaHref: "/admissions",
      ctaSecondaryText: "Learn More",
      ctaSecondaryHref: "/about",
      backgroundImage: "",
      overlay: true,
      overlayColor: "rgba(0,0,0,0.4)",
      align: "center",
      minHeight: "min-h-[600px]",
      layout: "centered",
    },
    propSchema: [
      { name: "title", label: "Title", type: "richtext", group: "Content" },
      { name: "subtitle", label: "Subtitle", type: "textarea", group: "Content" },
      { name: "ctaText", label: "CTA Text", type: "text", group: "Content" },
      { name: "ctaHref", label: "CTA Link", type: "url", group: "Content" },
      { name: "ctaSecondaryText", label: "Secondary CTA", type: "text", group: "Content" },
      { name: "ctaSecondaryHref", label: "Secondary Link", type: "url", group: "Content" },
      { name: "backgroundImage", label: "Background", type: "image", group: "Style" },
      { name: "overlay", label: "Overlay", type: "boolean", group: "Style" },
      { name: "align", label: "Align", type: "alignment", group: "Style" },
      {
        name: "layout", label: "Layout", type: "select", group: "Style", options: [
          { label: "Centered", value: "centered" }, { label: "Left", value: "left" },
          { label: "Split", value: "split" },
        ]
      },
      {
        name: "animation", label: "Entrance Animation", type: "select", group: "Animation", options: [
          { label: "None", value: "none" }, { label: "Fade Up", value: "fade-up" },
          { label: "Fade In", value: "fade-in" }, { label: "Zoom In", value: "zoom-in" },
        ]
      },
    ],
  },

  // ── Features ────────────────────────────────────────
  {
    type: "features",
    label: "Features Grid",
    category: "feature",
    icon: "Grid3X3",
    isDraggable: true,
    defaultProps: {
      title: "Why Choose Us",
      subtitle: "We provide the best education for your children",
      columns: 3,
      items: [
        { icon: "GraduationCap", title: "Expert Teachers", description: "Qualified and experienced educators" },
        { icon: "BookOpen", title: "Modern Curriculum", description: "Up-to-date learning materials" },
        { icon: "Users", title: "Small Classes", description: "Personalized attention for every student" },
      ],
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "columns", label: "Columns", type: "number" },
      {
        name: "items", label: "Features", type: "json", itemSchema: [
          { name: "icon", label: "Icon", type: "icon" },
          { name: "title", label: "Title", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
        ]
      },
      {
        name: "animation", label: "Entrance Animation", type: "select", group: "Animation", options: [
          { label: "None", value: "none" }, { label: "Fade Up", value: "fade-up" },
          { label: "Fade In", value: "fade-in" }, { label: "Slide Left", value: "slide-left" },
        ]
      },
    ],
  },

  // ── Testimonials ────────────────────────────────────
  {
    type: "testimonials",
    label: "Testimonials",
    category: "testimonial",
    icon: "Quote",
    isDraggable: true,
    defaultProps: {
      title: "What Parents Say",
      items: [
        { quote: "The best school for our children!", author: "Jane Doe", role: "Parent", avatar: "" },
        { quote: "Excellent teaching and facilities.", author: "John Smith", role: "Parent", avatar: "" },
      ],
      layout: "grid",
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      {
        name: "items", label: "Testimonials", type: "json", itemSchema: [
          { name: "quote", label: "Quote", type: "textarea" },
          { name: "author", label: "Author", type: "text" },
          { name: "role", label: "Role", type: "text" },
          { name: "avatar", label: "Avatar", type: "image" },
        ]
      },
      {
        name: "layout", label: "Layout", type: "select", options: [
          { label: "Grid", value: "grid" }, { label: "Carousel", value: "carousel" },
        ]
      },
    ],
  },

  // ── Pricing ─────────────────────────────────────────
  {
    type: "pricing",
    label: "Pricing Table",
    category: "pricing",
    icon: "CreditCard",
    isDraggable: true,
    defaultProps: {
      title: "Tuition & Fees",
      subtitle: "Transparent pricing for all programs",
      items: [
        { name: "Nursery", price: "$500/term", features: ["Full day care", "Meals included", "Activity kits"], highlighted: false },
        { name: "Primary", price: "$800/term", features: ["Core subjects", "Extra-curricular", "Field trips"], highlighted: true },
        { name: "Secondary", price: "$1,200/term", features: ["Full curriculum", "Lab access", "Career guidance"], highlighted: false },
      ],
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      {
        name: "items", label: "Plans", type: "json", itemSchema: [
          { name: "name", label: "Plan Name", type: "text" },
          { name: "price", label: "Price", type: "text" },
          { name: "highlighted", label: "Featured", type: "boolean" },
        ]
      },
    ],
  },

  // ── CTA ─────────────────────────────────────────────
  {
    type: "cta",
    label: "Call to Action",
    category: "cta",
    icon: "Megaphone",
    isDraggable: true,
    defaultProps: {
      title: "Ready to Enroll?",
      subtitle: "Join our community of learners today",
      buttonText: "Start Application",
      buttonHref: "/admissions",
      background: "primary",
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "buttonText", label: "Button Text", type: "text" },
      { name: "buttonHref", label: "Button Link", type: "url" },
      {
        name: "background", label: "Background", type: "select", options: [
          { label: "Primary", value: "primary" }, { label: "Dark", value: "dark" },
          { label: "Light", value: "light" }, { label: "Gradient", value: "gradient" },
        ]
      },
      {
        name: "animation", label: "Entrance Animation", type: "select", group: "Animation", options: [
          { label: "None", value: "none" }, { label: "Fade Up", value: "fade-up" },
          { label: "Fade In", value: "fade-in" }, { label: "Slide Left", value: "slide-left" },
          { label: "Slide Right", value: "slide-right" }, { label: "Zoom In", value: "zoom-in" },
        ]
      },
    ],
  },

  // ── FAQ ─────────────────────────────────────────────
  {
    type: "faq",
    label: "FAQ",
    category: "faq",
    icon: "HelpCircle",
    isDraggable: true,
    defaultProps: {
      title: "Frequently Asked Questions",
      items: [
        { question: "What are the school hours?", answer: "Our school operates from 8:00 AM to 3:00 PM." },
        { question: "Is transport available?", answer: "Yes, we provide bus services covering major routes." },
        { question: "What is the admission process?", answer: "Fill out the online application, attend an interview, and submit required documents." },
      ],
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      {
        name: "items", label: "Questions", type: "json", itemSchema: [
          { name: "question", label: "Question", type: "text" },
          { name: "answer", label: "Answer", type: "textarea" },
        ]
      },
    ],
  },

  // ── Gallery ─────────────────────────────────────────
  {
    type: "gallery",
    label: "Image Gallery",
    category: "gallery",
    icon: "Images",
    isDraggable: true,
    defaultProps: {
      title: "Our Gallery",
      columns: 3,
      images: [
        { src: "", alt: "School image 1", caption: "" },
        { src: "", alt: "School image 2", caption: "" },
        { src: "", alt: "School image 3", caption: "" },
      ],
      gap: "gap-4",
      rounded: "rounded-lg",
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      { name: "columns", label: "Columns", type: "number" },
      {
        name: "images", label: "Images", type: "json", itemSchema: [
          { name: "src", label: "Image", type: "image" },
          { name: "alt", label: "Alt Text", type: "text" },
          { name: "caption", label: "Caption", type: "text" },
        ]
      },
      {
        name: "gap", label: "Gap", type: "select", options: [
          { label: "Small", value: "gap-2" }, { label: "Medium", value: "gap-4" }, { label: "Large", value: "gap-6" },
        ]
      },
    ],
  },

  // ── Contact / Map ───────────────────────────────────
  {
    type: "contact",
    label: "Contact Section",
    category: "content",
    icon: "MapPin",
    isDraggable: true,
    defaultProps: {
      title: "Contact Us",
      address: "123 School Street, City, Country",
      phone: "+1 234 567 890",
      email: "info@school.edu",
      mapEmbed: "",
      showForm: true,
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "mapEmbed", label: "Map Embed URL", type: "url" },
      { name: "showForm", label: "Show Contact Form", type: "boolean" },
    ],
  },

  // ── Timeline ────────────────────────────────────────
  {
    type: "timeline",
    label: "Timeline",
    category: "content",
    icon: "Clock",
    isDraggable: true,
    defaultProps: {
      title: "Our History",
      items: [
        { year: "2010", title: "Founded", description: "School established with 50 students" },
        { year: "2015", title: "Expansion", description: "New campus opened with modern facilities" },
        { year: "2020", title: "Excellence", description: "Ranked among top schools in the region" },
      ],
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      {
        name: "items", label: "Events", type: "json", itemSchema: [
          { name: "year", label: "Year", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
        ]
      },
    ],
  },

  // ── Stats / Counter ─────────────────────────────────
  {
    type: "stats",
    label: "Statistics",
    category: "content",
    icon: "BarChart3",
    isDraggable: true,
    defaultProps: {
      items: [
        { value: "500+", label: "Students" },
        { value: "50+", label: "Teachers" },
        { value: "98%", label: "Pass Rate" },
        { value: "15+", label: "Years" },
      ],
      background: "surface",
    },
    propSchema: [
      {
        name: "items", label: "Stats", type: "json", itemSchema: [
          { name: "value", label: "Value", type: "text" },
          { name: "label", label: "Label", type: "text" },
        ]
      },
      {
        name: "background", label: "Background", type: "select", options: [
          { label: "Transparent", value: "transparent" }, { label: "Surface", value: "surface" },
          { label: "Primary", value: "primary" },
        ]
      },
    ],
  },

  // ── Team / Staff ────────────────────────────────────
  {
    type: "team",
    label: "Team Grid",
    category: "content",
    icon: "Users",
    isDraggable: true,
    defaultProps: {
      title: "Meet Our Team",
      subtitle: "Dedicated professionals committed to excellence",
      columns: 4,
      members: [
        { name: "Dr. Sarah Johnson", role: "Principal", image: "", bio: "" },
        { name: "Mr. James Williams", role: "Vice Principal", image: "", bio: "" },
      ],
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "columns", label: "Columns", type: "number" },
      {
        name: "members", label: "Members", type: "json", itemSchema: [
          { name: "name", label: "Name", type: "text" },
          { name: "role", label: "Role", type: "text" },
          { name: "image", label: "Image", type: "image" },
          { name: "bio", label: "Bio", type: "textarea" },
        ]
      },
    ],
  },

  // ── Logo Cloud ──────────────────────────────────────
  {
    type: "logos",
    label: "Logo Cloud",
    category: "content",
    icon: "Award",
    isDraggable: true,
    defaultProps: {
      title: "Accredited By",
      logos: [
        { src: "", alt: "Partner 1", href: "" },
        { src: "", alt: "Partner 2", href: "" },
      ],
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      {
        name: "logos", label: "Logos", type: "json", itemSchema: [
          { name: "src", label: "Logo", type: "image" },
          { name: "alt", label: "Alt Text", type: "text" },
          { name: "href", label: "Link", type: "url" },
        ]
      },
    ],
  },

  // ── Newsletter ──────────────────────────────────────
  {
    type: "newsletter",
    label: "Newsletter",
    category: "form",
    icon: "Mail",
    isDraggable: true,
    defaultProps: {
      title: "Stay Updated",
      subtitle: "Subscribe to our newsletter for the latest news",
      buttonText: "Subscribe",
      placeholder: "Enter your email",
      formSlug: "",
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "buttonText", label: "Button Text", type: "text" },
      { name: "formSlug", label: "Form Slug", type: "text" },
    ],
  },

  // ── Form Embed ──────────────────────────────────────
  {
    type: "formEmbed",
    label: "Form Embed",
    category: "form",
    icon: "ClipboardList",
    isDraggable: true,
    defaultProps: { formSlug: "", title: "", showTitle: true },
    propSchema: [
      { name: "formSlug", label: "Form Slug", type: "text" },
      { name: "title", label: "Title Override", type: "text" },
      { name: "showTitle", label: "Show Title", type: "boolean" },
    ],
  },

  // ── Navigation (Header) ─────────────────────────────
  {
    type: "header",
    label: "Header",
    category: "navigation",
    icon: "PanelTop",
    isDraggable: true,
    defaultProps: {
      logo: "",
      logoText: "School Name",
      layout: "left",
      sticky: true,
      transparent: false,
      menuLocation: "header",
      ctaText: "Apply Now",
      ctaHref: "/admissions",
    },
    propSchema: [
      { name: "logo", label: "Logo", type: "image" },
      { name: "logoText", label: "Logo Text", type: "text" },
      {
        name: "layout", label: "Layout", type: "select", options: [
          { label: "Left Logo", value: "left" }, { label: "Center Logo", value: "center" },
          { label: "Split Nav", value: "split" },
        ]
      },
      { name: "sticky", label: "Sticky", type: "boolean" },
      { name: "transparent", label: "Transparent", type: "boolean" },
      { name: "ctaText", label: "CTA Text", type: "text" },
      { name: "ctaHref", label: "CTA Link", type: "url" },
    ],
  },

  // ── Footer ──────────────────────────────────────────
  {
    type: "footer",
    label: "Footer",
    category: "footer",
    icon: "PanelBottom",
    isDraggable: true,
    defaultProps: {
      logo: "",
      logoText: "School Name",
      description: "Providing quality education since 2010",
      columns: [
        { title: "Quick Links", links: [{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Admissions", href: "/admissions" }] },
        { title: "Contact", links: [{ label: "Email Us", href: "mailto:info@school.edu" }, { label: "Call Us", href: "tel:+1234567890" }] },
      ],
      socialLinks: [
        { platform: "facebook", url: "#" },
        { platform: "twitter", url: "#" },
        { platform: "instagram", url: "#" },
      ],
      copyright: "© 2025 School Name. All rights reserved.",
      showNewsletter: false,
    },
    propSchema: [
      { name: "logo", label: "Logo", type: "image" },
      { name: "logoText", label: "Logo Text", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "columns", label: "Link Columns", type: "json" },
      { name: "socialLinks", label: "Social Links", type: "json" },
      { name: "copyright", label: "Copyright", type: "text" },
      { name: "showNewsletter", label: "Show Newsletter", type: "boolean" },
    ],
  },

  // ── Portal Login ────────────────────────────────────
  {
    type: "portalLogin",
    label: "Portal Login",
    category: "custom",
    icon: "LogIn",
    isDraggable: true,
    defaultProps: {
      title: "Welcome Back",
      subtitle: "Sign in to your account",
      showRoleButtons: true,
      roles: ["Parent", "Teacher", "Student"],
      backgroundImage: "",
      showAnnouncements: true,
      showHelpLink: true,
      helpText: "Need help? Contact support",
      helpHref: "/contact",
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "showRoleButtons", label: "Show Role Buttons", type: "boolean" },
      { name: "roles", label: "Roles", type: "json" },
      { name: "backgroundImage", label: "Background", type: "image" },
      { name: "showAnnouncements", label: "Show Announcements", type: "boolean" },
      { name: "showHelpLink", label: "Show Help Link", type: "boolean" },
      { name: "helpText", label: "Help Text", type: "text" },
      { name: "helpHref", label: "Help Link", type: "url" },
    ],
  },

  // ── Countdown Timer ──────────────────────────────────
  {
    type: "countdown",
    label: "Countdown Timer",
    category: "content",
    icon: "Clock",
    isDraggable: true,
    defaultProps: {
      title: "Admissions Close In",
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      showLabels: true,
      style: "cards",
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      { name: "targetDate", label: "Target Date", type: "text" },
      { name: "showLabels", label: "Show Labels", type: "boolean" },
      {
        name: "style", label: "Style", type: "select", options: [
          { label: "Cards", value: "cards" }, { label: "Inline", value: "inline" },
          { label: "Minimal", value: "minimal" },
        ]
      },
    ],
  },

  // ── Accordion ────────────────────────────────────────
  {
    type: "accordion",
    label: "Accordion",
    category: "content",
    icon: "List",
    isDraggable: true,
    defaultProps: {
      title: "",
      items: [
        { title: "What are the school hours?", content: "Our school operates from 8:00 AM to 3:00 PM, Monday through Friday." },
        { title: "Is transport available?", content: "Yes, we provide bus services covering major routes in the city." },
        { title: "What is the admission process?", content: "Fill out the online application, attend an interview, and submit required documents." },
      ],
      allowMultiple: false,
      variant: "bordered",
    },
    propSchema: [
      { name: "title", label: "Title", type: "text" },
      { name: "items", label: "Items", type: "json" },
      { name: "allowMultiple", label: "Allow Multiple Open", type: "boolean" },
      {
        name: "variant", label: "Variant", type: "select", options: [
          { label: "Bordered", value: "bordered" }, { label: "Separated", value: "separated" },
          { label: "Minimal", value: "minimal" },
        ]
      },
    ],
  },

  // ── Tabs ─────────────────────────────────────────────
  {
    type: "tabs",
    label: "Tabs",
    category: "content",
    icon: "LayoutGrid",
    isDraggable: true,
    defaultProps: {
      items: [
        { title: "Overview", content: "Our school provides a comprehensive education program." },
        { title: "Curriculum", content: "We follow an internationally recognized curriculum." },
        { title: "Facilities", content: "State-of-the-art labs, library, and sports facilities." },
      ],
      variant: "underline",
    },
    propSchema: [
      { name: "items", label: "Tabs", type: "json" },
      {
        name: "variant", label: "Variant", type: "select", options: [
          { label: "Underline", value: "underline" }, { label: "Pills", value: "pills" },
          { label: "Boxed", value: "boxed" },
        ]
      },
    ],
  },

  // ── Marquee / Scrolling Text ─────────────────────────
  {
    type: "marquee",
    label: "Scrolling Text",
    category: "content",
    icon: "MoveVertical",
    isDraggable: true,
    defaultProps: {
      text: "📢 Admissions open for 2025-2026 academic year  •  Open Day: March 15th  •  New STEM Lab now available",
      speed: "normal",
      pauseOnHover: true,
    },
    propSchema: [
      { name: "text", label: "Text", type: "text" },
      {
        name: "speed", label: "Speed", type: "select", options: [
          { label: "Slow", value: "slow" }, { label: "Normal", value: "normal" }, { label: "Fast", value: "fast" },
        ]
      },
      {
        name: "direction", label: "Direction", type: "select", options: [
          { label: "Left", value: "left" }, { label: "Right", value: "right" },
        ]
      },
      { name: "pauseOnHover", label: "Pause on Hover", type: "boolean" },
    ],
  },

  // ── Before/After Slider ──────────────────────────────
  {
    type: "beforeAfter",
    label: "Before/After",
    category: "media",
    icon: "Columns3",
    isDraggable: true,
    defaultProps: {
      beforeImage: "",
      afterImage: "",
      beforeLabel: "Before",
      afterLabel: "After",
    },
    propSchema: [
      { name: "beforeImage", label: "Before Image", type: "image" },
      { name: "afterImage", label: "After Image", type: "image" },
      { name: "beforeLabel", label: "Before Label", type: "text" },
      { name: "afterLabel", label: "After Label", type: "text" },
    ],
  },
]

export function getBlocksByCategory(): Record<string, WBBlockDef[]> {
  const map: Record<string, WBBlockDef[]> = {}
  for (const block of BLOCK_REGISTRY) {
    if (!block.isDraggable && block.type !== "column") continue
    if (!map[block.category]) map[block.category] = []
    map[block.category].push(block)
  }
  return map
}

export function getBlockDef(type: string): WBBlockDef | undefined {
  return BLOCK_REGISTRY.find((b) => b.type === type)
}

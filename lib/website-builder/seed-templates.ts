// ─────────────────────────────────────────────────────────
// Website Builder — Template Seed Data (20+ templates)
// Run via: npx tsx lib/website-builder/seed-templates.ts
// ─────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface TemplateSeed {
  name: string
  slug: string
  description: string
  category: string
  mode: "PORTAL_ONLY" | "FULL_WEBSITE"
  isDefault: boolean
  sortOrder: number
  theme: Record<string, any>
  pages: any[]
}

function heroBlock(title: string, subtitle: string, bg?: string) {
  return { id: `hero-${Math.random().toString(36).slice(2, 8)}`, type: "hero", props: { title, subtitle, ctaText: "Apply Now", ctaHref: "/admissions", ctaSecondaryText: "Learn More", ctaSecondaryHref: "/about", backgroundImage: bg || "", overlay: true, overlayColor: "rgba(0,0,0,0.4)", align: "center", minHeight: "min-h-[600px]", layout: "centered" }, children: [] }
}

function statsBlock(items: { value: string; label: string }[]) {
  return { id: `stats-${Math.random().toString(36).slice(2, 8)}`, type: "stats", props: { items, background: "primary" }, children: [] }
}

function featuresBlock(title: string, subtitle: string, items: any[]) {
  return { id: `feat-${Math.random().toString(36).slice(2, 8)}`, type: "features", props: { title, subtitle, columns: 3, items }, children: [] }
}

function ctaBlock(title: string, subtitle: string) {
  return { id: `cta-${Math.random().toString(36).slice(2, 8)}`, type: "cta", props: { title, subtitle, buttonText: "Start Application", buttonHref: "/admissions", background: "gradient" }, children: [] }
}

function testimonialsBlock(items: any[]) {
  return { id: `test-${Math.random().toString(36).slice(2, 8)}`, type: "testimonials", props: { title: "What Parents Say", items, layout: "grid" }, children: [] }
}

function faqBlock(items: any[]) {
  return { id: `faq-${Math.random().toString(36).slice(2, 8)}`, type: "faq", props: { title: "Frequently Asked Questions", items }, children: [] }
}

function contactBlock() {
  return { id: `contact-${Math.random().toString(36).slice(2, 8)}`, type: "contact", props: { title: "Contact Us", address: "123 School Street, City", phone: "+1 234 567 890", email: "info@school.edu", mapEmbed: "", showForm: true }, children: [] }
}

function pricingBlock(items: any[]) {
  return { id: `price-${Math.random().toString(36).slice(2, 8)}`, type: "pricing", props: { title: "Tuition & Fees", subtitle: "Transparent pricing for all programs", items }, children: [] }
}

function teamBlock(members: any[]) {
  return { id: `team-${Math.random().toString(36).slice(2, 8)}`, type: "team", props: { title: "Our Leadership", subtitle: "Meet the team", columns: 3, members }, children: [] }
}

function timelineBlock(items: any[]) {
  return { id: `tl-${Math.random().toString(36).slice(2, 8)}`, type: "timeline", props: { title: "Our Journey", items }, children: [] }
}

function galleryBlock() {
  return { id: `gal-${Math.random().toString(36).slice(2, 8)}`, type: "gallery", props: { title: "Campus Gallery", columns: 3, images: [{ src: "", alt: "Campus 1" }, { src: "", alt: "Campus 2" }, { src: "", alt: "Campus 3" }, { src: "", alt: "Campus 4" }, { src: "", alt: "Campus 5" }, { src: "", alt: "Campus 6" }], gap: "gap-4", rounded: "rounded-lg" }, children: [] }
}

function portalBlock(schoolName: string) {
  return { id: `portal-${Math.random().toString(36).slice(2, 8)}`, type: "portalLogin", props: { title: `Welcome to ${schoolName}`, subtitle: "Sign in to your account", showRoleButtons: true, roles: ["Parent", "Teacher", "Student"], backgroundImage: "", showAnnouncements: true, showHelpLink: true, helpText: "Need help? Contact support", helpHref: "/contact" }, children: [] }
}

function newsletterBlock() {
  return { id: `news-${Math.random().toString(36).slice(2, 8)}`, type: "newsletter", props: { title: "Stay Updated", subtitle: "Subscribe to our newsletter", buttonText: "Subscribe", placeholder: "Enter your email", formSlug: "" }, children: [] }
}

function countdownBlock(title: string, days = 30) {
  return { id: `cd-${Math.random().toString(36).slice(2, 8)}`, type: "countdown", props: { title, targetDate: new Date(Date.now() + days * 86400000).toISOString().slice(0, 10), showLabels: true, style: "cards" }, children: [] }
}

function accordionBlock(title: string, items: { title: string; content: string }[]) {
  return { id: `acc-${Math.random().toString(36).slice(2, 8)}`, type: "accordion", props: { title, items, allowMultiple: false, variant: "bordered" }, children: [] }
}

function tabsBlock(items: { title: string; content: string }[]) {
  return { id: `tabs-${Math.random().toString(36).slice(2, 8)}`, type: "tabs", props: { items, variant: "underline" }, children: [] }
}

function marqueeBlock(text: string) {
  return { id: `mq-${Math.random().toString(36).slice(2, 8)}`, type: "marquee", props: { text, speed: "normal", pauseOnHover: true }, children: [] }
}

const defaultTestimonials = [
  { quote: "The best school for our children!", author: "Jane Doe", role: "Parent", avatar: "" },
  { quote: "Excellent teaching and facilities.", author: "John Smith", role: "Parent", avatar: "" },
  { quote: "Our child has thrived since joining.", author: "Emily Chen", role: "Parent", avatar: "" },
]

const defaultFaq = [
  { question: "What are the school hours?", answer: "Our school operates from 8:00 AM to 3:00 PM, Monday to Friday." },
  { question: "Is transport available?", answer: "Yes, we provide bus services covering major routes in the city." },
  { question: "What is the admission process?", answer: "Fill out the online application, attend an interview, and submit required documents." },
  { question: "Do you offer scholarships?", answer: "Yes, we offer merit-based scholarships and need-based financial assistance." },
]

const defaultTeam = [
  { name: "Dr. Sarah Johnson", role: "Principal", image: "", bio: "20+ years in education" },
  { name: "Mr. James Williams", role: "Vice Principal", image: "", bio: "Curriculum specialist" },
  { name: "Mrs. Emily Chen", role: "Head of Admissions", image: "", bio: "Student welfare expert" },
]

const defaultTimeline = [
  { year: "2005", title: "Founded", description: "School established with a vision for excellence" },
  { year: "2010", title: "Growth", description: "Expanded to 500+ students across two campuses" },
  { year: "2015", title: "Recognition", description: "Awarded Best School in the region" },
  { year: "2020", title: "Innovation", description: "Launched digital learning platform" },
]

const defaultPricing = [
  { name: "Nursery", price: "$500/term", features: ["Full day care", "Meals included", "Activity kits", "Parent updates"], highlighted: false },
  { name: "Primary", price: "$800/term", features: ["Core subjects", "Extra-curricular", "Field trips", "Digital learning"], highlighted: true },
  { name: "Secondary", price: "$1,200/term", features: ["Full curriculum", "Lab access", "Career guidance", "Exam prep"], highlighted: false },
]

function makeHomePage(schoolName: string, extraBlocks: any[] = []) {
  return {
    title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
    content: [
      heroBlock(`Welcome to ${schoolName}`, "Nurturing young minds for a brighter future"),
      statsBlock([{ value: "500+", label: "Students" }, { value: "50+", label: "Teachers" }, { value: "98%", label: "Pass Rate" }, { value: "15+", label: "Years" }]),
      featuresBlock("Why Choose Us", "Excellence in every aspect of education", [
        { icon: "GraduationCap", title: "Expert Teachers", description: "Qualified and experienced educators" },
        { icon: "BookOpen", title: "Modern Curriculum", description: "Up-to-date learning materials" },
        { icon: "Users", title: "Small Classes", description: "Personalized attention for every student" },
      ]),
      ...extraBlocks,
      ctaBlock("Ready to Join?", "Applications are now open for the upcoming academic year"),
      testimonialsBlock(defaultTestimonials),
      newsletterBlock(),
    ],
  }
}

function makeAboutPage() {
  return {
    title: "About", slug: "about", sortOrder: 1,
    content: [
      {
        id: "about-s1", type: "section", props: { paddingY: "py-16", background: "transparent", fullWidth: false, paddingX: "px-4", maxWidth: "max-w-7xl", backgroundImage: "", overlay: false, overlayColor: "", id: "" }, children: [
          { id: "about-h", type: "heading", props: { text: "About Our School", level: "h1", align: "center", color: "" }, children: [] },
          { id: "about-p", type: "paragraph", props: { text: "We are committed to providing world-class education in a nurturing environment.", align: "center", color: "", size: "lg" }, children: [] },
        ]
      },
      timelineBlock(defaultTimeline),
      teamBlock(defaultTeam),
      galleryBlock(),
    ],
  }
}

function makeAdmissionsPage() {
  return {
    title: "Admissions", slug: "admissions", sortOrder: 2,
    content: [
      heroBlock("Admissions", "Begin your child's journey with us", ""),
      pricingBlock(defaultPricing),
      faqBlock(defaultFaq),
      ctaBlock("Start Your Application", "Join our community of learners today"),
    ],
  }
}

function makeContactPage() {
  return { title: "Contact", slug: "contact", sortOrder: 3, content: [contactBlock()] }
}

function makePortalPage(schoolName: string) {
  return { title: "Portal Login", slug: "login", isPortalLogin: true, isLocked: true, sortOrder: 10, content: [portalBlock(schoolName)] }
}

// ─────────────────────────────────────────────────────────
// Template Definitions
// ─────────────────────────────────────────────────────────

const TEMPLATES: TemplateSeed[] = [
  // ═══════════════════════════════════════════════════════
  // FULL WEBSITE TEMPLATES
  // ═══════════════════════════════════════════════════════

  // 1 — Modern Academic (Default)
  {
    name: "Modern Academic",
    slug: "modern-academic",
    description: "A clean, professional layout for established educational institutions.",
    category: "academic",
    mode: "FULL_WEBSITE",
    isDefault: true,
    sortOrder: 1,
    theme: {
      primaryColor: "#1E40AF", secondaryColor: "#3B82F6", accentColor: "#F59E0B",
      backgroundColor: "#FFFFFF", surfaceColor: "#F8FAFC",
      headingFont: "Inter", bodyFont: "Inter", borderRadius: "0.5rem",
      buttonRadius: "0.375rem", cardRadius: "0.75rem", buttonStyle: "solid", shadowStyle: "md", containerWidth: "1280px",
    },
    pages: [
      {
        title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
        content: [
          heroBlock("Excellence in Every Lesson", "Empowering students through rigorous academics and character development since 1985."),
          statsBlock([{ value: "1,200+", label: "Students" }, { value: "85+", label: "Faculty" }, { value: "99%", label: "Pass Rate" }, { value: "40+", label: "Years" }]),
          featuresBlock("The Pillars of Our Institution", "Dedicated to holistic growth", [
            { icon: "GraduationCap", title: "Academic Rigor", description: "World-class curriculum focused on critical thinking." },
            { icon: "Users", title: "Character First", description: "Values-based education for the leaders of tomorrow." },
            { icon: "Globe", title: "Global Mindset", description: "Preparing students for success in a connected world." },
          ]),
          ctaBlock("Begin Your Journey", "Applications for the 2026 academic year are now open."),
          testimonialsBlock(defaultTestimonials),
          newsletterBlock(),
        ],
      },
      makeAboutPage(), makeAdmissionsPage(), makeContactPage(), makePortalPage("Academic Academy"),
    ],
  },

  // 2 — Ivy Prep
  {
    name: "Ivy Prep",
    slug: "ivy-prep",
    description: "Prestigious, serif-heavy design inspired by elite preparatory schools.",
    category: "academic",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 2,
    theme: {
      primaryColor: "#14532D", secondaryColor: "#166534", accentColor: "#CA8A04",
      backgroundColor: "#FEFCE8", surfaceColor: "#FEF9C3",
      headingFont: "Playfair Display", bodyFont: "Lora", borderRadius: "0.25rem",
      buttonRadius: "0.25rem", cardRadius: "0.5rem", buttonStyle: "solid", shadowStyle: "sm", containerWidth: "1200px",
    },
    pages: [
      {
        title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
        content: [
          heroBlock("A Tradition of Excellence", "Preparing scholars and leaders since 1952."),
          statsBlock([{ value: "72", label: "Years" }, { value: "96%", label: "University Admission" }, { value: "18:1", label: "Student-Teacher" }, { value: "30+", label: "AP Courses" }]),
          featuresBlock("Our Distinction", "What sets Ivy Prep apart", [
            { icon: "Award", title: "Legacy of Achievement", description: "Decades of academic distinction and alumni success." },
            { icon: "BookOpen", title: "Classical Curriculum", description: "Rooted in the liberal arts and sciences." },
            { icon: "Landmark", title: "Historic Campus", description: "A 50-acre campus steeped in tradition." },
          ]),
          testimonialsBlock(defaultTestimonials),
          ctaBlock("Apply for Admission", "Spaces are limited — secure your child's future today."),
        ],
      },
      makeAboutPage(), makeAdmissionsPage(), makePortalPage("Ivy Prep"),
    ],
  },

  // 3 — Bright Horizons (Primary / Elementary)
  {
    name: "Bright Horizons",
    slug: "bright-horizons",
    description: "Warm, colorful design perfect for primary and elementary schools.",
    category: "primary",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 3,
    theme: {
      primaryColor: "#EA580C", secondaryColor: "#F97316", accentColor: "#0EA5E9",
      backgroundColor: "#FFFBEB", surfaceColor: "#FFF7ED",
      headingFont: "Nunito", bodyFont: "Nunito", borderRadius: "1rem",
      buttonRadius: "9999px", cardRadius: "1rem", buttonStyle: "solid", shadowStyle: "lg", containerWidth: "1280px",
    },
    pages: [
      makeHomePage("Bright Horizons", [
        countdownBlock("Next Term Starts In", 45),
      ]),
      makeAboutPage(), makeAdmissionsPage(), makeContactPage(), makePortalPage("Bright Horizons"),
    ],
  },

  // 4 — Little Explorers (Montessori / Early Years)
  {
    name: "Little Explorers",
    slug: "little-explorers",
    description: "Soft, playful design for Montessori and early childhood education centers.",
    category: "montessori",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 4,
    theme: {
      primaryColor: "#7C3AED", secondaryColor: "#A78BFA", accentColor: "#F472B6",
      backgroundColor: "#FAF5FF", surfaceColor: "#F3E8FF",
      headingFont: "Quicksand", bodyFont: "Quicksand", borderRadius: "1.5rem",
      buttonRadius: "9999px", cardRadius: "1.5rem", buttonStyle: "solid", shadowStyle: "lg", containerWidth: "1200px",
    },
    pages: [
      {
        title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
        content: [
          heroBlock("Where Curiosity Blooms", "A nurturing Montessori environment for ages 2–6."),
          featuresBlock("The Montessori Way", "Child-led learning in a prepared environment", [
            { icon: "Flower2", title: "Prepared Environment", description: "Classrooms designed to inspire independent exploration." },
            { icon: "Heart", title: "Gentle Guidance", description: "Trained Montessori educators who follow the child." },
            { icon: "Puzzle", title: "Hands-on Materials", description: "Sensorial and practical life activities." },
          ]),
          galleryBlock(),
          testimonialsBlock(defaultTestimonials),
          ctaBlock("Schedule a Visit", "Come see our classrooms in action."),
        ],
      },
      makeAboutPage(), makeContactPage(), makePortalPage("Little Explorers"),
    ],
  },

  // 5 — Tech-Focused Institute
  {
    name: "Tech-Focused Institute",
    slug: "tech-institute",
    description: "Vibrant dark-mode design for coding bootcamps and technology centers.",
    category: "vocational",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 5,
    theme: {
      primaryColor: "#6366F1", secondaryColor: "#8B5CF6", accentColor: "#06B6D4",
      backgroundColor: "#0F172A", surfaceColor: "#1E293B", textColor: "#F8FAFC",
      headingFont: "Plus Jakarta Sans", bodyFont: "Inter", borderRadius: "1rem",
      buttonRadius: "0.75rem", cardRadius: "1rem", buttonStyle: "solid", shadowStyle: "xl", containerWidth: "1280px",
      glass: true,
    },
    pages: [
      {
        title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
        content: [
          marqueeBlock("New Cohorts Starting Monthly — 90% Job Placement Rate — Industry Mentors"),
          heroBlock("Code Your Future", "Intensive training programs designed to turn beginners into professional developers."),
          statsBlock([{ value: "5k+", label: "Graduates" }, { value: "50+", label: "Tech Partners" }, { value: "$75k", label: "Avg Salary" }]),
          featuresBlock("Why Learn with Us", "Built for the next generation of tech talent", [
            { icon: "Terminal", title: "Hands-on Projects", description: "Build real apps from day one." },
            { icon: "Zap", title: "Accelerated Path", description: "Go from zero to hired in 12 weeks." },
            { icon: "ShieldCheck", title: "Career Support", description: "Job prep and interview coaching." },
          ]),
          ctaBlock("Start Learning Today", "Join 5,000+ students already building their future."),
        ],
      },
      makePortalPage("Tech Institute"),
    ],
  },

  // 6 — STEM Academy
  {
    name: "STEM Academy",
    slug: "stem-academy",
    description: "Bold, science-forward design for STEM-focused schools and labs.",
    category: "stem",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 6,
    theme: {
      primaryColor: "#0891B2", secondaryColor: "#06B6D4", accentColor: "#F59E0B",
      backgroundColor: "#ECFEFF", surfaceColor: "#CFFAFE",
      headingFont: "Space Grotesk", bodyFont: "Inter", borderRadius: "0.75rem",
      buttonRadius: "0.5rem", cardRadius: "0.75rem", buttonStyle: "solid", shadowStyle: "md", containerWidth: "1280px",
    },
    pages: [
      {
        title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
        content: [
          heroBlock("Discover. Innovate. Lead.", "Where science meets imagination — a school built for the innovators of tomorrow."),
          statsBlock([{ value: "12", label: "Science Labs" }, { value: "100%", label: "STEM Curriculum" }, { value: "45+", label: "Robotics Awards" }, { value: "3D", label: "Printing Lab" }]),
          featuresBlock("Our STEM Pillars", "Integrated learning across disciplines", [
            { icon: "Atom", title: "Science", description: "Hands-on experiments and research projects." },
            { icon: "Cpu", title: "Technology", description: "Coding, robotics, and AI fundamentals." },
            { icon: "Calculator", title: "Mathematics", description: "Applied math through real-world problem solving." },
          ]),
          ctaBlock("Enroll in STEM", "Limited seats for the next academic year."),
          testimonialsBlock(defaultTestimonials),
        ],
      },
      makeAboutPage(), makeAdmissionsPage(), makePortalPage("STEM Academy"),
    ],
  },

  // 7 — Minimalist Creative
  {
    name: "Minimalist Creative",
    slug: "creative-studio",
    description: "Elegant, spacious layout for art and design focused schools.",
    category: "creative",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 7,
    theme: {
      primaryColor: "#000000", secondaryColor: "#525252", accentColor: "#A3A3A3",
      backgroundColor: "#FFFFFF", surfaceColor: "#F5F5F5",
      headingFont: "Playfair Display", bodyFont: "Inter", borderRadius: "0rem",
      buttonRadius: "0rem", cardRadius: "0rem", buttonStyle: "outline", shadowStyle: "none", containerWidth: "1200px",
    },
    pages: [
      {
        title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
        content: [
          heroBlock("Design the Unimagined", "A space dedicated to artistic excellence and creative expression."),
          galleryBlock(),
          featuresBlock("Master Your Craft", "Personalized mentorship from industry veterans", [
            { icon: "Palette", title: "Visual Arts", description: "Traditional and digital mediums." },
            { icon: "PenTool", title: "Graphic Design", description: "Visual communication mastery." },
            { icon: "Camera", title: "Photography", description: "Capturing stories through the lens." },
          ]),
          testimonialsBlock(defaultTestimonials),
        ],
      },
      makeAboutPage(), makePortalPage("Creative Studio"),
    ],
  },

  // 8 — Faith Academy
  {
    name: "Faith Academy",
    slug: "faith-academy",
    description: "Warm, reverent design for faith-based and religious schools.",
    category: "religious",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 8,
    theme: {
      primaryColor: "#7E22CE", secondaryColor: "#9333EA", accentColor: "#D97706",
      backgroundColor: "#FEFCE8", surfaceColor: "#FEF3C7",
      headingFont: "Merriweather", bodyFont: "Source Sans 3", borderRadius: "0.5rem",
      buttonRadius: "0.375rem", cardRadius: "0.75rem", buttonStyle: "solid", shadowStyle: "sm", containerWidth: "1200px",
    },
    pages: [
      {
        title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
        content: [
          heroBlock("Rooted in Faith, Growing in Knowledge", "A Christ-centered education nurturing mind, body, and spirit."),
          featuresBlock("Our Foundation", "Building character through faith and learning", [
            { icon: "Heart", title: "Spiritual Growth", description: "Daily devotions, chapel services, and community outreach." },
            { icon: "BookOpen", title: "Academic Excellence", description: "Rigorous academics grounded in biblical principles." },
            { icon: "Users", title: "Community", description: "A family of educators, parents, and students." },
          ]),
          statsBlock([{ value: "25+", label: "Years of Service" }, { value: "100%", label: "Character Focus" }, { value: "500+", label: "Alumni" }]),
          testimonialsBlock(defaultTestimonials),
          ctaBlock("Join Our Family", "Enrollment is open for the upcoming school year."),
        ],
      },
      makeAboutPage(), makeAdmissionsPage(), makeContactPage(), makePortalPage("Faith Academy"),
    ],
  },

  // 9 — International School
  {
    name: "International School",
    slug: "international-school",
    description: "Sophisticated, multilingual-ready design for international and IB schools.",
    category: "international",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 9,
    theme: {
      primaryColor: "#0F766E", secondaryColor: "#14B8A6", accentColor: "#F43F5E",
      backgroundColor: "#FFFFFF", surfaceColor: "#F0FDFA",
      headingFont: "DM Sans", bodyFont: "DM Sans", borderRadius: "0.75rem",
      buttonRadius: "0.5rem", cardRadius: "0.75rem", buttonStyle: "solid", shadowStyle: "md", containerWidth: "1280px",
    },
    pages: [
      {
        title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
        content: [
          heroBlock("A World of Learning", "IB World School offering a globally recognized curriculum in 3 languages."),
          statsBlock([{ value: "60+", label: "Nationalities" }, { value: "3", label: "Languages" }, { value: "IB", label: "Accredited" }, { value: "K-12", label: "All Levels" }]),
          featuresBlock("Global Education", "Preparing citizens of the world", [
            { icon: "Globe", title: "IB Programme", description: "Primary Years, Middle Years, and Diploma Programme." },
            { icon: "Languages", title: "Multilingual", description: "Instruction in English, French, and Mandarin." },
            { icon: "Plane", title: "Exchange Programs", description: "Partner schools across 20 countries." },
          ]),
          ctaBlock("Explore Our Programmes", "Discover the IB difference for your child."),
          testimonialsBlock(defaultTestimonials),
          newsletterBlock(),
        ],
      },
      makeAboutPage(), makeAdmissionsPage(), makeContactPage(), makePortalPage("International School"),
    ],
  },

  // 10 — Sports Academy
  {
    name: "Sports Academy",
    slug: "sports-academy",
    description: "Dynamic, high-energy design for sports-focused schools and academies.",
    category: "sports",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 10,
    theme: {
      primaryColor: "#DC2626", secondaryColor: "#EF4444", accentColor: "#FACC15",
      backgroundColor: "#18181B", surfaceColor: "#27272A", textColor: "#FAFAFA",
      headingFont: "Oswald", bodyFont: "Inter", borderRadius: "0.5rem",
      buttonRadius: "0.25rem", cardRadius: "0.5rem", buttonStyle: "solid", shadowStyle: "xl", containerWidth: "1280px",
    },
    pages: [
      {
        title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
        content: [
          marqueeBlock("National Champions 2025 — Now Recruiting — Scholarships Available"),
          heroBlock("Train Like a Champion", "Elite athletic training combined with world-class academics."),
          statsBlock([{ value: "50+", label: "Trophies" }, { value: "15", label: "Sports" }, { value: "200+", label: "Athletes" }, { value: "95%", label: "Scholarship Rate" }]),
          featuresBlock("Our Programs", "Excellence on and off the field", [
            { icon: "Trophy", title: "Competitive Sports", description: "Football, basketball, track, swimming, and more." },
            { icon: "Dumbbell", title: "Strength & Conditioning", description: "Professional-grade training facilities." },
            { icon: "GraduationCap", title: "Scholar-Athlete", description: "Balanced academics ensuring college readiness." },
          ]),
          ctaBlock("Join the Team", "Tryouts are open — show us what you've got."),
          testimonialsBlock(defaultTestimonials),
        ],
      },
      makeAboutPage(), makeAdmissionsPage(), makePortalPage("Sports Academy"),
    ],
  },

  // 11 — Green Valley (Eco / Nature School)
  {
    name: "Green Valley",
    slug: "green-valley",
    description: "Earthy, nature-inspired design for eco-schools and outdoor learning centers.",
    category: "alternative",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 11,
    theme: {
      primaryColor: "#15803D", secondaryColor: "#22C55E", accentColor: "#A16207",
      backgroundColor: "#F0FDF4", surfaceColor: "#DCFCE7",
      headingFont: "Outfit", bodyFont: "Outfit", borderRadius: "1rem",
      buttonRadius: "9999px", cardRadius: "1rem", buttonStyle: "solid", shadowStyle: "md", containerWidth: "1200px",
    },
    pages: [
      {
        title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
        content: [
          heroBlock("Learning Rooted in Nature", "An outdoor-first school where children grow alongside the natural world."),
          featuresBlock("Our Approach", "Education beyond four walls", [
            { icon: "TreePine", title: "Forest School", description: "Daily outdoor sessions in our 10-acre woodland." },
            { icon: "Sprout", title: "Sustainability", description: "Student-run gardens, composting, and eco-projects." },
            { icon: "Sun", title: "Wellbeing First", description: "Mindfulness, movement, and connection to nature." },
          ]),
          galleryBlock(),
          testimonialsBlock(defaultTestimonials),
          ctaBlock("Discover Green Valley", "Book a campus tour and experience nature-based learning."),
        ],
      },
      makeAboutPage(), makeContactPage(), makePortalPage("Green Valley"),
    ],
  },

  // 12 — Nordic Minimal
  {
    name: "Nordic Minimal",
    slug: "nordic-minimal",
    description: "Ultra-clean Scandinavian-inspired design with generous whitespace.",
    category: "academic",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 12,
    theme: {
      primaryColor: "#1E293B", secondaryColor: "#475569", accentColor: "#0EA5E9",
      backgroundColor: "#FFFFFF", surfaceColor: "#F8FAFC",
      headingFont: "Geist", bodyFont: "Geist", borderRadius: "0.375rem",
      buttonRadius: "0.375rem", cardRadius: "0.5rem", buttonStyle: "outline", shadowStyle: "sm", containerWidth: "1120px",
    },
    pages: [
      makeHomePage("Nordic Academy"),
      makeAboutPage(), makeAdmissionsPage(), makeContactPage(), makePortalPage("Nordic Academy"),
    ],
  },

  // 13 — Sunset Warm
  {
    name: "Sunset Warm",
    slug: "sunset-warm",
    description: "Warm terracotta and amber tones for a welcoming, community-focused school.",
    category: "primary",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 13,
    theme: {
      primaryColor: "#C2410C", secondaryColor: "#EA580C", accentColor: "#0D9488",
      backgroundColor: "#FFFBEB", surfaceColor: "#FEF3C7",
      headingFont: "Bricolage Grotesque", bodyFont: "Inter", borderRadius: "0.75rem",
      buttonRadius: "9999px", cardRadius: "1rem", buttonStyle: "solid", shadowStyle: "md", containerWidth: "1280px",
    },
    pages: [
      makeHomePage("Sunset Primary", [galleryBlock()]),
      makeAboutPage(), makeAdmissionsPage(), makeContactPage(), makePortalPage("Sunset Primary"),
    ],
  },

  // 14 — Ocean Blue
  {
    name: "Ocean Blue",
    slug: "ocean-blue",
    description: "Calm, professional blue palette ideal for secondary schools and colleges.",
    category: "academic",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 14,
    theme: {
      primaryColor: "#1D4ED8", secondaryColor: "#3B82F6", accentColor: "#10B981",
      backgroundColor: "#EFF6FF", surfaceColor: "#DBEAFE",
      headingFont: "Plus Jakarta Sans", bodyFont: "Inter", borderRadius: "0.5rem",
      buttonRadius: "0.5rem", cardRadius: "0.75rem", buttonStyle: "solid", shadowStyle: "md", containerWidth: "1280px",
    },
    pages: [
      makeHomePage("Ocean Blue Academy"),
      makeAboutPage(), makeAdmissionsPage(), makeContactPage(), makePortalPage("Ocean Blue Academy"),
    ],
  },

  // 15 — Midnight Scholar (Dark Academic)
  {
    name: "Midnight Scholar",
    slug: "midnight-scholar",
    description: "Sophisticated dark-mode design with gold accents for premium institutions.",
    category: "academic",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 15,
    theme: {
      primaryColor: "#D4AF37", secondaryColor: "#B8860B", accentColor: "#E5E7EB",
      backgroundColor: "#111827", surfaceColor: "#1F2937", textColor: "#F9FAFB",
      headingFont: "Cormorant Garamond", bodyFont: "Inter", borderRadius: "0.25rem",
      buttonRadius: "0.25rem", cardRadius: "0.5rem", buttonStyle: "outline", shadowStyle: "lg", containerWidth: "1200px",
    },
    pages: [
      {
        title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
        content: [
          heroBlock("Where Brilliance Meets Tradition", "An institution of uncompromising academic standards since 1898."),
          statsBlock([{ value: "126", label: "Years" }, { value: "15:1", label: "Ratio" }, { value: "100%", label: "University Placement" }, { value: "50+", label: "Clubs" }]),
          featuresBlock("The Scholar's Path", "A curriculum designed for depth and mastery", [
            { icon: "BookOpen", title: "Classical Education", description: "Great books, Socratic seminars, and rigorous inquiry." },
            { icon: "Microscope", title: "Research Programs", description: "Student-led research published in academic journals." },
            { icon: "Music", title: "Fine Arts", description: "Conservatory-level music, theater, and visual arts." },
          ]),
          testimonialsBlock(defaultTestimonials),
          ctaBlock("Request Information", "Discover what makes Midnight Scholar extraordinary."),
        ],
      },
      makeAboutPage(), makeAdmissionsPage(), makePortalPage("Midnight Scholar"),
    ],
  },

  // 16 — Coral Springs (Tropical / Island School)
  {
    name: "Coral Springs",
    slug: "coral-springs",
    description: "Vibrant tropical palette for schools in warm climates and island communities.",
    category: "primary",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 16,
    theme: {
      primaryColor: "#0891B2", secondaryColor: "#22D3EE", accentColor: "#F97316",
      backgroundColor: "#FFFFFF", surfaceColor: "#ECFEFF",
      headingFont: "Poppins", bodyFont: "Poppins", borderRadius: "1rem",
      buttonRadius: "9999px", cardRadius: "1rem", buttonStyle: "solid", shadowStyle: "lg", containerWidth: "1280px",
    },
    pages: [
      makeHomePage("Coral Springs School", [countdownBlock("Summer Camp Starts In", 60)]),
      makeAboutPage(), makeContactPage(), makePortalPage("Coral Springs"),
    ],
  },

  // 17 — Slate & Steel (Vocational / Trade School)
  {
    name: "Slate & Steel",
    slug: "slate-steel",
    description: "Industrial, no-nonsense design for vocational and trade schools.",
    category: "vocational",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 17,
    theme: {
      primaryColor: "#F59E0B", secondaryColor: "#D97706", accentColor: "#64748B",
      backgroundColor: "#1C1917", surfaceColor: "#292524", textColor: "#FAFAF9",
      headingFont: "Bebas Neue", bodyFont: "Inter", borderRadius: "0.25rem",
      buttonRadius: "0.25rem", cardRadius: "0.375rem", buttonStyle: "solid", shadowStyle: "none", containerWidth: "1280px",
    },
    pages: [
      {
        title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
        content: [
          heroBlock("Build Your Trade. Build Your Future.", "Hands-on vocational training in welding, electrical, plumbing, and more."),
          statsBlock([{ value: "98%", label: "Employment" }, { value: "6mo", label: "Programs" }, { value: "50+", label: "Employer Partners" }]),
          featuresBlock("Trade Programs", "Learn from master tradespeople", [
            { icon: "Wrench", title: "Skilled Trades", description: "Welding, carpentry, plumbing, and electrical." },
            { icon: "HardHat", title: "Safety First", description: "Industry-standard safety certifications included." },
            { icon: "Briefcase", title: "Job Placement", description: "Direct pipeline to employer partners." },
          ]),
          pricingBlock(defaultPricing),
          ctaBlock("Start Your Career", "No experience needed — just determination."),
        ],
      },
      makeContactPage(), makePortalPage("Slate & Steel"),
    ],
  },

  // 18 — Rosewood (Girls' School / Women's Education)
  {
    name: "Rosewood",
    slug: "rosewood",
    description: "Elegant, empowering design with soft rose and burgundy tones.",
    category: "academic",
    mode: "FULL_WEBSITE",
    isDefault: false,
    sortOrder: 18,
    theme: {
      primaryColor: "#9F1239", secondaryColor: "#E11D48", accentColor: "#D4AF37",
      backgroundColor: "#FFF1F2", surfaceColor: "#FFE4E6",
      headingFont: "Cormorant Garamond", bodyFont: "Lato", borderRadius: "0.5rem",
      buttonRadius: "9999px", cardRadius: "0.75rem", buttonStyle: "solid", shadowStyle: "md", containerWidth: "1200px",
    },
    pages: [
      {
        title: "Home", slug: "home", isHomepage: true, sortOrder: 0,
        content: [
          heroBlock("Empowering Young Women", "Where confidence, intellect, and leadership flourish."),
          featuresBlock("Our Promise", "Nurturing the leaders of tomorrow", [
            { icon: "Sparkles", title: "Leadership", description: "Every student leads — in class, on stage, and in life." },
            { icon: "BookOpen", title: "Academic Excellence", description: "Consistently top-ranked in national examinations." },
            { icon: "Heart", title: "Sisterhood", description: "A lifelong community of support and achievement." },
          ]),
          statsBlock([{ value: "100%", label: "University Bound" }, { value: "35+", label: "Clubs" }, { value: "800+", label: "Students" }]),
          testimonialsBlock(defaultTestimonials),
          ctaBlock("Join Rosewood", "Applications now open for all year groups."),
        ],
      },
      makeAboutPage(), makeAdmissionsPage(), makePortalPage("Rosewood"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // PORTAL-ONLY TEMPLATES
  // ═══════════════════════════════════════════════════════

  // 19 — Classic Portal
  {
    name: "Classic Portal",
    slug: "classic-portal",
    description: "Clean, professional login portal with blue tones.",
    category: "portal",
    mode: "PORTAL_ONLY",
    isDefault: false,
    sortOrder: 101,
    theme: {
      primaryColor: "#2563EB", secondaryColor: "#3B82F6", backgroundColor: "#F8FAFC",
      surfaceColor: "#FFFFFF", headingFont: "Inter", bodyFont: "Inter", borderRadius: "0.5rem",
    },
    pages: [{ title: "Login", slug: "login", isPortalLogin: true, isHomepage: true, content: [portalBlock("School Portal")] }],
  },

  // 20 — Cyber Portal
  {
    name: "Cyber Portal",
    slug: "cyber-portal",
    description: "Dark, neon-accented portal for tech-forward schools.",
    category: "portal",
    mode: "PORTAL_ONLY",
    isDefault: false,
    sortOrder: 102,
    theme: {
      primaryColor: "#6EE7B7", secondaryColor: "#06B6D4", backgroundColor: "#020617",
      surfaceColor: "#0F172A", textColor: "#F8FAFC",
      headingFont: "Geist Mono", bodyFont: "Inter", borderRadius: "0.75rem", darkMode: true,
    },
    pages: [{ title: "Login", slug: "login", isPortalLogin: true, isHomepage: true, content: [portalBlock("Cyber Academy")] }],
  },

  // 21 — Warm Portal
  {
    name: "Warm Portal",
    slug: "warm-portal",
    description: "Friendly, warm-toned portal with rounded elements.",
    category: "portal",
    mode: "PORTAL_ONLY",
    isDefault: false,
    sortOrder: 103,
    theme: {
      primaryColor: "#EA580C", secondaryColor: "#F97316", backgroundColor: "#FFFBEB",
      surfaceColor: "#FFFFFF", headingFont: "Nunito", bodyFont: "Nunito", borderRadius: "1rem",
    },
    pages: [{ title: "Login", slug: "login", isPortalLogin: true, isHomepage: true, content: [portalBlock("School Portal")] }],
  },

  // 22 — Elegant Portal
  {
    name: "Elegant Portal",
    slug: "elegant-portal",
    description: "Serif-based, premium-feeling portal with gold accents.",
    category: "portal",
    mode: "PORTAL_ONLY",
    isDefault: false,
    sortOrder: 104,
    theme: {
      primaryColor: "#D4AF37", secondaryColor: "#B8860B", backgroundColor: "#111827",
      surfaceColor: "#1F2937", textColor: "#F9FAFB",
      headingFont: "Cormorant Garamond", bodyFont: "Inter", borderRadius: "0.25rem", darkMode: true,
    },
    pages: [{ title: "Login", slug: "login", isPortalLogin: true, isHomepage: true, content: [portalBlock("Academy Portal")] }],
  },
]

async function seed() {
  console.log("Seeding website builder templates...")

  for (const t of TEMPLATES) {
    await (prisma as any).wBTemplate.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        description: t.description,
        category: t.category,
        mode: t.mode,
        isDefault: t.isDefault,
        sortOrder: t.sortOrder,
        theme: JSON.stringify(t.theme),
        pages: JSON.stringify(t.pages),
      },
      create: {
        name: t.name,
        slug: t.slug,
        description: t.description,
        category: t.category,
        mode: t.mode,
        isDefault: t.isDefault,
        sortOrder: t.sortOrder,
        theme: JSON.stringify(t.theme),
        pages: JSON.stringify(t.pages),
      },
    })
    console.log(`  ✓ ${t.name}`)
  }

  console.log(`\nSeeded ${TEMPLATES.length} templates.`)
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

import { Block } from "./types"
import { BLOCK_DEFINITIONS } from "./registry"

export interface Template {
    id: string
    name: string
    description: string
    thumbnail: string
    blocks: Block[]
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export const TEMPLATES: Template[] = [
    // 1. Elite International School - Prestigious & Traditional
    {
        id: "elite-international",
        name: "Elite International",
        description: "A prestigious design focused on heritage, excellence, and global leadership standards.",
        thumbnail: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "ELITE INT'L", sticky: true } },
            { 
                id: generateId(), 
                type: "hero", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero.defaultProps,
                    title: "The Standard of Global Excellence",
                    subtitle: "Developing tomorrow's world leaders through a prestigious curriculum and historic heritage.",
                    backgroundImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2000&auto=format&fit=crop",
                    align: "center",
                    showOverlay: true
                } 
            },
            { 
                id: generateId(), 
                type: "features", 
                props: { 
                    ...BLOCK_DEFINITIONS.features.defaultProps,
                    title: "A Tradition of Success",
                    description: "Our pillars of excellence define every student's journey.",
                    columns: 3,
                    iconStyle: "badge"
                } 
            },
            { 
                id: generateId(), 
                type: "content", 
                props: { 
                    ...BLOCK_DEFINITIONS.content.defaultProps,
                    title: "Academic Rigor",
                    subtitle: "Curriculum",
                    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2000&auto=format&fit=crop",
                    align: "left"
                } 
            },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, bg: "light" } },
            { id: generateId(), type: "cta", props: { ...BLOCK_DEFINITIONS.cta.defaultProps, title: "Join Our Legacy", variant: "primary" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 2. STEM Innovation Lab - Modern & Tech-focused
    {
        id: "stem-lab",
        name: "STEM Innovation Lab",
        description: "Modern, high-tech design for science, technology, and engineering academies.",
        thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "STEM LAB", transparent: true } },
            { 
                id: generateId(), 
                type: "hero_alt", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero_alt.defaultProps,
                    title: "Innovate the Future",
                    subtitle: "Hands-on learning in robotics, AI, and advanced sciences for the next generation.",
                    backgroundImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop",
                } 
            },
            { 
                id: generateId(), 
                type: "features_alt", 
                props: { 
                    ...BLOCK_DEFINITIONS.features_alt.defaultProps,
                    title: "Advanced Learning",
                    description: "Equipping students with the tools of tomorrow."
                } 
            },
            { 
                id: generateId(), 
                type: "gallery", 
                props: { 
                    ...BLOCK_DEFINITIONS.gallery.defaultProps,
                    title: "Our Innovation Labs",
                    columns: 3
                } 
            },
            { id: generateId(), type: "faq_alt", props: BLOCK_DEFINITIONS.faq_alt.defaultProps },
            { id: generateId(), type: "footer", props: { ...BLOCK_DEFINITIONS.footer.defaultProps, bg: "dark" } },
        ],
    },

    // 3. Academy of Fine Arts - Creative & Elegant
    {
        id: "fine-arts",
        name: "Academy of Fine Arts",
        description: "Elegant, spacious design for arts and humanities colleges with a focus on visual storytelling.",
        thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "ARTS ACADEMY" } },
            { 
                id: generateId(), 
                type: "hero", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero.defaultProps,
                    title: "Unleash Your Creative Vision",
                    subtitle: "Where classical training meets modern artistic expression.",
                    backgroundImage: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2000&auto=format&fit=crop",
                    align: "left",
                    showOverlay: false
                } 
            },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Student Portfolio", columns: 4 } },
            { 
                id: generateId(), 
                type: "content_alt", 
                props: { 
                    ...BLOCK_DEFINITIONS.content_alt.defaultProps,
                    title: "Inspiring Studios",
                    description: "Our campus is designed to foster creativity at every turn."
                } 
            },
            { id: generateId(), type: "testimonials_alt", props: BLOCK_DEFINITIONS.testimonials_alt.defaultProps },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 4. Global International School - Bright & Welcoming
    {
        id: "global-intl",
        name: "Global International",
        description: "Bright, welcoming, and inclusive design for international K-12 schools.",
        thumbnail: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "GLOBAL SCHOOL" } },
            { 
                id: generateId(), 
                type: "hero", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero.defaultProps,
                    title: "A World-Class Education",
                    subtitle: "Empowering students from over 50 countries to achieve their full potential.",
                    backgroundImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2000&auto=format&fit=crop",
                    align: "center",
                    showOverlay: true
                } 
            },
            { id: generateId(), type: "features", props: { ...BLOCK_DEFINITIONS.features.defaultProps, title: "Why Families Choose Us", columns: 3 } },
            { id: generateId(), type: "content", props: { ...BLOCK_DEFINITIONS.content.defaultProps, title: "Our Diverse Community" } },
            { id: generateId(), type: "faq", props: BLOCK_DEFINITIONS.faq.defaultProps },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 5. Urban City College - Sharp & Professional
    {
        id: "urban-college",
        name: "Urban City College",
        description: "Sharp, professional layout for city-based higher education and sixth-form colleges.",
        thumbnail: "https://images.unsplash.com/photo-1523240715639-9bc90042da63?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "URBAN COLLEGE" } },
            { id: generateId(), type: "hero_alt", props: { ...BLOCK_DEFINITIONS.hero_alt.defaultProps, title: "Shape Your Career", subtitle: "Industry-aligned programs in the heart of the city." } },
            { id: generateId(), type: "features", props: { ...BLOCK_DEFINITIONS.features.defaultProps, title: "Career Pathways", columns: 4 } },
            { id: generateId(), type: "content_alt", props: BLOCK_DEFINITIONS.content_alt.defaultProps },
            { id: generateId(), type: "cta", props: { ...BLOCK_DEFINITIONS.cta.defaultProps, variant: "primary" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 6. Montessori Discovery - Warm & Holistic
    {
        id: "montessori-discovery",
        name: "Montessori Discovery",
        description: "Warm, holistic design focused on child-led learning and natural environments.",
        thumbnail: "https://images.unsplash.com/photo-1503676382389-4809596d5290?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "Montessori Discovery" } },
            { 
                id: generateId(), 
                type: "hero", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero.defaultProps,
                    title: "Follow the Child",
                    subtitle: "A nurturing environment where curiosity leads to lifelong learning.",
                    backgroundImage: "https://images.unsplash.com/photo-1596495578065-6c0f060238d6?q=80&w=2000&auto=format&fit=crop",
                    align: "center",
                    showOverlay: false
                } 
            },
            { id: generateId(), type: "features", props: { ...BLOCK_DEFINITIONS.features.defaultProps, title: "Our Methodology", iconStyle: "circle" } },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Learning in Action", columns: 2 } },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, bg: "light" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 7. Tech Leadership Academy - Future-Proof
    {
        id: "tech-leadership",
        name: "Tech Leadership Academy",
        description: "A bold, dark-themed design for cutting-edge technology and engineering programs.",
        thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "TECH LEADERS", sticky: true } },
            { 
                id: generateId(), 
                type: "hero", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero.defaultProps,
                    title: "Code. Build. Lead.",
                    subtitle: "The premier destination for future developers and tech innovators.",
                    backgroundImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop",
                    align: "left",
                    showOverlay: true
                } 
            },
            { id: generateId(), type: "features_alt", props: { ...BLOCK_DEFINITIONS.features_alt.defaultProps, title: "Advanced Tech Stack" } },
            { id: generateId(), type: "content", props: { ...BLOCK_DEFINITIONS.content.defaultProps, title: "Real-World Experience", align: "right" } },
            { id: generateId(), type: "testimonials_alt", props: BLOCK_DEFINITIONS.testimonials_alt.defaultProps },
            { id: generateId(), type: "footer", props: { ...BLOCK_DEFINITIONS.footer.defaultProps, bg: "dark" } },
        ],
    },

    // 8. Sports Excellence - High Energy
    {
        id: "sports-excellence",
        name: "Sports Excellence Academy",
        description: "High-energy design for prestigious sports academies and athletic programs.",
        thumbnail: "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "SPORTS ACADEMY" } },
            { 
                id: generateId(), 
                type: "hero", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero.defaultProps,
                    title: "Train Like a Pro",
                    subtitle: "Where elite athletics meets academic rigor.",
                    backgroundImage: "https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=2000&auto=format&fit=crop",
                    align: "center",
                    showOverlay: true
                } 
            },
            { id: generateId(), type: "features", props: { ...BLOCK_DEFINITIONS.features.defaultProps, title: "Our Programs", columns: 3 } },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Elite Facilities", columns: 3 } },
            { id: generateId(), type: "cta", props: { ...BLOCK_DEFINITIONS.cta.defaultProps, title: "Join the Next Cohort" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 9. Creative Arts Conservatory - Sophisticated
    {
        id: "arts-conservatory",
        name: "Creative Arts Conservatory",
        description: "A minimalist, image-forward design for world-class performing and visual arts schools.",
        thumbnail: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "CONSERVATORY" } },
            { 
                id: generateId(), 
                type: "hero_alt", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero_alt.defaultProps,
                    title: "Your Stage Awaits",
                    subtitle: "Refine your craft in an environment of professional excellence.",
                    backgroundImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2000&auto=format&fit=crop",
                } 
            },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Masterpieces", columns: 4 } },
            { id: generateId(), type: "content_alt", props: BLOCK_DEFINITIONS.content_alt.defaultProps },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, bg: "muted" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 10. Faith & Service Academy - Serene
    {
        id: "faith-service",
        name: "Faith & Service Academy",
        description: "A serene, community-focused design for faith-based educational institutions.",
        thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "FAITH ACADEMY" } },
            { 
                id: generateId(), 
                type: "hero", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero.defaultProps,
                    title: "Education with Purpose",
                    subtitle: "Integrating academic excellence with spiritual formation.",
                    backgroundImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2000&auto=format&fit=crop",
                    align: "center",
                    showOverlay: true
                } 
            },
            { id: generateId(), type: "content", props: { ...BLOCK_DEFINITIONS.content.defaultProps, title: "Our Mission" } },
            { id: generateId(), type: "features", props: { ...BLOCK_DEFINITIONS.features.defaultProps, title: "Core Values", iconStyle: "circle" } },
            { id: generateId(), type: "faq", props: BLOCK_DEFINITIONS.faq.defaultProps },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // ═══════════════════════════════════════════════════════════════
    // ADVANCED INDUSTRY-AGNOSTIC TEMPLATES
    // ═══════════════════════════════════════════════════════════════

    // 11. SaaS Product Launch — Gradient-heavy, conversion-focused
    {
        id: "saas-launch",
        name: "SaaS Product Launch",
        description: "A bold, conversion-focused landing page with gradient accents, social proof, and feature breakdowns for software products.",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "LaunchKit", menuItems: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "Testimonials", href: "#testimonials" }, { label: "FAQ", href: "#faq" }], sticky: true, transparent: true } },
            { 
                id: generateId(), 
                type: "hero", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero.defaultProps,
                    title: "Ship faster.\nScale smarter.",
                    subtitle: "The all-in-one platform that helps product teams go from idea to launch in days, not months.",
                    ctaText: "Start Free Trial",
                    ctaLink: "#",
                    align: "center",
                    showOverlay: false,
                    backgroundImage: "",
                    backgroundType: "gradient",
                    backgroundGradient: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
                    animation: "slideUp"
                } 
            },
            { id: generateId(), type: "logos", props: { ...BLOCK_DEFINITIONS.logos.defaultProps, title: "Trusted by 2,000+ teams worldwide", animation: "fade" } },
            { 
                id: generateId(), 
                type: "features", 
                props: { 
                    ...BLOCK_DEFINITIONS.features.defaultProps,
                    title: "Everything you need to ship",
                    description: "Powerful features designed for modern product teams.",
                    columns: 3,
                    iconStyle: "badge",
                    features: [
                        { title: "Real-time Collaboration", description: "Work together seamlessly with live cursors, comments, and version history." },
                        { title: "AI-Powered Insights", description: "Get intelligent suggestions and automated workflows powered by machine learning." },
                        { title: "Enterprise Security", description: "SOC 2 compliant with end-to-end encryption and role-based access controls." },
                        { title: "API-First Design", description: "Integrate with your existing stack through our comprehensive REST and GraphQL APIs." },
                        { title: "Custom Workflows", description: "Build automated pipelines that match your team's unique processes." },
                        { title: "Analytics Dashboard", description: "Track performance metrics with beautiful, real-time data visualizations." }
                    ],
                    backgroundPattern: "dots",
                    animation: "slideUp"
                } 
            },
            { 
                id: generateId(), 
                type: "content", 
                props: { 
                    ...BLOCK_DEFINITIONS.content.defaultProps,
                    subtitle: "Built for Scale",
                    title: "From startup to enterprise",
                    description: "Whether you're a 5-person startup or a Fortune 500 company, our platform scales with you. No migration needed.",
                    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop",
                    showButton: true,
                    buttonText: "See Case Studies",
                    listItems: ["99.99% uptime SLA", "Auto-scaling infrastructure", "Global CDN with edge caching", "Dedicated support for Enterprise"],
                    align: "left",
                    animation: "slideUp"
                } 
            },
            { 
                id: generateId(), 
                type: "stats", 
                props: { 
                    ...BLOCK_DEFINITIONS.stats.defaultProps,
                    stats: [
                        { value: "2000", suffix: "+", label: "Active Teams" },
                        { value: "99.99", suffix: "%", label: "Uptime" },
                        { value: "4.9", suffix: "/5", label: "G2 Rating" },
                        { value: "50", suffix: "M+", label: "API Calls/Day" }
                    ],
                    animation: "slideUp",
                    backgroundType: "gradient",
                    backgroundGradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)"
                } 
            },
            { 
                id: generateId(), 
                type: "pricing", 
                props: { 
                    ...BLOCK_DEFINITIONS.pricing.defaultProps,
                    title: "Simple, transparent pricing",
                    subtitle: "No hidden fees. Cancel anytime.",
                    plans: [
                        { name: "Starter", price: "$29/mo", buttonText: "Start Free", isFeatured: false, features: ["5 team members", "10 projects", "Basic analytics", "Email support"] },
                        { name: "Pro", price: "$79/mo", buttonText: "Start Free Trial", isFeatured: true, features: ["Unlimited members", "Unlimited projects", "Advanced analytics", "Priority support", "Custom integrations", "API access"] },
                        { name: "Enterprise", price: "Custom", buttonText: "Contact Sales", isFeatured: false, features: ["Everything in Pro", "SSO & SAML", "Dedicated CSM", "Custom SLA", "On-premise option"] }
                    ],
                    animation: "slideUp"
                } 
            },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Loved by product teams", subtitle: "What Our Users Say", bg: "light", animation: "fade" } },
            { id: generateId(), type: "faq", props: { ...BLOCK_DEFINITIONS.faq.defaultProps, title: "Frequently asked questions", subtitle: "Got questions?", animation: "fade" } },
            { 
                id: generateId(), 
                type: "cta", 
                props: { 
                    ...BLOCK_DEFINITIONS.cta.defaultProps,
                    title: "Ready to transform your workflow?",
                    subtitle: "Join 2,000+ teams already shipping faster with LaunchKit.",
                    primaryText: "Start Free Trial",
                    secondaryText: "Book a Demo",
                    variant: "solid",
                    animation: "zoom"
                } 
            },
            { id: generateId(), type: "footer", props: { ...BLOCK_DEFINITIONS.footer.defaultProps, title: "LaunchKit", tagline: "Ship faster. Scale smarter.", showCopyright: true } },
        ],
    },

    // 12. Creative Portfolio — Minimal, image-forward, designer-focused
    {
        id: "creative-portfolio",
        name: "Creative Portfolio",
        description: "A minimal, image-forward portfolio for designers, photographers, and creatives with large visuals and subtle animations.",
        thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "STUDIO.AE", menuItems: [{ label: "Work", href: "#work" }, { label: "About", href: "#about" }, { label: "Contact", href: "#contact" }], sticky: true, transparent: true } },
            { 
                id: generateId(), 
                type: "hero", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero.defaultProps,
                    title: "Design that\nspeaks volumes.",
                    subtitle: "Award-winning creative direction, brand identity, and digital experiences.",
                    ctaText: "View Selected Work",
                    ctaLink: "#work",
                    align: "left",
                    showOverlay: false,
                    backgroundImage: "",
                    backgroundPattern: "grid",
                    animation: "fade"
                } 
            },
            { 
                id: generateId(), 
                type: "gallery", 
                props: { 
                    ...BLOCK_DEFINITIONS.gallery.defaultProps,
                    title: "Selected Work",
                    subtitle: "Recent Projects",
                    columns: 2,
                    images: [
                        { src: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=2000&auto=format&fit=crop", label: "Brand Identity — Nexus", alt: "Nexus brand project" },
                        { src: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop", label: "Web Design — Aura", alt: "Aura web design" },
                        { src: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=2000&auto=format&fit=crop", label: "Packaging — Bloom", alt: "Bloom packaging" },
                        { src: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=2000&auto=format&fit=crop", label: "App Design — Flow", alt: "Flow app design" }
                    ],
                    animation: "fade"
                } 
            },
            { 
                id: generateId(), 
                type: "content", 
                props: { 
                    ...BLOCK_DEFINITIONS.content.defaultProps,
                    subtitle: "About",
                    title: "Crafting digital experiences since 2015",
                    description: "I'm a multidisciplinary designer based in London, specializing in brand identity, web design, and creative direction. I believe in the power of simplicity and the beauty of thoughtful details.",
                    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000&auto=format&fit=crop",
                    showButton: false,
                    listItems: ["Red Dot Design Award 2023", "Awwwards Site of the Day", "Featured in Communication Arts", "10+ years experience"],
                    align: "right",
                    animation: "slideUp"
                } 
            },
            { 
                id: generateId(), 
                type: "stats", 
                props: { 
                    ...BLOCK_DEFINITIONS.stats.defaultProps,
                    stats: [
                        { value: "120", suffix: "+", label: "Projects Delivered" },
                        { value: "8", suffix: "", label: "Design Awards" },
                        { value: "40", suffix: "+", label: "Happy Clients" },
                        { value: "10", suffix: "yr", label: "Experience" }
                    ],
                    animation: "slideUp"
                } 
            },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Kind words from clients", subtitle: "Testimonials", columns: 2, bg: "light", animation: "fade" } },
            { 
                id: generateId(), 
                type: "contact", 
                props: { 
                    ...BLOCK_DEFINITIONS.contact.defaultProps,
                    title: "Let's create something remarkable",
                    subtitle: "Get in Touch",
                    description: "Have a project in mind? I'd love to hear about it. Drop me a message and I'll get back to you within 24 hours.",
                    email: "hello@studio.ae",
                    phone: "+44 20 7946 0958",
                    address: "Shoreditch, London, UK",
                    animation: "slideUp"
                } 
            },
            { id: generateId(), type: "footer", props: { ...BLOCK_DEFINITIONS.footer.defaultProps, title: "STUDIO.AE", tagline: "Design that speaks volumes.", showCopyright: true, columns: 2, sections: [{ heading: "Navigation", links: [{ label: "Work", href: "#" }, { label: "About", href: "#" }, { label: "Contact", href: "#" }] }, { heading: "Social", links: [{ label: "Dribbble", href: "#" }, { label: "Behance", href: "#" }, { label: "Instagram", href: "#" }] }] } },
        ],
    },

    // 13. Digital Agency — Bold, dark, high-energy
    {
        id: "digital-agency",
        name: "Digital Agency",
        description: "A bold, dark-themed agency landing page with high-energy visuals, case studies, and a strong conversion funnel.",
        thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "BLACKPIXEL", menuItems: [{ label: "Services", href: "#services" }, { label: "Work", href: "#work" }, { label: "Team", href: "#team" }, { label: "Contact", href: "#contact" }], sticky: true, transparent: true } },
            { 
                id: generateId(), 
                type: "hero", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero.defaultProps,
                    title: "We build digital\nproducts that matter.",
                    subtitle: "Strategy. Design. Engineering. We partner with ambitious brands to create world-class digital experiences.",
                    ctaText: "Start a Project",
                    ctaLink: "#contact",
                    align: "left",
                    showOverlay: true,
                    backgroundImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop",
                    animation: "slideUp"
                } 
            },
            { id: generateId(), type: "logos", props: { ...BLOCK_DEFINITIONS.logos.defaultProps, title: "Trusted by industry leaders", animation: "fade" } },
            { 
                id: generateId(), 
                type: "features", 
                props: { 
                    ...BLOCK_DEFINITIONS.features.defaultProps,
                    title: "Our Services",
                    description: "End-to-end digital solutions for forward-thinking brands.",
                    columns: 3,
                    iconStyle: "badge",
                    features: [
                        { title: "Brand Strategy", description: "Deep market research and positioning that gives your brand an unfair advantage." },
                        { title: "Product Design", description: "User-centered design that converts visitors into loyal customers." },
                        { title: "Web Development", description: "Blazing-fast, accessible websites built with cutting-edge technology." },
                        { title: "Growth Marketing", description: "Data-driven campaigns that scale your acquisition and retention." },
                        { title: "Mobile Apps", description: "Native and cross-platform apps that users love to use daily." },
                        { title: "AI Integration", description: "Smart automation and AI features that give your product a competitive edge." }
                    ],
                    animation: "slideUp",
                    backgroundPattern: "mesh"
                } 
            },
            { 
                id: generateId(), 
                type: "content_alt", 
                props: { 
                    ...BLOCK_DEFINITIONS.content_alt.defaultProps,
                    subtitle: "Case Study",
                    title: "3x revenue growth for FinTech startup",
                    description: "We redesigned the entire user experience and built a new marketing site that increased conversions by 340% in just 90 days.",
                    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop",
                    showButton: true,
                    buttonText: "Read Case Study",
                    listItems: ["340% increase in conversions", "2.5x faster page load times", "50% reduction in bounce rate"],
                    animation: "slideUp"
                } 
            },
            { 
                id: generateId(), 
                type: "stats", 
                props: { 
                    ...BLOCK_DEFINITIONS.stats.defaultProps,
                    stats: [
                        { value: "200", suffix: "+", label: "Projects Shipped" },
                        { value: "50", suffix: "M+", label: "Revenue Generated" },
                        { value: "98", suffix: "%", label: "Client Retention" },
                        { value: "35", suffix: "+", label: "Team Members" }
                    ],
                    animation: "slideUp"
                } 
            },
            { 
                id: generateId(), 
                type: "team", 
                props: { 
                    ...BLOCK_DEFINITIONS.team.defaultProps,
                    title: "The minds behind the pixels",
                    subtitle: "Our Team",
                    members: [
                        { name: "Alex Rivera", role: "CEO & Founder", bio: "Former Google Design Lead. 15 years in digital.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" },
                        { name: "Maya Chen", role: "Creative Director", bio: "Award-winning designer. Cannes Lions winner.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop" },
                        { name: "James Park", role: "Head of Engineering", bio: "Ex-Stripe. Full-stack architect.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop" }
                    ],
                    animation: "fade"
                } 
            },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "What our clients say", subtitle: "Client Love", bg: "dark", columns: 2, animation: "fade" } },
            { 
                id: generateId(), 
                type: "cta", 
                props: { 
                    ...BLOCK_DEFINITIONS.cta.defaultProps,
                    title: "Let's build something extraordinary",
                    subtitle: "We're selective about the projects we take on. If you're serious about growth, let's talk.",
                    primaryText: "Start a Project",
                    secondaryText: "View Our Work",
                    variant: "solid",
                    animation: "zoom"
                } 
            },
            { id: generateId(), type: "footer", props: { ...BLOCK_DEFINITIONS.footer.defaultProps, title: "BLACKPIXEL", tagline: "Digital products that matter.", showCopyright: true } },
        ],
    },

    // 14. E-commerce Store — Clean, product-focused, trust-building
    {
        id: "ecommerce-store",
        name: "E-commerce Storefront",
        description: "A clean, trust-building storefront with product highlights, social proof, and a strong value proposition.",
        thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "MAISON", menuItems: [{ label: "Shop", href: "#shop" }, { label: "Collections", href: "#collections" }, { label: "About", href: "#about" }, { label: "Contact", href: "#contact" }], sticky: true } },
            { 
                id: generateId(), 
                type: "hero", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero.defaultProps,
                    title: "Timeless pieces.\nModern craft.",
                    subtitle: "Handcrafted essentials designed for everyday elegance. Sustainably made, built to last.",
                    ctaText: "Shop the Collection",
                    ctaLink: "#shop",
                    align: "center",
                    showOverlay: true,
                    backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop",
                    animation: "fade"
                } 
            },
            { id: generateId(), type: "logos", props: { ...BLOCK_DEFINITIONS.logos.defaultProps, title: "As featured in", animation: "fade" } },
            { 
                id: generateId(), 
                type: "features", 
                props: { 
                    ...BLOCK_DEFINITIONS.features.defaultProps,
                    title: "Why MAISON",
                    description: "Quality you can feel. Values you can trust.",
                    columns: 4,
                    iconStyle: "circle",
                    features: [
                        { title: "Sustainable Materials", description: "100% organic and recycled materials sourced responsibly." },
                        { title: "Handcrafted Quality", description: "Each piece is made by skilled artisans with decades of experience." },
                        { title: "Free Shipping", description: "Complimentary worldwide shipping on all orders over $100." },
                        { title: "Easy Returns", description: "30-day hassle-free returns. No questions asked." }
                    ],
                    animation: "slideUp"
                } 
            },
            { 
                id: generateId(), 
                type: "gallery", 
                props: { 
                    ...BLOCK_DEFINITIONS.gallery.defaultProps,
                    title: "The Collection",
                    subtitle: "New Arrivals",
                    columns: 3,
                    images: [
                        { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2000&auto=format&fit=crop", label: "Minimalist Watch — $189", alt: "Watch" },
                        { src: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?q=80&w=2000&auto=format&fit=crop", label: "Leather Tote — $245", alt: "Bag" },
                        { src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop", label: "Heritage Sneaker — $165", alt: "Sneaker" }
                    ],
                    animation: "slideUp"
                } 
            },
            { 
                id: generateId(), 
                type: "content_alt", 
                props: { 
                    ...BLOCK_DEFINITIONS.content_alt.defaultProps,
                    subtitle: "Our Story",
                    title: "Born from a love of craft",
                    description: "Founded in 2018, MAISON was born from a simple belief: everyday essentials should be beautiful, sustainable, and built to last. We partner with artisans around the world to bring you pieces that tell a story.",
                    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2000&auto=format&fit=crop",
                    showButton: true,
                    buttonText: "Our Story",
                    listItems: ["Carbon-neutral since 2021", "B Corp certified", "Fair Trade partnerships"],
                    animation: "slideUp"
                } 
            },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "What our customers say", subtitle: "Reviews", columns: 3, bg: "light", animation: "fade" } },
            { id: generateId(), type: "newsletter", props: { ...BLOCK_DEFINITIONS.newsletter.defaultProps, title: "Join the MAISON family", description: "Get early access to new collections, exclusive offers, and 10% off your first order.", buttonText: "Subscribe", animation: "fade" } },
            { id: generateId(), type: "footer", props: { ...BLOCK_DEFINITIONS.footer.defaultProps, title: "MAISON", tagline: "Timeless pieces. Modern craft.", showCopyright: true, columns: 4, sections: [{ heading: "Shop", links: [{ label: "New Arrivals", href: "#" }, { label: "Best Sellers", href: "#" }, { label: "Sale", href: "#" }] }, { heading: "Help", links: [{ label: "Shipping", href: "#" }, { label: "Returns", href: "#" }, { label: "FAQ", href: "#" }] }, { heading: "Company", links: [{ label: "About", href: "#" }, { label: "Sustainability", href: "#" }, { label: "Careers", href: "#" }] }, { heading: "Social", links: [{ label: "Instagram", href: "#" }, { label: "Pinterest", href: "#" }, { label: "TikTok", href: "#" }] }] } },
        ],
    },

    // 15. Modern Blog / Publication — Content-first, editorial
    {
        id: "modern-blog",
        name: "Modern Publication",
        description: "A content-first editorial layout for blogs, magazines, and thought leadership platforms with clean typography.",
        thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "THE JOURNAL", menuItems: [{ label: "Articles", href: "#articles" }, { label: "Topics", href: "#topics" }, { label: "About", href: "#about" }, { label: "Subscribe", href: "#subscribe" }], sticky: true, transparent: true } },
            { 
                id: generateId(), 
                type: "hero", 
                props: { 
                    ...BLOCK_DEFINITIONS.hero.defaultProps,
                    title: "Ideas worth\nthinking about.",
                    subtitle: "Long-form essays on technology, design, culture, and the future of work. Published weekly.",
                    ctaText: "Start Reading",
                    ctaLink: "#articles",
                    align: "center",
                    showOverlay: false,
                    backgroundImage: "",
                    backgroundPattern: "dots",
                    animation: "fade"
                } 
            },
            { 
                id: generateId(), 
                type: "gallery", 
                props: { 
                    ...BLOCK_DEFINITIONS.gallery.defaultProps,
                    title: "Featured Articles",
                    subtitle: "Editor's Picks",
                    columns: 3,
                    images: [
                        { src: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2000&auto=format&fit=crop", label: "The Future of Remote Work", alt: "Remote work article" },
                        { src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2000&auto=format&fit=crop", label: "Design Systems at Scale", alt: "Design systems article" },
                        { src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop", label: "AI and Creativity", alt: "AI creativity article" }
                    ],
                    animation: "slideUp"
                } 
            },
            { 
                id: generateId(), 
                type: "features", 
                props: { 
                    ...BLOCK_DEFINITIONS.features.defaultProps,
                    title: "Explore Topics",
                    description: "Deep dives into the subjects that shape our world.",
                    columns: 4,
                    iconStyle: "none",
                    features: [
                        { title: "Technology", description: "AI, blockchain, and the tools reshaping industries." },
                        { title: "Design", description: "Visual thinking, UX research, and creative processes." },
                        { title: "Culture", description: "How we live, work, and connect in the digital age." },
                        { title: "Business", description: "Strategy, leadership, and building companies that last." }
                    ],
                    animation: "fade"
                } 
            },
            { 
                id: generateId(), 
                type: "content", 
                props: { 
                    ...BLOCK_DEFINITIONS.content.defaultProps,
                    subtitle: "About",
                    title: "Independent thinking for curious minds",
                    description: "The Journal is an independent publication founded in 2020. We believe in slow journalism — taking the time to research, reflect, and write pieces that stand the test of time. No clickbait. No hot takes. Just thoughtful writing.",
                    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=2000&auto=format&fit=crop",
                    showButton: false,
                    listItems: ["50,000+ subscribers", "200+ published essays", "Featured in NYT, Wired, The Atlantic"],
                    align: "left",
                    animation: "slideUp"
                } 
            },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "What readers say", subtitle: "Reader Love", columns: 3, bg: "light", animation: "fade" } },
            { id: generateId(), type: "newsletter", props: { ...BLOCK_DEFINITIONS.newsletter.defaultProps, title: "Never miss an essay", description: "Join 50,000+ readers. One thoughtful essay delivered to your inbox every Thursday.", buttonText: "Subscribe Free", animation: "slideUp" } },
            { id: generateId(), type: "footer", props: { ...BLOCK_DEFINITIONS.footer.defaultProps, title: "THE JOURNAL", tagline: "Ideas worth thinking about.", showCopyright: true, columns: 3, sections: [{ heading: "Read", links: [{ label: "Latest", href: "#" }, { label: "Popular", href: "#" }, { label: "Archive", href: "#" }] }, { heading: "About", links: [{ label: "Our Mission", href: "#" }, { label: "Team", href: "#" }, { label: "Write for Us", href: "#" }] }, { heading: "Connect", links: [{ label: "Twitter", href: "#" }, { label: "Newsletter", href: "#" }, { label: "RSS Feed", href: "#" }] }] } },
        ],
    },

    // 16. Startup Launch - Bold & Energetic
    {
        id: "startup-launch",
        name: "Startup Launch",
        description: "Bold, energetic design for product launches and startup announcements with countdown and social proof.",
        thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "LAUNCHPAD", transparent: true } },
            { id: generateId(), type: "hero_split", props: { ...BLOCK_DEFINITIONS.hero_split.defaultProps, title: "The future of\nproductivity is here.", subtitle: "Join 10,000+ early adopters who are already transforming how they work.", badge: "Coming Soon", ctaText: "Get Early Access", animation: "slideUp" } },
            { id: generateId(), type: "countdown", props: { ...BLOCK_DEFINITIONS.countdown.defaultProps, title: "Launch Day Countdown", subtitle: "Mark Your Calendar", style: "gradient" } },
            { id: generateId(), type: "bento_grid", props: { ...BLOCK_DEFINITIONS.bento_grid.defaultProps, title: "Why you'll love it", subtitle: "Features" } },
            { id: generateId(), type: "testimonial_carousel", props: { ...BLOCK_DEFINITIONS.testimonial_carousel.defaultProps, title: "Beta tester feedback", subtitle: "Early Reviews" } },
            { id: generateId(), type: "comparison", props: { ...BLOCK_DEFINITIONS.comparison.defaultProps, title: "See the difference", leftTitle: "Old Way", rightTitle: "With Launchpad" } },
            { id: generateId(), type: "pricing_toggle", props: { ...BLOCK_DEFINITIONS.pricing_toggle.defaultProps } },
            { id: generateId(), type: "newsletter", props: { ...BLOCK_DEFINITIONS.newsletter.defaultProps, title: "Be first in line", description: "Get notified when we launch and receive exclusive early-bird pricing." } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 17. Consulting Firm - Professional & Trust
    {
        id: "consulting-firm",
        name: "Consulting Firm",
        description: "Professional, trust-building design for consulting firms, law offices, and professional services.",
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "STRATEX", sticky: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "Strategic Excellence.\nMeasurable Results.", subtitle: "We partner with Fortune 500 companies to solve their most complex challenges.", ctaText: "Schedule Consultation", backgroundImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop", showOverlay: true } },
            { id: generateId(), type: "logos", props: { ...BLOCK_DEFINITIONS.logos.defaultProps, title: "Trusted by industry leaders" } },
            { id: generateId(), type: "stats", props: { ...BLOCK_DEFINITIONS.stats.defaultProps, stats: [{ value: "500", suffix: "+", label: "Clients Served" }, { value: "98", suffix: "%", label: "Client Retention" }, { value: "25", suffix: "yr", label: "Experience" }, { value: "50", suffix: "M+", label: "Revenue Generated" }] } },
            { id: generateId(), type: "tabs", props: { ...BLOCK_DEFINITIONS.tabs.defaultProps, title: "Our Services", tabs: [{ label: "Strategy", content: "We help organizations define their vision and create actionable roadmaps for success." }, { label: "Operations", content: "Optimize your processes and systems for maximum efficiency and scalability." }, { label: "Digital", content: "Transform your business with cutting-edge technology and digital solutions." }] } },
            { id: generateId(), type: "team", props: { ...BLOCK_DEFINITIONS.team.defaultProps, title: "Leadership Team", subtitle: "Meet Our Partners" } },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Client Success Stories", columns: 2 } },
            { id: generateId(), type: "contact", props: { ...BLOCK_DEFINITIONS.contact.defaultProps, title: "Let's Talk Strategy" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 18. Fitness Studio - Energetic & Motivational
    {
        id: "fitness-studio",
        name: "Fitness Studio",
        description: "High-energy design for gyms, fitness studios, and wellness centers with bold typography.",
        thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "IRONFORGE", transparent: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "TRANSFORM\nYOUR BODY.", subtitle: "Elite training. Real results. Join the strongest community in the city.", ctaText: "Start Free Trial", backgroundImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop", showOverlay: true, overlayOpacity: 60 } },
            { id: generateId(), type: "features", props: { ...BLOCK_DEFINITIONS.features.defaultProps, title: "Why IRONFORGE?", columns: 4, features: [{ title: "Expert Trainers", description: "Certified professionals who push you to your limits." }, { title: "Premium Equipment", description: "State-of-the-art machines and free weights." }, { title: "Group Classes", description: "HIIT, yoga, spin, and more every day." }, { title: "24/7 Access", description: "Train on your schedule, any time." }] } },
            { id: generateId(), type: "pricing_toggle", props: { ...BLOCK_DEFINITIONS.pricing_toggle.defaultProps, title: "Membership Plans", plans: [{ name: "Basic", monthlyPrice: "$29", yearlyPrice: "$24", features: ["Gym access", "Locker room", "Free WiFi"] }, { name: "Pro", monthlyPrice: "$59", yearlyPrice: "$49", features: ["Everything in Basic", "Group classes", "Personal training session", "Nutrition guide"], isFeatured: true }, { name: "Elite", monthlyPrice: "$99", yearlyPrice: "$79", features: ["Everything in Pro", "Unlimited PT sessions", "Recovery suite", "VIP lounge"] }] } },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Our Facility", columns: 3 } },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Member Transformations", bg: "dark" } },
            { id: generateId(), type: "cta", props: { ...BLOCK_DEFINITIONS.cta.defaultProps, title: "Ready to get started?", subtitle: "Your first week is on us.", primaryText: "Claim Free Week" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 19. Restaurant & Cafe - Warm & Inviting
    {
        id: "restaurant-cafe",
        name: "Restaurant & Cafe",
        description: "Warm, inviting design for restaurants, cafes, and food businesses with menu showcase.",
        thumbnail: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "HARVEST", transparent: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "Farm to Table.\nSoul to Plate.", subtitle: "Seasonal ingredients, timeless recipes, unforgettable experiences.", ctaText: "Reserve a Table", backgroundImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000&auto=format&fit=crop", showOverlay: true } },
            { id: generateId(), type: "content", props: { ...BLOCK_DEFINITIONS.content.defaultProps, title: "Our Story", subtitle: "Since 2015", description: "What started as a small family kitchen has grown into the city's most beloved farm-to-table restaurant. Every dish tells a story of local farmers, sustainable practices, and culinary passion.", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2000&auto=format&fit=crop" } },
            { id: generateId(), type: "tabs", props: { ...BLOCK_DEFINITIONS.tabs.defaultProps, title: "Our Menu", subtitle: "Seasonal Selections", tabs: [{ label: "Starters", content: "Begin your journey with our signature appetizers, crafted from the freshest local ingredients." }, { label: "Mains", content: "Hearty, soulful dishes that celebrate the best of seasonal produce and ethically-sourced proteins." }, { label: "Desserts", content: "Sweet endings made in-house daily, featuring local honey, fruits, and artisan chocolates." }] } },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "A Taste of Harvest", columns: 4 } },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Guest Reviews", columns: 3 } },
            { id: generateId(), type: "map", props: { ...BLOCK_DEFINITIONS.map.defaultProps, title: "Find Us" } },
            { id: generateId(), type: "contact", props: { ...BLOCK_DEFINITIONS.contact.defaultProps, title: "Make a Reservation" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 20. Real Estate - Luxury & Sophisticated
    {
        id: "real-estate-luxury",
        name: "Luxury Real Estate",
        description: "Sophisticated design for real estate agencies and luxury property listings.",
        thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "PRESTIGE", sticky: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "Exceptional Properties.\nExtraordinary Living.", subtitle: "Curated luxury homes for discerning buyers.", ctaText: "View Listings", backgroundImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop", showOverlay: true } },
            { id: generateId(), type: "stats", props: { ...BLOCK_DEFINITIONS.stats.defaultProps, stats: [{ value: "2.5", suffix: "B+", label: "Properties Sold" }, { value: "500", suffix: "+", label: "Luxury Listings" }, { value: "15", suffix: "yr", label: "Market Leader" }, { value: "98", suffix: "%", label: "Client Satisfaction" }] } },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Featured Properties", subtitle: "Exclusive Listings", columns: 3 } },
            { id: generateId(), type: "features", props: { ...BLOCK_DEFINITIONS.features.defaultProps, title: "Why Choose Prestige?", columns: 3, features: [{ title: "Market Expertise", description: "Deep knowledge of luxury markets worldwide." }, { title: "Exclusive Access", description: "Off-market properties and private listings." }, { title: "White Glove Service", description: "Personalized attention from start to close." }] } },
            { id: generateId(), type: "team", props: { ...BLOCK_DEFINITIONS.team.defaultProps, title: "Our Agents", subtitle: "Expert Team" } },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Client Stories", columns: 2 } },
            { id: generateId(), type: "contact", props: { ...BLOCK_DEFINITIONS.contact.defaultProps, title: "Schedule a Private Viewing" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 21. Event & Conference - Dynamic & Engaging
    {
        id: "event-conference",
        name: "Event & Conference",
        description: "Dynamic design for conferences, summits, and events with countdown and speaker showcase.",
        thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "SUMMIT 2024", transparent: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "The Future of Tech.\nOne Stage.", subtitle: "Join 5,000+ innovators for 3 days of inspiration, learning, and connection.", ctaText: "Get Tickets", backgroundImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop", showOverlay: true } },
            { id: generateId(), type: "countdown", props: { ...BLOCK_DEFINITIONS.countdown.defaultProps, title: "Event Starts In", style: "cards" } },
            { id: generateId(), type: "stats", props: { ...BLOCK_DEFINITIONS.stats.defaultProps, stats: [{ value: "50", suffix: "+", label: "Speakers" }, { value: "100", suffix: "+", label: "Sessions" }, { value: "5000", suffix: "+", label: "Attendees" }, { value: "3", suffix: "", label: "Days" }] } },
            { id: generateId(), type: "team", props: { ...BLOCK_DEFINITIONS.team.defaultProps, title: "Featured Speakers", subtitle: "Industry Leaders" } },
            { id: generateId(), type: "timeline", props: { ...BLOCK_DEFINITIONS.timeline.defaultProps, title: "Event Schedule", subtitle: "Agenda", items: [{ year: "Day 1", title: "Opening Keynote", description: "Welcome address and vision for the future." }, { year: "Day 2", title: "Workshops & Panels", description: "Deep-dive sessions and expert discussions." }, { year: "Day 3", title: "Networking & Closing", description: "Connect with peers and closing ceremony." }] } },
            { id: generateId(), type: "pricing_toggle", props: { ...BLOCK_DEFINITIONS.pricing_toggle.defaultProps, title: "Ticket Options", plans: [{ name: "General", monthlyPrice: "$299", yearlyPrice: "$249", features: ["All sessions", "Lunch included", "Networking events"] }, { name: "VIP", monthlyPrice: "$599", yearlyPrice: "$499", features: ["Everything in General", "Front row seating", "Speaker meet & greet", "Exclusive lounge"], isFeatured: true }, { name: "Corporate", monthlyPrice: "$1999", yearlyPrice: "$1699", features: ["5 VIP passes", "Booth space", "Logo placement", "Speaking slot"] }] } },
            { id: generateId(), type: "accordion", props: { ...BLOCK_DEFINITIONS.accordion.defaultProps, title: "Frequently Asked Questions" } },
            { id: generateId(), type: "map", props: { ...BLOCK_DEFINITIONS.map.defaultProps, title: "Venue Location" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 22. Non-Profit & Charity - Compassionate & Impactful
    {
        id: "nonprofit-charity",
        name: "Non-Profit & Charity",
        description: "Compassionate design for non-profits, charities, and social impact organizations.",
        thumbnail: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "HOPE FOUNDATION", sticky: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "Together, We Can\nChange Lives.", subtitle: "Providing education, healthcare, and hope to communities in need.", ctaText: "Donate Now", backgroundImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2000&auto=format&fit=crop", showOverlay: true } },
            { id: generateId(), type: "stats", props: { ...BLOCK_DEFINITIONS.stats.defaultProps, stats: [{ value: "50K", suffix: "+", label: "Lives Impacted" }, { value: "25", suffix: "", label: "Countries" }, { value: "95", suffix: "%", label: "To Programs" }, { value: "10", suffix: "yr", label: "Of Service" }] } },
            { id: generateId(), type: "content", props: { ...BLOCK_DEFINITIONS.content.defaultProps, title: "Our Mission", subtitle: "Why We Exist", description: "We believe every child deserves access to education, healthcare, and opportunity. For over a decade, we've been working alongside communities to create lasting change." } },
            { id: generateId(), type: "features", props: { ...BLOCK_DEFINITIONS.features.defaultProps, title: "Our Programs", columns: 3, features: [{ title: "Education", description: "Building schools and training teachers." }, { title: "Healthcare", description: "Mobile clinics and medical supplies." }, { title: "Economic Empowerment", description: "Microloans and job training." }] } },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Impact Stories", columns: 3 } },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Voices of Hope", columns: 2 } },
            { id: generateId(), type: "cta", props: { ...BLOCK_DEFINITIONS.cta.defaultProps, title: "Make a Difference Today", subtitle: "Your donation directly funds our programs.", primaryText: "Donate Now", secondaryText: "Volunteer" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 23. Photography Portfolio - Visual & Artistic
    {
        id: "photography-portfolio",
        name: "Photography Portfolio",
        description: "Visual-first design for photographers and visual artists to showcase their work.",
        thumbnail: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "LENS & LIGHT", transparent: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "Capturing\nMoments.", subtitle: "Fine art photography for weddings, portraits, and commercial projects.", ctaText: "View Portfolio", backgroundImage: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2000&auto=format&fit=crop", showOverlay: true, overlayOpacity: 40 } },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Selected Works", subtitle: "Portfolio", columns: 3 } },
            { id: generateId(), type: "tabs", props: { ...BLOCK_DEFINITIONS.tabs.defaultProps, title: "Services", tabs: [{ label: "Weddings", content: "Timeless wedding photography that captures your love story." }, { label: "Portraits", content: "Professional headshots and personal portraits." }, { label: "Commercial", content: "Brand photography and product shoots." }] } },
            { id: generateId(), type: "content", props: { ...BLOCK_DEFINITIONS.content.defaultProps, title: "About Me", subtitle: "The Artist", description: "With over 15 years behind the lens, I've developed a signature style that blends documentary authenticity with fine art aesthetics.", image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=2000&auto=format&fit=crop" } },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Client Love", columns: 3 } },
            { id: generateId(), type: "contact", props: { ...BLOCK_DEFINITIONS.contact.defaultProps, title: "Let's Create Together" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 24. Online Course - Educational & Engaging
    {
        id: "online-course",
        name: "Online Course",
        description: "Engaging design for online courses, bootcamps, and educational programs.",
        thumbnail: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "MASTERCLASS", sticky: true } },
            { id: generateId(), type: "hero_split", props: { ...BLOCK_DEFINITIONS.hero_split.defaultProps, title: "Master Design\nin 8 Weeks.", subtitle: "A comprehensive bootcamp that takes you from beginner to job-ready designer.", badge: "Enrollment Open", ctaText: "Enroll Now", secondaryCtaText: "Watch Preview" } },
            { id: generateId(), type: "logos", props: { ...BLOCK_DEFINITIONS.logos.defaultProps, title: "Our graduates work at" } },
            { id: generateId(), type: "stats", props: { ...BLOCK_DEFINITIONS.stats.defaultProps, stats: [{ value: "5000", suffix: "+", label: "Graduates" }, { value: "94", suffix: "%", label: "Job Placement" }, { value: "4.9", suffix: "/5", label: "Rating" }, { value: "8", suffix: "wk", label: "Program" }] } },
            { id: generateId(), type: "timeline", props: { ...BLOCK_DEFINITIONS.timeline.defaultProps, title: "Curriculum", subtitle: "What You'll Learn", items: [{ year: "Week 1-2", title: "Design Fundamentals", description: "Color theory, typography, and layout principles." }, { year: "Week 3-4", title: "UI Design", description: "Components, design systems, and Figma mastery." }, { year: "Week 5-6", title: "UX Research", description: "User interviews, testing, and iteration." }, { year: "Week 7-8", title: "Portfolio & Career", description: "Build your portfolio and land your first job." }] } },
            { id: generateId(), type: "features", props: { ...BLOCK_DEFINITIONS.features.defaultProps, title: "What's Included", columns: 3, features: [{ title: "Live Sessions", description: "Weekly live classes with expert instructors." }, { title: "1:1 Mentorship", description: "Personal guidance from industry professionals." }, { title: "Career Support", description: "Resume reviews and interview prep." }] } },
            { id: generateId(), type: "team", props: { ...BLOCK_DEFINITIONS.team.defaultProps, title: "Your Instructors", subtitle: "Learn from the Best" } },
            { id: generateId(), type: "testimonial_carousel", props: { ...BLOCK_DEFINITIONS.testimonial_carousel.defaultProps, title: "Student Success Stories" } },
            { id: generateId(), type: "pricing_toggle", props: { ...BLOCK_DEFINITIONS.pricing_toggle.defaultProps, title: "Investment" } },
            { id: generateId(), type: "accordion", props: { ...BLOCK_DEFINITIONS.accordion.defaultProps, title: "Frequently Asked Questions" } },
            { id: generateId(), type: "cta", props: { ...BLOCK_DEFINITIONS.cta.defaultProps, title: "Ready to transform your career?", primaryText: "Enroll Now" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 25. Medical & Healthcare - Clean & Trustworthy
    {
        id: "medical-healthcare",
        name: "Medical & Healthcare",
        description: "Clean, trustworthy design for medical practices, clinics, and healthcare providers.",
        thumbnail: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "WELLNESS CLINIC", sticky: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "Your Health.\nOur Priority.", subtitle: "Comprehensive care from a team of board-certified physicians.", ctaText: "Book Appointment", backgroundImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop", showOverlay: true } },
            { id: generateId(), type: "features", props: { ...BLOCK_DEFINITIONS.features.defaultProps, title: "Our Services", columns: 4, features: [{ title: "Primary Care", description: "Comprehensive health management." }, { title: "Pediatrics", description: "Care for children of all ages." }, { title: "Dermatology", description: "Skin health and aesthetics." }, { title: "Mental Health", description: "Counseling and therapy." }] } },
            { id: generateId(), type: "team", props: { ...BLOCK_DEFINITIONS.team.defaultProps, title: "Our Physicians", subtitle: "Expert Care Team" } },
            { id: generateId(), type: "stats", props: { ...BLOCK_DEFINITIONS.stats.defaultProps, stats: [{ value: "25", suffix: "yr", label: "Experience" }, { value: "50K", suffix: "+", label: "Patients Served" }, { value: "15", suffix: "+", label: "Specialists" }, { value: "4.9", suffix: "/5", label: "Patient Rating" }] } },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Patient Stories", columns: 3 } },
            { id: generateId(), type: "accordion", props: { ...BLOCK_DEFINITIONS.accordion.defaultProps, title: "Insurance & Billing FAQ" } },
            { id: generateId(), type: "map", props: { ...BLOCK_DEFINITIONS.map.defaultProps, title: "Visit Us" } },
            { id: generateId(), type: "contact", props: { ...BLOCK_DEFINITIONS.contact.defaultProps, title: "Schedule Your Visit" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 26. App Landing - Modern & Sleek
    {
        id: "app-landing",
        name: "App Landing Page",
        description: "Modern, sleek design for mobile app launches with device mockups and feature highlights.",
        thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "FLOWAPP", transparent: true } },
            { id: generateId(), type: "hero_split", props: { ...BLOCK_DEFINITIONS.hero_split.defaultProps, title: "Your life,\norganized.", subtitle: "The all-in-one app for tasks, habits, and goals. Available on iOS and Android.", badge: "Free Download", ctaText: "Download App", secondaryCtaText: "Watch Demo", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2000&auto=format&fit=crop" } },
            { id: generateId(), type: "logos", props: { ...BLOCK_DEFINITIONS.logos.defaultProps, title: "Featured in" } },
            { id: generateId(), type: "bento_grid", props: { ...BLOCK_DEFINITIONS.bento_grid.defaultProps, title: "Powerful Features", subtitle: "Everything You Need" } },
            { id: generateId(), type: "stats", props: { ...BLOCK_DEFINITIONS.stats.defaultProps, stats: [{ value: "1M", suffix: "+", label: "Downloads" }, { value: "4.8", suffix: "/5", label: "App Store" }, { value: "50", suffix: "+", label: "Countries" }, { value: "99.9", suffix: "%", label: "Uptime" }] } },
            { id: generateId(), type: "tabs", props: { ...BLOCK_DEFINITIONS.tabs.defaultProps, title: "How It Works", tabs: [{ label: "Plan", content: "Create tasks and set goals with our intuitive interface." }, { label: "Track", content: "Monitor your progress with beautiful charts and insights." }, { label: "Achieve", content: "Celebrate wins and build lasting habits." }] } },
            { id: generateId(), type: "testimonial_carousel", props: { ...BLOCK_DEFINITIONS.testimonial_carousel.defaultProps, title: "What Users Say" } },
            { id: generateId(), type: "pricing_toggle", props: { ...BLOCK_DEFINITIONS.pricing_toggle.defaultProps, title: "Simple Pricing" } },
            { id: generateId(), type: "accordion", props: { ...BLOCK_DEFINITIONS.accordion.defaultProps, title: "FAQ" } },
            { id: generateId(), type: "cta", props: { ...BLOCK_DEFINITIONS.cta.defaultProps, title: "Start your journey today", primaryText: "Download Free" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 27. Law Firm - Authoritative & Professional
    {
        id: "law-firm",
        name: "Law Firm",
        description: "Authoritative, professional design for law firms and legal practices.",
        thumbnail: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "STERLING LAW", sticky: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "Justice.\nIntegrity.\nResults.", subtitle: "Experienced attorneys fighting for your rights since 1985.", ctaText: "Free Consultation", backgroundImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2000&auto=format&fit=crop", showOverlay: true } },
            { id: generateId(), type: "features", props: { ...BLOCK_DEFINITIONS.features.defaultProps, title: "Practice Areas", columns: 3, features: [{ title: "Corporate Law", description: "Business formation, contracts, and compliance." }, { title: "Litigation", description: "Civil and commercial dispute resolution." }, { title: "Real Estate", description: "Transactions, development, and disputes." }] } },
            { id: generateId(), type: "stats", props: { ...BLOCK_DEFINITIONS.stats.defaultProps, stats: [{ value: "500", suffix: "+", label: "Cases Won" }, { value: "40", suffix: "yr", label: "Experience" }, { value: "50", suffix: "M+", label: "Recovered" }, { value: "98", suffix: "%", label: "Success Rate" }] } },
            { id: generateId(), type: "team", props: { ...BLOCK_DEFINITIONS.team.defaultProps, title: "Our Attorneys", subtitle: "Legal Team" } },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Client Testimonials", columns: 2 } },
            { id: generateId(), type: "accordion", props: { ...BLOCK_DEFINITIONS.accordion.defaultProps, title: "Legal FAQ" } },
            { id: generateId(), type: "contact", props: { ...BLOCK_DEFINITIONS.contact.defaultProps, title: "Schedule a Consultation" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 28. Music Artist - Bold & Creative
    {
        id: "music-artist",
        name: "Music Artist",
        description: "Bold, creative design for musicians, bands, and music artists.",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "NOVA", transparent: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "NEW ALBUM\nOUT NOW.", subtitle: "Stream 'Midnight Dreams' on all platforms.", ctaText: "Listen Now", backgroundImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2000&auto=format&fit=crop", showOverlay: true, overlayOpacity: 70 } },
            { id: generateId(), type: "video", props: { ...BLOCK_DEFINITIONS.video.defaultProps, title: "Latest Music Video" } },
            { id: generateId(), type: "countdown", props: { ...BLOCK_DEFINITIONS.countdown.defaultProps, title: "World Tour Starts In", subtitle: "Get Ready" } },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Tour Photos", columns: 4 } },
            { id: generateId(), type: "timeline", props: { ...BLOCK_DEFINITIONS.timeline.defaultProps, title: "Tour Dates", subtitle: "Upcoming Shows", items: [{ year: "Mar 15", title: "Los Angeles, CA", description: "The Forum" }, { year: "Mar 22", title: "New York, NY", description: "Madison Square Garden" }, { year: "Apr 5", title: "London, UK", description: "O2 Arena" }] } },
            { id: generateId(), type: "newsletter", props: { ...BLOCK_DEFINITIONS.newsletter.defaultProps, title: "Join the Fan Club", description: "Get exclusive content, early ticket access, and more." } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 29. Travel & Tourism - Adventurous & Inspiring
    {
        id: "travel-tourism",
        name: "Travel & Tourism",
        description: "Adventurous, inspiring design for travel agencies and tourism businesses.",
        thumbnail: "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "WANDERLUST", transparent: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "Discover Your\nNext Adventure.", subtitle: "Curated travel experiences to the world's most extraordinary destinations.", ctaText: "Explore Trips", backgroundImage: "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2000&auto=format&fit=crop", showOverlay: true } },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Featured Destinations", subtitle: "Popular Trips", columns: 3 } },
            { id: generateId(), type: "tabs", props: { ...BLOCK_DEFINITIONS.tabs.defaultProps, title: "Trip Types", tabs: [{ label: "Adventure", content: "Hiking, diving, and adrenaline-pumping experiences." }, { label: "Cultural", content: "Immerse yourself in local traditions and history." }, { label: "Luxury", content: "Five-star resorts and exclusive experiences." }] } },
            { id: generateId(), type: "stats", props: { ...BLOCK_DEFINITIONS.stats.defaultProps, stats: [{ value: "100", suffix: "+", label: "Destinations" }, { value: "50K", suffix: "+", label: "Happy Travelers" }, { value: "15", suffix: "yr", label: "Experience" }, { value: "4.9", suffix: "/5", label: "Rating" }] } },
            { id: generateId(), type: "testimonial_carousel", props: { ...BLOCK_DEFINITIONS.testimonial_carousel.defaultProps, title: "Traveler Stories" } },
            { id: generateId(), type: "accordion", props: { ...BLOCK_DEFINITIONS.accordion.defaultProps, title: "Travel FAQ" } },
            { id: generateId(), type: "contact", props: { ...BLOCK_DEFINITIONS.contact.defaultProps, title: "Plan Your Trip" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 30. Podcast - Audio-First & Engaging
    {
        id: "podcast-show",
        name: "Podcast Show",
        description: "Audio-first design for podcasts and audio content creators.",
        thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "THE DEEP DIVE", transparent: true } },
            { id: generateId(), type: "hero_split", props: { ...BLOCK_DEFINITIONS.hero_split.defaultProps, title: "Conversations\nthat matter.", subtitle: "Weekly interviews with founders, creators, and thinkers shaping the future.", badge: "New Episode Every Tuesday", ctaText: "Listen Now", secondaryCtaText: "Subscribe" } },
            { id: generateId(), type: "logos", props: { ...BLOCK_DEFINITIONS.logos.defaultProps, title: "Available on" } },
            { id: generateId(), type: "stats", props: { ...BLOCK_DEFINITIONS.stats.defaultProps, stats: [{ value: "200", suffix: "+", label: "Episodes" }, { value: "1M", suffix: "+", label: "Downloads" }, { value: "4.9", suffix: "/5", label: "Apple Podcasts" }, { value: "50", suffix: "+", label: "Countries" }] } },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Recent Episodes", columns: 3 } },
            { id: generateId(), type: "content", props: { ...BLOCK_DEFINITIONS.content.defaultProps, title: "About the Host", subtitle: "Meet Your Host", description: "I'm a curious mind who loves asking the questions everyone's thinking but no one's asking. Each week, I sit down with fascinating people to explore ideas that challenge conventional thinking." } },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Listener Reviews", columns: 3 } },
            { id: generateId(), type: "newsletter", props: { ...BLOCK_DEFINITIONS.newsletter.defaultProps, title: "Never Miss an Episode", description: "Get show notes, bonus content, and behind-the-scenes insights." } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 31. Wedding & Events - Elegant & Romantic
    {
        id: "wedding-events",
        name: "Wedding & Events",
        description: "Elegant, romantic design for wedding planners and event coordinators.",
        thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "EVER AFTER", transparent: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "Your Perfect Day,\nPerfectly Planned.", subtitle: "Luxury wedding planning and event design for discerning couples.", ctaText: "Start Planning", backgroundImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop", showOverlay: true, overlayOpacity: 40 } },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Our Portfolio", subtitle: "Recent Celebrations", columns: 3 } },
            { id: generateId(), type: "features", props: { ...BLOCK_DEFINITIONS.features.defaultProps, title: "Our Services", columns: 3, features: [{ title: "Full Planning", description: "From engagement to honeymoon, we handle everything." }, { title: "Day-Of Coordination", description: "Seamless execution of your vision." }, { title: "Design & Styling", description: "Creating breathtaking visual experiences." }] } },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Love Stories", columns: 2 } },
            { id: generateId(), type: "team", props: { ...BLOCK_DEFINITIONS.team.defaultProps, title: "Meet Our Team", subtitle: "Your Planning Partners" } },
            { id: generateId(), type: "contact", props: { ...BLOCK_DEFINITIONS.contact.defaultProps, title: "Let's Create Magic" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 32. Crypto & Web3 - Futuristic & Bold
    {
        id: "crypto-web3",
        name: "Crypto & Web3",
        description: "Futuristic, bold design for crypto projects, DAOs, and Web3 startups.",
        thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "NEXUS", transparent: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "The Future of\nDecentralized Finance.", subtitle: "Join 100,000+ users building wealth in the new economy.", ctaText: "Launch App", backgroundImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000&auto=format&fit=crop", showOverlay: true, backgroundPattern: "grid" } },
            { id: generateId(), type: "stats", props: { ...BLOCK_DEFINITIONS.stats.defaultProps, stats: [{ value: "2.5", suffix: "B+", label: "TVL" }, { value: "100K", suffix: "+", label: "Users" }, { value: "50", suffix: "+", label: "Chains" }, { value: "0", suffix: "", label: "Hacks" }] } },
            { id: generateId(), type: "bento_grid", props: { ...BLOCK_DEFINITIONS.bento_grid.defaultProps, title: "Protocol Features", subtitle: "Why Nexus" } },
            { id: generateId(), type: "comparison", props: { ...BLOCK_DEFINITIONS.comparison.defaultProps, title: "Nexus vs Traditional DeFi", leftTitle: "Others", rightTitle: "Nexus" } },
            { id: generateId(), type: "timeline", props: { ...BLOCK_DEFINITIONS.timeline.defaultProps, title: "Roadmap", subtitle: "Our Journey", items: [{ year: "Q1 2024", title: "Mainnet Launch", description: "Protocol goes live on Ethereum." }, { year: "Q2 2024", title: "Multi-chain", description: "Expand to Arbitrum, Optimism, Base." }, { year: "Q3 2024", title: "Governance", description: "Launch DAO and token." }] } },
            { id: generateId(), type: "accordion", props: { ...BLOCK_DEFINITIONS.accordion.defaultProps, title: "FAQ" } },
            { id: generateId(), type: "newsletter", props: { ...BLOCK_DEFINITIONS.newsletter.defaultProps, title: "Stay Updated", description: "Get the latest protocol updates and announcements." } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 33. Interior Design - Sophisticated & Visual
    {
        id: "interior-design",
        name: "Interior Design",
        description: "Sophisticated, visual design for interior designers and architects.",
        thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "ATELIER", transparent: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "Spaces That\nInspire.", subtitle: "Award-winning interior design for residential and commercial projects.", ctaText: "View Projects", backgroundImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop", showOverlay: true, overlayOpacity: 30 } },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Featured Projects", columns: 3 } },
            { id: generateId(), type: "tabs", props: { ...BLOCK_DEFINITIONS.tabs.defaultProps, title: "Our Services", tabs: [{ label: "Residential", content: "Transform your home into a sanctuary of style and comfort." }, { label: "Commercial", content: "Create inspiring workspaces that boost productivity." }, { label: "Hospitality", content: "Design memorable experiences for hotels and restaurants." }] } },
            { id: generateId(), type: "content", props: { ...BLOCK_DEFINITIONS.content.defaultProps, title: "Our Philosophy", subtitle: "Design Approach", description: "We believe great design is invisible. It's felt, not seen. Every space we create tells a story—your story—through thoughtful material selection, lighting, and spatial flow." } },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Client Testimonials", columns: 2 } },
            { id: generateId(), type: "contact", props: { ...BLOCK_DEFINITIONS.contact.defaultProps, title: "Start Your Project" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 34. Pet Services - Friendly & Playful
    {
        id: "pet-services",
        name: "Pet Services",
        description: "Friendly, playful design for pet care businesses, vets, and groomers.",
        thumbnail: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "PAWSOME", sticky: true } },
            { id: generateId(), type: "hero", props: { ...BLOCK_DEFINITIONS.hero.defaultProps, title: "Happy Pets,\nHappy Life.", subtitle: "Premium pet care services your furry friends will love.", ctaText: "Book Now", backgroundImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=2000&auto=format&fit=crop", showOverlay: true } },
            { id: generateId(), type: "features", props: { ...BLOCK_DEFINITIONS.features.defaultProps, title: "Our Services", columns: 4, features: [{ title: "Grooming", description: "Full spa treatments for your pet." }, { title: "Boarding", description: "Comfortable overnight stays." }, { title: "Daycare", description: "Supervised play and socialization." }, { title: "Training", description: "Positive reinforcement methods." }] } },
            { id: generateId(), type: "gallery", props: { ...BLOCK_DEFINITIONS.gallery.defaultProps, title: "Our Happy Clients", columns: 4 } },
            { id: generateId(), type: "pricing_toggle", props: { ...BLOCK_DEFINITIONS.pricing_toggle.defaultProps, title: "Pricing" } },
            { id: generateId(), type: "testimonials", props: { ...BLOCK_DEFINITIONS.testimonials.defaultProps, title: "Pet Parent Reviews", columns: 3 } },
            { id: generateId(), type: "map", props: { ...BLOCK_DEFINITIONS.map.defaultProps, title: "Find Us" } },
            { id: generateId(), type: "contact", props: { ...BLOCK_DEFINITIONS.contact.defaultProps, title: "Book an Appointment" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },

    // 35. Coaching & Mentorship - Personal & Inspiring
    {
        id: "coaching-mentorship",
        name: "Coaching & Mentorship",
        description: "Personal, inspiring design for life coaches, business mentors, and consultants.",
        thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",
        blocks: [
            { id: generateId(), type: "navigation", props: { ...BLOCK_DEFINITIONS.navigation.defaultProps, logoText: "ELEVATE", sticky: true } },
            { id: generateId(), type: "hero_split", props: { ...BLOCK_DEFINITIONS.hero_split.defaultProps, title: "Unlock Your\nFull Potential.", subtitle: "Executive coaching for leaders who want to make a bigger impact.", badge: "Limited Spots", ctaText: "Book Discovery Call", secondaryCtaText: "Learn More" } },
            { id: generateId(), type: "content", props: { ...BLOCK_DEFINITIONS.content.defaultProps, title: "About Me", subtitle: "Your Coach", description: "With 20 years of experience leading Fortune 500 teams, I help executives break through plateaus and achieve extraordinary results." } },
            { id: generateId(), type: "stats", props: { ...BLOCK_DEFINITIONS.stats.defaultProps, stats: [{ value: "500", suffix: "+", label: "Clients Coached" }, { value: "95", suffix: "%", label: "Goal Achievement" }, { value: "20", suffix: "yr", label: "Experience" }, { value: "4.9", suffix: "/5", label: "Rating" }] } },
            { id: generateId(), type: "tabs", props: { ...BLOCK_DEFINITIONS.tabs.defaultProps, title: "Programs", tabs: [{ label: "1:1 Coaching", content: "Personalized coaching tailored to your specific goals and challenges." }, { label: "Group Programs", content: "Learn alongside peers in our intensive group coaching programs." }, { label: "Workshops", content: "Half-day and full-day workshops for teams and organizations." }] } },
            { id: generateId(), type: "testimonial_carousel", props: { ...BLOCK_DEFINITIONS.testimonial_carousel.defaultProps, title: "Client Transformations" } },
            { id: generateId(), type: "accordion", props: { ...BLOCK_DEFINITIONS.accordion.defaultProps, title: "Frequently Asked Questions" } },
            { id: generateId(), type: "cta", props: { ...BLOCK_DEFINITIONS.cta.defaultProps, title: "Ready to transform?", primaryText: "Book Free Call" } },
            { id: generateId(), type: "footer", props: BLOCK_DEFINITIONS.footer.defaultProps },
        ],
    },
]

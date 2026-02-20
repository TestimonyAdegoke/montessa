import { HeroBlock, heroBlockSchema } from "./blocks/hero-block"
import { FeaturesBlock, featuresBlockSchema } from "./blocks/features-block"
import { ContentBlock, contentBlockSchema } from "./blocks/content-block"
import { TestimonialsBlock, testimonialsBlockSchema } from "./blocks/testimonials-block"
import { FAQBlock, faqBlockSchema } from "./blocks/faq-block"
import { CtaBlock, ctaBlockSchema } from "./blocks/cta-block"
import { GalleryBlock, galleryBlockSchema } from "./blocks/gallery-block"
import { NavigationBlock, navigationBlockSchema } from "./blocks/navigation-block"
import { FooterBlock, footerBlockSchema } from "./blocks/footer-block"
import { VideoBlock, videoBlockSchema } from "./blocks/video-block"
import { PricingBlock, pricingBlockSchema } from "./blocks/pricing-block"
import { TeamBlock, teamBlockSchema } from "./blocks/team-block"
import { LogoCloudBlock, logoCloudBlockSchema } from "./blocks/logo-cloud-block"
import { StatsBlock, statsBlockSchema } from "./blocks/stats-block"
import { NewsletterBlock, newsletterBlockSchema } from "./blocks/newsletter-block"
import { ContactBlock, contactBlockSchema } from "./blocks/contact-block"
import { MapBlock, mapBlockSchema } from "./blocks/map-block"
import { HeroSplitBlock, heroSplitBlockSchema } from "./blocks/hero-split-block"
import { BentoGridBlock, bentoGridBlockSchema } from "./blocks/bento-grid-block"
import { TestimonialCarouselBlock, testimonialCarouselBlockSchema } from "./blocks/testimonial-carousel-block"
import { PricingToggleBlock, pricingToggleBlockSchema } from "./blocks/pricing-toggle-block"
import { AccordionBlock, accordionBlockSchema } from "./blocks/accordion-block"
import { TabsBlock, tabsBlockSchema } from "./blocks/tabs-block"
import { CountdownBlock, countdownBlockSchema } from "./blocks/countdown-block"
import { TimelineBlock, timelineBlockSchema } from "./blocks/timeline-block"
import { ComparisonBlock, comparisonBlockSchema } from "./blocks/comparison-block"
import { CMSBlock, cmsBlockSchema } from "./blocks/cms-block"
import { Block, BlockDefinition } from "./types"
import { 
    Sparkles, LayoutGrid, PanelTop, Quote, CircleHelp, Zap, GalleryHorizontalEnd, 
    PanelTopDashed, Rows4, Play, BadgeDollarSign, UsersRound, Award, 
    MailPlus, MapPinned, FileImage, BarChart3, Newspaper, Phone,
    SplitSquareHorizontal, Grid3x3, MessageCircleHeart, ToggleRight,
    ListCollapse, Layers, Timer, GitBranch, Scale, Database
} from "lucide-react"

export const BLOCK_DEFINITIONS: Record<string, BlockDefinition> = {
    hero: {
        type: "hero",
        label: "Hero Section",
        icon: Sparkles,
        component: HeroBlock,
        defaultProps: {
            title: "Welcome to Our School",
            subtitle: "Empowering the next generation of leaders through excellence in education.",
            ctaText: "Apply Now",
            ctaLink: "/apply",
            align: "center",
            showOverlay: true,
            backgroundImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
        },
        propSchema: heroBlockSchema,
    },
    hero_alt: {
        type: "hero_alt",
        label: "Hero (Split Emphasis)",
        icon: PanelTop,
        component: HeroBlock,
        defaultProps: {
            title: "Shaping Futures Today",
            subtitle: "A modern layout with left-aligned focus and lighter imagery.",
            ctaText: "Discover Programs",
            ctaLink: "/programs",
            align: "left",
            showOverlay: false,
            backgroundImage: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=2070&auto=format&fit=crop",
        },
        propSchema: heroBlockSchema,
    },
    cta: {
        type: "cta",
        label: "Call To Action",
        icon: Zap,
        component: CtaBlock,
        defaultProps: {
            title: "Ready to begin?",
            subtitle: "Start your journey with a modern school platform tailored to your needs.",
            primaryText: "Book a demo",
            primaryHref: "#",
            secondaryText: "Talk to sales",
            secondaryHref: "#",
            align: "center",
            variant: "soft",
        },
        propSchema: ctaBlockSchema,
    },
    gallery: {
        type: "gallery",
        label: "Image Gallery",
        icon: GalleryHorizontalEnd,
        component: GalleryBlock,
        defaultProps: {
            title: "Campus Life",
            subtitle: "A glimpse into our everyday learning environment.",
            columns: 3,
            images: [
                {
                    src: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=2070&auto=format&fit=crop",
                    label: "Classrooms",
                    alt: "Students collaborating in a modern classroom.",
                },
                {
                    src: "https://images.unsplash.com/photo-1523580846011-3e7e0c5a5d7f?q=80&w=2070&auto=format&fit=crop",
                    label: "Library",
                    alt: "Student reading in a bright library.",
                },
                {
                    src: "https://images.unsplash.com/photo-1508087627329-54fede5ed07e?q=80&w=2070&auto=format&fit=crop",
                    label: "Sports",
                    alt: "Students playing sports on a field.",
                },
            ],
        },
        propSchema: galleryBlockSchema,
    },
    navigation: {
        type: "navigation",
        label: "Navigation Bar",
        icon: PanelTopDashed,
        component: NavigationBlock,
        defaultProps: {
            logoText: "My School",
            align: "right",
            sticky: true,
            transparent: true,
            menuItems: [
                { label: "Programs", href: "#programs" },
                { label: "Admissions", href: "#admissions" },
                { label: "About", href: "#about" },
                { label: "Contact", href: "#contact" },
            ],
            animation: "fade"
        },
        propSchema: navigationBlockSchema,
    },
    footer: {
        type: "footer",
        label: "Footer",
        icon: Rows4,
        component: FooterBlock,
        defaultProps: {
            title: "My School",
            tagline: "Excellence in education and character.",
            columns: 3,
            sections: [
                {
                    heading: "School",
                    links: [
                        { label: "About", href: "#about" },
                        { label: "Leadership", href: "#leadership" },
                    ],
                },
                {
                    heading: "Admissions",
                    links: [
                        { label: "How to Apply", href: "#admissions" },
                        { label: "Tuition & Fees", href: "#fees" },
                    ],
                },
                {
                    heading: "Contact",
                    links: [
                        { label: "Contact Us", href: "#contact" },
                        { label: "Visit Campus", href: "#visit" },
                    ],
                },
            ],
            showCopyright: true,
            animation: "fade"
        },
        propSchema: footerBlockSchema,
    },
    content: {
        type: "content",
        label: "Content Section",
        icon: FileImage,
        component: ContentBlock,
        defaultProps: {
            subtitle: "Our Mission",
            title: "Built for Your Success",
            description: "We provide a comprehensive learning management system that streamlines administration and enhances the educational experience for students, teachers, and parents alike.",
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
            align: "left",
            showButton: true,
            buttonText: "Learn More",
            buttonLink: "/about",
            listItems: [
                "Interactive virtual classrooms",
                "Automated attendance tracking",
                "Parent-teacher communication portal",
                "Digital assignment management"
            ]
        },
        propSchema: contentBlockSchema
    },
    content_alt: {
        type: "content_alt",
        label: "Content (Right Image)",
        icon: FileImage,
        component: ContentBlock,
        defaultProps: {
            subtitle: "Designed Around Learners",
            title: "Flexible Learning Spaces",
            description: "Modern classrooms, collaborative hubs, and labs designed to encourage curiosity and deep work.",
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
            showButton: true,
            buttonText: "Explore Campus",
            buttonLink: "/campus",
            listItems: [
                "Light-filled studios and classrooms",
                "Technology-enabled learning spaces",
                "Flexible seating for group work",
            ],
            align: "right",
        },
        propSchema: contentBlockSchema,
    },
    features: {
        type: "features",
        label: "Features Grid",
        icon: LayoutGrid,
        component: FeaturesBlock,
        defaultProps: {
            title: "Why Choose Us",
            description: "We provide a nurturing environment for holistic growth.",
            columns: 3,
            iconStyle: "circle",
            features: [
                { title: "Expert Teachers", description: "Qualified professionals dedicated to student success." },
                { title: "Modern Labs", description: "State-of-the-art facilities for practical learning." },
                { title: "Sports Complex", description: "Comprehensive athletic programs and facilities." }
            ]
        },
        propSchema: featuresBlockSchema
    },
    features_alt: {
        type: "features_alt",
        label: "Feature List",
        icon: LayoutGrid,
        component: FeaturesBlock,
        defaultProps: {
            title: "What Sets Us Apart",
            description: "A compact list-style layout that works well for program highlights.",
            columns: 2,
            iconStyle: "none",
            features: [
                { title: "Small Class Sizes", description: "More individual support and mentorship for every learner." },
                { title: "Modern Curriculum", description: "Blending core academics with real-world projects." },
                { title: "Global Perspective", description: "Culturally responsive teaching and diverse communities." },
                { title: "Holistic Support", description: "Counseling, clubs, and enrichment to support the whole child." },
            ],
        },
        propSchema: featuresBlockSchema,
    },
    testimonials: {
        type: "testimonials",
        label: "Testimonials",
        icon: Quote,
        component: TestimonialsBlock,
        defaultProps: {
            subtitle: "What They Say",
            title: "Trusted by Parents & Students",
            columns: 3,
            bg: "light",
            testimonials: [
                {
                    name: "Sarah Jenkins",
                    role: "Parent",
                    quote: "The personalized attention my daughter receives here is unparalleled. She has grown so much in just one year.",
                    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
                },
                {
                    name: "David Chen",
                    role: "Alumnus",
                    quote: "The foundation I built during my time at this school was instrumental in my success at university.",
                    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
                },
                {
                    name: "Emily Rodriguez",
                    role: "Parent",
                    quote: "A truly modern approach to education. The communication between teachers and parents is fantastic.",
                    avatar: "https://randomuser.me/api/portraits/women/45.jpg"
                }
            ]
        },
        propSchema: testimonialsBlockSchema
    },
    testimonials_alt: {
        type: "testimonials_alt",
        label: "Testimonials (Dark)",
        icon: Quote,
        component: TestimonialsBlock,
        defaultProps: {
            subtitle: "Stories From Our Community",
            title: "Parents & Students Speak",
            columns: 2,
            bg: "dark",
        },
        propSchema: testimonialsBlockSchema,
    },
    faq: {
        type: "faq",
        label: "FAQ",
        icon: CircleHelp,
        component: FAQBlock,
        defaultProps: {
            title: "Frequently Asked Questions",
            subtitle: "Find Answers",
            align: "center",
            items: [
                { question: "How do I apply for admission?", answer: "You can apply directly through our online portal by clicking the 'Apply Now' button in the header." },
                { question: "What is the teacher-to-student ratio?", answer: "We maintain a strict 1:15 ratio to ensure every student receives personalized attention." },
                { question: "Are there extracurricular activities?", answer: "Yes, we offer over 20 clubs and sports programs ranging from robotics to basketball." }
            ]
        },
        propSchema: faqBlockSchema
    },
    faq_alt: {
        type: "faq_alt",
        label: "FAQ (Compact)",
        icon: CircleHelp,
        component: FAQBlock,
        defaultProps: {
            title: "Questions, Answered",
            subtitle: "Quick answers to common topics.",
            align: "left",
        },
        propSchema: faqBlockSchema,
    },
    video: {
        type: "video",
        label: "Video Player",
        icon: Play,
        component: VideoBlock,
        defaultProps: {
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            title: "School Introduction",
            aspectRatio: "16/9",
            controls: true,
            muted: false,
            loop: false,
            autoPlay: false
        },
        propSchema: videoBlockSchema,
    },
    pricing: {
        type: "pricing",
        label: "Pricing Table",
        icon: BadgeDollarSign,
        component: PricingBlock,
        defaultProps: {
            title: "Investment in Excellence",
            subtitle: "Tuition & Fees",
            plans: [
                { name: "Termly", price: "$1,200", buttonText: "Get Started", isFeatured: false, features: ["Standard Curriculum", "Basic Clubs", "Library Access"] },
                { name: "Yearly", price: "$3,200", buttonText: "Get Started", isFeatured: true, features: ["Full Curriculum", "All Clubs & Sports", "Premium Portal", "Field Trips Included"] },
                { name: "Scholarship", price: "Varies", buttonText: "Apply Now", isFeatured: false, features: ["Financial Aid", "Merit-based", "Special Programs"] }
            ],
            animation: "slideUp"
        },
        propSchema: pricingBlockSchema,
    },
    team: {
        type: "team",
        label: "Team Section",
        icon: UsersRound,
        component: TeamBlock,
        defaultProps: {
            title: "Our World-Class Educators",
            subtitle: "Meet Our Team",
            members: [
                { name: "Dr. Sarah Jenkins", role: "Principal", bio: "20+ years in international education leadership.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop" },
                { name: "Prof. Michael Chen", role: "Head of Science", bio: "Leading our STEM innovation initiatives.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop" },
                { name: "Elena Rodriguez", role: "Arts Director", bio: "Award-winning curator and educator.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop" }
            ],
            animation: "fade"
        },
        propSchema: teamBlockSchema,
    },
    logos: {
        type: "logos",
        label: "Logo Cloud",
        icon: Award,
        component: LogoCloudBlock,
        defaultProps: {
            title: "Our Global Accreditation Partners",
            logos: [
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/IB_Logo.svg/1200px-IB_Logo.svg.png", alt: "IB World School" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Cambridge_Assessment_International_Education_Logo.svg/1200px-Cambridge_Assessment_International_Education_Logo.svg.png", alt: "Cambridge" },
                { src: "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/CIS_logo.svg/1200px-CIS_logo.svg.png", alt: "CIS" }
            ],
            animation: "fade"
        },
        propSchema: logoCloudBlockSchema,
    },
    stats: {
        type: "stats",
        label: "Stats Counter",
        icon: BarChart3,
        component: StatsBlock,
        defaultProps: {
            stats: [
                { value: "50", suffix: "+", label: "Expert Teachers" },
                { value: "1200", suffix: "+", label: "Happy Students" },
                { value: "15", suffix: "yr", label: "Excellence" },
                { value: "100", suffix: "%", label: "University Placement" }
            ],
            animation: "slideUp",
            columns: 4
        },
        propSchema: statsBlockSchema,
    },
    newsletter: {
        type: "newsletter",
        label: "Newsletter",
        icon: Newspaper,
        component: NewsletterBlock,
        defaultProps: {
            title: "Stay in the Loop",
            description: "Join our community to receive the latest updates, news, and insights directly in your inbox.",
            placeholder: "Enter your email address",
            buttonText: "Join Now",
            animation: "fade"
        },
        propSchema: newsletterBlockSchema,
    },
    contact: {
        type: "contact",
        label: "Contact Section",
        icon: Phone,
        component: ContactBlock,
        defaultProps: {
            title: "Get in Touch",
            subtitle: "Contact Us",
            description: "Have questions about our curriculum or admissions? Our team is here to help you every step of the way.",
            email: "admissions@school.edu",
            phone: "+1 (555) 000-0000",
            address: "123 Academic Way, Education City",
            submitText: "Send Message",
            animation: "slideUp"
        },
        propSchema: contactBlockSchema,
    },
    map: {
        type: "map",
        label: "Interactive Map",
        icon: MapPinned,
        component: MapBlock,
        defaultProps: {
            title: "Locate Our Campus",
            subtitle: "Find Us",
            address: "123 Academic Way, Education City",
            zoom: 15,
            animation: "fade"
        },
        propSchema: mapBlockSchema,
    },
    hero_split: {
        type: "hero_split",
        label: "Hero (Split Layout)",
        icon: SplitSquareHorizontal,
        component: HeroSplitBlock,
        defaultProps: {
            title: "Build something\npeople love.",
            subtitle: "A modern platform that helps you create, launch, and grow your digital presence with confidence.",
            badge: "Now in Beta",
            ctaText: "Get Started Free",
            ctaLink: "#",
            secondaryCtaText: "Watch Demo",
            secondaryCtaLink: "#",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop",
            imagePosition: "right",
            backgroundPattern: "dots",
            animation: "slideUp"
        },
        propSchema: heroSplitBlockSchema,
    },
    bento_grid: {
        type: "bento_grid",
        label: "Bento Grid",
        icon: Grid3x3,
        component: BentoGridBlock,
        defaultProps: {
            title: "Everything you need",
            subtitle: "Features",
            items: [
                { title: "Lightning Fast", description: "Built on edge infrastructure for sub-100ms response times globally.", span: "2x1", accent: "blue" },
                { title: "Secure by Default", description: "Enterprise-grade security with SOC 2 compliance and E2E encryption.", span: "1x1", accent: "green" },
                { title: "AI-Powered", description: "Smart automation that learns from your workflow and suggests improvements.", span: "1x1", accent: "purple" },
                { title: "Beautiful Analytics", description: "Real-time dashboards with actionable insights and custom reports.", span: "1x2", accent: "orange" },
                { title: "Team Collaboration", description: "Real-time editing, comments, and version control for your entire team.", span: "1x1", accent: "pink" },
                { title: "API First", description: "Comprehensive REST and GraphQL APIs with webhooks and SDKs.", span: "1x1", accent: "primary" }
            ],
            animation: "slideUp"
        },
        propSchema: bentoGridBlockSchema,
    },
    testimonial_carousel: {
        type: "testimonial_carousel",
        label: "Testimonial Carousel",
        icon: MessageCircleHeart,
        component: TestimonialCarouselBlock,
        defaultProps: {
            title: "Loved by thousands",
            subtitle: "Testimonials",
            variant: "cards",
            showStars: true,
            testimonials: [
                { name: "Sarah Chen", role: "CEO", company: "TechFlow", quote: "This platform completely transformed how our team works. We shipped 3x faster in the first month.", avatar: "https://randomuser.me/api/portraits/women/44.jpg", rating: 5 },
                { name: "Marcus Johnson", role: "CTO", company: "ScaleUp", quote: "The best developer experience I've ever had. The API is intuitive and the docs are incredible.", avatar: "https://randomuser.me/api/portraits/men/32.jpg", rating: 5 },
                { name: "Elena Rodriguez", role: "Head of Design", company: "PixelCraft", quote: "Finally a tool that designers and developers can both love. The collaboration features are game-changing.", avatar: "https://randomuser.me/api/portraits/women/68.jpg", rating: 5 },
                { name: "David Kim", role: "Founder", company: "LaunchPad", quote: "We went from idea to production in 2 weeks. The templates and components saved us months of work.", avatar: "https://randomuser.me/api/portraits/men/75.jpg", rating: 5 }
            ],
            animation: "fade"
        },
        propSchema: testimonialCarouselBlockSchema,
    },
    pricing_toggle: {
        type: "pricing_toggle",
        label: "Pricing (Toggle)",
        icon: ToggleRight,
        component: PricingToggleBlock,
        defaultProps: {
            title: "Simple, transparent pricing",
            subtitle: "Pricing",
            showToggle: true,
            monthlyLabel: "Monthly",
            yearlyLabel: "Yearly",
            yearlyDiscount: "Save 20%",
            plans: [
                { name: "Starter", monthlyPrice: "$19", yearlyPrice: "$15", description: "Perfect for individuals and small projects.", buttonText: "Start Free", isFeatured: false, features: ["Up to 3 projects", "Basic analytics", "Email support", "1GB storage"] },
                { name: "Pro", monthlyPrice: "$49", yearlyPrice: "$39", description: "For growing teams that need more power.", buttonText: "Start Free Trial", isFeatured: true, features: ["Unlimited projects", "Advanced analytics", "Priority support", "50GB storage", "Custom domains", "Team collaboration"] },
                { name: "Enterprise", monthlyPrice: "Custom", yearlyPrice: "Custom", description: "For large organizations with custom needs.", buttonText: "Contact Sales", isFeatured: false, features: ["Everything in Pro", "SSO & SAML", "Dedicated CSM", "Custom SLA", "On-premise option", "Audit logs"] }
            ],
            animation: "slideUp"
        },
        propSchema: pricingToggleBlockSchema,
    },
    accordion: {
        type: "accordion",
        label: "Accordion",
        icon: ListCollapse,
        component: AccordionBlock,
        defaultProps: {
            subtitle: "FAQ",
            title: "Common Questions",
            style: "cards",
            allowMultiple: false,
            items: [
                { question: "How do I get started?", answer: "Simply sign up for a free account and follow our onboarding guide." },
                { question: "Is there a free trial?", answer: "Yes! We offer a 14-day free trial with full access to all features." },
                { question: "Can I cancel anytime?", answer: "Absolutely. No contracts, cancel whenever you want." }
            ]
        },
        propSchema: accordionBlockSchema,
    },
    tabs: {
        type: "tabs",
        label: "Tabs",
        icon: Layers,
        component: TabsBlock,
        defaultProps: {
            subtitle: "Features",
            title: "Explore Our Platform",
            style: "pills",
            tabs: [
                { label: "Dashboard", content: "Get a bird's eye view of all your metrics, projects, and team activity in one beautiful dashboard.", image: "" },
                { label: "Analytics", content: "Deep dive into your data with powerful analytics tools and custom reports.", image: "" },
                { label: "Integrations", content: "Connect with 100+ tools you already use, from Slack to Salesforce.", image: "" }
            ]
        },
        propSchema: tabsBlockSchema,
    },
    countdown: {
        type: "countdown",
        label: "Countdown Timer",
        icon: Timer,
        component: CountdownBlock,
        defaultProps: {
            subtitle: "Limited Time",
            title: "Launch Coming Soon",
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            style: "cards",
            showLabels: true
        },
        propSchema: countdownBlockSchema,
    },
    timeline: {
        type: "timeline",
        label: "Timeline",
        icon: GitBranch,
        component: TimelineBlock,
        defaultProps: {
            subtitle: "Our Journey",
            title: "Company Milestones",
            style: "alternating",
            lineStyle: "solid",
            items: [
                { year: "2020", title: "Founded", description: "Started with a vision to revolutionize the industry." },
                { year: "2021", title: "First Product", description: "Launched our flagship product to early adopters." },
                { year: "2022", title: "Series A", description: "Raised $10M to accelerate growth and expand the team." },
                { year: "2023", title: "Global Expansion", description: "Opened offices in 5 new countries." }
            ]
        },
        propSchema: timelineBlockSchema,
    },
    comparison: {
        type: "comparison",
        label: "Comparison Table",
        icon: Scale,
        component: ComparisonBlock,
        defaultProps: {
            subtitle: "Why Choose Us",
            title: "See the Difference",
            leftTitle: "Others",
            rightTitle: "Our Platform",
            style: "cards",
            highlightRight: true,
            features: [
                { name: "Unlimited Projects", left: "no", right: "yes" },
                { name: "24/7 Support", left: "partial", right: "yes" },
                { name: "Custom Integrations", left: "no", right: "yes" },
                { name: "Advanced Analytics", left: "partial", right: "yes" },
                { name: "Team Collaboration", left: "yes", right: "yes" }
            ]
        },
        propSchema: comparisonBlockSchema,
    },
    cms: {
        type: "cms",
        label: "CMS Collection",
        icon: Database,
        component: CMSBlock,
        defaultProps: {
            subtitle: "Latest",
            title: "From Our Collection",
            collectionSlug: "",
            displayMode: "grid",
            template: "cards",
            columns: 3,
            limit: 6,
            showImage: true,
            imageField: "image",
            titleField: "title",
            descriptionField: "description",
            linkField: "slug",
            animation: "fade"
        },
        propSchema: cmsBlockSchema,
    }
}

export const AVAILABLE_BLOCKS = Object.values(BLOCK_DEFINITIONS)

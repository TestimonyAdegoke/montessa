export const SECTION_TEMPLATES = [
    {
        id: "hero-split",
        label: "Split Hero",
        category: "Sections",
        type: "section",
        props: { paddingY: "py-20" },
        children: [
            {
                type: "columns",
                props: { columns: 2, gap: "gap-12", align: "items-center" },
                children: [
                    {
                        type: "column",
                        children: [
                            { type: "heading", props: { text: "Creative Solutions for Modern Schools", level: "h1" } },
                            { type: "paragraph", props: { text: "Manage your institution with ease using our award-winning platform designed for educators.", size: "lg" } },
                            { type: "button", props: { text: "Get Started", variant: "primary", size: "lg" } }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            { type: "image", props: { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop", rounded: "rounded-2xl" } }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "features-cards",
        label: "Feature Cards",
        category: "Sections",
        type: "section",
        props: { paddingY: "py-20" },
        children: [
            { type: "heading", props: { text: "Why Choose Us", level: "h2", align: "center" } },
            { type: "paragraph", props: { text: "Our platform offers everything you need to succeed.", align: "center", size: "md" }, props_style: { marginBottom: "3rem" } },
            {
                type: "columns",
                props: { columns: 3, gap: "gap-8" },
                children: [
                    {
                        type: "column",
                        children: [
                            { type: "heading", props: { text: "Academic Excellence", level: "h3" } },
                            { type: "paragraph", props: { text: "Rigorous curriculum designed for modern learners.", size: "sm" } }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            { type: "heading", props: { text: "Expert Mentoring", level: "h3" } },
                            { type: "paragraph", props: { text: "Learn from industry professionals and educators.", size: "sm" } }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            { type: "heading", props: { text: "Global Community", level: "h3" } },
                            { type: "paragraph", props: { text: "Connect with students from all around the world.", size: "sm" } }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "cta-dark",
        label: "Dark Call-to-Action",
        category: "Sections",
        type: "section",
        props: { paddingY: "py-16", backgroundColor: "#0F172A", color: "#FFFFFF" },
        children: [
            {
                type: "container",
                props: { maxWidth: "max-w-4xl" },
                children: [
                    { type: "heading", props: { text: "Ready to transform your school?", level: "h2", align: "center", color: "#FFFFFF" } },
                    { type: "paragraph", props: { text: "Join over 500 institutions already using our platform.", align: "center", color: "rgba(255,255,255,0.7)" } },
                    {
                        type: "spacer",
                        props: { height: "h-8" }
                    },
                    {
                        type: "container",
                        props_style: { display: "flex", justifyContent: "center" },
                        children: [
                            { type: "button", props: { text: "Join Now", variant: "primary", size: "lg" } }
                        ]
                    }
                ]
            }
        ]
    }
]

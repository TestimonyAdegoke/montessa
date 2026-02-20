# Site Builder — Competitive Analysis & Roadmap

## Current State Audit

### What We Have
- **17 block types** with alt variants (21 total entries): Hero, Features, Content, CTA, Gallery, Navigation, Footer, Video, Pricing, Team, Logo Cloud, Stats, Newsletter, Contact, Map, Testimonials, FAQ
- **10 templates** (school-focused): Elite International, STEM Lab, Fine Arts, Global International, Urban College, Montessori, Tech Leadership, Sports Excellence, Arts Conservatory, Faith & Service
- **10 theme presets**: Modern Minimal, Classic Academic, Dark Tech, Warm Montessori, Elegant Arts, Nordic Frost, Midnight Luxury, Industrial Loft, Tokyo Midnight, Swiss High-End
- **Canvas features**: Responsive preview (desktop/tablet/mobile), auto-scaling, block selection with outline
- **Editing**: Inline text editing, property sidebar (SidebarRight), block add/reorder sidebar (SidebarLeft)
- **History**: Undo/redo with history stack, autosave every 5s
- **Styling per block**: Background type (color/gradient), background pattern (dots/grid/mesh/waves), blur, overlay, padding, entrance animations (fade/slideUp/zoom/none)
- **Drag & Drop**: Full @dnd-kit sortable reordering on canvas

### What Competitors Have That We Don't

| Feature | Framer | Figma Sites | Webflow | Our Builder |
|---------|--------|-------------|---------|-------------|
| **Visual DnD Canvas** | ✅ Freeform | ✅ Freeform | ✅ Freeform | ✅ Vertical stack |
| **Block Reordering** | ✅ | ✅ | ✅ | ✅ (just added) |
| **Responsive Breakpoints** | ✅ 4+ | ✅ Unlimited | ✅ 5 | ✅ 3 (desktop/tablet/mobile) |
| **Animations** | ✅ Advanced (scroll, hover, page transitions) | ✅ Prototyping | ✅ Interactions | ⚠️ Basic (entrance only) |
| **Custom CSS** | ✅ | ❌ | ✅ | ❌ |
| **Component Variants** | ✅ | ✅ | ✅ States | ⚠️ Alt blocks only |
| **CMS / Dynamic Data** | ✅ | ❌ | ✅ | ❌ (in Site Builder) |
| **SEO Controls** | ✅ | ✅ Basic | ✅ Advanced | ❌ |
| **Forms** | ✅ | ❌ | ✅ | ⚠️ Static only |
| **E-commerce** | ✅ Shopify | ❌ | ✅ Native | ❌ |
| **Code Export** | ✅ React | ✅ CSS | ✅ HTML/CSS | ❌ |
| **Collaboration** | ✅ Real-time | ✅ Real-time | ✅ | ❌ |
| **Asset Manager** | ✅ | ✅ | ✅ | ❌ |
| **Global Styles / Design Tokens** | ✅ | ✅ | ✅ | ⚠️ Basic (colors + font) |
| **Page Management** | ✅ Multi-page | ✅ Multi-page | ✅ Multi-page | ⚠️ Single page |
| **Domain / Hosting** | ✅ | ✅ | ✅ | ❌ |
| **Scroll Animations** | ✅ Parallax, reveal | ❌ | ✅ | ⚠️ whileInView only |
| **Template Quality** | ✅ Premium, diverse | ✅ Figma community | ✅ Premium | ⚠️ School-only |

---

## Strategic Roadmap

### Phase 1: Foundation Polish (Current Sprint) ✅ In Progress
- [x] Fix all TypeScript/JSX errors
- [x] Implement drag-and-drop block reordering
- [ ] Upgrade block icons to premium Lucide icons
- [ ] Add advanced block variations (split hero, bento grid, testimonial carousel, pricing toggle)
- [ ] Create 5 new industry-agnostic templates (SaaS, Portfolio, Agency, E-commerce, Blog)
- [ ] Polish all blocks for consistent animations, patterns, gradients

### Phase 2: Power Features (Next Sprint)
- **Scroll-triggered animations**: Parallax, stagger reveals, counter animations
- **Hover interactions**: Scale, color shift, shadow lift per block
- **Page transitions**: Fade, slide between pages
- **Multi-page support**: Create/manage multiple pages per site
- **SEO panel**: Meta title, description, OG image per page
- **Asset manager**: Upload and manage images/files

### Phase 3: Professional Grade
- **Design tokens system**: Spacing scale, border radius, shadows, typography scale
- **Component variants**: Hover/active/focus states per block
- **Custom CSS injection**: Per-block custom styles
- **Responsive overrides**: Different content/layout per breakpoint
- **Global header/footer**: Shared across pages
- **Favicon & branding**: Site-level brand assets

### Phase 4: Platform Features
- **Form builder integration**: Connect to our existing form system
- **CMS binding**: Dynamic content from collections
- **Analytics dashboard**: Page views, clicks, conversions
- **Custom domains**: Connect custom domains
- **Code export**: Download as static HTML/CSS/JS
- **Collaboration**: Real-time multi-user editing

---

## Design Philosophy

> **"As powerful as Framer, as simple as Squarespace."**

### Key Principles
1. **Block-first architecture** — Users think in sections, not pixels. Keep the vertical stack model but make each block incredibly customizable.
2. **Smart defaults** — Every template and block should look professional out of the box. Zero-config beauty.
3. **Progressive disclosure** — Basic users see simple controls. Power users can access advanced settings.
4. **Industry-agnostic** — Templates should span SaaS, portfolios, agencies, e-commerce, blogs — not just schools.
5. **Performance** — Generated sites should score 90+ on Lighthouse.

### Competitive Advantages We Can Leverage
- **Integrated platform**: Unlike standalone builders, we're part of a full SMS/LMS ecosystem
- **Tenant-aware**: Sites can pull data from the school's existing database
- **Role-based access**: Teachers, admins, parents can each manage their sections
- **Built-in forms & submissions**: No third-party form tools needed

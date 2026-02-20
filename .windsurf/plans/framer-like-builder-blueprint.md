---
description: Framer-like Builder Blueprint (C > A > B)
---

# Goal
Bridge the gap between your current Next.js/Zustand/Prisma website builder and **Framer-like** capabilities, prioritizing:
- **[C] CMS + templates** (dynamic content, collections, references, drafts, publishing)
- **[A] Canvas / layout UX** (snapping, auto-layout feel, responsive editing)
- **[B] Components / variants** (variants, variables/props, overrides)

This blueprint is **implementation-oriented**: concrete milestones + file-level touchpoints mapped to your existing code.

# Current System (baseline mapping)
## Runtime rendering
- **Renderer**: `lib/website-builder/renderer.tsx`
  - Renders `WBNode` trees.
  - Supports `componentInstance` + `applyComponentOverrides`.
  - Injects CMS data at runtime via `_cmsCollection`, `_cmsFieldMap`, `_cmsLimit` and `resolveCmsBinding`.

## Editor
- **Main editor UI**: `components/website-builder/page-editor.tsx`
  - Inspector tabs for props / style / interaction.
  - Multi-selection support.
  - `CmsBindingEditor` exists (single selection, JSON-like props binding).

## Server actions and persistence
- **Site/page actions**: `lib/actions/website-builder.ts`
  - `getSite()` includes `components` and `cmsCollections`.
  - Publishing currently resembles “copy draft to published fields” (`publishedContent`, `publishedAt`).

## CMS (current)
- **CMS-lite**: `lib/website-builder/cms-lite.ts`
  - Fetches “collections” by reading existing product tables (announcements/events/teachers) and shaping them into `WBCmsCollection`.
  - `resolveCmsBinding()` maps CMS item fields into block-side item arrays.

# Framer-Like Reference Behaviors (grounded highlights)
These are the behaviors you’ll want to match because they drive the UX/architecture.

## CMS: typed fields + references + drafts
From Framer’s CMS API perspective, CMS is:
- **Collections** with **Fields** and **Items**.
- Items contain `id`, `slug`, `draft`, and `fieldData` keyed by field id (not name).
- Supported field types include:
  - `string`, `number`, `boolean`, `color`, `date`, `formattedText`, `image`, `file`, `link`, `enum`
  - `collectionReference`, `multiCollectionReference`
  - `array` (notably used for galleries)
  - Source: https://www.framer.com/developers/cms

Framer also supports:
- **Drafts** for Pages, CMS Items, and Locales (draft content is previewable but not published).
  - Source: https://www.framer.com/updates/drafts

## CMS Pagination
Framer’s collection list supports:
- **Infinite scrolling** or **Load More**
- Custom spinner/button components, custom “Loading/Hidden” states
- Works with existing limits/offsets
  - Source: https://www.framer.com/updates/cms-pagination

## Publishing: immutable versions + staging
Framer’s publish model is:
- Each publish creates an immutable **version** with a versioned link.
- **Staging**: base domain can point to “latest”, custom domain can be pinned to an older/stable version until you “Deploy”.
  - Source: https://www.framer.com/help/articles/staging-and-versions/

## “Props/Variables” for reuse
Framer’s “property controls” concept (for code components) demonstrates the pattern you’ll want even for no-code blocks:
- Instance-level props in the right panel
- Conditional visibility of controls
- Structured controls including array/object controls
  - Source: https://www.framer.com/developers/property-controls

Layout variables (“stack variables”) show a key UX pattern:
- Reduce variant explosion by promoting layout knobs (gap/direction/etc) into instance-editable variables per breakpoint.
  - Source: https://www.framer.com/academy/lessons/stack-variables

# Implementation Blueprint (C > A > B)

# [C] CMS + Templates (highest priority)
## Outcome definition (what “Framer-like” means here)
- **First-class CMS layer** (collections, items, fields, references) rather than “CMS-lite arrays injected into block props”.
- **Bindings** are not ad-hoc; they are structured, validated, and inspectable.
- **Dynamic pages** (template pages) and **collection lists**.
- **Draft vs Published** at least at:
  - Page level
  - CMS item level
- **Publishing creates immutable versions** and supports a staging workflow.

## C1. Introduce a real CMS domain model (keep CMS-lite as a source option)
### What to build
Add a Prisma-backed CMS that can coexist with your current “derived collections” (announcements/events/teachers):
- `WBCmsCollectionModel`
  - `id`, `siteId/tenantId`, `name`, `slug`, `description`, `createdAt`, `updatedAt`
- `WBCmsFieldModel`
  - `collectionId`, stable `fieldId`, `name`, `type`, `options` (for enums), `isRequired`, `isTitle`, `isSlugSource`
- `WBCmsItemModel`
  - `collectionId`, `slug`, `status` (`DRAFT`/`PUBLISHED`), `fieldData` (json), `publishedFieldData` (json), timestamps
- `WBCmsReferenceIndex` (optional but recommended)
  - Helps query “reverse relationships” efficiently

### Why this matters
Your current `WBCmsCollection` is a *runtime shape*, not a persistence model. Framer-like CMS requires:
- Stable field IDs
- Field type metadata
- Draft/published and references

### Touchpoints
- **Prisma**: `prisma/schema.prisma`
- **Types**: `lib/website-builder/types.ts`
- **Actions**: new `lib/actions/website-builder-cms.ts` (recommended) or extend `website-builder.ts`

## C2. CMS Editor UI (Collections/Items/Fields)
### What to build
Add dashboard pages for:
- Collections list
- Collection detail
  - Fields editor (field types, required, enum options)
  - Items table
- Item editor
  - Rich text editing for `formattedText`
  - Media picking for `image`/`file`
  - Reference pickers for `collectionReference` and `multiCollectionReference`
  - Draft toggle + publish controls

### Touchpoints
- Dashboard routes: `app/(dashboard)/dashboard/website-builder/...`
- Shared UI: `components/website-builder/...`

## C3. Replace “CMS binding = inject arrays” with “CMS binding = query + mapping + view model”
### Problem with current approach
Right now, binding stores `_cmsCollection`, `_cmsFieldMap`, `_cmsLimit`, then the renderer injects the resolved array into props. This is convenient but becomes limiting for:
- Filtering / sorting
- Pagination
- References
- Conditional visibility
- Dynamic pages

### What to build
Introduce a formal binding config (per node):
- `node.props._cmsBinding` (single object) instead of scattered keys
  - `collectionId`
  - `mode`: `list` | `detail`
  - `query`: `filter`, `sort`, `limit`, `offset`, `search`
  - `map`: block-field -> cms-fieldId (not field name)
  - `pagination`: none | loadMore | infinite (and page size)

Then update runtime resolution:
- Precompute a **CMS view model** for each bound node:
  - `resolvedItems`
  - `paginationState` (if needed)
- Feed that view model into block rendering.

### Touchpoints
- `lib/website-builder/renderer.tsx`
- `lib/website-builder/cms-lite.ts` (becomes `cms.ts` with adapters)
- `components/website-builder/page-editor.tsx` (new binding UI)

## C4. Collection Pages (dynamic routes) + templates
### What to build
Framer’s “CMS Pages & dynamic content” experience generally boils down to:
- A **template page** that renders for every item in a collection.
- Slug-driven routing.

In your system:
- Extend `WBPage` with optional:
  - `cmsCollectionId`
  - `cmsItemSlugParam` (usually implicit)
  - `pageType`: `STATIC` | `CMS_TEMPLATE`
- At runtime (`app/site/[subdomain]/[[...slug]]/page.tsx`):
  - Resolve whether the route is a static page slug or a collection item slug.
  - Fetch the item and pass it to renderer as “current CMS item context”.

### Renderer impact
- Binding modes:
  - `list`: returns many items
  - `detail`: returns the current item’s fields

## C5. Drafts + Publishing Versions + Staging
### Drafts (match Framer behavior)
Implement drafts for:
- Pages (already have `DRAFT` status)
- CMS Items (new)
- Optionally locale drafts later

### Immutable versions (match Framer behavior)
When you publish, create a `WBSiteVersion` (or `WBPublishVersion`) entity:
- Contains snapshot pointers:
  - pages published content
  - CMS published content (for bound collections)
  - theme
  - menus
- Assign each publish a version ID.

### Staging workflow (match Framer behavior)
Support:
- “Base domain points to latest version”
- “Custom domain pinned to selected version” until deploy

Even if you don’t implement domains immediately, you can implement:
- `site.activeVersionId` (for stable)
- `site.latestVersionId` (for preview)
- Runtime uses one or the other based on host

### Touchpoints
- Prisma schema
- `lib/actions/website-builder.ts` publish actions
- `app/api/site/[...slug]/route.ts` and runtime page data fetching

## C6. CMS Pagination + Filtering (Framer-like)
Implement for collection-list-like blocks:
- Query config on binding (limit/offset)
- `load more` and/or `infinite` mode
- Ability to attach custom “loading state” style/variant (later ties into [B])

# [A] Canvas / Layout UX (second priority)
## Outcome definition
Match Framer’s “design tool” feel:
- Predictable selection + drag
- Snapping + alignment guides
- Layout primitives that feel modern: stack/flex, gaps, constraints, min/max, auto sizing
- Breakpoint workflow that doesn’t explode variants

## A1. Layout primitives: make `stack` the backbone
You already added a `stack` block. Next steps:
- Add:
  - `minWidth`, `maxWidth`, `minHeight`, `maxHeight`
  - per-side padding + per-side margin
  - `position` model (static/relative/absolute) + pinning (top/left/right/bottom)
  - `zIndex`
- Add a consistent sizing model:
  - `hug` (auto)
  - `fill` (100%/flex)
  - `fixed` (px)

## A2. Breakpoints as first-class editing context
You already have responsive styles. To get closer to Framer:
- Show breakpoint controls prominently (desktop/tablet/phone)
- Ensure edits are scoped to the active breakpoint unless explicitly “apply to all”
- Provide visual diff indicators (this prop differs on this breakpoint)

## A3. Variables for layout (Framer “stack variables” pattern)
Framer’s “stack variables” insight:
- Avoid creating mobile-specific variants.
- Promote layout knobs into **instance-editable variables** that can differ per breakpoint.

In your builder:
- Introduce `node.variables` or `node.props._vars`:
  - Each variable has: `id`, `label`, `type`, `defaultValue`, `responsiveValues`
- Allow binding these variables to style props (gap/padding/direction/etc).

This becomes the bridge between [A] and [B]: it’s “component variables” without needing full variants first.

## A4. Snapping + guides (editor-only)
Implement editor-only measurement system:
- Snap to:
  - parent edges
  - sibling edges
  - centers
  - spacing increments
- Render guides on snap targets.

Touchpoints:
- `components/website-builder/page-editor.tsx` (canvas event system)
- Probably introduce a dedicated canvas controller module (recommended)

# [B] Components / Variants (third priority)
## Outcome definition
- Reusable components with:
  - **Variants** (named states like Primary/Secondary, Open/Closed)
  - **Variables/Props** exposed to instances (controls)
  - **Overrides** per instance (already partially done)

## B1. Formalize “Property Controls” for all blocks (not only code components)
Use the same concept as Framer’s property controls:
- A block/component defines a schema of controls
- Controls can be conditionally hidden
- Controls can be structured (object/array)

You already have `propSchema` in `block-registry.ts`; expand it to support:
- conditional display rules
- grouping
- array-of-object editors that map nicely to CMS-backed data

## B2. Variants
Introduce `WBComponentVariant`:
- Each component has variants with:
  - `name`
  - `sourceNodes` delta or full snapshot
- Instances pick a variant
- Interactions can “Switch Variant” (Framer-style)

Renderer:
- Render componentInstance using selected variant snapshot + overrides.

## B3. State-driven variants (hover/press/scroll)
You already support `styles.hover` and some motion presets.
Next:
- Add `styles.press`, `styles.focus`, etc.
- Add interaction triggers to swap variants or apply temporary state styles.

# Milestones (sequenced)
## Milestone 1 (C): CMS domain model + basic CMS UI
- Prisma models for collections/fields/items
- CRUD actions
- Basic dashboard UI

## Milestone 2 (C): Binding v2 + list/detail modes
- New binding config (`_cmsBinding`)
- Renderer resolves binding to a view model
- `CmsBindingEditor` upgraded

## Milestone 3 (C): CMS template pages
- CMS template page type
- Runtime routing for item slugs

## Milestone 4 (C): Drafts + publishing versions + staging
- `WBSiteVersion`
- “publish creates version” + ability to roll back
- staging semantics (base vs custom domain behavior)

## Milestone 5 (C): Pagination + filtering
- pagination modes
- filtering UI + query config

## Milestone 6 (A): Snapping/guides + sizing model
- better canvas feel
- hug/fill/fixed sizing

## Milestone 7 (A/B): Variables for layout
- stack variables pattern
- per-breakpoint variable values

## Milestone 8 (B): Variants
- component variants + interactions

# Notes / Guardrails
- Keep CMS-lite as an **adapter source** initially (derived collections) so you can ship quickly while migrating.
- Prefer **stable IDs** for CMS fields (Framer emphasizes field id stability to avoid breaking assignments).
- Treat “publish” as producing an **immutable snapshot** (Framer versions are static).

# References
- Framer publish versions + staging: https://www.framer.com/help/articles/staging-and-versions/
- Framer drafts (pages/CMS/locales): https://www.framer.com/updates/drafts
- Framer CMS field types + items shape: https://www.framer.com/developers/cms
- Framer CMS pagination: https://www.framer.com/updates/cms-pagination
- Framer property controls pattern: https://www.framer.com/developers/property-controls
- Framer stack variables concept: https://www.framer.com/academy/lessons/stack-variables

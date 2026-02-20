// ─────────────────────────────────────────────────────────
// Website Builder — Core Type Definitions
// ─────────────────────────────────────────────────────────

/** Every node in the page JSON tree has this shape */
export interface WBNode {
  id: string
  type: string
  props: Record<string, any>
  children?: WBNode[]
  /** Stable ID used when this node is part of a reusable component source tree */
  componentNodeId?: string
  /** Style overrides per breakpoint */
  styles?: WBStyles
  /** Whether this node is hidden */
  hidden?: boolean
  /** Node-level variables (stack variables pattern) */
  variables?: WBNodeVariable[]
}

export interface WBStyles {
  base?: React.CSSProperties
  tablet?: React.CSSProperties
  mobile?: React.CSSProperties
  hover?: React.CSSProperties
  press?: React.CSSProperties
  focus?: React.CSSProperties
}

/** Block definition for the registry */
export interface WBBlockDef {
  type: string
  label: string
  category: WBBlockCategory
  icon: string
  defaultProps: Record<string, any>
  defaultChildren?: WBNode[]
  defaultStyles?: WBStyles
  /** Property schema for the inspector panel */
  propSchema: WBPropField[]
  /** Whether this block can contain children */
  isContainer?: boolean
  /** Whether this block can be dragged */
  isDraggable?: boolean
  /** Allowed child types (empty = any) */
  allowedChildren?: string[]
}

export type WBBlockCategory =
  | "layout"
  | "content"
  | "media"
  | "form"
  | "navigation"
  | "hero"
  | "feature"
  | "testimonial"
  | "pricing"
  | "cta"
  | "gallery"
  | "faq"
  | "footer"
  | "custom"

export interface WBPropField {
  name: string
  label: string
  type: "text" | "textarea" | "richtext" | "number" | "color" | "select" | "boolean" | "image" | "icon" | "url" | "spacing" | "alignment" | "json"
  options?: { label: string; value: string }[]
  defaultValue?: any
  group?: string
  /** Schema for items if type is 'json' */
  itemSchema?: WBPropField[]
}

/** Theme tokens used by the renderer */
export interface WBThemeTokens {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  mutedColor: string
  headingFont: string
  bodyFont: string
  borderRadius: string
  buttonRadius: string
  cardRadius: string
  buttonStyle: string
  shadowStyle: string
  containerWidth: string
}

/** Page data as stored/fetched */
export interface WBPageData {
  id: string
  title: string
  slug: string
  status: string
  isHomepage: boolean
  isPortalLogin: boolean
  isLocked: boolean
  content: WBNode[]
  metaTitle?: string | null
  metaDescription?: string | null
  pageType?: "STATIC" | "CMS_TEMPLATE"
  cmsCollectionId?: string | null
}

/** Site data */
export interface WBSiteData {
  id: string
  tenantId: string
  mode: "PORTAL_ONLY" | "FULL_WEBSITE"
  name: string
  isPublished: boolean
  theme: WBThemeTokens | null
  components?: WBComponent[]
  cmsCollections?: WBCmsCollection[]
}

// ── Runtime CMS shapes (used by renderer / CMS-lite adapter) ──

export interface WBCmsCollectionField {
  key: string
  label: string
}

export interface WBCmsCollection {
  id: string
  label: string
  description?: string
  fields: WBCmsCollectionField[]
  items: Record<string, any>[]
}

// ── Persisted CMS domain model (Framer-class) ──

export type WBCmsFieldType =
  | "STRING"
  | "NUMBER"
  | "BOOLEAN"
  | "COLOR"
  | "DATE"
  | "FORMATTED_TEXT"
  | "IMAGE"
  | "FILE"
  | "LINK"
  | "ENUM"
  | "COLLECTION_REF"
  | "MULTI_COLLECTION_REF"

export type WBCmsItemStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export interface WBCmsFieldDef {
  id: string
  collectionId: string
  fieldId: string
  name: string
  type: WBCmsFieldType
  isRequired: boolean
  isTitle: boolean
  isSlugSource: boolean
  options?: any
  defaultValue?: string | null
  sortOrder: number
}

export interface WBCmsItemData {
  id: string
  collectionId: string
  slug: string
  status: WBCmsItemStatus
  fieldData: Record<string, any>
  publishedFieldData?: Record<string, any> | null
  publishedAt?: string | null
  createdById?: string | null
  createdAt: string
  updatedAt: string
}

export interface WBCmsCollectionData {
  id: string
  siteId: string
  name: string
  slug: string
  description?: string | null
  sortOrder: number
  fields: WBCmsFieldDef[]
  items: WBCmsItemData[]
  createdAt: string
  updatedAt: string
}

// ── CMS Binding v2 (structured binding config) ──

export interface WBCmsBinding {
  collectionId: string
  mode: "list" | "detail"
  query?: {
    filter?: Record<string, any>
    sort?: { field: string; direction: "asc" | "desc" }
    limit?: number
    offset?: number
    search?: string
  }
  map: Record<string, string>
  pagination?: {
    mode: "none" | "loadMore" | "infinite"
    pageSize?: number
  }
}

// ── Node-level variables (stack variables pattern) ──

export interface WBNodeVariable {
  id: string
  label: string
  type: "string" | "number" | "color" | "select" | "boolean"
  defaultValue: any
  responsiveValues?: Record<string, any>
  options?: { label: string; value: string }[]
  bindTo?: string
}

// ── Component variants ──

export interface WBComponentVariant {
  id: string
  name: string
  sourceNodes: WBNode[]
  isDefault?: boolean
}

export interface WBComponentEditableField {
  key: string
  label: string
  defaultValue?: string
}

/** User-defined reusable component */
export interface WBComponent {
  id: string
  name: string
  /** The source node tree that defines this component */
  sourceNodes: WBNode[]
  /** Flat list of commonly edited text/url fields exposed as instance overrides */
  editableFields?: WBComponentEditableField[]
  /** Named variants (e.g. Primary/Secondary, Open/Closed) */
  variants?: WBComponentVariant[]
  /** Timestamp of creation */
  createdAt: number
}

/** Editor state managed by zustand */
export interface WBEditorState {
  // Page
  pageId: string | null
  nodes: WBNode[]
  selectedNodeId: string | null
  multiSelectedIds: Set<string>
  hoveredNodeId: string | null
  clipboard: WBNode | null
  styleClipboard: WBStyles | null

  // History
  history: WBNode[][]
  historyIndex: number
  redoDepth: number
  isDirty: boolean

  // Viewport
  viewport: "desktop" | "tablet" | "mobile"
  zoom: number
  showGrid: boolean

  // Panels
  leftPanel: "layers" | "insert" | "pages" | "components" | null
  rightPanel: "inspector" | "theme" | null

  uiMode: "minimal" | "pro"

  // Reusable components
  components: WBComponent[]

  // Actions
  setNodes: (nodes: WBNode[]) => void
  selectNode: (id: string | null) => void
  toggleSelectNode: (id: string) => void
  clearMultiSelect: () => void
  hoverNode: (id: string | null) => void
  addNode: (node: WBNode, parentId?: string, index?: number) => void
  updateNode: (id: string, updates: Partial<WBNode>) => void
  updateNodeProps: (id: string, props: Record<string, any>) => void
  updateNodeStyles: (id: string, styles: WBStyles) => void
  updateNodesProps: (ids: Set<string>, props: Record<string, any>) => void
  updateNodesStyles: (ids: Set<string>, styles: WBStyles) => void
  removeNode: (id: string) => void
  moveNode: (id: string, newParentId: string | null, index: number) => void
  reorderNodes: (parentId: string | null, fromIndex: number, toIndex: number) => void
  duplicateNode: (id: string) => void
  copyNode: (id: string) => void
  pasteNode: (parentId?: string) => void
  wrapInStack: (ids: Set<string>) => void
  copyStyles: (id: string) => void
  pasteStyles: (ids: Set<string>) => void

  // History
  undo: () => void
  redo: () => void
  pushHistory: () => void
  resetHistory: () => void

  // Viewport
  setViewport: (v: "desktop" | "tablet" | "mobile") => void
  setZoom: (z: number) => void
  toggleGrid: () => void

  // Panels
  setLeftPanel: (p: "layers" | "insert" | "pages" | "components" | null) => void
  setRightPanel: (p: "inspector" | "theme" | null) => void

  setUiMode: (m: "minimal" | "pro") => void

  // Reusable components
  createComponent: (name: string, sourceNodes: WBNode[]) => void
  deleteComponent: (id: string) => void
  insertComponent: (componentId: string) => void
  setComponents: (components: WBComponent[]) => void

  // Page
  setPageId: (id: string) => void
  setDirty: (d: boolean) => void
}

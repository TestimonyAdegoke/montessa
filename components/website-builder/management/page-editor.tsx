"use client"

import React, { useEffect, useCallback, useState, useTransition, useRef, useMemo, type DragEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft, Undo2, Redo2, Monitor, Tablet, Smartphone, Save, Rocket,
  Layers, LayoutGrid, Settings2, Paintbrush, ChevronRight, ChevronDown,
  GripVertical, Trash2, Copy, Plus, Grid3X3, FileText, Eye, EyeOff,
  LayoutTemplate, Box, Columns3, RectangleVertical, Minus, SeparatorHorizontal,
  Type, AlignLeft, MousePointerClick, List, Tag, Image as ImageIcon, Play, Code, Smile,
  Sparkles, Quote, CreditCard, Megaphone, HelpCircle, Images, MapPin,
  Clock, BarChart3, Users, Award, Mail, ClipboardList, PanelTop, PanelBottom,
  LogIn, ChevronUp, Palette, Maximize2, Bold, Italic, Underline, AlignCenter,
  AlignRight, AlignJustify, MoveVertical, Grip, Check, X, PlusCircle, Database,
  Download, AlertTriangle, Search,
} from "lucide-react"
import * as Icons from "lucide-react"
import { useEditorStore } from "@/lib/website-builder/editor-store"
import { BLOCK_REGISTRY, getBlocksByCategory, createNode } from "@/lib/website-builder/block-registry"
import { SECTION_TEMPLATES } from "@/lib/website-builder/section-templates"
import { WBRenderer } from "@/lib/website-builder/renderer"
import {
  savePageContent,
  publishPage,
  createReusableComponent as createReusableComponentAction,
  deleteReusableComponent as deleteReusableComponentAction,
  getTemplates,
  applyTemplate,
  applyTemplateMerge,
  applyTemplateThemeOnly,
} from "@/lib/actions/website-builder"
import type { WBNode, WBThemeTokens, WBComponent, WBCmsCollection } from "@/lib/website-builder/types"
import type { SnapGuide } from "@/lib/website-builder/canvas-utils"
import { getAllNodeRects, computeSnap } from "@/lib/website-builder/canvas-utils"
import { motion, AnimatePresence } from "framer-motion"


// ── Icon map for block types ─────────────────────────
const BLOCK_ICON_MAP: Record<string, React.ReactNode> = {
  section: <LayoutTemplate className="h-4 w-4" />,
  container: <Box className="h-4 w-4" />,
  columns: <Columns3 className="h-4 w-4" />,
  column: <RectangleVertical className="h-4 w-4" />,
  spacer: <Minus className="h-4 w-4" />,
  divider: <SeparatorHorizontal className="h-4 w-4" />,
  heading: <Type className="h-4 w-4" />,
  paragraph: <AlignLeft className="h-4 w-4" />,
  richtext: <FileText className="h-4 w-4" />,
  button: <MousePointerClick className="h-4 w-4" />,
  list: <List className="h-4 w-4" />,
  badge: <Tag className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  video: <Play className="h-4 w-4" />,
  embed: <Code className="h-4 w-4" />,
  icon: <Smile className="h-4 w-4" />,
  hero: <Sparkles className="h-4 w-4" />,
  features: <Grid3X3 className="h-4 w-4" />,
  testimonials: <Quote className="h-4 w-4" />,
  pricing: <CreditCard className="h-4 w-4" />,
  cta: <Megaphone className="h-4 w-4" />,
  faq: <HelpCircle className="h-4 w-4" />,
  gallery: <Images className="h-4 w-4" />,
  contact: <MapPin className="h-4 w-4" />,
  timeline: <Clock className="h-4 w-4" />,
  stats: <BarChart3 className="h-4 w-4" />,
  team: <Users className="h-4 w-4" />,
  logos: <Award className="h-4 w-4" />,
  newsletter: <Mail className="h-4 w-4" />,
  formEmbed: <ClipboardList className="h-4 w-4" />,
  header: <PanelTop className="h-4 w-4" />,
  footer: <PanelBottom className="h-4 w-4" />,
  portalLogin: <LogIn className="h-4 w-4" />,
  countdown: <Clock className="h-4 w-4" />,
  accordion: <List className="h-4 w-4" />,
  tabs: <LayoutGrid className="h-4 w-4" />,
  marquee: <MoveVertical className="h-4 w-4" />,
  beforeAfter: <Columns3 className="h-4 w-4" />,
}

function getBlockIcon(type: string) {
  return BLOCK_ICON_MAP[type] || <Box className="h-4 w-4" />
}

interface PageData {
  id: string
  title: string
  slug: string
  status: string
  content: any
  isLocked: boolean
  site: { tenantId: string }
}

interface SiteData {
  id: string
  theme: any
  menus?: any[]
  components?: WBComponent[]
  cmsCollections?: WBCmsCollection[]
  pages?: { id: string; title: string; slug: string; status: string; isHomepage: boolean }[]
  templates?: { id: string; name: string; category: string }[]
}

interface Props {
  page: PageData
  site: SiteData
  userId: string
}

interface TemplateData {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  thumbnail: string | null
  mode: string
  isDefault: boolean
  pages: any
  theme: any
}

export default function PageEditor({ page, site, userId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [rightTab, setRightTab] = useState<"props" | "style" | "interaction" | "vars">("props")
  const [styleBreakpoint, setStyleBreakpoint] = useState<"base" | "tablet" | "mobile">("base")
  const [previewMode, setPreviewMode] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const clipboardRef = useRef<WBNode | null>(null)

  const [designOpen, setDesignOpen] = useState(false)
  const [designTab, setDesignTab] = useState<"theme" | "templates">("theme")
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [templateSearch, setTemplateSearch] = useState("")
  const [templateCategory, setTemplateCategory] = useState("all")
  const [templatePreviewOpen, setTemplatePreviewOpen] = useState(false)
  const [templatePreview, setTemplatePreview] = useState<TemplateData | null>(null)
  const [templateConfirmOpen, setTemplateConfirmOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null)
  const [applyMode, setApplyMode] = useState<"replace" | "merge" | "theme">("merge")
  const [templateError, setTemplateError] = useState("")

  // Context menu state
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)

  // Snap guides state (editor-only)
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([])
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Inline text editing state
  const [inlineEditId, setInlineEditId] = useState<string | null>(null)
  const [inlineEditPropKey, setInlineEditPropKey] = useState<string | null>(null)
  const [inlineEditValue, setInlineEditValue] = useState("")

  // Command palette state
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false)
  const [cmdQuery, setCmdQuery] = useState("")

  // New page dialog
  const [newPageOpen, setNewPageOpen] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState("")
  const [newPageSlug, setNewPageSlug] = useState("")

  // Create reusable component dialog
  const [createComponentOpen, setCreateComponentOpen] = useState(false)
  const [createComponentName, setCreateComponentName] = useState("")
  const [createComponentNodeId, setCreateComponentNodeId] = useState<string | null>(null)
  const [componentActionPending, setComponentActionPending] = useState(false)

  const {
    nodes, setNodes, selectedNodeId, selectNode, multiSelectedIds, toggleSelectNode, clearMultiSelect,
    hoveredNodeId, hoverNode,
    viewport, setViewport, zoom, setZoom, showGrid, toggleGrid,
    leftPanel, setLeftPanel, rightPanel, setRightPanel,
    uiMode, setUiMode,
    addNode, updateNode, updateNodeProps, updateNodeStyles, updateNodesProps, updateNodesStyles, removeNode, duplicateNode, reorderNodes,
    undo, redo, pushHistory, resetHistory, historyIndex, history, redoDepth, isDirty, setDirty, setPageId, moveNode,
    components, setComponents, insertComponent,
    wrapInStack, copyStyles, pasteStyles, styleClipboard, copyNode, pasteNode,
  } = useEditorStore()

  function openCreateComponentDialog(nodeId: string) {
    const node = findNodeById(nodes, nodeId)
    if (!node) return
    const defaultName = BLOCK_REGISTRY.find((b) => b.type === node.type)?.label || "Component"
    setCreateComponentNodeId(nodeId)
    setCreateComponentName(defaultName)
    setCreateComponentOpen(true)
  }

  useEffect(() => {
    setPageId(page.id)
    try {
      const content = typeof page.content === "string" ? JSON.parse(page.content) : page.content
      setNodes(Array.isArray(content) ? content : [])
    } catch {
      setNodes([])
    }

    // New page context should start with clean undo/redo stacks.
    resetHistory()
    setDirty(false)
  }, [page.id, page.content, setNodes, setPageId, setDirty, resetHistory])

  useEffect(() => {
    setComponents(Array.isArray(site.components) ? site.components : [])
  }, [site.components, setComponents])

  const handleSave = useCallback(() => {
    setSaveStatus("saving")
    startTransition(async () => {
      try {
        await savePageContent(page.id, nodes)
        setDirty(false)
        setSaveStatus("saved")
      } catch {
        setSaveStatus("unsaved")
      }
    })
  }, [nodes, page.id, setDirty])

  const handlePublish = useCallback(() => {
    startTransition(async () => {
      try {
        await savePageContent(page.id, nodes)
        await publishPage(page.id)
        setDirty(false)
        setSaveStatus("saved")
        router.refresh()
      } catch (e: any) {
        alert(e.message || "Publish failed")
      }
    })
  }, [nodes, page.id, setDirty, router])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const isTypingTarget = !!target && (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      )

      if (isTypingTarget) {
        const isCmdShortcut = (e.ctrlKey || e.metaKey) && ["z", "s", "k", "p", "c", "v", "d"].includes(e.key.toLowerCase())
        if (!isCmdShortcut) return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) { e.preventDefault(); redo() }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave() }
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === "c") { 
        if (selectedNodeId) { e.preventDefault(); copyStyles(selectedNodeId); }
      }
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === "v") { 
        if (selectedNodeId) { 
          e.preventDefault(); 
          pasteStyles(multiSelectedIds.size > 0 ? multiSelectedIds : new Set([selectedNodeId])); 
        }
      }
      if (e.key === "Delete") {
        if (multiSelectedIds.size > 0) { multiSelectedIds.forEach((id) => removeNode(id)); clearMultiSelect() }
        else if (selectedNodeId) { removeNode(selectedNodeId) }
      }
      if (e.key === "Escape") {
        if (cmdPaletteOpen) { setCmdPaletteOpen(false); setCmdQuery("") }
        else if (inlineEditId) { setInlineEditId(null); setInlineEditPropKey(null) }
        else if (ctxMenu) { setCtxMenu(null) }
        else if (previewMode) setPreviewMode(false)
        else if (selectedNodeId) {
          selectNode(null)
          clearMultiSelect()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setCmdPaletteOpen((v) => !v); setCmdQuery("") }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") { e.preventDefault(); setPreviewMode((v) => !v) }
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedNodeId) {
        e.preventDefault()
        copyNode(selectedNodeId)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault()
        pasteNode(selectedNodeId || undefined)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault()
        if (multiSelectedIds.size > 0) {
          multiSelectedIds.forEach((id) => duplicateNode(id))
        } else if (selectedNodeId) {
          duplicateNode(selectedNodeId)
        }
      }
      if (e.altKey && e.key === "ArrowUp" && selectedNodeId) {
        e.preventDefault()
        const idx = nodes.findIndex((n) => n.id === selectedNodeId)
        if (idx > 0) reorderNodes(null, idx, idx - 1)
      }
      if (e.altKey && e.key === "ArrowDown" && selectedNodeId) {
        e.preventDefault()
        const idx = nodes.findIndex((n) => n.id === selectedNodeId)
        if (idx >= 0 && idx < nodes.length - 1) reorderNodes(null, idx, idx + 1)
      }
      // ── Keyboard navigation: Arrow keys move selection ──
      if (!e.altKey && !e.ctrlKey && !e.metaKey && e.key === "ArrowUp" && selectedNodeId && !inlineEditId) {
        e.preventDefault()
        const siblings = getSiblings(nodes, selectedNodeId)
        const idx = siblings.findIndex((n) => n.id === selectedNodeId)
        if (idx > 0) selectNode(siblings[idx - 1].id)
      }
      if (!e.altKey && !e.ctrlKey && !e.metaKey && e.key === "ArrowDown" && selectedNodeId && !inlineEditId) {
        e.preventDefault()
        const siblings = getSiblings(nodes, selectedNodeId)
        const idx = siblings.findIndex((n) => n.id === selectedNodeId)
        if (idx >= 0 && idx < siblings.length - 1) selectNode(siblings[idx + 1].id)
      }
      // Enter dives into first child
      if (e.key === "Enter" && selectedNodeId && !inlineEditId && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        const node = findNodeById(nodes, selectedNodeId)
        if (node?.children && node.children.length > 0) {
          selectNode(node.children[0].id)
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    selectedNodeId,
    nodes,
    multiSelectedIds,
    inlineEditId,
    cmdPaletteOpen,
    ctxMenu,
    previewMode,
    undo,
    redo,
    addNode,
    duplicateNode,
    removeNode,
    clearMultiSelect,
    reorderNodes,
    selectNode,
    copyNode,
    pasteNode,
    copyStyles,
    pasteStyles,
    handleSave,
  ])

  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => handleSave(), 30000)
    return () => clearTimeout(timer)
  }, [isDirty, nodes, handleSave])

  // Drag from blocks panel
  const handleBlockDragStart = (e: DragEvent, blockType: string) => {
    e.dataTransfer.setData("wb-block-type", blockType)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleCanvasDrop = (e: DragEvent) => {
    e.preventDefault()
    const blockType = e.dataTransfer.getData("wb-block-type")
    if (blockType) {
      const node = createNode(blockType)
      addNode(node)
    }
    setDragOverIndex(null)
  }

  const handleCanvasDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const selection = useMemo(() => {
    if (multiSelectedIds.size > 0) {
      const targets: WBNode[] = []
      const traverse = (list: WBNode[]) => {
        for (const n of list) {
          if (multiSelectedIds.has(n.id)) targets.push(n)
          if (n.children) traverse(n.children)
        }
      }
      traverse(nodes)
      return targets
    }
    if (selectedNodeId) {
      const node = findNodeById(nodes, selectedNodeId)
      return node ? [node] : []
    }
    return []
  }, [nodes, multiSelectedIds, selectedNodeId])

  const selectedNode = selection.length === 1 ? selection[0] : null
  const selectedComponent = selectedNode?.type === "componentInstance" ? components.find((c) => c.id === selectedNode.props.componentId) : null
  const selectedBlockDef = selectedNode ? BLOCK_REGISTRY.find((b) => b.type === selectedNode.type) : null
  const blocksByCategory = getBlocksByCategory()
  const viewportWidth = viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px"

  const isMulti = selection.length > 1
  const allSameType = selection.length > 0 && selection.every((n) => n.type === selection[0].type)

  const themeTokens = site.theme ? {
    primaryColor: site.theme.primaryColor,
    secondaryColor: site.theme.secondaryColor,
    accentColor: site.theme.accentColor,
    backgroundColor: site.theme.backgroundColor,
    surfaceColor: site.theme.surfaceColor,
    textColor: site.theme.textColor,
    mutedColor: site.theme.mutedColor,
    headingFont: site.theme.headingFont,
    bodyFont: site.theme.bodyFont,
    borderRadius: site.theme.borderRadius,
    buttonRadius: site.theme.buttonRadius,
    cardRadius: site.theme.cardRadius,
    buttonStyle: site.theme.buttonStyle,
    shadowStyle: site.theme.shadowStyle,
    containerWidth: site.theme.containerWidth,
  } : null

  useEffect(() => {
    if (isMulti && rightTab === "interaction") {
      setRightTab("style")
    }
  }, [isMulti, rightTab])

  useEffect(() => {
    if (!designOpen) return
    if (templates.length > 0) return
    startTransition(async () => {
      try {
        const list = await getTemplates()
        setTemplates((list as any) || [])
      } catch (e: any) {
        setTemplateError(e.message || "Failed to load templates")
      }
    })
  }, [designOpen, templates.length, startTransition])

  const templateCategories = useMemo(() => {
    const cats = new Set<string>()
    templates.forEach((t) => { if (t.category) cats.add(t.category) })
    return ["all", ...Array.from(cats)]
  }, [templates])

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (templateCategory !== "all" && t.category !== templateCategory) return false
      if (templateSearch) {
        const q = templateSearch.toLowerCase()
        if (!t.name.toLowerCase().includes(q) && !(t.description || "").toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [templates, templateCategory, templateSearch])

  async function confirmApplyTemplate() {
    if (!selectedTemplate) return
    setTemplateError("")
    startTransition(async () => {
      try {
        if (applyMode === "theme") {
          await applyTemplateThemeOnly(selectedTemplate.id)
        } else if (applyMode === "merge") {
          await applyTemplateMerge(selectedTemplate.id)
        } else {
          await applyTemplate(selectedTemplate.id)
        }
        setTemplateConfirmOpen(false)
        setDesignOpen(false)
        router.push("/dashboard/website-builder")
        router.refresh()
      } catch (e: any) {
        setTemplateError(e.message || "Failed to apply template")
      }
    })
  }

  function openTemplatePreview(t: TemplateData) {
    setTemplatePreview(t)
    setTemplatePreviewOpen(true)
  }

  function openTemplateApply(t: TemplateData) {
    setSelectedTemplate(t)
    setApplyMode("merge")
    setTemplateError("")
    setTemplateConfirmOpen(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* ── Top Toolbar ──────────────────────────────────── */}
      <div className="h-12 border-b flex items-center justify-between px-3 bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/dashboard/website-builder"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          {/* Quick Page Switch */}
          <Select
            value={page.id}
            onValueChange={(pageId) => {
              if (pageId !== page.id) router.push(`/dashboard/website-builder/editor/${pageId}`)
            }}
          >
            <SelectTrigger className="h-8 w-[180px] text-xs font-semibold border-0 bg-transparent hover:bg-muted">
              <SelectValue>{page.title}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(site.pages || []).map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  <span className="flex items-center gap-2">
                    {p.isHomepage && <span className="text-[9px] bg-primary/10 text-primary px-1 rounded">HOME</span>}
                    {p.title}
                    <span className="text-muted-foreground">/{p.slug}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isDirty && <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-200">Unsaved</Badge>}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={leftPanel ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setLeftPanel(leftPanel ? null : "insert")}
            title="Toggle left panel"
          >
            <PanelTop className="h-4 w-4" />
          </Button>
          <Button
            variant={rightPanel ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setRightPanel(rightPanel ? null : "inspector")}
            title="Toggle right panel"
          >
            <PanelBottom className="h-4 w-4" />
          </Button>
          <Button
            variant={designOpen ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setDesignOpen(true)}
            title="Design (Theme & Templates)"
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={historyIndex < 0} title="Undo (Ctrl+Z)">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={redoDepth <= 0} title="Redo (Ctrl+Shift+Z)">
            <Redo2 className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-5 mx-1" />
          {(["desktop", "tablet", "mobile"] as const).map((vp) => (
            <Button key={vp} variant={viewport === vp ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewport(vp)} title={vp}>
              {vp === "desktop" ? <Monitor className="h-4 w-4" /> : vp === "tablet" ? <Tablet className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
            </Button>
          ))}
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleGrid} title="Toggle Grid">
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={previewMode ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setPreviewMode(!previewMode)} title="Preview (Ctrl+P)">
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant={uiMode === "minimal" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setUiMode(uiMode === "minimal" ? "pro" : "minimal")}
            title={uiMode === "minimal" ? "Switch to pro mode" : "Switch to minimal mode"}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 ml-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(zoom - 0.1)} disabled={zoom <= 0.3}>
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-[10px] font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(zoom + 0.1)} disabled={zoom >= 2}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleSave} disabled={isPending || !isDirty}>
            <Save className="h-3.5 w-3.5" />
            {saveStatus === "saving" ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" className="h-8 gap-1" onClick={handlePublish} disabled={isPending}>
            <Rocket className="h-3.5 w-3.5" />
            Publish
          </Button>
        </div>
      </div>

      {/* ── Preview Mode Overlay ─────────────────────────── */}
      {previewMode && (
        <div className="flex-1 overflow-auto bg-white">
          <div className="mx-auto" style={{ width: viewportWidth, maxWidth: "100%" }}>
            <WBRenderer nodes={nodes} theme={themeTokens} components={components} cmsCollections={site.cmsCollections} menus={site.menus} viewport={viewport} />
          </div>
        </div>
      )}

      {/* ── Main Area ────────────────────────────────────── */}
      {!previewMode && (
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ─────────────────────────────────── */}
        {leftPanel && (
        <div className="w-64 border-r bg-card flex flex-col shrink-0">
          <div className="flex border-b">
            {(["insert", "layers", "pages", "components"] as const).map((tab) => (
              <button
                key={tab}
                className={`flex-1 py-2 text-xs font-semibold text-center transition-colors ${leftPanel === tab ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setLeftPanel(tab)}
              >
                {tab === "insert" && <LayoutGrid className="h-3.5 w-3.5 inline mr-1" />}
                {tab === "layers" && <Layers className="h-3.5 w-3.5 inline mr-1" />}
                {tab === "pages" && <FileText className="h-3.5 w-3.5 inline mr-1" />}
                {tab === "components" && <Box className="h-3.5 w-3.5 inline mr-1" />}
                {tab === "components" ? "Comps" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <ScrollArea className="flex-1">
            {leftPanel === "insert" && (
              <div className="p-3">
                <div className="space-y-3 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sections</p>
                  <div className="grid grid-cols-1 gap-2">
                    {SECTION_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        className="w-full flex flex-col gap-2 p-3 rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all text-left group"
                        onClick={() => {
                          const nodesWithIds = assignNewIds(tpl as any)
                          addNode(nodesWithIds)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-primary/10 text-primary">
                            <LayoutTemplate className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-semibold">{tpl.label}</span>
                        </div>
                        <div className="h-10 w-full bg-muted/30 rounded border border-dashed flex items-center justify-center">
                          <Plus className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary/30 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  {Object.entries(blocksByCategory).map(([category, blocks]) => (
                    <div key={category}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{category}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {blocks.map((block) => (
                          <button
                            key={block.type}
                            draggable
                            onDragStart={(e) => handleBlockDragStart(e, block.type)}
                            className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-all text-center group cursor-grab active:cursor-grabbing"
                            onClick={() => {
                              const node = createNode(block.type)
                              addNode(node)
                            }}
                          >
                            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors text-muted-foreground group-hover:text-primary">
                              {getBlockIcon(block.type)}
                            </div>
                            <span className="text-[10px] font-medium leading-tight">{block.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {leftPanel === "layers" && (
              <div className="p-2">
                {nodes.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No layers yet. Add blocks from the Blocks panel.</p>
                ) : (
                  <LayerTree
                    nodes={nodes}
                    selectedId={selectedNodeId}
                    onSelect={selectNode}
                    onRemove={removeNode}
                    onDuplicate={duplicateNode}
                    onToggleVisibility={(id) => updateNode(id, { hidden: !findNodeById(nodes, id)?.hidden })}
                    onReorder={(from, to) => reorderNodes(null, from, to)}
                    depth={0}
                  />
                )}
              </div>
            )}

            {leftPanel === "pages" && (
              <div className="p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Pages</p>
                {(site.pages || []).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { if (p.id !== page.id) router.push(`/dashboard/website-builder/editor/${p.id}`) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${p.id === page.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground"}`}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate flex-1 text-left">{p.title}</span>
                    {p.isHomepage && <Badge variant="outline" className="text-[9px] h-4 px-1">Home</Badge>}
                    <Badge variant="outline" className={`text-[9px] h-4 px-1 ${p.status === "PUBLISHED" ? "bg-green-500/10 text-green-700 border-green-200" : ""}`}>
                      {p.status === "PUBLISHED" ? "Live" : "Draft"}
                    </Badge>
                  </button>
                ))}
                <Separator className="my-2" />
                <Button variant="outline" size="sm" className="w-full text-xs gap-1" asChild>
                  <Link href="/dashboard/website-builder"><ArrowLeft className="h-3 w-3" /> Back to Dashboard</Link>
                </Button>
              </div>
            )}

            {leftPanel === "components" && (
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Components</p>
                  {selectedNodeId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1"
                      onClick={() => openCreateComponentDialog(selectedNodeId)}
                    >
                      <PlusCircle className="h-3 w-3" /> Create
                    </Button>
                  )}
                </div>
                {components.length === 0 ? (
                  <div className="text-center py-8">
                    <Box className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">No components yet.</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Select a block and click Create to save it as a reusable component.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {components.map((comp) => (
                      <div key={comp.id} className="flex items-center gap-2 px-2 py-2 rounded-lg border hover:bg-muted/50 transition-colors group">
                        <Box className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-xs font-medium flex-1 truncate">{comp.name}</span>
                        <div className="hidden group-hover:flex items-center gap-0.5">
                          <button
                            className="p-0.5 rounded hover:bg-primary/10 text-primary"
                            onClick={() => insertComponent(comp.id)}
                            title="Insert"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            className="p-0.5 rounded hover:bg-destructive/10 text-destructive"
                            onClick={async () => {
                              if (componentActionPending) return
                              setComponentActionPending(true)
                              try {
                                await deleteReusableComponentAction(comp.id)
                                setComponents(components.filter((c) => c.id !== comp.id))
                              } catch (e: any) {
                                alert(e.message || "Failed to delete component")
                              } finally {
                                setComponentActionPending(false)
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
        )}

        {/* ── Canvas ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb bar */}
          {selectedNodeId && (
            <div className="h-7 border-b bg-card/80 flex items-center gap-1 px-3 shrink-0 overflow-x-auto">
              <button className="text-[10px] text-muted-foreground hover:text-foreground" onClick={() => selectNode(null)}>Page</button>
              {getNodePath(nodes, selectedNodeId).map((n, i, arr) => (
                <span key={n.id} className="flex items-center gap-1">
                  <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/50" />
                  <button
                    className={`text-[10px] font-medium px-1 py-0.5 rounded transition-colors ${n.id === selectedNodeId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    onClick={() => selectNode(n.id)}
                  >
                    {BLOCK_REGISTRY.find((b) => b.type === n.type)?.label || n.type}
                  </button>
                </span>
              ))}
            </div>
          )}

          <div
            ref={canvasRef}
            className="flex-1 overflow-auto bg-muted/30 flex justify-center p-6"
            onClick={() => { selectNode(null); setCtxMenu(null) }}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
          >
            <div
              className="bg-white shadow-xl rounded-lg transition-all relative"
              style={{
                width: viewportWidth,
                maxWidth: "100%",
                minHeight: "600px",
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
              }}
            >
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none z-10" style={{
                  backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }} />
              )}
              {/* Snap guides overlay */}
              {snapGuides.length > 0 && (
                <div className="absolute inset-0 pointer-events-none z-30">
                  {snapGuides.map((g, i) =>
                    g.type === "vertical" ? (
                      <div key={i} className="absolute top-0 bottom-0" style={{ left: g.position, width: 1, backgroundColor: "#f43f5e" }} />
                    ) : (
                      <div key={i} className="absolute left-0 right-0" style={{ top: g.position, height: 1, backgroundColor: "#f43f5e" }}>
                        {g.label && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] bg-rose-500 text-white px-1 rounded">{g.label}</span>}
                      </div>
                    )
                  )}
                </div>
              )}
              {nodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground border-2 border-dashed border-muted rounded-lg m-4">
                  <LayoutGrid className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-sm font-medium">Empty page</p>
                  <p className="text-xs mt-1 mb-4">Drag blocks from the left panel or click to add</p>
                  <Button variant="outline" size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); addNode(createNode("hero")) }}>
                    <Plus className="h-3.5 w-3.5" /> Add Hero Section
                  </Button>
                </div>
              ) : (
                <WBRenderer
                  nodes={nodes}
                  theme={themeTokens}
                  components={components}
                  cmsCollections={site.cmsCollections}
                  menus={site.menus}
                  isEditor={true}
                  viewport={viewport}
                  onNodeClick={(id, shiftKey) => { if (shiftKey) { toggleSelectNode(id) } else { selectNode(id) }; setCtxMenu(null) }}
                  onNodeHover={hoverNode}
                  selectedNodeId={selectedNodeId}
                  multiSelectedIds={multiSelectedIds}
                  hoveredNodeId={hoveredNodeId}
                  onNodeContextMenu={(id, x, y) => { 
                    if (!multiSelectedIds.has(id)) {
                      selectNode(id) 
                    }
                    setCtxMenu({ x, y, nodeId: id }) 
                  }}
                  onNodeDoubleClick={(id) => {
                    const node = findNodeById(nodes, id)
                    if (node && (node.type === "heading" || node.type === "paragraph" || node.type === "button")) {
                      setInlineEditId(id)
                      setInlineEditPropKey("text")
                      setInlineEditValue(node.props.text || "")
                    }
                  }}
                  inlineEditId={inlineEditId}
                  inlineEditPropKey={inlineEditPropKey}
                  inlineEditValue={inlineEditValue}
                  onInlineEditChange={(val) => setInlineEditValue(val)}
                  onRequestInlineEdit={(nodeId, propKey, initialValue) => {
                    setInlineEditId(nodeId)
                    setInlineEditPropKey(propKey)
                    setInlineEditValue(initialValue)
                  }}
                  onInlineEditBlur={() => {
                    if (inlineEditId) {
                      updateNodeProps(inlineEditId, { [inlineEditPropKey || "text"]: inlineEditValue })
                      setInlineEditId(null)
                      setInlineEditPropKey(null)
                    }
                  }}
                  onInsertAt={(index) => {
                    const node = createNode("section")
                    addNode(node, undefined, index)
                  }}
                  onDragReorder={(fromId, toIndex) => {
                    if (!fromId) return
                    const fromIdx = nodes.findIndex((n) => n.id === fromId)
                    if (fromIdx >= 0 && fromIdx !== toIndex) {
                      reorderNodes(null, fromIdx, toIndex > fromIdx ? toIndex - 1 : toIndex)
                    }
                  }}
                  onUpdateItemField={(nodeId, fieldName, itemIndex, key, value) => {
                    const node = findNodeById(nodes, nodeId)
                    if (!node) return
                    const arr = Array.isArray(node.props[fieldName]) ? [...node.props[fieldName]] : []
                    if (arr[itemIndex]) {
                      arr[itemIndex] = { ...arr[itemIndex], [key]: value }
                      updateNodeProps(nodeId, { [fieldName]: arr })
                    }
                  }}
                />
              )}
            </div>

            {/* ── Breadcrumbs ─────────────────────────────────── */}
            {selectedNode && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
                <NodeBreadcrumbs node={selectedNode} nodes={nodes} onSelect={selectNode} />
              </div>
            )}
          </div>

          {/* ── Right-Click Context Menu ──────────────────── */}
          {ctxMenu && (
            <div
              className="fixed z-[100] bg-popover border rounded-lg shadow-xl py-1 min-w-[180px] animate-in fade-in-0 zoom-in-95"
              style={{ left: ctxMenu.x, top: ctxMenu.y }}
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { label: "Copy", icon: <Copy className="h-3.5 w-3.5" />, shortcut: "Ctrl+C", action: () => { if (ctxMenu.nodeId) copyNode(ctxMenu.nodeId) } },
                { label: "Paste", icon: <ClipboardList className="h-3.5 w-3.5" />, shortcut: "Ctrl+V", action: () => { pasteNode(ctxMenu.nodeId) } }, // Paste inside
                { label: "Duplicate", icon: <Copy className="h-3.5 w-3.5" />, shortcut: "Ctrl+D", action: () => duplicateNode(ctxMenu.nodeId) },
                { label: "divider" },
                { label: "Copy Styles", icon: <Paintbrush className="h-3.5 w-3.5" />, shortcut: "Ctrl+Alt+C", action: () => copyStyles(ctxMenu.nodeId) },
                { label: "Paste Styles", icon: <Paintbrush className="h-3.5 w-3.5" />, shortcut: "Ctrl+Alt+V", action: () => pasteStyles(multiSelectedIds.size > 0 ? multiSelectedIds : new Set([ctxMenu.nodeId])), disabled: !styleClipboard },
                { label: "divider" },
                { label: "Move Up", icon: <ChevronUp className="h-3.5 w-3.5" />, shortcut: "Alt+↑", action: () => { const idx = nodes.findIndex((n) => n.id === ctxMenu.nodeId); if (idx > 0) reorderNodes(null, idx, idx - 1) } },
                { label: "Move Down", icon: <ChevronDown className="h-3.5 w-3.5" />, shortcut: "Alt+↓", action: () => { const idx = nodes.findIndex((n) => n.id === ctxMenu.nodeId); if (idx >= 0 && idx < nodes.length - 1) reorderNodes(null, idx, idx + 1) } },
                { label: "divider" },
                { 
                  label: "Wrap in Stack", icon: <Layers className="h-3.5 w-3.5" />, action: () => {
                    const ids = multiSelectedIds.size > 0 ? multiSelectedIds : new Set([ctxMenu.nodeId])
                    wrapInStack(ids)
                  }
                },
                {
                  label: "Wrap in Section", icon: <LayoutTemplate className="h-3.5 w-3.5" />, action: () => {
                    const node = findNodeById(nodes, ctxMenu.nodeId)
                    if (!node) return
                    const wrapper = createNode("section")
                    wrapper.children = [{ ...node }]
                    const idx = nodes.findIndex((n) => n.id === ctxMenu.nodeId)
                    if (idx >= 0) {
                      pushHistory()
                      const newNodes = [...nodes]
                      newNodes[idx] = wrapper
                      setNodes(newNodes)
                      selectNode(wrapper.id)
                    }
                  }
                },
                {
                  label: "Wrap in Container", icon: <Box className="h-3.5 w-3.5" />, action: () => {
                    const node = findNodeById(nodes, ctxMenu.nodeId)
                    if (!node) return
                    const wrapper = createNode("container")
                    wrapper.children = [{ ...node }]
                    const idx = nodes.findIndex((n) => n.id === ctxMenu.nodeId)
                    if (idx >= 0) {
                      pushHistory()
                      const newNodes = [...nodes]
                      newNodes[idx] = wrapper
                      setNodes(newNodes)
                      selectNode(wrapper.id)
                    }
                  }
                },
                { label: "divider" },
                {
                  label: "Save as Component", icon: <Box className="h-3.5 w-3.5" />, action: () => {
                    openCreateComponentDialog(ctxMenu.nodeId)
                  }
                },
                { label: "divider" },
                { label: "Hide", icon: <EyeOff className="h-3.5 w-3.5" />, action: () => updateNode(ctxMenu.nodeId, { hidden: true }) },
                { 
                  label: "Delete", 
                  icon: <Trash2 className="h-3.5 w-3.5" />, 
                  shortcut: "Del", 
                  action: () => {
                    if (multiSelectedIds.has(ctxMenu.nodeId)) {
                      multiSelectedIds.forEach((id) => removeNode(id))
                      clearMultiSelect()
                    } else {
                      removeNode(ctxMenu.nodeId)
                    }
                  }, 
                  danger: true 
                },
              ].map((item, i) =>
                item.label === "divider" ? (
                  <div key={i} className="h-px bg-border my-1" />
                ) : (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-colors ${(item as any).danger ? "text-destructive hover:bg-destructive/10" : "hover:bg-muted"} ${(item as any).disabled ? "opacity-30 pointer-events-none" : ""}`}
                    onClick={() => { (item as any).action?.(); setCtxMenu(null) }}
                  >
                    {(item as any).icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    {(item as any).shortcut && <span className="text-[10px] text-muted-foreground">{(item as any).shortcut}</span>}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* ── Right Panel (Inspector) ────────────────────── */}
        {rightPanel && (
        <div className="w-80 border-l bg-card flex flex-col shrink-0">
          <div className="flex border-b">
            <button
              className={`flex-1 py-2 text-xs font-semibold text-center transition-colors ${rightPanel === "inspector" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setRightPanel("inspector")}
            >
              <Settings2 className="h-3.5 w-3.5 inline mr-1" />
              Inspector
            </button>
            <button
              className={`flex-1 py-2 text-xs font-semibold text-center transition-colors ${rightPanel === "theme" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setRightPanel("theme")}
            >
              <Paintbrush className="h-3.5 w-3.5 inline mr-1" />
              Theme
            </button>
          </div>

          <ScrollArea className="flex-1">
            {rightPanel === "inspector" && (
              <div className="p-3">
                {selection.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">Select a block to edit its properties</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Block header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center text-primary">
                          {isMulti ? <Layers className="h-4 w-4" /> : getBlockIcon(selection[0].type)}
                        </div>
                        <div>
                          <p className="text-xs font-bold">
                            {isMulti ? `${selection.length} items selected` : (selectedBlockDef?.label || selection[0].type)}
                          </p>
                          {isMulti && allSameType && <p className="text-[10px] text-muted-foreground">All {selectedBlockDef?.label || selection[0].type}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!isMulti && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateNode(selection[0].id)} title="Duplicate">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { selection.forEach(n => removeNode(n.id)); clearMultiSelect() }} title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Props / Style / Interaction tabs */}
                    <div className="flex border rounded-lg overflow-hidden bg-muted/30 p-1 gap-1">
                      {(["props", "style", "interaction", "vars"] as const).map((tab) => (
                        <button
                          key={tab}
                          disabled={(tab === "interaction" || tab === "vars") && isMulti}
                          className={`flex-1 py-1 text-[10px] font-semibold rounded-md transition-all ${rightTab === tab ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"} ${(tab === "interaction" || tab === "vars") && isMulti ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={() => setRightTab(tab)}
                        >
                          {tab === "props" ? "Content" : tab === "vars" ? "Vars" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    {rightTab === "props" && (
                      <div className="space-y-4">
                        {isMulti && !allSameType ? (
                          <div className="text-center py-8 bg-muted/20 rounded-lg">
                            <Layers className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                            <p className="text-xs text-muted-foreground">Multiple block types selected.</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Select items of the same type to edit content, or switch to Style tab.</p>
                          </div>
                        ) : (
                          <>
                            {(() => {
                              // Use first node as reference for schema and values
                              const primaryNode = selection[0]
                              const primaryBlockDef = BLOCK_REGISTRY.find((b) => b.type === primaryNode.type)
                              const schema = primaryBlockDef?.propSchema.filter((f) => f.type !== "json") || []
                              const groups: Record<string, typeof schema> = {}
                              schema.forEach((f) => {
                                const g = f.group || "Content"
                                if (!groups[g]) groups[g] = []
                                groups[g].push(f)
                              })

                              return Object.entries(groups).map(([groupName, fields]) => (
                                <details key={groupName} className="group/section overflow-hidden rounded-lg border bg-muted/10" open>
                                  <summary className="flex items-center justify-between px-3 py-2 cursor-pointer bg-muted/20 hover:bg-muted/30 transition-colors list-none [&::-webkit-details-marker]:hidden">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{groupName}</span>
                                    <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-open/section:rotate-180" />
                                  </summary>
                                  <div className="p-3 space-y-3">
                                    {fields.map((field) => (
                                      <PropField
                                        key={field.name}
                                        field={field}
                                        value={primaryNode.props[field.name]}
                                        onChange={(v) => {
                                          if (isMulti) {
                                            updateNodesProps(new Set(selection.map(n => n.id)), { [field.name]: v })
                                          } else {
                                            updateNodeProps(primaryNode.id, { [field.name]: v })
                                          }
                                        }}
                                      />
                                    ))}
                                  </div>
                                </details>
                              ))
                            })()}
                            
                            {/* Component Variant Picker */}
                            {!isMulti && selection[0].type === "componentInstance" && selectedComponent?.variants?.length ? (
                              <div className="space-y-2 rounded-lg border p-2.5 bg-violet-500/5">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Variant</p>
                                <Select
                                  value={selection[0].props?._variantId || "default"}
                                  onValueChange={(v) => updateNodeProps(selection[0].id, { _variantId: v === "default" ? "" : v })}
                                >
                                  <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="default" className="text-xs">Default</SelectItem>
                                    {selectedComponent.variants.map((variant) => (
                                      <SelectItem key={variant.id} value={variant.id} className="text-xs">
                                        {variant.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : null}

                            {/* Component Instance Overrides - Only showing for single selection for now or strictly same component */}
                            {!isMulti && selection[0].type === "componentInstance" && (
                              <div className="space-y-2 rounded-lg border p-2.5 bg-muted/20">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Instance Overrides</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {selectedComponent ? `Linked to ${selectedComponent.name}` : "Component source not found"}
                                </p>
                                {selectedComponent?.editableFields?.length ? (
                                  <div className="space-y-2">
                                    {selectedComponent.editableFields.map((field) => {
                                      const currentOverrides = selection[0].props?.overrides && typeof selection[0].props.overrides === "object"
                                        ? selection[0].props.overrides
                                        : {}
                                      const value = currentOverrides[field.key] ?? field.defaultValue ?? ""
                                      return (
                                        <div key={field.key} className="space-y-1">
                                          <Label className="text-[10px]">{field.label}</Label>
                                          <Input
                                            value={value}
                                            onChange={(e) => {
                                              updateNodeProps(selection[0].id, {
                                                overrides: {
                                                  ...currentOverrides,
                                                  [field.key]: e.target.value,
                                                },
                                              })
                                            }}
                                            className="h-8 text-xs"
                                          />
                                        </div>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">No editable fields exposed for this component.</p>
                                )}
                              </div>
                            )}

                            {/* User-friendly JSON editors for items/members/etc */}
                            {(() => {
                               const primaryNode = selection[0]
                               const primaryBlockDef = BLOCK_REGISTRY.find((b) => b.type === primaryNode.type)
                               return primaryBlockDef?.propSchema
                                .filter((f) => f.type === "json")
                                .map((field) => (
                                  <ItemListEditor
                                    key={field.name}
                                    label={field.label}
                                    nodeType={primaryNode.type}
                                    fieldName={field.name}
                                    items={primaryNode.props[field.name] || []}
                                    onChange={(v) => {
                                      if (isMulti) {
                                         updateNodesProps(new Set(selection.map(n => n.id)), { [field.name]: v })
                                      } else {
                                         updateNodeProps(primaryNode.id, { [field.name]: v })
                                      }
                                    }}
                                  />
                                ))
                            })()}

                            {/* CMS Binding - Only for single selection */}
                            {!isMulti && (
                              (() => {
                                const primaryNode = selection[0]
                                const primaryBlockDef = BLOCK_REGISTRY.find((b) => b.type === primaryNode.type)
                                if (primaryBlockDef?.propSchema.some((f) => f.type === "json") && (site.cmsCollections?.length ?? 0) > 0) {
                                  return (
                                    <CmsBindingEditor
                                      node={primaryNode}
                                      collections={site.cmsCollections!}
                                      onUpdateProps={(props) => updateNodeProps(primaryNode.id, props)}
                                    />
                                  )
                                }
                                return null
                              })()
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {rightTab === "style" && (
                      <StyleEditor
                        nodes={selection}
                        theme={themeTokens}
                        viewport={viewport}
                        onUpdateProps={(props) => {
                          if (selection.length > 1) {
                            updateNodesProps(new Set(selection.map((n) => n.id)), props)
                          } else {
                            updateNodeProps(selection[0].id, props)
                          }
                        }}
                        onUpdateStyles={(styles) => {
                          if (selection.length > 1) {
                            updateNodesStyles(new Set(selection.map((n) => n.id)), styles)
                          } else {
                            updateNodeStyles(selection[0].id, styles)
                          }
                        }}
                      />
                    )}

                    {rightTab === "interaction" && selectedNode && (
                      <InteractionEditor
                        node={selectedNode}
                        onUpdateProps={(props) => updateNodeProps(selectedNode.id, props)}
                      />
                    )}

                    {rightTab === "vars" && selectedNode && (
                      <VariablesEditor
                        node={selectedNode}
                        viewport={viewport}
                        onUpdate={(vars) => updateNode(selectedNode.id, { variables: vars })}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {rightPanel === "theme" && (
              <div className="p-3 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Site Theme</p>
                {themeTokens ? (
                  <div className="space-y-3">
                    {[
                      { label: "Primary", key: "primaryColor" },
                      { label: "Secondary", key: "secondaryColor" },
                      { label: "Accent", key: "accentColor" },
                      { label: "Background", key: "backgroundColor" },
                      { label: "Text", key: "textColor" },
                    ].map((c) => (
                      <div key={c.key} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded border" style={{ backgroundColor: (themeTokens as any)[c.key] }} />
                        <span className="text-xs flex-1">{c.label}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{(themeTokens as any)[c.key]}</span>
                      </div>
                    ))}
                    <Separator />
                    <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                      <Link href="/dashboard/website-builder/theme">Edit Theme →</Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Using default theme</p>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
        )}

      </div>
      )}

      <Dialog open={designOpen} onOpenChange={setDesignOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> Design</DialogTitle>
            <DialogDescription>Theme and templates, without leaving the editor.</DialogDescription>
          </DialogHeader>
          <Tabs value={designTab} onValueChange={(v) => setDesignTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="theme" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold flex items-center gap-2"><Paintbrush className="h-4 w-4" /> Current Theme</div>
                    <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                      <Link href="/dashboard/website-builder/theme">Edit Theme</Link>
                    </Button>
                  </div>
                  {themeTokens ? (
                    <div className="space-y-2">
                      {[
                        { label: "Primary", key: "primaryColor" },
                        { label: "Secondary", key: "secondaryColor" },
                        { label: "Accent", key: "accentColor" },
                        { label: "Background", key: "backgroundColor" },
                        { label: "Text", key: "textColor" },
                      ].map((c) => (
                        <div key={c.key} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded border" style={{ backgroundColor: (themeTokens as any)[c.key] }} />
                          <span className="text-xs flex-1">{c.label}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{(themeTokens as any)[c.key]}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Using default theme</p>
                  )}
                </div>
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="text-sm font-semibold flex items-center gap-2"><LayoutTemplate className="h-4 w-4" /> Templates</div>
                  <p className="text-xs text-muted-foreground">Apply a full template, merge in missing pages, or apply theme-only.</p>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDesignTab("templates")}>Browse Templates</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="templates" className="mt-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} placeholder="Search templates..." className="pl-9" />
                </div>
                <Select value={templateCategory} onValueChange={setTemplateCategory}>
                  <SelectTrigger className="h-9 w-[220px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.map((c) => (
                      <SelectItem key={c} value={c}>{c === "all" ? "All" : c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {templateError && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 mt-3">{templateError}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {filteredTemplates.map((t) => (
                  <div key={t.id} className="rounded-xl border overflow-hidden bg-card">
                    <div className="aspect-video bg-muted/20 relative overflow-hidden">
                      {t.thumbnail ? (
                        <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <LayoutTemplate className="h-10 w-10 opacity-30" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                        <Button size="sm" variant="secondary" className="gap-1" onClick={() => openTemplatePreview(t)}>
                          <Eye className="h-3.5 w-3.5" /> Preview
                        </Button>
                        <Button size="sm" className="gap-1" onClick={() => openTemplateApply(t)}>
                          <Download className="h-3.5 w-3.5" /> Use
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{t.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">{t.mode === "PORTAL_ONLY" ? "Portal" : "Full"}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
                        {t.isDefault && <Badge variant="outline" className="text-[10px]">Recommended</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredTemplates.length === 0 && (
                <div className="text-center py-10 text-sm text-muted-foreground">No templates match your filters.</div>
              )}
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDesignOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templatePreviewOpen} onOpenChange={setTemplatePreviewOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{templatePreview?.name || "Template Preview"}</DialogTitle>
            <DialogDescription>{templatePreview?.description || ""}</DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden bg-muted/20">
            <div className="aspect-[16/9] w-full overflow-auto">
              {templatePreview ? (
                (() => {
                  const pages = typeof templatePreview.pages === "string" ? JSON.parse(templatePreview.pages) : templatePreview.pages
                  const themeRaw = typeof templatePreview.theme === "string" ? JSON.parse(templatePreview.theme) : templatePreview.theme
                  const theme: WBThemeTokens | null = themeRaw ? {
                    primaryColor: themeRaw.primaryColor || "#2563eb",
                    secondaryColor: themeRaw.secondaryColor || "#7c3aed",
                    accentColor: themeRaw.accentColor || "#f59e0b",
                    backgroundColor: themeRaw.backgroundColor || "#ffffff",
                    surfaceColor: themeRaw.surfaceColor || "#f8fafc",
                    textColor: themeRaw.textColor || "#0f172a",
                    mutedColor: themeRaw.mutedColor || "#64748b",
                    headingFont: themeRaw.headingFont || "Inter",
                    bodyFont: themeRaw.bodyFont || "Inter",
                    borderRadius: themeRaw.borderRadius || "0.5rem",
                    buttonRadius: themeRaw.buttonRadius || "0.375rem",
                    cardRadius: themeRaw.cardRadius || "0.75rem",
                    buttonStyle: themeRaw.buttonStyle || "filled",
                    shadowStyle: themeRaw.shadowStyle || "md",
                    containerWidth: themeRaw.containerWidth || "1280px",
                  } : null
                  const firstPage = Array.isArray(pages) ? pages[0] : null
                  const nodes: WBNode[] = firstPage?.content
                    ? (typeof firstPage.content === "string" ? JSON.parse(firstPage.content) : firstPage.content)
                    : []
                  if (nodes.length === 0) return null
                  return (
                    <div className="w-full h-full overflow-hidden relative">
                      <div className="origin-top-left pointer-events-none select-none" style={{ width: "1280px", transform: "scale(0.28)", transformOrigin: "top left" }}>
                        <WBRenderer nodes={nodes} theme={theme} />
                      </div>
                    </div>
                  )
                })()
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplatePreviewOpen(false)}>Close</Button>
            <Button
              onClick={() => {
                if (!templatePreview) return
                setTemplatePreviewOpen(false)
                openTemplateApply(templatePreview)
              }}
            >
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateConfirmOpen} onOpenChange={setTemplateConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Apply Template</DialogTitle>
            <DialogDescription>Choose how to apply <strong>{selectedTemplate?.name}</strong>.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Apply Mode</p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                className={`text-left rounded-lg border px-3 py-2 text-xs transition-colors ${applyMode === "merge" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                onClick={() => setApplyMode("merge")}
              >
                <div className="font-semibold">Merge (Recommended)</div>
                <div className="text-muted-foreground">Apply theme and create only missing pages. Existing content is preserved.</div>
              </button>
              <button
                type="button"
                className={`text-left rounded-lg border px-3 py-2 text-xs transition-colors ${applyMode === "theme" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                onClick={() => setApplyMode("theme")}
              >
                <div className="font-semibold">Theme Only</div>
                <div className="text-muted-foreground">Apply colors, typography, and tokens without touching page content.</div>
              </button>
              <button
                type="button"
                className={`text-left rounded-lg border px-3 py-2 text-xs transition-colors ${applyMode === "replace" ? "border-destructive bg-destructive/5" : "hover:bg-muted/50"}`}
                onClick={() => setApplyMode("replace")}
              >
                <div className="font-semibold text-destructive">Replace (Destructive)</div>
                <div className="text-muted-foreground">Replace all non-locked pages with template pages.</div>
              </button>
            </div>
          </div>
          {templateError && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{templateError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmApplyTemplate} disabled={isPending}>
              {isPending ? "Applying..." : "Apply Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Command Palette (Cmd+K) ──────────────────────── */}
      {cmdPaletteOpen && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh]" onClick={() => { setCmdPaletteOpen(false); setCmdQuery("") }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-popover border rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-4 py-3 border-b">
              <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              <input
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Search pages, blocks, actions..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
              <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">ESC</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-1">
              {/* Pages */}
              {site.pages && site.pages.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1.5">Pages</p>
                  {site.pages
                    .filter((pg) => !cmdQuery || pg.title.toLowerCase().includes(cmdQuery.toLowerCase()) || pg.slug.toLowerCase().includes(cmdQuery.toLowerCase()))
                    .map((pg) => (
                      <button
                        key={pg.id}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-muted ${pg.id === page.id ? "bg-primary/10 text-primary" : ""}`}
                        onClick={() => { setCmdPaletteOpen(false); setCmdQuery(""); if (pg.id !== page.id) router.push(`/dashboard/website-builder/editor/${pg.id}`) }}
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1 text-left truncate">{pg.title}</span>
                        <span className="text-[10px] text-muted-foreground">/{pg.slug}</span>
                        {pg.isHomepage && <Badge variant="secondary" className="text-[9px] h-4 px-1">Home</Badge>}
                      </button>
                    ))}
                </div>
              )}

              {/* Quick Actions */}
              {(!cmdQuery || "add block insert section".includes(cmdQuery.toLowerCase())) && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1.5 mt-1">Quick Actions</p>
                  {[
                    { label: "Add Hero Section", action: () => addNode(createNode("hero")), icon: <Sparkles className="h-3.5 w-3.5" /> },
                    { label: "Add Section", action: () => addNode(createNode("section")), icon: <LayoutTemplate className="h-3.5 w-3.5" /> },
                    { label: "Add Heading", action: () => addNode(createNode("heading")), icon: <Type className="h-3.5 w-3.5" /> },
                    { label: "Add Paragraph", action: () => addNode(createNode("paragraph")), icon: <AlignLeft className="h-3.5 w-3.5" /> },
                    { label: "Add Button", action: () => addNode(createNode("button")), icon: <MousePointerClick className="h-3.5 w-3.5" /> },
                    { label: "Add Features Grid", action: () => addNode(createNode("features")), icon: <Grid3X3 className="h-3.5 w-3.5" /> },
                    { label: "Add FAQ", action: () => addNode(createNode("faq")), icon: <HelpCircle className="h-3.5 w-3.5" /> },
                    { label: "Add Contact", action: () => addNode(createNode("contact")), icon: <MapPin className="h-3.5 w-3.5" /> },
                  ]
                    .filter((a) => !cmdQuery || a.label.toLowerCase().includes(cmdQuery.toLowerCase()))
                    .map((a) => (
                      <button
                        key={a.label}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-muted"
                        onClick={() => { a.action(); setCmdPaletteOpen(false); setCmdQuery("") }}
                      >
                        {a.icon}
                        <span className="flex-1 text-left">{a.label}</span>
                      </button>
                    ))}
                </div>
              )}

              {/* Editor Commands */}
              {(!cmdQuery || "undo redo save preview grid zoom".includes(cmdQuery.toLowerCase())) && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1.5 mt-1">Commands</p>
                  {[
                    { label: "Undo", action: () => undo(), shortcut: "Ctrl+Z" },
                    { label: "Redo", action: () => redo(), shortcut: "Ctrl+Shift+Z" },
                    { label: "Save", action: () => handleSave(), shortcut: "Ctrl+S" },
                    { label: "Toggle Preview", action: () => setPreviewMode((v) => !v), shortcut: "Ctrl+P" },
                    { label: "Toggle Grid", action: () => toggleGrid(), shortcut: "" },
                    { label: "Desktop View", action: () => setViewport("desktop"), shortcut: "" },
                    { label: "Tablet View", action: () => setViewport("tablet"), shortcut: "" },
                    { label: "Mobile View", action: () => setViewport("mobile"), shortcut: "" },
                  ]
                    .filter((a) => !cmdQuery || a.label.toLowerCase().includes(cmdQuery.toLowerCase()))
                    .map((a) => (
                      <button
                        key={a.label}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-muted"
                        onClick={() => { a.action(); setCmdPaletteOpen(false); setCmdQuery("") }}
                      >
                        <span className="flex-1 text-left">{a.label}</span>
                        {a.shortcut && <span className="text-[10px] text-muted-foreground">{a.shortcut}</span>}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Create Reusable Component Dialog ─────────────── */}
      <Dialog open={createComponentOpen} onOpenChange={setCreateComponentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Box className="h-4 w-4 text-primary" /> Create Component</DialogTitle>
            <DialogDescription>Save the selected block as a reusable component.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Name</Label>
            <Input
              value={createComponentName}
              onChange={(e) => setCreateComponentName(e.target.value)}
              placeholder="e.g. Hero Banner"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateComponentOpen(false)}>Cancel</Button>
            <Button
              disabled={componentActionPending}
              onClick={() => {
                if (!createComponentNodeId || !createComponentName.trim()) return
                const node = findNodeById(nodes, createComponentNodeId)
                if (!node) return
                setComponentActionPending(true)
                startTransition(async () => {
                  try {
                    const created = await createReusableComponentAction({
                      name: createComponentName.trim(),
                      sourceNodes: [node],
                    })
                    setComponents([created, ...components.filter((c) => c.id !== created.id)])
                    setCreateComponentOpen(false)
                    setLeftPanel("components")
                  } catch (e: any) {
                    alert(e.message || "Failed to create component")
                  } finally {
                    setComponentActionPending(false)
                  }
                })
              }}
            >
              {componentActionPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Icon Picker ──────────────────────────────────────
const POPULAR_ICONS = [
  "Star", "Shield", "Zap", "Heart", "Users", "Briefcase", "Globe", "Award",
  "Scale", "BookOpen", "GraduationCap", "Code", "Terminal", "Cpu", "Rocket",
  "Palette", "Music", "Video", "Camera", "Mic", "Headphones", "Dumbbell",
  "Target", "Flag", "MapPin", "Clock", "Calendar", "Mail", "Phone", "MessageSquare",
  "Check", "X", "Plus", "Minus", "Info", "HelpCircle", "AlertTriangle", "ShieldAlert",
  "Search", "Menu", "Settings", "Bell", "User", "LogOut", "Layout", "Box",
  "Layers", "Grid", "List", "FileText", "CreditCard", "ShoppingCart", "DollarSign",
  "TrendingUp", "Activity", "Sun", "Moon", "Cloud", "Leaf", "Anchor", "Coffee",
]

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredIcons = search
    ? Object.keys(Icons).filter(name => name.toLowerCase().includes(search.toLowerCase())).slice(0, 100)
    : POPULAR_ICONS

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setIsOpen(true)}>
          {value ? React.createElement((Icons as any)[value] || Icons.HelpCircle, { className: "h-4 w-4" }) : <Plus className="h-3 w-3" />}
        </Button>
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-[10px] flex-1"
          placeholder="Icon name..."
        />
      </div>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Icon</DialogTitle>
          <DialogDescription>Search from over 1,000 Lucide icons.</DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-6 gap-2">
            {filteredIcons.map((name) => {
              const Icon = (Icons as any)[name]
              if (!Icon) return null
              return (
                <button
                  key={name}
                  onClick={() => { onChange(name); setIsOpen(false) }}
                  className={`flex flex-col items-center justify-center p-2 rounded-md hover:bg-muted border transition-colors ${value === name ? "border-primary bg-primary/5" : "border-transparent"}`}
                  title={name}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-[10px] truncate w-full text-center">{name}</span>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

// ── PropField Component ─────────────────────────────
function PropField({ field, value, onChange }: { field: any; value: any; onChange: (v: any) => void }) {
  switch (field.type) {
    case "text":
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs" />
        </div>
      )
    case "textarea":
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 text-xs rounded-md border bg-background resize-y min-h-[60px]" />
        </div>
      )
    case "richtext":
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 text-xs rounded-md border bg-background resize-y min-h-[60px]" />
        </div>
      )
    case "number":
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <Input type="number" value={value || 0} onChange={(e) => onChange(parseInt(e.target.value) || 0)} className="h-8 text-xs" />
        </div>
      )
    case "color":
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <div className="flex gap-2">
            <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-8 w-8 rounded border cursor-pointer" />
            <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs flex-1" placeholder="transparent" />
          </div>
        </div>
      )
    case "select":
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {field.options?.map((opt: any) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    case "boolean":
      return (
        <div className="flex items-center justify-between">
          <Label className="text-xs">{field.label}</Label>
          <Switch checked={!!value} onCheckedChange={onChange} />
        </div>
      )
    case "image":
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs" placeholder="Image URL" />
          {value && <img src={value} alt="" className="w-full h-20 object-cover rounded border mt-1" />}
        </div>
      )
    case "url":
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs" placeholder="https://..." />
        </div>
      )
    case "alignment":
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <div className="flex gap-1">
            {[{ v: "left", icon: <AlignLeft className="h-3.5 w-3.5" /> }, { v: "center", icon: <AlignCenter className="h-3.5 w-3.5" /> }, { v: "right", icon: <AlignRight className="h-3.5 w-3.5" /> }].map((a) => (
              <Button key={a.v} variant={value === a.v ? "secondary" : "ghost"} size="sm" className="h-8 flex-1 border" onClick={() => onChange(a.v)}>
                {a.icon}
              </Button>
            ))}
          </div>
        </div>
      )
    case "icon":
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <IconPicker value={value} onChange={onChange} />
        </div>
      )
    default:
      return null
  }
}

// ── User-friendly Item List Editor (replaces JSON textarea) ──
function ItemListEditor({ label, nodeType, fieldName, items, onChange }: {
  label: string; nodeType: string; fieldName: string; items: any[]; onChange: (v: any[]) => void
}) {
  const arr = Array.isArray(items) ? items : []
  const [expanded, setExpanded] = useState<number | null>(null)

  // Get the item schema from the block registry
  const def = BLOCK_REGISTRY.find(b => b.type === nodeType)
  const fieldDef = def?.propSchema.find(f => f.name === fieldName)
  const itemFields = fieldDef?.itemSchema || []

  const isStringArray = arr.length > 0 && typeof arr[0] === "string" || (!itemFields.length && arr.length === 0 && (fieldName === "roles" || (fieldName === "items" && nodeType === "list")))

  const addItem = () => {
    if (isStringArray) {
      onChange([...arr, "New Item"])
    } else {
      const newItem: any = {}
      itemFields.forEach((f) => {
        newItem[f.name] = f.defaultValue ?? (f.type === "number" ? 0 : f.type === "boolean" ? false : "")
      })
      // Special handling for nested arrays (like pricing features)
      if (nodeType === "pricing" && fieldName === "items") {
        newItem.features = []
      }
      onChange([...arr, newItem])
    }
    setExpanded(arr.length)
  }

  const removeItem = (idx: number) => {
    onChange(arr.filter((_, i) => i !== idx))
    if (expanded === idx) setExpanded(null)
  }

  const updateItem = (idx: number, key: string, val: any) => {
    const next = [...arr]
    if (key === "_value") {
      next[idx] = val
    } else {
      next[idx] = { ...next[idx], [key]: val }
    }
    onChange(next)
  }

  const moveItem = (idx: number, dir: -1 | 1) => {
    const next = [...arr]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
      ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
    setExpanded(target)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">{label} ({arr.length})</Label>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={addItem}>
          <PlusCircle className="h-3 w-3" /> Add
        </Button>
      </div>
      <div className="space-y-1">
        {arr.map((item, idx) => {
          const isExp = expanded === idx
          const displayLabel = isStringArray
            ? String(item).slice(0, 30)
            : (item?.title || item?.name || item?.question || item?.author || item?.label || item?.value || item?.platform || `Item ${idx + 1}`)

          return (
            <div key={idx} className="border rounded-lg overflow-hidden">
              <div
                className="flex items-center gap-1 px-2 py-1.5 bg-muted/30 cursor-pointer hover:bg-muted/50"
                onClick={() => setExpanded(isExp ? null : idx)}
              >
                {isExp ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                <span className="text-xs truncate flex-1 font-medium">{String(displayLabel).slice(0, 30)}</span>
                <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                  <button className="p-0.5 rounded hover:bg-muted" onClick={() => moveItem(idx, -1)} disabled={idx === 0}>
                    <ChevronUp className="h-3 w-3 text-muted-foreground" />
                  </button>
                  <button className="p-0.5 rounded hover:bg-muted" onClick={() => moveItem(idx, 1)} disabled={idx === arr.length - 1}>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>
                  <button className="p-0.5 rounded hover:bg-destructive/10" onClick={() => removeItem(idx)}>
                    <X className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              </div>
              {isExp && (
                <div className="p-2 space-y-2 border-t bg-card">
                  {isStringArray ? (
                    <Input
                      value={String(item)}
                      onChange={(e) => updateItem(idx, "_value", e.target.value)}
                      className="h-7 text-xs"
                    />
                  ) : (
                    <div className="space-y-3">
                      {itemFields.map((f) => (
                        <PropField
                          key={f.name}
                          field={f}
                          value={item?.[f.name]}
                          onChange={(v) => updateItem(idx, f.name, v)}
                        />
                      ))}
                      {/* Special nested editor for Pricing features */}
                      {nodeType === "pricing" && fieldName === "items" && (
                        <ItemListEditor
                          label="Features"
                          nodeType="list"
                          fieldName="items"
                          items={item.features || []}
                          onChange={(v) => updateItem(idx, "features", v)}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


// ── CMS Binding Editor (v2) ──────────────────────────
const CMS_BINDABLE_FIELDS: Record<string, string> = {
  features: "items",
  testimonials: "items",
  pricing: "items",
  faq: "items",
  timeline: "items",
  stats: "items",
  team: "members",
  gallery: "images",
  logos: "logos",
  accordion: "items",
  tabs: "items",
}

const BLOCK_FIELD_SCHEMAS: Record<string, { key: string; label: string }[]> = {
  features: [{ key: "title", label: "Title" }, { key: "description", label: "Description" }],
  testimonials: [{ key: "quote", label: "Quote" }, { key: "author", label: "Author" }, { key: "role", label: "Role" }],
  faq: [{ key: "question", label: "Question" }, { key: "answer", label: "Answer" }],
  timeline: [{ key: "year", label: "Year" }, { key: "title", label: "Title" }, { key: "description", label: "Description" }],
  stats: [{ key: "value", label: "Value" }, { key: "label", label: "Label" }],
  team: [{ key: "name", label: "Name" }, { key: "role", label: "Role" }, { key: "image", label: "Image" }],
  gallery: [{ key: "src", label: "Image URL" }, { key: "alt", label: "Alt Text" }],
  logos: [{ key: "src", label: "Logo URL" }, { key: "alt", label: "Alt Text" }],
  accordion: [{ key: "title", label: "Title" }, { key: "content", label: "Content" }],
  tabs: [{ key: "title", label: "Tab Title" }, { key: "content", label: "Content" }],
  pricing: [{ key: "name", label: "Plan Name" }, { key: "price", label: "Price" }],
}

function CmsBindingEditor({ node, collections, onUpdateProps }: {
  node: WBNode
  collections: WBCmsCollection[]
  onUpdateProps: (props: Record<string, any>) => void
}) {
  const targetField = CMS_BINDABLE_FIELDS[node.type]
  if (!targetField) return null

  const blockFields = BLOCK_FIELD_SCHEMAS[node.type] || []

  // Read v2 binding or build from legacy props
  const binding = node.props?._cmsBinding as { collectionId?: string; mode?: string; query?: any; map?: Record<string, string>; pagination?: any } | undefined
  const collectionId = binding?.collectionId || node.props?._cmsCollection || "none"
  const mode = binding?.mode || "list"
  const map: Record<string, string> = binding?.map || node.props?._cmsFieldMap || {}
  const limit = binding?.query?.limit ?? node.props?._cmsLimit ?? 0
  const sortField = binding?.query?.sort?.field || ""
  const sortDir = binding?.query?.sort?.direction || "asc"
  const paginationMode = binding?.pagination?.mode || "none"
  const pageSize = binding?.pagination?.pageSize || 10
  const isBound = !!collectionId && collectionId !== "none"
  const selectedCollection = collections.find((c) => c.id === collectionId)

  function updateBinding(patch: Record<string, any>) {
    const current = node.props?._cmsBinding || {}
    const next = { ...current, ...patch }
    // Also keep legacy keys in sync for backward compat
    onUpdateProps({
      _cmsBinding: next,
      _cmsCollection: next.collectionId || "",
      _cmsFieldMap: next.map || {},
      _cmsLimit: next.query?.limit || 0,
    })
  }

  function handleCollectionChange(id: string) {
    if (id === "none") {
      onUpdateProps({ _cmsBinding: undefined, _cmsCollection: "", _cmsFieldMap: {}, _cmsLimit: 0 })
      return
    }
    const col = collections.find((c) => c.id === id)
    if (!col) return
    const autoMap: Record<string, string> = {}
    for (const bf of blockFields) {
      const match = col.fields.find((cf) => cf.key === bf.key || cf.label.toLowerCase() === bf.label.toLowerCase())
      if (match) autoMap[bf.key] = match.key
    }
    updateBinding({ collectionId: id, mode: "list", map: autoMap, query: { limit: 0 }, pagination: { mode: "none" } })
  }

  function handleMapChange(blockKey: string, cmsKey: string) {
    updateBinding({ map: { ...map, [blockKey]: cmsKey === "none" ? "" : cmsKey } })
  }

  return (
    <div className="space-y-2 rounded-lg border p-2.5 bg-muted/20">
      <div className="flex items-center gap-1.5">
        <Database className="h-3.5 w-3.5 text-primary" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">CMS Data Binding</p>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px]">Collection</Label>
        <Select value={collectionId} onValueChange={handleCollectionChange}>
          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="None (manual data)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className="text-xs">None (manual data)</SelectItem>
            {collections.map((col) => (
              <SelectItem key={col.id} value={col.id} className="text-xs">
                {col.label} ({col.items.length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isBound && selectedCollection && (
        <>
          {/* Mode */}
          <div className="space-y-1">
            <Label className="text-[10px]">Mode</Label>
            <Select value={mode} onValueChange={(v) => updateBinding({ mode: v })}>
              <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="list" className="text-xs">List — show multiple items</SelectItem>
                <SelectItem value="detail" className="text-xs">Detail — single item fields</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Limit */}
          <div className="space-y-1">
            <Label className="text-[10px]">Limit (0 = all)</Label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => updateBinding({ query: { ...binding?.query, limit: parseInt(e.target.value) || 0 } })}
              className="h-7 text-xs"
              min={0}
            />
          </div>

          {/* Sort */}
          <div className="space-y-1">
            <Label className="text-[10px]">Sort By</Label>
            <div className="flex gap-1">
              <Select value={sortField || "none"} onValueChange={(v) => updateBinding({ query: { ...binding?.query, sort: v === "none" ? undefined : { field: v, direction: sortDir } } })}>
                <SelectTrigger className="h-6 text-[10px] flex-1"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">None</SelectItem>
                  {selectedCollection.fields.map((cf) => (
                    <SelectItem key={cf.key} value={cf.key} className="text-xs">{cf.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sortField && (
                <Select value={sortDir} onValueChange={(v) => updateBinding({ query: { ...binding?.query, sort: { field: sortField, direction: v } } })}>
                  <SelectTrigger className="h-6 text-[10px] w-16"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc" className="text-xs">A→Z</SelectItem>
                    <SelectItem value="desc" className="text-xs">Z→A</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Pagination */}
          {mode === "list" && (
            <div className="space-y-1">
              <Label className="text-[10px]">Pagination</Label>
              <Select value={paginationMode} onValueChange={(v) => updateBinding({ pagination: { mode: v, pageSize: v === "none" ? undefined : pageSize } })}>
                <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">None</SelectItem>
                  <SelectItem value="loadMore" className="text-xs">Load More button</SelectItem>
                  <SelectItem value="infinite" className="text-xs">Infinite scroll</SelectItem>
                </SelectContent>
              </Select>
              {paginationMode !== "none" && (
                <Input
                  type="number"
                  value={pageSize}
                  onChange={(e) => updateBinding({ pagination: { mode: paginationMode, pageSize: parseInt(e.target.value) || 10 } })}
                  className="h-6 text-[10px]"
                  min={1}
                  placeholder="Page size"
                />
              )}
            </div>
          )}

          {/* Field Mapping */}
          <div className="space-y-1.5">
            <Label className="text-[10px]">Field Mapping</Label>
            {blockFields.map((bf) => (
              <div key={bf.key} className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground w-16 shrink-0 truncate" title={bf.label}>{bf.label}</span>
                <span className="text-[10px] text-muted-foreground">→</span>
                <Select value={map[bf.key] || "none"} onValueChange={(v) => handleMapChange(bf.key, v)}>
                  <SelectTrigger className="h-6 text-[10px] flex-1"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">— unmapped —</SelectItem>
                    {selectedCollection.fields.map((cf) => (
                      <SelectItem key={cf.key} value={cf.key} className="text-xs">{cf.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <p className="text-[9px] text-muted-foreground">
            {mode === "detail" ? "Injects first matching item fields as block props." : `Injects ${selectedCollection.items.length} items into ${targetField}.`}
          </p>
        </>
      )}
    </div>
  )
}

// ── Style Section Header (collapsible) ───────────────
function StyleSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border/40 last:border-0">
      <button className="flex items-center justify-between w-full py-2 group select-none" onClick={() => setOpen(!open)}>
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80 group-hover:text-foreground transition-colors">{title}</p>
        <div className={`transition-transform duration-200 ${open ? "" : "-rotate-90"}`}>
          <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
        </div>
      </button>
      {open && <div className="space-y-3 pb-3 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  )
}

// ── 4-Side Spacing Input (Figma-style) ───────────────
function SpacingSidesInput({ label, top, right, bottom, left, onChange }: {
  label: string
  top: string; right: string; bottom: string; left: string
  onChange: (side: string, value: string) => void
}) {
  const [linked, setLinked] = useState(top === right && right === bottom && bottom === left)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-[10px]">{label}</Label>
        <button className="text-[9px] px-1.5 py-0.5 rounded border hover:bg-muted" onClick={() => setLinked(!linked)} title={linked ? "Unlink sides" : "Link all sides"}>
          {linked ? "🔗" : "⊞"}
        </button>
      </div>
      {linked ? (
        <Input
          value={top || ""}
          onChange={(e) => { onChange("Top", e.target.value); onChange("Right", e.target.value); onChange("Bottom", e.target.value); onChange("Left", e.target.value) }}
          className="h-7 text-xs" placeholder="0px"
        />
      ) : (
        <div className="grid grid-cols-4 gap-1">
          {[{ s: "Top", v: top }, { s: "Right", v: right }, { s: "Bottom", v: bottom }, { s: "Left", v: left }].map((side) => (
            <div key={side.s} className="space-y-0.5">
              <span className="text-[8px] text-muted-foreground block text-center">{side.s[0]}</span>
              <Input value={side.v || ""} onChange={(e) => onChange(side.s, e.target.value)} className="h-6 text-[10px] text-center px-1" placeholder="0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Interaction Editor ─────────────────────────────
function InteractionEditor({ node, onUpdateProps }: {
  node: WBNode | null
  onUpdateProps: (props: Record<string, any>) => void
}) {
  if (!node) return <div className="p-4 text-center text-xs text-muted-foreground">Select a single element to edit interactions.</div>
  
  const interactions = node.props?._interactions || []

  const addInteraction = (type: string) => {
    const newInteractions = [...interactions, { type, trigger: "in-view", animation: "fade-in", duration: 0.5, delay: 0 }]
    onUpdateProps({ _interactions: newInteractions })
  }

  const updateInteraction = (index: number, updates: any) => {
    const newInteractions = [...interactions]
    newInteractions[index] = { ...newInteractions[index], ...updates }
    onUpdateProps({ _interactions: newInteractions })
  }

  const removeInteraction = (index: number) => {
    onUpdateProps({ _interactions: interactions.filter((_: any, i: number) => i !== index) })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Animations</p>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => addInteraction("animation")}>
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>

      {interactions.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed rounded-xl bg-muted/20">
          <Sparkles className="h-6 w-6 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-[10px] text-muted-foreground px-4">Add smooth reveal animations or hover effects.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interactions.map((inter: any, i: number) => (
            <div key={i} className="p-3 rounded-xl border bg-muted/30 relative group">
              <button
                className="absolute top-2 right-2 p-1 rounded hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeInteraction(i)}
              >
                <X className="h-3 w-3" />
              </button>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground">Trigger</Label>
                    <Select value={inter.trigger} onValueChange={(v) => updateInteraction(i, { trigger: v })}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-view" className="text-xs">In View</SelectItem>
                        <SelectItem value="hover" className="text-xs">While Hover</SelectItem>
                        <SelectItem value="tap" className="text-xs">On Tap</SelectItem>
                        <SelectItem value="loop" className="text-xs">Loop / Continuous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground">Effect</Label>
                    <Select value={inter.animation} onValueChange={(v) => updateInteraction(i, { animation: v })}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fade-in" className="text-xs">Fade In</SelectItem>
                        <SelectItem value="slide-up" className="text-xs">Slide Up</SelectItem>
                        <SelectItem value="slide-down" className="text-xs">Slide Down</SelectItem>
                        <SelectItem value="slide-left" className="text-xs">Slide Left</SelectItem>
                        <SelectItem value="slide-right" className="text-xs">Slide Right</SelectItem>
                        <SelectItem value="scale-up" className="text-xs">Scale Up</SelectItem>
                        <SelectItem value="pop" className="text-xs">Pop</SelectItem>
                        <SelectItem value="rotate-in" className="text-xs">Rotate In</SelectItem>
                        <SelectItem value="swing" className="text-xs">Swing Loop</SelectItem>
                        <SelectItem value="bounce" className="text-xs">Bounce Loop</SelectItem>
                        <SelectItem value="pulse" className="text-xs">Pulse Loop</SelectItem>
                        <SelectItem value="float" className="text-xs">Float Loop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground">Duration (s)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={inter.duration}
                      onChange={(e) => updateInteraction(i, { duration: parseFloat(e.target.value) })}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground">Delay (s)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={inter.delay}
                      onChange={(e) => updateInteraction(i, { delay: parseFloat(e.target.value) })}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Variables Editor (Stack Variables Pattern) ───────
function VariablesEditor({ node, viewport, onUpdate }: {
  node: WBNode
  viewport: "desktop" | "tablet" | "mobile"
  onUpdate: (vars: any[]) => void
}) {
  const variables = node.variables || []

  const addVariable = () => {
    const id = `var_${Math.random().toString(36).slice(2, 8)}`
    onUpdate([...variables, { id, label: "New Variable", type: "string", defaultValue: "", responsiveValues: {}, bindTo: "" }])
  }

  const updateVar = (idx: number, patch: Record<string, any>) => {
    const next = [...variables]
    next[idx] = { ...next[idx], ...patch }
    onUpdate(next)
  }

  const removeVar = (idx: number) => {
    onUpdate(variables.filter((_: any, i: number) => i !== idx))
  }

  const setResponsiveValue = (idx: number, bp: string, val: any) => {
    const v = variables[idx]
    const rv = { ...(v.responsiveValues || {}), [bp]: val }
    updateVar(idx, { responsiveValues: rv })
  }

  const getCurrentValue = (v: any) => {
    if (viewport === "desktop") return v.defaultValue
    return v.responsiveValues?.[viewport] ?? v.defaultValue
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Variables</p>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={addVariable}>
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>

      {variables.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed rounded-xl bg-muted/20">
          <Settings2 className="h-6 w-6 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-[10px] text-muted-foreground px-4">Add variables to control layout properties per breakpoint without creating variants.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {variables.map((v: any, i: number) => (
            <div key={v.id} className="p-2.5 rounded-lg border bg-muted/20 relative group space-y-2">
              <button
                className="absolute top-1.5 right-1.5 p-0.5 rounded hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeVar(i)}
              >
                <X className="h-3 w-3" />
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="space-y-0.5">
                  <Label className="text-[9px] text-muted-foreground">Label</Label>
                  <Input className="h-6 text-[10px]" value={v.label} onChange={(e) => updateVar(i, { label: e.target.value })} />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[9px] text-muted-foreground">Type</Label>
                  <Select value={v.type} onValueChange={(t) => updateVar(i, { type: t })}>
                    <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string" className="text-xs">String</SelectItem>
                      <SelectItem value="number" className="text-xs">Number</SelectItem>
                      <SelectItem value="color" className="text-xs">Color</SelectItem>
                      <SelectItem value="boolean" className="text-xs">Boolean</SelectItem>
                      <SelectItem value="select" className="text-xs">Select</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-0.5">
                <Label className="text-[9px] text-muted-foreground">
                  Value {viewport !== "desktop" && <span className="text-primary">({viewport})</span>}
                </Label>
                {v.type === "color" ? (
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={getCurrentValue(v) || "#000000"}
                      onChange={(e) => viewport === "desktop" ? updateVar(i, { defaultValue: e.target.value }) : setResponsiveValue(i, viewport, e.target.value)}
                      className="h-6 w-8 rounded border cursor-pointer"
                    />
                    <Input className="h-6 text-[10px] flex-1" value={getCurrentValue(v) || ""} onChange={(e) => viewport === "desktop" ? updateVar(i, { defaultValue: e.target.value }) : setResponsiveValue(i, viewport, e.target.value)} />
                  </div>
                ) : v.type === "boolean" ? (
                  <Switch
                    checked={getCurrentValue(v) === true || getCurrentValue(v) === "true"}
                    onCheckedChange={(c) => viewport === "desktop" ? updateVar(i, { defaultValue: c }) : setResponsiveValue(i, viewport, c)}
                  />
                ) : (
                  <Input
                    className="h-6 text-[10px]"
                    type={v.type === "number" ? "number" : "text"}
                    value={getCurrentValue(v) ?? ""}
                    onChange={(e) => viewport === "desktop" ? updateVar(i, { defaultValue: v.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }) : setResponsiveValue(i, viewport, v.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-0.5">
                <Label className="text-[9px] text-muted-foreground">Bind to style prop</Label>
                <Select value={v.bindTo || "none"} onValueChange={(b) => updateVar(i, { bindTo: b === "none" ? "" : b })}>
                  <SelectTrigger className="h-6 text-[10px]"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">None</SelectItem>
                    <SelectItem value="gap" className="text-xs">Gap</SelectItem>
                    <SelectItem value="padding" className="text-xs">Padding</SelectItem>
                    <SelectItem value="flexDirection" className="text-xs">Direction</SelectItem>
                    <SelectItem value="fontSize" className="text-xs">Font Size</SelectItem>
                    <SelectItem value="color" className="text-xs">Color</SelectItem>
                    <SelectItem value="backgroundColor" className="text-xs">Background</SelectItem>
                    <SelectItem value="borderRadius" className="text-xs">Border Radius</SelectItem>
                    <SelectItem value="width" className="text-xs">Width</SelectItem>
                    <SelectItem value="height" className="text-xs">Height</SelectItem>
                    <SelectItem value="margin" className="text-xs">Margin</SelectItem>
                    <SelectItem value="opacity" className="text-xs">Opacity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {v.responsiveValues && Object.keys(v.responsiveValues).length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(v.responsiveValues).map(([bp, val]) => (
                    <Badge key={bp} variant="secondary" className="text-[8px] h-4">
                      {bp}: {String(val)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Dimension Input ──────────────────────────────────
function DimensionInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const isFill = value === "100%"
  const isFit = value === "fit-content" || value === "max-content"
  const isAuto = value === "auto" || !value
  const isFixed = !isFill && !isFit && !isAuto

  const mode = isFill ? "fill" : isFit ? "fit" : isAuto ? "auto" : "fixed"
  const numericValue = isFixed ? parseFloat(value) || 0 : 0
  const unit = isFixed ? value.replace(/[0-9.-]/g, "") || "px" : "px"

  return (
    <div className="flex items-center gap-2">
      <Label className="text-[10px] w-10 shrink-0 text-muted-foreground">{label}</Label>
      <div className="flex-1 flex gap-1">
        <Select
          value={mode}
          onValueChange={(m) => {
            if (m === "fill") onChange("100%")
            else if (m === "fit") onChange("fit-content")
            else if (m === "auto") onChange("auto")
            else onChange(`${numericValue}${unit}`)
          }}
        >
          <SelectTrigger className="h-7 text-[10px] w-16 px-1.5 gap-1">
            <span className="truncate">{mode === "fixed" ? (numericValue + unit) : mode === "fill" ? "Fill" : mode === "fit" ? "Fit" : "Auto"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed" className="text-xs">Fixed</SelectItem>
            <SelectItem value="fill" className="text-xs">Fill (100%)</SelectItem>
            <SelectItem value="fit" className="text-xs">Fit Content</SelectItem>
            <SelectItem value="auto" className="text-xs">Auto</SelectItem>
          </SelectContent>
        </Select>

        {mode === "fixed" && (
          <div className="flex-1 flex gap-0.5 relative">
            <Input
              type="number"
              value={numericValue}
              onChange={(e) => onChange(`${e.target.value}${unit}`)}
              className="h-7 text-xs px-1.5 pr-6"
            />
            <div className="absolute right-0 top-0 bottom-0">
              <Select value={unit} onValueChange={(u) => onChange(`${numericValue}${u}`)}>
                <SelectTrigger className="h-7 text-[9px] w-6 px-0 border-0 bg-transparent hover:bg-transparent focus:ring-0 shadow-none text-muted-foreground">
                  {unit}
                </SelectTrigger>
                <SelectContent>
                  {["px", "%", "rem", "vh", "vw"].map((u) => (
                    <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Shadow Editor ────────────────────────────────────
function ShadowEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // Simple parser for single shadow: x y blur spread color inset
  // Example: 0 4px 6px -1px rgba(0,0,0,0.1)
  const parseShadow = (val: string) => {
    if (!val || val === "none") return { x: 0, y: 4, blur: 10, spread: 0, color: "rgba(0,0,0,0.1)", inset: false }
    const isInset = val.includes("inset")
    const clean = val.replace("inset", "").trim()
    // This regex is a simplification and might not catch all valid CSS shadows, but covers the builder's generated ones
    // Matches: <length> <length> <length>? <length>? <color>
    // Note: Color can be at start or end. Assuming end for simplicity or standard format.
    // Handling color parsing is tricky without a library. We'll try to split by space but respect parenthesis for rgba/hsl.
    const parts = clean.match(/(-?[\d.]+[a-z%]*)|(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]+|[a-z]+)/g) || []
    
    // Filter out color parts to find lengths
    const lengths = parts.filter(p => /^-?[\d.]/.test(p))
    const colorPart = parts.find(p => !/^-?[\d.]/.test(p)) || "#000000"
    
    return {
      x: parseFloat(lengths[0]) || 0,
      y: parseFloat(lengths[1]) || 0,
      blur: parseFloat(lengths[2]) || 0,
      spread: parseFloat(lengths[3]) || 0,
      color: colorPart,
      inset: isInset
    }
  }

  const [shadow, setShadow] = useState(parseShadow(value))

  useEffect(() => {
    setShadow(parseShadow(value))
  }, [value])

  const update = (key: string, val: any) => {
    const next = { ...shadow, [key]: val }
    setShadow(next)
    const str = `${next.inset ? "inset " : ""}${next.x}px ${next.y}px ${next.blur}px ${next.spread}px ${next.color}`
    onChange(str)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <div className="flex-1 space-y-0.5">
          <Label className="text-[9px] text-muted-foreground">X</Label>
          <Input type="number" value={shadow.x} onChange={(e) => update("x", Number(e.target.value))} className="h-6 text-xs px-1" />
        </div>
        <div className="flex-1 space-y-0.5">
          <Label className="text-[9px] text-muted-foreground">Y</Label>
          <Input type="number" value={shadow.y} onChange={(e) => update("y", Number(e.target.value))} className="h-6 text-xs px-1" />
        </div>
        <div className="flex-1 space-y-0.5">
          <Label className="text-[9px] text-muted-foreground">Blur</Label>
          <Input type="number" value={shadow.blur} min={0} onChange={(e) => update("blur", Number(e.target.value))} className="h-6 text-xs px-1" />
        </div>
        <div className="flex-1 space-y-0.5">
          <Label className="text-[9px] text-muted-foreground">Spread</Label>
          <Input type="number" value={shadow.spread} onChange={(e) => update("spread", Number(e.target.value))} className="h-6 text-xs px-1" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 space-y-0.5">
          <Label className="text-[9px] text-muted-foreground">Color</Label>
          <div className="flex gap-1.5">
            <input type="color" value={shadow.color.startsWith("#") ? shadow.color : "#000000"} onChange={(e) => update("color", e.target.value)} className="h-6 w-6 rounded border cursor-pointer shrink-0" />
            <Input value={shadow.color} onChange={(e) => update("color", e.target.value)} className="h-6 text-xs flex-1 px-1" />
          </div>
        </div>
        <div className="space-y-0.5 pt-3">
          <div className="flex items-center gap-1.5">
            <Switch checked={shadow.inset} onCheckedChange={(v) => update("inset", v)} id="shadow-inset" className="scale-75" />
            <Label htmlFor="shadow-inset" className="text-[10px]">Inset</Label>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Gradient Editor ──────────────────────────────────
function GradientEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [mode, setMode] = useState<"none" | "linear" | "radial" | "image" | "raw">("none")
  const [angle, setAngle] = useState(135)
  const [stops, setStops] = useState<{ color: string; pos: number; id: string }[]>([
    { color: "#4F46E5", pos: 0, id: "1" },
    { color: "#9333EA", pos: 100, id: "2" }
  ])
  const [url, setUrl] = useState("")

  // Parse value on load
  useEffect(() => {
    if (!value || value === "none") { setMode("none"); return }
    
    if (value.startsWith("linear-gradient")) {
      setMode("linear")
      try {
        const content = value.match(/linear-gradient\((.*)\)/i)?.[1] || ""
        const parts = splitSafe(content)
        // Check for angle
        let stopParts = parts
        if (parts[0].includes("deg") || parts[0].includes("to ")) {
          const deg = parseInt(parts[0])
          if (!isNaN(deg)) setAngle(deg)
          stopParts = parts.slice(1)
        }
        // Parse stops
        const newStops = stopParts.map((p, i) => {
          const match = p.match(/(.*?)\s+([\d.]+)%/)
          if (match) return { color: match[1], pos: parseFloat(match[2]), id: i.toString() }
          // Try to guess if just color
          if (!p.match(/\d+(px|em|rem)/)) return { color: p, pos: i === 0 ? 0 : 100, id: i.toString() }
          return { color: "#000000", pos: 0, id: i.toString() }
        })
        if (newStops.length) setStops(newStops)
      } catch (e) { setMode("raw") }
    } else if (value.startsWith("radial-gradient")) {
      setMode("radial")
      // Simplified parsing for radial
      try {
        const content = value.match(/radial-gradient\((.*)\)/i)?.[1] || ""
        const parts = splitSafe(content)
        // Skip shape/size param if present (e.g. "circle at center")
        const stopParts = parts.filter(p => !p.includes("circle") && !p.includes("at "))
        const newStops = stopParts.map((p, i) => {
          const match = p.match(/(.*?)\s+([\d.]+)%/)
          if (match) return { color: match[1], pos: parseFloat(match[2]), id: i.toString() }
          return { color: p, pos: i === 0 ? 0 : 100, id: i.toString() }
        })
        if (newStops.length) setStops(newStops)
      } catch (e) { setMode("raw") }
    } else if (value.startsWith("url")) {
      setMode("image")
      const u = value.match(/url\(["']?(.*?)["']?\)/i)?.[1]
      if (u) setUrl(u)
    } else {
      setMode("raw")
    }
  }, [value])

  const splitSafe = (str: string) => {
    const parts: string[] = []
    let depth = 0
    let current = ""
    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      if (char === "(") depth++
      if (char === ")") depth--
      if (char === "," && depth === 0) {
        parts.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    if (current) parts.push(current.trim())
    return parts
  }

  const buildValue = (newMode: string, newAngle: number, newStops: typeof stops, newUrl: string) => {
    if (newMode === "none") return ""
    if (newMode === "image") return `url("${newUrl}")`
    if (newMode === "raw") return value
    
    const stopsStr = newStops
      .sort((a, b) => a.pos - b.pos)
      .map(s => `${s.color} ${s.pos}%`)
      .join(", ")
    
    if (newMode === "linear") return `linear-gradient(${newAngle}deg, ${stopsStr})`
    if (newMode === "radial") return `radial-gradient(circle, ${stopsStr})`
    return ""
  }

  const handleUpdate = (updates: any) => {
    const m = updates.mode ?? mode
    const a = updates.angle ?? angle
    const s = updates.stops ?? stops
    const u = updates.url ?? url
    
    // Update local state
    if (updates.mode) setMode(updates.mode)
    if (updates.angle !== undefined) setAngle(updates.angle)
    if (updates.stops) setStops(updates.stops)
    if (updates.url !== undefined) setUrl(updates.url)

    // Propagate change
    onChange(buildValue(m, a, s, u))
  }

  const addStop = () => {
    const newStop = { color: "#000000", pos: 50, id: Math.random().toString() }
    handleUpdate({ stops: [...stops, newStop] })
  }

  const removeStop = (id: string) => {
    if (stops.length <= 2) return
    handleUpdate({ stops: stops.filter(s => s.id !== id) })
  }

  const updateStop = (id: string, key: "color" | "pos", val: any) => {
    handleUpdate({ stops: stops.map(s => s.id === id ? { ...s, [key]: val } : s) })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 bg-muted/40 p-0.5 rounded-lg border">
        {[
          { v: "none", l: "None", icon: <X className="h-3 w-3" /> },
          { v: "linear", l: "Linear", icon: <div className="w-3 h-3 rounded-full bg-gradient-to-br from-black/50 to-transparent border border-foreground/20" /> },
          { v: "radial", l: "Radial", icon: <div className="w-3 h-3 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.5),transparent)] border border-foreground/20" /> },
          { v: "image", l: "Image", icon: <Images className="h-3 w-3" /> }
        ].map((opt) => (
          <button
            key={opt.v}
            title={opt.l}
            className={`flex-1 flex justify-center py-1 rounded-md transition-all ${mode === opt.v ? "bg-background shadow-sm text-foreground border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => handleUpdate({ mode: opt.v })}
          >
            {opt.icon}
          </button>
        ))}
      </div>

      {mode === "linear" && (
        <div className="flex items-center gap-2">
          <Label className="text-[10px] w-10">Angle</Label>
          <input
            type="range" min="0" max="360"
            value={angle}
            onChange={(e) => handleUpdate({ angle: parseInt(e.target.value) })}
            className="flex-1 h-1.5 accent-primary"
          />
          <Input
            type="number"
            value={angle}
            onChange={(e) => handleUpdate({ angle: parseInt(e.target.value) })}
            className="h-6 w-12 text-xs px-1 text-center"
          />
        </div>
      )}

      {(mode === "linear" || mode === "radial") && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-[10px]">Stops</Label>
            <button onClick={addStop} className="text-[9px] hover:text-primary flex items-center gap-0.5"><Plus className="h-2 w-2" /> Add</button>
          </div>
          <div className="space-y-1.5">
            {stops.map((stop) => (
              <div key={stop.id} className="flex gap-2 items-center">
                <div className="flex gap-1.5 flex-1">
                  <input
                    type="color"
                    value={stop.color.startsWith("#") ? stop.color : "#000000"}
                    onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                    className="h-6 w-6 rounded border cursor-pointer shrink-0"
                  />
                  <Input
                    value={stop.color}
                    onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                    className="h-6 text-xs flex-1 px-1 min-w-0"
                  />
                </div>
                <div className="flex items-center gap-1 w-16">
                  <Input
                    type="number"
                    min={0} max={100}
                    value={stop.pos}
                    onChange={(e) => updateStop(stop.id, "pos", parseFloat(e.target.value))}
                    className="h-6 text-xs px-1 text-right"
                  />
                  <span className="text-[9px] text-muted-foreground">%</span>
                </div>
                <button
                  onClick={() => removeStop(stop.id)}
                  disabled={stops.length <= 2}
                  className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === "image" && (
        <div className="space-y-1">
          <Label className="text-[10px]">Image URL</Label>
          <Input
            value={url}
            onChange={(e) => handleUpdate({ url: e.target.value })}
            placeholder="https://..."
            className="h-7 text-xs"
          />
        </div>
      )}

      {mode === "raw" && (
        <div className="space-y-1">
          <Label className="text-[10px]">CSS Value</Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 text-xs font-mono"
          />
        </div>
      )}
    </div>
  )
}

// ── Style Editor ─────────────────────────────────────
function StyleEditor({ nodes, theme, viewport, onUpdateProps, onUpdateStyles }: {
  nodes: WBNode[]
  theme?: any
  viewport?: "desktop" | "tablet" | "mobile"
  onUpdateProps: (props: Record<string, any>) => void
  onUpdateStyles: (styles: any) => void
}) {
  const [bp, setBp] = useState<"base" | "tablet" | "mobile">("base")
  const [state, setState] = useState<"normal" | "hover">("normal")

  // Sync with global viewport
  useEffect(() => {
    if (viewport === "mobile") setBp("mobile")
    else if (viewport === "tablet") setBp("tablet")
    else setBp("base")
  }, [viewport])

  const firstNode = nodes[0]
  if (!firstNode) return null

  const currentStyles: Record<string, any> = state === "hover" 
    ? (firstNode.styles?.hover || {}) 
    : (firstNode.styles?.[bp] || {})

  const updateStyle = (key: string, value: string) => {
    if (state === "hover") {
      onUpdateStyles({ hover: { [key]: value || undefined } })
    } else {
      onUpdateStyles({ [bp]: { [key]: value || undefined } })
    }
  }

  const updateMultipleStyles = (updates: Record<string, string | undefined>) => {
    if (state === "hover") {
      onUpdateStyles({ hover: updates })
    } else {
      onUpdateStyles({ [bp]: updates })
    }
  }

  return (
    <div className="space-y-3">
      {/* Breakpoint & State Tabs */}
      <div className="space-y-2">
        <div className="flex border rounded-lg overflow-hidden">
          {(["base", "tablet", "mobile"] as const).map((b) => (
            <button
              key={b}
              className={`flex-1 py-1.5 text-[10px] font-semibold flex items-center justify-center gap-1 ${bp === b ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"}`}
              onClick={() => { setBp(b); setState("normal") }}
            >
              {b === "base" ? <Monitor className="h-3 w-3" /> : b === "tablet" ? <Tablet className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
              {b.charAt(0).toUpperCase() + b.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex border rounded-lg overflow-hidden bg-muted/20 p-0.5">
          <button
            className={`flex-1 py-1 text-[10px] font-semibold rounded-md transition-all ${state === "normal" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setState("normal")}
          >
            Normal
          </button>
          <button
            className={`flex-1 py-1 text-[10px] font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${state === "hover" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setState("hover")}
          >
            <MousePointerClick className="h-3 w-3" /> Hover
          </button>
        </div>
      </div>

      {state === "hover" && (
        <div className="text-[10px] text-primary bg-primary/10 rounded px-2 py-1.5 flex items-center gap-2">
          <Sparkles className="h-3 w-3" />
          Editing hover state. Inherits from Base/Current.
        </div>
      )}

      {state === "normal" && bp !== "base" && (
        <p className="text-[10px] text-amber-600 bg-amber-50 rounded px-2 py-1">
          Overrides for {bp}. Empty fields inherit from base.
        </p>
      )}

      {/* ── LAYOUT ─────────────────────────────────── */}
      <StyleSection title="Layout">
        <div className="space-y-1">
          <Label className="text-[10px]">Display</Label>
          <div className="flex gap-1">
            {["block", "flex", "grid", "inline-flex", "inline", "none"].map((d) => (
              <button key={d} className={`flex-1 py-1 text-[9px] rounded border font-medium transition-colors ${currentStyles.display === d ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("display", d)}>
                {d === "inline-flex" ? "i-flex" : d}
              </button>
            ))}
          </div>
        </div>
        {(currentStyles.display === "flex" || currentStyles.display === "inline-flex") && (
          <>
            <div className="space-y-1">
              <Label className="text-[10px]">Direction</Label>
              <div className="flex gap-1">
                {[{ v: "row", l: "→" }, { v: "column", l: "↓" }, { v: "row-reverse", l: "←" }, { v: "column-reverse", l: "↑" }].map((d) => (
                  <button key={d.v} className={`flex-1 py-1 text-[10px] rounded border ${currentStyles.flexDirection === d.v ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("flexDirection", d.v)}>
                    {d.l}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Justify</Label>
              <div className="flex gap-1 bg-muted/40 p-0.5 rounded-lg border">
                {[
                  { v: "flex-start", l: "Start", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="2" height="8" rx="0.5" fill="currentColor" /><rect x="5" y="4" width="2" height="4" rx="0.5" fill="currentColor" fillOpacity="0.4" /></svg> },
                  { v: "center", l: "Center", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="2" width="2" height="8" rx="0.5" fill="currentColor" /><rect x="2" y="4" width="2" height="4" rx="0.5" fill="currentColor" fillOpacity="0.4" /><rect x="8" y="4" width="2" height="4" rx="0.5" fill="currentColor" fillOpacity="0.4" /></svg> },
                  { v: "flex-end", l: "End", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="2" width="2" height="8" rx="0.5" fill="currentColor" /><rect x="5" y="4" width="2" height="4" rx="0.5" fill="currentColor" fillOpacity="0.4" /></svg> },
                  { v: "space-between", l: "Between", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="2" height="6" rx="0.5" fill="currentColor" /><rect x="8" y="3" width="2" height="6" rx="0.5" fill="currentColor" /></svg> },
                ].map((j) => (
                  <button key={j.v} title={j.l} className={`flex-1 flex justify-center py-1 rounded-md transition-all ${currentStyles.justifyContent === j.v ? "bg-background shadow-sm text-foreground border border-border/50" : "text-muted-foreground hover:text-foreground"}`} onClick={() => updateStyle("justifyContent", j.v)}>
                    {j.icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Align Items</Label>
              <div className="flex gap-1 bg-muted/40 p-0.5 rounded-lg border">
                {[
                  { v: "flex-start", l: "Top", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}><rect x="2" y="2" width="2" height="8" rx="0.5" fill="currentColor" /><rect x="5" y="4" width="2" height="4" rx="0.5" fill="currentColor" fillOpacity="0.4" /></svg> },
                  { v: "center", l: "Middle", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}><rect x="5" y="2" width="2" height="8" rx="0.5" fill="currentColor" /><rect x="2" y="4" width="2" height="4" rx="0.5" fill="currentColor" fillOpacity="0.4" /><rect x="8" y="4" width="2" height="4" rx="0.5" fill="currentColor" fillOpacity="0.4" /></svg> },
                  { v: "flex-end", l: "Bottom", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}><rect x="8" y="2" width="2" height="8" rx="0.5" fill="currentColor" /><rect x="5" y="4" width="2" height="4" rx="0.5" fill="currentColor" fillOpacity="0.4" /></svg> },
                  { v: "stretch", l: "Stretch", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="8" height="2" rx="0.5" fill="currentColor" /><rect x="2" y="8" width="8" height="2" rx="0.5" fill="currentColor" /><rect x="4" y="4" width="4" height="4" rx="0.5" fill="currentColor" fillOpacity="0.4" /></svg> },
                ].map((a) => (
                  <button key={a.v} title={a.l} className={`flex-1 flex justify-center py-1 rounded-md transition-all ${currentStyles.alignItems === a.v ? "bg-background shadow-sm text-foreground border border-border/50" : "text-muted-foreground hover:text-foreground"}`} onClick={() => updateStyle("alignItems", a.v)}>
                    {a.icon}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        {currentStyles.display === "grid" && (
          <div className="space-y-1">
            <Label className="text-[10px]">Grid Columns</Label>
            <Input value={currentStyles.gridTemplateColumns || ""} onChange={(e) => updateStyle("gridTemplateColumns", e.target.value)} className="h-7 text-xs" placeholder="repeat(3, 1fr)" />
            <div className="flex gap-1">
              {["repeat(2, 1fr)", "repeat(3, 1fr)", "repeat(4, 1fr)", "1fr 2fr", "2fr 1fr"].map((g) => (
                <button key={g} className={`flex-1 py-1 text-[8px] rounded border ${currentStyles.gridTemplateColumns === g ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("gridTemplateColumns", g)}>
                  {g.includes("repeat") ? g.match(/\d/)?.[0] + "col" : g.replace(/ /g, "/")}
                </button>
              ))}
            </div>
            <Label className="text-[10px]">Grid Rows</Label>
            <Input value={currentStyles.gridTemplateRows || ""} onChange={(e) => updateStyle("gridTemplateRows", e.target.value)} className="h-7 text-xs" placeholder="auto" />
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-[10px]">Gap</Label>
          <Input value={currentStyles.gap || ""} onChange={(e) => updateStyle("gap", e.target.value)} className="h-7 text-xs" placeholder="0px" />
          <div className="flex gap-1">
            {["4px", "8px", "12px", "16px", "24px", "32px", "48px"].map((g) => (
              <button key={g} className={`flex-1 py-0.5 text-[8px] rounded border ${currentStyles.gap === g ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("gap", g)}>
                {parseInt(g)}
              </button>
            ))}
          </div>
        </div>
      </StyleSection>

      {/* ── SIZE ────────────────────────────────────── */}
      <StyleSection title="Size">
        <div className="space-y-2">
          <DimensionInput label="Width" value={currentStyles.width || "auto"} onChange={(v) => updateStyle("width", v)} />
          <DimensionInput label="Height" value={currentStyles.height || "auto"} onChange={(v) => updateStyle("height", v)} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-border/40">
            <DimensionInput label="Min W" value={currentStyles.minWidth || "auto"} onChange={(v) => updateStyle("minWidth", v)} />
            <DimensionInput label="Min H" value={currentStyles.minHeight || "auto"} onChange={(v) => updateStyle("minHeight", v)} />
            <DimensionInput label="Max W" value={currentStyles.maxWidth || "none"} onChange={(v) => updateStyle("maxWidth", v)} />
            <DimensionInput label="Max H" value={currentStyles.maxHeight || "none"} onChange={(v) => updateStyle("maxHeight", v)} />
          </div>
        </div>
        <div className="space-y-1 pt-2">
          <Label className="text-[10px]">Aspect Ratio</Label>
          <div className="flex gap-1">
            {["auto", "1/1", "4/3", "16/9", "3/2", "21/9"].map((r) => (
              <button key={r} className={`flex-1 py-1 text-[8px] rounded border font-medium ${currentStyles.aspectRatio === r ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("aspectRatio", r)}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Object Fit</Label>
          <div className="flex gap-1">
            {["fill", "contain", "cover", "none", "scale-down"].map((f) => (
              <button key={f} className={`flex-1 py-1 text-[8px] rounded border font-medium ${currentStyles.objectFit === f ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("objectFit", f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </StyleSection>

      {/* ── SPACING (4-side) ───────────────────────── */}
      <StyleSection title="Spacing">
        <SpacingSidesInput
          label="Padding"
          top={currentStyles.paddingTop || ""} right={currentStyles.paddingRight || ""} bottom={currentStyles.paddingBottom || ""} left={currentStyles.paddingLeft || ""}
          onChange={(side, val) => updateStyle(`padding${side}`, val)}
        />
        <div className="space-y-0.5">
          <Label className="text-[10px]">Padding (shorthand)</Label>
          <Input value={currentStyles.padding || ""} onChange={(e) => updateStyle("padding", e.target.value)} className="h-7 text-xs" placeholder="0px" />
        </div>
        <Separator className="my-1" />
        <SpacingSidesInput
          label="Margin"
          top={currentStyles.marginTop || ""} right={currentStyles.marginRight || ""} bottom={currentStyles.marginBottom || ""} left={currentStyles.marginLeft || ""}
          onChange={(side, val) => updateStyle(`margin${side}`, val)}
        />
        <div className="space-y-0.5">
          <Label className="text-[10px]">Margin (shorthand)</Label>
          <Input value={currentStyles.margin || ""} onChange={(e) => updateStyle("margin", e.target.value)} className="h-7 text-xs" placeholder="0px" />
        </div>
      </StyleSection>

      {/* ── POSITION ───────────────────────────────── */}
      <StyleSection title="Position" defaultOpen={false}>
        <div className="space-y-1">
          <Label className="text-[10px]">Position</Label>
          <div className="flex gap-1">
            {["static", "relative", "absolute", "fixed", "sticky"].map((p) => (
              <button key={p} className={`flex-1 py-1 text-[8px] rounded border font-medium ${currentStyles.position === p ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("position", p)}>
                {p.slice(0, 4)}
              </button>
            ))}
          </div>
        </div>
        {currentStyles.position && currentStyles.position !== "static" && (
          <div className="grid grid-cols-2 gap-2">
            {["top", "right", "bottom", "left"].map((d) => (
              <div key={d} className="space-y-0.5">
                <Label className="text-[10px] capitalize">{d}</Label>
                <Input value={currentStyles[d] || ""} onChange={(e) => updateStyle(d, e.target.value)} className="h-7 text-xs" placeholder="auto" />
              </div>
            ))}
          </div>
        )}
        <div className="space-y-0.5">
          <Label className="text-[10px]">Z-Index</Label>
          <Input value={currentStyles.zIndex || ""} onChange={(e) => updateStyle("zIndex", e.target.value)} className="h-7 text-xs" placeholder="auto" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Overflow</Label>
          <div className="flex gap-1">
            {["visible", "hidden", "auto", "scroll"].map((o) => (
              <button key={o} className={`flex-1 py-1 text-[9px] rounded border font-medium ${currentStyles.overflow === o ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("overflow", o)}>
                {o}
              </button>
            ))}
          </div>
        </div>
      </StyleSection>

      {/* ── TYPOGRAPHY ─────────────────────────────── */}
      <StyleSection title="Typography">
        <div className="space-y-1">
          <Label className="text-[10px]">Color</Label>
          <div className="flex gap-2">
            <input type="color" value={currentStyles.color?.startsWith("#") ? currentStyles.color : "#000000"} onChange={(e) => updateStyle("color", e.target.value)} className="h-7 w-7 rounded border cursor-pointer" />
            <Input value={currentStyles.color || ""} onChange={(e) => updateStyle("color", e.target.value)} className="h-7 text-xs flex-1" placeholder="inherit" />
          </div>
          {theme && (
            <div className="flex gap-1.5 pt-1">
              {(Object.entries(theme).filter(([k]) => k.includes("Color")) as [string, string][]).map(([k, v]) => (
                <button
                  key={k}
                  className="w-4 h-4 rounded-full border border-border/40 hover:scale-110 transition-transform"
                  style={{ backgroundColor: v }}
                  title={k}
                  onClick={() => updateStyle("color", v)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Font Family</Label>
          <Select value={currentStyles.fontFamily || ""} onValueChange={(v) => updateStyle("fontFamily", v)}>
            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Inherit" /></SelectTrigger>
            <SelectContent>
              {["Inter", "Poppins", "Roboto", "Open Sans", "Lato", "Montserrat", "Playfair Display", "Merriweather", "Source Code Pro", "JetBrains Mono", "system-ui", "serif", "monospace"].map((f) => (
                <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <Label className="text-[10px]">Size</Label>
            <Input value={currentStyles.fontSize || ""} onChange={(e) => updateStyle("fontSize", e.target.value)} className="h-7 text-xs" placeholder="16px" />
          </div>
          <div className="space-y-0.5">
            <Label className="text-[10px]">Weight</Label>
            <Select value={currentStyles.fontWeight?.toString() || ""} onValueChange={(v) => updateStyle("fontWeight", v)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Default" /></SelectTrigger>
              <SelectContent>
                {[{ v: "100", l: "Thin" }, { v: "200", l: "ExtraLight" }, { v: "300", l: "Light" }, { v: "400", l: "Regular" }, { v: "500", l: "Medium" }, { v: "600", l: "SemiBold" }, { v: "700", l: "Bold" }, { v: "800", l: "ExtraBold" }, { v: "900", l: "Black" }].map((w) => (
                  <SelectItem key={w.v} value={w.v} className="text-xs">{w.v} — {w.l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <Label className="text-[10px]">Line Height</Label>
            <Input value={currentStyles.lineHeight || ""} onChange={(e) => updateStyle("lineHeight", e.target.value)} className="h-7 text-xs" placeholder="1.5" />
          </div>
          <div className="space-y-0.5">
            <Label className="text-[10px]">Letter Spacing</Label>
            <Input value={currentStyles.letterSpacing || ""} onChange={(e) => updateStyle("letterSpacing", e.target.value)} className="h-7 text-xs" placeholder="0px" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Text Align</Label>
          <div className="flex gap-1">
            {[{ v: "left", icon: <AlignLeft className="h-3 w-3" /> }, { v: "center", icon: <AlignCenter className="h-3 w-3" /> }, { v: "right", icon: <AlignRight className="h-3 w-3" /> }, { v: "justify", icon: <AlignJustify className="h-3 w-3" /> }].map((a) => (
              <button key={a.v} className={`flex-1 py-1.5 rounded border flex items-center justify-center ${currentStyles.textAlign === a.v ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted text-muted-foreground"}`} onClick={() => updateStyle("textAlign", a.v)}>
                {a.icon}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Style & Decoration</Label>
          <div className="flex gap-1">
            {[
              { v: "italic", prop: "fontStyle", icon: <Italic className="h-3 w-3" />, active: currentStyles.fontStyle === "italic" },
              { v: "underline", prop: "textDecoration", icon: <Underline className="h-3 w-3" />, active: currentStyles.textDecoration === "underline" },
              { v: "line-through", prop: "textDecoration", icon: <Minus className="h-3 w-3" />, active: currentStyles.textDecoration === "line-through" },
            ].map((s) => (
              <button key={s.v} className={`flex-1 py-1.5 rounded border flex items-center justify-center ${s.active ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted text-muted-foreground"}`} onClick={() => updateStyle(s.prop, s.active ? "" : s.v)}>
                {s.icon}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Text Transform</Label>
          <div className="flex gap-1">
            {["none", "uppercase", "lowercase", "capitalize"].map((t) => (
              <button key={t} className={`flex-1 py-1 text-[8px] rounded border font-medium ${currentStyles.textTransform === t ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("textTransform", t)}>
                {t === "none" ? "Aa" : t === "uppercase" ? "AA" : t === "lowercase" ? "aa" : "Aa"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">White Space</Label>
          <Select value={currentStyles.whiteSpace || ""} onValueChange={(v) => updateStyle("whiteSpace", v)}>
            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Normal" /></SelectTrigger>
            <SelectContent>
              {["normal", "nowrap", "pre", "pre-wrap", "pre-line", "break-spaces"].map((w) => (
                <SelectItem key={w} value={w} className="text-xs">{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </StyleSection>

      {/* ── BACKGROUND ─────────────────────────────── */}
      <StyleSection title="Background">
        <div className="space-y-1">
          <Label className="text-[10px]">Color</Label>
          <div className="flex gap-2">
            <input type="color" value={currentStyles.backgroundColor?.startsWith("#") ? currentStyles.backgroundColor : "#ffffff"} onChange={(e) => updateStyle("backgroundColor", e.target.value)} className="h-7 w-7 rounded border cursor-pointer" />
            <Input value={currentStyles.backgroundColor || ""} onChange={(e) => updateStyle("backgroundColor", e.target.value)} className="h-7 text-xs flex-1" placeholder="transparent" />
          </div>
          {theme && (
            <div className="flex gap-1.5 pt-1">
              {(Object.entries(theme).filter(([k]) => k.includes("Color")) as [string, string][]).map(([k, v]) => (
                <button
                  key={k}
                  className="w-4 h-4 rounded-full border border-border/40 hover:scale-110 transition-transform"
                  style={{ backgroundColor: v }}
                  title={k}
                  onClick={() => updateStyle("backgroundColor", v)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Gradient / Image</Label>
          <GradientEditor value={currentStyles.background || ""} onChange={(v) => updateStyle("background", v)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <Label className="text-[10px]">Bg Size</Label>
            <Select value={currentStyles.backgroundSize || ""} onValueChange={(v) => updateStyle("backgroundSize", v)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Auto" /></SelectTrigger>
              <SelectContent>
                {["auto", "cover", "contain", "100% 100%"].map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-0.5">
            <Label className="text-[10px]">Bg Position</Label>
            <Select value={currentStyles.backgroundPosition || ""} onValueChange={(v) => updateStyle("backgroundPosition", v)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Center" /></SelectTrigger>
              <SelectContent>
                {["center", "top", "bottom", "left", "right", "top left", "top right", "bottom left", "bottom right"].map((p) => (
                  <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Bg Repeat</Label>
          <div className="flex gap-1">
            {["no-repeat", "repeat", "repeat-x", "repeat-y"].map((r) => (
              <button key={r} className={`flex-1 py-1 text-[8px] rounded border font-medium ${currentStyles.backgroundRepeat === r ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("backgroundRepeat", r)}>
                {r.replace("repeat", "rpt").replace("no-rpt", "none")}
              </button>
            ))}
          </div>
        </div>
      </StyleSection>

      {/* ── BORDER ─────────────────────────────────── */}
      <StyleSection title="Border">
        <SpacingSidesInput
          label="Width"
          top={currentStyles.borderTopWidth || currentStyles.borderWidth || ""}
          right={currentStyles.borderRightWidth || currentStyles.borderWidth || ""}
          bottom={currentStyles.borderBottomWidth || currentStyles.borderWidth || ""}
          left={currentStyles.borderLeftWidth || currentStyles.borderWidth || ""}
          onChange={(side, val) => updateStyle(`border${side}Width`, val)}
        />
        <div className="space-y-0.5 mt-2">
          <Label className="text-[10px]">Style</Label>
          <Select value={currentStyles.borderStyle || ""} onValueChange={(v) => updateStyle("borderStyle", v)}>
            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              {["none", "solid", "dashed", "dotted", "double", "groove", "ridge"].map((s) => (
                <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 mt-2">
          <Label className="text-[10px]">Color</Label>
          <div className="flex gap-2">
            <input type="color" value={currentStyles.borderColor?.startsWith("#") ? currentStyles.borderColor : "#e2e8f0"} onChange={(e) => updateStyle("borderColor", e.target.value)} className="h-7 w-7 rounded border cursor-pointer" />
            <Input value={currentStyles.borderColor || ""} onChange={(e) => updateStyle("borderColor", e.target.value)} className="h-7 text-xs flex-1" placeholder="transparent" />
          </div>
          {theme && (
            <div className="flex gap-1.5 pt-1">
              {(Object.entries(theme).filter(([k]) => k.includes("Color")) as [string, string][]).map(([k, v]) => (
                <button
                  key={k}
                  className="w-4 h-4 rounded-full border border-border/40 hover:scale-110 transition-transform"
                  style={{ backgroundColor: v }}
                  title={k}
                  onClick={() => updateStyle("borderColor", v)}
                />
              ))}
            </div>
          )}
        </div>
        <Separator className="my-2" />
        <div className="space-y-1">
          <Label className="text-[10px]">Radius</Label>
          <Input value={currentStyles.borderRadius || ""} onChange={(e) => updateStyle("borderRadius", e.target.value)} className="h-7 text-xs" placeholder="0px" />
          <div className="flex gap-1">
            {["0px", "4px", "8px", "12px", "16px", "24px", "9999px"].map((r) => (
              <button key={r} className={`flex-1 py-0.5 text-[8px] rounded border ${currentStyles.borderRadius === r ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("borderRadius", r)}>
                {r === "9999px" ? "Full" : parseInt(r)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"].map((corner) => (
            <div key={corner} className="space-y-0.5">
              <span className="text-[7px] text-muted-foreground block text-center">{corner.replace("border", "").replace("Radius", "").replace(/([A-Z])/g, " $1").trim().split(" ").map(w => w[0]).join("")}</span>
              <Input value={currentStyles[corner] || ""} onChange={(e) => updateStyle(corner, e.target.value)} className="h-6 text-[10px] text-center px-0.5" placeholder="0" />
            </div>
          ))}
        </div>
      </StyleSection>

      {/* ── SHADOW ─────────────────────────────────── */}
      <StyleSection title="Shadow" defaultOpen={false}>
        <ShadowEditor value={currentStyles.boxShadow || ""} onChange={(v) => updateStyle("boxShadow", v)} />
      </StyleSection>

      {/* ── EFFECTS ─────────────────────────────────── */}
      <StyleSection title="Effects" defaultOpen={false}>
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label className="text-[10px]">Opacity</Label>
              <span className="text-[9px] text-muted-foreground">{Math.round((parseFloat(currentStyles.opacity || "1")) * 100)}%</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.01"
              value={currentStyles.opacity || "1"}
              onChange={(e) => updateStyle("opacity", e.target.value)}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Blur</Label>
            <div className="flex gap-2">
              <Input
                value={currentStyles.filter?.replace("blur(", "").replace(")", "") || ""}
                onChange={(e) => updateStyle("filter", e.target.value ? `blur(${e.target.value})` : "")}
                className="h-7 text-xs flex-1" placeholder="0px"
              />
              <div className="flex gap-1">
                {["0px", "4px", "8px", "16px"].map(b => (
                  <button key={b} className="h-7 w-7 rounded border text-[9px] hover:bg-muted" onClick={() => updateStyle("filter", b === "0px" ? "" : `blur(${b})`)}>{parseInt(b)}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Pointer Events</Label>
            <Select value={currentStyles.pointerEvents || ""} onValueChange={(v) => updateStyle("pointerEvents", v)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Auto" /></SelectTrigger>
              <SelectContent>
                {["auto", "none", "all", "inherit"].map(p => (
                  <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </StyleSection>

      {/* ── EFFECTS & TRANSFORMS ───────────────────── */}
      <StyleSection title="Transition" defaultOpen={false}>
        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <Label className="text-[10px]">Opacity</Label>
            <span className="text-[10px] text-muted-foreground font-mono">{Math.round(Number(currentStyles.opacity ?? 1) * 100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={currentStyles.opacity ?? 1} onChange={(e) => updateStyle("opacity", e.target.value)} className="w-full h-1.5 accent-primary" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Cursor</Label>
          <Select value={currentStyles.cursor || ""} onValueChange={(v) => updateStyle("cursor", v)}>
            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Default" /></SelectTrigger>
            <SelectContent>
              {["default", "pointer", "move", "text", "wait", "crosshair", "not-allowed", "grab", "grabbing", "zoom-in", "zoom-out"].map((c) => (
                <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Mix Blend Mode</Label>
          <Select value={currentStyles.mixBlendMode || ""} onValueChange={(v) => updateStyle("mixBlendMode", v)}>
            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Normal" /></SelectTrigger>
            <SelectContent>
              {["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion"].map((m) => (
                <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Separator className="my-1" />
        <p className="text-[10px] font-semibold text-muted-foreground">Transform</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <Label className="text-[10px]">Rotate</Label>
            <Input value={currentStyles.rotate || ""} onChange={(e) => updateStyle("rotate", e.target.value)} className="h-7 text-xs" placeholder="0deg" />
          </div>
          <div className="space-y-0.5">
            <Label className="text-[10px]">Scale</Label>
            <Input value={currentStyles.scale || ""} onChange={(e) => updateStyle("scale", e.target.value)} className="h-7 text-xs" placeholder="1" />
          </div>
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px]">Transform</Label>
          <Input value={currentStyles.transform || ""} onChange={(e) => updateStyle("transform", e.target.value)} className="h-7 text-xs" placeholder="translateX(0) rotate(0deg)" />
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px]">Transform Origin</Label>
          <Input value={currentStyles.transformOrigin || ""} onChange={(e) => updateStyle("transformOrigin", e.target.value)} className="h-7 text-xs" placeholder="center center" />
        </div>
        <Separator className="my-1" />
        <p className="text-[10px] font-semibold text-muted-foreground">Filters</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <Label className="text-[10px]">Blur</Label>
            <Input value={currentStyles.filter?.match(/blur\(([^)]*)\)/)?.[1] || ""} onChange={(e) => { const v = e.target.value; updateStyle("filter", v ? `blur(${v})` : "") }} className="h-7 text-xs" placeholder="0px" />
          </div>
          <div className="space-y-0.5">
            <Label className="text-[10px]">Brightness</Label>
            <Input value={currentStyles.filter?.match(/brightness\(([^)]*)\)/)?.[1] || ""} onChange={(e) => { const v = e.target.value; const existing = (currentStyles.filter || "").replace(/brightness\([^)]*\)\s*/g, ""); updateStyle("filter", v ? `${existing} brightness(${v})`.trim() : existing.trim()) }} className="h-7 text-xs" placeholder="1" />
          </div>
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px]">Backdrop Filter (Glass)</Label>
          <Input value={currentStyles.backdropFilter || ""} onChange={(e) => updateStyle("backdropFilter", e.target.value)} className="h-7 text-xs" placeholder="blur(10px)" />
          <div className="flex gap-1">
            {[
              { label: "Glass SM", value: "blur(4px)" },
              { label: "Glass MD", value: "blur(10px)" },
              { label: "Glass LG", value: "blur(20px)" },
              { label: "None", value: "" },
            ].map((g) => (
              <button key={g.label} className={`flex-1 py-0.5 text-[8px] rounded border ${currentStyles.backdropFilter === g.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("backdropFilter", g.value)}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </StyleSection>

      {/* ── TRANSITION & ANIMATION ─────────────────── */}
      <StyleSection title="Transition" defaultOpen={false}>
        <div className="space-y-0.5">
          <Label className="text-[10px]">Transition</Label>
          <Input value={currentStyles.transition || ""} onChange={(e) => updateStyle("transition", e.target.value)} className="h-7 text-xs" placeholder="all 0.3s ease" />
          <div className="flex gap-1 flex-wrap">
            {[
              { label: "Fast", value: "all 0.15s ease" },
              { label: "Normal", value: "all 0.3s ease" },
              { label: "Slow", value: "all 0.5s ease" },
              { label: "Bounce", value: "all 0.3s cubic-bezier(0.68,-0.55,0.27,1.55)" },
              { label: "None", value: "none" },
            ].map((t) => (
              <button key={t.label} className={`py-0.5 px-2 text-[9px] rounded border ${currentStyles.transition === t.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("transition", t.value)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px]">Animation</Label>
          <Input value={currentStyles.animation || ""} onChange={(e) => updateStyle("animation", e.target.value)} className="h-7 text-xs" placeholder="fadeIn 0.5s ease" />
        </div>
      </StyleSection>
    </div>
  )
}

// ── Layer Tree with Drag-and-Drop Reordering ─────────
function LayerTree({ nodes, selectedId, onSelect, onRemove, onDuplicate, onToggleVisibility, onReorder, depth }: {
  nodes: WBNode[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
  onToggleVisibility: (id: string) => void
  onReorder: (from: number, to: number) => void
  depth: number
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)

  return (
    <div className="space-y-0.5">
      {nodes.map((node, idx) => {
        const hasChildren = node.children && node.children.length > 0
        const isCollapsed = collapsed.has(node.id)
        const isSelected = selectedId === node.id
        const isDragOver = overIdx === idx && dragIdx !== idx

        return (
          <div key={node.id}>
            <div
              draggable
              onDragStart={(e) => { e.stopPropagation(); setDragIdx(idx); e.dataTransfer.effectAllowed = "move" }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setOverIdx(idx) }}
              onDragLeave={() => setOverIdx(null)}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (dragIdx !== null && dragIdx !== idx) onReorder(dragIdx, idx)
                setDragIdx(null)
                setOverIdx(null)
              }}
              onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
              className={`flex items-center gap-1 px-1 py-1 rounded text-xs cursor-pointer group transition-colors ${isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                } ${isDragOver ? "border-t-2 border-primary" : ""}`}
              style={{ paddingLeft: `${depth * 12 + 4}px` }}
              onClick={() => onSelect(node.id)}
            >
              {hasChildren ? (
                <button
                  className="w-4 h-4 flex items-center justify-center shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    const next = new Set(collapsed)
                    if (isCollapsed) next.delete(node.id)
                    else next.add(node.id)
                    setCollapsed(next)
                  }}
                >
                  {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              ) : (
                <span className="w-4 shrink-0" />
              )}
              <GripVertical className="h-3 w-3 text-muted-foreground/50 shrink-0 cursor-grab" />
              <span className="w-4 h-4 shrink-0 flex items-center justify-center text-muted-foreground">
                {getBlockIcon(node.type) ? <span className="[&>svg]:h-3 [&>svg]:w-3">{getBlockIcon(node.type)}</span> : null}
              </span>
              <span className={`truncate flex-1 font-medium ${node.hidden ? "opacity-40 line-through" : ""}`}>{BLOCK_REGISTRY.find((b) => b.type === node.type)?.label || node.type}</span>
              <div className="hidden group-hover:flex items-center gap-0.5">
                <button className="p-0.5 rounded hover:bg-muted" onClick={(e) => { e.stopPropagation(); onToggleVisibility(node.id) }} title={node.hidden ? "Show" : "Hide"}>
                  {node.hidden ? <EyeOff className="h-3 w-3 text-muted-foreground" /> : <Eye className="h-3 w-3 text-muted-foreground" />}
                </button>
                <button className="p-0.5 rounded hover:bg-muted" onClick={(e) => { e.stopPropagation(); onDuplicate(node.id) }}>
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </button>
                <button className="p-0.5 rounded hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onRemove(node.id) }}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            </div>
            {hasChildren && !isCollapsed && (
              <LayerTree
                nodes={node.children!}
                selectedId={selectedId}
                onSelect={onSelect}
                onRemove={onRemove}
                onDuplicate={onDuplicate}
                onToggleVisibility={onToggleVisibility}
                onReorder={onReorder}
                depth={depth + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Breadcrumbs ──────────────────────────────────────
function NodeBreadcrumbs({ node, nodes, onSelect }: { node: WBNode, nodes: WBNode[], onSelect: (id: string) => void }) {
  const path = getNodePath(nodes, node.id)
  if (path.length <= 1) return null

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border rounded-full shadow-lg pointer-events-auto">
      {path.map((item, i) => (
        <React.Fragment key={item.id}>
          <button
            className={`text-[10px] font-medium transition-colors hover:text-primary whitespace-nowrap ${i === path.length - 1 ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => onSelect(item.id)}
          >
            {BLOCK_REGISTRY.find(b => b.type === item.type)?.label || item.type}
          </button>
          {i < path.length - 1 && <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/30" />}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────
function findNodeById(nodes: WBNode[], id: string): WBNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNodeById(n.children, id)
      if (found) return found
    }
  }
  return null
}

function assignNewIds(node: WBNode): WBNode {
  return {
    ...node,
    id: `${node.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    children: node.children?.map(assignNewIds),
  }
}

function getNodePath(nodes: WBNode[], targetId: string): WBNode[] {
  for (const n of nodes) {
    if (n.id === targetId) return [n]
    if (n.children) {
      const childPath = getNodePath(n.children, targetId)
      if (childPath.length > 0) return [n, ...childPath]
    }
  }
  return []
}

function findParentNode(nodes: WBNode[], targetId: string): WBNode | null {
  for (const n of nodes) {
    if (n.children?.some((c) => c.id === targetId)) return n
    if (n.children) {
      const found = findParentNode(n.children, targetId)
      if (found) return found
    }
  }
  return null
}

function getSiblings(nodes: WBNode[], targetId: string): WBNode[] {
  const parent = findParentNode(nodes, targetId)
  return parent?.children || nodes
}

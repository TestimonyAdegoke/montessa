"use client"

import React, { useEffect, useCallback, useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, Undo2, Redo2, Save, Rocket, Eye, EyeOff, Loader2,
  Monitor, Tablet, Smartphone, Grid3X3, ZoomIn, ZoomOut
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useEditorStore } from "@/lib/website-builder/editor-store"
import { createNode } from "@/lib/website-builder/block-registry"
import { 
  savePageContent, 
  publishPage 
} from "@/lib/actions/website-builder"
import type { WBNode, WBComponent, WBCmsCollection, WBThemeTokens } from "@/lib/website-builder/types"

import { SidebarLeft } from "./sidebar-left"
import { SidebarRight } from "./sidebar-right"
import { Canvas } from "./canvas"

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
}

interface Props {
  page: PageData
  site: SiteData
  userId: string
}

export default function PageEditor({ page, site, userId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [previewMode, setPreviewMode] = useState(false)

  const {
    nodes, setNodes, selectedNodeId, selectNode, multiSelectedIds, toggleSelectNode, clearMultiSelect,
    viewport, setViewport, zoom, setZoom, showGrid, toggleGrid,
    leftPanel, setLeftPanel, rightPanel, setRightPanel,
    uiMode, setUiMode,
    addNode, updateNode, updateNodeProps, updateNodeStyles, updateNodesProps, updateNodesStyles, removeNode, duplicateNode, reorderNodes,
    undo, redo, pushHistory, resetHistory, historyIndex, redoDepth, isDirty, setDirty, setPageId, moveNode,
    components, setComponents, insertComponent,
    copyNode, pasteNode,
  } = useEditorStore()

  useEffect(() => {
    setPageId(page.id)
    try {
      const content = typeof page.content === "string" ? JSON.parse(page.content) : page.content
      setNodes(Array.isArray(content) ? content : [])
    } catch {
      setNodes([])
    }
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
      if (e.key === "Delete") {
        if (multiSelectedIds.size > 0) { multiSelectedIds.forEach((id) => removeNode(id)); clearMultiSelect() }
        else if (selectedNodeId) { removeNode(selectedNodeId) }
      }
      if (e.key === "Escape") {
        if (previewMode) setPreviewMode(false)
        else if (selectedNodeId) {
          selectNode(null)
          clearMultiSelect()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") { e.preventDefault(); setPreviewMode((v) => !v) }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedNodeId, nodes, multiSelectedIds, previewMode, undo, redo, removeNode, clearMultiSelect, selectNode, handleSave])

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null
    return findNodeById(nodes, selectedNodeId)
  }, [nodes, selectedNodeId])

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

  const [inlineEdit, setInlineEdit] = useState<{ id: string; prop: string; value: string } | null>(null)
  const [insertIndex, setInsertIndex] = useState<number | null>(null)

  const handleInlineEditStart = (id: string, prop: string, value: string) => {
    setInlineEdit({ id, prop, value })
  }

  const handleInlineEditChange = (val: string) => {
    setInlineEdit((prev) => (prev ? { ...prev, value: val } : null))
  }

  const handleInlineEditCommit = () => {
    if (inlineEdit) {
      updateNodeProps(inlineEdit.id, { [inlineEdit.prop]: inlineEdit.value })
      setInlineEdit(null)
    }
  }

  const handleUpdateItemField = (nodeId: string, fieldName: string, itemIndex: number, key: string, value: string) => {
    const node = findNodeById(nodes, nodeId)
    if (!node) return

    const list = [...(node.props[fieldName] || [])]
    if (list[itemIndex]) {
      list[itemIndex] = { ...list[itemIndex], [key]: value }
      updateNodeProps(nodeId, { [fieldName]: list })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const blockType = e.dataTransfer.getData("wb-block-type")
    if (blockType) {
      addNode(createNode(blockType))
    }
  }

  const handleReorder = (fromId: string, toIndex: number) => {
    // Only support root level reordering for now as Canvas/Renderer only supports it at root
    const fromIndex = nodes.findIndex((n) => n.id === fromId)
    if (fromIndex !== -1) {
      reorderNodes(null, fromIndex, toIndex)
    }
  }

  const handleInsertAt = (index: number) => {
    setInsertIndex(index)
    setLeftPanel("insert")
  }

  const handleAddBlock = (type: string) => {
    addNode(createNode(type), undefined, insertIndex ?? undefined)
    setInsertIndex(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col h-screen w-screen overflow-hidden text-foreground">
      {/* Top Bar */}
      <div className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/website-builder">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex === 0} className="h-8 w-8"><Undo2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={redoDepth === 0} className="h-8 w-8"><Redo2 className="h-4 w-4" /></Button>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs font-bold uppercase tracking-widest truncate max-w-[200px]">{page.title}</span>
        </div>

        {/* Viewport & Zoom Controls */}
        <div className="flex items-center gap-1">
          {(["desktop", "tablet", "mobile"] as const).map((v) => (
            <Button
              key={v}
              variant={viewport === v ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewport(v)}
              title={v.charAt(0).toUpperCase() + v.slice(1)}
            >
              {v === "desktop" && <Monitor className="h-4 w-4" />}
              {v === "tablet" && <Tablet className="h-4 w-4" />}
              {v === "mobile" && <Smartphone className="h-4 w-4" />}
            </Button>
          ))}
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(zoom - 0.1)} disabled={zoom <= 0.25}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-[10px] font-bold w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(zoom + 0.1)} disabled={zoom >= 2}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant={showGrid ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={toggleGrid}>
            <Grid3X3 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant={previewMode ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setPreviewMode(!previewMode)}
            className="h-8 text-[10px] uppercase font-bold tracking-widest"
          >
            {previewMode ? <EyeOff className="h-3.5 w-3.5 mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
            {previewMode ? "Edit Mode" : "Preview"}
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <Button 
            onClick={handleSave} 
            disabled={!isDirty || saveStatus === "saving"} 
            size="sm"
            variant="ghost"
            className="h-8 text-[10px] uppercase font-bold tracking-widest"
          >
            {saveStatus === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            {saveStatus === "saved" ? "Saved" : "Save"}
          </Button>
          <Button 
            onClick={handlePublish} 
            disabled={isPending} 
            size="sm"
            className="h-8 text-[10px] uppercase font-bold tracking-widest shadow-lg shadow-primary/20"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Rocket className="h-3.5 w-3.5 mr-1.5" />}
            Publish
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {!previewMode && (
          <SidebarLeft
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={selectNode}
            onAddBlock={handleAddBlock}
            onDeleteNode={removeNode}
            onReorderNodes={reorderNodes}
            pages={site.pages as any || []}
            currentPageId={page.id}
            onSelectPage={(id) => router.push(`/dashboard/website-builder/editor/${id}`)}
            components={components}
            onInsertComponent={insertComponent}
            activeTab={leftPanel || "layers"}
            onTabChange={(tab) => setLeftPanel(tab as any)}
          />
        )}

        <Canvas
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={selectNode}
          onUpdateNodeProps={updateNodeProps}
          onDeleteNode={removeNode}
          theme={themeTokens as any}
          previewMode={previewMode}
          components={components}
          cmsCollections={site.cmsCollections || []}
          inlineEditId={inlineEdit?.id}
          inlineEditPropKey={inlineEdit?.prop}
          inlineEditValue={inlineEdit?.value}
          onInlineEditChange={handleInlineEditChange}
          onInlineEditBlur={handleInlineEditCommit}
          onRequestInlineEdit={handleInlineEditStart}
          onUpdateItemField={handleUpdateItemField}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onReorder={handleReorder}
          onInsertAt={handleInsertAt}
        />

        {!previewMode && (
          <SidebarRight
            selectedNode={selectedNode}
            onUpdateProps={updateNodeProps}
            onUpdateStyles={updateNodeStyles}
            onUpdateVariables={(id, vars) => updateNode(id, { variables: vars })}
            cmsCollections={site.cmsCollections || []}
            viewport={viewport}
          />
        )}
      </div>
    </div>
  )
}

function findNodeById(nodes: WBNode[], id: string): WBNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

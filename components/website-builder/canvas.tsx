"use client"

import { useState, useRef, useEffect } from "react"
import { WBNode, WBThemeTokens } from "@/lib/website-builder/types"
import { WBRenderer } from "@/lib/website-builder/renderer"
import { cn, hexToHSL } from "@/lib/utils"
import { Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, ArrowUp, ArrowDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CanvasProps {
  nodes: WBNode[]
  selectedNodeId: string | null
  onSelectNode: (id: string | null) => void
  onUpdateNodeProps: (id: string, props: Record<string, any>) => void
  onDeleteNode: (id: string) => void
  theme: WBThemeTokens | null
  previewMode?: boolean
  components?: any[]
  cmsCollections?: any[]
  inlineEditId?: string | null
  inlineEditPropKey?: string | null
  inlineEditValue?: string
  onInlineEditChange?: (value: string) => void
  onInlineEditBlur?: () => void
  onRequestInlineEdit?: (nodeId: string, propKey: string, initialValue: string) => void
  onUpdateItemField?: (nodeId: string, fieldName: string, itemIndex: number, key: string, value: string) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onReorder?: (fromId: string, toIndex: number) => void
  onInsertAt?: (index: number) => void
}

export const Canvas = ({ 
  nodes, 
  selectedNodeId, 
  onSelectNode, 
  onUpdateNodeProps, 
  onDeleteNode,
  theme,
  previewMode = false,
  components = [],
  cmsCollections = [],
  inlineEditId,
  inlineEditPropKey,
  inlineEditValue,
  onInlineEditChange,
  onInlineEditBlur,
  onRequestInlineEdit,
  onUpdateItemField,
  onDragOver,
  onDrop,
  onReorder,
  onInsertAt
}: CanvasProps) => {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scale logic from SiteBuilder
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight
      const targetWidth = device === "desktop" ? 1440 : device === "tablet" ? 768 : 375
      
      const s = (containerWidth - 64) / targetWidth 
      setScale(Math.min(s, 1))
    }
    updateScale()
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [device])

  const targetWidth = device === "desktop" ? "1440px" : device === "tablet" ? "768px" : "375px"

  return (
    <div className="flex-1 flex flex-col h-full bg-muted/10 relative overflow-hidden">
      {/* Viewport Toolbar */}
      {!previewMode && (
        <div className="h-12 border-b bg-background/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-40">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button variant={device === "desktop" ? "secondary" : "ghost"} size="sm" className="h-7 w-9 p-0" onClick={() => setDevice("desktop")}><Monitor className="h-4 w-4" /></Button>
            <Button variant={device === "tablet" ? "secondary" : "ghost"} size="sm" className="h-7 w-9 p-0" onClick={() => setDevice("tablet")}><Tablet className="h-4 w-4" /></Button>
            <Button variant={device === "mobile" ? "secondary" : "ghost"} size="sm" className="h-7 w-9 p-0" onClick={() => setDevice("mobile")}><Smartphone className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-widest">{Math.round(scale * 100)}%</span>
            <div className="h-4 w-px bg-border mx-1" />
            <span className="text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-widest">{targetWidth}</span>
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div 
        ref={containerRef} 
        className={cn(
          "flex-1 w-full relative overflow-auto flex flex-col items-center p-8 transition-all scrollbar-hide",
          previewMode && "p-0 bg-background"
        )}
        onClick={() => onSelectNode(null)}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div
          className={cn(
            "bg-background transition-all duration-300 origin-top shadow-2xl relative min-h-full",
            previewMode ? "w-full shadow-none" : ""
          )}
          style={{
            width: previewMode ? "100%" : targetWidth,
            transform: previewMode ? "none" : `scale(${scale})`,
            "--primary": theme?.primaryColor ? hexToHSL(theme.primaryColor) : undefined,
            "--secondary": theme?.secondaryColor ? hexToHSL(theme.secondaryColor) : undefined,
            "--accent": theme?.accentColor ? hexToHSL(theme.accentColor) : undefined,
          } as React.CSSProperties}
          onClick={(e) => e.stopPropagation()}
        >
          <WBRenderer
            nodes={nodes}
            theme={theme}
            isEditor={!previewMode}
            selectedNodeId={selectedNodeId}
            onNodeClick={(id) => onSelectNode(id)}
            viewport={device}
            components={components}
            cmsCollections={cmsCollections}
            inlineEditId={inlineEditId}
            inlineEditPropKey={inlineEditPropKey}
            inlineEditValue={inlineEditValue}
            onInlineEditChange={onInlineEditChange}
            onInlineEditBlur={onInlineEditBlur}
            onRequestInlineEdit={onRequestInlineEdit}
            onUpdateItemField={onUpdateItemField}
            onDragReorder={onReorder}
            onInsertAt={onInsertAt}
          />

          {/* Selection Overlays & Controls are handled inside WBRenderer for better precision, 
              but we could add snapping guides here if needed */}
        </div>
      </div>
    </div>
  )
}

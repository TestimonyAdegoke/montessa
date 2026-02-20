"use client"

import React, { useRef, useEffect, useCallback, useState } from "react"
import type { WBNode, WBThemeTokens, WBComponent, WBCmsCollection, WBCmsBinding } from "./types"
import { resolveCmsBinding } from "./cms-lite"
import { motion, AnimatePresence } from "framer-motion"
import * as Icons from "lucide-react"

// ── Icon Helper ──────────────────────────────────────
function LucideIcon({ name, className, style, size = 20 }: { name: string; className?: string; style?: React.CSSProperties; size?: number }) {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle
  return <IconComponent className={className} style={style} size={size} />
}


// ── Floating Rich-Text Toolbar ───────────────────────
function FloatingTextToolbar({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    function update() {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !targetRef.current?.contains(sel.anchorNode)) {
        setShow(false)
        return
      }
      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
      setShow(true)
    }
    document.addEventListener("selectionchange", update)
    return () => document.removeEventListener("selectionchange", update)
  }, [targetRef])

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    targetRef.current?.focus()
  }

  if (!show || !pos) return null

  return (
    <div
      className="fixed z-[200] flex items-center gap-0.5 bg-popover border rounded-lg shadow-xl px-1 py-0.5 animate-in fade-in-0 zoom-in-95"
      style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -100%)" }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {[
        { cmd: "bold", label: "B", cls: "font-bold" },
        { cmd: "italic", label: "I", cls: "italic" },
        { cmd: "underline", label: "U", cls: "underline" },
        { cmd: "strikeThrough", label: "S", cls: "line-through" },
      ].map((b) => (
        <button
          key={b.cmd}
          onClick={() => exec(b.cmd)}
          className={`w-7 h-7 flex items-center justify-center rounded text-xs hover:bg-muted transition-colors ${b.cls}`}
          title={b.cmd}
        >
          {b.label}
        </button>
      ))}
      <div className="w-px h-5 bg-border mx-0.5" />
      {[
        { cmd: "justifyLeft", label: "≡L" },
        { cmd: "justifyCenter", label: "≡C" },
        { cmd: "justifyRight", label: "≡R" },
      ].map((b) => (
        <button
          key={b.cmd}
          onClick={() => exec(b.cmd)}
          className="w-7 h-7 flex items-center justify-center rounded text-[10px] hover:bg-muted transition-colors"
          title={b.cmd}
        >
          {b.label}
        </button>
      ))}
      <div className="w-px h-5 bg-border mx-0.5" />
      <input
        type="color"
        className="w-6 h-6 rounded cursor-pointer border-0 p-0"
        title="Text color"
        onChange={(e) => exec("foreColor", e.target.value)}
      />
    </div>
  )
}

// ── ContentEditable wrapper ──────────────────────────
function EditableText({
  value,
  onChange,
  onBlur,
  tagName = "span",
  className,
  style,
}: {
  value: string
  onChange: (val: string) => void
  onBlur: () => void
  tagName?: string
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLElement>(null)
  const isComposing = useRef(false)

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value
    }
  }, []) // Only set initial value

  const handleInput = useCallback(() => {
    if (!isComposing.current && ref.current) {
      onChange(ref.current.textContent || "")
    }
  }, [onChange])

  const handleBlur = useCallback(() => {
    if (ref.current) {
      onChange(ref.current.textContent || "")
    }
    onBlur()
  }, [onChange, onBlur])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
        ; (e.target as HTMLElement).blur()
    }
  }, [])

  return (
    <>
      {React.createElement(tagName, {
        ref,
        contentEditable: true,
        suppressContentEditableWarning: true,
        className,
        style: { ...style, outline: "none", cursor: "text", minWidth: "1ch" },
        onInput: handleInput,
        onBlur: handleBlur,
        onKeyDown: handleKeyDown,
        onCompositionStart: () => { isComposing.current = true },
        onCompositionEnd: () => { isComposing.current = false; handleInput() },
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      })}
      <FloatingTextToolbar targetRef={ref} />
    </>
  )
}

// ── Hydration-safe Countdown Widget ─────────────────────
function CountdownWidget({ editorProps, p, theme }: { editorProps: any; p: Record<string, any>; theme?: WBThemeTokens | null }) {
  const [mounted, setMounted] = useState(false)
  const [diff, setDiff] = useState(0)

  useEffect(() => {
    setMounted(true)
    const target = new Date(p.targetDate || Date.now() + 86400000).getTime()
    const tick = () => setDiff(Math.max(0, target - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [p.targetDate])

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  const units = [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Minutes" },
    { value: seconds, label: "Seconds" },
  ]

  return (
    <section {...editorProps} className="py-12 px-4 text-center">
      {p.title && <h2 className="text-2xl font-bold mb-6">{p.title}</h2>}
      <div className="flex items-center justify-center gap-4">
        {units.map((u) => (
          <div key={u.label} className={p.style === "cards" ? "bg-white shadow-lg rounded-xl p-4 min-w-[80px]" : p.style === "minimal" ? "text-center" : ""} style={{ borderRadius: theme?.cardRadius }}>
            <div className="text-3xl md:text-4xl font-extrabold" style={{ color: theme?.primaryColor || "#4F46E5" }} suppressHydrationWarning>
              {mounted ? String(u.value).padStart(2, "0") : "--"}
            </div>
            {p.showLabels !== false && <div className="text-xs uppercase tracking-wider mt-1" style={{ color: theme?.mutedColor }}>{u.label}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Interactive Tabs Widget ─────────────────────────────
function TabsWidget({ editorProps, p, theme }: { editorProps: any; p: Record<string, any>; theme?: WBThemeTokens | null }) {
  const [activeTab, setActiveTab] = useState(0)
  const tabItems: { title: string; content: string }[] = Array.isArray(p.items) ? p.items : []

  return (
    <section {...editorProps} className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className={`flex gap-1 mb-6 ${p.variant === "pills" ? "" : p.variant === "boxed" ? "bg-gray-100 p-1 rounded-lg" : "border-b"}`}>
          {tabItems.map((tab, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActiveTab(i) }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${i === activeTab
                ? p.variant === "pills" ? "text-white rounded-full" : p.variant === "boxed" ? "bg-white rounded-md shadow-sm" : "border-b-2 text-foreground"
                : p.variant === "pills" ? "text-gray-500 hover:text-gray-700" : p.variant === "boxed" ? "text-gray-500 hover:text-gray-700" : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
                }`}
              style={i === activeTab && p.variant === "pills" ? { backgroundColor: theme?.primaryColor || "#4F46E5" } : i === activeTab && p.variant !== "boxed" ? { borderColor: theme?.primaryColor || "#4F46E5" } : undefined}
            >
              {tab.title}
            </button>
          ))}
        </div>
        {tabItems[activeTab] && (
          <div className="text-sm leading-relaxed" style={{ color: theme?.mutedColor }}>{tabItems[activeTab].content}</div>
        )}
      </div>
    </section>
  )
}

// ── Entrance Animation Wrapper ──────────────────────────
function AnimateOnScroll({ children, animation = "none" }: { children: React.ReactNode; animation?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(animation === "none")

  useEffect(() => {
    if (animation === "none") return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [animation])

  if (animation === "none") return <>{children}</>

  const animClass =
    animation === "fade-up" ? "translate-y-8 opacity-0" :
      animation === "fade-in" ? "opacity-0" :
        animation === "slide-left" ? "-translate-x-8 opacity-0" :
          animation === "slide-right" ? "translate-x-8 opacity-0" :
            animation === "zoom-in" ? "scale-95 opacity-0" : ""

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 translate-x-0 scale-100 opacity-100" : animClass}`}
    >
      {children}
    </div>
  )
}

// ── Inline Item Text (for editing array items on canvas) ─
function InlineItemText({ text, className, style, onCommit }: {
  text: string; className?: string; style?: React.CSSProperties
  onCommit: (val: string) => void
}) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (ref.current && ref.current.textContent !== text) ref.current.textContent = text
  }, [])
  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={className}
      style={{ ...style, outline: "none", cursor: "text" }}
      onBlur={() => { if (ref.current) onCommit(ref.current.textContent || "") }}
      onKeyDown={(e) => { if (e.key === "Escape") (e.target as HTMLElement).blur() }}
      onClick={(e) => e.stopPropagation()}
    />
  )
}

const TEXT_SIZE_CLASS: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
}

const MD_GRID_COLS_CLASS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
}

function getTextSizeClass(size: unknown): string {
  if (typeof size !== "string") return TEXT_SIZE_CLASS.base
  return TEXT_SIZE_CLASS[size] || TEXT_SIZE_CLASS.base
}

function getMdGridColsClass(cols: unknown, fallback: number): string {
  const n = typeof cols === "number" ? cols : Number(cols)
  const clamped = Number.isFinite(n) ? Math.max(1, Math.min(6, Math.round(n))) : fallback
  return MD_GRID_COLS_CLASS[clamped]
}

// ─────────────────────────────────────────────────────────
// Public Renderer — Converts JSON node tree to React
// ─────────────────────────────────────────────────────────

interface RendererProps {
  nodes: WBNode[]
  theme?: WBThemeTokens | null
  components?: WBComponent[]
  cmsCollections?: WBCmsCollection[]
  menus?: Array<{ location?: string; items?: Array<{ id?: string; label?: string; href?: string; pageSlug?: string; children?: Array<{ id?: string; label?: string; href?: string; pageSlug?: string }> }> }>
  isEditor?: boolean
  viewport?: "desktop" | "tablet" | "mobile"
  onNodeClick?: (id: string, shiftKey?: boolean) => void
  onNodeHover?: (id: string | null) => void
  selectedNodeId?: string | null
  multiSelectedIds?: Set<string>
  hoveredNodeId?: string | null
  onNodeContextMenu?: (id: string, x: number, y: number) => void
  onNodeDoubleClick?: (id: string) => void
  inlineEditId?: string | null
  inlineEditPropKey?: string | null
  inlineEditValue?: string
  onInlineEditChange?: (value: string) => void
  onInlineEditBlur?: () => void
  onRequestInlineEdit?: (nodeId: string, propKey: string, initialValue: string) => void
  onInsertAt?: (index: number) => void
  onDragReorder?: (fromId: string, toIndex: number) => void
  onUpdateItemField?: (nodeId: string, fieldName: string, itemIndex: number, key: string, value: string) => void
  cmsItem?: { id: string; slug: string; fieldData: Record<string, any> } | null
}

// ── Floating insert button between blocks ────────────
function InsertSlot({ index, onInsert }: { index: number; onInsert: (i: number) => void }) {
  const [visible, setVisible] = React.useState(false)
  return (
    <div
      className="relative h-0 flex items-center justify-center z-20"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ margin: "0 auto", width: "100%" }}
    >
      <div className="absolute inset-x-0 top-[-6px] h-[12px]" />
      {visible && (
        <button
          onClick={(e) => { e.stopPropagation(); onInsert(index) }}
          className="absolute flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform z-30"
          style={{ top: "-12px" }}
          title="Insert block here"
        >
          <span className="text-sm font-bold leading-none">+</span>
        </button>
      )}
      {visible && (
        <div className="absolute inset-x-4 top-0 h-[2px] bg-primary/40 rounded" style={{ top: "-1px" }} />
      )}
    </div>
  )
}

// ── Canvas drag-reorder drop zone ────────────────────
function DropZone({ index, onDrop }: { index: number; onDrop: (toIndex: number) => void }) {
  const [over, setOver] = React.useState(false)
  return (
    <div
      className={`h-1 transition-all ${over ? "h-3 bg-primary/20 border-2 border-dashed border-primary rounded" : ""}`}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setOver(false); const fromId = e.dataTransfer.getData("wb-reorder-id"); if (fromId) onDrop(index) }}
    />
  )
}

export function WBRenderer({ nodes, theme, components, cmsCollections, menus, isEditor, viewport, onNodeClick, onNodeHover, selectedNodeId, multiSelectedIds, hoveredNodeId, onNodeContextMenu, onNodeDoubleClick, inlineEditId, inlineEditPropKey, inlineEditValue, onInlineEditChange, onInlineEditBlur, onRequestInlineEdit, onInsertAt, onDragReorder, onUpdateItemField, cmsItem }: RendererProps) {
  return (
    <div className="wb-renderer" style={{ fontFamily: theme?.bodyFont || "Inter, sans-serif" }}>
      {nodes.map((node, idx) => (
        <React.Fragment key={node.id}>
          {isEditor && onInsertAt && <InsertSlot index={idx} onInsert={onInsertAt} />}
          {isEditor && onDragReorder && <DropZone index={idx} onDrop={(toIdx) => onDragReorder(node.id, toIdx)} />}
          <RenderNode
            node={node}
            theme={theme}
            components={components}
            cmsCollections={cmsCollections}
            menus={menus}
            isEditor={isEditor}
            viewport={viewport}
            onNodeClick={onNodeClick}
            onNodeHover={onNodeHover}
            selectedNodeId={selectedNodeId}
            multiSelectedIds={multiSelectedIds}
            hoveredNodeId={hoveredNodeId}
            onNodeContextMenu={onNodeContextMenu}
            onNodeDoubleClick={onNodeDoubleClick}
            inlineEditId={inlineEditId}
            inlineEditPropKey={inlineEditPropKey}
            inlineEditValue={inlineEditValue}
            onInlineEditChange={onInlineEditChange}
            onInlineEditBlur={onInlineEditBlur}
            onRequestInlineEdit={onRequestInlineEdit}
            onUpdateItemField={onUpdateItemField}
          />
        </React.Fragment>
      ))}
      {isEditor && onInsertAt && nodes.length > 0 && <InsertSlot index={nodes.length} onInsert={onInsertAt} />}
      {isEditor && onDragReorder && nodes.length > 0 && <DropZone index={nodes.length} onDrop={(toIdx) => onDragReorder("", toIdx)} />}
    </div>
  )
}

// Merge base styles with responsive overrides + resolve node variables
function getComputedStyles(node: WBNode, viewport?: string): React.CSSProperties {
  const base = node.styles?.base || {}
  let styles: React.CSSProperties
  if (!viewport || viewport === "desktop") {
    styles = { ...base }
  } else {
    const tabletOverrides = node.styles?.tablet || {}
    const mobileOverrides = node.styles?.mobile || {}
    styles = viewport === "tablet" ? { ...base, ...tabletOverrides } : { ...base, ...tabletOverrides, ...mobileOverrides }
  }
  // Resolve node-level variables (stack variables pattern)
  if (node.variables?.length) {
    for (const v of node.variables) {
      if (!v.bindTo) continue
      const val = (viewport && viewport !== "desktop" && v.responsiveValues?.[viewport] !== undefined)
        ? v.responsiveValues[viewport]
        : v.defaultValue
      if (val !== undefined && val !== "" && val !== null) {
        (styles as any)[v.bindTo] = val
      }
    }
  }
  return styles
}

interface RenderNodeProps {
  node: WBNode
  theme?: WBThemeTokens | null
  components?: WBComponent[]
  cmsCollections?: WBCmsCollection[]
  menus?: Array<{ location?: string; items?: Array<{ id?: string; label?: string; href?: string; pageSlug?: string; children?: Array<{ id?: string; label?: string; href?: string; pageSlug?: string }> }> }>
  isEditor?: boolean
  viewport?: "desktop" | "tablet" | "mobile"
  onNodeClick?: (id: string, shiftKey?: boolean) => void
  onNodeHover?: (id: string | null) => void
  selectedNodeId?: string | null
  multiSelectedIds?: Set<string>
  hoveredNodeId?: string | null
  onNodeContextMenu?: (id: string, x: number, y: number) => void
  onNodeDoubleClick?: (id: string) => void
  inlineEditId?: string | null
  inlineEditPropKey?: string | null
  inlineEditValue?: string
  onInlineEditChange?: (value: string) => void
  onInlineEditBlur?: () => void
  onRequestInlineEdit?: (nodeId: string, propKey: string, initialValue: string) => void
  onUpdateItemField?: (nodeId: string, fieldName: string, itemIndex: number, key: string, value: string) => void
}

function applyComponentOverrides(nodes: WBNode[], overrides: Record<string, any>): WBNode[] {
  return nodes.map((node) => {
    const nextProps = { ...(node.props || {}) }
    if (node.componentNodeId) {
      const prefix = `${node.componentNodeId}:`
      for (const [key, value] of Object.entries(overrides || {})) {
        if (!key.startsWith(prefix)) continue
        const propKey = key.slice(prefix.length)
        nextProps[propKey] = value
      }
    }
    return {
      ...node,
      props: nextProps,
      children: node.children ? applyComponentOverrides(node.children, overrides) : undefined,
    }
  })
}

const ANIMATION_VARIANTS: Record<string, any> = {
  "fade-in": { initial: { opacity: 0 }, animate: { opacity: 1 } },
  "slide-up": { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
  "slide-down": { initial: { opacity: 0, y: -30 }, animate: { opacity: 1, y: 0 } },
  "slide-left": { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 } },
  "slide-right": { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 } },
  "scale-up": { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
  "pop": { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, transition: { type: "spring", damping: 12 } },
  "rotate-in": { initial: { opacity: 0, rotate: -15, scale: 0.9 }, animate: { opacity: 1, rotate: 0, scale: 1 } },
  "swing": { animate: { rotate: [0, 5, -5, 0] }, transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } },
  "bounce": { animate: { y: [0, -10, 0] }, transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } },
  "pulse": { animate: { scale: [1, 1.05, 1] }, transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } },
  "float": { animate: { y: [0, -15, 0] }, transition: { repeat: Infinity, duration: 4, ease: "linear" } },
}

function RenderNode({ node, theme, components, cmsCollections, menus, isEditor, viewport, onNodeClick, onNodeHover, selectedNodeId, multiSelectedIds, hoveredNodeId, onNodeContextMenu, onNodeDoubleClick, inlineEditId, inlineEditPropKey, inlineEditValue, onInlineEditChange, onInlineEditBlur, onRequestInlineEdit, onUpdateItemField }: RenderNodeProps) {
  if (node.hidden) return null

  // Responsive visibility — hide blocks based on viewport
  const p_vis = node.props || {}
  if (!isEditor && viewport === "mobile" && p_vis.hideOnMobile) return null
  if (!isEditor && viewport === "tablet" && p_vis.hideOnTablet) return null
  if (!isEditor && viewport === "desktop" && p_vis.hideOnDesktop) return null

  const isSelected = selectedNodeId === node.id || (multiSelectedIds?.has(node.id) ?? false)
  const isMultiSelected = multiSelectedIds?.has(node.id) ?? false
  const isHovered = hoveredNodeId === node.id
  const isInlineEditing = inlineEditId === node.id
  const computedStyles = getComputedStyles(node, viewport)

  // ── Interactions ───────────────────────────────────
  const interactions: any[] = node.props?._interactions || []
  let motionProps: any = {}

  if (!isEditor && interactions.length > 0) {
    interactions.forEach(inter => {
      const variant = ANIMATION_VARIANTS[inter.animation] || ANIMATION_VARIANTS["fade-in"]
      const transition = {
        duration: inter.duration || 0.5,
        delay: inter.delay || 0,
        ...variant.transition
      }

      if (inter.trigger === "in-view") {
        motionProps.initial = variant.initial
        motionProps.whileInView = variant.animate
        motionProps.viewport = { once: true, margin: "-10% 0px" }
        motionProps.transition = transition
      } else if (inter.trigger === "hover") {
        motionProps.whileHover = variant.animate
        motionProps.transition = transition
      } else if (inter.trigger === "tap") {
        motionProps.whileTap = variant.animate
        motionProps.transition = transition
      } else if (inter.trigger === "loop") {
        motionProps.animate = variant.animate
        motionProps.transition = transition
      }
    })
  }

  // ── Hover / Press / Focus Styles (State) ──────────
  const hoverStyles = node.styles?.hover
  if (!isEditor && hoverStyles && Object.keys(hoverStyles).length > 0) {
    motionProps.whileHover = { ...(motionProps.whileHover || {}), ...hoverStyles }
    if (!motionProps.transition) motionProps.transition = { duration: 0.2, ease: "easeInOut" }
  }
  const pressStyles = node.styles?.press
  if (!isEditor && pressStyles && Object.keys(pressStyles).length > 0) {
    motionProps.whileTap = { ...(motionProps.whileTap || {}), ...pressStyles }
    if (!motionProps.transition) motionProps.transition = { duration: 0.1, ease: "easeInOut" }
  }
  const focusStyles = node.styles?.focus
  if (!isEditor && focusStyles && Object.keys(focusStyles).length > 0) {
    motionProps.whileFocus = { ...(motionProps.whileFocus || {}), ...focusStyles }
    if (!motionProps.transition) motionProps.transition = { duration: 0.2, ease: "easeInOut" }
  }

  const editorProps = isEditor
    ? {
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); onNodeClick?.(node.id, e.shiftKey) },
      onDoubleClick: (e: React.MouseEvent) => { e.stopPropagation(); onNodeDoubleClick?.(node.id) },
      onContextMenu: (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onNodeContextMenu?.(node.id, e.clientX, e.clientY) },
      onMouseEnter: (e: React.MouseEvent) => { e.stopPropagation(); onNodeHover?.(node.id) },
      onMouseLeave: () => onNodeHover?.(null),
      draggable: true,
      onDragStart: (e: React.DragEvent) => { e.dataTransfer.setData("wb-reorder-id", node.id); e.dataTransfer.effectAllowed = "move" },
      "data-wb-id": node.id,
      "data-wb-type": node.type,
      style: {
        ...computedStyles,
        outline: isMultiSelected ? "2px solid #7C3AED" : isSelected ? "2px solid #4F46E5" : isHovered ? "1px dashed #94A3B8" : undefined,
        outlineOffset: isSelected ? "2px" : undefined,
        position: "relative" as const,
        cursor: isSelected ? "grab" : "pointer",
      },
    }
    : {
      style: computedStyles,
      ...motionProps
    }

  const Wrapper = motion.div

  const childRenderer = (children?: WBNode[]) =>
    children?.map((child) => (
      <RenderNode
        key={child.id}
        node={child}
        theme={theme}
        components={components}
        cmsCollections={cmsCollections}
        menus={menus}
        isEditor={isEditor}
        viewport={viewport}
        onNodeClick={onNodeClick}
        onNodeHover={onNodeHover}
        selectedNodeId={selectedNodeId}
        multiSelectedIds={multiSelectedIds}
        hoveredNodeId={hoveredNodeId}
        onNodeContextMenu={onNodeContextMenu}
        onNodeDoubleClick={onNodeDoubleClick}
        inlineEditId={inlineEditId}
        inlineEditPropKey={inlineEditPropKey}
        inlineEditValue={inlineEditValue}
        onInlineEditChange={onInlineEditChange}
        onInlineEditBlur={onInlineEditBlur}
        onRequestInlineEdit={onRequestInlineEdit}
        onUpdateItemField={onUpdateItemField}
      />
    ))

  // ── CMS data resolution: inject collection items at runtime ──
  const CMS_TARGET: Record<string, string> = { features: "items", testimonials: "items", pricing: "items", faq: "items", timeline: "items", stats: "items", team: "members", gallery: "images", logos: "logos", accordion: "items", tabs: "items" }
  const rawProps = node.props || {}
  const p = (() => {
    if (!cmsCollections?.length) return rawProps
    // ── Binding v2: structured _cmsBinding ──
    const binding: WBCmsBinding | undefined = rawProps._cmsBinding
    if (binding && binding.collectionId && binding.map) {
      const col = cmsCollections.find((c) => c.id === binding.collectionId)
      if (!col) return rawProps
      let items = [...col.items]
      // Sort
      if (binding.query?.sort) {
        const { field, direction } = binding.query.sort
        items.sort((a, b) => {
          const va = a[field] ?? ""; const vb = b[field] ?? ""
          return direction === "desc" ? (vb > va ? 1 : -1) : (va > vb ? 1 : -1)
        })
      }
      // Filter
      if (binding.query?.filter) {
        for (const [fk, fv] of Object.entries(binding.query.filter)) {
          if (fv !== undefined && fv !== "" && fv !== null) items = items.filter((i) => String(i[fk]).toLowerCase().includes(String(fv).toLowerCase()))
        }
      }
      // Search
      if (binding.query?.search) {
        const q = binding.query.search.toLowerCase()
        items = items.filter((i) => Object.values(i).some((v) => String(v).toLowerCase().includes(q)))
      }
      // Offset + Limit
      const offset = binding.query?.offset || 0
      const limit = binding.query?.limit || 0
      if (offset > 0) items = items.slice(offset)
      if (limit > 0) items = items.slice(0, limit)
      // Map fields
      const mapped = items.map((item) => {
        const out: Record<string, any> = { _id: item._id || item.id, _slug: item._slug || item.slug }
        for (const [blockField, cmsField] of Object.entries(binding.map)) {
          out[blockField] = item[cmsField] ?? ""
        }
        return out
      })
      if (mapped.length === 0) return rawProps
      // Detail mode: return first item's fields directly as props
      if (binding.mode === "detail" && mapped.length > 0) {
        return { ...rawProps, ...mapped[0] }
      }
      const targetField = CMS_TARGET[node.type]
      if (!targetField) return rawProps
      return { ...rawProps, [targetField]: mapped }
    }
    // ── Legacy binding: _cmsCollection + _cmsFieldMap ──
    if (!rawProps._cmsCollection || !rawProps._cmsFieldMap) return rawProps
    const resolved = resolveCmsBinding(cmsCollections, rawProps._cmsCollection, rawProps._cmsFieldMap, rawProps._cmsLimit || undefined)
    if (resolved.length === 0) return rawProps
    const targetField = CMS_TARGET[node.type]
    if (!targetField) return rawProps
    return { ...rawProps, [targetField]: resolved }
  })()

  switch (node.type) {
    // ── Reusable Component Instance ────────────────────
    case "componentInstance": {
      const componentId = p.componentId
      const component = components?.find((c) => c.id === componentId)
      const overrides = p.overrides && typeof p.overrides === "object" ? p.overrides : {}

      if (!component) {
        return (
          <motion.div
            {...editorProps}
            className="p-3 rounded-lg border border-dashed text-xs text-muted-foreground"
            style={isEditor ? editorProps.style : computedStyles}
          >
            Missing component source ({p.componentName || componentId || "unknown"})
          </motion.div>
        )
      }

      // Variant support: pick variant sourceNodes if _variantId is set
      let baseNodes = component.sourceNodes || []
      if (p._variantId && component.variants?.length) {
        const variant = component.variants.find((v) => v.id === p._variantId)
        if (variant) baseNodes = variant.sourceNodes
      }

      const resolvedSource = applyComponentOverrides(baseNodes, overrides)
      return (
        <motion.div {...editorProps} style={isEditor ? editorProps.style : computedStyles}>
          {resolvedSource.map((sourceNode) => (
            <RenderNode
              key={`${node.id}:${sourceNode.id}`}
              node={sourceNode}
              theme={theme}
              components={components}
              menus={menus}
              isEditor={false}
              viewport={viewport}
              onUpdateItemField={onUpdateItemField}
            />
          ))}
        </motion.div>
      )
    }

    // ── Layout ──────────────────────────────────────
    case "section": {
      const bgStyle: React.CSSProperties = {}
      if (p.background && p.background !== "transparent") bgStyle.backgroundColor = p.background
      if (p.backgroundImage) {
        bgStyle.backgroundImage = `url(${p.backgroundImage})`
        bgStyle.backgroundSize = "cover"
        bgStyle.backgroundPosition = "center"
      }
      const sectionEl = (
        <motion.section {...editorProps} id={p.id || undefined} className={`${p.paddingY || "py-16"} ${p.paddingX || "px-4"} relative`} style={{ ...editorProps.style, ...bgStyle }}>
          {p.overlay && p.backgroundImage && (
            <div className="absolute inset-0" style={{ backgroundColor: p.overlayColor || "rgba(0,0,0,0.5)" }} />
          )}
          <div className={`relative ${p.fullWidth ? "w-full" : `${p.maxWidth || "max-w-7xl"} mx-auto`}`}>
            {childRenderer(node.children)}
          </div>
        </motion.section>
      )
      return p.animation && !isEditor ? <AnimateOnScroll animation={p.animation}>{sectionEl}</AnimateOnScroll> : sectionEl
    }

    case "container":
      return (
        <motion.div {...editorProps} className={`${p.maxWidth || "max-w-7xl"} mx-auto ${p.padding || ""}`}>
          {childRenderer(node.children)}
        </motion.div>
      )

    case "columns":
      return (
        <motion.div {...editorProps} className={`grid grid-cols-1 ${getMdGridColsClass(p.columns, 2)} ${p.gap || "gap-8"} ${p.align || "items-start"}`}>
          {childRenderer(node.children)}
        </motion.div>
      )

    case "column":
      return (
        <motion.div {...editorProps} className={p.padding || ""}>
          {childRenderer(node.children)}
        </motion.div>
      )

    case "stack": {
      const direction = p.direction === "row" ? "flex-row" : "flex-col"
      const align = p.align === "center" ? "items-center" : p.align === "end" ? "items-end" : p.align === "stretch" ? "items-stretch" : "items-start"
      const justify = p.justify === "center" ? "justify-center" : p.justify === "end" ? "justify-end" : p.justify === "between" ? "justify-between" : p.justify === "around" ? "justify-around" : "justify-start"
      const wrap = p.wrap === "wrap" ? "flex-wrap" : "flex-nowrap"
      // Sizing model
      const sizingStyle: React.CSSProperties = {}
      const wm = p.widthMode || "fill"
      if (wm === "fill") sizingStyle.width = "100%"
      else if (wm === "hug") sizingStyle.width = "auto"
      else if (wm === "fixed" && p.fixedWidth) sizingStyle.width = p.fixedWidth.includes("px") ? p.fixedWidth : `${p.fixedWidth}px`
      const hm = p.heightMode || "hug"
      if (hm === "fill") sizingStyle.height = "100%"
      else if (hm === "hug") sizingStyle.height = "auto"
      else if (hm === "fixed" && p.fixedHeight) sizingStyle.height = p.fixedHeight.includes("px") ? p.fixedHeight : `${p.fixedHeight}px`
      if (p.minWidth) sizingStyle.minWidth = p.minWidth
      if (p.maxWidth) sizingStyle.maxWidth = p.maxWidth
      if (p.minHeight) sizingStyle.minHeight = p.minHeight
      if (p.maxHeight) sizingStyle.maxHeight = p.maxHeight
      if (p.position && p.position !== "static") sizingStyle.position = p.position
      if (p.zIndex) sizingStyle.zIndex = parseInt(p.zIndex) || undefined
      if (p.overflow && p.overflow !== "visible") sizingStyle.overflow = p.overflow

      return (
        <motion.div
          {...editorProps}
          className={`flex ${direction} ${align} ${justify} ${wrap} ${p.gap || "gap-4"} ${p.padding || "p-4"}`}
          style={{ ...editorProps.style, ...sizingStyle }}
        >
          {childRenderer(node.children)}
        </motion.div>
      )
    }

    case "spacer":
      return <motion.div {...editorProps} className={p.height || "h-8"} />

    case "divider":
      return (
        <motion.hr {...editorProps} style={{ ...editorProps.style, borderColor: p.color || "#e2e8f0", borderWidth: p.thickness || "1px", width: p.width || "100%" }} />
      )

    // ── Content ─────────────────────────────────────
    case "heading": {
      const Tag = (p.level || "h2")
      const MotionTag = (motion as any)[Tag] || motion.h2
      const sizeMap: Record<string, string> = { h1: "text-4xl md:text-5xl font-extrabold", h2: "text-3xl md:text-4xl font-bold", h3: "text-2xl md:text-3xl font-bold", h4: "text-xl md:text-2xl font-semibold" }
      const isThisInline = isInlineEditing && (inlineEditPropKey || "text") === "text"
      if (isThisInline) {
        return (
          <motion.div {...editorProps} className={`${sizeMap[Tag] || sizeMap.h2} tracking-tight`} style={{ ...editorProps.style, textAlign: p.align || "left", color: p.color || undefined }}>
            <EditableText
              value={inlineEditValue || ""}
              onChange={(val) => onInlineEditChange?.(val)}
              onBlur={() => onInlineEditBlur?.()}
              tagName="span"
              style={{ font: "inherit", color: "inherit", letterSpacing: "inherit", display: "block" }}
            />
          </motion.div>
        )
      }
      return (
        <MotionTag {...editorProps} className={`${sizeMap[Tag] || sizeMap.h2} tracking-tight`} style={{ ...editorProps.style, textAlign: p.align || "left", color: p.color || undefined }}>
          {isEditor && isSelected && onRequestInlineEdit ? (
            <span
              className="cursor-text"
              onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "text", String(p.text || "")) }}
            >
              {p.text}
            </span>
          ) : p.text}
        </MotionTag>
      )
    }

    case "paragraph":
      {
      const isThisInline = isInlineEditing && (inlineEditPropKey || "text") === "text"
      if (isThisInline) {
        return (
          <motion.div {...editorProps} className={`${getTextSizeClass(p.size)} leading-relaxed`} style={{ ...editorProps.style, textAlign: p.align || "left", color: p.color || undefined }}>
            <EditableText
              value={inlineEditValue || ""}
              onChange={(val) => onInlineEditChange?.(val)}
              onBlur={() => onInlineEditBlur?.()}
              tagName="span"
              style={{ font: "inherit", color: "inherit", lineHeight: "inherit", display: "block", whiteSpace: "pre-wrap" }}
            />
          </motion.div>
        )
      }
      return (
        <motion.p {...editorProps} className={`${getTextSizeClass(p.size)} leading-relaxed`} style={{ ...editorProps.style, textAlign: p.align || "left", color: p.color || undefined }}>
          {isEditor && isSelected && onRequestInlineEdit ? (
            <span
              className="cursor-text"
              onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "text", String(p.text || "")) }}
            >
              {p.text}
            </span>
          ) : p.text}
        </motion.p>
      )
      }

    case "richtext":
      return <div {...editorProps} className="prose max-w-none" dangerouslySetInnerHTML={{ __html: p.html || "" }} />

    case "button": {
      const variantClasses: Record<string, string> = {
        primary: "text-white hover:opacity-90",
        secondary: "bg-gray-800 text-white hover:bg-gray-700",
        outline: "border-2 bg-transparent hover:bg-gray-50",
        ghost: "bg-transparent hover:bg-gray-100",
      }
      const sizeClasses: Record<string, string> = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" }
      const hoverClasses: Record<string, string> = {
        lift: "hover:-translate-y-1 hover:shadow-lg",
        scale: "hover:scale-105",
        glow: "hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]",
      }
      const btnStyle: React.CSSProperties = { ...editorProps.style }
      if (p.variant === "primary") btnStyle.backgroundColor = theme?.primaryColor || "#4F46E5"
      if (p.variant === "outline") btnStyle.borderColor = theme?.primaryColor || "#4F46E5"
      const handleBtnClick = !isEditor
        ? (e: React.MouseEvent) => {
          if (p.clickAction === "scroll") {
            const targetId = p.scrollTarget || (typeof p.href === "string" && p.href.startsWith("#") ? p.href.slice(1) : "")
            if (targetId) {
              e.preventDefault()
              document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })
            }
            return
          }

          if (p.clickAction === "open-url" && p.href) {
            e.preventDefault()
            const target = p.openInNewTab ? "_blank" : "_self"
            window.open(p.href, target, p.openInNewTab ? "noopener,noreferrer" : undefined)
          }
        }
        : undefined
      return (
        <div style={{ textAlign: p.align || "left" }}>
          <motion.a
            {...editorProps}
            href={isEditor ? undefined : p.href}
            target={p.openInNewTab ? "_blank" : undefined}
            rel={p.openInNewTab ? "noopener noreferrer" : undefined}
            className={`inline-flex items-center justify-center rounded-lg font-semibold transition-all ${variantClasses[p.variant || "primary"]} ${sizeClasses[p.size || "md"]} ${hoverClasses[p.hoverEffect] || ""}`}
            style={{ ...btnStyle, borderRadius: theme?.buttonRadius || "0.5rem" }}
            onClick={handleBtnClick}
          >
            {(isInlineEditing && (inlineEditPropKey || "text") === "text") ? (
              <EditableText
                value={inlineEditValue || ""}
                onChange={(val) => onInlineEditChange?.(val)}
                onBlur={() => onInlineEditBlur?.()}
                tagName="span"
                style={{ font: "inherit", color: "inherit" }}
              />
            ) : (isEditor && isSelected && onRequestInlineEdit ? (
              <span
                className="cursor-text"
                onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "text", String(p.text || "")) }}
              >
                {p.text}
              </span>
            ) : p.text)}
          </motion.a>
        </div>
      )
    }

    case "list": {
      const items: string[] = Array.isArray(p.items) ? p.items : []
      const ListTagName = p.ordered ? "ol" : "ul"
      const MotionList = (motion as any)[ListTagName] || motion.ul
      return (
        <MotionList {...editorProps} className={`space-y-2 ${p.ordered ? "list-decimal" : "list-none"} pl-0`}>
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              {p.icon === "check" && <span className="text-green-500 mt-1">✓</span>}
              {p.icon === "arrow" && <span className="mt-1">→</span>}
              {p.icon === "star" && <span className="text-yellow-500 mt-1">★</span>}
              <span>{item}</span>
            </li>
          ))}
        </MotionList>
      )
    }

    case "badge":
      return (
        <motion.span {...editorProps} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${p.color === "primary" ? "text-white" :
          p.color === "secondary" ? "bg-gray-200 text-gray-800" :
            p.color === "success" ? "bg-green-100 text-green-800" :
              p.color === "warning" ? "bg-yellow-100 text-yellow-800" :
                p.color === "danger" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
          }`} style={{ ...editorProps.style, backgroundColor: p.color === "primary" ? (theme?.primaryColor || "#4F46E5") : undefined }}>
          {p.text}
        </motion.span>
      )

    // ── Media ───────────────────────────────────────
    case "image":
      return p.src ? (
        <motion.img {...editorProps} src={p.src} alt={p.alt || ""} className={`${p.rounded || "rounded-lg"} w-full`} style={{ ...editorProps.style, objectFit: p.objectFit || "cover" }} />
      ) : (
        <motion.div {...editorProps} className={`${p.rounded || "rounded-lg"} bg-gray-200 flex items-center justify-center aspect-video`}>
          <span className="text-gray-400 text-sm">No image selected</span>
        </motion.div>
      )

    case "video":
      return (
        <motion.video {...editorProps} src={p.src} poster={p.poster} controls={p.controls} autoPlay={p.autoplay} loop={p.loop} muted={p.muted} className="w-full rounded-lg" />
      )

    case "embed":
      return (
        <motion.div {...editorProps} className="relative w-full" style={{ ...editorProps.style, aspectRatio: p.aspectRatio || "16/9" }}>
          {p.url ? (
            <iframe src={p.url} className="absolute inset-0 w-full h-full rounded-lg" allowFullScreen />
          ) : (
            <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">Enter embed URL</span>
            </div>
          )}
        </motion.div>
      )

    // ── Hero ────────────────────────────────────────
    case "hero": {
      const bgStyle: React.CSSProperties = { minHeight: "500px" }
      if (p.backgroundImage) {
        bgStyle.backgroundImage = `url(${p.backgroundImage})`
        bgStyle.backgroundSize = "cover"
        bgStyle.backgroundPosition = "center"
      } else {
        bgStyle.background = `linear-gradient(135deg, ${theme?.primaryColor || "#4F46E5"} 0%, ${theme?.secondaryColor || "#7C3AED"} 100%)`
      }
      const heroEl = (
        <motion.section {...editorProps} className="relative flex items-center overflow-hidden" style={{ ...editorProps.style, ...bgStyle }}>
          {p.overlay && <div className="absolute inset-0" style={{ backgroundColor: p.overlayColor || "rgba(0,0,0,0.4)" }} />}
          <div className={`relative z-10 w-full max-w-7xl mx-auto px-4 py-20 ${p.align === "center" ? "text-center" : p.align === "right" ? "text-right" : "text-left"}`}>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6"
            >
              {isEditor && isSelected && onRequestInlineEdit ? (
                <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "title", String(p.title || "")) }}>
                  {p.title}
                </span>
              ) : p.title}
            </motion.h1>
            {p.subtitle && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-xl md:text-2xl text-white/90 max-w-3xl mb-8 mx-auto"
              >
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "subtitle", String(p.subtitle || "")) }}>
                    {p.subtitle}
                  </span>
                ) : p.subtitle}
              </motion.p>
            )}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className={`flex gap-4 ${p.align === "center" ? "justify-center" : p.align === "right" ? "justify-end" : "justify-start"}`}
            >
              {p.ctaText && (
                <a href={isEditor ? undefined : p.ctaHref} className="inline-flex items-center px-8 py-4 rounded-lg text-lg font-semibold text-white transition-all hover:scale-105" style={{ backgroundColor: theme?.accentColor || "#F59E0B", borderRadius: theme?.buttonRadius }}>
                  {isEditor && isSelected && onRequestInlineEdit ? (
                    <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "ctaText", String(p.ctaText || "")) }}>
                      {p.ctaText}
                    </span>
                  ) : p.ctaText}
                </a>
              )}
              {p.ctaSecondaryText && (
                <a href={isEditor ? undefined : p.ctaSecondaryHref} className="inline-flex items-center px-8 py-4 rounded-lg text-lg font-semibold text-white border-2 border-white/50 hover:bg-white/10 transition-all">
                  {isEditor && isSelected && onRequestInlineEdit ? (
                    <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "ctaSecondaryText", String(p.ctaSecondaryText || "")) }}>
                      {p.ctaSecondaryText}
                    </span>
                  ) : p.ctaSecondaryText}
                </a>
              )}
            </motion.div>
          </div>
        </motion.section>
      )
      return (interactions.length > 0 || isEditor) ? heroEl : (p.animation ? <AnimateOnScroll animation={p.animation}>{heroEl}</AnimateOnScroll> : heroEl)
    }

    // ── Features ────────────────────────────────────
    case "features": {
      const items: any[] = Array.isArray(p.items) ? p.items : []
      const featuresEl = (
        <motion.section {...editorProps} className="py-16 px-4" style={editorProps.style}>
          <div className="max-w-7xl mx-auto">
            {p.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "title", String(p.title || "")) }}>
                    {p.title}
                  </span>
                ) : p.title}
              </h2>
            )}
            {p.subtitle && (
              <p className="text-lg text-center max-w-2xl mx-auto mb-12" style={{ color: theme?.mutedColor }}>
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "subtitle", String(p.subtitle || "")) }}>
                    {p.subtitle}
                  </span>
                ) : p.subtitle}
              </p>
            )}
            <div className={`grid grid-cols-1 ${getMdGridColsClass(p.columns, 3)} gap-8`}>
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="p-6 rounded-xl border bg-white/50 hover:shadow-xl transition-shadow"
                  style={{ borderRadius: theme?.cardRadius }}
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white" style={{ backgroundColor: theme?.primaryColor || "#4F46E5" }}>
                    <LucideIcon name={item.icon} size={24} />
                  </div>
                  {isEditor && isSelected && onUpdateItemField ? (
                    <>
                      <h3 className="text-lg font-semibold mb-2">
                        <InlineItemText text={item.title} onCommit={(v) => onUpdateItemField(node.id, "items", i, "title", v)} />
                      </h3>
                      <p style={{ color: theme?.mutedColor }}>
                        <InlineItemText text={item.description} onCommit={(v) => onUpdateItemField(node.id, "items", i, "description", v)} />
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p style={{ color: theme?.mutedColor }}>{item.description}</p>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )
      return p.animation && !isEditor ? <AnimateOnScroll animation={p.animation}>{featuresEl}</AnimateOnScroll> : featuresEl
    }

    // ── Testimonials ────────────────────────────────
    case "testimonials": {
      const items: any[] = Array.isArray(p.items) ? p.items : []
      return (
        <motion.section {...editorProps} className="py-16 px-4" style={{ ...editorProps.style, backgroundColor: theme?.surfaceColor }}>
          <div className="max-w-7xl mx-auto">
            {p.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "title", String(p.title || "")) }}>
                    {p.title}
                  </span>
                ) : p.title}
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="p-6 rounded-xl bg-white shadow-sm border"
                  style={{ borderRadius: theme?.cardRadius }}
                >
                  <p className="text-lg italic mb-4">
                    &ldquo;
                    {isEditor && isSelected && onUpdateItemField ? (
                      <InlineItemText text={String(item.quote || "")} onCommit={(v) => onUpdateItemField(node.id, "items", i, "quote", v)} />
                    ) : String(item.quote || "")}
                    &rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: theme?.primaryColor || "#4F46E5" }}>
                      {item.author?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {isEditor && isSelected && onUpdateItemField ? (
                          <InlineItemText text={String(item.author || "")} onCommit={(v) => onUpdateItemField(node.id, "items", i, "author", v)} />
                        ) : String(item.author || "")}
                      </p>
                      <p className="text-xs" style={{ color: theme?.mutedColor }}>
                        {isEditor && isSelected && onUpdateItemField ? (
                          <InlineItemText text={String(item.role || "")} onCommit={(v) => onUpdateItemField(node.id, "items", i, "role", v)} />
                        ) : String(item.role || "")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )
    }

    // ── Pricing ─────────────────────────────────────
    case "pricing": {
      const items: any[] = Array.isArray(p.items) ? p.items : []
      return (
        <motion.section {...editorProps} className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {p.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "title", String(p.title || "")) }}>
                    {p.title}
                  </span>
                ) : p.title}
              </h2>
            )}
            {p.subtitle && (
              <p className="text-lg text-center max-w-2xl mx-auto mb-12" style={{ color: theme?.mutedColor }}>
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "subtitle", String(p.subtitle || "")) }}>
                    {p.subtitle}
                  </span>
                ) : p.subtitle}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`p-8 rounded-xl border-2 ${item.highlighted ? "shadow-xl scale-105" : "shadow-sm"}`}
                  style={{ borderColor: item.highlighted ? (theme?.primaryColor || "#4F46E5") : "#e2e8f0", borderRadius: theme?.cardRadius }}
                >
                  <h3 className="text-xl font-bold mb-2">
                    {isEditor && isSelected && onUpdateItemField ? (
                      <InlineItemText text={String(item.name || "")} onCommit={(v) => onUpdateItemField(node.id, "items", i, "name", v)} />
                    ) : String(item.name || "")}
                  </h3>
                  <p className="text-3xl font-extrabold mb-6" style={{ color: theme?.primaryColor }}>
                    {isEditor && isSelected && onUpdateItemField ? (
                      <InlineItemText text={String(item.price || "")} onCommit={(v) => onUpdateItemField(node.id, "items", i, "price", v)} />
                    ) : String(item.price || "")}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {(item.features || []).map((f: string, j: number) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <LucideIcon name="Check" className="text-green-500" size={16} /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 rounded-lg font-bold transition-all ${item.highlighted ? "text-white" : "border-2"}`}
                    style={{
                      backgroundColor: item.highlighted ? (theme?.primaryColor || "#4F46E5") : "transparent",
                      borderColor: !item.highlighted ? (theme?.primaryColor || "#4F46E5") : "transparent",
                      color: !item.highlighted ? (theme?.primaryColor || "#4F46E5") : "white"
                    }}
                  >
                    Select Plan
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )
    }

    // ── CTA ─────────────────────────────────────────
    case "cta": {
      const bgMap: Record<string, React.CSSProperties> = {
        primary: { backgroundColor: theme?.primaryColor || "#4F46E5" },
        dark: { backgroundColor: "#0F172A" },
        light: { backgroundColor: theme?.surfaceColor || "#F8FAFC" },
        gradient: { background: `linear-gradient(135deg, ${theme?.primaryColor || "#4F46E5"} 0%, ${theme?.secondaryColor || "#7C3AED"} 100%)` },
      }
      const isLight = p.background === "light"
      const ctaEl = (
        <motion.section {...editorProps} className="py-20 px-4 overflow-hidden" style={{ ...editorProps.style, ...bgMap[p.background || "primary"] }}>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`text-3xl md:text-4xl font-bold mb-4 ${isLight ? "" : "text-white"}`}
            >
              {p.title}
            </motion.h2>
            {p.subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className={`text-lg mb-8 ${isLight ? "" : "text-white/80"}`}
              >
                {p.subtitle}
              </motion.p>
            )}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <a href={isEditor ? undefined : p.buttonHref} className={`inline-flex items-center px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105 shadow-lg ${isLight ? "text-white" : "text-gray-900 bg-white"}`} style={{ backgroundColor: isLight ? (theme?.primaryColor || "#4F46E5") : undefined, borderRadius: theme?.buttonRadius }}>
                {p.buttonText}
              </a>
            </motion.div>
          </div>
        </motion.section>
      )
      return (interactions.length > 0 || isEditor) ? ctaEl : (p.animation ? <AnimateOnScroll animation={p.animation}>{ctaEl}</AnimateOnScroll> : ctaEl)
    }

    // ── FAQ ─────────────────────────────────────────
    case "faq": {
      const items: any[] = Array.isArray(p.items) ? p.items : []
      return (
        <motion.section {...editorProps} className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            {p.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "title", String(p.title || "")) }}>
                    {p.title}
                  </span>
                ) : p.title}
              </h2>
            )}
            <div className="space-y-4">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <details className="group border rounded-xl p-4" style={{ borderRadius: theme?.cardRadius }}>
                    <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                      {isEditor && isSelected && onUpdateItemField ? (
                        <InlineItemText text={item.question} onCommit={(v) => onUpdateItemField(node.id, "items", i, "question", v)} />
                      ) : item.question}
                      <span className="text-xl group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <div className="mt-3 pt-3 border-t overflow-hidden transition-all duration-300 group-open:max-h-96" style={{ color: theme?.mutedColor }}>
                      {isEditor && isSelected && onUpdateItemField ? (
                        <InlineItemText text={item.answer} onCommit={(v) => onUpdateItemField(node.id, "items", i, "answer", v)} />
                      ) : item.answer}
                    </div>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )
    }

    // ── Gallery ─────────────────────────────────────
    case "gallery": {
      const images: any[] = Array.isArray(p.images) ? p.images : []
      return (
        <motion.section {...editorProps} className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {p.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "title", String(p.title || "")) }}>
                    {p.title}
                  </span>
                ) : p.title}
              </h2>
            )}
            <div className={`grid grid-cols-1 ${getMdGridColsClass(p.columns, 3)} ${p.gap || "gap-4"}`}>
              {images.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`overflow-hidden ${p.rounded || "rounded-lg"}`}
                >
                  {img.src ? (
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      src={img.src}
                      alt={img.alt || ""}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center"><span className="text-gray-400 text-sm">Image {i + 1}</span></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )
    }

    // ── Stats ───────────────────────────────────────
    case "stats": {
      const items: any[] = Array.isArray(p.items) ? p.items : []
      const bgStyle: React.CSSProperties = p.background === "primary" ? { backgroundColor: theme?.primaryColor || "#4F46E5" } : p.background === "surface" ? { backgroundColor: theme?.surfaceColor } : {}
      const isColoredBg = p.background === "primary"
      return (
        <motion.section {...editorProps} className="py-12 px-4" style={{ ...editorProps.style, ...bgStyle }}>
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {isEditor && isSelected && onUpdateItemField ? (
                  <>
                    <p className={`text-3xl md:text-4xl font-extrabold ${isColoredBg ? "text-white" : ""}`}>
                      <InlineItemText text={item.value} onCommit={(v) => onUpdateItemField(node.id, "items", i, "value", v)} />
                    </p>
                    <p className={`text-sm mt-1 ${isColoredBg ? "text-white/70" : ""}`} style={{ color: isColoredBg ? undefined : theme?.mutedColor }}>
                      <InlineItemText text={item.label} onCommit={(v) => onUpdateItemField(node.id, "items", i, "label", v)} />
                    </p>
                  </>
                ) : (
                  <>
                    <p className={`text-3xl md:text-4xl font-extrabold ${isColoredBg ? "text-white" : ""}`}>{item.value}</p>
                    <p className={`text-sm mt-1 ${isColoredBg ? "text-white/70" : ""}`} style={{ color: isColoredBg ? undefined : theme?.mutedColor }}>{item.label}</p>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      )
    }

    // ── Contact ─────────────────────────────────────
    case "contact":
      return (
        <motion.section {...editorProps} className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {p.title && (
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-center mb-12"
              >
                {p.title}
              </motion.h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {p.address && <div><h3 className="font-semibold mb-1">Address</h3><p style={{ color: theme?.mutedColor }}>{p.address}</p></div>}
                {p.phone && <div><h3 className="font-semibold mb-1">Phone</h3><p style={{ color: theme?.mutedColor }}>{p.phone}</p></div>}
                {p.email && <div><h3 className="font-semibold mb-1">Email</h3><p style={{ color: theme?.mutedColor }}>{p.email}</p></div>}
                {p.mapEmbed && <iframe src={p.mapEmbed} className="w-full h-64 rounded-lg border-0 shadow-sm" />}
              </motion.div>
              {p.showForm && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-xl border bg-white/50 backdrop-blur-sm"
                  style={{ borderRadius: theme?.cardRadius }}
                >
                  <h3 className="font-semibold mb-4">Send us a message</h3>
                  <div className="space-y-4">
                    <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                    <input type="email" placeholder="Your Email" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                    <textarea placeholder="Your Message" rows={4} className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-3 rounded-lg text-white font-semibold shadow-lg"
                      style={{ backgroundColor: theme?.primaryColor || "#4F46E5", borderRadius: theme?.buttonRadius }}
                    >
                      Send Message
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>
      )

    // ── Timeline ────────────────────────────────────
    case "timeline": {
      const items: any[] = Array.isArray(p.items) ? p.items : []
      return (
        <motion.section {...editorProps} className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            {p.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "title", String(p.title || "")) }}>
                    {p.title}
                  </span>
                ) : p.title}
              </h2>
            )}
            <div className="relative border-l-2 pl-8 space-y-10" style={{ borderColor: theme?.primaryColor || "#4F46E5" }}>
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -left-[2.55rem] w-5 h-5 rounded-full border-2 bg-white" style={{ borderColor: theme?.primaryColor || "#4F46E5" }} />
                  <span className="text-sm font-bold" style={{ color: theme?.primaryColor }}>
                    {isEditor && isSelected && onUpdateItemField ? (
                      <InlineItemText text={String(item.year || "")} onCommit={(v) => onUpdateItemField(node.id, "items", i, "year", v)} />
                    ) : String(item.year || "")}
                  </span>
                  <h3 className="text-lg font-semibold mt-1">
                    {isEditor && isSelected && onUpdateItemField ? (
                      <InlineItemText text={String(item.title || "")} onCommit={(v) => onUpdateItemField(node.id, "items", i, "title", v)} />
                    ) : String(item.title || "")}
                  </h3>
                  <p className="mt-1" style={{ color: theme?.mutedColor }}>
                    {isEditor && isSelected && onUpdateItemField ? (
                      <InlineItemText text={String(item.description || "")} onCommit={(v) => onUpdateItemField(node.id, "items", i, "description", v)} />
                    ) : String(item.description || "")}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )
    }

    // ── Team ────────────────────────────────────────
    case "team": {
      const members: any[] = Array.isArray(p.members) ? p.members : []
      return (
        <motion.section {...editorProps} className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {p.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "title", String(p.title || "")) }}>
                    {p.title}
                  </span>
                ) : p.title}
              </h2>
            )}
            {p.subtitle && (
              <p className="text-lg text-center max-w-2xl mx-auto mb-12" style={{ color: theme?.mutedColor }}>
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "subtitle", String(p.subtitle || "")) }}>
                    {p.subtitle}
                  </span>
                ) : p.subtitle}
              </p>
            )}
            <div className={`grid grid-cols-1 ${getMdGridColsClass(p.columns, 4)} gap-8`}>
              {members.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="text-center group"
                >
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-lg group-hover:shadow-xl transition-all" style={{ backgroundColor: theme?.primaryColor || "#4F46E5" }}>
                    {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : m.name?.[0] || "?"}
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {isEditor && isSelected && onUpdateItemField ? (
                      <InlineItemText text={String(m.name || "")} onCommit={(v) => onUpdateItemField(node.id, "members", i, "name", v)} />
                    ) : String(m.name || "")}
                  </h3>
                  <p className="text-sm" style={{ color: theme?.mutedColor }}>
                    {isEditor && isSelected && onUpdateItemField ? (
                      <InlineItemText text={String(m.role || "")} onCommit={(v) => onUpdateItemField(node.id, "members", i, "role", v)} />
                    ) : String(m.role || "")}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )
    }

    // ── Logos ────────────────────────────────────────
    case "logos": {
      const logos: any[] = Array.isArray(p.logos) ? p.logos : []
      return (
        <motion.section {...editorProps} className="py-12 px-4" style={{ ...editorProps.style, backgroundColor: theme?.surfaceColor }}>
          <div className="max-w-7xl mx-auto">
            {p.title && (
              <p className="text-center text-sm font-semibold uppercase tracking-wider mb-8" style={{ color: theme?.mutedColor }}>
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "title", String(p.title || "")) }}>
                    {p.title}
                  </span>
                ) : p.title}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {logos.map((logo, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.6 }}
                  whileHover={{ opacity: 1, scale: 1.1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="h-8 md:h-12 transition-all cursor-pointer grayscale hover:grayscale-0"
                >
                  {logo.src ? <img src={logo.src} alt={logo.alt || ""} className="h-full object-contain" /> : <div className="h-full w-24 bg-muted rounded-md border border-dashed flex items-center justify-center text-[10px] text-muted-foreground">Logo</div>}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )
    }

    // ── Newsletter ──────────────────────────────────
    case "newsletter":
      return (
        <motion.section {...editorProps} className="py-16 px-4" style={{ ...editorProps.style, backgroundColor: theme?.surfaceColor }}>
          <div className="max-w-xl mx-auto text-center">
            {p.title && (
              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-2xl font-bold mb-2"
              >
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "title", String(p.title || "")) }}>
                    {p.title}
                  </span>
                ) : p.title}
              </motion.h2>
            )}
            {p.subtitle && (
              <p className="mb-6" style={{ color: theme?.mutedColor }}>
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "subtitle", String(p.subtitle || "")) }}>
                    {p.subtitle}
                  </span>
                ) : p.subtitle}
              </p>
            )}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex gap-2"
            >
              <input type="email" placeholder={p.placeholder || "Enter your email"} className="flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg"
                style={{ backgroundColor: theme?.primaryColor || "#4F46E5", borderRadius: theme?.buttonRadius }}
              >
                {isEditor && isSelected && onRequestInlineEdit ? (
                  <span className="cursor-text" onClick={(e) => { e.stopPropagation(); onRequestInlineEdit(node.id, "buttonText", String(p.buttonText || "Subscribe")) }}>
                    {p.buttonText || "Subscribe"}
                  </span>
                ) : (p.buttonText || "Subscribe")}
              </motion.button>
            </motion.div>
          </div>
        </motion.section>
      )

    // ── Portal Login ────────────────────────────────
    case "portalLogin": {
      const bgStyle: React.CSSProperties = { minHeight: "100vh" }
      if (p.backgroundImage) {
        bgStyle.backgroundImage = `url(${p.backgroundImage})`
        bgStyle.backgroundSize = "cover"
        bgStyle.backgroundPosition = "center"
      } else {
        bgStyle.background = `linear-gradient(135deg, ${theme?.primaryColor || "#4F46E5"} 0%, ${theme?.secondaryColor || "#7C3AED"} 100%)`
      }
      const roles: string[] = Array.isArray(p.roles) ? p.roles : ["Parent", "Teacher", "Student"]
      return (
        <motion.section {...editorProps} className="flex items-center justify-center px-4" style={{ ...editorProps.style, ...bgStyle }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">{p.title}</h1>
              <p className="text-gray-500 mt-1">{p.subtitle}</p>
            </div>
            <div className="space-y-4">
              <input type="email" placeholder="Email address" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
              <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 rounded-lg text-white font-semibold shadow-lg"
                style={{ backgroundColor: theme?.primaryColor || "#4F46E5", borderRadius: theme?.buttonRadius }}
              >
                Sign In
              </motion.button>
            </div>
            {p.showRoleButtons && (
              <div className="mt-6">
                <p className="text-xs text-center text-gray-400 mb-3">Or sign in as:</p>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((role) => (
                    <motion.button
                      key={role}
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                      className="px-3 py-2 text-sm rounded-lg border font-medium transition-colors"
                    >
                      {role}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            {p.showHelpLink && (
              <p className="text-center text-sm text-gray-400 mt-6">
                <a href={isEditor ? undefined : p.helpHref} className="hover:underline transition-all hover:text-primary">{p.helpText}</a>
              </p>
            )}
          </motion.div>
        </motion.section>
      )
    }

    // ── Header ──────────────────────────────────────
    case "header": {
      const headerMenu = menus?.find((m) => m.location === "header")
      const items = Array.isArray(headerMenu?.items) ? headerMenu!.items! : []

      const getItemHref = (item: { href?: string; pageSlug?: string }) => {
        if (item.href) return item.href
        if (item.pageSlug) return item.pageSlug === "home" ? "/" : `/${item.pageSlug}`
        return "#"
      }

      return (
        <header {...editorProps} className={`w-full px-4 py-4 ${p.sticky ? "sticky top-0 z-50" : ""} ${p.transparent ? "bg-transparent" : "bg-white shadow-sm"}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {p.logo && <img src={p.logo} alt="" className="h-8" />}
              <span className="text-xl font-bold">{p.logoText}</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {items.length > 0 ? (
                items.map((item) => (
                  <a key={item.id || `${item.label}-${item.pageSlug || item.href || "link"}`} href={isEditor ? undefined : getItemHref(item)} className="hover:opacity-80 transition-opacity">
                    {item.label || "Untitled"}
                  </a>
                ))
              ) : (
                <span className="text-gray-400">No menu items</span>
              )}
            </nav>
            {p.ctaText && (
              <a href={isEditor ? undefined : p.ctaHref} className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: theme?.primaryColor || "#4F46E5", borderRadius: theme?.buttonRadius }}>
                {p.ctaText}
              </a>
            )}
          </div>
        </header>
      )
    }

    // ── Footer ──────────────────────────────────────
    case "footer": {
      const footerMenu = menus?.find((m) => m.location === "footer")
      const footerMenuItems = Array.isArray(footerMenu?.items) ? footerMenu.items : []

      const getItemHref = (item: { href?: string; pageSlug?: string }) => {
        if (item.href) return item.href
        if (item.pageSlug) return item.pageSlug === "home" ? "/" : `/${item.pageSlug}`
        return "#"
      }

      const derivedColumns = footerMenuItems.length
        ? [{
          title: "Links",
          links: footerMenuItems.map((item) => ({
            label: item.label || "Untitled",
            href: getItemHref(item),
          })),
        }]
        : []

      const columns: any[] = derivedColumns.length > 0 ? derivedColumns : (Array.isArray(p.columns) ? p.columns : [])
      return (
        <footer {...editorProps} className="bg-gray-900 text-white py-16 px-4" style={editorProps.style}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  {p.logo && <img src={p.logo} alt="" className="h-8" />}
                  <span className="text-xl font-bold">{p.logoText}</span>
                </div>
                <p className="text-gray-400 text-sm">{p.description}</p>
              </div>
              {columns.map((col, i) => (
                <div key={i}>
                  <h4 className="font-semibold mb-4">{col.title}</h4>
                  <ul className="space-y-2">
                    {(col.links || []).map((link: any, j: number) => (
                      <li key={j}><a href={isEditor ? undefined : link.href} className="text-gray-400 hover:text-white text-sm transition-colors">{link.label}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
              {p.copyright}
            </div>
          </div>
        </footer>
      )
    }

    // ── Icon ─────────────────────────────────────────
    case "icon":
      return (
        <div {...editorProps} className="inline-flex items-center justify-center">
          <span style={{ fontSize: p.size || 24, color: p.color || theme?.primaryColor || "#4F46E5" }}>●</span>
        </div>
      )

    // ── Form Embed ──────────────────────────────────
    case "formEmbed":
      return (
        <section {...editorProps} className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            {p.showTitle !== false && p.title && <h2 className="text-2xl font-bold mb-6 text-center">{p.title}</h2>}
            {p.formSlug ? (
              isEditor ? (
                <div className="p-8 border-2 border-dashed rounded-xl text-center" style={{ borderRadius: theme?.cardRadius }}>
                  <p className="text-sm font-medium" style={{ color: theme?.mutedColor }}>Form: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{p.formSlug}</code></p>
                  <p className="text-xs mt-1" style={{ color: theme?.mutedColor }}>Form will render on the published site</p>
                </div>
              ) : (
                <div className="p-6 rounded-xl border" style={{ borderRadius: theme?.cardRadius }}>
                  <p className="text-center text-sm" style={{ color: theme?.mutedColor }}>Loading form...</p>
                </div>
              )
            ) : (
              <div className="p-8 border-2 border-dashed rounded-xl text-center" style={{ borderRadius: theme?.cardRadius }}>
                <p className="text-sm" style={{ color: theme?.mutedColor }}>No form selected. Set a form slug in the inspector.</p>
              </div>
            )}
          </div>
        </section>
      )

    // ── Countdown Timer (client-only to avoid hydration mismatch) ──
    case "countdown":
      return <CountdownWidget editorProps={editorProps} p={p} theme={theme} />


    // ── Accordion ────────────────────────────────────
    case "accordion": {
      const accItems: { title: string; content: string }[] = Array.isArray(p.items) ? p.items : []
      return (
        <section {...editorProps} className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            {p.title && <h2 className="text-2xl font-bold mb-6 text-center">{p.title}</h2>}
            <div className={p.variant === "separated" ? "space-y-3" : "divide-y rounded-xl border overflow-hidden"} style={{ borderRadius: theme?.cardRadius }}>
              {accItems.map((item, i) => (
                <details key={i} className={`group ${p.variant === "separated" ? "border rounded-xl overflow-hidden" : ""}`} style={p.variant === "separated" ? { borderRadius: theme?.cardRadius } : undefined}>
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium hover:bg-gray-50 transition-colors list-none [&::-webkit-details-marker]:hidden">
                    <span>{item.title}</span>
                    <svg className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="m6 9 6 6 6-6" /></svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: theme?.mutedColor }}>{item.content}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )
    }

    // ── Tabs (interactive) ─────────────────────────────
    case "tabs":
      return <TabsWidget editorProps={editorProps} p={p} theme={theme} />

    // ── Marquee / Scrolling Text ─────────────────────
    case "marquee": {
      const speedMap: Record<string, number> = { slow: 60, normal: 30, fast: 15 }
      const duration = speedMap[p.speed || "normal"] || 30
      const isRight = p.direction === "right"

      return (
        <div {...editorProps} className="overflow-hidden py-3 relative flex items-center" style={{ ...editorProps.style, backgroundColor: theme?.primaryColor || "#4F46E5" }}>
          <motion.div
            initial={{ x: isRight ? "-50%" : "0%" }}
            animate={{ x: isRight ? "0%" : "-50%" }}
            transition={{
              duration,
              ease: "linear",
              repeat: Infinity,
            }}
            className="flex whitespace-nowrap gap-16 text-white font-medium text-sm"
          >
            <span className="shrink-0 flex items-center gap-4">
              <span>{p.text}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </span>
            <span className="shrink-0 flex items-center gap-4">
              <span>{p.text}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </span>
          </motion.div>
        </div>
      )
    }

    // ── Before/After Slider ─────────────────────────
    case "beforeAfter":
      return (
        <section {...editorProps} className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative overflow-hidden rounded-xl" style={{ borderRadius: theme?.cardRadius }}>
              <div className="grid grid-cols-2 gap-0">
                <div className="relative">
                  {p.beforeImage ? <img src={p.beforeImage} alt={p.beforeLabel || "Before"} className="w-full h-64 object-cover" /> : <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">Before Image</div>}
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">{p.beforeLabel || "Before"}</span>
                </div>
                <div className="relative">
                  {p.afterImage ? <img src={p.afterImage} alt={p.afterLabel || "After"} className="w-full h-64 object-cover" /> : <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">After Image</div>}
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">{p.afterLabel || "After"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )

    // ── Fallback ────────────────────────────────────
    default:
      return (
        <div {...editorProps} className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-400">
          Unknown block: {node.type}
          {childRenderer(node.children)}
        </div>
      )
  }
}

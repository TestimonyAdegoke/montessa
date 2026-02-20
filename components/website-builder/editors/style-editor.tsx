"use client"

import React, { useState, useEffect } from "react"
import { WBNode, WBStyles } from "@/lib/website-builder/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { 
  Monitor, Tablet, Smartphone, MousePointerClick, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Italic, Underline, Minus, ChevronDown, Sparkles, Images, X
} from "lucide-react"

// ── Style Section Header ───────────────────────────────
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

// ── 4-Side Spacing Input ───────────────────────────────
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
        <button className="text-[9px] px-1.5 py-0.5 rounded border hover:bg-muted" onClick={() => setLinked(!linked)}>
          {linked ? "🔗" : "⊞"}
        </button>
      </div>
      {linked ? (
        <Input
          value={top || ""}
          onChange={(e) => { 
            const v = e.target.value;
            onChange("Top", v); onChange("Right", v); onChange("Bottom", v); onChange("Left", v) 
          }}
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

export function StyleEditor({ node, theme, viewport, onUpdateStyles }: {
  node: WBNode
  theme?: any
  viewport?: "desktop" | "tablet" | "mobile"
  onUpdateStyles: (id: string, styles: WBStyles) => void
}) {
  const [bp, setBp] = useState<"base" | "tablet" | "mobile">("base")
  const [state, setState] = useState<"normal" | "hover">("normal")

  useEffect(() => {
    if (viewport === "mobile") setBp("mobile")
    else if (viewport === "tablet") setBp("tablet")
    else setBp("base")
  }, [viewport])

  const currentStyles: Record<string, any> = state === "hover" 
    ? (node.styles?.hover || {}) 
    : (node.styles?.[bp] || {})

  const updateStyle = (key: string, value: string) => {
    const newStyles = { ...(node.styles || {}) }
    if (state === "hover") {
      newStyles.hover = { ...(newStyles.hover || {}), [key]: value || undefined }
    } else {
      newStyles[bp] = { ...(newStyles[bp] || {}), [key]: value || undefined }
    }
    onUpdateStyles(node.id, newStyles)
  }

  return (
    <div className="space-y-4">
      {/* Breakpoint & State Tabs */}
      <div className="space-y-2">
        <div className="flex border rounded-lg overflow-hidden bg-muted/20 p-0.5">
          {(["base", "tablet", "mobile"] as const).map((b) => (
            <button
              key={b}
              className={`flex-1 py-1.5 text-[10px] font-bold flex items-center justify-center gap-1 rounded-md transition-all ${bp === b ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setBp(b)}
            >
              {b === "base" ? <Monitor className="h-3 w-3" /> : b === "tablet" ? <Tablet className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
              {b.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex border rounded-lg overflow-hidden bg-muted/20 p-0.5">
          <button
            className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${state === "normal" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setState("normal")}
          >
            NORMAL
          </button>
          <button
            className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${state === "hover" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setState("hover")}
          >
            HOVER
          </button>
        </div>
      </div>

      <StyleSection title="Layout">
        <div className="space-y-1">
          <Label className="text-[10px]">Display</Label>
          <div className="flex gap-1">
            {["block", "flex", "grid", "none"].map((d) => (
              <button key={d} className={`flex-1 py-1 text-[9px] rounded border font-medium transition-colors ${currentStyles.display === d ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("display", d)}>
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {currentStyles.display === "flex" && (
          <div className="space-y-2 pt-2">
            <Label className="text-[10px]">Flex Direction</Label>
            <div className="flex gap-1">
              {[{ v: "row", l: "→" }, { v: "column", l: "↓" }].map((d) => (
                <button key={d.v} className={`flex-1 py-1 text-[10px] rounded border ${currentStyles.flexDirection === d.v ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`} onClick={() => updateStyle("flexDirection", d.v)}>
                  {d.l}
                </button>
              ))}
            </div>
          </div>
        )}
      </StyleSection>

      <StyleSection title="Size">
        <div className="space-y-2">
          <DimensionInput label="Width" value={currentStyles.width || "auto"} onChange={(v) => updateStyle("width", v)} />
          <DimensionInput label="Height" value={currentStyles.height || "auto"} onChange={(v) => updateStyle("height", v)} />
        </div>
      </StyleSection>

      <StyleSection title="Spacing">
        <SpacingSidesInput
          label="Padding"
          top={currentStyles.paddingTop || ""} right={currentStyles.paddingRight || ""} bottom={currentStyles.paddingBottom || ""} left={currentStyles.paddingLeft || ""}
          onChange={(side, val) => updateStyle(`padding${side}`, val)}
        />
        <SpacingSidesInput
          label="Margin"
          top={currentStyles.marginTop || ""} right={currentStyles.marginRight || ""} bottom={currentStyles.marginBottom || ""} left={currentStyles.marginLeft || ""}
          onChange={(side, val) => updateStyle(`margin${side}`, val)}
        />
      </StyleSection>

      <StyleSection title="Typography">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded border overflow-hidden relative shrink-0">
              <input 
                type="color" 
                value={currentStyles.color || "#000000"} 
                onChange={(e) => updateStyle("color", e.target.value)} 
                className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0" 
              />
              <div className="w-full h-full" style={{ backgroundColor: currentStyles.color || "#000000" }} />
            </div>
            <Input value={currentStyles.color || ""} onChange={(e) => updateStyle("color", e.target.value)} className="h-7 text-[10px] flex-1 font-mono" placeholder="Inherit" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={currentStyles.fontSize || ""} onChange={(e) => updateStyle("fontSize", e.target.value)} className="h-7 text-[10px]" placeholder="Size (px)" />
            <Input value={currentStyles.fontWeight || ""} onChange={(e) => updateStyle("fontWeight", e.target.value)} className="h-7 text-[10px]" placeholder="Weight" />
          </div>
        </div>
      </StyleSection>
    </div>
  )
}

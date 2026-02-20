"use client"

import { WBNode, WBNodeVariable } from "@/lib/website-builder/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Settings2 } from "lucide-react"

export function VariablesEditor({ node, viewport, onUpdate }: {
  node: WBNode
  viewport: "desktop" | "tablet" | "mobile"
  onUpdate: (vars: WBNodeVariable[]) => void
}) {
  const variables = node.variables || []

  const addVariable = () => {
    const id = `var_${Math.random().toString(36).slice(2, 8)}`
    onUpdate([...variables, { id, label: "New Variable", type: "string", defaultValue: "", responsiveValues: {}, bindTo: "" }])
  }

  const updateVar = (idx: number, patch: Partial<WBNodeVariable>) => {
    const next = [...variables]
    next[idx] = { ...next[idx], ...patch }
    onUpdate(next)
  }

  const removeVar = (idx: number) => {
    onUpdate(variables.filter((_, i) => i !== idx))
  }

  const setResponsiveValue = (idx: number, bp: string, val: any) => {
    const v = variables[idx]
    const rv = { ...(v.responsiveValues || {}), [bp]: val }
    updateVar(idx, { responsiveValues: rv })
  }

  const getCurrentValue = (v: WBNodeVariable) => {
    if (viewport === "desktop") return v.defaultValue
    return v.responsiveValues?.[viewport] ?? v.defaultValue
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Variables</p>
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
          {variables.map((v, i) => (
            <div key={v.id} className="p-2.5 rounded-lg border bg-muted/20 relative group space-y-2">
              <button
                className="absolute top-1.5 right-1.5 p-0.5 rounded hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeVar(i)}
              >
                <X className="h-3 w-3" />
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="space-y-0.5">
                  <Label className="text-[9px] text-muted-foreground uppercase font-bold">Label</Label>
                  <Input className="h-6 text-[10px]" value={v.label} onChange={(e) => updateVar(i, { label: e.target.value })} />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[9px] text-muted-foreground uppercase font-bold">Type</Label>
                  <Select value={v.type} onValueChange={(t: any) => updateVar(i, { type: t })}>
                    <SelectTrigger className="h-6 text-[10px] font-medium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string" className="text-xs">String</SelectItem>
                      <SelectItem value="number" className="text-xs">Number</SelectItem>
                      <SelectItem value="color" className="text-xs">Color</SelectItem>
                      <SelectItem value="boolean" className="text-xs">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-0.5">
                <Label className="text-[9px] text-muted-foreground uppercase font-bold">
                  Value {viewport !== "desktop" && <span className="text-primary">({viewport.toUpperCase()})</span>}
                </Label>
                {v.type === "color" ? (
                  <div className="flex gap-1">
                    <div className="h-6 w-8 rounded border overflow-hidden relative shrink-0">
                      <input
                        type="color"
                        value={getCurrentValue(v) || "#000000"}
                        onChange={(e) => viewport === "desktop" ? updateVar(i, { defaultValue: e.target.value }) : setResponsiveValue(i, viewport, e.target.value)}
                        className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0"
                      />
                      <div className="w-full h-full" style={{ backgroundColor: getCurrentValue(v) || "#000000" }} />
                    </div>
                    <Input className="h-6 text-[10px] flex-1 font-mono" value={getCurrentValue(v) || ""} onChange={(e) => viewport === "desktop" ? updateVar(i, { defaultValue: e.target.value }) : setResponsiveValue(i, viewport, e.target.value)} />
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
                <Label className="text-[9px] text-muted-foreground uppercase font-bold">Bind Style Prop</Label>
                <Select value={v.bindTo || "none"} onValueChange={(b) => updateVar(i, { bindTo: b === "none" ? "" : b })}>
                  <SelectTrigger className="h-6 text-[10px] font-medium"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-[10px]">None</SelectItem>
                    {["gap", "padding", "flexDirection", "fontSize", "color", "backgroundColor", "borderRadius", "width", "height", "margin", "opacity"].map(prop => (
                      <SelectItem key={prop} value={prop} className="text-[10px]">{prop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {v.responsiveValues && Object.keys(v.responsiveValues).length > 0 && (
                <div className="flex gap-1 flex-wrap pt-1">
                  {Object.entries(v.responsiveValues).map(([bp, val]) => (
                    <Badge key={bp} variant="secondary" className="text-[8px] h-4 px-1 font-bold uppercase">
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

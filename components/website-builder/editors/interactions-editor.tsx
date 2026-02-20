"use client"

import { WBNode } from "@/lib/website-builder/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Sparkles } from "lucide-react"

export function InteractionsEditor({ node, onUpdateProps }: {
  node: WBNode
  onUpdateProps: (id: string, props: Record<string, any>) => void
}) {
  const interactions = node.props?._interactions || []

  const addInteraction = () => {
    const newInteractions = [...interactions, { type: "animation", trigger: "in-view", animation: "fade-in", duration: 0.5, delay: 0 }]
    onUpdateProps(node.id, { _interactions: newInteractions })
  }

  const updateInteraction = (index: number, updates: any) => {
    const newInteractions = [...interactions]
    newInteractions[index] = { ...newInteractions[index], ...updates }
    onUpdateProps(node.id, { _interactions: newInteractions })
  }

  const removeInteraction = (index: number) => {
    onUpdateProps(node.id, { _interactions: interactions.filter((_: any, i: number) => i !== index) })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Animations</p>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={addInteraction}>
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
            <div key={i} className="p-3 rounded-xl border bg-muted/30 relative group space-y-3">
              <button
                className="absolute top-2 right-2 p-1 rounded hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeInteraction(i)}
              >
                <X className="h-3 w-3" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-bold text-muted-foreground">Trigger</Label>
                  <Select value={inter.trigger} onValueChange={(v) => updateInteraction(i, { trigger: v })}>
                    <SelectTrigger className="h-7 text-xs font-medium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-view" className="text-xs">In View</SelectItem>
                      <SelectItem value="hover" className="text-xs">While Hover</SelectItem>
                      <SelectItem value="tap" className="text-xs">On Tap</SelectItem>
                      <SelectItem value="loop" className="text-xs">Loop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-bold text-muted-foreground">Effect</Label>
                  <Select value={inter.animation} onValueChange={(v) => updateInteraction(i, { animation: v })}>
                    <SelectTrigger className="h-7 text-xs font-medium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fade-in" className="text-xs">Fade In</SelectItem>
                      <SelectItem value="slide-up" className="text-xs">Slide Up</SelectItem>
                      <SelectItem value="slide-down" className="text-xs">Slide Down</SelectItem>
                      <SelectItem value="scale-up" className="text-xs">Scale Up</SelectItem>
                      <SelectItem value="pop" className="text-xs">Pop</SelectItem>
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
          ))}
        </div>
      )}
    </div>
  )
}

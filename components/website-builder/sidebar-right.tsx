"use client"

import { WBNode, WBPropField, WBStyles, WBNodeVariable } from "@/lib/website-builder/types"
import { BLOCK_REGISTRY } from "@/lib/website-builder/block-registry"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FileUpload from "@/components/common/file-upload"
import { cn } from "@/lib/utils"
import { Settings2, Palette, Database, Variable, Trash2, Plus } from "lucide-react"

import { StyleEditor } from "./editors/style-editor"
import { CmsBindingEditor } from "./editors/cms-editor"
import { VariablesEditor } from "./editors/variables-editor"
import { InteractionsEditor } from "./editors/interactions-editor"
import { WBPageData, WBCmsCollection } from "@/lib/website-builder/types"

interface SidebarRightProps {
  selectedNode: WBNode | null
  onUpdateProps: (id: string, props: Record<string, any>) => void
  onUpdateStyles: (id: string, styles: WBStyles) => void
  onUpdateVariables: (id: string, variables: WBNodeVariable[]) => void
  cmsCollections: WBCmsCollection[]
  viewport: "desktop" | "tablet" | "mobile"
}

export const SidebarRight = ({ 
  selectedNode, 
  onUpdateProps, 
  onUpdateStyles,
  onUpdateVariables,
  cmsCollections,
  viewport
}: SidebarRightProps) => {
  if (!selectedNode) {
    return (
      <div className="w-[300px] border-l h-full bg-background/50 backdrop-blur-sm p-6 text-center text-muted-foreground text-[10px] uppercase tracking-widest font-bold shrink-0 flex flex-col items-center justify-center">
        Select a node to edit
      </div>
    )
  }

  const def = BLOCK_REGISTRY.find(b => b.type === selectedNode.type)
  if (!def) return null

  const handlePropChange = (key: string, value: any) => {
    onUpdateProps(selectedNode.id, { ...selectedNode.props, [key]: value })
  }

  return (
    <div className="w-[300px] border-l h-full bg-background/50 backdrop-blur-sm flex flex-col shrink-0 z-50 overflow-hidden">
      <div className="h-12 border-b px-4 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-[10px] tracking-widest uppercase">{def.label}</h3>
        <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono uppercase font-bold">ID: {selectedNode.id.slice(0, 4)}</span>
      </div>

      <Tabs defaultValue="props" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-2 pt-2">
          <TabsList className="w-full h-8 bg-muted/50 p-0.5">
            <TabsTrigger value="props" className="flex-1 text-[10px] uppercase font-bold tracking-tighter">Props</TabsTrigger>
            <TabsTrigger value="styles" className="flex-1 text-[10px] uppercase font-bold tracking-tighter">Styles</TabsTrigger>
            <TabsTrigger value="config" className="flex-1 text-[10px] uppercase font-bold tracking-tighter">Config</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="props" className="flex-1 overflow-hidden flex flex-col m-0">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-5">
              {def.propSchema.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  {field.type !== "boolean" && (
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{field.label}</Label>
                  )}
                  {/* renderPropField logic remains for simple props, but we could also move it to a component */}
                  {(() => {
                    const value = selectedNode.props[field.name]
                    switch (field.type) {
                      case "text":
                      case "url":
                      case "number":
                        return <Input type={field.type === "number" ? "number" : "text"} value={value || ""} onChange={(e) => handlePropChange(field.name, field.type === "number" ? parseFloat(e.target.value) : e.target.value)} className="h-8 text-[11px]" />
                      case "textarea":
                      case "richtext":
                        return <Textarea value={value || ""} onChange={(e) => handlePropChange(field.name, e.target.value)} className="text-[11px] min-h-[80px] resize-none" />
                      case "color":
                        return (
                          <div className="flex gap-2">
                            <div className="h-8 w-8 rounded-md border overflow-hidden relative shrink-0">
                              <input type="color" value={value || "#000000"} onChange={(e) => handlePropChange(field.name, e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer opacity-0" />
                              <div className="w-full h-full" style={{ backgroundColor: value || "#000000" }} />
                            </div>
                            <Input value={value || ""} onChange={(e) => handlePropChange(field.name, e.target.value)} className="h-8 flex-1 text-[11px] font-mono" />
                          </div>
                        )
                      case "boolean":
                        return (
                          <div className="flex items-center justify-between py-1 px-1">
                            <Label className="text-[11px] font-medium text-muted-foreground">{field.label}</Label>
                            <Switch checked={!!value} onCheckedChange={(val) => handlePropChange(field.name, val)} />
                          </div>
                        )
                      case "select":
                      case "alignment":
                        return (
                          <Select value={value} onValueChange={(val) => handlePropChange(field.name, val)}>
                            <SelectTrigger className="h-8 text-[11px] font-medium"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {field.options?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-[11px]">{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      case "image":
                        return (
                          <FileUpload
                            value={value}
                            onChange={(url) => handlePropChange(field.name, url)}
                            folder="website-builder"
                            label={`Upload ${field.label}`}
                            preview="image"
                            className="scale-90 origin-top-left"
                          />
                        )
                      default:
                        return null
                    }
                  })()}
                </div>
              ))}

              <Separator className="my-4" />
              
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Advanced</Label>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium text-muted-foreground">Custom CSS</Label>
                  <Input 
                    value={selectedNode.props.className || ""} 
                    onChange={(e) => handlePropChange("className", e.target.value)} 
                    placeholder="mt-4 p-2"
                    className="h-8 text-[11px] font-mono"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="styles" className="flex-1 overflow-hidden flex flex-col m-0">
          <ScrollArea className="flex-1">
            <div className="p-4">
              <StyleEditor 
                node={selectedNode}
                viewport={viewport}
                onUpdateStyles={onUpdateStyles}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="config" className="flex-1 overflow-hidden flex flex-col m-0">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <CmsBindingEditor 
                node={selectedNode}
                collections={cmsCollections}
                onUpdateProps={(props) => onUpdateProps(selectedNode.id, props)}
              />
              <Separator />
              <VariablesEditor 
                node={selectedNode}
                viewport={viewport}
                onUpdate={(vars) => onUpdateVariables(selectedNode.id, vars)}
              />
              <Separator />
              <InteractionsEditor 
                node={selectedNode}
                onUpdateProps={onUpdateProps}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

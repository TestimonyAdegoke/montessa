"use client"

import { WBNode, WBCmsCollection } from "@/lib/website-builder/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database } from "lucide-react"

// These should be moved to a shared constants file eventually
const CMS_BINDABLE_FIELDS: Record<string, string> = {
  heading: "text",
  paragraph: "text",
  image: "src",
  button: "text",
}

const BLOCK_FIELD_SCHEMAS: Record<string, any[]> = {
  heading: [{ key: "text", label: "Text Content" }],
  paragraph: [{ key: "text", label: "Text Content" }],
  image: [{ key: "src", label: "Image Source" }, { key: "alt", label: "Alt Text" }],
  button: [{ key: "text", label: "Button Label" }, { key: "href", label: "Link" }],
}

export function CmsBindingEditor({ node, collections, onUpdateProps }: {
  node: WBNode
  collections: WBCmsCollection[]
  onUpdateProps: (props: Record<string, any>) => void
}) {
  const targetField = CMS_BINDABLE_FIELDS[node.type]
  if (!targetField) return null

  const blockFields = BLOCK_FIELD_SCHEMAS[node.type] || []

  const binding = node.props?._cmsBinding as { collectionId?: string; mode?: string; query?: any; map?: Record<string, string>; pagination?: any } | undefined
  const collectionId = binding?.collectionId || node.props?._cmsCollection || "none"
  const mode = binding?.mode || "list"
  const map: Record<string, string> = binding?.map || node.props?._cmsFieldMap || {}
  const limit = binding?.query?.limit ?? node.props?._cmsLimit ?? 0
  const isBound = !!collectionId && collectionId !== "none"
  const selectedCollection = collections.find((c) => c.id === collectionId)

  function updateBinding(patch: Record<string, any>) {
    const current = node.props?._cmsBinding || {}
    const next = { ...current, ...patch }
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

  return (
    <div className="space-y-3 rounded-xl border p-3 bg-muted/20">
      <div className="flex items-center gap-2">
        <Database className="h-3.5 w-3.5 text-primary" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CMS Data Binding</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest opacity-70">Collection</Label>
        <Select value={collectionId} onValueChange={handleCollectionChange}>
          <SelectTrigger className="h-8 text-[11px] font-medium"><SelectValue placeholder="Manual Data" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className="text-[11px]">Manual (No Binding)</SelectItem>
            {collections.map((col) => (
              <SelectItem key={col.id} value={col.id} className="text-[11px]">{col.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isBound && selectedCollection && (
        <div className="space-y-3 pt-3 border-t border-dashed">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-70">Field Mapping</Label>
            <div className="space-y-2">
              {blockFields.map((bf) => (
                <div key={bf.key} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20 truncate">{bf.label}</span>
                  <span className="text-muted-foreground opacity-30">→</span>
                  <Select 
                    value={map[bf.key] || "none"} 
                    onValueChange={(v) => updateBinding({ map: { ...map, [bf.key]: v === "none" ? "" : v } })}
                  >
                    <SelectTrigger className="h-7 text-[10px] flex-1 font-medium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-[10px]">None</SelectItem>
                      {selectedCollection.fields.map((cf) => (
                        <SelectItem key={cf.key} value={cf.key} className="text-[10px]">{cf.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

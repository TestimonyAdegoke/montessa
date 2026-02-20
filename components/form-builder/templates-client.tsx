"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Search, FileText, Layout, Filter, Eye, Plus, Loader2,
  GraduationCap, ClipboardList, DollarSign, Shield, Heart, Users, Calendar,
} from "lucide-react"
import { createFormFromTemplate } from "@/lib/actions/form-builder"

const CATEGORY_ICONS: Record<string, any> = {
  admissions: GraduationCap, academics: ClipboardList, administration: FileText,
  finance: DollarSign, compliance: Shield, health: Heart, behavioral: Users, events: Calendar,
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "admissions", label: "Admissions" },
  { value: "academics", label: "Academics" },
  { value: "administration", label: "Administration" },
  { value: "finance", label: "Finance" },
  { value: "compliance", label: "Compliance" },
  { value: "health", label: "Health" },
  { value: "behavioral", label: "Behavioral" },
  { value: "events", label: "Events" },
]

interface Props {
  templates: any[]
}

export default function TemplatesClient({ templates }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [selected, setSelected] = useState<any>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [customName, setCustomName] = useState("")

  const filtered = templates.filter((t: any) => {
    if (category !== "all" && t.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      if (!t.name.toLowerCase().includes(q) && !(t.description || "").toLowerCase().includes(q)) return false
    }
    return true
  })

  function handleUse(template: any) {
    setSelected(template)
    setCustomName(template.name)
    setShowConfirm(true)
  }

  function handleConfirm() {
    if (!selected) return
    startTransition(async () => {
      try {
        const form = await createFormFromTemplate(selected.id, { name: customName || undefined })
        setShowConfirm(false)
        router.push(`/dashboard/form-builder/editor/${form.id}`)
      } catch { /* ignore */ }
    })
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-9" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[160px] h-9"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tpl: any) => {
          const CatIcon = CATEGORY_ICONS[tpl.category] || FileText
          const tags = typeof tpl.tags === "string" ? JSON.parse(tpl.tags) : (tpl.tags || [])
          return (
            <Card key={tpl.id} className="group hover:shadow-md transition-all">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <CatIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{tpl.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tpl.description || "No description"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="outline" className="text-[9px]">{tpl.category}</Badge>
                  {tpl.subcategory && <Badge variant="outline" className="text-[9px]">{tpl.subcategory}</Badge>}
                  {tpl.isSystem && <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-600 border-blue-200">System</Badge>}
                  {tags.slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[9px]">{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Used {tpl.popularity || 0} times</span>
                  <Button size="sm" className="h-7 text-xs" onClick={() => handleUse(tpl)}>
                    <Plus className="h-3 w-3 mr-1" />Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <Layout className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">No templates found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Use Template: {selected?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{selected?.description}</p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Form Name</label>
              <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Enter form name..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isPending ? "Creating..." : "Create from Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

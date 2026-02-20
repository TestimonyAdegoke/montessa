"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Search, Plus, FileText, BarChart3, Trash2, Copy, Archive, Eye,
  Pencil, MoreHorizontal, Clock, CheckCircle2, ClipboardList, Filter, Layout,
} from "lucide-react"
import { createForm, duplicateForm, deleteForm, archiveForm } from "@/lib/actions/form-builder"

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "general", label: "General" },
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
  forms: any[]
  analytics?: {
    totalForms: number; activeForms: number; totalSubmissions: number
    pendingApprovals: number; recentCount: number
  }
}

export default function FormsListClient({ forms: initial, analytics }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [forms, setForms] = useState(initial)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newCategory, setNewCategory] = useState("general")
  const [newDesc, setNewDesc] = useState("")

  const filtered = forms.filter((f: any) => {
    if (f.isArchived) return false
    if (category !== "all" && f.category !== category) return false
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function handleCreate() {
    if (!newName.trim()) return
    startTransition(async () => {
      try {
        const form = await createForm({ name: newName, category: newCategory, description: newDesc || undefined })
        setShowCreate(false)
        setNewName(""); setNewCategory("general"); setNewDesc("")
        router.push(`/dashboard/form-builder/editor/${form.id}`)
      } catch { /* ignore */ }
    })
  }

  function handleDuplicate(formId: string) {
    startTransition(async () => {
      try { await duplicateForm(formId); router.refresh() } catch { /* ignore */ }
    })
  }

  function handleDelete(formId: string) {
    if (!confirm("Delete this form and all its submissions?")) return
    startTransition(async () => {
      try { await deleteForm(formId); setForms((p) => p.filter((f: any) => f.id !== formId)) } catch { /* ignore */ }
    })
  }

  function handleArchive(formId: string) {
    startTransition(async () => {
      try { await archiveForm(formId); setForms((p) => p.map((f: any) => f.id === formId ? { ...f, isArchived: true } : f)) } catch { /* ignore */ }
    })
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Forms", value: analytics.totalForms, icon: FileText, color: "primary" },
            { label: "Active", value: analytics.activeForms, icon: CheckCircle2, color: "green-600" },
            { label: "Submissions", value: analytics.totalSubmissions, icon: ClipboardList, color: "blue-600" },
            { label: "Pending", value: analytics.pendingApprovals, icon: Clock, color: "amber-600" },
            { label: "This Week", value: analytics.recentCount, icon: BarChart3, color: "purple-600" },
          ].map((s) => (
            <Card key={s.label}><CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg bg-${s.color}/10 flex items-center justify-center`}>
                  <s.icon className={`h-4 w-4 text-${s.color}`} />
                </div>
                <div><p className="text-2xl font-bold">{s.value}</p><p className="text-[10px] text-muted-foreground">{s.label}</p></div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-9" placeholder="Search forms..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px] h-9"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9" asChild>
            <Link href="/dashboard/form-builder/templates"><Layout className="h-4 w-4 mr-1" />Templates</Link>
          </Button>
          <Button size="sm" className="h-9" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" />New Form
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((form: any) => (
          <Card key={form.id} className="group hover:shadow-md transition-all">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/form-builder/editor/${form.id}`} className="text-sm font-semibold hover:text-primary transition-colors truncate block">{form.name}</Link>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{form.description || "No description"}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild><Link href={`/dashboard/form-builder/editor/${form.id}`}><Pencil className="h-3.5 w-3.5 mr-2" />Edit</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href={`/dashboard/form-builder/submissions?formId=${form.id}`}><Eye className="h-3.5 w-3.5 mr-2" />Submissions</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDuplicate(form.id)}><Copy className="h-3.5 w-3.5 mr-2" />Duplicate</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchive(form.id)}><Archive className="h-3.5 w-3.5 mr-2" />Archive</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(form.id)}><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="outline" className="text-[9px]">{form.category}</Badge>
                {form.isActive
                  ? <Badge variant="outline" className="text-[9px] bg-green-50 text-green-600 border-green-200">Active</Badge>
                  : <Badge variant="outline" className="text-[9px] bg-gray-50 text-gray-500">Draft</Badge>}
                {form.isMultiStep && <Badge variant="outline" className="text-[9px]">Multi-Step</Badge>}
                {form.requiresApproval && <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-600 border-amber-200">Approval</Badge>}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{form.fields?.length || 0} fields</span>
                <span>{form._count?.submissions || 0} submissions</span>
                <span>{new Date(form.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">No forms found</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first form or use a template</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" />New Form</Button>
              <Button size="sm" variant="outline" asChild><Link href="/dashboard/form-builder/templates">Browse Templates</Link></Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Form</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Form Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Student Application Form" /></div>
            <div className="space-y-2"><Label>Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.filter((c) => c.value !== "all").map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Description (optional)</Label>
              <textarea className="w-full px-3 py-2 text-sm rounded-md border bg-background resize-y min-h-[60px]" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Brief description..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || isPending}>{isPending ? "Creating..." : "Create Form"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  MoreHorizontal,
  Database,
  FileText,
  GripVertical,
  Check,
  X,
  Eye,
  EyeOff,
  Upload,
  ChevronDown,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import type {
  WBCmsCollectionData,
  WBCmsFieldDef,
  WBCmsItemData,
  WBCmsFieldType,
} from "@/lib/website-builder/types"
import {
  addCmsField,
  updateCmsField,
  deleteCmsField,
  createCmsItem,
  updateCmsItem,
  publishCmsItem,
  unpublishCmsItem,
  deleteCmsItem,
  bulkDeleteCmsItems,
  bulkPublishCmsItems,
} from "@/lib/actions/website-builder-cms"

const FIELD_TYPES: { value: WBCmsFieldType; label: string }[] = [
  { value: "STRING", label: "Text" },
  { value: "NUMBER", label: "Number" },
  { value: "BOOLEAN", label: "Boolean" },
  { value: "COLOR", label: "Color" },
  { value: "DATE", label: "Date" },
  { value: "FORMATTED_TEXT", label: "Rich Text" },
  { value: "IMAGE", label: "Image" },
  { value: "FILE", label: "File" },
  { value: "LINK", label: "Link / URL" },
  { value: "ENUM", label: "Enum / Options" },
  { value: "COLLECTION_REF", label: "Reference" },
  { value: "MULTI_COLLECTION_REF", label: "Multi Reference" },
]

// ─────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────

export function CmsCollectionDetailClient({
  collection: initial,
}: {
  collection: WBCmsCollectionData
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [collection] = useState(initial)
  const [tab, setTab] = useState<string>("items")

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/website-builder/cms">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            {collection.name}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            /{collection.slug} &middot; {collection.fields.length} fields &middot;{" "}
            {collection.items.length} items
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="items" className="gap-1.5">
            <Database className="h-3.5 w-3.5" />
            Items ({collection.items.length})
          </TabsTrigger>
          <TabsTrigger value="fields" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Fields ({collection.fields.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-4">
          <ItemsTab
            collection={collection}
            isPending={isPending}
            startTransition={startTransition}
            router={router}
          />
        </TabsContent>

        <TabsContent value="fields" className="mt-4">
          <FieldsTab
            collection={collection}
            isPending={isPending}
            startTransition={startTransition}
            router={router}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Fields Tab
// ─────────────────────────────────────────────────────────

function FieldsTab({
  collection,
  isPending,
  startTransition,
  router,
}: {
  collection: WBCmsCollectionData
  isPending: boolean
  startTransition: (fn: () => Promise<void>) => void
  router: ReturnType<typeof useRouter>
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<WBCmsFieldDef | null>(null)

  // Form state
  const [fName, setFName] = useState("")
  const [fFieldId, setFFieldId] = useState("")
  const [fType, setFType] = useState<WBCmsFieldType>("STRING")
  const [fRequired, setFRequired] = useState(false)
  const [fIsTitle, setFIsTitle] = useState(false)
  const [fIsSlug, setFIsSlug] = useState(false)
  const [fOptions, setFOptions] = useState("")
  const [fDefault, setFDefault] = useState("")
  const [error, setError] = useState("")

  function resetForm() {
    setFName("")
    setFFieldId("")
    setFType("STRING")
    setFRequired(false)
    setFIsTitle(false)
    setFIsSlug(false)
    setFOptions("")
    setFDefault("")
    setError("")
  }

  function handleAdd() {
    if (!fName.trim()) { setError("Name is required"); return }
    setError("")
    startTransition(async () => {
      try {
        await addCmsField(collection.id, {
          name: fName,
          fieldId: fFieldId || undefined,
          type: fType,
          isRequired: fRequired,
          isTitle: fIsTitle,
          isSlugSource: fIsSlug,
          options: fType === "ENUM" && fOptions ? fOptions.split(",").map((s) => s.trim()) : undefined,
          defaultValue: fDefault || undefined,
        })
        setAddOpen(false)
        resetForm()
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to add field")
      }
    })
  }

  function openEdit(f: WBCmsFieldDef) {
    setSelectedField(f)
    setFName(f.name)
    setFFieldId(f.fieldId)
    setFType(f.type)
    setFRequired(f.isRequired)
    setFIsTitle(f.isTitle)
    setFIsSlug(f.isSlugSource)
    setFOptions(Array.isArray(f.options) ? f.options.join(", ") : "")
    setFDefault(f.defaultValue || "")
    setError("")
    setEditOpen(true)
  }

  function handleEdit() {
    if (!selectedField || !fName.trim()) { setError("Name is required"); return }
    setError("")
    startTransition(async () => {
      try {
        await updateCmsField(selectedField!.id, {
          name: fName,
          type: fType,
          isRequired: fRequired,
          isTitle: fIsTitle,
          isSlugSource: fIsSlug,
          options: fType === "ENUM" && fOptions ? fOptions.split(",").map((s) => s.trim()) : undefined,
          defaultValue: fDefault || null,
        })
        setEditOpen(false)
        resetForm()
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to update field")
      }
    })
  }

  function handleDelete() {
    if (!selectedField) return
    startTransition(async () => {
      try {
        await deleteCmsField(selectedField!.id)
        setDeleteOpen(false)
        setSelectedField(null)
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to delete field")
      }
    })
  }

  const fieldForm = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Name *</Label>
          <Input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="e.g. Title" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Field ID</Label>
          <Input
            value={fFieldId}
            onChange={(e) => setFFieldId(e.target.value)}
            placeholder="Auto from name"
            disabled={editOpen}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Type</Label>
        <Select value={fType} onValueChange={(v) => setFType(v as WBCmsFieldType)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map((ft) => (
              <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {fType === "ENUM" && (
        <div className="space-y-1">
          <Label className="text-xs">Options (comma-separated)</Label>
          <Input
            value={fOptions}
            onChange={(e) => setFOptions(e.target.value)}
            placeholder="option1, option2, option3"
          />
        </div>
      )}
      <div className="space-y-1">
        <Label className="text-xs">Default Value</Label>
        <Input value={fDefault} onChange={(e) => setFDefault(e.target.value)} placeholder="Optional" />
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-xs">
          <Switch checked={fRequired} onCheckedChange={setFRequired} />
          Required
        </label>
        <label className="flex items-center gap-2 text-xs">
          <Switch checked={fIsTitle} onCheckedChange={setFIsTitle} />
          Title field
        </label>
        <label className="flex items-center gap-2 text-xs">
          <Switch checked={fIsSlug} onCheckedChange={setFIsSlug} />
          Slug source
        </label>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Define the schema for items in this collection.
        </p>
        <Button size="sm" className="gap-1.5" onClick={() => { resetForm(); setAddOpen(true) }}>
          <Plus className="h-3.5 w-3.5" />
          Add Field
        </Button>
      </div>

      {collection.fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/30">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium">No fields defined</p>
          <p className="text-xs text-muted-foreground mt-1">Add fields to define the structure of your items.</p>
          <Button size="sm" className="mt-3 gap-1.5" onClick={() => { resetForm(); setAddOpen(true) }}>
            <Plus className="h-3.5 w-3.5" />
            Add First Field
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Field ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Required</TableHead>
                <TableHead className="text-center">Title</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collection.fields.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </TableCell>
                  <TableCell className="font-medium text-sm">{f.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{f.fieldId}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {FIELD_TYPES.find((ft) => ft.value === f.type)?.label || f.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {f.isRequired && <Check className="h-3.5 w-3.5 text-green-600 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {f.isTitle && <Check className="h-3.5 w-3.5 text-blue-600 mx-auto" />}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(f)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => { setSelectedField(f); setDeleteOpen(true) }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add field dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Field</DialogTitle></DialogHeader>
          {fieldForm}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={isPending}>
              {isPending ? "Adding..." : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit field dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Field</DialogTitle></DialogHeader>
          {fieldForm}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete field confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Field</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the &quot;{selectedField?.name}&quot; field from the schema.
              Existing item data for this field will become orphaned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Items Tab
// ─────────────────────────────────────────────────────────

function ItemsTab({
  collection,
  isPending,
  startTransition,
  router,
}: {
  collection: WBCmsCollectionData
  isPending: boolean
  startTransition: (fn: () => Promise<void>) => void
  router: ReturnType<typeof useRouter>
}) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<WBCmsItemData | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [formSlug, setFormSlug] = useState("")
  const [error, setError] = useState("")

  const titleField = collection.fields.find((f) => f.isTitle)
  const visibleFields = collection.fields.slice(0, 5)

  const filtered = collection.items.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      const fd = item.fieldData || {}
      return (
        item.slug.toLowerCase().includes(searchLower) ||
        Object.values(fd).some((v) => String(v).toLowerCase().includes(searchLower))
      )
    }
    return true
  })

  function resetForm() {
    setFormData({})
    setFormSlug("")
    setError("")
  }

  function handleAdd() {
    setError("")
    startTransition(async () => {
      try {
        await createCmsItem(collection.id, {
          slug: formSlug || undefined,
          fieldData: formData,
          status: "DRAFT",
        })
        setAddOpen(false)
        resetForm()
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to create item")
      }
    })
  }

  function openEdit(item: WBCmsItemData) {
    setSelectedItem(item)
    setFormData(item.fieldData || {})
    setFormSlug(item.slug)
    setError("")
    setEditOpen(true)
  }

  function handleEdit() {
    if (!selectedItem) return
    setError("")
    startTransition(async () => {
      try {
        await updateCmsItem(selectedItem!.id, {
          slug: formSlug || undefined,
          fieldData: formData,
        })
        setEditOpen(false)
        resetForm()
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to update item")
      }
    })
  }

  function handleDelete() {
    if (!selectedItem) return
    startTransition(async () => {
      try {
        await deleteCmsItem(selectedItem!.id)
        setDeleteOpen(false)
        setSelectedItem(null)
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to delete item")
      }
    })
  }

  function handlePublish(item: WBCmsItemData) {
    startTransition(async () => {
      try {
        await publishCmsItem(item.id)
        router.refresh()
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  function handleUnpublish(item: WBCmsItemData) {
    startTransition(async () => {
      try {
        await unpublishCmsItem(item.id)
        router.refresh()
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((i) => i.id)))
    }
  }

  function handleBulkDelete() {
    if (selected.size === 0) return
    startTransition(async () => {
      try {
        await bulkDeleteCmsItems(Array.from(selected))
        setSelected(new Set())
        router.refresh()
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  function handleBulkPublish() {
    if (selected.size === 0) return
    startTransition(async () => {
      try {
        await bulkPublishCmsItems(Array.from(selected))
        setSelected(new Set())
        router.refresh()
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  function renderFieldInput(field: WBCmsFieldDef, value: any, onChange: (v: any) => void) {
    switch (field.type) {
      case "BOOLEAN":
        return <Switch checked={!!value} onCheckedChange={onChange} />
      case "NUMBER":
        return (
          <Input
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            className="h-8 text-xs"
          />
        )
      case "DATE":
        return (
          <Input
            type="date"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs"
          />
        )
      case "COLOR":
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 w-8 rounded border cursor-pointer"
            />
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 text-xs flex-1"
              placeholder="#000000"
            />
          </div>
        )
      case "FORMATTED_TEXT":
        return (
          <Textarea
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="text-xs"
          />
        )
      case "ENUM": {
        const opts = Array.isArray(field.options) ? field.options : []
        return (
          <Select value={value ?? ""} onValueChange={onChange}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {opts.map((opt: string) => (
                <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }
      default:
        return (
          <Input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs"
            placeholder={field.name}
          />
        )
    }
  }

  const itemForm = (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
      <div className="space-y-1">
        <Label className="text-xs">Slug</Label>
        <Input
          value={formSlug}
          onChange={(e) => setFormSlug(e.target.value)}
          placeholder="Auto-generated"
          className="h-8 text-xs"
        />
      </div>
      {collection.fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <Label className="text-xs flex items-center gap-1">
            {field.name}
            {field.isRequired && <span className="text-destructive">*</span>}
            <Badge variant="outline" className="text-[9px] ml-1">
              {FIELD_TYPES.find((ft) => ft.value === field.type)?.label || field.type}
            </Badge>
          </Label>
          {renderFieldInput(
            field,
            formData[field.fieldId],
            (v) => setFormData((prev) => ({ ...prev, [field.fieldId]: v }))
          )}
        </div>
      ))}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All statuses</SelectItem>
            <SelectItem value="DRAFT" className="text-xs">Draft</SelectItem>
            <SelectItem value="PUBLISHED" className="text-xs">Published</SelectItem>
            <SelectItem value="ARCHIVED" className="text-xs">Archived</SelectItem>
          </SelectContent>
        </Select>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{selected.size} selected</Badge>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleBulkPublish}>
              <Eye className="h-3 w-3" />
              Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        )}

        <div className="ml-auto">
          <Button size="sm" className="gap-1.5" onClick={() => { resetForm(); setAddOpen(true) }}>
            <Plus className="h-3.5 w-3.5" />
            New Item
          </Button>
        </div>
      </div>

      {/* No fields warning */}
      {collection.fields.length === 0 && (
        <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 text-sm">
          <strong>No fields defined.</strong> Add fields in the Fields tab before creating items.
        </div>
      )}

      {/* Items table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/30">
          <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium">No items yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            {collection.fields.length === 0
              ? "Define fields first, then add items."
              : "Add items to populate this collection."}
          </p>
          {collection.fields.length > 0 && (
            <Button size="sm" className="mt-3 gap-1.5" onClick={() => { resetForm(); setAddOpen(true) }}>
              <Plus className="h-3.5 w-3.5" />
              Add First Item
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="text-xs">Slug</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                {visibleFields.map((f) => (
                  <TableHead key={f.id} className="text-xs max-w-[200px]">{f.name}</TableHead>
                ))}
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{item.slug}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === "PUBLISHED" ? "default" : item.status === "ARCHIVED" ? "outline" : "secondary"}
                      className="text-[10px]"
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  {visibleFields.map((f) => {
                    const val = item.fieldData?.[f.fieldId]
                    return (
                      <TableCell key={f.id} className="text-xs max-w-[200px] truncate">
                        {f.type === "BOOLEAN" ? (
                          val ? <Check className="h-3.5 w-3.5 text-green-600" /> : <X className="h-3.5 w-3.5 text-muted-foreground/40" />
                        ) : f.type === "COLOR" ? (
                          <div className="flex items-center gap-1.5">
                            <div className="h-4 w-4 rounded border" style={{ backgroundColor: val || "transparent" }} />
                            <span>{val}</span>
                          </div>
                        ) : (
                          String(val ?? "—")
                        )}
                      </TableCell>
                    )
                  })}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {item.status === "DRAFT" ? (
                          <DropdownMenuItem onClick={() => handlePublish(item)}>
                            <Eye className="h-3.5 w-3.5 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUnpublish(item)}>
                            <EyeOff className="h-3.5 w-3.5 mr-2" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => { setSelectedItem(item); setDeleteOpen(true) }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add item dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Item</DialogTitle></DialogHeader>
          {itemForm}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={isPending}>
              {isPending ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit item dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Item</DialogTitle></DialogHeader>
          {itemForm}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete item confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the item &quot;{selectedItem?.slug}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

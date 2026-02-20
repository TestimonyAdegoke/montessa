"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Plus,
  ClipboardList,
  Trash2,
  Pencil,
  Eye,
  ToggleLeft,
  FileText,
  Inbox,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { createForm, deleteForm, addFormField, deleteFormField, updateFormField, reorderFormFields, updateForm } from "@/lib/actions/website-builder-forms"

interface FormField {
  id: string
  name: string
  label: string
  type: string
  placeholder: string | null
  isRequired: boolean
  width: string
  sortOrder: number
  step: number
}

interface FormData {
  id: string
  name: string
  slug: string
  description: string | null
  successMessage: string | null
  isMultiStep: boolean
  isActive: boolean
  requiresPayment: boolean
  paymentAmount: number | null
  fields: FormField[]
  _count: { submissions: number }
}

interface Props {
  forms: FormData[]
}

const FIELD_TYPES = [
  { value: "TEXT", label: "Text" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "NUMBER", label: "Number" },
  { value: "TEXTAREA", label: "Textarea" },
  { value: "SELECT", label: "Dropdown" },
  { value: "MULTI_SELECT", label: "Multi Select" },
  { value: "CHECKBOX", label: "Checkbox" },
  { value: "RADIO", label: "Radio" },
  { value: "FILE", label: "File Upload" },
  { value: "DATE", label: "Date" },
  { value: "HIDDEN", label: "Hidden" },
]

export default function FormsClient({ forms }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  // Create form dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [formName, setFormName] = useState("")
  const [formSlug, setFormSlug] = useState("")
  const [formDesc, setFormDesc] = useState("")

  // Edit form dialog
  const [editForm, setEditForm] = useState<FormData | null>(null)

  // Add/Edit field dialog
  const [addFieldFormId, setAddFieldFormId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [fieldName, setFieldName] = useState("")
  const [fieldLabel, setFieldLabel] = useState("")
  const [fieldType, setFieldType] = useState("TEXT")
  const [fieldRequired, setFieldRequired] = useState(false)
  const [fieldPlaceholder, setFieldPlaceholder] = useState("")

  function openCreate() {
    setFormName("")
    setFormSlug("")
    setFormDesc("")
    setError("")
    setCreateOpen(true)
  }

  function openAddField(formId: string) {
    setAddFieldFormId(formId)
    setEditingField(null)
    setFieldName("")
    setFieldLabel("")
    setFieldType("TEXT")
    setFieldRequired(false)
    setFieldPlaceholder("")
    setError("")
  }

  function openEditField(formId: string, field: FormField) {
    setAddFieldFormId(formId)
    setEditingField(field)
    setFieldName(field.name)
    setFieldLabel(field.label)
    setFieldType(field.type)
    setFieldRequired(field.isRequired)
    setFieldPlaceholder(field.placeholder || "")
    setError("")
  }

  function handleMoveField(form: FormData, idx: number, direction: "up" | "down") {
    const newIdx = direction === "up" ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= form.fields.length) return
    const ids = form.fields.map((f) => f.id)
    const [moved] = ids.splice(idx, 1)
    ids.splice(newIdx, 0, moved)
    startTransition(async () => {
      try {
        await reorderFormFields(form.id, ids)
        router.refresh()
      } catch {}
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Forms
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Build forms for admissions, inquiries, events, and more
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/website-builder"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/website-builder/submissions"><Inbox className="h-4 w-4 mr-1" /> Submissions</Link>
          </Button>
          <Button size="sm" className="gap-1" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Form
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

      {forms.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-medium">No forms yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first form to start collecting submissions</p>
            <Button className="mt-4 gap-1" onClick={openCreate}><Plus className="h-4 w-4" /> Create Form</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {forms.map((form) => (
            <Card key={form.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {form.name}
                      <Badge variant="outline" className={`text-[10px] ${form.isActive ? "bg-green-500/10 text-green-700 border-green-200" : "bg-gray-500/10 text-gray-500 border-gray-200"}`}>
                        {form.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {form.isMultiStep && <Badge variant="outline" className="text-[10px]">Multi-Step</Badge>}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-3 mt-1">
                      <span>/{form.slug}</span>
                      <span>•</span>
                      <span>{form.fields.length} fields</span>
                      <span>•</span>
                      <span>{form._count.submissions} submissions</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAddField(form.id)} title="Add Field">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/dashboard/website-builder/submissions?formId=${form.id}`} title="View Submissions">
                        <Inbox className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                      onClick={() => {
                        if (!confirm(`Delete form "${form.name}"? All submissions will be lost.`)) return
                        startTransition(async () => {
                          try { await deleteForm(form.id); router.refresh() } catch (e: any) { setError(e.message) }
                        })
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {form.fields.length > 0 && (
                <CardContent className="pt-0">
                  <div className="border rounded-lg divide-y">
                    {form.fields.map((field, fIdx) => (
                      <div key={field.id} className="flex items-center justify-between px-3 py-2 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex flex-col gap-0.5">
                            <button className="p-0.5 rounded hover:bg-muted disabled:opacity-20" disabled={fIdx === 0 || isPending} onClick={() => handleMoveField(form, fIdx, "up")}>
                              <ChevronUp className="h-2.5 w-2.5 text-muted-foreground" />
                            </button>
                            <button className="p-0.5 rounded hover:bg-muted disabled:opacity-20" disabled={fIdx === form.fields.length - 1 || isPending} onClick={() => handleMoveField(form, fIdx, "down")}>
                              <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                            </button>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs truncate flex items-center gap-1.5">
                              {field.label}
                              {field.isRequired && <span className="text-red-500">*</span>}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{field.name} • {field.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px]">{field.type}</Badge>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditField(form.id, field)}>
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                            onClick={() => {
                              startTransition(async () => {
                                try { await deleteFormField(field.id); router.refresh() } catch (e: any) { setError(e.message) }
                              })
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Form Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> New Form</DialogTitle>
            <DialogDescription>Create a new form for your website</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Form Name</Label>
              <Input
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value)
                  setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""))
                }}
                placeholder="e.g. Admissions Inquiry"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="admissions-inquiry" />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Brief description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              disabled={isPending || !formName.trim() || !formSlug.trim()}
              onClick={() => {
                startTransition(async () => {
                  try {
                    await createForm({ name: formName.trim(), slug: formSlug.trim(), description: formDesc || undefined })
                    setCreateOpen(false)
                    router.refresh()
                  } catch (e: any) { setError(e.message) }
                })
              }}
            >
              {isPending ? "Creating..." : "Create Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Field Dialog */}
      <Dialog open={!!addFieldFormId} onOpenChange={() => { setAddFieldFormId(null); setEditingField(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingField ? <Pencil className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              {editingField ? "Edit Field" : "Add Field"}
            </DialogTitle>
            <DialogDescription>{editingField ? "Update this form field" : "Add a new field to the form"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={fieldLabel}
                onChange={(e) => {
                  setFieldLabel(e.target.value)
                  setFieldName(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, ""))
                }}
                placeholder="e.g. Full Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Field Name</Label>
              <Input value={fieldName} onChange={(e) => setFieldName(e.target.value)} placeholder="full_name" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={fieldType} onValueChange={setFieldType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((ft) => (
                    <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input value={fieldPlaceholder} onChange={(e) => setFieldPlaceholder(e.target.value)} placeholder="Enter placeholder text" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Required</Label>
              <Switch checked={fieldRequired} onCheckedChange={setFieldRequired} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddFieldFormId(null); setEditingField(null) }}>Cancel</Button>
            <Button
              disabled={isPending || !fieldLabel.trim() || !fieldName.trim()}
              onClick={() => {
                if (!addFieldFormId) return
                startTransition(async () => {
                  try {
                    if (editingField) {
                      await updateFormField(editingField.id, {
                        name: fieldName.trim(),
                        label: fieldLabel.trim(),
                        type: fieldType,
                        placeholder: fieldPlaceholder || null,
                        isRequired: fieldRequired,
                      })
                    } else {
                      await addFormField(addFieldFormId, {
                        name: fieldName.trim(),
                        label: fieldLabel.trim(),
                        type: fieldType,
                        placeholder: fieldPlaceholder || undefined,
                        isRequired: fieldRequired,
                      })
                    }
                    setAddFieldFormId(null)
                    setEditingField(null)
                    router.refresh()
                  } catch (e: any) { setError(e.message) }
                })
              }}
            >
              {isPending ? "Saving..." : editingField ? "Update Field" : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

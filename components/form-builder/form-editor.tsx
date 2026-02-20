"use client"

import { useEffect, useCallback, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft, Save, Undo2, Redo2, Eye, Monitor, Smartphone, Rocket,
  GripVertical, Trash2, Copy, Plus, Layers, Zap, ChevronLeft, ChevronRight,
  Type, AlignLeft, FileText, Mail, Phone, Hash, Calendar, Clock, ChevronDown,
  CircleDot, CheckSquare, ToggleLeft, Upload, PenTool, Star, SlidersHorizontal,
  MapPin, Users, GraduationCap, UserCog, School, BookOpen, Stethoscope,
  ShieldAlert, FileCheck, Minus, FileStack, Heading, AlignJustify,
  SeparatorHorizontal, EyeOff, ClipboardCheck, CalendarX, CalendarClock,
} from "lucide-react"
import { useFormEditorStore } from "@/lib/form-builder/editor-store"
import { FIELD_CATEGORIES, FIELD_REGISTRY } from "@/lib/form-builder/field-registry"
import type { FBField, FBFieldType, FBFormData } from "@/lib/form-builder/types"
import {
  updateForm, addField, updateField as updateFieldAction,
  deleteField, reorderFields, publishForm,
} from "@/lib/actions/form-builder"

const ICON_MAP: Record<string, any> = {
  Type, AlignLeft, FileText, Mail, Phone, Hash, Calendar, Clock, CalendarClock,
  ChevronDown, CircleDot, CheckSquare, ToggleLeft, Upload, PenTool, Star,
  SlidersHorizontal, MapPin, Users, GraduationCap, UserCog, School, BookOpen,
  Stethoscope, ShieldAlert, FileCheck, Minus, FileStack, Heading, AlignJustify,
  SeparatorHorizontal, EyeOff, ClipboardCheck, CalendarX, Eye,
}

function FieldIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name]
  return Icon ? <Icon className={className} /> : <Type className={className} />
}

interface Props { initialForm: FBFormData }

export default function FormEditor({ initialForm }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const store = useFormEditorStore()
  const {
    form, isDirty, isSaving, selectedFieldId, hoveredFieldId, leftPanel, rightPanel,
    viewMode, currentStep,
    setForm, setDirty, setSaving, selectField, hoverField,
    addField: storeAddField, updateField: storeUpdateField, removeField,
    duplicateField, copyField, pasteField,
    setLeftPanel, setRightPanel,
    undo, redo, canUndo, canRedo,
    setViewMode, setCurrentStep, nextStep, prevStep,
    getFieldsByStep, getStepCount, getSelectedField,
  } = store

  useEffect(() => { setForm(initialForm) }, [initialForm, setForm])

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo() }
        if (e.key === "z" && e.shiftKey) { e.preventDefault(); redo() }
        if (e.key === "y") { e.preventDefault(); redo() }
        if (e.key === "s") { e.preventDefault(); handleSave() }
        if (e.key === "c" && selectedFieldId) { e.preventDefault(); copyField(selectedFieldId) }
        if (e.key === "v") { e.preventDefault(); pasteField() }
        if (e.key === "d" && selectedFieldId) { e.preventDefault(); duplicateField(selectedFieldId) }
      }
      if (e.key === "Delete" && selectedFieldId) doDeleteField(selectedFieldId)
      if (e.key === "Escape") selectField(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const handleSave = useCallback(() => {
    if (!form || isSaving) return
    setError(""); setSaving(true)
    startTransition(async () => {
      try {
        await updateForm(form.id, {
          name: form.name, description: form.description,
          isMultiStep: form.isMultiStep, stepLabels: form.stepLabels,
          submissionMode: form.submissionMode, successMessage: form.successMessage,
          requiresApproval: form.requiresApproval,
        })
        if (form.fields.length > 0) {
          await reorderFields(form.id, form.fields.map((f) => ({ id: f.id, sortOrder: f.sortOrder, step: f.step })))
        }
        setDirty(false)
      } catch (e: any) { setError(e.message) }
      finally { setSaving(false) }
    })
  }, [form, isSaving, setSaving, setDirty, startTransition])

  useEffect(() => {
    if (!isDirty) return
    const t = setTimeout(handleSave, 10000)
    return () => clearTimeout(t)
  }, [isDirty, handleSave])

  function doAddField(type: FBFieldType) {
    if (!form) return
    const def = FIELD_REGISTRY[type]
    if (!def) return
    const names = form.fields.map((f) => f.name)
    let name = def.defaultProps.name || type.toLowerCase()
    let c = 1
    while (names.includes(name)) name = `${def.defaultProps.name || type.toLowerCase()}_${c++}`

    const nf: FBField = {
      id: `new_${Math.random().toString(36).slice(2, 10)}`, formId: form.id,
      name, label: def.defaultProps.label || def.label, type,
      description: def.defaultProps.description, placeholder: def.defaultProps.placeholder,
      defaultValue: def.defaultProps.defaultValue, options: def.defaultProps.options,
      isRequired: def.defaultProps.isRequired || false, validations: def.defaultProps.validations || {},
      width: def.defaultProps.width || "full", labelStyle: {}, inputStyle: {},
      step: currentStep, sortOrder: form.fields.filter((f) => f.step === currentStep).length,
      isHidden: def.defaultProps.isHidden || false, helpText: def.defaultProps.helpText,
      tooltip: def.defaultProps.tooltip, isReadOnly: def.defaultProps.isReadOnly || false,
      isLocked: false, linkedModel: def.defaultProps.linkedModel, linkedField: def.defaultProps.linkedField,
    }
    startTransition(async () => {
      try {
        const created = await addField(form.id, {
          name: nf.name, label: nf.label, type: nf.type, description: nf.description,
          placeholder: nf.placeholder, defaultValue: nf.defaultValue, options: nf.options,
          isRequired: nf.isRequired, validations: nf.validations, width: nf.width,
          step: nf.step, helpText: nf.helpText, tooltip: nf.tooltip,
          linkedModel: nf.linkedModel, linkedField: nf.linkedField,
        })
        storeAddField({ ...nf, id: created.id })
      } catch (e: any) { setError(e.message) }
    })
  }

  function doDeleteField(fid: string) {
    startTransition(async () => {
      try { await deleteField(fid); removeField(fid) } catch (e: any) { setError(e.message) }
    })
  }

  function doPublish() {
    if (!form) return
    startTransition(async () => {
      try { await publishForm(form.id); router.refresh() } catch (e: any) { setError(e.message) }
    })
  }

  if (!form) return null
  const stepCount = getStepCount()
  const currentFields = getFieldsByStep(currentStep)
  const selectedField = getSelectedField()

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Toolbar */}
      <div className="h-12 border-b bg-background flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/dashboard/form-builder"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <input className="text-sm font-semibold bg-transparent border-none outline-none max-w-[200px] focus:ring-1 focus:ring-primary/30 rounded px-1"
            value={form.name} onChange={(e) => store.updateFormSettings({ name: e.target.value })} />
          {isDirty && <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-600 border-amber-200">Unsaved</Badge>}
          {form.isActive && <Badge variant="outline" className="text-[9px] bg-green-50 text-green-600 border-green-200">Published</Badge>}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={!canUndo()} title="Undo"><Undo2 className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={!canRedo()} title="Redo"><Redo2 className="h-3.5 w-3.5" /></Button>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant={viewMode === "edit" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("edit")}><Monitor className="h-3.5 w-3.5" /></Button>
          <Button variant={viewMode === "mobile" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("mobile")}><Smartphone className="h-3.5 w-3.5" /></Button>
          <Button variant={viewMode === "preview" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("preview")}><Eye className="h-3.5 w-3.5" /></Button>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={handleSave} disabled={isSaving || !isDirty}>
            <Save className="h-3.5 w-3.5" />{isSaving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" className="h-8 gap-1 text-xs" onClick={doPublish} disabled={isPending}>
            <Rocket className="h-3.5 w-3.5" />Publish
          </Button>
        </div>
      </div>

      {error && <div className="px-3 py-1.5 text-xs text-destructive bg-destructive/10 border-b">{error}</div>}

      {/* Main 3-pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-64 border-r bg-muted/30 flex flex-col shrink-0">
          <div className="flex border-b">
            {(["fields", "pages", "logic"] as const).map((p) => (
              <button key={p} className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${leftPanel === p ? "bg-background border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setLeftPanel(p)}>
                {p === "fields" && <><Plus className="h-3 w-3 inline mr-1" />Fields</>}
                {p === "pages" && <><Layers className="h-3 w-3 inline mr-1" />Layers</>}
                {p === "logic" && <><Zap className="h-3 w-3 inline mr-1" />Logic</>}
              </button>
            ))}
          </div>
          <ScrollArea className="flex-1">
            {leftPanel === "fields" && (
              <div className="p-3 space-y-4">
                {FIELD_CATEGORIES.map((cat) => {
                  const fields = Object.values(FIELD_REGISTRY).filter((f) => f.category === cat.key)
                  return (
                    <div key={cat.key}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{cat.label}</p>
                      <div className="grid grid-cols-2 gap-1">
                        {fields.map((def) => (
                          <button key={def.type} className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border bg-background hover:bg-primary/5 hover:border-primary/30 transition-all text-left group"
                            onClick={() => doAddField(def.type)} title={def.description}>
                            <FieldIcon name={def.icon} className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0" />
                            <span className="text-[10px] font-medium truncate">{def.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {leftPanel === "pages" && (
              <div className="p-3 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Fields ({form.fields.length})</p>
                {form.fields.sort((a, b) => a.step === b.step ? a.sortOrder - b.sortOrder : a.step - b.step).map((field) => {
                  const def = FIELD_REGISTRY[field.type]
                  return (
                    <button key={field.id} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all ${selectedFieldId === field.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted border border-transparent"}`}
                      onClick={() => selectField(field.id)}>
                      <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                      <FieldIcon name={def?.icon || "Type"} className="h-3 w-3 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium truncate">{field.label}</p>
                        <p className="text-[9px] text-muted-foreground">{field.type}{field.isRequired ? " *" : ""}</p>
                      </div>
                      {form.isMultiStep && <Badge variant="outline" className="text-[8px] shrink-0">S{field.step}</Badge>}
                    </button>
                  )
                })}
                {form.fields.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No fields yet.</p>}
              </div>
            )}
            {leftPanel === "logic" && (
              <div className="p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Logic Rules ({form.logicRules.length})</p>
                {form.logicRules.map((rule) => (
                  <div key={rule.id} className="p-2 rounded-md border bg-background">
                    <p className="text-[10px] font-medium">{rule.name || `${rule.type} rule`}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{rule.type} • {(Array.isArray(rule.conditions) ? rule.conditions : []).length} conditions</p>
                  </div>
                ))}
                {form.logicRules.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No logic rules yet.</p>}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-muted/50 overflow-auto">
          <div className={`mx-auto py-8 px-4 ${viewMode === "mobile" ? "max-w-[375px]" : "max-w-[720px]"}`}>
            {form.isMultiStep && stepCount > 1 && (
              <div className="flex items-center justify-between mb-4 px-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={prevStep} disabled={currentStep <= 1}><ChevronLeft className="h-3 w-3 mr-1" />Prev</Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: stepCount }, (_, i) => i + 1).map((s) => (
                    <button key={s} className={`h-6 w-6 rounded-full text-[10px] font-bold ${s === currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      onClick={() => setCurrentStep(s)}>{s}</button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={nextStep} disabled={currentStep >= stepCount}>Next<ChevronRight className="h-3 w-3 ml-1" /></Button>
              </div>
            )}
            <div className="bg-background rounded-xl border shadow-sm">
              <div className="p-6 border-b">
                <input className="text-xl font-bold bg-transparent border-none outline-none w-full focus:ring-1 focus:ring-primary/30 rounded px-1"
                  value={form.name} onChange={(e) => store.updateFormSettings({ name: e.target.value })} placeholder="Form Title" />
                <textarea className="text-sm text-muted-foreground bg-transparent border-none outline-none w-full mt-1 resize-none focus:ring-1 focus:ring-primary/30 rounded px-1"
                  value={form.description || ""} onChange={(e) => store.updateFormSettings({ description: e.target.value })} placeholder="Form description..." rows={2} />
              </div>
              <div className="p-6 space-y-3">
                {currentFields.map((field) => {
                  const def = FIELD_REGISTRY[field.type]
                  const isSel = selectedFieldId === field.id
                  const isHov = hoveredFieldId === field.id
                  const widthCls = field.width === "half" ? "inline-block w-[calc(50%-0.375rem)] align-top mr-3"
                    : field.width === "third" ? "inline-block w-[calc(33.33%-0.5rem)] align-top mr-3"
                    : field.width === "two-thirds" ? "inline-block w-[calc(66.66%-0.375rem)] align-top mr-3" : "w-full"
                  return (
                    <div key={field.id}
                      className={`relative group rounded-lg border-2 transition-all cursor-pointer ${isSel ? "border-primary bg-primary/5 ring-2 ring-primary/20" : isHov ? "border-primary/40" : "border-transparent hover:border-muted-foreground/20"} ${widthCls}`}
                      onClick={() => selectField(field.id)} onMouseEnter={() => hoverField(field.id)} onMouseLeave={() => hoverField(null)}>
                      <div className="p-3">
                        <div className={`absolute -top-3 right-2 flex items-center gap-0.5 bg-background border rounded-md shadow-sm px-1 py-0.5 transition-opacity ${isSel || isHov ? "opacity-100" : "opacity-0"}`}>
                          <button className="p-0.5 hover:text-primary" onClick={(e) => { e.stopPropagation(); duplicateField(field.id) }}><Copy className="h-3 w-3" /></button>
                          <button className="p-0.5 hover:text-destructive" onClick={(e) => { e.stopPropagation(); doDeleteField(field.id) }}><Trash2 className="h-3 w-3" /></button>
                        </div>
                        {def?.isLayout ? <LayoutPreview field={field} /> : <InputPreview field={field} />}
                      </div>
                    </div>
                  )
                })}
                {currentFields.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Plus className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No fields on this step</p>
                    <p className="text-xs mt-1">Click a field type from the left panel to add it</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-72 border-l bg-muted/30 flex flex-col shrink-0">
          <div className="flex border-b">
            {(["properties", "validation", "style"] as const).map((p) => (
              <button key={p} className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${rightPanel === p ? "bg-background border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setRightPanel(p)}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
            ))}
          </div>
          <ScrollArea className="flex-1">
            {selectedField ? (
              <div className="p-3 space-y-4">
                {rightPanel === "properties" && <PropertiesPanel field={selectedField} onUpdate={(u) => {
                  storeUpdateField(selectedField.id, u)
                  if (!selectedField.id.startsWith("new_")) {
                    startTransition(async () => { try { await updateFieldAction(selectedField.id, u) } catch (e: any) { setError(e.message) } })
                  }
                }} />}
                {rightPanel === "validation" && <ValidationPanel field={selectedField} onUpdate={(u) => storeUpdateField(selectedField.id, u)} />}
                {rightPanel === "style" && <StylePanel field={selectedField} onUpdate={(u) => storeUpdateField(selectedField.id, u)} />}
              </div>
            ) : (
              <div className="p-3 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Form Settings</p>
                <p className="text-xs text-muted-foreground">Select a field to edit, or configure form settings below.</p>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-xs">Category</Label>
                  <Select value={form.category} onValueChange={(v) => store.updateFormSettings({ category: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["general","admissions","academics","administration","finance","compliance","health","behavioral","events"].map((c) => (
                        <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Submission Mode</Label>
                  <Select value={form.submissionMode} onValueChange={(v) => store.updateFormSettings({ submissionMode: v as any })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC_LINK">Public Link</SelectItem>
                      <SelectItem value="AUTHENTICATED">Authenticated</SelectItem>
                      <SelectItem value="ROLE_RESTRICTED">Role Restricted</SelectItem>
                      <SelectItem value="ONE_TIME">One-Time</SelectItem>
                      <SelectItem value="RECURRING">Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Multi-Step</Label>
                  <Switch checked={form.isMultiStep} onCheckedChange={(v) => store.updateFormSettings({ isMultiStep: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Requires Approval</Label>
                  <Switch checked={form.requiresApproval} onCheckedChange={(v) => store.updateFormSettings({ requiresApproval: v })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Success Message</Label>
                  <textarea className="w-full px-3 py-1.5 text-xs rounded-md border bg-background resize-y min-h-[60px]"
                    value={form.successMessage || ""} onChange={(e) => store.updateFormSettings({ successMessage: e.target.value })} placeholder="Thank you for your submission!" />
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

// ── Field Previews ──────────────────────────────────────

function LayoutPreview({ field }: { field: FBField }) {
  if (field.type === "SECTION_BREAK") return <div><p className="text-sm font-semibold">{field.label}</p>{field.description && <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>}<Separator className="mt-2" /></div>
  if (field.type === "PAGE_BREAK") return <div className="flex items-center gap-2 text-muted-foreground"><div className="flex-1 border-t border-dashed" /><span className="text-[10px] font-medium uppercase">Page Break</span><div className="flex-1 border-t border-dashed" /></div>
  if (field.type === "HEADING") return <h2 className="text-lg font-bold">{field.label}</h2>
  if (field.type === "PARAGRAPH") return <p className="text-sm text-muted-foreground">{field.description || "Paragraph text"}</p>
  if (field.type === "DIVIDER") return <Separator />
  if (field.type === "HIDDEN") return <div className="flex items-center gap-2 text-muted-foreground/50"><EyeOff className="h-3 w-3" /><span className="text-[10px]">Hidden: {field.name}</span></div>
  return <p className="text-xs text-muted-foreground">{field.label}</p>
}

function InputPreview({ field }: { field: FBField }) {
  return (
    <div>
      <label className="text-xs font-medium flex items-center gap-1 mb-1">
        {field.label}{field.isRequired && <span className="text-red-500">*</span>}
      </label>
      {field.helpText && <p className="text-[10px] text-muted-foreground mb-1">{field.helpText}</p>}
      {["SHORT_TEXT","EMAIL","PHONE","NUMBER"].includes(field.type) && (
        <div className="h-9 rounded-md border bg-muted/30 px-3 flex items-center text-xs text-muted-foreground">{field.placeholder || `Enter ${field.label.toLowerCase()}...`}</div>
      )}
      {["LONG_TEXT","RICH_TEXT"].includes(field.type) && (
        <div className="h-20 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">{field.placeholder || `Enter ${field.label.toLowerCase()}...`}</div>
      )}
      {["DATE","TIME","DATE_TIME"].includes(field.type) && (
        <div className="h-9 rounded-md border bg-muted/30 px-3 flex items-center text-xs text-muted-foreground"><Calendar className="h-3 w-3 mr-2" />Select {field.type.toLowerCase().replace("_"," ")}</div>
      )}
      {field.type === "DROPDOWN" && (
        <div className="h-9 rounded-md border bg-muted/30 px-3 flex items-center justify-between text-xs text-muted-foreground"><span>{field.placeholder || "Select..."}</span><ChevronDown className="h-3 w-3" /></div>
      )}
      {["RADIO","CHECKBOX"].includes(field.type) && (
        <div className="space-y-1">{(Array.isArray(field.options) ? field.options : []).slice(0,4).map((opt: any, i: number) => (
          <div key={i} className="flex items-center gap-2"><div className={`h-3.5 w-3.5 rounded-${field.type === "RADIO" ? "full" : "sm"} border`} /><span className="text-xs">{opt.label || opt}</span></div>
        ))}</div>
      )}
      {field.type === "TOGGLE" && <div className="flex items-center gap-2"><div className="h-5 w-9 rounded-full bg-muted border" /><span className="text-xs text-muted-foreground">Off</span></div>}
      {field.type === "FILE_UPLOAD" && <div className="h-20 rounded-md border-2 border-dashed bg-muted/30 flex items-center justify-center text-xs text-muted-foreground"><Upload className="h-4 w-4 mr-2" />Click or drag to upload</div>}
      {field.type === "SIGNATURE" && <div className="h-24 rounded-md border-2 border-dashed bg-muted/30 flex items-center justify-center text-xs text-muted-foreground"><PenTool className="h-4 w-4 mr-2" />Sign here</div>}
      {field.type === "RATING" && <div className="flex gap-1">{Array.from({length:5}).map((_,i) => <Star key={i} className="h-5 w-5 text-muted-foreground/30" />)}</div>}
      {field.type === "SLIDER" && <div className="h-2 rounded-full bg-muted border mt-2" />}
      {field.type === "ADDRESS" && (
        <div className="space-y-1.5">
          <div className="h-9 rounded-md border bg-muted/30 px-3 flex items-center text-xs text-muted-foreground">Street</div>
          <div className="flex gap-1.5">
            <div className="h-9 rounded-md border bg-muted/30 px-3 flex items-center text-xs text-muted-foreground flex-1">City</div>
            <div className="h-9 rounded-md border bg-muted/30 px-3 flex items-center text-xs text-muted-foreground flex-1">State</div>
            <div className="h-9 rounded-md border bg-muted/30 px-3 flex items-center text-xs text-muted-foreground w-24">ZIP</div>
          </div>
        </div>
      )}
      {["GUARDIAN_SELECTOR","STUDENT_SELECTOR","STAFF_SELECTOR","CLASS_SELECTOR","SESSION_SELECTOR"].includes(field.type) && (
        <div className="h-9 rounded-md border bg-muted/30 px-3 flex items-center text-xs text-muted-foreground"><Users className="h-3 w-3 mr-2" />Search and select...</div>
      )}
      {["MEDICAL_INFO","BEHAVIORAL_OBSERVATION","ASSESSMENT_RUBRIC","ATTENDANCE_JUSTIFICATION","EMERGENCY_CONTACT","CONSENT_AGREEMENT"].includes(field.type) && (
        <div className="p-3 rounded-md border bg-muted/20 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[9px] mb-1">{field.type.replace(/_/g," ")}</Badge>
          <p className="mt-1">Structured data block</p>
        </div>
      )}
    </div>
  )
}

// ── Right Panel Sub-Components ──────────────────────────

function PropertiesPanel({ field, onUpdate }: { field: FBField; onUpdate: (u: Partial<FBField>) => void }) {
  const def = FIELD_REGISTRY[field.type]
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Field Properties</p>
      <div className="space-y-2"><Label className="text-xs">Label</Label><Input className="h-8 text-xs" value={field.label} onChange={(e) => onUpdate({ label: e.target.value })} /></div>
      <div className="space-y-2"><Label className="text-xs">Field Name</Label><Input className="h-8 text-xs font-mono" value={field.name} onChange={(e) => onUpdate({ name: e.target.value })} /></div>
      {!def?.isLayout && (<>
        <div className="space-y-2"><Label className="text-xs">Placeholder</Label><Input className="h-8 text-xs" value={field.placeholder || ""} onChange={(e) => onUpdate({ placeholder: e.target.value })} /></div>
        <div className="space-y-2"><Label className="text-xs">Help Text</Label><Input className="h-8 text-xs" value={field.helpText || ""} onChange={(e) => onUpdate({ helpText: e.target.value })} /></div>
        <div className="space-y-2"><Label className="text-xs">Width</Label>
          <Select value={field.width} onValueChange={(v) => onUpdate({ width: v as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full</SelectItem><SelectItem value="half">Half</SelectItem>
              <SelectItem value="third">Third</SelectItem><SelectItem value="two-thirds">Two-Thirds</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div className="flex items-center justify-between"><Label className="text-xs">Required</Label><Switch checked={field.isRequired} onCheckedChange={(v) => onUpdate({ isRequired: v })} /></div>
        <div className="flex items-center justify-between"><Label className="text-xs">Read Only</Label><Switch checked={field.isReadOnly} onCheckedChange={(v) => onUpdate({ isReadOnly: v })} /></div>
        <div className="flex items-center justify-between"><Label className="text-xs">Hidden</Label><Switch checked={field.isHidden} onCheckedChange={(v) => onUpdate({ isHidden: v })} /></div>
      </>)}
      {def?.isLayout && field.type === "PARAGRAPH" && (
        <div className="space-y-2"><Label className="text-xs">Text</Label><textarea className="w-full px-3 py-1.5 text-xs rounded-md border bg-background resize-y min-h-[80px]" value={field.description || ""} onChange={(e) => onUpdate({ description: e.target.value })} /></div>
      )}
      <div className="space-y-2"><Label className="text-xs">Step</Label><Input className="h-8 text-xs" type="number" min={1} value={field.step} onChange={(e) => onUpdate({ step: parseInt(e.target.value) || 1 })} /></div>
    </div>
  )
}

function ValidationPanel({ field, onUpdate }: { field: FBField; onUpdate: (u: Partial<FBField>) => void }) {
  const v = field.validations || {}
  const uv = (k: string, val: any) => onUpdate({ validations: { ...v, [k]: val } })
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Validation</p>
      {["SHORT_TEXT","LONG_TEXT","RICH_TEXT","EMAIL","PHONE"].includes(field.type) && (<>
        <div className="space-y-2"><Label className="text-xs">Min Length</Label><Input className="h-8 text-xs" type="number" value={v.minLength || ""} onChange={(e) => uv("minLength", parseInt(e.target.value) || undefined)} /></div>
        <div className="space-y-2"><Label className="text-xs">Max Length</Label><Input className="h-8 text-xs" type="number" value={v.maxLength || ""} onChange={(e) => uv("maxLength", parseInt(e.target.value) || undefined)} /></div>
      </>)}
      {field.type === "NUMBER" && (<>
        <div className="space-y-2"><Label className="text-xs">Min</Label><Input className="h-8 text-xs" type="number" value={v.min ?? ""} onChange={(e) => uv("min", parseFloat(e.target.value) || undefined)} /></div>
        <div className="space-y-2"><Label className="text-xs">Max</Label><Input className="h-8 text-xs" type="number" value={v.max ?? ""} onChange={(e) => uv("max", parseFloat(e.target.value) || undefined)} /></div>
      </>)}
      <div className="space-y-2"><Label className="text-xs">Regex Pattern</Label><Input className="h-8 text-xs font-mono" value={v.pattern || ""} onChange={(e) => uv("pattern", e.target.value)} /></div>
      <div className="space-y-2"><Label className="text-xs">Error Message</Label><Input className="h-8 text-xs" value={v.customMessage || ""} onChange={(e) => uv("customMessage", e.target.value)} /></div>
      {field.type === "FILE_UPLOAD" && (<>
        <div className="space-y-2"><Label className="text-xs">Max File Size (bytes)</Label><Input className="h-8 text-xs" type="number" value={v.maxFileSize || ""} onChange={(e) => uv("maxFileSize", parseInt(e.target.value) || undefined)} /></div>
        <div className="space-y-2"><Label className="text-xs">Max Files</Label><Input className="h-8 text-xs" type="number" value={v.maxFiles || ""} onChange={(e) => uv("maxFiles", parseInt(e.target.value) || undefined)} /></div>
      </>)}
    </div>
  )
}

function StylePanel({ field, onUpdate }: { field: FBField; onUpdate: (u: Partial<FBField>) => void }) {
  const ls = field.labelStyle || {}
  const is = field.inputStyle || {}
  const ul = (k: string, v: string) => onUpdate({ labelStyle: { ...ls, [k]: v } })
  const ui = (k: string, v: string) => onUpdate({ inputStyle: { ...is, [k]: v } })
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Label Style</p>
        <div className="space-y-2">
          <div className="space-y-1"><Label className="text-xs">Font Size</Label>
            <Select value={ls.fontSize || ""} onValueChange={(v) => ul("fontSize", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Default" /></SelectTrigger>
              <SelectContent><SelectItem value="text-xs">XS</SelectItem><SelectItem value="text-sm">SM</SelectItem><SelectItem value="text-base">MD</SelectItem><SelectItem value="text-lg">LG</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label className="text-xs">Weight</Label>
            <Select value={ls.fontWeight || ""} onValueChange={(v) => ul("fontWeight", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Default" /></SelectTrigger>
              <SelectContent><SelectItem value="font-normal">Normal</SelectItem><SelectItem value="font-medium">Medium</SelectItem><SelectItem value="font-semibold">Semibold</SelectItem><SelectItem value="font-bold">Bold</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label className="text-xs">Color</Label><Input className="h-8 text-xs" type="color" value={ls.color || "#000000"} onChange={(e) => ul("color", e.target.value)} /></div>
        </div>
      </div>
      <Separator />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Input Style</p>
        <div className="space-y-2">
          <div className="space-y-1"><Label className="text-xs">Border Radius</Label>
            <Select value={is.borderRadius || ""} onValueChange={(v) => ui("borderRadius", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Default" /></SelectTrigger>
              <SelectContent><SelectItem value="rounded-none">None</SelectItem><SelectItem value="rounded-sm">SM</SelectItem><SelectItem value="rounded-md">MD</SelectItem><SelectItem value="rounded-lg">LG</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label className="text-xs">Background</Label><Input className="h-8 text-xs" type="color" value={is.backgroundColor || "#ffffff"} onChange={(e) => ui("backgroundColor", e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">Border Color</Label><Input className="h-8 text-xs" type="color" value={is.borderColor || "#e2e8f0"} onChange={(e) => ui("borderColor", e.target.value)} /></div>
        </div>
      </div>
    </div>
  )
}

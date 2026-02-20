// ─────────────────────────────────────────────────────────
// Integrated Form Builder — Editor Store (Zustand)
// ─────────────────────────────────────────────────────────

import { create } from "zustand"
import type { FBField, FBFieldType, FBFormData, FBLogicRule } from "./types"

interface FBEditorStore {
  // ── Form State ──────────────────────────────────────
  form: FBFormData | null
  isDirty: boolean
  isSaving: boolean

  // ── Selection ───────────────────────────────────────
  selectedFieldId: string | null
  hoveredFieldId: string | null
  draggedFieldType: FBFieldType | null
  dragOverIndex: number | null
  clipboardField: FBField | null

  // ── Panels ──────────────────────────────────────────
  leftPanel: "fields" | "pages" | "logic"
  rightPanel: "properties" | "validation" | "logic" | "style"
  showPreview: boolean

  // ── History ─────────────────────────────────────────
  history: FBFormData[]
  historyIndex: number

  // ── Viewport ────────────────────────────────────────
  viewMode: "edit" | "preview" | "mobile"
  currentStep: number
  zoom: number

  // ── Actions: Form ───────────────────────────────────
  setForm: (form: FBFormData) => void
  setDirty: (dirty: boolean) => void
  setSaving: (saving: boolean) => void
  updateFormSettings: (updates: Partial<FBFormData>) => void

  // ── Actions: Fields ─────────────────────────────────
  addField: (field: FBField) => void
  updateField: (fieldId: string, updates: Partial<FBField>) => void
  removeField: (fieldId: string) => void
  moveField: (fieldId: string, newIndex: number, newStep?: number) => void
  duplicateField: (fieldId: string) => void
  copyField: (fieldId: string) => void
  pasteField: (afterIndex?: number) => void

  // ── Actions: Selection ──────────────────────────────
  selectField: (fieldId: string | null) => void
  hoverField: (fieldId: string | null) => void
  setDraggedFieldType: (type: FBFieldType | null) => void
  setDragOverIndex: (index: number | null) => void

  // ── Actions: Logic ──────────────────────────────────
  addLogicRule: (rule: FBLogicRule) => void
  updateLogicRule: (ruleId: string, updates: Partial<FBLogicRule>) => void
  removeLogicRule: (ruleId: string) => void

  // ── Actions: Panels ─────────────────────────────────
  setLeftPanel: (panel: "fields" | "pages" | "logic") => void
  setRightPanel: (panel: "properties" | "validation" | "logic" | "style") => void
  togglePreview: () => void

  // ── Actions: History ────────────────────────────────
  pushHistory: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // ── Actions: Viewport ───────────────────────────────
  setViewMode: (mode: "edit" | "preview" | "mobile") => void
  setCurrentStep: (step: number) => void
  setZoom: (zoom: number) => void
  nextStep: () => void
  prevStep: () => void

  // ── Computed ────────────────────────────────────────
  getFieldById: (fieldId: string) => FBField | undefined
  getFieldsByStep: (step: number) => FBField[]
  getStepCount: () => number
  getSelectedField: () => FBField | undefined
  getVisibleFields: () => FBField[]
}

const MAX_HISTORY = 50

function generateId() {
  return `field_${Math.random().toString(36).slice(2, 10)}`
}

export const useFormEditorStore = create<FBEditorStore>((set, get) => ({
  // ── Initial State ───────────────────────────────────
  form: null,
  isDirty: false,
  isSaving: false,
  selectedFieldId: null,
  hoveredFieldId: null,
  draggedFieldType: null,
  dragOverIndex: null,
  clipboardField: null,
  leftPanel: "fields",
  rightPanel: "properties",
  showPreview: false,
  history: [],
  historyIndex: -1,
  viewMode: "edit",
  currentStep: 1,
  zoom: 100,

  // ── Form Actions ────────────────────────────────────

  setForm: (form) => {
    set({ form, isDirty: false, selectedFieldId: null, history: [form], historyIndex: 0, currentStep: 1 })
  },

  setDirty: (dirty) => set({ isDirty: dirty }),
  setSaving: (saving) => set({ isSaving: saving }),

  updateFormSettings: (updates) => {
    const { form } = get()
    if (!form) return
    const updated = { ...form, ...updates }
    set({ form: updated, isDirty: true })
    get().pushHistory()
  },

  // ── Field Actions ───────────────────────────────────

  addField: (field) => {
    const { form } = get()
    if (!form) return

    const newField = { ...field, id: field.id || generateId() }
    const fields = [...form.fields, newField]
    const updated = { ...form, fields }
    set({ form: updated, isDirty: true, selectedFieldId: newField.id })
    get().pushHistory()
  },

  updateField: (fieldId, updates) => {
    const { form } = get()
    if (!form) return

    const fields = form.fields.map((f) =>
      f.id === fieldId ? { ...f, ...updates } : f
    )
    set({ form: { ...form, fields }, isDirty: true })
    get().pushHistory()
  },

  removeField: (fieldId) => {
    const { form, selectedFieldId } = get()
    if (!form) return

    const fields = form.fields.filter((f) => f.id !== fieldId)
    // Reindex sort orders per step
    const reindexed = fields.map((f, i) => ({ ...f, sortOrder: i }))
    const newSelected = selectedFieldId === fieldId ? null : selectedFieldId
    set({ form: { ...form, fields: reindexed }, isDirty: true, selectedFieldId: newSelected })
    get().pushHistory()
  },

  moveField: (fieldId, newIndex, newStep) => {
    const { form } = get()
    if (!form) return

    const field = form.fields.find((f) => f.id === fieldId)
    if (!field) return

    const others = form.fields.filter((f) => f.id !== fieldId)
    const movedField = { ...field, sortOrder: newIndex, ...(newStep !== undefined ? { step: newStep } : {}) }

    // Insert at new position
    others.splice(newIndex, 0, movedField)
    const reindexed = others.map((f, i) => ({ ...f, sortOrder: i }))

    set({ form: { ...form, fields: reindexed }, isDirty: true })
    get().pushHistory()
  },

  duplicateField: (fieldId) => {
    const { form } = get()
    if (!form) return

    const field = form.fields.find((f) => f.id === fieldId)
    if (!field) return

    const idx = form.fields.findIndex((f) => f.id === fieldId)
    const newField: FBField = {
      ...field,
      id: generateId(),
      name: `${field.name}_copy`,
      label: `${field.label} (Copy)`,
      isLocked: false,
    }

    const fields = [...form.fields]
    fields.splice(idx + 1, 0, newField)
    const reindexed = fields.map((f, i) => ({ ...f, sortOrder: i }))

    set({ form: { ...form, fields: reindexed }, isDirty: true, selectedFieldId: newField.id })
    get().pushHistory()
  },

  copyField: (fieldId) => {
    const { form } = get()
    if (!form) return
    const field = form.fields.find((f) => f.id === fieldId)
    if (field) set({ clipboardField: { ...field } })
  },

  pasteField: (afterIndex) => {
    const { form, clipboardField } = get()
    if (!form || !clipboardField) return

    const newField: FBField = {
      ...clipboardField,
      id: generateId(),
      name: `${clipboardField.name}_paste`,
      label: `${clipboardField.label} (Pasted)`,
      isLocked: false,
    }

    const fields = [...form.fields]
    const insertAt = afterIndex !== undefined ? afterIndex + 1 : fields.length
    fields.splice(insertAt, 0, newField)
    const reindexed = fields.map((f, i) => ({ ...f, sortOrder: i }))

    set({ form: { ...form, fields: reindexed }, isDirty: true, selectedFieldId: newField.id })
    get().pushHistory()
  },

  // ── Selection Actions ───────────────────────────────

  selectField: (fieldId) => set({ selectedFieldId: fieldId }),
  hoverField: (fieldId) => set({ hoveredFieldId: fieldId }),
  setDraggedFieldType: (type) => set({ draggedFieldType: type }),
  setDragOverIndex: (index) => set({ dragOverIndex: index }),

  // ── Logic Actions ───────────────────────────────────

  addLogicRule: (rule) => {
    const { form } = get()
    if (!form) return
    const logicRules = [...form.logicRules, { ...rule, id: rule.id || generateId() }]
    set({ form: { ...form, logicRules }, isDirty: true })
    get().pushHistory()
  },

  updateLogicRule: (ruleId, updates) => {
    const { form } = get()
    if (!form) return
    const logicRules = form.logicRules.map((r) =>
      r.id === ruleId ? { ...r, ...updates } : r
    )
    set({ form: { ...form, logicRules }, isDirty: true })
    get().pushHistory()
  },

  removeLogicRule: (ruleId) => {
    const { form } = get()
    if (!form) return
    const logicRules = form.logicRules.filter((r) => r.id !== ruleId)
    set({ form: { ...form, logicRules }, isDirty: true })
    get().pushHistory()
  },

  // ── Panel Actions ───────────────────────────────────

  setLeftPanel: (panel) => set({ leftPanel: panel }),
  setRightPanel: (panel) => set({ rightPanel: panel }),
  togglePreview: () => set((s) => ({ showPreview: !s.showPreview, viewMode: s.showPreview ? "edit" : "preview" })),

  // ── History Actions ─────────────────────────────────

  pushHistory: () => {
    const { form, history, historyIndex } = get()
    if (!form) return

    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(form)))
    if (newHistory.length > MAX_HISTORY) newHistory.shift()

    set({ history: newHistory, historyIndex: newHistory.length - 1 })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return

    const newIndex = historyIndex - 1
    const form = JSON.parse(JSON.stringify(history[newIndex]))
    set({ form, historyIndex: newIndex, isDirty: true })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return

    const newIndex = historyIndex + 1
    const form = JSON.parse(JSON.stringify(history[newIndex]))
    set({ form, historyIndex: newIndex, isDirty: true })
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // ── Viewport Actions ────────────────────────────────

  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setZoom: (zoom) => set({ zoom: Math.max(50, Math.min(150, zoom)) }),

  nextStep: () => {
    const { currentStep } = get()
    const stepCount = get().getStepCount()
    if (currentStep < stepCount) set({ currentStep: currentStep + 1 })
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 1) set({ currentStep: currentStep - 1 })
  },

  // ── Computed ────────────────────────────────────────

  getFieldById: (fieldId) => {
    return get().form?.fields.find((f) => f.id === fieldId)
  },

  getFieldsByStep: (step) => {
    return (get().form?.fields || [])
      .filter((f) => f.step === step)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },

  getStepCount: () => {
    const fields = get().form?.fields || []
    if (fields.length === 0) return 1
    return Math.max(...fields.map((f) => f.step), 1)
  },

  getSelectedField: () => {
    const { form, selectedFieldId } = get()
    if (!form || !selectedFieldId) return undefined
    return form.fields.find((f) => f.id === selectedFieldId)
  },

  getVisibleFields: () => {
    const { form, currentStep } = get()
    if (!form) return []
    return form.fields
      .filter((f) => f.step === currentStep && !f.isHidden)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },
}))

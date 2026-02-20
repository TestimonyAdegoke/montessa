"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft, ChevronRight, CheckCircle2, Upload, PenTool, Star,
  Calendar, Loader2, AlertCircle,
} from "lucide-react"
import type { FBField, FBFormData, FBLogicRule, FBBrandingConfig } from "@/lib/form-builder/types"

interface Props {
  form: FBFormData
  onSubmit: (data: Record<string, any>, meta: { completionTime: number; stepReached: number }) => Promise<{ success?: boolean; error?: string }>
  branding?: FBBrandingConfig
  readOnly?: boolean
  initialData?: Record<string, any>
}

export default function FormRenderer({ form, onSubmit, branding, readOnly, initialData }: Props) {
  const [values, setValues] = useState<Record<string, any>>(initialData || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [startTime] = useState(Date.now())

  const stepCount = form.isMultiStep ? Math.max(...form.fields.map((f) => f.step), 1) : 1

  // Evaluate conditional visibility
  const isFieldVisible = useCallback((field: FBField): boolean => {
    if (!field.conditionalOn) return !field.isHidden
    const cond = field.conditionalOn
    const targetVal = values[cond.fieldId] ?? values[form.fields.find((f) => f.id === cond.fieldId)?.name || ""]
    switch (cond.operator) {
      case "equals": return targetVal === cond.value
      case "not_equals": return targetVal !== cond.value
      case "contains": return String(targetVal || "").includes(String(cond.value))
      case "is_empty": return !targetVal || targetVal === ""
      case "is_not_empty": return !!targetVal && targetVal !== ""
      case "is_checked": return targetVal === true || targetVal === "true"
      case "is_not_checked": return targetVal !== true && targetVal !== "true"
      default: return !field.isHidden
    }
  }, [values, form.fields])

  // Evaluate logic rules
  useEffect(() => {
    if (!form.logicRules || form.logicRules.length === 0) return
    for (const rule of form.logicRules) {
      if (!rule.isActive) continue
      const conditions = Array.isArray(rule.conditions) ? rule.conditions : []
      const results = conditions.map((c) => {
        const field = form.fields.find((f) => f.id === c.fieldId)
        const val = field ? values[field.name] : undefined
        switch (c.operator) {
          case "equals": return val === c.value
          case "not_equals": return val !== c.value
          case "contains": return String(val || "").includes(String(c.value))
          case "is_empty": return !val || val === ""
          case "is_not_empty": return !!val && val !== ""
          default: return false
        }
      })
      const passes = rule.conditionLogic === "OR" ? results.some(Boolean) : results.every(Boolean)
      if (passes && rule.type === "prefill") {
        const actions = Array.isArray(rule.actions) ? rule.actions : []
        for (const action of actions) {
          if (action.action === "set_value" && action.targetFieldId && action.value !== undefined) {
            const tf = form.fields.find((f) => f.id === action.targetFieldId)
            if (tf && !values[tf.name]) {
              setValues((prev) => ({ ...prev, [tf.name]: action.value }))
            }
          }
        }
      }
    }
  }, [values, form.logicRules, form.fields])

  const getStepFields = (step: number) =>
    form.fields.filter((f) => f.step === step).sort((a, b) => a.sortOrder - b.sortOrder)

  function validateStep(step: number): boolean {
    const fields = getStepFields(step)
    const newErrors: Record<string, string> = {}

    for (const field of fields) {
      if (!isFieldVisible(field)) continue
      if (field.type === "SECTION_BREAK" || field.type === "PAGE_BREAK" || field.type === "HEADING" || field.type === "PARAGRAPH" || field.type === "DIVIDER") continue

      const val = values[field.name]
      const v = field.validations || {}

      if (field.isRequired && (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0))) {
        newErrors[field.name] = v.customMessage || `${field.label} is required`
        continue
      }

      if (val !== undefined && val !== null && val !== "") {
        if (field.type === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))) {
          newErrors[field.name] = "Please enter a valid email address"
        }
        if (field.type === "NUMBER" && isNaN(Number(val))) {
          newErrors[field.name] = "Please enter a valid number"
        }
        if (v.minLength && String(val).length < v.minLength) {
          newErrors[field.name] = v.customMessage || `Must be at least ${v.minLength} characters`
        }
        if (v.maxLength && String(val).length > v.maxLength) {
          newErrors[field.name] = v.customMessage || `Must be at most ${v.maxLength} characters`
        }
        if (v.min !== undefined && Number(val) < v.min) {
          newErrors[field.name] = v.customMessage || `Must be at least ${v.min}`
        }
        if (v.max !== undefined && Number(val) > v.max) {
          newErrors[field.name] = v.customMessage || `Must be at most ${v.max}`
        }
        if (v.pattern) {
          try {
            if (!new RegExp(v.pattern).test(String(val))) {
              newErrors[field.name] = v.patternMessage || v.customMessage || "Invalid format"
            }
          } catch { /* skip invalid regex */ }
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleNext() {
    if (validateStep(currentStep) && currentStep < stepCount) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  function handlePrev() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  async function handleSubmit() {
    if (!validateStep(currentStep)) return
    // Validate all steps for multi-step
    if (form.isMultiStep) {
      for (let s = 1; s <= stepCount; s++) {
        if (!validateStep(s)) { setCurrentStep(s); return }
      }
    }

    setIsSubmitting(true)
    setSubmitError("")
    try {
      const result = await onSubmit(values, {
        completionTime: Math.round((Date.now() - startTime) / 1000),
        stepReached: currentStep,
      })
      if (result.error) {
        setSubmitError(result.error)
      } else {
        setIsSubmitted(true)
      }
    } catch (e: any) {
      setSubmitError(e.message || "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  function setValue(name: string, value: any) {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  // Success screen
  if (isSubmitted) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Submitted Successfully!</h2>
        <p className="text-muted-foreground">{form.successMessage || "Thank you for your submission. We will review it shortly."}</p>
        {form.successRedirectUrl && (
          <Button className="mt-6" onClick={() => window.location.href = form.successRedirectUrl!}>Continue</Button>
        )}
      </div>
    )
  }

  const currentFields = getStepFields(currentStep)
  const isLastStep = currentStep >= stepCount
  const brandColor = branding?.primaryColor || "#4F46E5"

  return (
    <div className="max-w-2xl mx-auto">
      {/* Form Header */}
      <div className="mb-6">
        {branding?.logo && <img src={branding.logo} alt="" className="h-10 mb-4" />}
        <h1 className="text-2xl font-bold">{form.name}</h1>
        {form.description && <p className="text-muted-foreground mt-1">{form.description}</p>}
      </div>

      {/* Progress bar for multi-step */}
      {form.isMultiStep && stepCount > 1 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: stepCount }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s < currentStep ? "bg-green-500 text-white"
                  : s === currentStep ? "text-white" : "bg-muted text-muted-foreground"
                }`} style={s === currentStep ? { backgroundColor: brandColor } : undefined}>
                  {s < currentStep ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                {s < stepCount && <div className={`h-0.5 w-8 sm:w-16 ${s < currentStep ? "bg-green-500" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
          {form.stepLabels && form.stepLabels.length > 0 && (
            <p className="text-sm font-medium text-center">{form.stepLabels[currentStep - 1] || `Step ${currentStep}`}</p>
          )}
        </div>
      )}

      {submitError && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{submitError}
        </div>
      )}

      {/* Fields */}
      <div className="space-y-4">
        {currentFields.map((field) => {
          if (!isFieldVisible(field)) return null
          return <FieldRenderer key={field.id} field={field} value={values[field.name]} error={errors[field.name]} onChange={(v) => setValue(field.name, v)} readOnly={readOnly} brandColor={brandColor} />
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t">
        {form.isMultiStep && currentStep > 1 ? (
          <Button variant="outline" onClick={handlePrev}><ChevronLeft className="h-4 w-4 mr-1" />Previous</Button>
        ) : <div />}
        {isLastStep ? (
          <Button onClick={handleSubmit} disabled={isSubmitting || readOnly} style={{ backgroundColor: brandColor }}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        ) : (
          <Button onClick={handleNext} style={{ backgroundColor: brandColor }}>
            Next<ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Individual Field Renderer ───────────────────────────

function FieldRenderer({ field, value, error, onChange, readOnly, brandColor }: {
  field: FBField; value: any; error?: string; onChange: (v: any) => void; readOnly?: boolean; brandColor: string
}) {
  const opts = Array.isArray(field.options) ? field.options : []

  // Layout fields
  if (field.type === "SECTION_BREAK") return (
    <div className="pt-4"><h3 className="text-lg font-semibold">{field.label}</h3>
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}<Separator className="mt-2" /></div>
  )
  if (field.type === "PAGE_BREAK") return null
  if (field.type === "HEADING") return <h2 className="text-xl font-bold pt-2">{field.label}</h2>
  if (field.type === "PARAGRAPH") return <p className="text-sm text-muted-foreground">{field.description}</p>
  if (field.type === "DIVIDER") return <Separator />
  if (field.type === "HIDDEN") return <input type="hidden" value={value || field.defaultValue || ""} />

  const widthCls = field.width === "half" ? "inline-block w-[calc(50%-0.5rem)] align-top mr-4"
    : field.width === "third" ? "inline-block w-[calc(33.33%-0.67rem)] align-top mr-4"
    : field.width === "two-thirds" ? "inline-block w-[calc(66.66%-0.33rem)] align-top mr-4" : "w-full"

  return (
    <div className={widthCls}>
      <Label className="text-sm font-medium flex items-center gap-1 mb-1.5">
        {field.label}{field.isRequired && <span className="text-red-500">*</span>}
      </Label>
      {field.helpText && <p className="text-xs text-muted-foreground mb-1.5">{field.helpText}</p>}

      {/* SHORT_TEXT / EMAIL / PHONE */}
      {["SHORT_TEXT", "EMAIL", "PHONE"].includes(field.type) && (
        <Input type={field.type === "EMAIL" ? "email" : field.type === "PHONE" ? "tel" : "text"}
          value={value || ""} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder} disabled={readOnly || field.isReadOnly}
          className={error ? "border-destructive" : ""} />
      )}

      {/* NUMBER */}
      {field.type === "NUMBER" && (
        <Input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder} disabled={readOnly || field.isReadOnly}
          className={error ? "border-destructive" : ""} />
      )}

      {/* LONG_TEXT */}
      {field.type === "LONG_TEXT" && (
        <textarea className={`w-full px-3 py-2 text-sm rounded-md border bg-background resize-y min-h-[100px] ${error ? "border-destructive" : ""}`}
          value={value || ""} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder} disabled={readOnly || field.isReadOnly} />
      )}

      {/* RICH_TEXT — simplified as textarea for now */}
      {field.type === "RICH_TEXT" && (
        <textarea className={`w-full px-3 py-2 text-sm rounded-md border bg-background resize-y min-h-[120px] ${error ? "border-destructive" : ""}`}
          value={value || ""} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder} disabled={readOnly || field.isReadOnly} />
      )}

      {/* DATE / TIME / DATE_TIME */}
      {field.type === "DATE" && (
        <Input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)}
          disabled={readOnly || field.isReadOnly} className={error ? "border-destructive" : ""} />
      )}
      {field.type === "TIME" && (
        <Input type="time" value={value || ""} onChange={(e) => onChange(e.target.value)}
          disabled={readOnly || field.isReadOnly} className={error ? "border-destructive" : ""} />
      )}
      {field.type === "DATE_TIME" && (
        <Input type="datetime-local" value={value || ""} onChange={(e) => onChange(e.target.value)}
          disabled={readOnly || field.isReadOnly} className={error ? "border-destructive" : ""} />
      )}

      {/* DROPDOWN */}
      {field.type === "DROPDOWN" && (
        <Select value={value || ""} onValueChange={onChange} disabled={readOnly || field.isReadOnly}>
          <SelectTrigger className={error ? "border-destructive" : ""}><SelectValue placeholder={field.placeholder || "Select..."} /></SelectTrigger>
          <SelectContent>
            {opts.map((opt: any) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      {/* RADIO */}
      {field.type === "RADIO" && (
        <div className="space-y-2 mt-1">
          {opts.map((opt: any) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={field.name} value={opt.value} checked={value === opt.value}
                onChange={() => onChange(opt.value)} disabled={readOnly || field.isReadOnly}
                className="h-4 w-4" style={{ accentColor: brandColor }} />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* CHECKBOX */}
      {field.type === "CHECKBOX" && (
        <div className="space-y-2 mt-1">
          {opts.map((opt: any) => {
            const checked = Array.isArray(value) ? value.includes(opt.value) : false
            return (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={checked} disabled={readOnly || field.isReadOnly}
                  onChange={() => {
                    const arr = Array.isArray(value) ? [...value] : []
                    if (checked) onChange(arr.filter((v: string) => v !== opt.value))
                    else onChange([...arr, opt.value])
                  }}
                  className="h-4 w-4 rounded" style={{ accentColor: brandColor }} />
                <span className="text-sm">{opt.label}</span>
              </label>
            )
          })}
        </div>
      )}

      {/* TOGGLE */}
      {field.type === "TOGGLE" && (
        <div className="flex items-center gap-3 mt-1">
          <Switch checked={value === true || value === "true"} onCheckedChange={(v) => onChange(v)}
            disabled={readOnly || field.isReadOnly} />
          <span className="text-sm text-muted-foreground">{value ? "Yes" : "No"}</span>
        </div>
      )}

      {/* FILE_UPLOAD */}
      {field.type === "FILE_UPLOAD" && (
        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${error ? "border-destructive" : "border-muted-foreground/25"}`}>
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click or drag files to upload</p>
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" disabled={readOnly}
            onChange={(e) => { if (e.target.files?.[0]) onChange(e.target.files[0].name) }} />
          {value && <Badge variant="outline" className="mt-2">{value}</Badge>}
        </div>
      )}

      {/* SIGNATURE */}
      {field.type === "SIGNATURE" && (
        <div className={`border-2 border-dashed rounded-lg p-8 text-center ${error ? "border-destructive" : "border-muted-foreground/25"}`}>
          <PenTool className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to sign</p>
          {value && <p className="text-xs text-green-600 mt-2">Signature captured</p>}
        </div>
      )}

      {/* RATING */}
      {field.type === "RATING" && (
        <div className="flex gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button key={i} type="button" onClick={() => !readOnly && onChange(i + 1)}
              className="transition-transform hover:scale-110">
              <Star className={`h-6 w-6 ${(value || 0) > i ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
            </button>
          ))}
        </div>
      )}

      {/* SLIDER */}
      {field.type === "SLIDER" && (() => {
        const opts2 = (typeof field.options === "object" && !Array.isArray(field.options)) ? field.options as Record<string, any> : {}
        return (
          <div>
            <input type="range" className="w-full" min={opts2.min ?? 0} max={opts2.max ?? 100} step={opts2.step ?? 1}
              value={value ?? opts2.min ?? 0} onChange={(e) => onChange(Number(e.target.value))} disabled={readOnly} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{opts2.min ?? 0}</span><span className="font-medium">{value ?? opts2.min ?? 0}</span><span>{opts2.max ?? 100}</span>
            </div>
          </div>
        )
      })()}

      {/* ADDRESS */}
      {field.type === "ADDRESS" && (
        <div className="space-y-2">
          <Input placeholder="Street address" value={(value as any)?.street || ""} disabled={readOnly}
            onChange={(e) => onChange({ ...(value || {}), street: e.target.value })} className={error ? "border-destructive" : ""} />
          <div className="flex gap-2">
            <Input placeholder="City" value={(value as any)?.city || ""} disabled={readOnly} className="flex-1"
              onChange={(e) => onChange({ ...(value || {}), city: e.target.value })} />
            <Input placeholder="State" value={(value as any)?.state || ""} disabled={readOnly} className="flex-1"
              onChange={(e) => onChange({ ...(value || {}), state: e.target.value })} />
            <Input placeholder="ZIP" value={(value as any)?.zip || ""} disabled={readOnly} className="w-28"
              onChange={(e) => onChange({ ...(value || {}), zip: e.target.value })} />
          </div>
          <Input placeholder="Country" value={(value as any)?.country || ""} disabled={readOnly}
            onChange={(e) => onChange({ ...(value || {}), country: e.target.value })} />
        </div>
      )}

      {/* Linked selectors — render as search input for now */}
      {["GUARDIAN_SELECTOR", "STUDENT_SELECTOR", "STAFF_SELECTOR", "CLASS_SELECTOR", "SESSION_SELECTOR"].includes(field.type) && (
        <Input value={value || ""} onChange={(e) => onChange(e.target.value)}
          placeholder={`Search ${field.label.toLowerCase()}...`} disabled={readOnly}
          className={error ? "border-destructive" : ""} />
      )}

      {/* Special school blocks — render as structured inputs */}
      {field.type === "MEDICAL_INFO" && (
        <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
          <Input placeholder="Allergies" value={(value as any)?.allergies || ""} disabled={readOnly}
            onChange={(e) => onChange({ ...(value || {}), allergies: e.target.value })} />
          <Input placeholder="Medical conditions" value={(value as any)?.conditions || ""} disabled={readOnly}
            onChange={(e) => onChange({ ...(value || {}), conditions: e.target.value })} />
          <Input placeholder="Current medications" value={(value as any)?.medications || ""} disabled={readOnly}
            onChange={(e) => onChange({ ...(value || {}), medications: e.target.value })} />
          <div className="flex gap-2">
            <Input placeholder="Blood type" value={(value as any)?.bloodType || ""} disabled={readOnly} className="w-32"
              onChange={(e) => onChange({ ...(value || {}), bloodType: e.target.value })} />
            <Input placeholder="Doctor name" value={(value as any)?.doctorName || ""} disabled={readOnly} className="flex-1"
              onChange={(e) => onChange({ ...(value || {}), doctorName: e.target.value })} />
            <Input placeholder="Doctor phone" value={(value as any)?.doctorPhone || ""} disabled={readOnly} className="flex-1"
              onChange={(e) => onChange({ ...(value || {}), doctorPhone: e.target.value })} />
          </div>
        </div>
      )}

      {field.type === "EMERGENCY_CONTACT" && (
        <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2">
              <p className="text-xs font-medium">Contact {i + 1}</p>
              <div className="flex gap-2">
                <Input placeholder="Full name" value={(value as any)?.[`name_${i}`] || ""} disabled={readOnly} className="flex-1"
                  onChange={(e) => onChange({ ...(value || {}), [`name_${i}`]: e.target.value })} />
                <Input placeholder="Phone" value={(value as any)?.[`phone_${i}`] || ""} disabled={readOnly} className="flex-1"
                  onChange={(e) => onChange({ ...(value || {}), [`phone_${i}`]: e.target.value })} />
                <Input placeholder="Relationship" value={(value as any)?.[`relationship_${i}`] || ""} disabled={readOnly} className="w-36"
                  onChange={(e) => onChange({ ...(value || {}), [`relationship_${i}`]: e.target.value })} />
              </div>
            </div>
          ))}
        </div>
      )}

      {field.type === "CONSENT_AGREEMENT" && (() => {
        const consentOpts = (typeof field.options === "object" && !Array.isArray(field.options)) ? field.options as Record<string, any> : {}
        return (
          <div className="p-3 rounded-lg border bg-muted/30">
            {consentOpts.consentText && <p className="text-sm mb-3">{consentOpts.consentText}</p>}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={value === true || value === "true"} disabled={readOnly}
                onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded" style={{ accentColor: brandColor }} />
              <span className="text-sm font-medium">I agree</span>
            </label>
          </div>
        )
      })()}

      {field.type === "BEHAVIORAL_OBSERVATION" && (
        <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
          <Select value={(value as any)?.behaviorType || ""} onValueChange={(v) => onChange({ ...(value || {}), behaviorType: v })}>
            <SelectTrigger><SelectValue placeholder="Behavior type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="concern">Concern</SelectItem>
              <SelectItem value="incident">Incident</SelectItem>
            </SelectContent>
          </Select>
          <Select value={(value as any)?.severity || ""} onValueChange={(v) => onChange({ ...(value || {}), severity: v })}>
            <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <textarea className="w-full px-3 py-2 text-sm rounded-md border bg-background resize-y min-h-[60px]"
            placeholder="Context / Description" value={(value as any)?.context || ""} disabled={readOnly}
            onChange={(e) => onChange({ ...(value || {}), context: e.target.value })} />
          <textarea className="w-full px-3 py-2 text-sm rounded-md border bg-background resize-y min-h-[40px]"
            placeholder="Action taken" value={(value as any)?.actionTaken || ""} disabled={readOnly}
            onChange={(e) => onChange({ ...(value || {}), actionTaken: e.target.value })} />
        </div>
      )}

      {field.type === "ASSESSMENT_RUBRIC" && (
        <div className="p-3 rounded-lg border bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Rate each criterion:</p>
          {(Array.isArray((field.options as any)?.criteria) ? (field.options as any).criteria : [{ name: "Criterion 1", levels: ["Excellent", "Good", "Satisfactory", "Needs Improvement"] }]).map((c: any, i: number) => (
            <div key={i} className="mb-2">
              <p className="text-sm font-medium mb-1">{c.name}</p>
              <div className="flex gap-1 flex-wrap">
                {(c.levels || []).map((level: string) => (
                  <button key={level} type="button"
                    className={`px-2 py-1 text-xs rounded border transition-all ${(value as any)?.[c.name] === level ? "text-white" : "bg-background hover:bg-muted"}`}
                    style={(value as any)?.[c.name] === level ? { backgroundColor: brandColor, borderColor: brandColor } : undefined}
                    onClick={() => onChange({ ...(value || {}), [c.name]: level })}>{level}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {field.type === "ATTENDANCE_JUSTIFICATION" && (
        <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
          <Input type="date" value={(value as any)?.date || ""} disabled={readOnly}
            onChange={(e) => onChange({ ...(value || {}), date: e.target.value })} />
          <Select value={(value as any)?.type || ""} onValueChange={(v) => onChange({ ...(value || {}), type: v })}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="early_leave">Early Leave</SelectItem>
            </SelectContent>
          </Select>
          <textarea className="w-full px-3 py-2 text-sm rounded-md border bg-background resize-y min-h-[60px]"
            placeholder="Reason" value={(value as any)?.reason || ""} disabled={readOnly}
            onChange={(e) => onChange({ ...(value || {}), reason: e.target.value })} />
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  )
}

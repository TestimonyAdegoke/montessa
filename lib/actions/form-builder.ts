"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

async function requireAuth(roles?: string[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (roles && !roles.includes(session.user.role)) throw new Error("Forbidden")
  return session
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

// ─────────────────────────────────────────────────────────
// Form CRUD
// ─────────────────────────────────────────────────────────

export async function getForms(opts?: { category?: string; isActive?: boolean; isTemplate?: boolean; isArchived?: boolean }) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const where: any = { tenantId: session.user.tenantId }
  if (opts?.category) where.category = opts.category
  if (opts?.isActive !== undefined) where.isActive = opts.isActive
  if (opts?.isTemplate !== undefined) where.isTemplate = opts.isTemplate
  if (opts?.isArchived !== undefined) where.isArchived = opts.isArchived

  return await (prisma as any).fBForm.findMany({
    where,
    include: {
      fields: { orderBy: [{ step: "asc" }, { sortOrder: "asc" }] },
      logicRules: { orderBy: { sortOrder: "asc" } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getForm(formId: string) {
  const session = await requireAuth()

  const form = await (prisma as any).fBForm.findUnique({
    where: { id: formId },
    include: {
      fields: { orderBy: [{ step: "asc" }, { sortOrder: "asc" }] },
      logicRules: { orderBy: { sortOrder: "asc" } },
      analytics: true,
      _count: { select: { submissions: true } },
    },
  })
  if (!form || form.tenantId !== session.user.tenantId) throw new Error("Form not found")
  return form
}

export async function createForm(data: {
  name: string
  slug?: string
  description?: string
  category?: string
  icon?: string
  submissionMode?: string
  isMultiStep?: boolean
}) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const slug = slugify(data.slug || data.name)

  const existing = await (prisma as any).fBForm.findUnique({
    where: { tenantId_slug: { tenantId: session.user.tenantId, slug } },
  })
  if (existing) throw new Error("A form with this slug already exists")

  const form = await (prisma as any).fBForm.create({
    data: {
      tenantId: session.user.tenantId,
      name: data.name,
      slug,
      description: data.description || null,
      category: data.category || "general",
      icon: data.icon || null,
      submissionMode: data.submissionMode || "AUTHENTICATED",
      isMultiStep: data.isMultiStep || false,
      createdById: session.user.id,
    },
    include: {
      fields: true,
      logicRules: true,
    },
  })

  // Create analytics record
  await (prisma as any).fBFormAnalytics.create({
    data: { formId: form.id },
  })

  return form
}

export async function updateForm(formId: string, data: Record<string, any>) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const form = await (prisma as any).fBForm.findUnique({ where: { id: formId } })
  if (!form || form.tenantId !== session.user.tenantId) throw new Error("Form not found")

  // Don't allow changing slug to an existing one
  if (data.slug && data.slug !== form.slug) {
    const existing = await (prisma as any).fBForm.findUnique({
      where: { tenantId_slug: { tenantId: session.user.tenantId, slug: data.slug } },
    })
    if (existing) throw new Error("A form with this slug already exists")
  }

  // Handle JSON fields
  const updateData: any = { ...data }
  const jsonFields = ["allowedRoles", "stepLabels", "notifyEmails", "approvalChain", "escalationRules", "domainMapping", "brandingConfig"]
  for (const key of jsonFields) {
    if (updateData[key] && typeof updateData[key] === "object") {
      updateData[key] = JSON.stringify(updateData[key])
    }
  }

  return await (prisma as any).fBForm.update({
    where: { id: formId },
    data: updateData,
    include: {
      fields: { orderBy: [{ step: "asc" }, { sortOrder: "asc" }] },
      logicRules: { orderBy: { sortOrder: "asc" } },
    },
  })
}

export async function duplicateForm(formId: string, newName?: string) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const form = await (prisma as any).fBForm.findUnique({
    where: { id: formId },
    include: { fields: true, logicRules: true },
  })
  if (!form || form.tenantId !== session.user.tenantId) throw new Error("Form not found")

  const name = newName || `${form.name} (Copy)`
  let slug = slugify(name)
  let counter = 1
  while (true) {
    const existing = await (prisma as any).fBForm.findUnique({
      where: { tenantId_slug: { tenantId: session.user.tenantId, slug } },
    })
    if (!existing) break
    slug = `${slugify(name)}-${counter++}`
  }

  const newForm = await (prisma as any).fBForm.create({
    data: {
      tenantId: session.user.tenantId,
      name,
      slug,
      description: form.description,
      category: form.category,
      icon: form.icon,
      submissionMode: form.submissionMode,
      allowedRoles: form.allowedRoles,
      isMultiStep: form.isMultiStep,
      stepLabels: form.stepLabels,
      successMessage: form.successMessage,
      successRedirectUrl: form.successRedirectUrl,
      sendConfirmation: form.sendConfirmation,
      confirmationEmail: form.confirmationEmail,
      notifyEmails: form.notifyEmails,
      notifyOnSubmit: form.notifyOnSubmit,
      notifyOnApproval: form.notifyOnApproval,
      requiresPayment: form.requiresPayment,
      paymentAmount: form.paymentAmount,
      paymentCurrency: form.paymentCurrency,
      requiresApproval: form.requiresApproval,
      approvalChain: form.approvalChain,
      escalationRules: form.escalationRules,
      domainMapping: form.domainMapping,
      brandingConfig: form.brandingConfig,
      isActive: false,
      createdById: session.user.id,
    },
  })

  // Duplicate fields
  for (const field of form.fields) {
    await (prisma as any).fBFormField.create({
      data: {
        formId: newForm.id,
        name: field.name,
        label: field.label,
        type: field.type,
        description: field.description,
        placeholder: field.placeholder,
        defaultValue: field.defaultValue,
        options: field.options,
        isRequired: field.isRequired,
        validations: field.validations,
        width: field.width,
        labelStyle: field.labelStyle,
        inputStyle: field.inputStyle,
        step: field.step,
        sortOrder: field.sortOrder,
        groupId: field.groupId,
        isHidden: field.isHidden,
        conditionalOn: field.conditionalOn,
        linkedModel: field.linkedModel,
        linkedField: field.linkedField,
        linkedFilter: field.linkedFilter,
        helpText: field.helpText,
        tooltip: field.tooltip,
        isReadOnly: field.isReadOnly,
        isLocked: field.isLocked,
      },
    })
  }

  // Duplicate logic rules
  for (const rule of form.logicRules) {
    await (prisma as any).fBFormLogic.create({
      data: {
        formId: newForm.id,
        name: rule.name,
        type: rule.type,
        conditions: rule.conditions,
        conditionLogic: rule.conditionLogic,
        actions: rule.actions,
        isActive: rule.isActive,
        sortOrder: rule.sortOrder,
      },
    })
  }

  // Create analytics
  await (prisma as any).fBFormAnalytics.create({ data: { formId: newForm.id } })

  return newForm
}

export async function deleteForm(formId: string) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const form = await (prisma as any).fBForm.findUnique({ where: { id: formId } })
  if (!form || form.tenantId !== session.user.tenantId) throw new Error("Form not found")

  return await (prisma as any).fBForm.delete({ where: { id: formId } })
}

export async function archiveForm(formId: string) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const form = await (prisma as any).fBForm.findUnique({ where: { id: formId } })
  if (!form || form.tenantId !== session.user.tenantId) throw new Error("Form not found")

  return await (prisma as any).fBForm.update({
    where: { id: formId },
    data: { isArchived: true, isActive: false },
  })
}

export async function publishForm(formId: string) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const form = await (prisma as any).fBForm.findUnique({
    where: { id: formId },
    include: { fields: true },
  })
  if (!form || form.tenantId !== session.user.tenantId) throw new Error("Form not found")
  if (form.fields.length === 0) throw new Error("Cannot publish a form with no fields")

  return await (prisma as any).fBForm.update({
    where: { id: formId },
    data: { isActive: true, publishedAt: new Date(), version: form.version + 1 },
  })
}

// ─────────────────────────────────────────────────────────
// Field CRUD
// ─────────────────────────────────────────────────────────

export async function addField(formId: string, data: {
  name: string
  label: string
  type: string
  description?: string
  placeholder?: string
  defaultValue?: string
  options?: any
  isRequired?: boolean
  validations?: any
  width?: string
  step?: number
  groupId?: string
  helpText?: string
  tooltip?: string
  linkedModel?: string
  linkedField?: string
}) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const form = await (prisma as any).fBForm.findUnique({
    where: { id: formId },
    include: { fields: true },
  })
  if (!form || form.tenantId !== session.user.tenantId) throw new Error("Form not found")

  const maxOrder = form.fields.length > 0
    ? Math.max(...form.fields.filter((f: any) => f.step === (data.step || 1)).map((f: any) => f.sortOrder))
    : -1

  return await (prisma as any).fBFormField.create({
    data: {
      formId,
      name: data.name,
      label: data.label,
      type: data.type,
      description: data.description || null,
      placeholder: data.placeholder || null,
      defaultValue: data.defaultValue || null,
      options: data.options ? (typeof data.options === "string" ? data.options : JSON.stringify(data.options)) : null,
      isRequired: data.isRequired || false,
      validations: data.validations ? (typeof data.validations === "string" ? data.validations : JSON.stringify(data.validations)) : "{}",
      width: data.width || "full",
      step: data.step || 1,
      sortOrder: maxOrder + 1,
      groupId: data.groupId || null,
      helpText: data.helpText || null,
      tooltip: data.tooltip || null,
      linkedModel: data.linkedModel || null,
      linkedField: data.linkedField || null,
    },
  })
}

export async function updateField(fieldId: string, data: Record<string, any>) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const field = await (prisma as any).fBFormField.findUnique({
    where: { id: fieldId },
    include: { form: { select: { tenantId: true } } },
  })
  if (!field || field.form.tenantId !== session.user.tenantId) throw new Error("Field not found")
  if (field.isLocked) throw new Error("This field is locked and cannot be edited")

  const updateData: any = { ...data }
  const jsonFields = ["options", "validations", "labelStyle", "inputStyle", "conditionalOn", "linkedFilter"]
  for (const key of jsonFields) {
    if (updateData[key] && typeof updateData[key] === "object") {
      updateData[key] = JSON.stringify(updateData[key])
    }
  }

  return await (prisma as any).fBFormField.update({
    where: { id: fieldId },
    data: updateData,
  })
}

export async function deleteField(fieldId: string) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const field = await (prisma as any).fBFormField.findUnique({
    where: { id: fieldId },
    include: { form: { select: { tenantId: true } } },
  })
  if (!field || field.form.tenantId !== session.user.tenantId) throw new Error("Field not found")
  if (field.isLocked) throw new Error("This field is locked and cannot be deleted")

  return await (prisma as any).fBFormField.delete({ where: { id: fieldId } })
}

export async function reorderFields(formId: string, fieldOrders: { id: string; sortOrder: number; step?: number }[]) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const form = await (prisma as any).fBForm.findUnique({ where: { id: formId } })
  if (!form || form.tenantId !== session.user.tenantId) throw new Error("Form not found")

  const updates = fieldOrders.map((fo) =>
    (prisma as any).fBFormField.update({
      where: { id: fo.id },
      data: { sortOrder: fo.sortOrder, ...(fo.step !== undefined ? { step: fo.step } : {}) },
    })
  )

  await (prisma as any).$transaction(updates)
  return { success: true }
}

export async function bulkAddFields(formId: string, fields: {
  name: string
  label: string
  type: string
  isRequired?: boolean
  width?: string
  step?: number
  placeholder?: string
  options?: any
}[]) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const form = await (prisma as any).fBForm.findUnique({ where: { id: formId } })
  if (!form || form.tenantId !== session.user.tenantId) throw new Error("Form not found")

  const created = []
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i]
    const field = await (prisma as any).fBFormField.create({
      data: {
        formId,
        name: f.name,
        label: f.label,
        type: f.type,
        isRequired: f.isRequired || false,
        width: f.width || "full",
        step: f.step || 1,
        sortOrder: i,
        placeholder: f.placeholder || null,
        options: f.options ? JSON.stringify(f.options) : null,
        validations: "{}",
        labelStyle: "{}",
        inputStyle: "{}",
      },
    })
    created.push(field)
  }

  return created
}

// ─────────────────────────────────────────────────────────
// Logic Rules CRUD
// ─────────────────────────────────────────────────────────

export async function addLogicRule(formId: string, data: {
  name?: string
  type: string
  conditions: any
  conditionLogic?: string
  actions: any
}) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const form = await (prisma as any).fBForm.findUnique({
    where: { id: formId },
    include: { logicRules: true },
  })
  if (!form || form.tenantId !== session.user.tenantId) throw new Error("Form not found")

  const maxOrder = form.logicRules.length > 0
    ? Math.max(...form.logicRules.map((r: any) => r.sortOrder))
    : -1

  return await (prisma as any).fBFormLogic.create({
    data: {
      formId,
      name: data.name || null,
      type: data.type,
      conditions: typeof data.conditions === "string" ? data.conditions : JSON.stringify(data.conditions),
      conditionLogic: data.conditionLogic || "AND",
      actions: typeof data.actions === "string" ? data.actions : JSON.stringify(data.actions),
      sortOrder: maxOrder + 1,
    },
  })
}

export async function updateLogicRule(ruleId: string, data: Record<string, any>) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const rule = await (prisma as any).fBFormLogic.findUnique({
    where: { id: ruleId },
    include: { form: { select: { tenantId: true } } },
  })
  if (!rule || rule.form.tenantId !== session.user.tenantId) throw new Error("Rule not found")

  const updateData: any = { ...data }
  if (updateData.conditions && typeof updateData.conditions === "object") {
    updateData.conditions = JSON.stringify(updateData.conditions)
  }
  if (updateData.actions && typeof updateData.actions === "object") {
    updateData.actions = JSON.stringify(updateData.actions)
  }

  return await (prisma as any).fBFormLogic.update({
    where: { id: ruleId },
    data: updateData,
  })
}

export async function deleteLogicRule(ruleId: string) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const rule = await (prisma as any).fBFormLogic.findUnique({
    where: { id: ruleId },
    include: { form: { select: { tenantId: true } } },
  })
  if (!rule || rule.form.tenantId !== session.user.tenantId) throw new Error("Rule not found")

  return await (prisma as any).fBFormLogic.delete({ where: { id: ruleId } })
}

// ─────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────

export async function getFormTemplates(category?: string) {
  const where: any = { isPublished: true }
  if (category) where.category = category

  return await (prisma as any).fBFormTemplate.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { popularity: "desc" }],
  })
}

export async function getFormTemplate(templateId: string) {
  return await (prisma as any).fBFormTemplate.findUnique({ where: { id: templateId } })
}

export async function createFormFromTemplate(templateId: string, overrides?: { name?: string; slug?: string }) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const template = await (prisma as any).fBFormTemplate.findUnique({ where: { id: templateId } })
  if (!template) throw new Error("Template not found")

  const schema = typeof template.formSchema === "string" ? JSON.parse(template.formSchema) : template.formSchema
  const branding = typeof template.defaultBranding === "string" ? JSON.parse(template.defaultBranding) : template.defaultBranding

  const name = overrides?.name || template.name
  let slug = slugify(overrides?.slug || name)
  let counter = 1
  while (true) {
    const existing = await (prisma as any).fBForm.findUnique({
      where: { tenantId_slug: { tenantId: session.user.tenantId, slug } },
    })
    if (!existing) break
    slug = `${slugify(name)}-${counter++}`
  }

  const settings = schema.settings || {}

  const form = await (prisma as any).fBForm.create({
    data: {
      tenantId: session.user.tenantId,
      name,
      slug,
      description: template.description,
      category: settings.category || template.category,
      icon: template.icon,
      submissionMode: settings.submissionMode || "AUTHENTICATED",
      isMultiStep: settings.isMultiStep || false,
      stepLabels: settings.stepLabels ? JSON.stringify(settings.stepLabels) : "[]",
      requiresApproval: settings.requiresApproval || false,
      approvalChain: settings.approvalChain ? JSON.stringify(settings.approvalChain) : "[]",
      successMessage: settings.successMessage || "Thank you for your submission!",
      brandingConfig: JSON.stringify(branding),
      createdById: session.user.id,
    },
  })

  // Create fields from template
  if (schema.fields && Array.isArray(schema.fields)) {
    for (let i = 0; i < schema.fields.length; i++) {
      const f = schema.fields[i]
      await (prisma as any).fBFormField.create({
        data: {
          formId: form.id,
          name: f.name,
          label: f.label,
          type: f.type,
          description: f.description || null,
          placeholder: f.placeholder || null,
          defaultValue: f.defaultValue || null,
          options: f.options ? JSON.stringify(f.options) : null,
          isRequired: f.isRequired || false,
          validations: f.validations ? JSON.stringify(f.validations) : "{}",
          width: f.width || "full",
          labelStyle: f.labelStyle ? JSON.stringify(f.labelStyle) : "{}",
          inputStyle: f.inputStyle ? JSON.stringify(f.inputStyle) : "{}",
          step: f.step || 1,
          sortOrder: f.sortOrder ?? i,
          groupId: f.groupId || null,
          isHidden: f.isHidden || false,
          helpText: f.helpText || null,
          tooltip: f.tooltip || null,
          isLocked: f.isLocked || false,
          linkedModel: f.linkedModel || null,
          linkedField: f.linkedField || null,
        },
      })
    }
  }

  // Create logic rules from template
  if (schema.logicRules && Array.isArray(schema.logicRules)) {
    for (let i = 0; i < schema.logicRules.length; i++) {
      const r = schema.logicRules[i]
      await (prisma as any).fBFormLogic.create({
        data: {
          formId: form.id,
          name: r.name || null,
          type: r.type,
          conditions: JSON.stringify(r.conditions),
          conditionLogic: r.conditionLogic || "AND",
          actions: JSON.stringify(r.actions),
          sortOrder: r.sortOrder ?? i,
        },
      })
    }
  }

  // Increment template popularity
  await (prisma as any).fBFormTemplate.update({
    where: { id: templateId },
    data: { popularity: { increment: 1 } },
  })

  // Create analytics
  await (prisma as any).fBFormAnalytics.create({ data: { formId: form.id } })

  return form
}

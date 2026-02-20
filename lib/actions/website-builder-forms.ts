"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ─────────────────────────────────────────────────────────
// Forms CRUD
// ─────────────────────────────────────────────────────────

export async function getForms() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const site = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId }, select: { id: true } })
  if (!site) return []

  return await (prisma as any).wBForm.findMany({
    where: { siteId: site.id },
    include: {
      fields: { orderBy: { sortOrder: "asc" } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getForm(formId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const form = await (prisma as any).wBForm.findUnique({
    where: { id: formId },
    include: {
      fields: { orderBy: { sortOrder: "asc" } },
      site: { select: { tenantId: true } },
    },
  })
  if (!form || form.site.tenantId !== session.user.tenantId) throw new Error("Form not found")
  return form
}

export async function createForm(data: {
  name: string
  slug: string
  description?: string
  successMessage?: string
  redirectUrl?: string
  isMultiStep?: boolean
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const site = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId } })
  if (!site) throw new Error("Site not found")

  const slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")

  return await (prisma as any).wBForm.create({
    data: {
      siteId: site.id,
      name: data.name,
      slug,
      description: data.description || null,
      successMessage: data.successMessage || "Thank you for your submission!",
      redirectUrl: data.redirectUrl || null,
      isMultiStep: data.isMultiStep || false,
    },
  })
}

export async function updateForm(formId: string, data: Record<string, any>) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const form = await (prisma as any).wBForm.findUnique({ where: { id: formId }, include: { site: { select: { tenantId: true } } } })
  if (!form || form.site.tenantId !== session.user.tenantId) throw new Error("Form not found")

  return await (prisma as any).wBForm.update({ where: { id: formId }, data })
}

export async function deleteForm(formId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const form = await (prisma as any).wBForm.findUnique({ where: { id: formId }, include: { site: { select: { tenantId: true } } } })
  if (!form || form.site.tenantId !== session.user.tenantId) throw new Error("Form not found")

  return await (prisma as any).wBForm.delete({ where: { id: formId } })
}

// ─────────────────────────────────────────────────────────
// Form Fields
// ─────────────────────────────────────────────────────────

export async function addFormField(formId: string, data: {
  name: string
  label: string
  type: string
  placeholder?: string
  options?: any
  isRequired?: boolean
  width?: string
  step?: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const form = await (prisma as any).wBForm.findUnique({ where: { id: formId }, include: { site: { select: { tenantId: true } }, fields: true } })
  if (!form || form.site.tenantId !== session.user.tenantId) throw new Error("Form not found")

  const maxOrder = form.fields.length > 0 ? Math.max(...form.fields.map((f: any) => f.sortOrder)) : -1

  return await (prisma as any).wBFormField.create({
    data: {
      formId,
      name: data.name,
      label: data.label,
      type: data.type,
      placeholder: data.placeholder || null,
      options: data.options ? JSON.stringify(data.options) : null,
      isRequired: data.isRequired || false,
      width: data.width || "full",
      step: data.step || 1,
      sortOrder: maxOrder + 1,
    },
  })
}

export async function updateFormField(fieldId: string, data: Record<string, any>) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const field = await (prisma as any).wBFormField.findUnique({ where: { id: fieldId }, include: { form: { include: { site: { select: { tenantId: true } } } } } })
  if (!field || field.form.site.tenantId !== session.user.tenantId) throw new Error("Field not found")

  return await (prisma as any).wBFormField.update({ where: { id: fieldId }, data })
}

export async function deleteFormField(fieldId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const field = await (prisma as any).wBFormField.findUnique({ where: { id: fieldId }, include: { form: { include: { site: { select: { tenantId: true } } } } } })
  if (!field || field.form.site.tenantId !== session.user.tenantId) throw new Error("Field not found")

  return await (prisma as any).wBFormField.delete({ where: { id: fieldId } })
}

export async function reorderFormFields(formId: string, fieldIds: string[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  for (let i = 0; i < fieldIds.length; i++) {
    await (prisma as any).wBFormField.update({
      where: { id: fieldIds[i] },
      data: { sortOrder: i },
    })
  }
  return { success: true }
}

// ─────────────────────────────────────────────────────────
// Submissions
// ─────────────────────────────────────────────────────────

export async function getSubmissions(formId?: string, status?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const site = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId }, select: { id: true } })
  if (!site) return []

  const where: any = { form: { siteId: site.id } }
  if (formId) where.formId = formId
  if (status && status !== "ALL") where.status = status

  return await (prisma as any).wBFormSubmission.findMany({
    where,
    include: { form: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

export async function updateSubmissionStatus(submissionId: string, status: string, notes?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const submission = await (prisma as any).wBFormSubmission.findUnique({
    where: { id: submissionId },
    include: { form: { include: { site: { select: { tenantId: true } } } } },
  })
  if (!submission || submission.form.site.tenantId !== session.user.tenantId) throw new Error("Submission not found")

  const updateData: any = { status }
  if (notes !== undefined) updateData.notes = notes

  return await (prisma as any).wBFormSubmission.update({ where: { id: submissionId }, data: updateData })
}

export async function deleteSubmission(submissionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const submission = await (prisma as any).wBFormSubmission.findUnique({
    where: { id: submissionId },
    include: { form: { include: { site: { select: { tenantId: true } } } } },
  })
  if (!submission || submission.form.site.tenantId !== session.user.tenantId) throw new Error("Submission not found")

  return await (prisma as any).wBFormSubmission.delete({ where: { id: submissionId } })
}

// ─────────────────────────────────────────────────────────
// Public form submission (no auth required)
// ─────────────────────────────────────────────────────────

export async function submitForm(formSlug: string, tenantSubdomain: string, data: Record<string, any>) {
  const site = await (prisma as any).wBSite.findFirst({
    where: { tenant: { subdomain: tenantSubdomain } },
    select: { id: true },
  })
  if (!site) throw new Error("Site not found")

  const form = await (prisma as any).wBForm.findUnique({
    where: { siteId_slug: { siteId: site.id, slug: formSlug } },
    include: { fields: true },
  })
  if (!form || !form.isActive) throw new Error("Form not found or inactive")

  // Validate required fields
  for (const field of form.fields) {
    if (field.isRequired && !data[field.name]) {
      throw new Error(`${field.label} is required`)
    }
  }

  return await (prisma as any).wBFormSubmission.create({
    data: {
      formId: form.id,
      data: JSON.stringify(data),
      status: "NEW",
    },
  })
}

// ─────────────────────────────────────────────────────────
// Funnels CRUD
// ─────────────────────────────────────────────────────────

export async function getFunnels() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const site = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId }, select: { id: true } })
  if (!site) return []

  return await (prisma as any).wBFunnel.findMany({
    where: { siteId: site.id },
    include: { steps: { orderBy: { sortOrder: "asc" }, include: { page: { select: { title: true, slug: true } } } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function createFunnel(data: { name: string; slug: string; description?: string; conversionGoal?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const site = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId } })
  if (!site) throw new Error("Site not found")

  const slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")

  return await (prisma as any).wBFunnel.create({
    data: {
      siteId: site.id,
      name: data.name,
      slug,
      description: data.description || null,
      conversionGoal: data.conversionGoal || null,
    },
  })
}

export async function addFunnelStep(funnelId: string, data: { title: string; type: string; pageId?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const funnel = await (prisma as any).wBFunnel.findUnique({
    where: { id: funnelId },
    include: { site: { select: { tenantId: true } }, steps: true },
  })
  if (!funnel || funnel.site.tenantId !== session.user.tenantId) throw new Error("Funnel not found")

  const maxOrder = funnel.steps.length > 0 ? Math.max(...funnel.steps.map((s: any) => s.sortOrder)) : -1

  return await (prisma as any).wBFunnelStep.create({
    data: {
      funnelId,
      title: data.title,
      type: data.type,
      pageId: data.pageId || null,
      sortOrder: maxOrder + 1,
    },
  })
}

export async function deleteFunnel(funnelId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const funnel = await (prisma as any).wBFunnel.findUnique({ where: { id: funnelId }, include: { site: { select: { tenantId: true } } } })
  if (!funnel || funnel.site.tenantId !== session.user.tenantId) throw new Error("Funnel not found")

  return await (prisma as any).wBFunnel.delete({ where: { id: funnelId } })
}

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

// ─────────────────────────────────────────────────────────
// Submissions CRUD
// ─────────────────────────────────────────────────────────

export async function getSubmissions(opts?: {
  formId?: string
  status?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const where: any = {
    form: { tenantId: session.user.tenantId },
  }
  if (opts?.formId) where.formId = opts.formId
  if (opts?.status && opts.status !== "ALL") where.status = opts.status

  const submissions = await (prisma as any).fBFormSubmission.findMany({
    where,
    include: {
      form: { select: { name: true, slug: true, category: true } },
      approvals: { orderBy: { step: "asc" } },
      attachments: true,
    },
    orderBy: { createdAt: "desc" },
    take: opts?.limit || 100,
    skip: opts?.offset || 0,
  })

  const total = await (prisma as any).fBFormSubmission.count({ where })

  return { submissions, total }
}

export async function getSubmission(submissionId: string) {
  const session = await requireAuth()

  const submission = await (prisma as any).fBFormSubmission.findUnique({
    where: { id: submissionId },
    include: {
      form: {
        select: {
          name: true,
          slug: true,
          category: true,
          tenantId: true,
          fields: { orderBy: [{ step: "asc" }, { sortOrder: "asc" }] },
          requiresApproval: true,
          approvalChain: true,
        },
      },
      approvals: { orderBy: { step: "asc" } },
      attachments: true,
    },
  })

  if (!submission || submission.form.tenantId !== session.user.tenantId) {
    throw new Error("Submission not found")
  }

  return submission
}

export async function createSubmission(formId: string, data: {
  data: Record<string, any>
  submittedById?: string
  submitterName?: string
  submitterEmail?: string
  submitterRole?: string
  ipAddress?: string
  userAgent?: string
  completionTime?: number
  stepReached?: number
  isComplete?: boolean
  isDraft?: boolean
}) {
  const form = await (prisma as any).fBForm.findUnique({
    where: { id: formId },
    include: {
      fields: true,
      _count: { select: { submissions: true } },
    },
  })

  if (!form || !form.isActive) throw new Error("Form not found or inactive")

  // Check submission limits
  if (form.maxSubmissions && form._count.submissions >= form.maxSubmissions) {
    throw new Error("This form has reached its maximum number of submissions")
  }

  // Check open/close dates
  if (form.opensAt && new Date(form.opensAt) > new Date()) {
    throw new Error("This form is not yet open for submissions")
  }
  if (form.closesAt && new Date(form.closesAt) < new Date()) {
    throw new Error("This form is closed for submissions")
  }

  // Validate required fields (skip for drafts)
  if (!data.isDraft) {
    for (const field of form.fields) {
      if (field.isRequired && !field.isHidden) {
        const value = data.data[field.name]
        if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
          throw new Error(`${field.label} is required`)
        }
      }

      // Type-specific validation
      if (data.data[field.name]) {
        const val = data.data[field.name]
        const validations = typeof field.validations === "string" ? JSON.parse(field.validations) : field.validations

        if (field.type === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))) {
          throw new Error(`${field.label} must be a valid email address`)
        }
        if (field.type === "NUMBER" && isNaN(Number(val))) {
          throw new Error(`${field.label} must be a number`)
        }
        if (validations?.minLength && String(val).length < validations.minLength) {
          throw new Error(validations.customMessage || `${field.label} must be at least ${validations.minLength} characters`)
        }
        if (validations?.maxLength && String(val).length > validations.maxLength) {
          throw new Error(validations.customMessage || `${field.label} must be at most ${validations.maxLength} characters`)
        }
        if (validations?.min !== undefined && Number(val) < validations.min) {
          throw new Error(validations.customMessage || `${field.label} must be at least ${validations.min}`)
        }
        if (validations?.max !== undefined && Number(val) > validations.max) {
          throw new Error(validations.customMessage || `${field.label} must be at most ${validations.max}`)
        }
        if (validations?.pattern) {
          const regex = new RegExp(validations.pattern)
          if (!regex.test(String(val))) {
            throw new Error(validations.patternMessage || validations.customMessage || `${field.label} has an invalid format`)
          }
        }
      }
    }
  }

  const status = data.isDraft ? "DRAFT" : "SUBMITTED"

  const submission = await (prisma as any).fBFormSubmission.create({
    data: {
      formId,
      submittedById: data.submittedById || null,
      submitterName: data.submitterName || null,
      submitterEmail: data.submitterEmail || null,
      submitterRole: data.submitterRole || null,
      data: JSON.stringify(data.data),
      status,
      statusHistory: JSON.stringify([{ status, at: new Date().toISOString(), by: data.submitterName || "System" }]),
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent ? data.userAgent.slice(0, 500) : null,
      completionTime: data.completionTime || null,
      stepReached: data.stepReached || 1,
      isComplete: data.isComplete !== false,
    },
  })

  // If form requires approval and not a draft, create approval chain
  if (form.requiresApproval && !data.isDraft) {
    const chain = typeof form.approvalChain === "string" ? JSON.parse(form.approvalChain) : form.approvalChain

    if (Array.isArray(chain) && chain.length > 0) {
      for (const step of chain) {
        await (prisma as any).fBSubmissionApproval.create({
          data: {
            submissionId: submission.id,
            step: step.step,
            approverRole: step.role || null,
            approverId: step.userId || null,
            approverName: step.label || null,
          },
        })
      }

      // Set current approver to first step
      await (prisma as any).fBFormSubmission.update({
        where: { id: submission.id },
        data: {
          status: "UNDER_REVIEW",
          currentApprover: chain[0].userId || chain[0].role || null,
          approvalStep: 1,
          statusHistory: JSON.stringify([
            { status: "SUBMITTED", at: new Date().toISOString(), by: data.submitterName || "System" },
            { status: "UNDER_REVIEW", at: new Date().toISOString(), by: "System" },
          ]),
        },
      })
    }
  }

  // Update analytics
  await (prisma as any).fBFormAnalytics.upsert({
    where: { formId },
    update: {
      totalSubmissions: { increment: 1 },
      lastSubmissionAt: new Date(),
      ...(data.completionTime ? {
        avgCompletionTime: data.completionTime,
      } : {}),
    },
    create: {
      formId,
      totalSubmissions: 1,
      lastSubmissionAt: new Date(),
      avgCompletionTime: data.completionTime || null,
    },
  })

  return submission
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: string,
  notes?: string
) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const submission = await (prisma as any).fBFormSubmission.findUnique({
    where: { id: submissionId },
    include: { form: { select: { tenantId: true } } },
  })
  if (!submission || submission.form.tenantId !== session.user.tenantId) {
    throw new Error("Submission not found")
  }

  const history = typeof submission.statusHistory === "string"
    ? JSON.parse(submission.statusHistory)
    : submission.statusHistory || []

  history.push({
    status,
    at: new Date().toISOString(),
    by: session.user.name || session.user.email,
  })

  const updateData: any = {
    status,
    statusHistory: JSON.stringify(history),
  }
  if (notes !== undefined) updateData.internalNotes = notes

  return await (prisma as any).fBFormSubmission.update({
    where: { id: submissionId },
    data: updateData,
  })
}

export async function deleteSubmission(submissionId: string) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const submission = await (prisma as any).fBFormSubmission.findUnique({
    where: { id: submissionId },
    include: { form: { select: { tenantId: true } } },
  })
  if (!submission || submission.form.tenantId !== session.user.tenantId) {
    throw new Error("Submission not found")
  }

  return await (prisma as any).fBFormSubmission.delete({ where: { id: submissionId } })
}

export async function bulkDeleteSubmissions(submissionIds: string[]) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  // Verify all belong to tenant
  const submissions = await (prisma as any).fBFormSubmission.findMany({
    where: { id: { in: submissionIds } },
    include: { form: { select: { tenantId: true } } },
  })

  const valid = submissions.filter((s: any) => s.form.tenantId === session.user.tenantId)
  if (valid.length === 0) throw new Error("No valid submissions found")

  return await (prisma as any).fBFormSubmission.deleteMany({
    where: { id: { in: valid.map((s: any) => s.id) } },
  })
}

export async function bulkUpdateSubmissionStatus(submissionIds: string[], status: string) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const submissions = await (prisma as any).fBFormSubmission.findMany({
    where: { id: { in: submissionIds } },
    include: { form: { select: { tenantId: true } } },
  })

  const valid = submissions.filter((s: any) => s.form.tenantId === session.user.tenantId)
  if (valid.length === 0) throw new Error("No valid submissions found")

  const updates = valid.map((s: any) => {
    const history = typeof s.statusHistory === "string" ? JSON.parse(s.statusHistory) : s.statusHistory || []
    history.push({ status, at: new Date().toISOString(), by: session.user.name || session.user.email })

    return (prisma as any).fBFormSubmission.update({
      where: { id: s.id },
      data: { status, statusHistory: JSON.stringify(history) },
    })
  })

  await (prisma as any).$transaction(updates)
  return { updated: valid.length }
}

// ─────────────────────────────────────────────────────────
// Approval Workflow
// ─────────────────────────────────────────────────────────

export async function approveSubmission(submissionId: string, comments?: string) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "HR", "FINANCE"])

  const submission = await (prisma as any).fBFormSubmission.findUnique({
    where: { id: submissionId },
    include: {
      form: { select: { tenantId: true, approvalChain: true } },
      approvals: { orderBy: { step: "asc" } },
    },
  })
  if (!submission || submission.form.tenantId !== session.user.tenantId) {
    throw new Error("Submission not found")
  }

  // Find current pending approval for this user
  const currentApproval = submission.approvals.find(
    (a: any) => a.status === "PENDING" && a.step === submission.approvalStep
  )
  if (!currentApproval) throw new Error("No pending approval at this step")

  // Approve current step
  await (prisma as any).fBSubmissionApproval.update({
    where: { id: currentApproval.id },
    data: {
      status: "APPROVED",
      approverId: session.user.id,
      approverName: session.user.name || session.user.email,
      comments: comments || null,
      decidedAt: new Date(),
    },
  })

  // Check if there are more steps
  const nextApproval = submission.approvals.find(
    (a: any) => a.step > submission.approvalStep && a.status === "PENDING"
  )

  const history = typeof submission.statusHistory === "string"
    ? JSON.parse(submission.statusHistory)
    : submission.statusHistory || []

  if (nextApproval) {
    // Move to next step
    history.push({
      status: "UNDER_REVIEW",
      at: new Date().toISOString(),
      by: session.user.name || session.user.email,
      note: `Step ${submission.approvalStep} approved`,
    })

    await (prisma as any).fBFormSubmission.update({
      where: { id: submissionId },
      data: {
        approvalStep: nextApproval.step,
        currentApprover: nextApproval.approverId || nextApproval.approverRole || null,
        statusHistory: JSON.stringify(history),
      },
    })
  } else {
    // All steps approved
    history.push({
      status: "APPROVED",
      at: new Date().toISOString(),
      by: session.user.name || session.user.email,
    })

    await (prisma as any).fBFormSubmission.update({
      where: { id: submissionId },
      data: {
        status: "APPROVED",
        currentApprover: null,
        statusHistory: JSON.stringify(history),
      },
    })

    // Update analytics
    await (prisma as any).fBFormAnalytics.update({
      where: { formId: submission.formId },
      data: { totalApproved: { increment: 1 } },
    })
  }

  return { success: true }
}

export async function rejectSubmission(submissionId: string, comments?: string) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "HR", "FINANCE"])

  const submission = await (prisma as any).fBFormSubmission.findUnique({
    where: { id: submissionId },
    include: {
      form: { select: { tenantId: true } },
      approvals: { orderBy: { step: "asc" } },
    },
  })
  if (!submission || submission.form.tenantId !== session.user.tenantId) {
    throw new Error("Submission not found")
  }

  const currentApproval = submission.approvals.find(
    (a: any) => a.status === "PENDING" && a.step === submission.approvalStep
  )
  if (!currentApproval) throw new Error("No pending approval at this step")

  // Reject
  await (prisma as any).fBSubmissionApproval.update({
    where: { id: currentApproval.id },
    data: {
      status: "REJECTED",
      approverId: session.user.id,
      approverName: session.user.name || session.user.email,
      comments: comments || null,
      decidedAt: new Date(),
    },
  })

  const history = typeof submission.statusHistory === "string"
    ? JSON.parse(submission.statusHistory)
    : submission.statusHistory || []

  history.push({
    status: "REJECTED",
    at: new Date().toISOString(),
    by: session.user.name || session.user.email,
    note: comments || undefined,
  })

  await (prisma as any).fBFormSubmission.update({
    where: { id: submissionId },
    data: {
      status: "REJECTED",
      currentApprover: null,
      statusHistory: JSON.stringify(history),
    },
  })

  // Update analytics
  await (prisma as any).fBFormAnalytics.update({
    where: { formId: submission.formId },
    data: { totalRejected: { increment: 1 } },
  })

  return { success: true }
}

// ─────────────────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────────────────

export async function getFormAnalytics(formId: string) {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const form = await (prisma as any).fBForm.findUnique({
    where: { id: formId },
    select: { tenantId: true },
  })
  if (!form || form.tenantId !== session.user.tenantId) throw new Error("Form not found")

  const analytics = await (prisma as any).fBFormAnalytics.findUnique({
    where: { formId },
  })

  // Get status breakdown
  const statusCounts = await (prisma as any).fBFormSubmission.groupBy({
    by: ["status"],
    where: { formId },
    _count: true,
  })

  // Get submissions over time (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentSubmissions = await (prisma as any).fBFormSubmission.findMany({
    where: { formId, createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, status: true, completionTime: true },
    orderBy: { createdAt: "asc" },
  })

  // Group by date
  const dailyCounts: Record<string, number> = {}
  for (const sub of recentSubmissions) {
    const date = new Date(sub.createdAt).toISOString().split("T")[0]
    dailyCounts[date] = (dailyCounts[date] || 0) + 1
  }

  // Avg completion time
  const completionTimes = recentSubmissions
    .filter((s: any) => s.completionTime)
    .map((s: any) => s.completionTime)
  const avgTime = completionTimes.length > 0
    ? Math.round(completionTimes.reduce((a: number, b: number) => a + b, 0) / completionTimes.length)
    : null

  return {
    ...analytics,
    statusBreakdown: statusCounts.reduce((acc: any, s: any) => {
      acc[s.status] = s._count
      return acc
    }, {}),
    dailyCounts,
    avgCompletionTime: avgTime,
    recentCount: recentSubmissions.length,
  }
}

export async function getDashboardAnalytics() {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const forms = await (prisma as any).fBForm.findMany({
    where: { tenantId: session.user.tenantId, isArchived: false },
    include: {
      analytics: true,
      _count: { select: { submissions: true } },
    },
  })

  const totalForms = forms.length
  const activeForms = forms.filter((f: any) => f.isActive).length
  const totalSubmissions = forms.reduce((sum: number, f: any) => sum + (f._count?.submissions || 0), 0)
  const totalApproved = forms.reduce((sum: number, f: any) => sum + (f.analytics?.totalApproved || 0), 0)
  const totalRejected = forms.reduce((sum: number, f: any) => sum + (f.analytics?.totalRejected || 0), 0)

  // Pending approvals
  const pendingApprovals = await (prisma as any).fBFormSubmission.count({
    where: {
      form: { tenantId: session.user.tenantId },
      status: "UNDER_REVIEW",
    },
  })

  // Recent submissions (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentCount = await (prisma as any).fBFormSubmission.count({
    where: {
      form: { tenantId: session.user.tenantId },
      createdAt: { gte: sevenDaysAgo },
    },
  })

  // Top forms by submissions
  const topForms = forms
    .sort((a: any, b: any) => (b._count?.submissions || 0) - (a._count?.submissions || 0))
    .slice(0, 5)
    .map((f: any) => ({
      id: f.id,
      name: f.name,
      category: f.category,
      submissions: f._count?.submissions || 0,
      isActive: f.isActive,
    }))

  return {
    totalForms,
    activeForms,
    totalSubmissions,
    totalApproved,
    totalRejected,
    pendingApprovals,
    recentCount,
    topForms,
  }
}

// ─────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────

export async function exportSubmissions(formId: string, format: "json" | "csv" = "json") {
  const session = await requireAuth(["SUPER_ADMIN", "TENANT_ADMIN"])

  const form = await (prisma as any).fBForm.findUnique({
    where: { id: formId },
    include: { fields: { orderBy: [{ step: "asc" }, { sortOrder: "asc" }] } },
  })
  if (!form || form.tenantId !== session.user.tenantId) throw new Error("Form not found")

  const submissions = await (prisma as any).fBFormSubmission.findMany({
    where: { formId },
    orderBy: { createdAt: "desc" },
  })

  if (format === "csv") {
    const fieldNames = form.fields
      .filter((f: any) => !["SECTION_BREAK", "PAGE_BREAK", "HEADING", "PARAGRAPH", "DIVIDER"].includes(f.type))
      .map((f: any) => f.name)

    const headers = ["Submission ID", "Status", "Submitted At", "Submitter", ...fieldNames.map((n: string) => {
      const field = form.fields.find((f: any) => f.name === n)
      return field?.label || n
    })]

    const rows = submissions.map((s: any) => {
      const data = typeof s.data === "string" ? JSON.parse(s.data) : s.data
      return [
        s.id,
        s.status,
        new Date(s.createdAt).toISOString(),
        s.submitterName || s.submitterEmail || "Anonymous",
        ...fieldNames.map((n: string) => {
          const val = data[n]
          if (val === null || val === undefined) return ""
          if (typeof val === "object") return JSON.stringify(val)
          return String(val)
        }),
      ]
    })

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    return { data: csvContent, filename: `${form.slug}-submissions.csv`, mimeType: "text/csv" }
  }

  // JSON format
  return {
    data: JSON.stringify({
      form: { name: form.name, slug: form.slug, category: form.category },
      fields: form.fields.map((f: any) => ({ name: f.name, label: f.label, type: f.type })),
      submissions: submissions.map((s: any) => ({
        id: s.id,
        status: s.status,
        data: typeof s.data === "string" ? JSON.parse(s.data) : s.data,
        submitter: { name: s.submitterName, email: s.submitterEmail, role: s.submitterRole },
        createdAt: s.createdAt,
      })),
      exportedAt: new Date().toISOString(),
    }, null, 2),
    filename: `${form.slug}-submissions.json`,
    mimeType: "application/json",
  }
}

// ─────────────────────────────────────────────────────────
// Track form view (for analytics)
// ─────────────────────────────────────────────────────────

export async function trackFormView(formId: string) {
  try {
    await (prisma as any).fBFormAnalytics.upsert({
      where: { formId },
      update: { totalViews: { increment: 1 } },
      create: { formId, totalViews: 1 },
    })
  } catch {
    // Silently fail — analytics tracking should never block
  }
}

export async function trackFormStart(formId: string) {
  try {
    await (prisma as any).fBFormAnalytics.upsert({
      where: { formId },
      update: { totalStarts: { increment: 1 } },
      create: { formId, totalStarts: 1 },
    })
  } catch {
    // Silently fail
  }
}

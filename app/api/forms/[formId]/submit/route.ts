import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const body = await req.json()
    const { data, submitterName, submitterEmail, submitterRole, completionTime, stepReached, isDraft } = body

    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid submission data" }, { status: 400 })
    }

    const form = await (prisma as any).fBForm.findUnique({
      where: { id: params.formId },
      include: {
        fields: true,
        _count: { select: { submissions: true } },
      },
    })

    if (!form || !form.isActive) {
      return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 })
    }

    // Check limits
    if (form.maxSubmissions && form._count.submissions >= form.maxSubmissions) {
      return NextResponse.json({ error: "Maximum submissions reached" }, { status: 403 })
    }
    if (form.opensAt && new Date(form.opensAt) > new Date()) {
      return NextResponse.json({ error: "Form not yet open" }, { status: 403 })
    }
    if (form.closesAt && new Date(form.closesAt) < new Date()) {
      return NextResponse.json({ error: "Form is closed" }, { status: 403 })
    }

    // Validate required fields (skip for drafts)
    if (!isDraft) {
      for (const field of form.fields) {
        if (field.isRequired && !field.isHidden) {
          const val = data[field.name]
          if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
            return NextResponse.json({ error: `${field.label} is required` }, { status: 400 })
          }
        }

        // Type validation
        if (data[field.name] !== undefined && data[field.name] !== null && data[field.name] !== "") {
          const val = data[field.name]
          if (field.type === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))) {
            return NextResponse.json({ error: `${field.label} must be a valid email` }, { status: 400 })
          }
          if (field.type === "NUMBER" && isNaN(Number(val))) {
            return NextResponse.json({ error: `${field.label} must be a number` }, { status: 400 })
          }
        }
      }
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const ua = req.headers.get("user-agent") || ""
    const status = isDraft ? "DRAFT" : "SUBMITTED"

    const submission = await (prisma as any).fBFormSubmission.create({
      data: {
        formId: params.formId,
        submitterName: submitterName || null,
        submitterEmail: submitterEmail || null,
        submitterRole: submitterRole || null,
        data: JSON.stringify(data),
        status,
        statusHistory: JSON.stringify([{ status, at: new Date().toISOString(), by: submitterName || "Anonymous" }]),
        ipAddress: String(ip).slice(0, 100),
        userAgent: ua.slice(0, 500),
        completionTime: completionTime || null,
        stepReached: stepReached || 1,
        isComplete: !isDraft,
      },
    })

    // Create approval chain if needed
    if (form.requiresApproval && !isDraft) {
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
        await (prisma as any).fBFormSubmission.update({
          where: { id: submission.id },
          data: {
            status: "UNDER_REVIEW",
            currentApprover: chain[0].userId || chain[0].role || null,
            approvalStep: 1,
          },
        })
      }
    }

    // Update analytics
    try {
      await (prisma as any).fBFormAnalytics.upsert({
        where: { formId: params.formId },
        update: { totalSubmissions: { increment: 1 }, lastSubmissionAt: new Date() },
        create: { formId: params.formId, totalSubmissions: 1, lastSubmissionAt: new Date() },
      })
    } catch { /* silent */ }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: form.successMessage || "Thank you for your submission!",
      redirectUrl: form.successRedirectUrl || null,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Submission failed" }, { status: 500 })
  }
}

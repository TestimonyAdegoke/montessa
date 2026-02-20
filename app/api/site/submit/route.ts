import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ─────────────────────────────────────────────────────────
// Public Form Submission API
// POST /api/site/submit
// Body: { formSlug, subdomain, data }
// ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { formSlug, subdomain, data } = body

    if (!formSlug || !subdomain || !data) {
      return NextResponse.json({ error: "formSlug, subdomain, and data are required" }, { status: 400 })
    }

    // Find site
    const site = await (prisma as any).wBSite.findFirst({
      where: {
        OR: [
          { subdomain },
          { customDomain: subdomain },
          { tenant: { subdomain } },
        ],
      },
      select: { id: true },
    })

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Find form
    const form = await (prisma as any).wBForm.findUnique({
      where: { siteId_slug: { siteId: site.id, slug: formSlug } },
      include: { fields: true },
    })

    if (!form || !form.isActive) {
      return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 })
    }

    // Validate required fields
    const errors: string[] = []
    for (const field of form.fields) {
      if (field.isRequired && (!data[field.name] || String(data[field.name]).trim() === "")) {
        errors.push(`${field.label} is required`)
      }
      // Basic type validation
      if (data[field.name]) {
        if (field.type === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data[field.name]))) {
          errors.push(`${field.label} must be a valid email`)
        }
        if (field.type === "NUMBER" && isNaN(Number(data[field.name]))) {
          errors.push(`${field.label} must be a number`)
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 422 })
    }

    // Get IP and user agent
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"

    // Create submission
    const submission = await (prisma as any).wBFormSubmission.create({
      data: {
        formId: form.id,
        data: JSON.stringify(data),
        status: "NEW",
        ipAddress: ip,
        userAgent: userAgent.slice(0, 500),
      },
    })

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: form.successMessage || "Thank you for your submission!",
      redirectUrl: form.redirectUrl || null,
    })
  } catch (error: any) {
    console.error("Form submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

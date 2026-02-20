import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const defaultSettings = {
  invoiceTaxRate: 0,
  workingDays: [1, 2, 3, 4, 5],
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenantId = session.user.tenantId
    if (!tenantId) return NextResponse.json({ error: "No tenant ID found for user" }, { status: 400 })

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    const settings = { ...defaultSettings, ...(tenant?.settings as any || {}) }
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Get tenant settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenantId = session.user.tenantId
    if (!tenantId) return NextResponse.json({ error: "No tenant ID found for user" }, { status: 400 })

    // Verify tenant exists first
    console.log(`[PATCH /api/tenant/settings] Updating tenant: ${tenantId}, User: ${session.user.id}`)
    const existingTenant = await prisma.tenant.findUnique({ where: { id: tenantId } })

    if (!existingTenant) {
      console.error(`[PATCH /api/tenant/settings] Tenant not found: ${tenantId}`)
      return NextResponse.json({
        error: `Tenant record not found for ID: ${tenantId}. Please contact support or relogin.`
      }, { status: 404 })
    }

    const body = await request.json()
    const invoiceTaxRate = typeof body.invoiceTaxRate === "number" ? body.invoiceTaxRate : undefined
    const workingDays = Array.isArray(body.workingDays) ? body.workingDays : undefined
    const buttonStyle = typeof body.buttonStyle === "string" ? body.buttonStyle : undefined
    const inputStyle = typeof body.inputStyle === "string" ? body.inputStyle : undefined
    const cardGlass = typeof body.cardGlass === "boolean" ? body.cardGlass : undefined
    const landingPage = typeof body.landingPage === "object" ? body.landingPage : undefined
    const landingPageDraft = typeof body.landingPageDraft === "object" ? body.landingPageDraft : undefined
    const landingPagePublished = typeof body.landingPagePublished === "object" ? body.landingPagePublished : undefined

    if (invoiceTaxRate !== undefined && (invoiceTaxRate < 0 || invoiceTaxRate > 100)) {
      return NextResponse.json({ error: "invoiceTaxRate must be between 0 and 100" }, { status: 400 })
    }
    if (workingDays && !workingDays.every((d: any) => Number.isInteger(d) && d >= 0 && d <= 6)) {
      return NextResponse.json({ error: "workingDays must be integers 0..6" }, { status: 400 })
    }

    const before = existingTenant.settings || {}

    // Branding fields stored directly on Tenant model
    const brandingFields: Record<string, string | undefined> = {}
    const stringFields = [
      "logo", "primaryColor", "secondaryColor", "accentColor",
      "backgroundColor", "backgroundImage", "loginBanner", "favicon",
      "tagline", "customCSS", "loginLayout", "headerStyle", "fontFamily", "darkModeLogo",
    ]
    for (const field of stringFields) {
      if (typeof body[field] === "string") {
        brandingFields[field] = body[field]
      }
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...brandingFields,
        settings: {
          ...(before as any),
          ...(invoiceTaxRate !== undefined ? { invoiceTaxRate } : {}),
          ...(workingDays !== undefined ? { workingDays } : {}),
          ...(buttonStyle !== undefined ? { buttonStyle } : {}),
          ...(inputStyle !== undefined ? { inputStyle } : {}),
          ...(cardGlass !== undefined ? { cardGlass } : {}),
          ...(landingPage ? { landingPage: { ...(before as any).landingPage, ...landingPage } } : {}),
          ...(landingPageDraft ? { landingPageDraft: { ...(before as any).landingPageDraft, ...landingPageDraft } } : {}),
          ...(landingPagePublished ? { landingPagePublished: { ...(before as any).landingPagePublished, ...landingPagePublished } } : {}),
        },
      },
    })

    // Audit log - wrap in try/catch to not fail the main operation
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: tenantId,
          userId: session.user.id,
          action: "UPDATE",
          entity: "TenantSettings",
          entityId: tenantId,
          oldValues: before as any,
          newValues: { ...updated.settings as any, ...brandingFields },
        },
      })
    } catch (auditErr) {
      console.error("Audit log creation failed:", auditErr)
    }

    return NextResponse.json({ ...updated.settings as any, ...brandingFields })
  } catch (error) {
    console.error("Update tenant settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

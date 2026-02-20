import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const form = await (prisma as any).fBForm.findUnique({
      where: { id: params.formId },
      include: {
        fields: { orderBy: [{ step: "asc" }, { sortOrder: "asc" }] },
        logicRules: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
    })

    if (!form || !form.isActive) {
      return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 })
    }

    // Check open/close dates
    if (form.opensAt && new Date(form.opensAt) > new Date()) {
      return NextResponse.json({ error: "This form is not yet open" }, { status: 403 })
    }
    if (form.closesAt && new Date(form.closesAt) < new Date()) {
      return NextResponse.json({ error: "This form is closed" }, { status: 403 })
    }

    // Track view
    try {
      await (prisma as any).fBFormAnalytics.upsert({
        where: { formId: form.id },
        update: { totalViews: { increment: 1 } },
        create: { formId: form.id, totalViews: 1 },
      })
    } catch { /* silent */ }

    // Return public form data (strip sensitive fields)
    const branding = typeof form.brandingConfig === "string" ? JSON.parse(form.brandingConfig) : form.brandingConfig

    return NextResponse.json({
      id: form.id,
      name: form.name,
      slug: form.slug,
      description: form.description,
      category: form.category,
      isMultiStep: form.isMultiStep,
      stepLabels: typeof form.stepLabels === "string" ? JSON.parse(form.stepLabels) : form.stepLabels,
      successMessage: form.successMessage,
      successRedirectUrl: form.successRedirectUrl,
      submissionMode: form.submissionMode,
      requiresPayment: form.requiresPayment,
      paymentAmount: form.paymentAmount,
      paymentCurrency: form.paymentCurrency,
      branding,
      fields: form.fields.map((f: any) => ({
        id: f.id,
        name: f.name,
        label: f.label,
        type: f.type,
        description: f.description,
        placeholder: f.placeholder,
        defaultValue: f.defaultValue,
        options: typeof f.options === "string" ? JSON.parse(f.options) : f.options,
        isRequired: f.isRequired,
        validations: typeof f.validations === "string" ? JSON.parse(f.validations) : f.validations,
        width: f.width,
        step: f.step,
        sortOrder: f.sortOrder,
        isHidden: f.isHidden,
        conditionalOn: typeof f.conditionalOn === "string" ? JSON.parse(f.conditionalOn) : f.conditionalOn,
        helpText: f.helpText,
        tooltip: f.tooltip,
        isReadOnly: f.isReadOnly,
      })),
      logicRules: form.logicRules.map((r: any) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        conditions: typeof r.conditions === "string" ? JSON.parse(r.conditions) : r.conditions,
        conditionLogic: r.conditionLogic,
        actions: typeof r.actions === "string" ? JSON.parse(r.actions) : r.actions,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 })
  }
}

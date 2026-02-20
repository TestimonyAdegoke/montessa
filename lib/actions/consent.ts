"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getConsentForms() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const forms = await prisma.consentForm.findMany({
    where: { tenantId: session.user.tenantId },
    include: {
      ConsentResponse: { select: { id: true, consented: true, respondentId: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return forms
}

export async function getConsentForm(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const form = await prisma.consentForm.findUnique({
    where: { id },
    include: {
      ConsentResponse: true,
    },
  })

  return form
}

export async function createConsentForm(data: {
  title: string
  description: string
  content: string
  audience?: string
  targetClassIds?: string[]
  dueDate?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
    throw new Error("Forbidden")
  }

  const form = await prisma.consentForm.create({
    data: {
      tenantId: session.user.tenantId,
      createdBy: session.user.id,
      title: data.title,
      description: data.description,
      content: data.content,
      audience: (data.audience as any) || "GUARDIANS",
      targetClassIds: data.targetClassIds || [],
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  })

  // Notify guardians
  const guardians = await prisma.user.findMany({
    where: { tenantId: session.user.tenantId, role: "GUARDIAN", isActive: true },
    select: { id: true },
  })

  if (guardians.length > 0) {
    await prisma.notification.createMany({
      data: guardians.map((g) => ({
        tenantId: session.user.tenantId,
        recipientId: g.id,
        title: "New Consent Form",
        body: `Please review and respond to: "${data.title}"`,
        type: "ALERT" as any,
        category: "CONSENT" as any,
        channels: ["IN_APP", "EMAIL"] as any[],
        actionUrl: `/dashboard/consent/${form.id}`,
      })),
    })
  }

  revalidatePath("/dashboard/consent")
  return form
}

export async function respondToConsentForm(formId: string, data: {
  consented: boolean
  signature?: string
  notes?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const response = await prisma.consentResponse.upsert({
    where: { formId_respondentId: { formId, respondentId: session.user.id } },
    update: {
      consented: data.consented,
      signature: data.signature,
      notes: data.notes,
      respondedAt: new Date(),
    },
    create: {
      formId,
      respondentId: session.user.id,
      consented: data.consented,
      signature: data.signature,
      notes: data.notes,
    },
  })

  revalidatePath("/dashboard/consent")
  return response
}

export async function closeConsentForm(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
    throw new Error("Forbidden")
  }

  const form = await prisma.consentForm.update({
    where: { id },
    data: { isActive: false },
  })

  revalidatePath("/dashboard/consent")
  return form
}

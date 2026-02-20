"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createDisciplineRecord(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const record = await prisma.disciplineRecord.create({
      data: {
        studentId: formData.get("studentId") as string,
        reportedBy: session.user.id,
        type: formData.get("type") as any,
        severity: formData.get("severity") as any,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        incidentDate: new Date(formData.get("incidentDate") as string),
        location: formData.get("location") as string || null,
        actionTaken: formData.get("actionTaken") as string || null,
      },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "CREATE",
        entity: "DisciplineRecord",
        entityId: record.id,
        newValues: record as any,
      },
    })

    revalidatePath("/dashboard/discipline")
    return { success: true, data: record }
  } catch (error: any) {
    console.error("Create discipline record error:", error)
    return { success: false, error: error.message || "Failed to create record" }
  }
}

export async function updateDisciplineRecord(recordId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const resolved = formData.get("resolved") === "true"
    const record = await prisma.disciplineRecord.update({
      where: { id: recordId },
      data: {
        actionTaken: formData.get("actionTaken") as string || undefined,
        parentNotified: formData.get("parentNotified") === "true",
        parentNotifiedAt: formData.get("parentNotified") === "true" ? new Date() : undefined,
        resolved,
        resolvedAt: resolved ? new Date() : undefined,
        resolvedBy: resolved ? session.user.id : undefined,
        followUpDate: formData.get("followUpDate") ? new Date(formData.get("followUpDate") as string) : undefined,
        followUpNotes: formData.get("followUpNotes") as string || undefined,
      },
    })

    revalidatePath("/dashboard/discipline")
    return { success: true, data: record }
  } catch (error: any) {
    console.error("Update discipline record error:", error)
    return { success: false, error: error.message || "Failed to update record" }
  }
}

export async function getDisciplineRecords(studentId?: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []

    const records = await prisma.disciplineRecord.findMany({
      where: {
        Student: { tenantId: session.user.tenantId },
        ...(studentId && { studentId }),
      },
      include: {
        Student: {
          include: { User: { select: { name: true } } },
        },
      },
      orderBy: { incidentDate: "desc" },
    })

    return records
  } catch (error) {
    console.error("Get discipline records error:", error)
    return []
  }
}

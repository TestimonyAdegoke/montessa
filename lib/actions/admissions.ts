"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createApplication(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const application = await prisma.application.create({
      data: {
        tenantId: session.user.tenantId,
        studentName: formData.get("studentName") as string,
        dateOfBirth: new Date(formData.get("dateOfBirth") as string),
        gender: formData.get("gender") as any,
        guardianName: formData.get("guardianName") as string,
        guardianEmail: formData.get("guardianEmail") as string,
        guardianPhone: formData.get("guardianPhone") as string,
        relationship: (formData.get("relationship") as any) || "GUARDIAN",
        address: formData.get("address") as string || null,
        city: formData.get("city") as string || null,
        state: formData.get("state") as string || null,
        previousSchool: formData.get("previousSchool") as string || null,
        desiredGrade: formData.get("desiredGrade") as string || null,
        academicYear: formData.get("academicYear") as string || new Date().getFullYear().toString(),
        status: "SUBMITTED",
      },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "CREATE",
        entity: "Application",
        entityId: application.id,
        newValues: application as any,
      },
    })

    revalidatePath("/dashboard/admissions")
    return { success: true, data: application }
  } catch (error: any) {
    console.error("Create application error:", error)
    return { success: false, error: error.message || "Failed to create application" }
  }
}

export async function submitPublicApplication(data: {
  tenantId: string
  studentName: string
  dateOfBirth: string
  gender: string
  guardianName: string
  guardianEmail: string
  guardianPhone: string
  relationship?: string
  address?: string
  city?: string
  state?: string
  previousSchool?: string
  desiredGrade?: string
  academicYear: string
}) {
  try {
    const application = await prisma.application.create({
      data: {
        tenantId: data.tenantId,
        studentName: data.studentName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender as any,
        guardianName: data.guardianName,
        guardianEmail: data.guardianEmail,
        guardianPhone: data.guardianPhone,
        relationship: (data.relationship as any) || "GUARDIAN",
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        previousSchool: data.previousSchool || null,
        desiredGrade: data.desiredGrade || null,
        academicYear: data.academicYear,
        status: "SUBMITTED",
      },
    })

    return { success: true, data: { id: application.id } }
  } catch (error: any) {
    console.error("Public application error:", error)
    return { success: false, error: error.message || "Failed to submit application" }
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string,
  reviewNotes?: string
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status as any,
        reviewNotes: reviewNotes || undefined,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "UPDATE",
        entity: "Application",
        entityId: applicationId,
        newValues: { status, reviewNotes } as any,
      },
    })

    revalidatePath("/dashboard/admissions")
    return { success: true, data: application }
  } catch (error: any) {
    console.error("Update application status error:", error)
    return { success: false, error: error.message || "Failed to update application" }
  }
}

export async function getApplications() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []

    const applications = await prisma.application.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: "desc" },
    })

    return applications
  } catch (error) {
    console.error("Get applications error:", error)
    return []
  }
}

export async function getApplicationById(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null

    return await prisma.application.findFirst({
      where: { id, tenantId: session.user.tenantId },
    })
  } catch (error) {
    console.error("Get application error:", error)
    return null
  }
}

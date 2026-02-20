"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createLessonPlan(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const teacher = await prisma.teacher.findFirst({ where: { userId: session.user.id } })
    if (!teacher) return { success: false, error: "Teacher profile not found" }

    const objectives = formData.get("objectives") ? JSON.parse(formData.get("objectives") as string) : []
    const materials = formData.get("materials") ? JSON.parse(formData.get("materials") as string) : []

    const plan = await prisma.lessonPlan.create({
      data: {
        teacherId: teacher.id,
        classId: formData.get("classId") as string,
        title: formData.get("title") as string,
        subject: formData.get("subject") as string,
        objectives,
        materials,
        procedure: formData.get("procedure") as string,
        assessment: formData.get("assessment") as string || null,
        homework: formData.get("homework") as string || null,
        scheduledDate: new Date(formData.get("scheduledDate") as string),
        duration: parseInt(formData.get("duration") as string) || 45,
        notes: formData.get("notes") as string || null,
        status: "DRAFT",
      },
    })

    revalidatePath("/dashboard/lesson-plans")
    return { success: true, data: plan }
  } catch (error: any) {
    console.error("Create lesson plan error:", error)
    return { success: false, error: error.message || "Failed to create lesson plan" }
  }
}

export async function updateLessonPlan(planId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const objectives = formData.get("objectives") ? JSON.parse(formData.get("objectives") as string) : undefined
    const materials = formData.get("materials") ? JSON.parse(formData.get("materials") as string) : undefined

    const plan = await prisma.lessonPlan.update({
      where: { id: planId },
      data: {
        title: formData.get("title") as string || undefined,
        subject: formData.get("subject") as string || undefined,
        objectives,
        materials,
        procedure: formData.get("procedure") as string || undefined,
        assessment: formData.get("assessment") as string || undefined,
        homework: formData.get("homework") as string || undefined,
        scheduledDate: formData.get("scheduledDate") ? new Date(formData.get("scheduledDate") as string) : undefined,
        duration: formData.get("duration") ? parseInt(formData.get("duration") as string) : undefined,
        status: formData.get("status") as any || undefined,
        notes: formData.get("notes") as string || undefined,
      },
    })

    revalidatePath("/dashboard/lesson-plans")
    return { success: true, data: plan }
  } catch (error: any) {
    console.error("Update lesson plan error:", error)
    return { success: false, error: error.message || "Failed to update lesson plan" }
  }
}

export async function deleteLessonPlan(planId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.lessonPlan.delete({ where: { id: planId } })

    revalidatePath("/dashboard/lesson-plans")
    return { success: true }
  } catch (error: any) {
    console.error("Delete lesson plan error:", error)
    return { success: false, error: error.message || "Failed to delete lesson plan" }
  }
}

export async function getLessonPlans(classId?: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []

    const where: any = {}

    if (session.user.role === "TEACHER") {
      const teacher = await prisma.teacher.findFirst({ where: { userId: session.user.id } })
      if (teacher) where.teacherId = teacher.id
    } else {
      where.teacher = { user: { tenantId: session.user.tenantId } }
    }

    if (classId) where.classId = classId

    const plans = await prisma.lessonPlan.findMany({
      where,
      include: {
        Teacher: { include: { User: { select: { name: true } } } },
      },
      orderBy: { scheduledDate: "desc" },
    })

    return plans
  } catch (error) {
    console.error("Get lesson plans error:", error)
    return []
  }
}

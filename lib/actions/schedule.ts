"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createSchedule(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const classId = formData.get("classId") as string
    const dayOfWeek = formData.get("dayOfWeek") as string
    const subject = formData.get("subject") as string
    const startTime = formData.get("startTime") as string
    const endTime = formData.get("endTime") as string
    const teacherId = formData.get("teacherId") as string
    const roomNumber = formData.get("roomNumber") as string

    const schedule = await prisma.schedule.create({
      data: {
        classId,
        dayOfWeek: parseInt(dayOfWeek),
        subject,
        startTime,
        endTime,
        teacherId: teacherId || undefined,
        effectiveFrom: new Date(),
      },
    })

    revalidatePath("/dashboard/schedule")
    return { success: true, data: schedule }
  } catch (error: any) {
    console.error("Create schedule error:", error)
    return { success: false, error: error.message || "Failed to create schedule" }
  }
}

export async function getWeeklySchedule(classId?: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return []
    }

    const rawSchedules = await prisma.schedule.findMany({
      where: {
        Class: { tenantId: session.user.tenantId },
        ...(classId && { classId }),
        isActive: true,
      },
      include: {
        Class: { select: { name: true } },
        Teacher: {
          include: {
            User: { select: { name: true } },
          },
        },
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    })

    return rawSchedules.map(({ Class, Teacher, ...rest }) => ({
      ...rest,
      class: Class,
      teacher: Teacher ? { ...Teacher, user: Teacher.User } : null,
    }))
  } catch (error) {
    console.error("Get schedule error:", error)
    return []
  }
}

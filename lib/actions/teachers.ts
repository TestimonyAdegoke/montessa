"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function createTeacher(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const employeeId = formData.get("employeeId") as string
    const department = formData.get("department") as string
    const qualification = formData.get("qualification") as string
    const experience = parseInt(formData.get("experience") as string) || 0
    const specialization = formData.get("specialization") as string || undefined
    const hireDate = formData.get("hireDate") ? new Date(formData.get("hireDate") as string) : new Date()

    // Create user account
    const password = await bcrypt.hash("Teacher123!", 10)
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
        phone,
        role: "TEACHER",
        tenantId: session.user.tenantId,
        isActive: true,
      },
    })

    // Create teacher
    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        employeeId,
        department,
        qualification,
        experience,
        specialization,
        hireDate,
        status: "ACTIVE",
      },
    })

    revalidatePath("/dashboard/teachers")
    return { success: true, data: teacher }
  } catch (error: any) {
    console.error("Create teacher error:", error)
    return { success: false, error: error.message || "Failed to create teacher" }
  }
}

export async function updateTeacher(teacherId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const department = formData.get("department") as string
    const qualification = formData.get("qualification") as string
    const experience = parseInt(formData.get("experience") as string) || 0
    const specialization = formData.get("specialization") as string || undefined

    // Get existing teacher
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { User: true },
    })

    if (!existingTeacher || existingTeacher.User.tenantId !== session.user.tenantId) {
      return { success: false, error: "Teacher not found" }
    }

    // Update user
    await prisma.user.update({
      where: { id: existingTeacher.userId },
      data: {
        name,
        phone,
      },
    })

    // Update teacher
    const teacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        department,
        qualification,
        experience,
        specialization,
      },
    })

    revalidatePath("/dashboard/teachers")
    revalidatePath(`/dashboard/teachers/${teacherId}`)
    return { success: true, data: teacher }
  } catch (error: any) {
    console.error("Update teacher error:", error)
    return { success: false, error: error.message || "Failed to update teacher" }
  }
}

export async function deleteTeacher(teacherId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { User: true },
    })

    if (!teacher || teacher.User.tenantId !== session.user.tenantId) {
      return { success: false, error: "Teacher not found" }
    }

    // Soft delete
    await prisma.teacher.update({
      where: { id: teacherId },
      data: { status: "TERMINATED" },
    })

    await prisma.user.update({
      where: { id: teacher.userId },
      data: { isActive: false },
    })

    revalidatePath("/dashboard/teachers")
    return { success: true }
  } catch (error: any) {
    console.error("Delete teacher error:", error)
    return { success: false, error: error.message || "Failed to delete teacher" }
  }
}

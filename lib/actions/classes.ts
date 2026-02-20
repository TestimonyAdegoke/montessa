"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createClass(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const name = formData.get("name") as string
    const grade = formData.get("grade") as string || null
    const section = formData.get("section") as string || null
    const academicYear = formData.get("academicYear") as string
    const capacity = parseInt(formData.get("capacity") as string) || 30
    const roomNumber = formData.get("roomNumber") as string || null

    const classData = await prisma.class.create({
      data: {
        tenantId: session.user.tenantId,
        name,
        grade,
        section,
        academicYear,
        capacity,
        roomNumber,
        status: "ACTIVE",
      },
    })

    revalidatePath("/dashboard/classes")
    return { success: true, data: classData }
  } catch (error: any) {
    console.error("Create class error:", error)
    return { success: false, error: error.message || "Failed to create class" }
  }
}

export async function updateClass(classId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const name = formData.get("name") as string
    const grade = formData.get("grade") as string || null
    const section = formData.get("section") as string || null
    const capacity = parseInt(formData.get("capacity") as string) || 30
    const roomNumber = formData.get("roomNumber") as string || null

    const classData = await prisma.class.update({
      where: { id: classId },
      data: {
        name,
        grade,
        section,
        capacity,
        roomNumber,
      },
    })

    revalidatePath("/dashboard/classes")
    revalidatePath(`/dashboard/classes/${classId}`)
    return { success: true, data: classData }
  } catch (error: any) {
    console.error("Update class error:", error)
    return { success: false, error: error.message || "Failed to update class" }
  }
}

export async function assignTeacher(classId: string, teacherId: string, isPrimary: boolean = false) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if assignment already exists
    const existing = await prisma.classTeacher.findFirst({
      where: {
        classId,
        teacherId,
      },
    })

    if (existing) {
      return { success: false, error: "Teacher already assigned to this class" }
    }

    const assignment = await prisma.classTeacher.create({
      data: {
        classId,
        teacherId,
        isPrimary,
      },
    })

    revalidatePath("/dashboard/classes")
    revalidatePath(`/dashboard/classes/${classId}`)
    return { success: true, data: assignment }
  } catch (error: any) {
    console.error("Assign teacher error:", error)
    return { success: false, error: error.message || "Failed to assign teacher" }
  }
}

export async function removeTeacher(classId: string, teacherId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.classTeacher.deleteMany({
      where: {
        classId,
        teacherId,
      },
    })

    revalidatePath("/dashboard/classes")
    revalidatePath(`/dashboard/classes/${classId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Remove teacher error:", error)
    return { success: false, error: error.message || "Failed to remove teacher" }
  }
}

export async function deleteClass(classId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    // Soft delete
    await prisma.class.update({
      where: { id: classId },
      data: { status: "INACTIVE" },
    })

    revalidatePath("/dashboard/classes")
    return { success: true }
  } catch (error: any) {
    console.error("Delete class error:", error)
    return { success: false, error: error.message || "Failed to delete class" }
  }
}

export async function getAvailableTeachers() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return []
    }

    const rawTeachers = await prisma.teacher.findMany({
      where: {
        User: {
          tenantId: session.user.tenantId,
          isActive: true,
        },
        status: "ACTIVE",
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        User: {
          name: "asc",
        },
      },
    })

    return rawTeachers.map(({ User, ...rest }) => ({ ...rest, user: User }))
  } catch (error) {
    console.error("Get teachers error:", error)
    return []
  }
}

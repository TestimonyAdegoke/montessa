"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createAssessment(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const type = formData.get("type") as string
    const subject = formData.get("subject") as string
    const totalMarks = parseInt(formData.get("totalMarks") as string)
    const duration = parseInt(formData.get("duration") as string)
    const scheduledFor = formData.get("scheduledFor") ? new Date(formData.get("scheduledFor") as string) : null
    const classId = formData.get("classId") as string
    const questions = formData.get("questions") ? JSON.parse(formData.get("questions") as string) : []

    // Find teacher record for current user
    const teacher = await prisma.teacher.findFirst({ where: { userId: session.user.id } })
    if (!teacher) return { success: false, error: "Teacher profile not found" }

    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        type: type as any,
        subject,
        totalMarks,
        passingMarks: Math.round(totalMarks * 0.4),
        duration,
        questions,
        classId,
        teacherId: teacher.id,
        scheduledDate: scheduledFor,
        status: "DRAFT",
      },
    })

    revalidatePath("/dashboard/assessments")
    return { success: true, data: assessment }
  } catch (error: any) {
    console.error("Create assessment error:", error)
    return { success: false, error: error.message || "Failed to create assessment" }
  }
}

export async function updateAssessment(assessmentId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const subject = formData.get("subject") as string
    const totalMarks = parseInt(formData.get("totalMarks") as string)
    const duration = parseInt(formData.get("duration") as string)
    const scheduledFor = formData.get("scheduledFor") ? new Date(formData.get("scheduledFor") as string) : null
    const questions = formData.get("questions") ? JSON.parse(formData.get("questions") as string) : []
    const status = formData.get("status") as string

    const assessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        title,
        description,
        subject,
        totalMarks,
        duration,
        questions,
        scheduledDate: scheduledFor,
        status: status as any,
      },
    })

    revalidatePath("/dashboard/assessments")
    revalidatePath(`/dashboard/assessments/${assessmentId}`)
    return { success: true, data: assessment }
  } catch (error: any) {
    console.error("Update assessment error:", error)
    return { success: false, error: error.message || "Failed to update assessment" }
  }
}

export async function publishAssessment(assessmentId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    // Get assessment with class enrollments
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        Class: {
          include: {
            ClassEnrollment: {
              where: {
                status: "ACTIVE",
              },
              include: {
                Student: true,
              },
            },
          },
        },
      },
    })

    if (!assessment) {
      return { success: false, error: "Assessment not found" }
    }

    // Update assessment status
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: "PUBLISHED" },
    })

    // Create assessment results for all enrolled students
    if (assessment.Class) {
      const results = assessment.Class.ClassEnrollment.map((enrollment) => ({
        assessmentId,
        studentId: enrollment.studentId,
        obtainedMarks: 0,
        totalMarks: assessment.totalMarks,
        percentage: 0,
        answers: {},
        status: "PENDING" as any,
      }))

      await prisma.assessmentResult.createMany({
        data: results,
        skipDuplicates: true,
      })
    }

    revalidatePath("/dashboard/assessments")
    revalidatePath(`/dashboard/assessments/${assessmentId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Publish assessment error:", error)
    return { success: false, error: error.message || "Failed to publish assessment" }
  }
}

export async function deleteAssessment(assessmentId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.assessment.delete({
      where: { id: assessmentId },
    })

    revalidatePath("/dashboard/assessments")
    return { success: true }
  } catch (error: any) {
    console.error("Delete assessment error:", error)
    return { success: false, error: error.message || "Failed to delete assessment" }
  }
}

export async function submitAssessment(assessmentId: string, studentId: string, answers: any) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    // Find or create assessment result
    const existingResult = await prisma.assessmentResult.findFirst({
      where: {
        assessmentId,
        studentId,
      },
    })

    if (existingResult) {
      await prisma.assessmentResult.update({
        where: { id: existingResult.id },
        data: {
          answers: JSON.stringify(answers),
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      })
    } else {
      const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } })
      await prisma.assessmentResult.create({
        data: {
          assessmentId,
          studentId,
          obtainedMarks: 0,
          totalMarks: assessment?.totalMarks || 0,
          percentage: 0,
          answers: JSON.stringify(answers),
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      })
    }

    revalidatePath(`/dashboard/assessments/${assessmentId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Submit assessment error:", error)
    return { success: false, error: error.message || "Failed to submit assessment" }
  }
}

export async function getClassesForAssessment() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return []
    }

    const classes = await prisma.class.findMany({
      where: {
        tenantId: session.user.tenantId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        grade: true,
        _count: {
          select: {
            ClassEnrollment: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return classes
  } catch (error) {
    console.error("Get classes error:", error)
    return []
  }
}

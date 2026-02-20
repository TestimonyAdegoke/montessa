"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function gradeAssessment(resultId: string, marks: number, feedback: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const existing = await prisma.assessmentResult.findUnique({
      where: { id: resultId },
    })
    if (!existing) return { success: false, error: "Result not found" }

    const percentage = existing.totalMarks > 0 ? (marks / existing.totalMarks) * 100 : 0

    const result = await prisma.assessmentResult.update({
      where: { id: resultId },
      data: {
        obtainedMarks: marks,
        percentage,
        feedback,
        status: "GRADED",
      },
    })

    revalidatePath("/dashboard/assessments")
    return { success: true, data: result }
  } catch (error: any) {
    console.error("Grade assessment error:", error)
    return { success: false, error: error.message || "Failed to grade assessment" }
  }
}

export async function getGradebookData(classId?: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const classWhere: any = { tenantId: session.user.tenantId }
    if (classId) classWhere.id = classId

    const classes = await prisma.class.findMany({
      where: classWhere,
      select: { id: true, name: true, grade: true },
      orderBy: { name: "asc" },
    })

    const rawAssessments = await prisma.assessment.findMany({
      where: {
        Class: { tenantId: session.user.tenantId },
        ...(classId ? { classId } : {}),
      },
      select: {
        id: true,
        title: true,
        subject: true,
        totalMarks: true,
        classId: true,
        Class: { select: { name: true } },
        AssessmentResult: {
          select: {
            id: true,
            studentId: true,
            obtainedMarks: true,
            totalMarks: true,
            percentage: true,
            grade: true,
            status: true,
            Student: {
              select: {
                id: true,
                admissionNumber: true,
                User: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    const assessments = rawAssessments.map(({ Class, AssessmentResult, ...rest }) => ({
      ...rest,
      class: Class,
      results: AssessmentResult.map(({ Student, ...rRest }) => ({
        ...rRest,
        student: { ...Student, user: Student.User },
      })),
    }))

    // Build per-class summary
    const classSummaries = classes.map((cls) => {
      const classAssessments = assessments.filter((a) => a.classId === cls.id)
      const allResults = classAssessments.flatMap((a) => a.results)
      const gradedResults = allResults.filter((r) => r.status === "GRADED")
      const avgPercentage = gradedResults.length > 0
        ? gradedResults.reduce((sum, r) => sum + r.percentage, 0) / gradedResults.length
        : 0

      return {
        classId: cls.id,
        className: cls.name,
        grade: cls.grade,
        totalAssessments: classAssessments.length,
        totalResults: allResults.length,
        gradedResults: gradedResults.length,
        averagePercentage: Math.round(avgPercentage * 10) / 10,
      }
    })

    return {
      success: true,
      data: {
        classes,
        assessments,
        classSummaries,
      },
    }
  } catch (error: any) {
    console.error("Get gradebook error:", error)
    return { success: false, error: error.message || "Failed to load gradebook" }
  }
}

export async function bulkGrade(grades: Array<{ resultId: string; marks: number; feedback?: string }>) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const results = await Promise.all(
      grades.map(async (grade) => {
        const existing = await prisma.assessmentResult.findUnique({ where: { id: grade.resultId } })
        const percentage = existing && existing.totalMarks > 0 ? (grade.marks / existing.totalMarks) * 100 : 0
        return prisma.assessmentResult.update({
          where: { id: grade.resultId },
          data: {
            obtainedMarks: grade.marks,
            percentage,
            feedback: grade.feedback,
            status: "GRADED",
          },
        })
      })
    )

    revalidatePath("/dashboard/assessments")
    return { success: true, count: results.length }
  } catch (error: any) {
    console.error("Bulk grade error:", error)
    return { success: false, error: error.message || "Failed to grade assessments" }
  }
}

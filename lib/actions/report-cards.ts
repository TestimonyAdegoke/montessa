"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export interface ReportCardData {
  student: {
    name: string
    admissionNumber: string | null
    className: string | null
    grade: string | null
  }
  term: string
  academicYear: string
  subjects: {
    name: string
    obtainedMarks: number
    totalMarks: number
    percentage: number
    grade: string | null
  }[]
  attendance: {
    totalDays: number
    present: number
    absent: number
    late: number
    percentage: number
  }
  overallPercentage: number
  overallGrade: string
  teacherRemarks: string
  generatedAt: string
}

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "A+"
  if (percentage >= 80) return "A"
  if (percentage >= 70) return "B+"
  if (percentage >= 60) return "B"
  if (percentage >= 50) return "C"
  if (percentage >= 40) return "D"
  return "F"
}

export async function generateReportCard(
  studentId: string,
  term: string,
  academicYear: string
): Promise<{ success: boolean; data?: ReportCardData; error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const rawStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        User: { select: { name: true } },
        Class: { select: { name: true, grade: true } },
        AssessmentResult: {
          include: {
            Assessment: { select: { title: true, subject: true, totalMarks: true } },
          },
        },
        AttendanceRecord: true,
      },
    })

    if (!rawStudent) return { success: false, error: "Student not found" }

    const student = {
      ...rawStudent,
      user: rawStudent.User,
      currentClass: rawStudent.Class,
      assessmentResults: rawStudent.AssessmentResult.map((r: any) => ({ ...r, assessment: r.Assessment })),
      attendanceRecords: rawStudent.AttendanceRecord,
    }

    // Group results by subject
    const subjectMap = new Map<string, { obtained: number; total: number; count: number }>()
    for (const result of student.assessmentResults) {
      const subject = result.assessment.subject
      const existing = subjectMap.get(subject) || { obtained: 0, total: 0, count: 0 }
      existing.obtained += result.obtainedMarks
      existing.total += result.totalMarks
      existing.count += 1
      subjectMap.set(subject, existing)
    }

    const subjects = Array.from(subjectMap.entries()).map(([name, data]) => {
      const percentage = data.total > 0 ? (data.obtained / data.total) * 100 : 0
      return {
        name,
        obtainedMarks: data.obtained,
        totalMarks: data.total,
        percentage: Math.round(percentage * 10) / 10,
        grade: calculateGrade(percentage),
      }
    })

    // Attendance stats
    const totalDays = student.attendanceRecords.length
    const present = student.attendanceRecords.filter((a) => a.status === "PRESENT").length
    const absent = student.attendanceRecords.filter((a) => a.status === "ABSENT").length
    const late = student.attendanceRecords.filter((a) => a.status === "LATE").length
    const attendancePercentage = totalDays > 0 ? (present / totalDays) * 100 : 0

    // Overall
    const totalObtained = subjects.reduce((s, sub) => s + sub.obtainedMarks, 0)
    const totalTotal = subjects.reduce((s, sub) => s + sub.totalMarks, 0)
    const overallPercentage = totalTotal > 0 ? (totalObtained / totalTotal) * 100 : 0

    const reportCard: ReportCardData = {
      student: {
        name: student.user.name || student.legalName,
        admissionNumber: student.admissionNumber,
        className: student.currentClass?.name || null,
        grade: student.currentClass?.grade || null,
      },
      term,
      academicYear,
      subjects,
      attendance: {
        totalDays,
        present,
        absent,
        late,
        percentage: Math.round(attendancePercentage * 10) / 10,
      },
      overallPercentage: Math.round(overallPercentage * 10) / 10,
      overallGrade: calculateGrade(overallPercentage),
      teacherRemarks: overallPercentage >= 70 ? "Excellent performance. Keep it up!" : overallPercentage >= 50 ? "Good effort. Room for improvement." : "Needs improvement. Please focus on weak areas.",
      generatedAt: new Date().toISOString(),
    }

    return { success: true, data: reportCard }
  } catch (error: any) {
    console.error("Generate report card error:", error)
    return { success: false, error: error.message || "Failed to generate report card" }
  }
}

export async function getStudentsForReportCards(classId?: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []

    const rawStudents = await prisma.student.findMany({
      where: {
        tenantId: session.user.tenantId,
        studentStatus: "ACTIVE",
        ...(classId && { currentClassId: classId }),
      },
      include: {
        User: { select: { name: true } },
        Class: { select: { name: true, grade: true } },
      },
      orderBy: { User: { name: "asc" } },
    })

    return rawStudents.map((s: any) => ({ ...s, user: s.User, currentClass: s.Class }))
  } catch (error) {
    console.error("Get students for report cards error:", error)
    return []
  }
}

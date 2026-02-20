"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function markAttendance(studentId: string, date: Date, status: string, remarks?: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if attendance already exists for this date
    const existing = await prisma.attendanceRecord.findFirst({
      where: {
        studentId,
        tenantId: session.user.tenantId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    })

    let attendance
    if (existing) {
      // Update existing record
      attendance = await prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: {
          status: status as any,
          remarks,
          checkInTime: status === "PRESENT" ? new Date() : null,
        },
      })
    } else {
      // Create new record
      attendance = await prisma.attendanceRecord.create({
        data: {
          studentId,
          tenantId: session.user.tenantId,
          date: new Date(date.setHours(0, 0, 0, 0)),
          status: status as any,
          remarks,
          checkInTime: status === "PRESENT" ? new Date() : null,
          checkInMethod: "MANUAL",
        },
      })
    }

    revalidatePath("/dashboard/attendance")
    return { success: true, data: attendance }
  } catch (error: any) {
    console.error("Mark attendance error:", error)
    return { success: false, error: error.message || "Failed to mark attendance" }
  }
}

export async function bulkMarkAttendance(attendanceData: Array<{
  studentId: string
  status: string
  remarks?: string
}>, date: Date) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const results = await Promise.all(
      attendanceData.map(async (data) => {
        return markAttendance(data.studentId, date, data.status, data.remarks)
      })
    )

    const failed = results.filter(r => !r.success)
    if (failed.length > 0) {
      return { 
        success: false, 
        error: `Failed to mark ${failed.length} attendance records`,
        details: failed 
      }
    }

    revalidatePath("/dashboard/attendance")
    return { success: true, count: results.length }
  } catch (error: any) {
    console.error("Bulk mark attendance error:", error)
    return { success: false, error: error.message || "Failed to mark attendance" }
  }
}

export async function getClassAttendance(classId: string, date: Date) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return []
    }

    const students = await prisma.student.findMany({
      where: {
        tenantId: session.user.tenantId,
        currentClassId: classId,
        studentStatus: "ACTIVE",
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
        AttendanceRecord: {
          where: {
            date: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999)),
            },
          },
        },
      },
      orderBy: {
        legalName: "asc",
      },
    })

    return students.map(student => ({
      id: student.id,
      legalName: student.legalName,
      preferredName: student.preferredName,
      admissionNumber: student.admissionNumber,
      profilePhoto: student.profilePhoto,
      attendance: student.AttendanceRecord[0] || null,
    }))
  } catch (error) {
    console.error("Get class attendance error:", error)
    return []
  }
}

export async function getAttendanceStats(startDate: Date, endDate: Date) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return null
    }

    const [total, present, absent, late] = await Promise.all([
      prisma.attendanceRecord.count({
        where: {
          tenantId: session.user.tenantId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.attendanceRecord.count({
        where: {
          tenantId: session.user.tenantId,
          status: "PRESENT",
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.attendanceRecord.count({
        where: {
          tenantId: session.user.tenantId,
          status: "ABSENT",
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.attendanceRecord.count({
        where: {
          tenantId: session.user.tenantId,
          status: "LATE",
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ])

    return {
      total,
      present,
      absent,
      late,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
    }
  } catch (error) {
    console.error("Get attendance stats error:", error)
    return null
  }
}

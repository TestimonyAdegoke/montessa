"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getDashboardStats() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return null
    }

    const [totalStudents, totalTeachers, totalClasses, todayAttendance] = await Promise.all([
      prisma.student.count({
        where: {
          tenantId: session.user.tenantId,
          studentStatus: "ACTIVE",
        },
      }),
      prisma.teacher.count({
        where: {
          User: { tenantId: session.user.tenantId },
          status: "ACTIVE",
        },
      }),
      prisma.class.count({
        where: {
          tenantId: session.user.tenantId,
          status: "ACTIVE",
        },
      }),
      prisma.attendanceRecord.count({
        where: {
          tenantId: session.user.tenantId,
          status: "PRESENT",
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ])

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      todayAttendance,
    }
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return null
  }
}

export async function getAttendanceTrend(days: number = 30) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return []
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const records = await prisma.attendanceRecord.groupBy({
      by: ["date", "status"],
      where: {
        tenantId: session.user.tenantId,
        date: {
          gte: startDate,
        },
      },
      _count: true,
    })

    return records
  } catch (error) {
    console.error("Get attendance trend error:", error)
    return []
  }
}

export async function getEnrollmentStats() {
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
        name: true,
        _count: {
          select: {
            ClassEnrollment: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
      },
    })

    return classes.map(cls => ({
      name: cls.name,
      students: (cls._count as any).ClassEnrollment,
    }))
  } catch (error) {
    console.error("Get enrollment stats error:", error)
    return []
  }
}

export async function getRevenueStats() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return []
    }

    const payments = await prisma.payment.groupBy({
      by: ["paidAt"],
      where: {
        Invoice: {
          tenantId: session.user.tenantId,
        },
        status: "COMPLETED",
        paidAt: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        paidAt: "asc",
      },
    })

    return payments.map(p => ({
      date: p.paidAt,
      amount: p._sum?.amount || 0,
    }))
  } catch (error) {
    console.error("Get revenue stats error:", error)
    return []
  }
}

"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getBusAttendance(routeId: string, date?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const targetDate = date ? new Date(date) : new Date()
  targetDate.setHours(0, 0, 0, 0)

  return prisma.busAttendance.findMany({
    where: { tenantId: session.user.tenantId, routeId, date: targetDate },
    orderBy: { createdAt: "desc" },
  })
}

export async function markBusAttendance(data: {
  routeId: string
  studentId: string
  date: string
  direction: string
  status: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) throw new Error("Forbidden")

  const dateObj = new Date(data.date)
  dateObj.setHours(0, 0, 0, 0)

  const record = await prisma.busAttendance.upsert({
    where: {
      routeId_studentId_date_direction: {
        routeId: data.routeId,
        studentId: data.studentId,
        date: dateObj,
        direction: data.direction as any,
      },
    },
    update: {
      status: data.status as any,
      boardedAt: data.status === "BOARDED" ? new Date() : null,
    },
    create: {
      tenantId: session.user.tenantId,
      routeId: data.routeId,
      studentId: data.studentId,
      date: dateObj,
      direction: data.direction as any,
      status: data.status as any,
      boardedAt: data.status === "BOARDED" ? new Date() : null,
    },
  })

  revalidatePath("/dashboard/transport")
  return record
}

export async function getBusAttendanceStats(routeId: string, date?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const targetDate = date ? new Date(date) : new Date()
  targetDate.setHours(0, 0, 0, 0)

  const records = await prisma.busAttendance.findMany({
    where: { tenantId: session.user.tenantId, routeId, date: targetDate },
  })

  const boarded = records.filter((r: any) => r.status === "BOARDED").length
  const noShow = records.filter((r: any) => r.status === "NO_SHOW").length
  const expected = records.filter((r: any) => r.status === "EXPECTED").length

  return { boarded, noShow, expected, total: records.length }
}

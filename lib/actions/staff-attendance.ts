"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getStaffAttendance(date?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const targetDate = date ? new Date(date) : new Date()
  targetDate.setHours(0, 0, 0, 0)

  return prisma.staffAttendance.findMany({
    where: { tenantId: session.user.tenantId, date: targetDate },
    orderBy: { createdAt: "desc" },
  })
}

export async function markStaffAttendance(data: {
  userId: string
  date: string
  status: string
  checkIn?: string
  checkOut?: string
  notes?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(session.user.role)) throw new Error("Forbidden")

  const dateObj = new Date(data.date)
  dateObj.setHours(0, 0, 0, 0)

  const record = await prisma.staffAttendance.upsert({
    where: { userId_date: { userId: data.userId, date: dateObj } },
    update: {
      status: data.status as any,
      checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
      checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
      notes: data.notes,
    },
    create: {
      tenantId: session.user.tenantId,
      userId: data.userId,
      date: dateObj,
      status: data.status as any,
      checkIn: data.checkIn ? new Date(data.checkIn) : null,
      checkOut: data.checkOut ? new Date(data.checkOut) : null,
      notes: data.notes,
    },
  })

  revalidatePath("/dashboard/staff-attendance")
  return record
}

export async function bulkMarkStaffAttendance(records: Array<{
  userId: string
  date: string
  status: string
}>) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(session.user.role)) throw new Error("Forbidden")

  const results = []
  for (const record of records) {
    const dateObj = new Date(record.date)
    dateObj.setHours(0, 0, 0, 0)

    const r = await prisma.staffAttendance.upsert({
      where: { userId_date: { userId: record.userId, date: dateObj } },
      update: { status: record.status as any },
      create: {
        tenantId: session.user.tenantId,
        userId: record.userId,
        date: dateObj,
        status: record.status as any,
      },
    })
    results.push(r)
  }

  revalidatePath("/dashboard/staff-attendance")
  return results
}

export async function getStaffAttendanceStats(month?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const now = month ? new Date(month + "-01") : new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const records = await prisma.staffAttendance.findMany({
    where: {
      tenantId: session.user.tenantId,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
  })

  const present = records.filter((r: any) => r.status === "PRESENT").length
  const absent = records.filter((r: any) => r.status === "ABSENT").length
  const late = records.filter((r: any) => r.status === "LATE").length
  const onLeave = records.filter((r: any) => r.status === "ON_LEAVE").length

  return { present, absent, late, onLeave, total: records.length }
}

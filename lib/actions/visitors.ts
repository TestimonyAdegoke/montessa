"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getVisitors(filter?: { status?: string; date?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const where: any = { tenantId: session.user.tenantId }
  if (filter?.status && filter.status !== "all") where.status = filter.status
  if (filter?.date) {
    const d = new Date(filter.date)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    where.checkInTime = { gte: d, lt: next }
  }

  return prisma.visitor.findMany({
    where,
    orderBy: { checkInTime: "desc" },
    take: 100,
  })
}

export async function checkInVisitor(data: {
  fullName: string
  phone?: string
  email?: string
  idType?: string
  idNumber?: string
  company?: string
  purpose: string
  hostName: string
  hostDepartment?: string
  badgeNumber?: string
  notes?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const visitor = await prisma.visitor.create({
    data: {
      tenantId: session.user.tenantId,
      ...data,
      status: "CHECKED_IN",
    },
  })

  revalidatePath("/dashboard/visitors")
  return visitor
}

export async function checkOutVisitor(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const visitor = await prisma.visitor.update({
    where: { id },
    data: {
      status: "CHECKED_OUT",
      checkOutTime: new Date(),
    },
  })

  revalidatePath("/dashboard/visitors")
  return visitor
}

export async function denyVisitor(id: string, notes?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const visitor = await prisma.visitor.update({
    where: { id },
    data: { status: "DENIED", notes },
  })

  revalidatePath("/dashboard/visitors")
  return visitor
}

export async function getVisitorStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [todayTotal, currentlyIn, todayCheckedOut] = await Promise.all([
    prisma.visitor.count({
      where: { tenantId: session.user.tenantId, checkInTime: { gte: today, lt: tomorrow } },
    }),
    prisma.visitor.count({
      where: { tenantId: session.user.tenantId, status: "CHECKED_IN" },
    }),
    prisma.visitor.count({
      where: { tenantId: session.user.tenantId, status: "CHECKED_OUT", checkOutTime: { gte: today, lt: tomorrow } },
    }),
  ])

  return { todayTotal, currentlyIn, todayCheckedOut }
}

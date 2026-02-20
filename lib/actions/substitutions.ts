"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSubstitutions(date?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const where: any = { tenantId: session.user.tenantId }
  if (date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    where.date = d
  }

  return prisma.substitution.findMany({
    where,
    orderBy: { date: "desc" },
  })
}

export async function createSubstitution(data: {
  scheduleId?: string
  date: string
  originalTeacherId: string
  substituteTeacherId: string
  classId: string
  subject: string
  startTime: string
  endTime: string
  reason?: string
  notes?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HOD"].includes(session.user.role)) throw new Error("Forbidden")

  const dateObj = new Date(data.date)
  dateObj.setHours(0, 0, 0, 0)

  const sub = await prisma.substitution.create({
    data: {
      tenantId: session.user.tenantId,
      scheduleId: data.scheduleId,
      date: dateObj,
      originalTeacherId: data.originalTeacherId,
      substituteTeacherId: data.substituteTeacherId,
      classId: data.classId,
      subject: data.subject,
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason,
      notes: data.notes,
    },
  })

  revalidatePath("/dashboard/substitutions")
  return sub
}

export async function approveSubstitution(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const sub = await prisma.substitution.update({
    where: { id },
    data: { status: "APPROVED", approvedBy: session.user.id },
  })

  revalidatePath("/dashboard/substitutions")
  return sub
}

export async function deleteSubstitution(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.substitution.delete({ where: { id } })
  revalidatePath("/dashboard/substitutions")
}

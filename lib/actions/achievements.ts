"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAchievements(studentId?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const where: any = { tenantId: session.user.tenantId }
  if (studentId) where.studentId = studentId

  return prisma.achievement.findMany({
    where,
    orderBy: { awardedAt: "desc" },
  })
}

export async function createAchievement(data: {
  studentId: string
  title: string
  description?: string
  category: string
  badgeIcon?: string
  badgeColor?: string
  points?: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) throw new Error("Forbidden")

  const achievement = await prisma.achievement.create({
    data: {
      tenantId: session.user.tenantId,
      studentId: data.studentId,
      title: data.title,
      description: data.description,
      category: data.category as any,
      badgeIcon: data.badgeIcon,
      badgeColor: data.badgeColor,
      points: data.points || 0,
      awardedBy: session.user.id,
    },
  })

  revalidatePath("/dashboard/achievements")
  return achievement
}

export async function deleteAchievement(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  await prisma.achievement.delete({ where: { id } })
  revalidatePath("/dashboard/achievements")
}

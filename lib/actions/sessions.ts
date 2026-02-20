"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getUserSessions() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.userSession.findMany({
    where: { userId: session.user.id },
    orderBy: { lastActive: "desc" },
  })
}

export async function revokeSession(sessionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.userSession.delete({
    where: { id: sessionId },
  })

  revalidatePath("/dashboard/settings")
}

export async function revokeAllOtherSessions() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.userSession.deleteMany({
    where: {
      userId: session.user.id,
      isCurrentSession: false,
    },
  })

  revalidatePath("/dashboard/settings")
}

export async function recordSession(data: {
  userId: string
  deviceName?: string
  deviceType?: string
  browser?: string
  os?: string
  ipAddress?: string
}) {
  const session = await prisma.userSession.create({
    data: {
      ...data,
      isCurrentSession: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  return session
}

"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getNotifications(page = 1, limit = 20) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const skip = (page - 1) * limit

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: session.user.id, tenantId: session.user.tenantId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({
      where: { recipientId: session.user.id, tenantId: session.user.tenantId },
    }),
    prisma.notification.count({
      where: { recipientId: session.user.id, tenantId: session.user.tenantId, isRead: false },
    }),
  ])

  return { notifications, total, unreadCount, pages: Math.ceil(total / limit) }
}

export async function getUnreadCount() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return 0

  const count = await prisma.notification.count({
    where: { recipientId: session.user.id, tenantId: session.user.tenantId, isRead: false },
  })

  return count
}

export async function markAsRead(notificationId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  })

  revalidatePath("/dashboard/notifications")
}

export async function markAllAsRead() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.notification.updateMany({
    where: { recipientId: session.user.id, tenantId: session.user.tenantId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  })

  revalidatePath("/dashboard/notifications")
}

export async function deleteNotification(notificationId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.notification.delete({ where: { id: notificationId } })
  revalidatePath("/dashboard/notifications")
}

export async function sendNotification(data: {
  recipientId: string
  title: string
  body: string
  type?: string
  category?: string
  actionUrl?: string
  channels?: string[]
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const notification = await prisma.notification.create({
    data: {
      tenantId: session.user.tenantId,
      recipientId: data.recipientId,
      title: data.title,
      body: data.body,
      type: (data.type as any) || "INFO",
      category: (data.category as any) || "SYSTEM",
      channels: (data.channels as any[]) || ["IN_APP"],
      actionUrl: data.actionUrl,
    },
  })

  return notification
}

export async function sendBulkNotifications(data: {
  recipientIds: string[]
  title: string
  body: string
  type?: string
  category?: string
  actionUrl?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
    throw new Error("Forbidden")
  }

  const result = await prisma.notification.createMany({
    data: data.recipientIds.map((recipientId) => ({
      tenantId: session.user.tenantId,
      recipientId,
      title: data.title,
      body: data.body,
      type: (data.type as any) || "INFO",
      category: (data.category as any) || "SYSTEM",
      channels: ["IN_APP"] as any[],
      actionUrl: data.actionUrl,
    })),
  })

  return { count: result.count }
}

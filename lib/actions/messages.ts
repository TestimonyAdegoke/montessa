"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function sendMessage(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    const recipientId = formData.get("recipientId") as string
    const content = formData.get("content") as string
    const subject = formData.get("subject") as string

    const message = await prisma.message.create({
      data: {
        tenantId: session.user.tenantId,
        senderId: session.user.id,
        recipientId,
        subject,
        content,
        isRead: false,
      },
    })

    revalidatePath("/dashboard/messages")
    return { success: true, data: message }
  } catch (error: any) {
    console.error("Send message error:", error)
    return { success: false, error: error.message || "Failed to send message" }
  }
}

export async function getMessages(type: "inbox" | "sent" = "inbox") {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return []
    }

    const messages = await prisma.message.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(type === "inbox" ? { recipientId: session.user.id } : { senderId: session.user.id }),
      },
      include: {
        User_Message_senderIdToUser: { select: { name: true, role: true } },
        User_Message_recipientIdToUser: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return messages
  } catch (error) {
    console.error("Get messages error:", error)
    return []
  }
}

export async function markAsRead(messageId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    })

    revalidatePath("/dashboard/messages")
    return { success: true }
  } catch (error: any) {
    console.error("Mark as read error:", error)
    return { success: false, error: error.message || "Failed to mark as read" }
  }
}

export async function createAnnouncement(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const targetAudience = formData.get("targetAudience") as string
    const classIds = formData.get("classIds") ? JSON.parse(formData.get("classIds") as string) : []

    const announcement = await prisma.announcement.create({
      data: {
        tenantId: session.user.tenantId,
        title,
        content,
        authorId: session.user.id,
        audience: targetAudience as any,
        targetGroups: classIds,
        attachments: [],
      },
    })

    revalidatePath("/dashboard/announcements")
    return { success: true, data: announcement }
  } catch (error: any) {
    console.error("Create announcement error:", error)
    return { success: false, error: error.message || "Failed to create announcement" }
  }
}

export async function getAnnouncements() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return []
    }

    const announcements = await prisma.announcement.findMany({
      where: { tenantId: session.user.tenantId },
      include: {
        User: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return announcements
  } catch (error) {
    console.error("Get announcements error:", error)
    return []
  }
}

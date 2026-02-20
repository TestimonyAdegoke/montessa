"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAnnouncements() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  const announcements = await prisma.announcement.findMany({
    where: {
      tenantId: session.user.tenantId,
      OR: [
        { audience: "ALL" },
        {
          audience: "TEACHERS",
          ...(session.user.role === "TEACHER" || session.user.role === "TENANT_ADMIN" || session.user.role === "SUPER_ADMIN"
            ? {}
            : { id: "none" }),
        },
        {
          audience: "GUARDIANS",
          ...(session.user.role === "GUARDIAN" ? {} : { id: "none" }),
        },
        {
          audience: "STUDENTS",
          ...(session.user.role === "STUDENT" ? {} : { id: "none" }),
        },
      ],
    },
    include: {
      User: { select: { name: true, image: true } },
    },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  })

  return announcements
}

export async function createAnnouncement(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const audience = formData.get("audience") as string
  const priority = formData.get("priority") as string
  const isPinned = formData.get("isPinned") === "true"
  const publishNow = formData.get("publishNow") !== "false"

  if (!title || !content || !audience) {
    return { success: false, error: "Title, content, and audience are required" }
  }

  try {
    const announcement = await prisma.announcement.create({
      data: {
        tenantId: session.user.tenantId,
        authorId: session.user.id,
        title,
        content,
        audience: audience as any,
        priority: (priority as any) || "NORMAL",
        isPinned,
        publishedAt: publishNow ? new Date() : null,
        targetGroups: [],
        attachments: [],
      },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "CREATE",
        entity: "Announcement",
        entityId: announcement.id,
        newValues: { title, audience, priority } as any,
      },
    })

    revalidatePath("/dashboard/announcements")
    return { success: true, data: announcement }
  } catch (error) {
    console.error("Create announcement error:", error)
    return { success: false, error: "Failed to create announcement" }
  }
}

export async function deleteAnnouncement(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.announcement.delete({
      where: { id },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "DELETE",
        entity: "Announcement",
        entityId: id,
      },
    })

    revalidatePath("/dashboard/announcements")
    return { success: true }
  } catch (error) {
    console.error("Delete announcement error:", error)
    return { success: false, error: "Failed to delete announcement" }
  }
}

export async function togglePinAnnouncement(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const existing = await prisma.announcement.findUnique({ where: { id } })
    if (!existing) return { success: false, error: "Not found" }

    await prisma.announcement.update({
      where: { id },
      data: { isPinned: !existing.isPinned },
    })

    revalidatePath("/dashboard/announcements")
    return { success: true }
  } catch (error) {
    console.error("Toggle pin error:", error)
    return { success: false, error: "Failed to update announcement" }
  }
}

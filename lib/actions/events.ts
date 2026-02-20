"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createEvent(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const event = await prisma.event.create({
      data: {
        tenantId: session.user.tenantId,
        createdBy: session.user.id,
        title: formData.get("title") as string,
        description: formData.get("description") as string || null,
        startDate: new Date(formData.get("startDate") as string),
        endDate: new Date(formData.get("endDate") as string),
        allDay: formData.get("allDay") === "true",
        location: formData.get("location") as string || null,
        isVirtual: formData.get("isVirtual") === "true",
        meetingLink: formData.get("meetingLink") as string || null,
        type: formData.get("type") as any,
        audience: (formData.get("audience") as any) || "ALL",
        color: formData.get("color") as string || null,
        status: "SCHEDULED",
      },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "CREATE",
        entity: "Event",
        entityId: event.id,
        newValues: event as any,
      },
    })

    revalidatePath("/dashboard/events")
    return { success: true, data: event }
  } catch (error: any) {
    console.error("Create event error:", error)
    return { success: false, error: error.message || "Failed to create event" }
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: formData.get("title") as string,
        description: formData.get("description") as string || null,
        startDate: new Date(formData.get("startDate") as string),
        endDate: new Date(formData.get("endDate") as string),
        allDay: formData.get("allDay") === "true",
        location: formData.get("location") as string || null,
        type: formData.get("type") as any,
        status: (formData.get("status") as any) || undefined,
        color: formData.get("color") as string || null,
      },
    })

    revalidatePath("/dashboard/events")
    return { success: true, data: event }
  } catch (error: any) {
    console.error("Update event error:", error)
    return { success: false, error: error.message || "Failed to update event" }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.event.delete({ where: { id: eventId } })

    revalidatePath("/dashboard/events")
    return { success: true }
  } catch (error: any) {
    console.error("Delete event error:", error)
    return { success: false, error: error.message || "Failed to delete event" }
  }
}

export async function getEvents(month?: number, year?: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []

    const now = new Date()
    const targetYear = year || now.getFullYear()
    const targetMonth = month !== undefined ? month : now.getMonth()

    const startOfMonth = new Date(targetYear, targetMonth, 1)
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59)

    const events = await prisma.event.findMany({
      where: {
        tenantId: session.user.tenantId,
        OR: [
          { startDate: { gte: startOfMonth, lte: endOfMonth } },
          { endDate: { gte: startOfMonth, lte: endOfMonth } },
          { AND: [{ startDate: { lte: startOfMonth } }, { endDate: { gte: endOfMonth } }] },
        ],
      },
      orderBy: { startDate: "asc" },
    })

    return events
  } catch (error) {
    console.error("Get events error:", error)
    return []
  }
}

export async function getUpcomingEvents(limit: number = 10) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []

    const events = await prisma.event.findMany({
      where: {
        tenantId: session.user.tenantId,
        startDate: { gte: new Date() },
        status: { in: ["SCHEDULED", "ONGOING"] },
      },
      orderBy: { startDate: "asc" },
      take: limit,
    })

    return events
  } catch (error) {
    console.error("Get upcoming events error:", error)
    return []
  }
}

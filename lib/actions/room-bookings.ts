"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getRooms() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []

    const rooms = await prisma.room.findMany({
      include: {
        _count: { select: { RoomBooking: true, Schedule: true } },
      },
      orderBy: { name: "asc" },
    })

    return rooms
  } catch (error) {
    console.error("Get rooms error:", error)
    return []
  }
}

export async function createRoom(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const facilities = formData.get("facilities") ? JSON.parse(formData.get("facilities") as string) : []

    const room = await prisma.room.create({
      data: {
        name: formData.get("name") as string,
        building: formData.get("building") as string || null,
        floor: formData.get("floor") ? parseInt(formData.get("floor") as string) : null,
        capacity: parseInt(formData.get("capacity") as string) || 30,
        type: formData.get("type") as any,
        facilities,
      },
    })

    revalidatePath("/dashboard/rooms")
    return { success: true, data: room }
  } catch (error: any) {
    console.error("Create room error:", error)
    return { success: false, error: error.message || "Failed to create room" }
  }
}

export async function createBooking(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const roomId = formData.get("roomId") as string
    const startTime = new Date(formData.get("startTime") as string)
    const endTime = new Date(formData.get("endTime") as string)

    // Check for conflicts
    const conflict = await prisma.roomBooking.findFirst({
      where: {
        roomId,
        status: { in: ["PENDING", "APPROVED"] },
        OR: [
          { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
          { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
          { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
        ],
      },
    })

    if (conflict) {
      return { success: false, error: "Room is already booked for this time slot" }
    }

    const booking = await prisma.roomBooking.create({
      data: {
        roomId,
        title: formData.get("title") as string,
        description: formData.get("description") as string || null,
        bookedBy: session.user.id,
        bookedFor: formData.get("bookedFor") as string || null,
        startTime,
        endTime,
        status: "PENDING",
      },
    })

    revalidatePath("/dashboard/rooms")
    return { success: true, data: booking }
  } catch (error: any) {
    console.error("Create booking error:", error)
    return { success: false, error: error.message || "Failed to create booking" }
  }
}

export async function updateBookingStatus(bookingId: string, status: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const booking = await prisma.roomBooking.update({
      where: { id: bookingId },
      data: { status: status as any },
    })

    revalidatePath("/dashboard/rooms")
    return { success: true, data: booking }
  } catch (error: any) {
    console.error("Update booking status error:", error)
    return { success: false, error: error.message || "Failed to update booking" }
  }
}

export async function getBookings(roomId?: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []

    const bookings = await prisma.roomBooking.findMany({
      where: {
        ...(roomId && { roomId }),
        startTime: { gte: new Date() },
      },
      include: {
        Room: { select: { name: true, building: true } },
      },
      orderBy: { startTime: "asc" },
    })

    return bookings
  } catch (error) {
    console.error("Get bookings error:", error)
    return []
  }
}

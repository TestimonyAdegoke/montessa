"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTransportRoutes() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.transportRoute.findMany({
    where: { tenantId: session.user.tenantId },
    include: { TransportStop: { orderBy: { sortOrder: "asc" } } },
    orderBy: { name: "asc" },
  })
}

export async function createTransportRoute(data: {
  name: string
  code: string
  description?: string
  driverName?: string
  driverPhone?: string
  vehicleNumber?: string
  capacity?: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const route = await prisma.transportRoute.create({
    data: {
      tenantId: session.user.tenantId,
      name: data.name,
      code: data.code,
      description: data.description,
      driverName: data.driverName,
      driverPhone: data.driverPhone,
      vehicleNumber: data.vehicleNumber,
      capacity: data.capacity,
    },
  })

  revalidatePath("/dashboard/transport")
  return route
}

export async function addTransportStop(data: {
  routeId: string
  name: string
  address?: string
  pickupTime?: string
  dropoffTime?: string
  sortOrder?: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const stop = await prisma.transportStop.create({
    data: {
      routeId: data.routeId,
      name: data.name,
      address: data.address,
      pickupTime: data.pickupTime,
      dropoffTime: data.dropoffTime,
      sortOrder: data.sortOrder || 0,
    },
  })

  revalidatePath("/dashboard/transport")
  return stop
}

export async function deleteTransportRoute(routeId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  await prisma.transportRoute.delete({ where: { id: routeId } })
  revalidatePath("/dashboard/transport")
}

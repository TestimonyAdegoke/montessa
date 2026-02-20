"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getHealthIncidents(filter?: { studentId?: string; type?: string; severity?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const where: any = { tenantId: session.user.tenantId }
  if (filter?.studentId) where.studentId = filter.studentId
  if (filter?.type && filter.type !== "all") where.type = filter.type
  if (filter?.severity && filter.severity !== "all") where.severity = filter.severity

  return prisma.healthIncident.findMany({
    where,
    orderBy: { incidentTime: "desc" },
    take: 100,
  })
}

export async function createHealthIncident(data: {
  studentId: string
  type: string
  description: string
  severity?: string
  treatment?: string
  medication?: string
  notes?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const incident = await prisma.healthIncident.create({
    data: {
      tenantId: session.user.tenantId,
      reportedBy: session.user.id,
      studentId: data.studentId,
      type: data.type as any,
      description: data.description,
      severity: data.severity || "MINOR",
      treatment: data.treatment,
      medication: data.medication,
      notes: data.notes,
    },
  })

  revalidatePath("/dashboard/health")
  return incident
}

export async function resolveIncident(id: string, data: { treatment?: string; medication?: string; notes?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const incident = await prisma.healthIncident.update({
    where: { id },
    data: {
      resolvedAt: new Date(),
      treatedBy: session.user.id,
      treatment: data.treatment,
      medication: data.medication,
      notes: data.notes,
    },
  })

  revalidatePath("/dashboard/health")
  return incident
}

export async function notifyParent(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const incident = await prisma.healthIncident.update({
    where: { id },
    data: {
      parentNotified: true,
      parentNotifiedAt: new Date(),
    },
  })

  revalidatePath("/dashboard/health")
  return incident
}

export async function markParentPickup(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const incident = await prisma.healthIncident.update({
    where: { id },
    data: { parentPickedUp: true },
  })

  revalidatePath("/dashboard/health")
  return incident
}

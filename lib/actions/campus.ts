"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCampuses() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.campus.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { name: "asc" },
  })
}

export async function getCampus(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.campus.findFirst({
    where: { id, tenantId: session.user.tenantId },
  })
}

export async function createCampus(data: {
  name: string
  code: string
  address?: string
  city?: string
  state?: string
  country?: string
  phone?: string
  email?: string
  logo?: string
  primaryColor?: string
  tagline?: string
  headUserId?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const campus = await prisma.campus.create({
    data: {
      tenantId: session.user.tenantId,
      ...data,
    },
  })

  revalidatePath("/dashboard/campuses")
  return campus
}

export async function updateCampus(id: string, data: {
  name?: string
  code?: string
  address?: string
  city?: string
  state?: string
  country?: string
  phone?: string
  email?: string
  logo?: string
  primaryColor?: string
  tagline?: string
  headUserId?: string
  isActive?: boolean
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const campus = await prisma.campus.update({
    where: { id },
    data,
  })

  revalidatePath("/dashboard/campuses")
  return campus
}

export async function deleteCampus(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  await prisma.campus.delete({ where: { id } })
  revalidatePath("/dashboard/campuses")
}

"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAlumni() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.alumni.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { graduationYear: "desc" },
  })
}

export async function createAlumni(data: {
  fullName: string
  graduationYear: string
  graduationClass?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  currentOccupation?: string
  employer?: string
  linkedinUrl?: string
  higherEducation?: string
  degree?: string
  studentId?: string
  notes?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(session.user.role)) throw new Error("Forbidden")

  const alumni = await prisma.alumni.create({
    data: {
      tenantId: session.user.tenantId,
      ...data,
    },
  })

  revalidatePath("/dashboard/alumni")
  return alumni
}

export async function updateAlumni(id: string, data: {
  email?: string
  phone?: string
  currentOccupation?: string
  employer?: string
  linkedinUrl?: string
  higherEducation?: string
  degree?: string
  notes?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const alumni = await prisma.alumni.update({
    where: { id },
    data,
  })

  revalidatePath("/dashboard/alumni")
  return alumni
}

export async function deleteAlumni(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  await prisma.alumni.delete({ where: { id } })
  revalidatePath("/dashboard/alumni")
}

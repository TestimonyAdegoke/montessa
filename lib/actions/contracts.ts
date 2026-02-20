"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getContracts() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.enrollmentContract.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: "desc" },
  })
}

export async function createContract(data: {
  applicationId?: string
  studentId?: string
  title: string
  content: string
  guardianName: string
  guardianEmail: string
  expiresAt?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const contract = await prisma.enrollmentContract.create({
    data: {
      tenantId: session.user.tenantId,
      applicationId: data.applicationId,
      studentId: data.studentId,
      title: data.title,
      content: data.content,
      guardianName: data.guardianName,
      guardianEmail: data.guardianEmail,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  })

  revalidatePath("/dashboard/contracts")
  return contract
}

export async function signContract(id: string, signature: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const contract = await prisma.enrollmentContract.update({
    where: { id },
    data: {
      status: "SIGNED",
      signedAt: new Date(),
      signature,
      ipAddress: "client",
    },
  })

  revalidatePath("/dashboard/contracts")
  return contract
}

export async function voidContract(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const contract = await prisma.enrollmentContract.update({
    where: { id },
    data: { status: "VOIDED" },
  })

  revalidatePath("/dashboard/contracts")
  return contract
}

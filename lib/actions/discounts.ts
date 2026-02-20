"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getDiscounts() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.discount.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: "desc" },
  })
}

export async function createDiscount(data: {
  name: string
  description?: string
  type: string
  value: number
  isPercentage?: boolean
  applicableTo?: string
  maxUses?: number
  startDate?: string
  endDate?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"].includes(session.user.role)) throw new Error("Forbidden")

  const discount = await prisma.discount.create({
    data: {
      tenantId: session.user.tenantId,
      name: data.name,
      description: data.description,
      type: data.type as any,
      value: data.value,
      isPercentage: data.isPercentage ?? true,
      applicableTo: data.applicableTo,
      maxUses: data.maxUses,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  })

  revalidatePath("/dashboard/discounts")
  return discount
}

export async function updateDiscount(id: string, data: {
  name?: string
  description?: string
  value?: number
  isPercentage?: boolean
  applicableTo?: string
  maxUses?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"].includes(session.user.role)) throw new Error("Forbidden")

  const discount = await prisma.discount.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  })

  revalidatePath("/dashboard/discounts")
  return discount
}

export async function deleteDiscount(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"].includes(session.user.role)) throw new Error("Forbidden")

  await prisma.discount.delete({ where: { id } })
  revalidatePath("/dashboard/discounts")
}

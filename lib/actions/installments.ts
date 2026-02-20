"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getInstallmentPlans() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.installmentPlan.findMany({
    where: { tenantId: session.user.tenantId },
    include: { InstallmentPayment: { orderBy: { installmentNumber: "asc" } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function createInstallmentPlan(data: {
  invoiceId: string
  studentId: string
  totalAmount: number
  numberOfInstallments: number
  frequency: string
  startDate: string
  notes?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"].includes(session.user.role)) throw new Error("Forbidden")

  const plan = await prisma.installmentPlan.create({
    data: {
      tenantId: session.user.tenantId,
      invoiceId: data.invoiceId,
      studentId: data.studentId,
      totalAmount: data.totalAmount,
      numberOfInstallments: data.numberOfInstallments,
      frequency: data.frequency as any,
      startDate: new Date(data.startDate),
      notes: data.notes,
      createdBy: session.user.id,
    },
  })

  // Generate installment payments
  const amountPerInstallment = Math.round((data.totalAmount / data.numberOfInstallments) * 100) / 100
  const start = new Date(data.startDate)

  for (let i = 0; i < data.numberOfInstallments; i++) {
    const dueDate = new Date(start)
    switch (data.frequency) {
      case "WEEKLY": dueDate.setDate(dueDate.getDate() + (7 * i)); break
      case "BIWEEKLY": dueDate.setDate(dueDate.getDate() + (14 * i)); break
      case "MONTHLY": dueDate.setMonth(dueDate.getMonth() + i); break
      case "QUARTERLY": dueDate.setMonth(dueDate.getMonth() + (3 * i)); break
      case "TERMLY": dueDate.setMonth(dueDate.getMonth() + (4 * i)); break
    }

    const isLast = i === data.numberOfInstallments - 1
    const amount = isLast
      ? Math.round((data.totalAmount - amountPerInstallment * (data.numberOfInstallments - 1)) * 100) / 100
      : amountPerInstallment

    await prisma.installmentPayment.create({
      data: {
        planId: plan.id,
        installmentNumber: i + 1,
        amount,
        dueDate,
      },
    })
  }

  revalidatePath("/dashboard/installments")
  return plan
}

export async function markInstallmentPaid(installmentId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"].includes(session.user.role)) throw new Error("Forbidden")

  const payment = await prisma.installmentPayment.update({
    where: { id: installmentId },
    data: { status: "PAID", paidDate: new Date() },
    include: { InstallmentPlan: { include: { InstallmentPayment: true } } },
  })

  // Check if all installments are paid
  const allPaid = (payment as any).InstallmentPlan.InstallmentPayment.every(
    (inst: any) => inst.id === installmentId ? true : inst.status === "PAID"
  )
  if (allPaid) {
    await prisma.installmentPlan.update({
      where: { id: (payment as any).InstallmentPlan.id },
      data: { status: "COMPLETED" },
    })
  }

  revalidatePath("/dashboard/installments")
  return payment
}

export async function cancelInstallmentPlan(planId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"].includes(session.user.role)) throw new Error("Forbidden")

  const plan = await prisma.installmentPlan.update({
    where: { id: planId },
    data: { status: "CANCELLED" },
  })

  revalidatePath("/dashboard/installments")
  return plan
}

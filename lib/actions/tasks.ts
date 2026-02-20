"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTasks(filter?: { status?: string; assignedTo?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const where: any = { tenantId: session.user.tenantId }
  if (filter?.status) where.status = filter.status
  if (filter?.assignedTo) where.assignedTo = filter.assignedTo

  return prisma.task.findMany({
    where,
    orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
  })
}

export async function getMyTasks() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.task.findMany({
    where: { tenantId: session.user.tenantId, assignedTo: session.user.id },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  })
}

export async function createTask(data: {
  title: string
  description?: string
  assignedTo: string
  category?: string
  priority?: string
  dueDate?: string
  tags?: string[]
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const task = await prisma.task.create({
    data: {
      tenantId: session.user.tenantId,
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      assignedBy: session.user.id,
      category: (data.category as any) || "GENERAL",
      priority: (data.priority as any) || "MEDIUM",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      tags: data.tags || [],
    },
  })

  revalidatePath("/dashboard/tasks")
  return task
}

export async function updateTaskStatus(id: string, status: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const task = await prisma.task.update({
    where: { id },
    data: {
      status: status as any,
      completedAt: status === "DONE" ? new Date() : null,
    },
  })

  revalidatePath("/dashboard/tasks")
  return task
}

export async function deleteTask(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.task.delete({ where: { id } })
  revalidatePath("/dashboard/tasks")
}

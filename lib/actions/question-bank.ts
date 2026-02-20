"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getQuestionBankItems(filters?: {
  subject?: string
  grade?: string
  difficulty?: string
  questionType?: string
  topic?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const where: any = { tenantId: session.user.tenantId }
  if (filters?.subject) where.subject = filters.subject
  if (filters?.grade) where.grade = filters.grade
  if (filters?.difficulty) where.difficulty = filters.difficulty
  if (filters?.questionType) where.questionType = filters.questionType
  if (filters?.topic) where.topic = { contains: filters.topic, mode: "insensitive" }

  const items = await prisma.questionBankItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return items
}

export async function createQuestionBankItem(data: {
  subject: string
  grade?: string
  topic?: string
  difficulty?: string
  questionType: string
  questionText: string
  options?: any[]
  correctAnswer?: string
  explanation?: string
  marks?: number
  tags?: string[]
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
    throw new Error("Forbidden")
  }

  const item = await prisma.questionBankItem.create({
    data: {
      tenantId: session.user.tenantId,
      createdBy: session.user.id,
      subject: data.subject,
      grade: data.grade,
      topic: data.topic,
      difficulty: (data.difficulty as any) || "MEDIUM",
      questionType: data.questionType as any,
      questionText: data.questionText,
      options: data.options as any,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      marks: data.marks || 1,
      tags: data.tags || [],
    },
  })

  revalidatePath("/dashboard/question-bank")
  return item
}

export async function updateQuestionBankItem(id: string, data: Record<string, any>) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const item = await prisma.questionBankItem.update({
    where: { id },
    data,
  })

  revalidatePath("/dashboard/question-bank")
  return item
}

export async function deleteQuestionBankItem(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.questionBankItem.delete({ where: { id } })
  revalidatePath("/dashboard/question-bank")
}

export async function getQuestionBankStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const where = { tenantId: session.user.tenantId }

  const [total, bySubject, byDifficulty] = await Promise.all([
    prisma.questionBankItem.count({ where }),
    prisma.questionBankItem.groupBy({
      by: ["subject"],
      where,
      _count: true,
    }),
    prisma.questionBankItem.groupBy({
      by: ["difficulty"],
      where,
      _count: true,
    }),
  ])

  return { total, bySubject, byDifficulty }
}

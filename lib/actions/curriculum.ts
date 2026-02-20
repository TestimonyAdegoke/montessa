"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCurriculumMaps(filters?: { subject?: string; grade?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const where: any = { tenantId: session.user.tenantId }
  if (filters?.subject) where.subject = filters.subject
  if (filters?.grade) where.grade = filters.grade

  const maps = await prisma.curriculumMap.findMany({
    where,
    include: {
      CurriculumUnit: {
        orderBy: { orderIndex: "asc" },
        include: {
          CurriculumTopic: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return maps
}

export async function getCurriculumMap(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const map = await prisma.curriculumMap.findUnique({
    where: { id },
    include: {
      CurriculumUnit: {
        orderBy: { orderIndex: "asc" },
        include: {
          CurriculumTopic: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  })

  return map
}

export async function createCurriculumMap(data: {
  title: string
  subject: string
  grade: string
  academicYear: string
  description?: string
  board?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
    throw new Error("Forbidden")
  }

  const map = await prisma.curriculumMap.create({
    data: {
      tenantId: session.user.tenantId,
      createdBy: session.user.id,
      title: data.title,
      subject: data.subject,
      grade: data.grade,
      academicYear: data.academicYear,
      description: data.description,
      board: data.board,
    },
  })

  revalidatePath("/dashboard/curriculum")
  return map
}

export async function addCurriculumUnit(curriculumId: string, data: {
  title: string
  description?: string
  estimatedWeeks?: number
  learningOutcomes?: string[]
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const maxOrder = await prisma.curriculumUnit.findFirst({
    where: { curriculumId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  })

  const unit = await prisma.curriculumUnit.create({
    data: {
      curriculumId,
      title: data.title,
      description: data.description,
      orderIndex: (maxOrder?.orderIndex ?? -1) + 1,
      estimatedWeeks: data.estimatedWeeks,
      learningOutcomes: data.learningOutcomes || [],
    },
  })

  revalidatePath("/dashboard/curriculum")
  return unit
}

export async function addCurriculumTopic(unitId: string, data: {
  title: string
  description?: string
  content?: string
  resources?: string[]
  activities?: string[]
  assessmentCriteria?: string[]
  estimatedHours?: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const maxOrder = await prisma.curriculumTopic.findFirst({
    where: { unitId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  })

  const topic = await prisma.curriculumTopic.create({
    data: {
      unitId,
      title: data.title,
      description: data.description,
      orderIndex: (maxOrder?.orderIndex ?? -1) + 1,
      content: data.content,
      resources: data.resources || [],
      activities: data.activities || [],
      assessmentCriteria: data.assessmentCriteria || [],
      estimatedHours: data.estimatedHours,
    },
  })

  revalidatePath("/dashboard/curriculum")
  return topic
}

export async function updateTopicStatus(topicId: string, status: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const topic = await prisma.curriculumTopic.update({
    where: { id: topicId },
    data: {
      status: status as any,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  })

  revalidatePath("/dashboard/curriculum")
  return topic
}

export async function publishCurriculum(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const map = await prisma.curriculumMap.update({
    where: { id },
    data: { status: "PUBLISHED" },
  })

  revalidatePath("/dashboard/curriculum")
  return map
}

export async function deleteCurriculum(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.curriculumMap.delete({ where: { id } })
  revalidatePath("/dashboard/curriculum")
}

"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface RubricCriterion {
  name: string
  description: string
  maxPoints: number
  levels: { label: string; points: number; description: string }[]
}

export interface RubricTemplate {
  id: string
  tenantId: string
  title: string
  subject: string
  gradeLevel: string
  criteria: RubricCriterion[]
  createdBy: string
  createdAt: string
}

// Store rubric templates as JSON in a generic settings/config approach
// Using the existing Prisma models with JSON fields

export async function getRubricTemplates(): Promise<any[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const templates = await (prisma.assessment as any).findMany({
    where: {
      tenantId: session.user.tenantId,
      type: "RUBRIC",
    },
    orderBy: { createdAt: "desc" },
  })

  return templates
}

export async function createRubricTemplate(data: {
  title: string
  subject: string
  gradeLevel: string
  criteria: RubricCriterion[]
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
    throw new Error("Forbidden")
  }

  const template = await (prisma.assessment as any).create({
    data: {
      tenantId: session.user.tenantId,
      title: `[RUBRIC] ${data.title}`,
      type: "RUBRIC",
      subject: data.subject,
      classId: data.gradeLevel,
      createdBy: session.user.id,
      totalMarks: data.criteria.reduce((s, c) => s + c.maxPoints, 0),
      questions: data.criteria,
    },
  })

  revalidatePath("/dashboard/rubrics")
  return template
}

export async function deleteRubricTemplate(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  await (prisma.assessment as any).delete({ where: { id } })
  revalidatePath("/dashboard/rubrics")
}

export async function gradeWithRubric(data: {
  studentId: string
  assessmentId: string
  scores: { criterionName: string; points: number; feedback: string }[]
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const totalScore = data.scores.reduce((s, sc) => s + sc.points, 0)

  const grade = await (prisma as any).grade.create({
    data: {
      tenantId: session.user.tenantId,
      studentId: data.studentId,
      assessmentId: data.assessmentId,
      score: totalScore,
      feedback: JSON.stringify(data.scores),
      gradedBy: session.user.id,
    },
  })

  revalidatePath("/dashboard/gradebook")
  return grade
}

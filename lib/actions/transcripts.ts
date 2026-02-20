"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTranscripts(studentId?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const where: any = { tenantId: session.user.tenantId }
  if (studentId) where.studentId = studentId

  return prisma.transcript.findMany({
    where,
    orderBy: [{ academicYear: "desc" }, { term: "asc" }],
  })
}

export async function createTranscript(data: {
  studentId: string
  academicYear: string
  term?: string
  classId: string
  grades: Array<{ subject: string; score: number; grade: string; remarks?: string }>
  totalScore?: number
  averageScore?: number
  rank?: number
  totalStudents?: number
  totalDays?: number
  daysPresent?: number
  daysAbsent?: number
  classTeacherRemarks?: string
  principalRemarks?: string
  promotionStatus?: string
  promotedToClassId?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) throw new Error("Forbidden")

  const transcript = await prisma.transcript.create({
    data: {
      tenantId: session.user.tenantId,
      studentId: data.studentId,
      academicYear: data.academicYear,
      term: data.term,
      classId: data.classId,
      grades: data.grades as any,
      totalScore: data.totalScore,
      averageScore: data.averageScore,
      rank: data.rank,
      totalStudents: data.totalStudents,
      totalDays: data.totalDays,
      daysPresent: data.daysPresent,
      daysAbsent: data.daysAbsent,
      classTeacherRemarks: data.classTeacherRemarks,
      principalRemarks: data.principalRemarks,
      promotionStatus: data.promotionStatus as any,
      promotedToClassId: data.promotedToClassId,
    },
  })

  revalidatePath("/dashboard/transcripts")
  return transcript
}

export async function publishTranscript(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const transcript = await prisma.transcript.update({
    where: { id },
    data: { isPublished: true, publishedAt: new Date() },
  })

  revalidatePath("/dashboard/transcripts")
  return transcript
}

export async function promoteStudent(transcriptId: string, promotionStatus: string, promotedToClassId?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HOD"].includes(session.user.role)) throw new Error("Forbidden")

  const transcript = await prisma.transcript.update({
    where: { id: transcriptId },
    data: {
      promotionStatus: promotionStatus as any,
      promotedToClassId,
    },
  })

  if (promotionStatus === "PROMOTED" && promotedToClassId) {
    await prisma.student.update({
      where: { id: transcript.studentId },
      data: { currentClassId: promotedToClassId },
    })
  }

  revalidatePath("/dashboard/transcripts")
  return transcript
}

export async function deleteTranscript(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  await prisma.transcript.delete({ where: { id } })
  revalidatePath("/dashboard/transcripts")
}

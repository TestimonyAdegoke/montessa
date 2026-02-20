"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getExamTimetables() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.examTimetable.findMany({
    where: { tenantId: session.user.tenantId },
    include: { ExamTimetableEntry: { orderBy: { date: "asc" } } },
    orderBy: { startDate: "desc" },
  })
}

export async function createExamTimetable(data: {
  title: string
  academicYear: string
  term?: string
  startDate: string
  endDate: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HOD"].includes(session.user.role)) throw new Error("Forbidden")

  const timetable = await prisma.examTimetable.create({
    data: {
      tenantId: session.user.tenantId,
      title: data.title,
      academicYear: data.academicYear,
      term: data.term,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      createdBy: session.user.id,
    },
  })

  revalidatePath("/dashboard/exam-timetable")
  return timetable
}

export async function addExamEntry(data: {
  timetableId: string
  subject: string
  classId: string
  date: string
  startTime: string
  endTime: string
  roomId?: string
  invigilatorId?: string
  duration?: number
  totalMarks?: number
  notes?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const dateObj = new Date(data.date)
  dateObj.setHours(0, 0, 0, 0)

  const entry = await prisma.examTimetableEntry.create({
    data: {
      timetableId: data.timetableId,
      subject: data.subject,
      classId: data.classId,
      date: dateObj,
      startTime: data.startTime,
      endTime: data.endTime,
      roomId: data.roomId,
      invigilatorId: data.invigilatorId,
      duration: data.duration,
      totalMarks: data.totalMarks,
      notes: data.notes,
    },
  })

  revalidatePath("/dashboard/exam-timetable")
  return entry
}

export async function publishExamTimetable(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const timetable = await prisma.examTimetable.update({
    where: { id },
    data: { status: "PUBLISHED" },
  })

  revalidatePath("/dashboard/exam-timetable")
  return timetable
}

export async function deleteExamTimetable(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.examTimetable.delete({ where: { id } })
  revalidatePath("/dashboard/exam-timetable")
}

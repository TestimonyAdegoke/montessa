"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

interface ActivityEntry {
  time: string
  activity: string
  category: string
  notes?: string
}

interface MealInfo {
  breakfast?: { status: string; notes?: string }
  lunch?: { status: string; notes?: string }
  snack?: { status: string; notes?: string }
}

interface NapInfo {
  startTime?: string
  endTime?: string
  quality?: string
}

export async function getDailyUpdatesForClass(classId: string, date: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  const nextDate = new Date(targetDate)
  nextDate.setDate(nextDate.getDate() + 1)

  const updates = await prisma.dailyUpdate.findMany({
    where: {
      classId,
      tenantId: session.user.tenantId,
      date: { gte: targetDate, lt: nextDate },
    },
    orderBy: { createdAt: "desc" },
  })

  // Get student names
  const studentIds = updates.map((u: any) => u.studentId)
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    select: { id: true, legalName: true, preferredName: true, profilePhoto: true },
  })
  const studentMap = new Map(students.map((s) => [s.id, s]))

  return updates.map((u: any) => ({
    ...u,
    student: studentMap.get(u.studentId),
  }))
}

export async function getDailyUpdatesForStudent(studentId: string, limit = 30) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const updates = await prisma.dailyUpdate.findMany({
    where: {
      studentId,
      isPublished: true,
    },
    orderBy: { date: "desc" },
    take: limit,
  })

  return updates
}

export async function createDailyUpdate(data: {
  studentId: string
  classId: string
  date: string
  activities: ActivityEntry[]
  meals?: MealInfo
  nap?: NapInfo
  mood?: string
  photos?: string[]
  videos?: string[]
  highlights?: string
  concerns?: string
  teacherNote?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["TEACHER", "TENANT_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    throw new Error("Only teachers can create daily updates")
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  const targetDate = new Date(data.date)
  targetDate.setHours(0, 0, 0, 0)

  const update = await prisma.dailyUpdate.upsert({
    where: { studentId_date: { studentId: data.studentId, date: targetDate } },
    update: {
      activities: data.activities as any,
      meals: data.meals as any,
      nap: data.nap as any,
      mood: data.mood,
      photos: data.photos || [],
      videos: data.videos || [],
      highlights: data.highlights,
      concerns: data.concerns,
      teacherNote: data.teacherNote,
    },
    create: {
      tenantId: session.user.tenantId,
      studentId: data.studentId,
      teacherId: teacher?.id || session.user.id,
      classId: data.classId,
      date: targetDate,
      activities: data.activities as any,
      meals: data.meals as any,
      nap: data.nap as any,
      mood: data.mood,
      photos: data.photos || [],
      videos: data.videos || [],
      highlights: data.highlights,
      concerns: data.concerns,
      teacherNote: data.teacherNote,
    },
  })

  revalidatePath("/dashboard/daily-updates")
  return update
}

export async function publishDailyUpdate(updateId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const update = await prisma.dailyUpdate.update({
    where: { id: updateId },
    data: { isPublished: true, publishedAt: new Date() },
  })

  // Notify guardians of this student
  const studentGuardians = await prisma.studentGuardian.findMany({
    where: { studentId: update.studentId },
    include: { Guardian: { include: { User: { select: { id: true } } } } },
  })

  const student = await prisma.student.findUnique({
    where: { id: update.studentId },
    select: { legalName: true, preferredName: true },
  })

  const studentName = student?.preferredName || student?.legalName || "your child"

  for (const sg of studentGuardians) {
    await prisma.notification.create({
      data: {
        tenantId: session.user.tenantId,
        recipientId: sg.Guardian.User.id,
        title: `Daily Update for ${studentName}`,
        body: update.highlights || `Today's activities and updates are now available for ${studentName}.`,
        type: "INFO",
        category: "DAILY_UPDATE",
        channels: ["IN_APP", "EMAIL"],
        actionUrl: "/dashboard/children",
      },
    })
  }

  revalidatePath("/dashboard/daily-updates")
  return update
}

export async function markUpdateViewed(updateId: string, comment?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const update = await prisma.dailyUpdate.update({
    where: { id: updateId },
    data: {
      parentViewed: true,
      parentViewedAt: new Date(),
      parentComment: comment || undefined,
    },
  })

  revalidatePath("/dashboard/children")
  return update
}

export async function bulkPublishDailyUpdates(classId: string, date: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  const nextDate = new Date(targetDate)
  nextDate.setDate(nextDate.getDate() + 1)

  const result = await prisma.dailyUpdate.updateMany({
    where: {
      classId,
      date: { gte: targetDate, lt: nextDate },
      isPublished: false,
    },
    data: { isPublished: true, publishedAt: new Date() },
  })

  revalidatePath("/dashboard/daily-updates")
  return { count: result.count }
}

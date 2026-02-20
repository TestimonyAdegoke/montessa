"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createLearningPlan(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const studentId = formData.get("studentId") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const startDate = new Date(formData.get("startDate") as string)
    const endDate = formData.get("endDate") ? new Date(formData.get("endDate") as string) : null
    const objectives = formData.get("objectives") ? JSON.parse(formData.get("objectives") as string) : []

    // Find teacher record for current user
    const teacher = await prisma.teacher.findFirst({ where: { userId: session.user.id } })
    if (!teacher) return { success: false, error: "Teacher profile not found" }

    const plan = await prisma.individualLearningPlan.create({
      data: {
        studentId,
        teacherId: teacher.id,
        title,
        description,
        startDate,
        endDate,
        objectives,
        status: "ACTIVE",
      },
    })

    revalidatePath("/dashboard/learning-plans")
    revalidatePath(`/dashboard/students/${studentId}`)
    return { success: true, data: plan }
  } catch (error: any) {
    console.error("Create learning plan error:", error)
    return { success: false, error: error.message || "Failed to create learning plan" }
  }
}

export async function updateLearningPlan(planId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const endDate = formData.get("endDate") ? new Date(formData.get("endDate") as string) : null
    const objectives = formData.get("objectives") ? JSON.parse(formData.get("objectives") as string) : []
    const status = formData.get("status") as string

    const plan = await prisma.individualLearningPlan.update({
      where: { id: planId },
      data: {
        title,
        description,
        endDate,
        objectives,
        status: status as any,
      },
    })

    revalidatePath("/dashboard/learning-plans")
    revalidatePath(`/dashboard/learning-plans/${planId}`)
    return { success: true, data: plan }
  } catch (error: any) {
    console.error("Update learning plan error:", error)
    return { success: false, error: error.message || "Failed to update learning plan" }
  }
}

export async function addLearningActivity(planId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const title = formData.get("name") as string || formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const materials = formData.get("materials") ? JSON.parse(formData.get("materials") as string) : []

    const activity = await prisma.learningActivity.create({
      data: {
        planId,
        title,
        description,
        category: category as any,
        materials,
        status: "PENDING",
      },
    })

    revalidatePath(`/dashboard/learning-plans/${planId}`)
    return { success: true, data: activity }
  } catch (error: any) {
    console.error("Add learning activity error:", error)
    return { success: false, error: error.message || "Failed to add activity" }
  }
}

export async function updateActivityProgress(activityId: string, status: string, notes?: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const activity = await prisma.learningActivity.update({
      where: { id: activityId },
      data: {
        status: status as any,
        completedDate: status === "COMPLETED" ? new Date() : null,
      },
      include: { IndividualLearningPlan: { select: { studentId: true } } },
    })

    // Add observation if notes provided
    if (notes) {
      const teacher = await prisma.teacher.findFirst({ where: { userId: session.user.id } })
      if (teacher && activity.IndividualLearningPlan) {
        await prisma.observation.create({
          data: {
            activityId,
            studentId: activity.IndividualLearningPlan.studentId,
            teacherId: teacher.id,
            title: `Progress Update - ${activity.title}`,
            description: notes,
            observedAt: new Date(),
          },
        })
      }
    }

    revalidatePath(`/dashboard/learning-plans`)
    return { success: true, data: activity }
  } catch (error: any) {
    console.error("Update activity progress error:", error)
    return { success: false, error: error.message || "Failed to update progress" }
  }
}

export async function addObservation(activityId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const photos = formData.get("photos") ? JSON.parse(formData.get("photos") as string) : []
    const videos = formData.get("videos") ? JSON.parse(formData.get("videos") as string) : []

    // Get teacher and activity's student
    const teacher = await prisma.teacher.findFirst({ where: { userId: session.user.id } })
    if (!teacher) return { success: false, error: "Teacher profile not found" }
    const activityRecord = await prisma.learningActivity.findUnique({
      where: { id: activityId },
      include: { IndividualLearningPlan: { select: { studentId: true } } },
    })
    if (!activityRecord?.IndividualLearningPlan) return { success: false, error: "Activity not found" }

    const observation = await prisma.observation.create({
      data: {
        activityId,
        studentId: activityRecord.IndividualLearningPlan.studentId,
        teacherId: teacher.id,
        title,
        description,
        observedAt: new Date(),
        photos,
        videos,
      },
    })

    revalidatePath(`/dashboard/learning-plans`)
    return { success: true, data: observation }
  } catch (error: any) {
    console.error("Add observation error:", error)
    return { success: false, error: error.message || "Failed to add observation" }
  }
}

export async function getStudentLearningPlans(studentId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return []
    }

    const rawPlans = await prisma.individualLearningPlan.findMany({
      where: {
        studentId,
        Student: {
          tenantId: session.user.tenantId,
        },
      },
      include: {
        Teacher: {
          include: {
            User: { select: { name: true } },
          },
        },
        LearningActivity: {
          include: {
            Observation: {
              include: {
                Teacher: {
                  include: {
                    User: { select: { name: true } },
                  },
                },
              },
              orderBy: {
                observedAt: "desc",
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return rawPlans.map(({ Teacher, LearningActivity, ...rest }) => ({
      ...rest,
      teacher: { ...Teacher, user: Teacher.User },
      activities: LearningActivity.map(({ Observation, ...aRest }) => ({
        ...aRest,
        observations: Observation.map(({ Teacher: oTeacher, ...oRest }) => ({
          ...oRest,
          teacher: { ...oTeacher, user: oTeacher.User },
        })),
      })),
    }))
  } catch (error) {
    console.error("Get student learning plans error:", error)
    return []
  }
}

export async function getActiveStudents() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return []
    }

    const rawStudents = await prisma.student.findMany({
      where: {
        tenantId: session.user.tenantId,
        studentStatus: "ACTIVE",
      },
      include: {
        User: {
          select: {
            name: true,
          },
        },
        Class: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        legalName: "asc",
      },
    })

    return rawStudents.map(({ User, Class, ...rest }) => ({
      ...rest,
      user: User,
      currentClass: Class,
    }))
  } catch (error) {
    console.error("Get active students error:", error)
    return []
  }
}

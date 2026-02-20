import { prisma } from "@/lib/prisma"

const MODULE_NAMES = [
  "students",
  "teachers",
  "classes",
  "attendance",
  "assessments",
  "learning-plans",
  "billing",
  "messages",
  "announcements",
  "schedule",
  "analytics",
  "admissions",
  "discipline",
  "events",
  "rooms",
  "lesson-plans",
  "check-in",
  "reports",
] as const

export type ModuleName = (typeof MODULE_NAMES)[number]

export async function isModuleEnabled(tenantId: string, module: ModuleName): Promise<boolean> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { enabledModules: true, plan: true },
    })

    if (!tenant) return false

    const enabledModules = tenant.enabledModules as string[]

    // All modules enabled for enterprise plan
    if (tenant.plan === "enterprise") return true

    // Check if module is in the enabled list
    return Array.isArray(enabledModules) && enabledModules.includes(module)
  } catch {
    return true // Default to enabled if check fails
  }
}

export async function getEnabledModules(tenantId: string): Promise<string[]> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { enabledModules: true, plan: true },
    })

    if (!tenant) return []

    if (tenant.plan === "enterprise") return [...MODULE_NAMES]

    const enabledModules = tenant.enabledModules as string[]
    return Array.isArray(enabledModules) ? enabledModules : []
  } catch {
    return [...MODULE_NAMES]
  }
}

// Plan-based limits
const PLAN_LIMITS: Record<string, { maxStudents: number; maxTeachers: number; maxClasses: number }> = {
  free: { maxStudents: 50, maxTeachers: 5, maxClasses: 5 },
  basic: { maxStudents: 200, maxTeachers: 20, maxClasses: 20 },
  premium: { maxStudents: 1000, maxTeachers: 100, maxClasses: 100 },
  enterprise: { maxStudents: Infinity, maxTeachers: Infinity, maxClasses: Infinity },
}

export async function checkPlanLimit(
  tenantId: string,
  resource: "students" | "teachers" | "classes"
): Promise<{ allowed: boolean; current: number; limit: number }> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    })

    if (!tenant) return { allowed: false, current: 0, limit: 0 }

    const limits = PLAN_LIMITS[tenant.plan] || PLAN_LIMITS.free

    let current = 0
    if (resource === "students") {
      current = await prisma.student.count({ where: { tenantId, studentStatus: "ACTIVE" } })
    } else if (resource === "teachers") {
      current = await prisma.teacher.count({ where: { User: { tenantId } } })
    } else if (resource === "classes") {
      current = await prisma.class.count({ where: { tenantId, status: "ACTIVE" } })
    }

    const limit = resource === "students" ? limits.maxStudents : resource === "teachers" ? limits.maxTeachers : limits.maxClasses

    return { allowed: current < limit, current, limit }
  } catch {
    return { allowed: true, current: 0, limit: Infinity }
  }
}

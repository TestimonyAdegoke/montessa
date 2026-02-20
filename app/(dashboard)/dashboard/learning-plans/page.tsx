import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import LearningPlansTable from "@/components/learning-plans/plans-table"

async function getLearningPlans(tenantId: string) {
  const raw = await prisma.individualLearningPlan.findMany({
    where: {
      Student: {
        tenantId,
      },
    },
    include: {
      Student: {
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
      },
      Teacher: {
        include: {
          User: {
            select: {
              name: true,
            },
          },
        },
      },
      LearningActivity: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return raw.map(({ Student, Teacher, LearningActivity, ...rest }) => ({
    ...rest,
    student: { ...Student, user: Student.User, currentClass: Student.Class },
    teacher: { ...Teacher, user: Teacher.User },
    activities: LearningActivity,
  }))
}

export default async function LearningPlansPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const plans = await getLearningPlans(session.user.tenantId)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Plans</h1>
          <p className="text-muted-foreground">
            Individual Learning Plans (ILPs) for Montessori-based education
          </p>
        </div>
        <Link href="/dashboard/learning-plans/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </Link>
      </div>

      <LearningPlansTable plans={plans} />
    </div>
  )
}

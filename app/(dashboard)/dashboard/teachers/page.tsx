import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import TeachersTable from "@/components/teachers/teachers-table"

async function getTeachers(tenantId: string) {
  const teachers = await prisma.teacher.findMany({
    where: {
      User: { tenantId },
    },
    include: {
      User: {
        select: {
          name: true,
          email: true,
          phone: true,
          isActive: true,
        },
      },
      ClassTeacher: {
        include: {
          Class: {
            select: {
              name: true,
              grade: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return teachers.map(({ User, ClassTeacher, ...rest }) => ({
    ...rest,
    user: User,
    classes: ClassTeacher.map((ct) => ({ ...ct, class: ct.Class })),
  }))
}

export default async function TeachersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const teachers = await getTeachers(session.user.tenantId)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">
            Manage teaching staff and assignments
          </p>
        </div>
        <Link href="/dashboard/teachers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </Link>
      </div>

      <TeachersTable teachers={teachers} />
    </div>
  )
}

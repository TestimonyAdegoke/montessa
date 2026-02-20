import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import ClassesGrid from "@/components/classes/classes-grid"

async function getClasses(tenantId: string) {
  const classes = await prisma.class.findMany({
    where: { tenantId },
    include: {
      _count: {
        select: {
          Student: true,
          ClassEnrollment: true,
        },
      },
      ClassTeacher: {
        include: {
          Teacher: {
            include: {
              User: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  return classes.map(({ ClassTeacher, _count, ...rest }) => ({
    ...rest,
    _count: { students: _count.Student, enrollments: _count.ClassEnrollment },
    teachers: ClassTeacher.map((ct) => ({
      ...ct,
      teacher: { ...ct.Teacher, user: ct.Teacher.User },
    })),
  }))
}

export default async function ClassesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const classes = await getClasses(session.user.tenantId)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">
            Manage classes, enrollments, and teacher assignments
          </p>
        </div>
        {["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role) && (
          <Link href="/dashboard/classes/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </Link>
        )}
      </div>

      <ClassesGrid classes={classes} />
    </div>
  )
}

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import StudentsTable, { StudentTableRow } from "@/components/students/students-table"

async function getStudents(tenantId: string): Promise<StudentTableRow[]> {
  const students = await prisma.student.findMany({
    where: { tenantId },
    include: {
      User: {
        select: {
          name: true,
          email: true,
        },
      },
      Class: {
        select: {
          name: true,
          grade: true,
        },
      },
      StudentGuardian: {
        include: {
          Guardian: {
            include: {
              User: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return students.map(({ User, Class, StudentGuardian, ...rest }) => ({
    ...rest,
    user: User,
    currentClass: Class,
    guardians: StudentGuardian.map((sg) => ({
      relationship: sg.relationship,
      guardian: {
        user: sg.Guardian.User,
      },
    })),
  }))
}

export default async function StudentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const students = await getStudents(session.user.tenantId)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student profiles and information
          </p>
        </div>
        <Link href="/dashboard/students/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>

      <StudentsTable students={students} />
    </div>
  )
}

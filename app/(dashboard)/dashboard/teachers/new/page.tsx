import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import TeacherForm from "@/components/teachers/teacher-form"

async function getEligibleUsers(tenantId: string) {
  const users = await prisma.user.findMany({
    where: {
      tenantId,
      role: "TEACHER",
      Teacher: null,
      isActive: true,
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  })
  return users
}

export default async function NewTeacherPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const users = await getEligibleUsers(session.user.tenantId)

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Teacher</h1>
        <p className="text-muted-foreground">Add a teacher profile for an existing user</p>
      </div>
      <TeacherForm users={users} />
    </div>
  )
}

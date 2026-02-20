import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TransferClient } from "@/components/students/transfer-client"

export default async function TransferPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const students = await prisma.student.findMany({
    where: { tenantId: session.user.tenantId },
    select: { id: true, legalName: true, admissionNumber: true, classId: true } as any,
    orderBy: { legalName: "asc" },
  })
  const classes = await prisma.class.findMany({
    where: { tenantId: session.user.tenantId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transfer & Re-Admission</h1>
        <p className="text-muted-foreground">Manage student transfers and re-admissions</p>
      </div>
      <TransferClient
        students={JSON.parse(JSON.stringify(students))}
        classes={JSON.parse(JSON.stringify(classes))}
      />
    </div>
  )
}

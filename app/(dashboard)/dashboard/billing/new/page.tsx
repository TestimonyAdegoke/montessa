import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import InvoiceForm from "@/components/billing/invoice-form"

async function getStudents() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  const students = await prisma.student.findMany({
    where: {
      tenantId: session.user.tenantId,
      studentStatus: "ACTIVE",
    },
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
        },
      },
    },
    orderBy: {
      legalName: "asc",
    },
  })

  return students
}

export default async function NewInvoicePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const students = await getStudents()

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Invoice</h1>
        <p className="text-muted-foreground">Generate a new invoice for a student</p>
      </div>
      <InvoiceForm students={students.map((s: any) => ({ ...s, user: s.User, currentClass: s.Class })) as any} mode="create" />
    </div>
  )
}

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import InvoiceForm from "@/components/billing/invoice-form"

async function getData(tenantId: string, id: string) {
  const [invoice, students] = await Promise.all([
    prisma.invoice.findUnique({ where: { id } }),
    prisma.student.findMany({
      where: { tenantId, studentStatus: "ACTIVE" },
      include: { User: { select: { name: true, email: true } }, Class: { select: { name: true } } },
      orderBy: { legalName: "asc" },
    }),
  ])
  return { invoice, students: students.map((s: any) => ({ ...s, user: s.User, currentClass: s.Class })) }
}

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const { invoice, students } = await getData(session.user.tenantId, params.id)
  if (!invoice) redirect("/dashboard/billing")

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Invoice</h1>
        <p className="text-muted-foreground">Update invoice details and items</p>
      </div>
      <InvoiceForm invoiceData={invoice} students={students as any} mode="edit" />
    </div>
  )
}

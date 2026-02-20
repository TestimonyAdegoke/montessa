import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getInstallmentPlans } from "@/lib/actions/installments"
import { InstallmentClient } from "@/components/installments/installment-client"

export default async function InstallmentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"].includes(session.user.role)) redirect("/dashboard")

  const plans = await getInstallmentPlans()

  const serialized = plans.map((p: any) => ({
    id: p.id,
    invoiceId: p.invoiceId,
    studentId: p.studentId,
    totalAmount: p.totalAmount,
    numberOfInstallments: p.numberOfInstallments,
    frequency: p.frequency,
    startDate: p.startDate.toISOString(),
    status: p.status,
    notes: p.notes,
    installments: p.installments.map((i: any) => ({
      id: i.id,
      installmentNumber: i.installmentNumber,
      amount: i.amount,
      dueDate: i.dueDate.toISOString(),
      paidDate: i.paidDate?.toISOString() || null,
      status: i.status,
    })),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Installment Plans</h1>
        <p className="text-muted-foreground">Manage payment installment plans for student fees</p>
      </div>
      <InstallmentClient plans={serialized} />
    </div>
  )
}

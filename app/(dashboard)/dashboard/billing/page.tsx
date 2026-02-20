import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getInvoices } from "@/lib/actions/billing"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import InvoicesTable from "@/components/billing/invoices-table"

export default async function BillingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const invoices = await getInvoices()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage student fees and payments</p>
        </div>
        <Link href="/dashboard/billing/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>
      <InvoicesTable invoices={invoices} />
    </div>
  )
}

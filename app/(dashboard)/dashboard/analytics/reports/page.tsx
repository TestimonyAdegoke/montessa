import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReportBuilderClient } from "@/components/reports/report-builder-client"

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE", "HR", "HOD"].includes(session.user.role)) redirect("/dashboard")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report Builder</h1>
        <p className="text-muted-foreground">Generate and export custom reports from your school data</p>
      </div>
      <ReportBuilderClient />
    </div>
  )
}

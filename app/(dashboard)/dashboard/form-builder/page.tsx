import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getForms } from "@/lib/actions/form-builder"
import { getDashboardAnalytics } from "@/lib/actions/form-builder-submissions"
import FormsListClient from "@/components/form-builder/forms-list-client"

export default async function FormBuilderPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const [forms, analytics] = await Promise.all([
    getForms(),
    getDashboardAnalytics().catch(() => null),
  ])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Form Builder</h1>
        <p className="text-muted-foreground text-sm">Create, manage, and analyze forms for your school</p>
      </div>
      <FormsListClient forms={JSON.parse(JSON.stringify(forms))} analytics={analytics ? JSON.parse(JSON.stringify(analytics)) : undefined} />
    </div>
  )
}

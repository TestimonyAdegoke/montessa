import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getForms } from "@/lib/actions/form-builder"
import { getSubmissions, getDashboardAnalytics } from "@/lib/actions/form-builder-submissions"
import SubmissionsClient from "@/components/form-builder/submissions-client"

export default async function SubmissionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const [{ submissions, total }, forms, analytics] = await Promise.all([
    getSubmissions({ limit: 200 }),
    getForms(),
    getDashboardAnalytics().catch(() => null),
  ])

  const formsList = (forms as any[]).map((f: any) => ({
    id: f.id, name: f.name, slug: f.slug, category: f.category,
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submissions</h1>
        <p className="text-muted-foreground text-sm">Review, approve, and manage form submissions</p>
      </div>
      <SubmissionsClient
        submissions={JSON.parse(JSON.stringify(submissions))}
        forms={formsList}
        total={total}
        analytics={analytics ? JSON.parse(JSON.stringify(analytics)) : undefined}
      />
    </div>
  )
}

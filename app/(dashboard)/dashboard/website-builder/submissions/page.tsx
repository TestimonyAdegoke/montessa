import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getSubmissions, getForms } from "@/lib/actions/website-builder-forms"
import SubmissionsClient from "@/components/website-builder/management/submissions-client"

export default async function SubmissionsPage({ searchParams }: { searchParams: { formId?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const [submissions, forms] = await Promise.all([
    getSubmissions(searchParams.formId),
    getForms(),
  ])

  return (
    <SubmissionsClient
      submissions={JSON.parse(JSON.stringify(submissions))}
      forms={JSON.parse(JSON.stringify(forms))}
      initialFormId={searchParams.formId || null}
    />
  )
}

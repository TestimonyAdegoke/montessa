import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getFormTemplates } from "@/lib/actions/form-builder"
import TemplatesClient from "@/components/form-builder/templates-client"

export default async function FormTemplatesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const templates = await getFormTemplates()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Form Templates</h1>
        <p className="text-muted-foreground text-sm">Start with a pre-built template and customize it for your school</p>
      </div>
      <TemplatesClient templates={JSON.parse(JSON.stringify(templates))} />
    </div>
  )
}

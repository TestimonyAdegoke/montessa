import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getTemplates, getSite } from "@/lib/actions/website-builder"
import TemplatesClient from "@/components/website-builder/management/templates-client"

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const [templates, site] = await Promise.all([
    getTemplates(),
    getSite().catch(() => null),
  ])

  return (
    <TemplatesClient
      templates={JSON.parse(JSON.stringify(templates))}
      hasSite={!!site}
      siteMode={site?.mode || null}
    />
  )
}

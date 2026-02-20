import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getSite } from "@/lib/actions/website-builder"
import ThemeEditorClient from "@/components/website-builder/management/theme-editor-client"

export default async function ThemeEditorPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  let site = null
  try {
    site = await getSite()
  } catch {
    redirect("/dashboard/website-builder")
  }

  if (!site) redirect("/dashboard/website-builder")

  return (
    <ThemeEditorClient
      siteId={site.id}
      theme={site.theme ? JSON.parse(JSON.stringify(site.theme)) : null}
    />
  )
}

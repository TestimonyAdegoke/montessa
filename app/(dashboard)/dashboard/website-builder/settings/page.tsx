import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getSite } from "@/lib/actions/website-builder"
import SiteSettingsClient from "@/components/website-builder/management/site-settings-client"

export default async function SiteSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  let site = null
  try { site = await getSite() } catch {}
  if (!site) redirect("/dashboard/website-builder")

  return <SiteSettingsClient site={JSON.parse(JSON.stringify(site))} />
}

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getSite } from "@/lib/actions/website-builder"
import MenusClient from "@/components/website-builder/management/menus-client"

export default async function MenusPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  let site = null
  try { site = await getSite() } catch {}
  if (!site) redirect("/dashboard/website-builder")

  return (
    <MenusClient
      menus={JSON.parse(JSON.stringify(site.menus || []))}
      pages={JSON.parse(JSON.stringify(site.pages || []))}
      siteId={site.id}
    />
  )
}

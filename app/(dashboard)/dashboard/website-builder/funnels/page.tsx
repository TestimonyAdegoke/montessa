import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getFunnels } from "@/lib/actions/website-builder-forms"
import { getSite } from "@/lib/actions/website-builder"
import FunnelsClient from "@/components/website-builder/management/funnels-client"

export default async function FunnelsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  let site = null
  try { site = await getSite() } catch {}

  const funnels = await getFunnels()
  const pages = site?.pages || []

  return (
    <FunnelsClient
      funnels={JSON.parse(JSON.stringify(funnels))}
      pages={JSON.parse(JSON.stringify(pages))}
    />
  )
}

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function WebsiteBuilderPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  // Legacy Website Builder is now hidden; redirect to Settings → Branding (Site Builder entrypoint)
  redirect("/dashboard/settings?tab=branding")
}

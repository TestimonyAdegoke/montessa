import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getForms } from "@/lib/actions/website-builder-forms"
import FormsClient from "@/components/website-builder/management/forms-client"

export default async function FormsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const forms = await getForms()

  return <FormsClient forms={JSON.parse(JSON.stringify(forms))} />
}

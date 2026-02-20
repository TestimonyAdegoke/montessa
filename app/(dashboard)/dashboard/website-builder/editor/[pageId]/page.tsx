import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getPage, getSite } from "@/lib/actions/website-builder"
import PageEditor from "@/components/website-builder/page-editor"

export default async function PageEditorPage({ params }: { params: { pageId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  let page, site
  try {
    page = await getPage(params.pageId)
    site = await getSite()
  } catch {
    redirect("/dashboard/website-builder")
  }

  if (!page || !site) redirect("/dashboard/website-builder")

  return (
    <PageEditor
      page={JSON.parse(JSON.stringify(page))}
      site={JSON.parse(JSON.stringify(site))}
      userId={session.user.id}
    />
  )
}

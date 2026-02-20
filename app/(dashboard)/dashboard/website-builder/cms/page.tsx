import { getCmsCollections } from "@/lib/actions/website-builder-cms"
import { getSite } from "@/lib/actions/website-builder"
import { CmsCollectionsClient } from "@/components/website-builder/management/cms-collections-client"
import { redirect } from "next/navigation"

export default async function CmsPage() {
  const site = await getSite()
  if (!site) redirect("/dashboard/website-builder")

  const collections = await getCmsCollections()

  return <CmsCollectionsClient collections={collections} />
}

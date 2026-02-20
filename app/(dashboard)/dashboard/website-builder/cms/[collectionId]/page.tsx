import { getCmsCollection } from "@/lib/actions/website-builder-cms"
import { CmsCollectionDetailClient } from "@/components/website-builder/management/cms-collection-detail-client"
import { redirect } from "next/navigation"

export default async function CmsCollectionDetailPage({
  params,
}: {
  params: { collectionId: string }
}) {
  const collection = await getCmsCollection(params.collectionId)
  if (!collection) redirect("/dashboard/website-builder/cms")

  return <CmsCollectionDetailClient collection={collection} />
}

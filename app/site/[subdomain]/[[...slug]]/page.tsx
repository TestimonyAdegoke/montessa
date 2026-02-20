import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { WBRenderer } from "@/lib/website-builder/renderer"
import { getCmsCollections } from "@/lib/website-builder/cms-lite"
import { getPersistedCmsAsRuntime } from "@/lib/actions/website-builder-cms"
import type { WBThemeTokens } from "@/lib/website-builder/types"

interface PublicRuntimePageProps {
  params: {
    subdomain: string
    slug?: string[]
  }
}

function parseJsonMaybe(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }
  return value
}

function toThemeTokens(theme: any): WBThemeTokens | null {
  if (!theme) return null
  return {
    primaryColor: theme.primaryColor || "#2563eb",
    secondaryColor: theme.secondaryColor || "#7c3aed",
    accentColor: theme.accentColor || "#f59e0b",
    backgroundColor: theme.backgroundColor || "#ffffff",
    surfaceColor: theme.surfaceColor || "#f8fafc",
    textColor: theme.textColor || "#0f172a",
    mutedColor: theme.mutedColor || "#64748b",
    headingFont: theme.headingFont || "Inter",
    bodyFont: theme.bodyFont || "Inter",
    borderRadius: theme.borderRadius || "0.5rem",
    buttonRadius: theme.buttonRadius || "0.375rem",
    cardRadius: theme.cardRadius || "0.75rem",
    buttonStyle: theme.buttonStyle || "filled",
    shadowStyle: theme.shadowStyle || "md",
    containerWidth: theme.containerWidth || "1280px",
  }
}

async function getPublishedRuntimeData(subdomain: string, pageSlug?: string) {
  const site = await (prisma as any).wBSite.findFirst({
    where: {
      OR: [
        { subdomain },
        { customDomain: subdomain },
        { tenant: { subdomain } },
        { tenant: { domain: subdomain } },
      ],
    },
    include: {
      theme: true,
      menus: {
        include: {
          items: {
            where: { isVisible: true, parentId: null },
            orderBy: { sortOrder: "asc" },
            include: {
              children: {
                where: { isVisible: true },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
      tenant: {
        select: { name: true, logo: true, favicon: true, tagline: true },
      },
    },
  })

  if (!site || !site.isPublished) return null

  const pageSelect = {
    id: true,
    title: true,
    slug: true,
    status: true,
    publishedContent: true,
    metaTitle: true,
    metaDescription: true,
    ogImageUrl: true,
    isHomepage: true,
    pageType: true,
    cmsCollectionId: true,
  }

  let page: any = null
  let cmsItem: any = null

  if (pageSlug) {
    // 1. Try exact static page match
    page = await (prisma as any).wBPage.findUnique({
      where: { siteId_slug: { siteId: site.id, slug: pageSlug } },
      select: pageSelect,
    })

    // 2. If no match, try CMS template page routing: slug = "collection-slug/item-slug"
    if (!page) {
      const slugParts = pageSlug.split("/")
      // Check all CMS_TEMPLATE pages to see if any collection item matches
      const templatePages = await (prisma as any).wBPage.findMany({
        where: { siteId: site.id, pageType: "CMS_TEMPLATE", status: "PUBLISHED" },
        select: pageSelect,
      })
      for (const tp of templatePages) {
        if (!tp.cmsCollectionId) continue
        // Try matching: the page slug is the prefix, the rest is the item slug
        // e.g. page.slug = "blog", pageSlug = "blog/my-post" → itemSlug = "my-post"
        if (pageSlug.startsWith(tp.slug + "/")) {
          const itemSlug = pageSlug.slice(tp.slug.length + 1)
          const item = await (prisma as any).wBCmsItem.findUnique({
            where: { collectionId_slug: { collectionId: tp.cmsCollectionId, slug: itemSlug } },
          })
          if (item && item.status === "PUBLISHED") {
            page = tp
            cmsItem = { ...item, fieldData: item.publishedFieldData ?? item.fieldData }
            break
          }
        }
        // Also try: pageSlug IS the item slug directly (single-segment)
        if (slugParts.length === 1) {
          const item = await (prisma as any).wBCmsItem.findUnique({
            where: { collectionId_slug: { collectionId: tp.cmsCollectionId, slug: pageSlug } },
          })
          if (item && item.status === "PUBLISHED") {
            page = tp
            cmsItem = { ...item, fieldData: item.publishedFieldData ?? item.fieldData }
            break
          }
        }
      }
    }
  } else {
    page = await (prisma as any).wBPage.findFirst({
      where: { siteId: site.id, isHomepage: true, status: "PUBLISHED" },
      select: pageSelect,
    })
  }

  const resolvedPage = page || await (prisma as any).wBPage.findFirst({
    where: { siteId: site.id, isHomepage: true, status: "PUBLISHED" },
    select: pageSelect,
  })

  if (!resolvedPage || resolvedPage.status !== "PUBLISHED" || !resolvedPage.publishedContent) {
    return null
  }

  const componentBlocks = await (prisma as any).wBBlock.findMany({
    where: { tenantId: site.tenantId, category: "component" },
    orderBy: { updatedAt: "desc" },
  })

  const components = componentBlocks.map((block: any) => {
    const payload = parseJsonMaybe(block.content) || {}
    return {
      id: block.id,
      name: block.name,
      sourceNodes: Array.isArray(payload.sourceNodes) ? payload.sourceNodes : [],
      editableFields: Array.isArray(payload.editableFields) ? payload.editableFields : [],
      createdAt: new Date(block.createdAt).getTime(),
    }
  })

  const content = parseJsonMaybe(resolvedPage.publishedContent)
  const nodes = Array.isArray(content) ? content : []

  const [liteCms, persistedCms] = await Promise.all([
    getCmsCollections(site.tenantId),
    getPersistedCmsAsRuntime(site.id),
  ])
  const seenIds = new Set(persistedCms.map((c: any) => c.id))
  const cmsCollections = [...persistedCms, ...liteCms.filter((c) => !seenIds.has(c.id))]

  return {
    site,
    page: resolvedPage,
    nodes,
    components,
    cmsCollections,
    cmsItem: cmsItem ? { id: cmsItem.id, slug: cmsItem.slug, fieldData: cmsItem.fieldData } : null,
    theme: toThemeTokens(site.theme),
  }
}

export default async function PublicRuntimePage({ params }: PublicRuntimePageProps) {
  const pageSlug = params.slug?.[0]
  const data = await getPublishedRuntimeData(params.subdomain, pageSlug)
  if (!data) notFound()

  return (
    <main
      style={{
        backgroundColor: data.theme?.backgroundColor || "#ffffff",
        color: data.theme?.textColor || "#0f172a",
        minHeight: "100vh",
      }}
    >
      <WBRenderer
        nodes={data.nodes}
        theme={data.theme}
        components={data.components}
        cmsCollections={data.cmsCollections}
        menus={data.site.menus}
        cmsItem={data.cmsItem}
        viewport="desktop"
      />
    </main>
  )
}

export async function generateMetadata({ params }: PublicRuntimePageProps) {
  const pageSlug = params.slug?.[0]
  const data = await getPublishedRuntimeData(params.subdomain, pageSlug)
  if (!data) return { title: "Site Not Found" }

  return {
    title: data.page.metaTitle || data.site.metaTitle || data.page.title,
    description: data.page.metaDescription || data.site.metaDescription || data.site.tenant?.tagline || undefined,
    openGraph: {
      title: data.page.metaTitle || data.site.metaTitle || data.page.title,
      description: data.page.metaDescription || data.site.metaDescription || data.site.tenant?.tagline || undefined,
      images: data.page.ogImageUrl || data.site.ogImageUrl ? [data.page.ogImageUrl || data.site.ogImageUrl] : undefined,
    },
    icons: data.site.faviconUrl || data.site.tenant?.favicon ? { icon: data.site.faviconUrl || data.site.tenant?.favicon } : undefined,
  }
}

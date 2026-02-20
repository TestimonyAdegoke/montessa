import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCmsCollections } from "@/lib/website-builder/cms-lite"

// ─────────────────────────────────────────────────────────
// Public Site Renderer API
// Resolves tenant by subdomain/domain and returns published page data
// GET /api/site/:subdomain/:pageSlug
// ─────────────────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
  try {
    const [subdomain, pageSlug] = params.slug

    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    // Find site by subdomain or custom domain
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

    if (!site || !site.isPublished) {
      return NextResponse.json({ error: "Site not found or not published" }, { status: 404 })
    }

    const [componentBlocks, cmsCollections] = await Promise.all([
      (prisma as any).wBBlock.findMany({
        where: { tenantId: site.tenantId, category: "component" },
        orderBy: { updatedAt: "desc" },
      }),
      getCmsCollections(site.tenantId),
    ])

    const components = componentBlocks.map((block: any) => {
      const payload = typeof block.content === "string" ? JSON.parse(block.content) : (block.content || {})
      return {
        id: block.id,
        name: block.name,
        sourceNodes: Array.isArray(payload.sourceNodes) ? payload.sourceNodes : [],
        editableFields: Array.isArray(payload.editableFields) ? payload.editableFields : [],
        createdAt: new Date(block.createdAt).getTime(),
      }
    })

    const pageSelect = {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedContent: true,
      content: true,
      metaTitle: true,
      metaDescription: true,
      ogImageUrl: true,
      isHomepage: true,
      isPortalLogin: true,
    }

    const slug = pageSlug || null

    const page = slug
      ? await (prisma as any).wBPage.findUnique({
          where: { siteId_slug: { siteId: site.id, slug } },
          select: pageSelect,
        })
      : await (prisma as any).wBPage.findFirst({
          where: { siteId: site.id, isHomepage: true, status: "PUBLISHED" },
          select: pageSelect,
        })

    if (!page) {
      // Try homepage as fallback
      if (slug) {
        const homepage = await (prisma as any).wBPage.findFirst({
          where: { siteId: site.id, isHomepage: true, status: "PUBLISHED" },
          select: pageSelect,
        })
        if (!homepage) {
          return NextResponse.json({ error: "Page not found" }, { status: 404 })
        }
        return NextResponse.json({
          site: {
            name: site.name,
            mode: site.mode,
            metaTitle: site.metaTitle,
            metaDescription: site.metaDescription,
            faviconUrl: site.faviconUrl || site.tenant?.favicon,
            ogImageUrl: site.ogImageUrl,
            tenant: site.tenant,
          },
          theme: site.theme,
          menus: site.menus,
          components,
          cmsCollections,
          page: {
            ...homepage,
            content: homepage.publishedContent,
          },
        })
      }
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Public API must never expose draft content.
    if (page.status !== "PUBLISHED" || !page.publishedContent) {
      return NextResponse.json({ error: "Page not published" }, { status: 404 })
    }

    const content = page.publishedContent

    return NextResponse.json({
      site: {
        name: site.name,
        mode: site.mode,
        metaTitle: site.metaTitle,
        metaDescription: site.metaDescription,
        faviconUrl: site.faviconUrl || site.tenant?.favicon,
        ogImageUrl: site.ogImageUrl,
        tenant: site.tenant,
      },
      theme: site.theme,
      menus: site.menus,
      components,
      cmsCollections,
      page: {
        id: page.id,
        title: page.title,
        slug: page.slug,
        status: page.status,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        ogImageUrl: page.ogImageUrl,
        isHomepage: page.isHomepage,
        isPortalLogin: page.isPortalLogin,
        content,
      },
    })
  } catch (error: any) {
    console.error("Site render error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

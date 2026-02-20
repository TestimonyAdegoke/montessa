"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { WBNode, WBComponentEditableField } from "@/lib/website-builder/types"
import { getCmsCollections } from "@/lib/website-builder/cms-lite"
import { getPersistedCmsAsRuntime } from "@/lib/actions/website-builder-cms"

function normalizeComponentSourceNodes(nodes: WBNode[]): WBNode[] {
  return (nodes || []).map((node) => ({
    ...node,
    props: { ...(node.props || {}) },
    componentNodeId: node.componentNodeId || `cmp_${Math.random().toString(36).slice(2, 10)}`,
    children: node.children ? normalizeComponentSourceNodes(node.children as WBNode[]) : undefined,
  }))
}

function collectEditableFields(nodes: WBNode[]): WBComponentEditableField[] {
  const fields: WBComponentEditableField[] = []
  const ALLOWLIST = ["title", "subtitle", "text", "buttonText", "ctaText", "ctaSecondaryText", "buttonHref", "ctaHref", "ctaSecondaryHref", "href"]

  const walk = (list: WBNode[]) => {
    for (const node of list) {
      if (node.componentNodeId) {
        for (const key of ALLOWLIST) {
          const value = node.props?.[key]
          if (typeof value === "string" && value.trim().length > 0) {
            fields.push({
              key: `${node.componentNodeId}:${key}`,
              label: `${node.type} • ${key}`,
              defaultValue: value,
            })
          }
        }
      }
      if (node.children?.length) walk(node.children as WBNode[])
    }
  }

  walk(nodes || [])
  return fields.slice(0, 24)
}

// ─────────────────────────────────────────────────────────
// Site CRUD
// ─────────────────────────────────────────────────────────

export async function getSite() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const site = await (prisma as any).wBSite.findUnique({
    where: { tenantId: session.user.tenantId },
    include: {
      theme: true,
      pages: { orderBy: { sortOrder: "asc" }, select: { id: true, title: true, slug: true, status: true, isHomepage: true, isPortalLogin: true, isLocked: true, sortOrder: true, updatedAt: true } },
      menus: { include: { items: { orderBy: { sortOrder: "asc" }, include: { children: { orderBy: { sortOrder: "asc" } } } } } },
    },
  })

  if (!site) return site

  const componentBlocks = await (prisma as any).wBBlock.findMany({
    where: { tenantId: session.user.tenantId, category: "component" },
    orderBy: { updatedAt: "desc" },
  })

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

  // Merge CMS-lite (legacy adapter) + persisted CMS collections
  const [liteCms, persistedCms] = await Promise.all([
    getCmsCollections(session.user.tenantId),
    getPersistedCmsAsRuntime(site.id),
  ])
  // Persisted collections come first; CMS-lite fills in any extras
  const seenIds = new Set(persistedCms.map((c: any) => c.id))
  const cmsCollections = [...persistedCms, ...liteCms.filter((c) => !seenIds.has(c.id))]

  return { ...site, components, cmsCollections }
}

export async function getReusableComponents() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const blocks = await (prisma as any).wBBlock.findMany({
    where: { tenantId: session.user.tenantId, category: "component" },
    orderBy: { updatedAt: "desc" },
  })

  return blocks.map((block: any) => {
    const payload = typeof block.content === "string" ? JSON.parse(block.content) : (block.content || {})
    return {
      id: block.id,
      name: block.name,
      sourceNodes: Array.isArray(payload.sourceNodes) ? payload.sourceNodes : [],
      editableFields: Array.isArray(payload.editableFields) ? payload.editableFields : [],
      createdAt: new Date(block.createdAt).getTime(),
    }
  })
}

export async function createReusableComponent(data: { name: string; sourceNodes: WBNode[] }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const name = data.name?.trim()
  if (!name) throw new Error("Component name is required")

  const normalizedSource = normalizeComponentSourceNodes(JSON.parse(JSON.stringify(data.sourceNodes || [])))
  const editableFields = collectEditableFields(normalizedSource)

  const block = await (prisma as any).wBBlock.create({
    data: {
      tenantId: session.user.tenantId,
      name,
      category: "component",
      content: {
        sourceNodes: normalizedSource,
        editableFields,
      },
      createdById: session.user.id,
    },
  })

  return {
    id: block.id,
    name: block.name,
    sourceNodes: normalizedSource,
    editableFields,
    createdAt: new Date(block.createdAt).getTime(),
  }
}

export async function deleteReusableComponent(componentId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const block = await (prisma as any).wBBlock.findUnique({ where: { id: componentId } })
  if (!block || block.tenantId !== session.user.tenantId) throw new Error("Component not found")

  await (prisma as any).wBBlock.delete({ where: { id: componentId } })
  return { success: true }
}

export async function createSite(data: { name: string; mode: "PORTAL_ONLY" | "FULL_WEBSITE" }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const existing = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId } })
  if (existing) throw new Error("Site already exists for this tenant")

  const tenant = await prisma.tenant.findUnique({ where: { id: session.user.tenantId }, select: { name: true, subdomain: true, primaryColor: true } })

  const site = await (prisma as any).wBSite.create({
    data: {
      tenantId: session.user.tenantId,
      name: data.name || tenant?.name || "My School Website",
      mode: data.mode,
      subdomain: tenant?.subdomain,
      theme: {
        create: {
          primaryColor: tenant?.primaryColor || "#4F46E5",
        },
      },
    },
    include: { theme: true },
  })

  // Create default pages based on mode
  if (data.mode === "PORTAL_ONLY") {
    await (prisma as any).wBPage.create({
      data: {
        siteId: site.id,
        title: "Portal Login",
        slug: "login",
        isPortalLogin: true,
        isLocked: true,
        isHomepage: true,
        content: JSON.stringify([
          {
            id: "portal-hero",
            type: "portalLogin",
            props: {
              title: `Welcome to ${tenant?.name || "Our School"}`,
              subtitle: "Sign in to your account",
              showRoleButtons: true,
              roles: ["Parent", "Teacher", "Student"],
              backgroundImage: "",
              showAnnouncements: true,
              showHelpLink: true,
              helpText: "Need help? Contact support",
              helpHref: "/contact",
            },
            children: [],
          },
        ]),
      },
    })
  } else {
    const defaultPages = [
      { title: "Home", slug: "home", isHomepage: true, sortOrder: 0, content: getDefaultHomeContent(tenant?.name || "Our School") },
      { title: "About", slug: "about", sortOrder: 1, content: getDefaultAboutContent() },
      { title: "Admissions", slug: "admissions", sortOrder: 2, content: getDefaultAdmissionsContent() },
      { title: "Contact", slug: "contact", sortOrder: 3, content: getDefaultContactContent() },
      { title: "Portal Login", slug: "login", isPortalLogin: true, isLocked: true, sortOrder: 10, content: getDefaultPortalContent(tenant?.name || "Our School") },
    ]

    for (const page of defaultPages) {
      await (prisma as any).wBPage.create({
        data: {
          siteId: site.id,
          title: page.title,
          slug: page.slug,
          isHomepage: page.isHomepage || false,
          isPortalLogin: page.isPortalLogin || false,
          isLocked: page.isLocked || false,
          sortOrder: page.sortOrder,
          content: JSON.stringify(page.content),
          createdById: session.user.id,
        },
      })
    }

    // Create default menus
    await (prisma as any).wBMenu.create({
      data: {
        siteId: site.id,
        location: "header",
        label: "Main Navigation",
        config: JSON.stringify({ layout: "left", sticky: true }),
        items: {
          create: [
            { label: "Home", pageSlug: "home", sortOrder: 0 },
            { label: "About", pageSlug: "about", sortOrder: 1 },
            { label: "Admissions", pageSlug: "admissions", sortOrder: 2 },
            { label: "Contact", pageSlug: "contact", sortOrder: 3 },
          ],
        },
      },
    })

    await (prisma as any).wBMenu.create({
      data: {
        siteId: site.id,
        location: "footer",
        label: "Footer Navigation",
        config: JSON.stringify({}),
        items: {
          create: [
            { label: "Home", pageSlug: "home", sortOrder: 0 },
            { label: "About", pageSlug: "about", sortOrder: 1 },
            { label: "Contact", pageSlug: "contact", sortOrder: 2 },
            { label: "Portal", pageSlug: "login", sortOrder: 3 },
          ],
        },
      },
    })
  }

  return site
}

export async function updateSite(data: {
  name?: string
  mode?: "PORTAL_ONLY" | "FULL_WEBSITE"
  customDomain?: string
  faviconUrl?: string
  ogImageUrl?: string
  metaTitle?: string
  metaDescription?: string
  analyticsId?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const site = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId } })
  if (!site) throw new Error("Site not found")

  return await (prisma as any).wBSite.update({
    where: { id: site.id },
    data,
  })
}

// ─────────────────────────────────────────────────────────
// Theme
// ─────────────────────────────────────────────────────────

export async function updateSiteTheme(data: Record<string, any>) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const site = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId }, select: { id: true } })
  if (!site) throw new Error("Site not found")

  return await (prisma as any).wBSiteTheme.upsert({
    where: { siteId: site.id },
    update: data,
    create: { siteId: site.id, ...data },
  })
}

// ─────────────────────────────────────────────────────────
// Pages CRUD
// ─────────────────────────────────────────────────────────

export async function getPage(pageId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const page = await (prisma as any).wBPage.findUnique({
    where: { id: pageId },
    include: { site: { select: { tenantId: true } } },
  })

  if (!page || page.site.tenantId !== session.user.tenantId) throw new Error("Page not found")
  return page
}

export async function createPage(data: { title: string; slug: string; description?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const site = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId } })
  if (!site) throw new Error("Site not found. Create a site first.")

  const slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")

  const existing = await (prisma as any).wBPage.findUnique({ where: { siteId_slug: { siteId: site.id, slug } } })
  if (existing) throw new Error("A page with this slug already exists")

  const maxOrder = await (prisma as any).wBPage.aggregate({ where: { siteId: site.id }, _max: { sortOrder: true } })

  return await (prisma as any).wBPage.create({
    data: {
      siteId: site.id,
      title: data.title,
      slug,
      description: data.description || null,
      sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      content: JSON.stringify([]),
      createdById: session.user.id,
    },
  })
}

export async function updatePage(pageId: string, data: {
  title?: string
  slug?: string
  description?: string
  metaTitle?: string
  metaDescription?: string
  sortOrder?: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const page = await (prisma as any).wBPage.findUnique({ where: { id: pageId }, include: { site: { select: { tenantId: true } } } })
  if (!page || page.site.tenantId !== session.user.tenantId) throw new Error("Page not found")

  return await (prisma as any).wBPage.update({ where: { id: pageId }, data })
}

export async function savePageContent(pageId: string, content: any[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const page = await (prisma as any).wBPage.findUnique({ where: { id: pageId }, include: { site: { select: { tenantId: true } } } })
  if (!page || page.site.tenantId !== session.user.tenantId) throw new Error("Page not found")
  if (page.isLocked && !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("This page is locked")

  return await (prisma as any).wBPage.update({
    where: { id: pageId },
    data: { content: JSON.stringify(content) },
  })
}

export async function publishPage(pageId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const page = await (prisma as any).wBPage.findUnique({ where: { id: pageId }, include: { site: { select: { tenantId: true } }, versions: { orderBy: { version: "desc" }, take: 1 } } })
  if (!page || page.site.tenantId !== session.user.tenantId) throw new Error("Page not found")

  const nextVersion = (page.versions[0]?.version || 0) + 1

  // Create version snapshot
  await (prisma as any).wBPageVersion.create({
    data: {
      pageId,
      version: nextVersion,
      content: page.content,
      createdById: session.user.id,
      message: `Published v${nextVersion}`,
    },
  })

  // Update page
  return await (prisma as any).wBPage.update({
    where: { id: pageId },
    data: {
      status: "PUBLISHED",
      publishedContent: page.content,
      publishedAt: new Date(),
    },
  })
}

export async function rollbackPage(pageId: string, versionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const version = await (prisma as any).wBPageVersion.findUnique({ where: { id: versionId }, include: { page: { include: { site: { select: { tenantId: true } } } } } })
  if (!version || version.page.site.tenantId !== session.user.tenantId) throw new Error("Version not found")

  return await (prisma as any).wBPage.update({
    where: { id: pageId },
    data: { content: version.content },
  })
}

export async function deletePage(pageId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const page = await (prisma as any).wBPage.findUnique({ where: { id: pageId }, include: { site: { select: { tenantId: true } } } })
  if (!page || page.site.tenantId !== session.user.tenantId) throw new Error("Page not found")
  if (page.isLocked) throw new Error("Cannot delete a locked page")

  return await (prisma as any).wBPage.delete({ where: { id: pageId } })
}

export async function getPageVersions(pageId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const page = await (prisma as any).wBPage.findUnique({ where: { id: pageId }, include: { site: { select: { tenantId: true } } } })
  if (!page || page.site.tenantId !== session.user.tenantId) throw new Error("Page not found")

  return await (prisma as any).wBPageVersion.findMany({
    where: { pageId },
    orderBy: { version: "desc" },
    take: 20,
  })
}

// ─────────────────────────────────────────────────────────
// Publish entire site
// ─────────────────────────────────────────────────────────

export async function publishSite() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const site = await (prisma as any).wBSite.findUnique({
    where: { tenantId: session.user.tenantId },
    include: { pages: true, theme: true, menus: { include: { items: true } } },
  })
  if (!site) throw new Error("Site not found")

  // Publish all draft pages
  for (const page of site.pages) {
    if (page.status === "DRAFT" || !page.publishedContent) {
      await (prisma as any).wBPage.update({
        where: { id: page.id },
        data: {
          status: "PUBLISHED",
          publishedContent: page.content,
          publishedAt: new Date(),
        },
      })
    }
  }

  // Create immutable version snapshot
  const lastVersion = await (prisma as any).wBSiteVersion.findFirst({
    where: { siteId: site.id },
    orderBy: { version: "desc" },
  })
  const nextVersion = (lastVersion?.version ?? 0) + 1

  const snapshot = {
    pages: site.pages.map((p: any) => ({ id: p.id, slug: p.slug, title: p.title, content: p.content, pageType: p.pageType, cmsCollectionId: p.cmsCollectionId })),
    theme: site.theme,
    menus: site.menus,
  }

  const version = await (prisma as any).wBSiteVersion.create({
    data: {
      siteId: site.id,
      version: nextVersion,
      snapshot,
      createdById: session.user.id,
    },
  })

  return await (prisma as any).wBSite.update({
    where: { id: site.id },
    data: {
      isPublished: true,
      publishedAt: new Date(),
      latestVersionId: version.id,
      activeVersionId: version.id,
    },
  })
}

export async function getSiteVersions() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const site = await (prisma as any).wBSite.findUnique({
    where: { tenantId: session.user.tenantId },
    select: { id: true, activeVersionId: true, latestVersionId: true },
  })
  if (!site) return []

  const versions = await (prisma as any).wBSiteVersion.findMany({
    where: { siteId: site.id },
    orderBy: { version: "desc" },
    take: 50,
    select: { id: true, version: true, label: true, createdById: true, createdAt: true },
  })

  return versions.map((v: any) => ({
    ...v,
    isActive: v.id === site.activeVersionId,
    isLatest: v.id === site.latestVersionId,
    createdAt: v.createdAt.toISOString(),
  }))
}

export async function rollbackToVersion(versionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const site = await (prisma as any).wBSite.findUnique({
    where: { tenantId: session.user.tenantId },
  })
  if (!site) throw new Error("Site not found")

  const version = await (prisma as any).wBSiteVersion.findUnique({ where: { id: versionId } })
  if (!version || version.siteId !== site.id) throw new Error("Version not found")

  const snapshot = typeof version.snapshot === "string" ? JSON.parse(version.snapshot) : version.snapshot

  // Restore pages from snapshot
  if (Array.isArray(snapshot.pages)) {
    for (const sp of snapshot.pages) {
      await (prisma as any).wBPage.updateMany({
        where: { id: sp.id, siteId: site.id },
        data: {
          content: sp.content,
          publishedContent: sp.content,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      })
    }
  }

  return await (prisma as any).wBSite.update({
    where: { id: site.id },
    data: { activeVersionId: versionId },
  })
}

// ─────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────

export async function getTemplates(mode?: string) {
  const where: any = {}
  if (mode) where.mode = mode

  return await (prisma as any).wBTemplate.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  })
}

export async function applyTemplate(templateId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const template = await (prisma as any).wBTemplate.findUnique({ where: { id: templateId } })
  if (!template) throw new Error("Template not found")

  const site = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId } })
  if (!site) throw new Error("Site not found")

  // Apply theme
  if (template.theme) {
    await (prisma as any).wBSiteTheme.upsert({
      where: { siteId: site.id },
      update: typeof template.theme === "string" ? JSON.parse(template.theme) : template.theme,
      create: { siteId: site.id, ...(typeof template.theme === "string" ? JSON.parse(template.theme) : template.theme) },
    })
  }

  // Delete existing non-locked pages
  await (prisma as any).wBPage.deleteMany({ where: { siteId: site.id, isLocked: false } })

  // Create pages from template (skip if slug already exists from a locked page)
  const pages = typeof template.pages === "string" ? JSON.parse(template.pages) : template.pages
  for (const page of pages) {
    const slug = page.slug || page.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")
    const existing = await (prisma as any).wBPage.findUnique({
      where: { siteId_slug: { siteId: site.id, slug } },
    })
    if (existing) {
      // Update the existing locked page content instead of creating a duplicate
      await (prisma as any).wBPage.update({
        where: { id: existing.id },
        data: {
          content: JSON.stringify(page.content || []),
          templateId: template.id,
        },
      })
    } else {
      await (prisma as any).wBPage.create({
        data: {
          siteId: site.id,
          title: page.title,
          slug,
          isHomepage: page.isHomepage || false,
          isPortalLogin: page.isPortalLogin || false,
          sortOrder: page.sortOrder || 0,
          content: JSON.stringify(page.content || []),
          createdById: session.user.id,
          templateId: template.id,
        },
      })
    }
  }

  return { success: true }
}

/** Apply only the theme from a template without touching page content */
export async function applyTemplateThemeOnly(templateId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const template = await (prisma as any).wBTemplate.findUnique({ where: { id: templateId } })
  if (!template) throw new Error("Template not found")

  const site = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId } })
  if (!site) throw new Error("Site not found")

  if (template.theme) {
    const themeData = typeof template.theme === "string" ? JSON.parse(template.theme) : template.theme
    await (prisma as any).wBSiteTheme.upsert({
      where: { siteId: site.id },
      update: themeData,
      create: { siteId: site.id, ...themeData },
    })
  }

  return { success: true }
}

/** Apply template and add only missing sections to existing pages (non-destructive merge) */
export async function applyTemplateMerge(templateId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const template = await (prisma as any).wBTemplate.findUnique({ where: { id: templateId } })
  if (!template) throw new Error("Template not found")

  const site = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId } })
  if (!site) throw new Error("Site not found")

  // Apply theme non-destructively
  if (template.theme) {
    const themeData = typeof template.theme === "string" ? JSON.parse(template.theme) : template.theme
    await (prisma as any).wBSiteTheme.upsert({
      where: { siteId: site.id },
      update: themeData,
      create: { siteId: site.id, ...themeData },
    })
  }

  // Only create pages that don't already exist (never delete or overwrite)
  const pages = typeof template.pages === "string" ? JSON.parse(template.pages) : template.pages
  for (const page of pages) {
    const slug = page.slug || page.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")
    const existing = await (prisma as any).wBPage.findUnique({
      where: { siteId_slug: { siteId: site.id, slug } },
    })
    if (!existing) {
      await (prisma as any).wBPage.create({
        data: {
          siteId: site.id,
          title: page.title,
          slug,
          isHomepage: false,
          isPortalLogin: page.isPortalLogin || false,
          sortOrder: page.sortOrder || 99,
          content: JSON.stringify(page.content || []),
          createdById: session.user.id,
          templateId: template.id,
        },
      })
    }
  }

  return { success: true }
}

// ─────────────────────────────────────────────────────────
// Menus
// ─────────────────────────────────────────────────────────

export async function getMenus() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const site = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId } })
  if (!site) return []

  return await (prisma as any).wBMenu.findMany({
    where: { siteId: site.id },
    include: {
      items: {
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
        include: { children: { orderBy: { sortOrder: "asc" } } },
      },
    },
  })
}

export async function createMenuItem(menuId: string, data: { label: string; href?: string; pageSlug?: string; target?: string; parentId?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const maxOrder = await (prisma as any).wBMenuItem.aggregate({
    where: { menuId, parentId: data.parentId || null },
    _max: { sortOrder: true },
  })

  return await (prisma as any).wBMenuItem.create({
    data: {
      menuId,
      label: data.label,
      href: data.href || null,
      pageSlug: data.pageSlug || null,
      target: data.target || "_self",
      parentId: data.parentId || null,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  })
}

export async function updateMenuItem(itemId: string, data: { label?: string; href?: string; pageSlug?: string; target?: string; isVisible?: boolean }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  return await (prisma as any).wBMenuItem.update({
    where: { id: itemId },
    data: {
      ...(data.label !== undefined && { label: data.label }),
      ...(data.href !== undefined && { href: data.href || null }),
      ...(data.pageSlug !== undefined && { pageSlug: data.pageSlug || null }),
      ...(data.target !== undefined && { target: data.target }),
      ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
    },
  })
}

export async function deleteMenuItem(itemId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  return await (prisma as any).wBMenuItem.delete({ where: { id: itemId } })
}

export async function reorderMenuItems(menuId: string, itemIds: string[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  for (let i = 0; i < itemIds.length; i++) {
    await (prisma as any).wBMenuItem.update({
      where: { id: itemIds[i] },
      data: { sortOrder: i },
    })
  }
  return { success: true }
}

export async function createMenu(location: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const site = await (prisma as any).wBSite.findUnique({ where: { tenantId: session.user.tenantId } })
  if (!site) throw new Error("Site not found")

  return await (prisma as any).wBMenu.create({
    data: {
      siteId: site.id,
      location,
      label: location === "header" ? "Header Navigation" : "Footer Navigation",
    },
  })
}

// ─────────────────────────────────────────────────────────
// Default page content generators
// ─────────────────────────────────────────────────────────

function getDefaultHomeContent(schoolName: string) {
  return [
    {
      id: "hero-1",
      type: "hero",
      props: {
        title: `Welcome to ${schoolName}`,
        subtitle: "Nurturing young minds for a brighter future. Discover excellence in education.",
        ctaText: "Apply Now",
        ctaHref: "/admissions",
        ctaSecondaryText: "Learn More",
        ctaSecondaryHref: "/about",
        backgroundImage: "",
        overlay: true,
        overlayColor: "rgba(0,0,0,0.4)",
        align: "center",
        minHeight: "min-h-[600px]",
        layout: "centered",
      },
      children: [],
    },
    {
      id: "stats-1",
      type: "stats",
      props: {
        items: [
          { value: "500+", label: "Students" },
          { value: "50+", label: "Teachers" },
          { value: "98%", label: "Pass Rate" },
          { value: "15+", label: "Years" },
        ],
        background: "primary",
      },
      children: [],
    },
    {
      id: "features-1",
      type: "features",
      props: {
        title: "Why Choose Us",
        subtitle: "We provide the best education for your children",
        columns: 3,
        items: [
          { icon: "GraduationCap", title: "Expert Teachers", description: "Qualified and experienced educators dedicated to your child's success" },
          { icon: "BookOpen", title: "Modern Curriculum", description: "Up-to-date learning materials aligned with international standards" },
          { icon: "Users", title: "Small Classes", description: "Personalized attention with optimal student-to-teacher ratios" },
          { icon: "Trophy", title: "Excellence", description: "Consistently ranked among the top schools in the region" },
          { icon: "Heart", title: "Safe Environment", description: "A nurturing and secure space for children to learn and grow" },
          { icon: "Globe", title: "Global Perspective", description: "Preparing students to be responsible global citizens" },
        ],
      },
      children: [],
    },
    {
      id: "cta-1",
      type: "cta",
      props: {
        title: "Ready to Join Our Community?",
        subtitle: "Applications are now open for the upcoming academic year",
        buttonText: "Start Application",
        buttonHref: "/admissions",
        background: "gradient",
      },
      children: [],
    },
    {
      id: "testimonials-1",
      type: "testimonials",
      props: {
        title: "What Parents Say",
        items: [
          { quote: "The best decision we made for our children's education.", author: "Sarah Johnson", role: "Parent", avatar: "" },
          { quote: "Excellent teachers and a wonderful learning environment.", author: "Michael Chen", role: "Parent", avatar: "" },
          { quote: "Our child has thrived since joining this school.", author: "Emily Williams", role: "Parent", avatar: "" },
        ],
        layout: "grid",
      },
      children: [],
    },
  ]
}

function getDefaultAboutContent() {
  return [
    {
      id: "about-hero",
      type: "section",
      props: { paddingY: "py-16", background: "transparent", fullWidth: false, paddingX: "px-4", maxWidth: "max-w-7xl", backgroundImage: "", overlay: false, overlayColor: "", id: "" },
      children: [
        { id: "about-h1", type: "heading", props: { text: "About Our School", level: "h1", align: "center", color: "" }, children: [] },
        { id: "about-p1", type: "paragraph", props: { text: "Founded with a vision to provide world-class education, our school has been a beacon of learning excellence for over a decade. We believe every child deserves the opportunity to reach their full potential.", align: "center", color: "", size: "lg" }, children: [] },
      ],
    },
    {
      id: "about-timeline",
      type: "timeline",
      props: {
        title: "Our Journey",
        items: [
          { year: "2010", title: "Founded", description: "School established with a vision for excellence" },
          { year: "2015", title: "Expansion", description: "New campus opened with modern facilities" },
          { year: "2020", title: "Recognition", description: "Ranked among top schools in the region" },
        ],
      },
      children: [],
    },
    {
      id: "about-team",
      type: "team",
      props: {
        title: "Our Leadership",
        subtitle: "Meet the dedicated professionals guiding our school",
        columns: 3,
        members: [
          { name: "Dr. Sarah Johnson", role: "Principal", image: "", bio: "20+ years in education" },
          { name: "Mr. James Williams", role: "Vice Principal", image: "", bio: "Curriculum specialist" },
          { name: "Mrs. Emily Chen", role: "Head of Admissions", image: "", bio: "Student welfare expert" },
        ],
      },
      children: [],
    },
  ]
}

function getDefaultAdmissionsContent() {
  return [
    {
      id: "adm-hero",
      type: "hero",
      props: {
        title: "Admissions",
        subtitle: "Begin your child's journey with us. Applications are now open.",
        ctaText: "Apply Online",
        ctaHref: "#apply",
        ctaSecondaryText: "",
        ctaSecondaryHref: "",
        backgroundImage: "",
        overlay: true,
        overlayColor: "rgba(0,0,0,0.4)",
        align: "center",
        minHeight: "min-h-[400px]",
        layout: "centered",
      },
      children: [],
    },
    {
      id: "adm-pricing",
      type: "pricing",
      props: {
        title: "Tuition & Fees",
        subtitle: "Transparent pricing for all programs",
        items: [
          { name: "Nursery", price: "$500/term", features: ["Full day care", "Meals included", "Activity kits"], highlighted: false },
          { name: "Primary", price: "$800/term", features: ["Core subjects", "Extra-curricular", "Field trips"], highlighted: true },
          { name: "Secondary", price: "$1,200/term", features: ["Full curriculum", "Lab access", "Career guidance"], highlighted: false },
        ],
      },
      children: [],
    },
    {
      id: "adm-faq",
      type: "faq",
      props: {
        title: "Admissions FAQ",
        items: [
          { question: "What is the admission process?", answer: "Fill out the online application, attend an interview, and submit required documents." },
          { question: "What documents are required?", answer: "Birth certificate, previous school records, passport photos, and immunization records." },
          { question: "Is financial aid available?", answer: "Yes, we offer merit-based scholarships and need-based financial assistance." },
        ],
      },
      children: [],
    },
  ]
}

function getDefaultContactContent() {
  return [
    {
      id: "contact-section",
      type: "contact",
      props: {
        title: "Contact Us",
        address: "123 School Street, City, Country",
        phone: "+1 234 567 890",
        email: "info@school.edu",
        mapEmbed: "",
        showForm: true,
      },
      children: [],
    },
  ]
}

function getDefaultPortalContent(schoolName: string) {
  return [
    {
      id: "portal-login",
      type: "portalLogin",
      props: {
        title: `Welcome to ${schoolName}`,
        subtitle: "Sign in to your account",
        showRoleButtons: true,
        roles: ["Parent", "Teacher", "Student"],
        backgroundImage: "",
        showAnnouncements: true,
        showHelpLink: true,
        helpText: "Need help? Contact support",
        helpHref: "/contact",
      },
      children: [],
    },
  ]
}

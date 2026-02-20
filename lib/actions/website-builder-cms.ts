"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import type {
  WBCmsCollectionData,
  WBCmsFieldDef,
  WBCmsItemData,
  WBCmsFieldType,
  WBCmsItemStatus,
} from "@/lib/website-builder/types"

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")
  return session
}

async function requireSite() {
  const session = await requireAdmin()
  const site = await (prisma as any).wBSite.findUnique({
    where: { tenantId: session.user.tenantId },
    select: { id: true },
  })
  if (!site) throw new Error("Site not found. Create a site first.")
  return { session, siteId: site.id as string }
}

function serializeDate(d: Date | null | undefined): string | null {
  return d ? d.toISOString() : null
}

// ─────────────────────────────────────────────────────────
// Collections
// ─────────────────────────────────────────────────────────

export async function getCmsCollections(): Promise<WBCmsCollectionData[]> {
  const { siteId } = await requireSite()

  const collections = await (prisma as any).wBCmsCollection.findMany({
    where: { siteId },
    orderBy: { sortOrder: "asc" },
    include: {
      fields: { orderBy: { sortOrder: "asc" } },
      items: { orderBy: { createdAt: "desc" } },
    },
  })

  return collections.map((c: any) => ({
    id: c.id,
    siteId: c.siteId,
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sortOrder,
    fields: c.fields.map((f: any) => ({
      id: f.id,
      collectionId: f.collectionId,
      fieldId: f.fieldId,
      name: f.name,
      type: f.type as WBCmsFieldType,
      isRequired: f.isRequired,
      isTitle: f.isTitle,
      isSlugSource: f.isSlugSource,
      options: f.options,
      defaultValue: f.defaultValue,
      sortOrder: f.sortOrder,
    })) as WBCmsFieldDef[],
    items: c.items.map((i: any) => ({
      id: i.id,
      collectionId: i.collectionId,
      slug: i.slug,
      status: i.status as WBCmsItemStatus,
      fieldData: i.fieldData ?? {},
      publishedFieldData: i.publishedFieldData,
      publishedAt: serializeDate(i.publishedAt),
      createdById: i.createdById,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    })) as WBCmsItemData[],
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))
}

export async function getCmsCollection(collectionId: string): Promise<WBCmsCollectionData | null> {
  await requireAdmin()

  const c = await (prisma as any).wBCmsCollection.findUnique({
    where: { id: collectionId },
    include: {
      fields: { orderBy: { sortOrder: "asc" } },
      items: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!c) return null

  return {
    id: c.id,
    siteId: c.siteId,
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sortOrder,
    fields: c.fields.map((f: any) => ({
      id: f.id,
      collectionId: f.collectionId,
      fieldId: f.fieldId,
      name: f.name,
      type: f.type as WBCmsFieldType,
      isRequired: f.isRequired,
      isTitle: f.isTitle,
      isSlugSource: f.isSlugSource,
      options: f.options,
      defaultValue: f.defaultValue,
      sortOrder: f.sortOrder,
    })),
    items: c.items.map((i: any) => ({
      id: i.id,
      collectionId: i.collectionId,
      slug: i.slug,
      status: i.status as WBCmsItemStatus,
      fieldData: i.fieldData ?? {},
      publishedFieldData: i.publishedFieldData,
      publishedAt: serializeDate(i.publishedAt),
      createdById: i.createdById,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    })),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }
}

export async function createCmsCollection(data: {
  name: string
  slug?: string
  description?: string
}) {
  const { siteId } = await requireSite()

  const slug = data.slug?.trim() || slugify(data.name)

  const collection = await (prisma as any).wBCmsCollection.create({
    data: {
      siteId,
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
    },
  })

  return collection
}

export async function updateCmsCollection(
  collectionId: string,
  data: { name?: string; slug?: string; description?: string; sortOrder?: number }
) {
  await requireAdmin()

  const update: Record<string, any> = {}
  if (data.name !== undefined) update.name = data.name.trim()
  if (data.slug !== undefined) update.slug = data.slug.trim()
  if (data.description !== undefined) update.description = data.description.trim() || null
  if (data.sortOrder !== undefined) update.sortOrder = data.sortOrder

  return await (prisma as any).wBCmsCollection.update({
    where: { id: collectionId },
    data: update,
  })
}

export async function deleteCmsCollection(collectionId: string) {
  await requireAdmin()
  return await (prisma as any).wBCmsCollection.delete({ where: { id: collectionId } })
}

// ─────────────────────────────────────────────────────────
// Fields
// ─────────────────────────────────────────────────────────

export async function addCmsField(
  collectionId: string,
  data: {
    name: string
    fieldId?: string
    type?: WBCmsFieldType
    isRequired?: boolean
    isTitle?: boolean
    isSlugSource?: boolean
    options?: any
    defaultValue?: string
  }
) {
  await requireAdmin()

  const fieldId = data.fieldId?.trim() || slugify(data.name).replace(/-/g, "_")

  const maxSort = await (prisma as any).wBCmsField.aggregate({
    where: { collectionId },
    _max: { sortOrder: true },
  })

  return await (prisma as any).wBCmsField.create({
    data: {
      collectionId,
      fieldId,
      name: data.name.trim(),
      type: data.type || "STRING",
      isRequired: data.isRequired ?? false,
      isTitle: data.isTitle ?? false,
      isSlugSource: data.isSlugSource ?? false,
      options: data.options ?? undefined,
      defaultValue: data.defaultValue ?? null,
      sortOrder: (maxSort._max?.sortOrder ?? -1) + 1,
    },
  })
}

export async function updateCmsField(
  fieldDbId: string,
  data: {
    name?: string
    type?: WBCmsFieldType
    isRequired?: boolean
    isTitle?: boolean
    isSlugSource?: boolean
    options?: any
    defaultValue?: string | null
    sortOrder?: number
  }
) {
  await requireAdmin()

  const update: Record<string, any> = {}
  if (data.name !== undefined) update.name = data.name.trim()
  if (data.type !== undefined) update.type = data.type
  if (data.isRequired !== undefined) update.isRequired = data.isRequired
  if (data.isTitle !== undefined) update.isTitle = data.isTitle
  if (data.isSlugSource !== undefined) update.isSlugSource = data.isSlugSource
  if (data.options !== undefined) update.options = data.options
  if (data.defaultValue !== undefined) update.defaultValue = data.defaultValue
  if (data.sortOrder !== undefined) update.sortOrder = data.sortOrder

  return await (prisma as any).wBCmsField.update({
    where: { id: fieldDbId },
    data: update,
  })
}

export async function deleteCmsField(fieldDbId: string) {
  await requireAdmin()
  return await (prisma as any).wBCmsField.delete({ where: { id: fieldDbId } })
}

export async function reorderCmsFields(collectionId: string, orderedFieldIds: string[]) {
  await requireAdmin()

  const updates = orderedFieldIds.map((id, index) =>
    (prisma as any).wBCmsField.update({ where: { id }, data: { sortOrder: index } })
  )
  await (prisma as any).$transaction(updates)
}

// ─────────────────────────────────────────────────────────
// Items
// ─────────────────────────────────────────────────────────

export async function getCmsItems(
  collectionId: string,
  opts?: { status?: WBCmsItemStatus; limit?: number; offset?: number }
): Promise<WBCmsItemData[]> {
  await requireAdmin()

  const where: Record<string, any> = { collectionId }
  if (opts?.status) where.status = opts.status

  const items = await (prisma as any).wBCmsItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: opts?.limit || 200,
    skip: opts?.offset || 0,
  })

  return items.map((i: any) => ({
    id: i.id,
    collectionId: i.collectionId,
    slug: i.slug,
    status: i.status as WBCmsItemStatus,
    fieldData: i.fieldData ?? {},
    publishedFieldData: i.publishedFieldData,
    publishedAt: serializeDate(i.publishedAt),
    createdById: i.createdById,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }))
}

export async function createCmsItem(
  collectionId: string,
  data: { slug?: string; fieldData: Record<string, any>; status?: WBCmsItemStatus }
) {
  const session = await requireAdmin()

  // Auto-generate slug from title field if not provided
  let slug = data.slug?.trim()
  if (!slug) {
    const fields = await (prisma as any).wBCmsField.findMany({
      where: { collectionId },
      orderBy: { sortOrder: "asc" },
    })
    const slugField = fields.find((f: any) => f.isSlugSource) || fields.find((f: any) => f.isTitle)
    const slugSource = slugField ? data.fieldData[slugField.fieldId] : null
    slug = slugSource ? slugify(String(slugSource)) : `item-${Date.now()}`
  }

  // Ensure slug uniqueness
  const existing = await (prisma as any).wBCmsItem.findUnique({
    where: { collectionId_slug: { collectionId, slug } },
  })
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const status = data.status || "DRAFT"

  return await (prisma as any).wBCmsItem.create({
    data: {
      collectionId,
      slug,
      status,
      fieldData: data.fieldData,
      publishedFieldData: status === "PUBLISHED" ? data.fieldData : undefined,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      createdById: session.user.id,
    },
  })
}

export async function updateCmsItem(
  itemId: string,
  data: { slug?: string; fieldData?: Record<string, any>; status?: WBCmsItemStatus }
) {
  await requireAdmin()

  const update: Record<string, any> = {}
  if (data.slug !== undefined) update.slug = data.slug.trim()
  if (data.fieldData !== undefined) update.fieldData = data.fieldData
  if (data.status !== undefined) update.status = data.status

  return await (prisma as any).wBCmsItem.update({
    where: { id: itemId },
    data: update,
  })
}

export async function publishCmsItem(itemId: string) {
  await requireAdmin()

  const item = await (prisma as any).wBCmsItem.findUnique({ where: { id: itemId } })
  if (!item) throw new Error("Item not found")

  return await (prisma as any).wBCmsItem.update({
    where: { id: itemId },
    data: {
      status: "PUBLISHED",
      publishedFieldData: item.fieldData,
      publishedAt: new Date(),
    },
  })
}

export async function unpublishCmsItem(itemId: string) {
  await requireAdmin()

  return await (prisma as any).wBCmsItem.update({
    where: { id: itemId },
    data: {
      status: "DRAFT",
    },
  })
}

export async function deleteCmsItem(itemId: string) {
  await requireAdmin()
  return await (prisma as any).wBCmsItem.delete({ where: { id: itemId } })
}

export async function bulkDeleteCmsItems(itemIds: string[]) {
  await requireAdmin()
  return await (prisma as any).wBCmsItem.deleteMany({ where: { id: { in: itemIds } } })
}

export async function bulkPublishCmsItems(itemIds: string[]) {
  await requireAdmin()

  const items = await (prisma as any).wBCmsItem.findMany({
    where: { id: { in: itemIds } },
  })

  const updates = items.map((item: any) =>
    (prisma as any).wBCmsItem.update({
      where: { id: item.id },
      data: {
        status: "PUBLISHED",
        publishedFieldData: item.fieldData,
        publishedAt: new Date(),
      },
    })
  )

  await (prisma as any).$transaction(updates)
}

// ─────────────────────────────────────────────────────────
// Adapter: convert persisted CMS to runtime WBCmsCollection shape
// ─────────────────────────────────────────────────────────

export async function getPersistedCmsAsRuntime(siteId: string) {
  const collections = await (prisma as any).wBCmsCollection.findMany({
    where: { siteId },
    orderBy: { sortOrder: "asc" },
    include: {
      fields: { orderBy: { sortOrder: "asc" } },
      items: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } },
    },
  })

  return collections.map((c: any) => ({
    id: c.id,
    label: c.name,
    description: c.description || undefined,
    fields: c.fields.map((f: any) => ({
      key: f.fieldId,
      label: f.name,
    })),
    items: c.items.map((i: any) => {
      const fd = i.publishedFieldData ?? i.fieldData ?? {}
      return { ...fd, _id: i.id, _slug: i.slug }
    }),
  }))
}

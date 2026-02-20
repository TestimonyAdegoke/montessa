import { prisma } from "@/lib/prisma"
import type { WBCmsCollection } from "./types"

// ─────────────────────────────────────────────────────────
// CMS-Lite: Fetch lightweight collections from school data
// for use in the website builder renderer at runtime.
// ─────────────────────────────────────────────────────────

export async function getCmsCollections(tenantId: string): Promise<WBCmsCollection[]> {
  const [announcements, events, teachers] = await Promise.all([
    (prisma as any).announcement.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        content: true,
        priority: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    (prisma as any).event.findMany({
      where: { tenantId },
      orderBy: { startDate: "asc" },
      take: 50,
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    }),
    (prisma as any).teacher.findMany({
      where: { User: { tenantId } },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        department: true,
        specialization: true,
        qualification: true,
        experience: true,
        User: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    }),
  ])

  return [
    {
      id: "announcements",
      label: "Announcements",
      description: "School announcements and notices",
      fields: [
        { key: "title", label: "Title" },
        { key: "description", label: "Description" },
        { key: "date", label: "Date" },
        { key: "priority", label: "Priority" },
      ],
      items: announcements.map((a: any) => ({
        id: a.id,
        title: a.title,
        name: a.title,
        description: a.content,
        content: a.content,
        date: a.publishedAt || a.createdAt,
        priority: a.priority,
      })),
    },
    {
      id: "events",
      label: "Events",
      description: "Upcoming and scheduled events",
      fields: [
        { key: "title", label: "Title" },
        { key: "description", label: "Description" },
        { key: "date", label: "Date" },
        { key: "location", label: "Location" },
      ],
      items: events.map((e: any) => ({
        id: e.id,
        title: e.title,
        name: e.title,
        description: e.description || "",
        content: e.description || "",
        date: e.startDate,
        startDate: e.startDate,
        endDate: e.endDate,
        location: e.location || "",
        type: e.type,
        status: e.status,
      })),
    },
    {
      id: "staff",
      label: "Staff",
      description: "Teachers and key staff profiles",
      fields: [
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "image", label: "Image" },
        { key: "bio", label: "Bio" },
      ],
      items: teachers.map((t: any) => ({
        id: t.id,
        name: t.User?.name || "Staff Member",
        title: t.User?.name || "Staff Member",
        role: t.specialization || t.department || "Teacher",
        department: t.department || "",
        image: t.User?.image || "",
        bio: t.qualification ? `${t.qualification}${t.experience ? ` · ${t.experience} years experience` : ""}` : "",
        quote: "",
        author: t.User?.name || "Staff Member",
        value: t.User?.name || "Staff Member",
        label: t.specialization || t.department || "Teacher",
      })),
    },
  ]
}

// ─────────────────────────────────────────────────────────
// Resolve CMS binding: given a node's cmsCollection id and
// field map, return the items array with fields mapped to
// the shape the block type expects.
// ─────────────────────────────────────────────────────────

export function resolveCmsBinding(
  collections: WBCmsCollection[],
  collectionId: string,
  fieldMap: Record<string, string>,
  limit?: number,
): Record<string, any>[] {
  const collection = collections.find((c) => c.id === collectionId)
  if (!collection) return []

  let items = collection.items
  if (limit && limit > 0) items = items.slice(0, limit)

  return items.map((item) => {
    const mapped: Record<string, any> = {}
    for (const [blockField, cmsField] of Object.entries(fieldMap)) {
      mapped[blockField] = item[cmsField] ?? ""
    }
    return mapped
  })
}

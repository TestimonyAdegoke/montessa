"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// PTA tools use CommunityPost model with type="PTA_MEETING" | "PTA_VOTE" | "PTA_FUNDRAISER"

export async function getPTAItems() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const items = await (prisma.communityPost as any).findMany({
    where: {
      tenantId: session.user.tenantId,
      type: { in: ["PTA_MEETING", "PTA_VOTE", "PTA_FUNDRAISER"] },
    },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true, email: true } } },
  })

  return items
}

export async function createPTAMeeting(data: {
  title: string
  content: string
  meetingDate: string
  location: string
  agenda: string[]
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "GUARDIAN"].includes(session.user.role)) {
    throw new Error("Forbidden")
  }

  const post = await (prisma.communityPost as any).create({
    data: {
      tenantId: session.user.tenantId,
      authorId: session.user.id,
      type: "PTA_MEETING",
      title: data.title,
      content: data.content,
      metadata: { meetingDate: data.meetingDate, location: data.location, agenda: data.agenda },
      visibility: "PARENTS",
    },
  })

  revalidatePath("/dashboard/pta")
  return post
}

export async function createPTAVote(data: {
  title: string
  content: string
  options: string[]
  deadline: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const post = await (prisma.communityPost as any).create({
    data: {
      tenantId: session.user.tenantId,
      authorId: session.user.id,
      type: "PTA_VOTE",
      title: data.title,
      content: data.content,
      metadata: { options: data.options, deadline: data.deadline, votes: {} },
      visibility: "PARENTS",
    },
  })

  revalidatePath("/dashboard/pta")
  return post
}

export async function castPTAVote(postId: string, option: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const post = await (prisma.communityPost as any).findUnique({ where: { id: postId } })
  if (!post) throw new Error("Not found")

  const metadata = (post as any).metadata || {}
  const votes = metadata.votes || {}
  votes[session.user.id] = option

  await (prisma.communityPost as any).update({
    where: { id: postId },
    data: { metadata: { ...metadata, votes } },
  })

  revalidatePath("/dashboard/pta")
}

export async function createPTAFundraiser(data: {
  title: string
  content: string
  goalAmount: number
  deadline: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const post = await (prisma.communityPost as any).create({
    data: {
      tenantId: session.user.tenantId,
      authorId: session.user.id,
      type: "PTA_FUNDRAISER",
      title: data.title,
      content: data.content,
      metadata: { goalAmount: data.goalAmount, deadline: data.deadline, raisedAmount: 0, donors: [] },
      visibility: "PARENTS",
    },
  })

  revalidatePath("/dashboard/pta")
  return post
}

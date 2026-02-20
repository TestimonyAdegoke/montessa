"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCommunityFeed(page = 1, limit = 20) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const skip = (page - 1) * limit

  const posts = await prisma.communityPost.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    skip,
    take: limit,
    include: {
      PostComment: {
        orderBy: { createdAt: "asc" },
        take: 5,
      },
      PostLike: {
        where: { userId: session.user.id },
        select: { id: true },
      },
    },
  })

  const total = await prisma.communityPost.count({
    where: { tenantId: session.user.tenantId },
  })

  // Fetch author names for posts and comments
  const authorIds = new Set<string>()
  posts.forEach((p) => {
    authorIds.add(p.authorId)
    ;(p as any).PostComment?.forEach((c: any) => authorIds.add(c.authorId))
  })

  const authors = await prisma.user.findMany({
    where: { id: { in: Array.from(authorIds) } },
    select: { id: true, name: true, image: true, role: true },
  })

  const authorMap = new Map(authors.map((a) => [a.id, a]))

  const enrichedPosts = posts.map((post) => ({
    ...post,
    author: authorMap.get(post.authorId) || { id: post.authorId, name: "Unknown", image: null, role: "TEACHER" },
    isLiked: (post as any).PostLike?.length > 0,
    comments: ((post as any).PostComment || []).map((c: any) => ({
      ...c,
      author: authorMap.get(c.authorId) || { id: c.authorId, name: "Unknown", image: null, role: "TEACHER" },
    })),
  }))

  return { posts: enrichedPosts, total, pages: Math.ceil(total / limit) }
}

export async function createCommunityPost(data: {
  content: string
  images?: string[]
  videos?: string[]
  postType?: string
  visibility?: string
  targetClassIds?: string[]
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const post = await prisma.communityPost.create({
    data: {
      tenantId: session.user.tenantId,
      authorId: session.user.id,
      content: data.content,
      images: data.images || [],
      videos: data.videos || [],
      postType: (data.postType as any) || "GENERAL",
      visibility: (data.visibility as any) || "SCHOOL_WIDE",
      targetClassIds: data.targetClassIds || [],
    },
  })

  // Create notification for school-wide posts
  if (data.visibility === "SCHOOL_WIDE" || !data.visibility) {
    const users = await prisma.user.findMany({
      where: { tenantId: session.user.tenantId, id: { not: session.user.id }, isActive: true },
      select: { id: true },
    })

    if (users.length > 0) {
      await prisma.notification.createMany({
        data: users.map((u) => ({
          tenantId: session.user.tenantId,
          recipientId: u.id,
          title: "New Community Post",
          body: data.content.substring(0, 100) + (data.content.length > 100 ? "..." : ""),
          type: "INFO" as any,
          category: "COMMUNITY" as any,
          channels: ["IN_APP"],
          actionUrl: "/dashboard/community",
        })),
      })
    }
  }

  revalidatePath("/dashboard/community")
  return post
}

export async function toggleLike(postId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  })

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } })
    await prisma.communityPost.update({
      where: { id: postId },
      data: { likesCount: { decrement: 1 } },
    })
    revalidatePath("/dashboard/community")
    return { liked: false }
  } else {
    await prisma.postLike.create({
      data: { postId, userId: session.user.id },
    })
    await prisma.communityPost.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    })
    revalidatePath("/dashboard/community")
    return { liked: true }
  }
}

export async function addComment(postId: string, content: string, parentId?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const comment = await prisma.postComment.create({
    data: {
      postId,
      authorId: session.user.id,
      content,
      parentId: parentId || null,
    },
  })

  await prisma.communityPost.update({
    where: { id: postId },
    data: { commentsCount: { increment: 1 } },
  })

  // Notify post author
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { authorId: true, tenantId: true },
  })

  if (post && post.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        tenantId: post.tenantId,
        recipientId: post.authorId,
        title: "New Comment on Your Post",
        body: `${session.user.name || "Someone"} commented: "${content.substring(0, 80)}"`,
        type: "INFO",
        category: "COMMUNITY",
        channels: ["IN_APP"],
        actionUrl: "/dashboard/community",
      },
    })
  }

  revalidatePath("/dashboard/community")
  return comment
}

export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const post = await prisma.communityPost.findUnique({ where: { id: postId } })
  if (!post) throw new Error("Post not found")

  const isAuthor = post.authorId === session.user.id
  const isAdmin = ["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)
  if (!isAuthor && !isAdmin) throw new Error("Forbidden")

  await prisma.communityPost.delete({ where: { id: postId } })
  revalidatePath("/dashboard/community")
}

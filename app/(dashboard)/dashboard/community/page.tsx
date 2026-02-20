import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatRelativeTime, getInitials } from "@/lib/utils"
import { CommunityFeedClient } from "@/components/community/community-feed-client"

export default async function CommunityPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const posts = await prisma.communityPost.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 30,
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

  const authorIds = new Set<string>()
  posts.forEach((p) => {
    authorIds.add(p.authorId)
    ;(p as any).PostComment?.forEach((c: any) => authorIds.add(c.authorId))
  })

  const authors = await prisma.user.findMany({
    where: { id: { in: Array.from(authorIds) } },
    select: { id: true, name: true, image: true, role: true },
  })
  const authorMap = Object.fromEntries(authors.map((a) => [a.id, a]))

  const enrichedPosts = posts.map((post) => ({
    id: post.id,
    content: post.content,
    images: post.images,
    videos: post.videos,
    postType: post.postType,
    visibility: post.visibility,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    isPinned: post.isPinned,
    createdAt: post.createdAt.toISOString(),
    authorId: post.authorId,
    author: authorMap[post.authorId] || { id: post.authorId, name: "Unknown", image: null, role: "TEACHER" },
    isLiked: ((post as any).PostLike || []).length > 0,
    comments: ((post as any).PostComment || []).map((c: any) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      authorId: c.authorId,
      author: authorMap[c.authorId] || { id: c.authorId, name: "Unknown", image: null, role: "TEACHER" },
    })),
  }))

  const classes = await prisma.class.findMany({
    where: { tenantId: session.user.tenantId, status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <CommunityFeedClient
      initialPosts={enrichedPosts}
      currentUserId={session.user.id}
      currentUserName={session.user.name || ""}
      currentUserRole={session.user.role}
      classes={classes}
    />
  )
}

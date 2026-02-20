"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Heart,
  MessageCircle,
  Send,
  Image as ImageIcon,
  Pin,
  MoreHorizontal,
  Trash2,
  Globe,
  Users,
  Award,
  HelpCircle,
  BookOpen,
  Loader2,
} from "lucide-react"
import { createCommunityPost, toggleLike, addComment, deletePost } from "@/lib/actions/community"
import { formatRelativeTime, getInitials } from "@/lib/utils"

interface Author {
  id: string
  name: string | null
  image: string | null
  role: string
}

interface Comment {
  id: string
  content: string
  createdAt: string
  authorId: string
  author: Author
}

interface Post {
  id: string
  content: string
  images: string[]
  videos: string[]
  postType: string
  visibility: string
  likesCount: number
  commentsCount: number
  isPinned: boolean
  createdAt: string
  authorId: string
  author: Author
  isLiked: boolean
  comments: Comment[]
}

interface CommunityFeedClientProps {
  initialPosts: Post[]
  currentUserId: string
  currentUserName: string
  currentUserRole: string
  classes: { id: string; name: string }[]
}

const postTypeIcons: Record<string, any> = {
  GENERAL: Globe,
  ANNOUNCEMENT: Globe,
  ACHIEVEMENT: Award,
  QUESTION: HelpCircle,
  RESOURCE: BookOpen,
}

const postTypeColors: Record<string, string> = {
  GENERAL: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  ANNOUNCEMENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ACHIEVEMENT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  QUESTION: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  RESOURCE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  PHOTO_ALBUM: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  EVENT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
}

const roleBadge: Record<string, string> = {
  SUPER_ADMIN: "Admin",
  TENANT_ADMIN: "Admin",
  TEACHER: "Teacher",
  GUARDIAN: "Parent",
  STUDENT: "Student",
  HOD: "HoD",
  HR: "HR",
  FINANCE: "Finance",
}

export function CommunityFeedClient({
  initialPosts,
  currentUserId,
  currentUserName,
  currentUserRole,
  classes,
}: CommunityFeedClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [newContent, setNewContent] = useState("")
  const [newPostType, setNewPostType] = useState("GENERAL")
  const [newVisibility, setNewVisibility] = useState("SCHOOL_WIDE")
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [showComposer, setShowComposer] = useState(false)

  const handleCreatePost = () => {
    if (!newContent.trim()) return
    startTransition(async () => {
      try {
        await createCommunityPost({
          content: newContent,
          postType: newPostType,
          visibility: newVisibility,
        })
        const newPost: Post = {
          id: Date.now().toString(),
          content: newContent,
          images: [],
          videos: [],
          postType: newPostType,
          visibility: newVisibility,
          likesCount: 0,
          commentsCount: 0,
          isPinned: false,
          createdAt: new Date().toISOString(),
          authorId: currentUserId,
          author: { id: currentUserId, name: currentUserName, image: null, role: currentUserRole },
          isLiked: false,
          comments: [],
        }
        setPosts([newPost, ...posts])
        setNewContent("")
        setShowComposer(false)
      } catch (e) {
        console.error(e)
      }
    })
  }

  const handleToggleLike = (postId: string) => {
    startTransition(async () => {
      try {
        const result = await toggleLike(postId)
        setPosts(posts.map((p) =>
          p.id === postId
            ? { ...p, isLiked: result.liked, likesCount: p.likesCount + (result.liked ? 1 : -1) }
            : p
        ))
      } catch (e) {
        console.error(e)
      }
    })
  }

  const handleAddComment = (postId: string) => {
    const text = commentTexts[postId]?.trim()
    if (!text) return
    startTransition(async () => {
      try {
        await addComment(postId, text)
        const newComment: Comment = {
          id: Date.now().toString(),
          content: text,
          createdAt: new Date().toISOString(),
          authorId: currentUserId,
          author: { id: currentUserId, name: currentUserName, image: null, role: currentUserRole },
        }
        setPosts(posts.map((p) =>
          p.id === postId
            ? { ...p, comments: [...p.comments, newComment], commentsCount: p.commentsCount + 1 }
            : p
        ))
        setCommentTexts({ ...commentTexts, [postId]: "" })
      } catch (e) {
        console.error(e)
      }
    })
  }

  const handleDeletePost = (postId: string) => {
    if (!confirm("Delete this post?")) return
    startTransition(async () => {
      try {
        await deletePost(postId)
        setPosts(posts.filter((p) => p.id !== postId))
      } catch (e) {
        console.error(e)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground">School news, updates, and discussions</p>
        </div>
      </div>

      {/* Composer */}
      <Card>
        <CardContent className="pt-6">
          {!showComposer ? (
            <button
              onClick={() => setShowComposer(true)}
              className="w-full text-left px-4 py-3 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
            >
              What&apos;s on your mind? Share an update, achievement, or question...
            </button>
          ) : (
            <div className="space-y-4">
              <Textarea
                placeholder="Write your post..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                className="resize-none"
                autoFocus
              />
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[140px]">
                  <Label className="text-xs text-muted-foreground">Post Type</Label>
                  <Select value={newPostType} onValueChange={setNewPostType}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                      <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                      <SelectItem value="QUESTION">Question</SelectItem>
                      <SelectItem value="RESOURCE">Resource</SelectItem>
                      <SelectItem value="PHOTO_ALBUM">Photo Album</SelectItem>
                      <SelectItem value="EVENT">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <Label className="text-xs text-muted-foreground">Visibility</Label>
                  <Select value={newVisibility} onValueChange={setNewVisibility}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHOOL_WIDE">School-Wide</SelectItem>
                      <SelectItem value="TEACHERS_ONLY">Teachers Only</SelectItem>
                      <SelectItem value="PARENTS_ONLY">Parents Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => { setShowComposer(false); setNewContent("") }}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost} disabled={!newContent.trim() || isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Post
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feed */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No posts yet</h3>
            <p className="text-sm text-muted-foreground">Be the first to share something with the school community!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const PostIcon = postTypeIcons[post.postType] || Globe
            const isExpanded = expandedComments.has(post.id)

            return (
              <Card key={post.id} className={post.isPinned ? "border-primary/50 bg-primary/5" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {post.author.image ? (
                          <img src={post.author.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          getInitials(post.author.name || "U")
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{post.author.name || "Unknown"}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {roleBadge[post.author.role] || post.author.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatRelativeTime(new Date(post.createdAt))}</span>
                          {post.isPinned && (
                            <span className="flex items-center gap-0.5"><Pin className="h-3 w-3" /> Pinned</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={`text-[10px] ${postTypeColors[post.postType] || postTypeColors.GENERAL}`}>
                        {post.postType.replace(/_/g, " ")}
                      </Badge>
                      {(post.authorId === currentUserId || ["SUPER_ADMIN", "TENANT_ADMIN"].includes(currentUserRole)) && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeletePost(post.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                  {post.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {post.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="rounded-lg object-cover w-full h-48" />
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex-col items-stretch pt-0 gap-3">
                  <Separator />
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-1.5 ${post.isLiked ? "text-red-500" : ""}`}
                      onClick={() => handleToggleLike(post.id)}
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                      <span className="text-xs">{post.likesCount}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        const next = new Set(expandedComments)
                        if (next.has(post.id)) next.delete(post.id)
                        else next.add(post.id)
                        setExpandedComments(next)
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{post.commentsCount}</span>
                    </Button>
                  </div>

                  {/* Comments */}
                  {(isExpanded || post.comments.length <= 2) && post.comments.length > 0 && (
                    <div className="space-y-2 pl-2 border-l-2 border-muted">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
                            {getInitials(comment.author.name || "U")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-muted/50 rounded-lg px-3 py-2">
                              <span className="text-xs font-semibold">{comment.author.name}</span>
                              <p className="text-xs">{comment.content}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground ml-1">
                              {formatRelativeTime(new Date(comment.createdAt))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment input */}
                  {isExpanded && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Write a comment..."
                        value={commentTexts[post.id] || ""}
                        onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(post.id) } }}
                        className="h-9 text-sm"
                      />
                      <Button
                        size="sm"
                        className="h-9 px-3"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentTexts[post.id]?.trim()}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

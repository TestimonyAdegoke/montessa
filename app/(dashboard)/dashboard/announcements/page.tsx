import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getAnnouncements } from "@/lib/actions/announcements"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils"
import { Megaphone, Plus, Pin } from "lucide-react"
import Link from "next/link"

export default async function AnnouncementsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const announcements = await getAnnouncements()
  const canCreate = ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)

  const priorityColors: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    NORMAL: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    URGENT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-8 w-8" />
            Announcements
          </h1>
          <p className="text-muted-foreground">School-wide announcements and notices</p>
        </div>
        {canCreate && (
          <Link href="/dashboard/announcements/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          </Link>
        )}
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Megaphone className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Announcements</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              There are no announcements at this time. Check back later for updates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={announcement.isPinned ? "border-primary/50 bg-primary/5" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 mt-0.5">
                      <AvatarImage src={(announcement as any).User?.image || ""} />
                      <AvatarFallback>
                        {((announcement as any).User?.name || "?").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {announcement.isPinned && <Pin className="h-4 w-4 text-primary" />}
                        {announcement.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{(announcement as any).User?.name}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(announcement.publishedAt || announcement.createdAt)}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{announcement.audience}</Badge>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[announcement.priority] || ""}`}>
                      {announcement.priority}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{announcement.content}</p>
                </div>
                {announcement.attachments.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {announcement.attachments.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Attachment {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

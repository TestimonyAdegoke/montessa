import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"
import { NotificationList } from "@/components/notifications/notification-list"
import { Bell, BellOff } from "lucide-react"

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const notifications = await prisma.notification.findMany({
    where: { recipientId: session.user.id, tenantId: session.user.tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  const serialized = notifications.map((n: any) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type,
    category: n.category,
    actionUrl: n.actionUrl,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up!"}
          </p>
        </div>
      </div>

      <NotificationList initialNotifications={serialized} />
    </div>
  )
}

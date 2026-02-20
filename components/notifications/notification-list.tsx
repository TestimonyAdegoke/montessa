"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { markAsRead, markAllAsRead, deleteNotification } from "@/lib/actions/notifications"
import { formatRelativeTime } from "@/lib/utils"
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Sun,
  Shield,
  Globe,
} from "lucide-react"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  body: string
  type: string
  category: string
  actionUrl: string | null
  isRead: boolean
  createdAt: string
}

const typeIcons: Record<string, any> = {
  INFO: Info,
  SUCCESS: CheckCircle2,
  WARNING: AlertTriangle,
  ALERT: AlertCircle,
  REMINDER: Clock,
}

const categoryIcons: Record<string, any> = {
  ATTENDANCE: Users,
  GRADES: FileText,
  BILLING: DollarSign,
  ANNOUNCEMENT: Globe,
  MESSAGE: MessageSquare,
  EVENT: Calendar,
  DAILY_UPDATE: Sun,
  DISCIPLINE: Shield,
  CONSENT: FileText,
  SYSTEM: Info,
  COMMUNITY: Globe,
}

const typeColors: Record<string, string> = {
  INFO: "text-blue-500",
  SUCCESS: "text-green-500",
  WARNING: "text-amber-500",
  ALERT: "text-red-500",
  REMINDER: "text-purple-500",
}

export function NotificationList({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filtered = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markAsRead(id)
      setNotifications(notifications.map((n) => n.id === id ? { ...n, isRead: true } : n))
    })
  }

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsRead()
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteNotification(id)
      setNotifications(notifications.filter((n) => n.id !== id))
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </Button>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={isPending}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">
              {filter === "unread" ? "No unread notifications" : "No notifications"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filter === "unread" ? "You're all caught up!" : "Notifications will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => {
            const TypeIcon = typeIcons[notification.type] || Info
            const CategoryIcon = categoryIcons[notification.category] || Info
            const colorClass = typeColors[notification.type] || "text-blue-500"

            return (
              <Card
                key={notification.id}
                className={`transition-colors ${!notification.isRead ? "bg-primary/5 border-primary/20" : ""}`}
              >
                <CardContent className="py-4 px-5">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${colorClass}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className={`text-sm font-semibold truncate ${!notification.isRead ? "" : "text-muted-foreground"}`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{notification.body}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5">
                              <CategoryIcon className="h-2.5 w-2.5" />
                              {notification.category.replace(/_/g, " ")}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">
                              {formatRelativeTime(new Date(notification.createdAt))}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {notification.actionUrl && (
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" asChild>
                              <Link href={notification.actionUrl}>View</Link>
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleMarkRead(notification.id)}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(notification.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

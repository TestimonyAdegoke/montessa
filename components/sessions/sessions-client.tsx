"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Monitor, Smartphone, Globe, Clock, Trash2, Loader2, ShieldAlert } from "lucide-react"
import { revokeSession, revokeAllOtherSessions } from "@/lib/actions/sessions"
import { useToast } from "@/components/ui/use-toast"

interface SessionData {
  id: string
  deviceName: string | null
  browser: string | null
  os: string | null
  ipAddress: string | null
  location: string | null
  lastActiveAt: string
  createdAt: string
  expiresAt: string | null
}

function getDeviceIcon(os: string | null) {
  if (!os) return <Globe className="h-5 w-5" />
  const lower = os.toLowerCase()
  if (lower.includes("android") || lower.includes("ios") || lower.includes("iphone")) {
    return <Smartphone className="h-5 w-5" />
  }
  return <Monitor className="h-5 w-5" />
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function SessionsClient({
  sessions,
  currentSessionId,
}: {
  sessions: SessionData[]
  currentSessionId: string
}) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [localSessions, setLocalSessions] = useState(sessions)

  const handleRevoke = (sessionId: string) => {
    startTransition(async () => {
      try {
        await revokeSession(sessionId)
        setLocalSessions((prev) => prev.filter((s) => s.id !== sessionId))
        toast({ title: "Session Revoked", description: "The session has been terminated." })
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  const handleRevokeAll = () => {
    if (!confirm("Revoke all other sessions? You will remain signed in on this device only.")) return
    startTransition(async () => {
      try {
        await revokeAllOtherSessions()
        setLocalSessions((prev) => prev.slice(0, 1))
        toast({ title: "All Other Sessions Revoked" })
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  return (
    <div className="space-y-4">
      {localSessions.length > 1 && (
        <div className="flex justify-end">
          <Button variant="destructive" size="sm" onClick={handleRevokeAll} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            <ShieldAlert className="h-4 w-4 mr-2" /> Revoke All Other Sessions
          </Button>
        </div>
      )}

      {localSessions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No active sessions</h3>
            <p className="text-sm text-muted-foreground">Your session data will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {localSessions.map((s, i) => (
            <Card key={s.id} className={i === 0 ? "border-primary/50" : ""}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      {getDeviceIcon(s.os)}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {s.deviceName || s.browser || "Unknown Device"}
                        {i === 0 && <Badge variant="success" className="text-[10px]">Current</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground space-x-2">
                        {s.os && <span>{s.os}</span>}
                        {s.browser && <span>· {s.browser}</span>}
                        {s.ipAddress && <span>· {s.ipAddress}</span>}
                        {s.location && <span>· {s.location}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        Last active: {timeAgo(s.lastActiveAt)}
                      </div>
                    </div>
                  </div>
                  {i !== 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRevoke(s.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Revoke
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

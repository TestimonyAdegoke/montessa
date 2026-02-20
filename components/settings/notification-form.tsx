"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface NotificationPrefs {
  emailNotifications: boolean
  pushNotifications: boolean
  attendanceAlerts: boolean
  gradeUpdates: boolean
  billingReminders: boolean
  announcementAlerts: boolean
}

export default function NotificationForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    emailNotifications: true,
    pushNotifications: true,
    attendanceAlerts: true,
    gradeUpdates: true,
    billingReminders: true,
    announcementAlerts: true,
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationPreferences: prefs }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save preferences")
      }

      toast({ title: "Success", description: "Notification preferences saved" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePref = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Email Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Receive notifications via email
          </p>
        </div>
        <Switch checked={prefs.emailNotifications} onCheckedChange={() => togglePref("emailNotifications")} />
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Push Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Receive push notifications in the browser
          </p>
        </div>
        <Switch checked={prefs.pushNotifications} onCheckedChange={() => togglePref("pushNotifications")} />
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Attendance Alerts</Label>
          <p className="text-sm text-muted-foreground">
            Get notified about attendance updates
          </p>
        </div>
        <Switch checked={prefs.attendanceAlerts} onCheckedChange={() => togglePref("attendanceAlerts")} />
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Grade Updates</Label>
          <p className="text-sm text-muted-foreground">
            Get notified when grades are posted
          </p>
        </div>
        <Switch checked={prefs.gradeUpdates} onCheckedChange={() => togglePref("gradeUpdates")} />
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Billing Reminders</Label>
          <p className="text-sm text-muted-foreground">
            Get reminders about upcoming and overdue payments
          </p>
        </div>
        <Switch checked={prefs.billingReminders} onCheckedChange={() => togglePref("billingReminders")} />
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Announcement Alerts</Label>
          <p className="text-sm text-muted-foreground">
            Get notified about new school announcements
          </p>
        </div>
        <Switch checked={prefs.announcementAlerts} onCheckedChange={() => togglePref("announcementAlerts")} />
      </div>
      <Separator />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </div>
  )
}

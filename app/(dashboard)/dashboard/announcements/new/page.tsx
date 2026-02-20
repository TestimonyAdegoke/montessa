"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createAnnouncement } from "@/lib/actions/announcements"
import { Loader2, Save, X, Megaphone } from "lucide-react"

export default function NewAnnouncementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isPinned, setIsPinned] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("isPinned", isPinned.toString())
    formData.set("publishNow", "true")

    startTransition(async () => {
      const result = await createAnnouncement(formData)
      if (result.success) {
        toast({ title: "Success", description: "Announcement published successfully" })
        router.push("/dashboard/announcements")
        router.refresh()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  return (
    <div className="container max-w-3xl py-8">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Megaphone className="h-8 w-8" />
              New Announcement
            </h1>
            <p className="text-muted-foreground">Create a new announcement for your school</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Publish</>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Announcement Details</CardTitle>
              <CardDescription>Write your announcement content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="e.g., School Closure Notice"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  required
                  placeholder="Write your announcement here..."
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure audience and priority</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience *</Label>
                  <Select name="audience" defaultValue="ALL" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Everyone</SelectItem>
                      <SelectItem value="TEACHERS">Teachers Only</SelectItem>
                      <SelectItem value="GUARDIANS">Parents/Guardians Only</SelectItem>
                      <SelectItem value="STUDENTS">Students Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="NORMAL">
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Pin Announcement</Label>
                  <p className="text-sm text-muted-foreground">
                    Pinned announcements appear at the top of the list
                  </p>
                </div>
                <Switch checked={isPinned} onCheckedChange={setIsPinned} />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}

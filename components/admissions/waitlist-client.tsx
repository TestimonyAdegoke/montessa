"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ListOrdered, ArrowUp, ArrowDown, UserCheck } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Props { applications: any[] }

export function WaitlistClient({ applications }: Props) {
  const { toast } = useToast()
  const router = useRouter()

  const handleAccept = async (id: string) => {
    try {
      const res = await fetch("/api/applications/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, status: "ACCEPTED" }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast({ title: "Application Accepted" })
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader className="pb-2"><CardDescription>Waitlisted Applications</CardDescription><CardTitle className="text-3xl flex items-center gap-2"><ListOrdered className="h-6 w-6 text-orange-500" />{applications.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Next Available Position</CardDescription><CardTitle className="text-3xl">{applications.length > 0 ? `#${applications[0]?.waitlistPosition || 1}` : "—"}</CardTitle></CardHeader></Card>
      </div>

      <div className="space-y-3">
        {applications.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><ListOrdered className="h-8 w-8 mx-auto mb-2 opacity-50" />No waitlisted applications.</CardContent></Card>
        ) : applications.map((app: any, index: number) => (
          <Card key={app.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                  #{app.waitlistPosition || index + 1}
                </div>
                <div>
                  <p className="font-semibold">{app.studentName}</p>
                  <p className="text-sm text-muted-foreground">
                    Guardian: {app.guardianName} ({app.guardianEmail})
                    {app.desiredGrade ? ` · Grade: ${app.desiredGrade}` : ""}
                    {app.academicYear ? ` · ${app.academicYear}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">WAITLISTED</Badge>
                <Button size="sm" variant="outline" onClick={() => handleAccept(app.id)}>
                  <UserCheck className="h-3 w-3 mr-1" />Accept
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

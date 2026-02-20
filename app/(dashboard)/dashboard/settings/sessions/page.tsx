import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SessionsClient } from "@/components/sessions/sessions-client"

export default async function SessionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userSessions = await prisma.userSession.findMany({
    where: { userId: session.user.id },
    orderBy: { lastActive: "desc" },
  })

  const serialized = userSessions.map((s: any) => ({
    id: s.id,
    deviceName: s.deviceName,
    browser: s.browser,
    os: s.os,
    ipAddress: s.ipAddress,
    location: s.location,
    lastActiveAt: s.lastActive.toISOString(),
    createdAt: s.createdAt.toISOString(),
    expiresAt: s.expiresAt?.toISOString() || null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
        <p className="text-muted-foreground">Manage your active sessions and devices</p>
      </div>
      <SessionsClient sessions={serialized} currentSessionId={session.user.id} />
    </div>
  )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { WaitlistClient } from "@/components/admissions/waitlist-client"

export default async function WaitlistPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const applications = await prisma.application.findMany({
    where: { tenantId: session.user.tenantId, status: "WAITLISTED" },
    orderBy: { waitlistPosition: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Waitlist Management</h1>
        <p className="text-muted-foreground">Manage waitlisted applications and positions</p>
      </div>
      <WaitlistClient applications={JSON.parse(JSON.stringify(applications))} />
    </div>
  )
}

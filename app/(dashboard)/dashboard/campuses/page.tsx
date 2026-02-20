import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CampusClient } from "@/components/campus/campus-client"
import { Building2 } from "lucide-react"

export default async function CampusesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const campuses = await prisma.campus.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { name: "asc" },
  })

  const serialized = campuses.map((c: any) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    address: c.address,
    city: c.city,
    state: c.state,
    country: c.country,
    phone: c.phone,
    email: c.email,
    logo: c.logo,
    primaryColor: c.primaryColor,
    tagline: c.tagline,
    headUserId: c.headUserId,
    isActive: c.isActive,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campus Management</h1>
        <p className="text-muted-foreground">Manage branches and campuses for your institution</p>
      </div>
      <CampusClient campuses={serialized} />
    </div>
  )
}

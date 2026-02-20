import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DiscountClient } from "@/components/discounts/discount-client"
import { Percent, Tag, DollarSign } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

export default async function DiscountsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"].includes(session.user.role)) redirect("/dashboard")

  const discounts = await prisma.discount.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: "desc" },
  })

  const serialized = discounts.map((d: any) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    type: d.type,
    value: d.value,
    isPercentage: d.isPercentage,
    applicableTo: d.applicableTo,
    maxUses: d.maxUses,
    currentUses: d.currentUses,
    startDate: d.startDate?.toISOString() || null,
    endDate: d.endDate?.toISOString() || null,
    isActive: d.isActive,
    createdAt: d.createdAt.toISOString(),
  }))

  const active = discounts.filter((d: any) => d.isActive).length
  const scholarships = discounts.filter((d: any) => d.type === "SCHOLARSHIP").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discounts & Scholarships</h1>
        <p className="text-muted-foreground">Manage fee discounts, scholarships, and promotions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{discounts.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Percent className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{active}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scholarships</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{scholarships}</div></CardContent>
        </Card>
      </div>

      <DiscountClient discounts={serialized} />
    </div>
  )
}

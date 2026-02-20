import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSubstitutions } from "@/lib/actions/substitutions"
import { prisma } from "@/lib/prisma"
import { SubstitutionsClient } from "@/components/substitutions/substitutions-client"

export default async function SubstitutionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HOD", "HR"].includes(session.user.role)) redirect("/dashboard")

  const substitutions = await getSubstitutions()
  const users = await prisma.user.findMany({
    where: { tenantId: session.user.tenantId, role: { in: ["TEACHER", "HOD"] as any }, isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  })
  const classes = await prisma.class.findMany({
    where: { tenantId: session.user.tenantId, status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Substitution Management</h1>
        <p className="text-muted-foreground">Manage teacher substitutions and cover assignments</p>
      </div>
      <SubstitutionsClient
        substitutions={JSON.parse(JSON.stringify(substitutions))}
        teachers={JSON.parse(JSON.stringify(users))}
        classes={JSON.parse(JSON.stringify(classes))}
      />
    </div>
  )
}

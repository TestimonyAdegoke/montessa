import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/utils"
import { ConsentFormClient } from "@/components/consent/consent-form-client"
import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react"

export default async function ConsentPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const isAdmin = ["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)
  const isGuardian = session.user.role === "GUARDIAN"

  const forms = await prisma.consentForm.findMany({
    where: { tenantId: session.user.tenantId, ...(isGuardian ? { isActive: true } : {}) },
    include: {
      ConsentResponse: { select: { id: true, consented: true, respondentId: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const totalGuardians = await prisma.user.count({
    where: { tenantId: session.user.tenantId, role: "GUARDIAN", isActive: true },
  })

  const serialized = forms.map((f: any) => {
    const consented = f.responses.filter((r: any) => r.consented).length
    const declined = f.responses.filter((r: any) => !r.consented).length
    const total = f.responses.length
    const responseRate = totalGuardians > 0 ? Math.round((total / totalGuardians) * 100) : 0
    const userResponse = isGuardian ? f.responses.find((r: any) => r.respondentId === session.user.id) : null

    return {
      id: f.id,
      title: f.title,
      description: f.description,
      content: f.content,
      audience: f.audience,
      dueDate: f.dueDate?.toISOString() || null,
      isActive: f.isActive,
      createdAt: f.createdAt.toISOString(),
      consented,
      declined,
      totalResponses: total,
      responseRate,
      userHasResponded: !!userResponse,
      userConsented: userResponse?.consented ?? null,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Consent Forms</h1>
        <p className="text-muted-foreground">
          {isAdmin ? "Create and manage consent forms for parents" : "Review and respond to consent forms"}
        </p>
      </div>

      <ConsentFormClient
        forms={serialized}
        isAdmin={isAdmin}
        isGuardian={isGuardian}
        userId={session.user.id}
      />
    </div>
  )
}

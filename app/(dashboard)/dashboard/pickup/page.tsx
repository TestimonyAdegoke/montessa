import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PickupClient } from "@/components/pickup/pickup-client"

export default async function PickupPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HR"].includes(session.user.role)) redirect("/dashboard")

  const students = await prisma.student.findMany({
    where: { tenantId: session.user.tenantId, studentStatus: "ACTIVE" },
    select: {
      id: true,
      legalName: true,
      preferredName: true,
      admissionNumber: true,
      emergencyContact: true,
      emergencyPhone: true,
      Class: { select: { name: true } },
      StudentGuardian: {
        select: {
          relationship: true,
          canPickup: true,
          Guardian: {
            select: {
              id: true,
              User: { select: { name: true, phone: true, image: true } },
            },
          },
        },
      },
    },
    orderBy: { legalName: "asc" },
  })

  const serialized = students.map((s: any) => ({
    id: s.id,
    name: s.preferredName || s.legalName,
    admissionNumber: s.admissionNumber,
    className: s.currentClass?.name || "Unassigned",
    emergencyContact: s.emergencyContact,
    emergencyPhone: s.emergencyPhone,
    guardians: s.guardians
      .filter((g: any) => g.canPickup)
      .map((g: any) => ({
        id: g.guardian.id,
        name: g.guardian.user.name || "Unknown",
        phone: g.guardian.user.phone,
        relationship: g.relationship,
        image: g.guardian.user.image,
      })),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Guardian Pickup Verification</h1>
        <p className="text-muted-foreground">Verify authorized guardians before releasing students</p>
      </div>
      <PickupClient students={serialized} />
    </div>
  )
}

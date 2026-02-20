import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTransportRoutes } from "@/lib/actions/transport"
import { TransportClient } from "@/components/transport/transport-client"

export default async function TransportPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const routes = await getTransportRoutes()

  const serialized = routes.map((r: any) => ({
    id: r.id,
    name: r.name,
    code: r.code,
    description: r.description,
    driverName: r.driverName,
    driverPhone: r.driverPhone,
    vehicleNumber: r.vehicleNumber,
    capacity: r.capacity,
    isActive: r.isActive,
    stops: r.stops.map((s: any) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      pickupTime: s.pickupTime,
      dropoffTime: s.dropoffTime,
      sortOrder: s.sortOrder,
    })),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transport Routes</h1>
        <p className="text-muted-foreground">Manage bus routes, drivers, and stops</p>
      </div>
      <TransportClient routes={serialized} />
    </div>
  )
}

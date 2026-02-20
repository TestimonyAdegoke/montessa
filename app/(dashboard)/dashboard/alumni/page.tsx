import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAlumni } from "@/lib/actions/alumni"
import { AlumniClient } from "@/components/alumni/alumni-client"

export default async function AlumniPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(session.user.role)) redirect("/dashboard")

  const alumni = await getAlumni()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alumni Directory</h1>
        <p className="text-muted-foreground">Track and manage alumni records, career paths, and engagement</p>
      </div>
      <AlumniClient alumni={JSON.parse(JSON.stringify(alumni))} />
    </div>
  )
}

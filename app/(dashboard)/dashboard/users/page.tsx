import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getUsers, getUserStats } from "@/lib/actions/users"
import UserManagementClient from "@/components/users/user-management-client"

export default async function UserManagementPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const [users, stats] = await Promise.all([
    getUsers(),
    getUserStats(),
  ])

  return (
    <UserManagementClient
      initialUsers={JSON.parse(JSON.stringify(users))}
      stats={JSON.parse(JSON.stringify(stats))}
      currentUserId={session.user.id}
      currentUserRole={session.user.role}
    />
  )
}

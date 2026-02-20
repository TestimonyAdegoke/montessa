import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTasks } from "@/lib/actions/tasks"
import { prisma } from "@/lib/prisma"
import { TasksClient } from "@/components/tasks/tasks-client"

export default async function TasksPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const tasks = await getTasks()
  const users = await prisma.user.findMany({
    where: { tenantId: session.user.tenantId, isActive: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground">Create, assign, and track tasks across your team</p>
      </div>
      <TasksClient
        tasks={JSON.parse(JSON.stringify(tasks))}
        users={JSON.parse(JSON.stringify(users))}
        currentUserId={session.user.id}
      />
    </div>
  )
}

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import MessageForm from "@/components/messages/message-form"

async function getUsers() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  const users = await prisma.user.findMany({
    where: {
      tenantId: session.user.tenantId,
      isActive: true,
      id: {
        not: session.user.id, // Exclude current user
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return users
}

export default async function NewMessagePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const users = await getUsers()

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">New Message</h1>
        <p className="text-muted-foreground">Send a message to another user</p>
      </div>
      <MessageForm users={users} />
    </div>
  )
}

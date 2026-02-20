import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getMessages } from "@/lib/actions/messages"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import MessagesTable from "@/components/messages/messages-table"

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const messages = await getMessages("inbox")

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communication with students, parents, and staff</p>
        </div>
        <Link href="/dashboard/messages/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </Link>
      </div>
      <MessagesTable messages={messages} />
    </div>
  )
}

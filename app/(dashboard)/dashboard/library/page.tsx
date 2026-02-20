import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getBooks } from "@/lib/actions/library"
import { LibraryClient } from "@/components/library/library-client"

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const books = await getBooks()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Library Management</h1>
        <p className="text-muted-foreground">Manage books, issue loans, and track returns</p>
      </div>
      <LibraryClient
        books={JSON.parse(JSON.stringify(books))}
        userRole={session.user.role}
        userId={session.user.id}
        userName={session.user.name || session.user.email || ""}
      />
    </div>
  )
}

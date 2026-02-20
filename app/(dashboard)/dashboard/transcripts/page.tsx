import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTranscripts } from "@/lib/actions/transcripts"
import { prisma } from "@/lib/prisma"
import { TranscriptsClient } from "@/components/transcripts/transcripts-client"

export default async function TranscriptsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const transcripts = await getTranscripts()
  const students = await prisma.student.findMany({
    where: { tenantId: session.user.tenantId },
    select: { id: true, legalName: true, admissionNumber: true },
    orderBy: { legalName: "asc" },
  })
  const classes = await prisma.class.findMany({
    where: { tenantId: session.user.tenantId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transcripts & Promotion</h1>
        <p className="text-muted-foreground">Manage student transcripts, grades, and promotion decisions</p>
      </div>
      <TranscriptsClient
        transcripts={JSON.parse(JSON.stringify(transcripts))}
        students={JSON.parse(JSON.stringify(students))}
        classes={JSON.parse(JSON.stringify(classes))}
        userRole={session.user.role}
      />
    </div>
  )
}

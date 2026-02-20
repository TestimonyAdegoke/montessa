import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getContracts } from "@/lib/actions/contracts"
import { ContractsClient } from "@/components/contracts/contracts-client"

export default async function ContractsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const contracts = await getContracts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enrollment Contracts</h1>
        <p className="text-muted-foreground">Create, send, and track e-signed enrollment contracts</p>
      </div>
      <ContractsClient
        contracts={JSON.parse(JSON.stringify(contracts))}
        userRole={session.user.role}
      />
    </div>
  )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ParentsTable from "@/components/parents/parents-table"
import { Users, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ParentsPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/login")

    const parents = await prisma.guardian.findMany({
        where: { tenantId: session.user.tenantId },
        include: {
            User: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    image: true,
                },
            },
            StudentGuardian: {
                include: {
                    Student: {
                        include: {
                            User: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { User: { name: "asc" } },
    })

    // Format data for the table
    const formattedParents = parents.map((parent) => ({
        id: parent.id,
        occupation: parent.occupation,
        workPhone: parent.workPhone,
        address: parent.address,
        user: parent.User,
        students: parent.StudentGuardian.map((sg: any) => ({
            student: sg.Student,
        })),
    }))

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Parents & Guardians</h1>
                    <p className="text-muted-foreground">Manage parent information and student relationships</p>
                </div>
                <Link href="/dashboard/users">
                    <Button className="rounded-xl font-bold shadow-lg shadow-primary/20">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Parent
                    </Button>
                </Link>
            </div>

            <ParentsTable parents={formattedParents as any} />
        </div>
    )
}

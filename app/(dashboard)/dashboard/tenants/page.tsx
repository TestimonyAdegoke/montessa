import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  MoreHorizontal,
  Search,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"

async function getTenants() {
  const rawTenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: {
          User: true,
          Student: true,
          Class: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return rawTenants.map(({ _count, ...rest }) => ({
    ...rest,
    _count: { users: _count.User, students: _count.Student, classes: _count.Class },
  }))
}

async function getPlatformStats() {
  const [totalTenants, activeTenants, totalUsers, totalStudents] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.student.count(),
  ])
  return { totalTenants, activeTenants, totalUsers, totalStudents }
}

export default async function TenantsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard")

  const [tenants, stats] = await Promise.all([getTenants(), getPlatformStats()])

  const statusColors: Record<string, "success" | "warning" | "destructive" | "outline"> = {
    ACTIVE: "success",
    TRIAL: "warning",
    SUSPENDED: "destructive",
    CANCELLED: "outline",
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Tenant Management
          </h1>
          <p className="text-muted-foreground">Manage all schools and organizations on the platform</p>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTenants}</div>
            <p className="text-xs text-muted-foreground">{stats.activeTenants} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Across all tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Tenants</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenants.filter((t) => t.status === "TRIAL").length}
            </div>
            <p className="text-xs text-muted-foreground">On free trial</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Subdomain</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No tenants found
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{tenant.name}</div>
                            {tenant.domain && (
                              <div className="text-xs text-muted-foreground">{tenant.domain}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{tenant.subdomain}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{tenant.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[tenant.status] || "outline"}>
                          {tenant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{tenant._count.users}</TableCell>
                      <TableCell>{tenant._count.students}</TableCell>
                      <TableCell>{tenant._count.classes}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatRelativeTime(tenant.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Settings</DropdownMenuItem>
                            <DropdownMenuItem>Manage Users</DropdownMenuItem>
                            {tenant.status === "ACTIVE" && (
                              <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                            )}
                            {tenant.status === "SUSPENDED" && (
                              <DropdownMenuItem>Reactivate</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

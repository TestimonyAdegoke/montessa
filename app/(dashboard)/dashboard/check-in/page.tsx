import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import { ScanLine, LogIn, LogOut, Clock } from "lucide-react"

export default async function CheckInPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [rawTodayCheckIns, rawRecentCheckIns] = await Promise.all([
    prisma.checkInOut.findMany({
      where: {
        timestamp: { gte: today, lt: tomorrow },
        Guardian: { tenantId: session.user.tenantId },
      },
      include: {
        Guardian: { include: { User: { select: { name: true } } } },
      },
      orderBy: { timestamp: "desc" },
    }),
    prisma.checkInOut.findMany({
      where: {
        Guardian: { tenantId: session.user.tenantId },
      },
      include: {
        Guardian: { include: { User: { select: { name: true } } } },
      },
      orderBy: { timestamp: "desc" },
      take: 100,
    }),
  ])
  const normalize = (items: typeof rawTodayCheckIns) =>
    items.map(({ Guardian, ...rest }) => ({
      ...rest,
      guardian: { ...Guardian, user: Guardian.User },
    }))
  const todayCheckIns = normalize(rawTodayCheckIns)
  const recentCheckIns = normalize(rawRecentCheckIns)

  const checkIns = todayCheckIns.filter((c: any) => c.type === "CHECK_IN").length
  const checkOuts = todayCheckIns.filter((c: any) => c.type === "CHECK_OUT").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Check-In / Check-Out</h1>
        <p className="text-muted-foreground">Track student arrivals and departures</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{todayCheckIns.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-Ins</CardTitle>
            <LogIn className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-500">{checkIns}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-Outs</CardTitle>
            <LogOut className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-500">{checkOuts}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Still In School</CardTitle>
            <ScanLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{Math.max(0, checkIns - checkOuts)}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today ({todayCheckIns.length})</TabsTrigger>
          <TabsTrigger value="recent">Recent ({recentCheckIns.length})</TabsTrigger>
        </TabsList>

        {[
          { key: "today", data: todayCheckIns },
          { key: "recent", data: recentCheckIns },
        ].map(({ key, data }) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Guardian</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Verified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.studentName}</TableCell>
                        <TableCell>{record.guardian.user.name}</TableCell>
                        <TableCell>
                          <Badge variant={record.type === "CHECK_IN" ? "success" : "secondary"}>
                            {record.type === "CHECK_IN" ? "In" : "Out"}
                          </Badge>
                        </TableCell>
                        <TableCell><Badge variant="outline">{record.method.replace("_", " ")}</Badge></TableCell>
                        <TableCell>{formatDate(record.timestamp)}</TableCell>
                        <TableCell>
                          {record.verified ? (
                            <Badge variant="success">Verified</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No check-in/check-out records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

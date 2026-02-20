import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DollarSign, TrendingUp, AlertTriangle, CreditCard } from "lucide-react"

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"].includes(session.user.role)) redirect("/dashboard")

  const [invoices, payments] = await Promise.all([
    prisma.invoice.findMany({
      where: { tenantId: session.user.tenantId },
      include: { Payment: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { Invoice: { tenantId: session.user.tenantId } },
      include: { Invoice: { select: { invoiceNumber: true, billedTo: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])

  const totalRevenue = invoices.filter((i: any) => i.status === "PAID").reduce((sum: number, i: any) => sum + i.totalAmount, 0)
  const totalPending = invoices.filter((i: any) => i.status === "PENDING").reduce((sum: number, i: any) => sum + i.totalAmount, 0)
  const totalOverdue = invoices.filter((i: any) => i.status === "OVERDUE").reduce((sum: number, i: any) => sum + i.totalAmount, 0)
  const totalCollected = payments.filter((p: any) => p.status === "COMPLETED").reduce((sum: number, p: any) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
        <p className="text-muted-foreground">Revenue, collections, and financial overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(totalOverdue)}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(totalCollected)}</div>
            <p className="text-xs text-muted-foreground">Total payments received</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({invoices.filter((i: any) => i.status === "OVERDUE").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Billed To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.slice(0, 50).map((inv: any) => {
                    const paidAmount = inv.payments.filter((p: any) => p.status === "COMPLETED").reduce((s: number, p: any) => s + p.amount, 0)
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono">{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.billedTo}</TableCell>
                        <TableCell>{formatCurrency(inv.totalAmount)}</TableCell>
                        <TableCell>{formatDate(inv.dueDate)}</TableCell>
                        <TableCell>
                          <Badge variant={inv.status === "PAID" ? "success" : inv.status === "OVERDUE" ? "destructive" : "outline"}>
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(paidAmount)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Billed To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono">{p.invoice.invoiceNumber}</TableCell>
                      <TableCell>{p.invoice.billedTo}</TableCell>
                      <TableCell>{formatCurrency(p.amount)}</TableCell>
                      <TableCell><Badge variant="outline">{p.method.replace("_", " ")}</Badge></TableCell>
                      <TableCell>{formatDate(p.paidAt || p.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === "COMPLETED" ? "success" : p.status === "FAILED" ? "destructive" : "outline"}>
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Billed To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.filter((i: any) => i.status === "OVERDUE").map((inv: any) => {
                    const daysOverdue = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono">{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.billedTo}</TableCell>
                        <TableCell className="font-bold text-red-500">{formatCurrency(inv.totalAmount)}</TableCell>
                        <TableCell>{formatDate(inv.dueDate)}</TableCell>
                        <TableCell><Badge variant="destructive">{daysOverdue} days</Badge></TableCell>
                      </TableRow>
                    )
                  })}
                  {invoices.filter((i: any) => i.status === "OVERDUE").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No overdue invoices. Great job!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

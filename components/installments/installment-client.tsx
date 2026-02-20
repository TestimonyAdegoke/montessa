"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { markInstallmentPaid, cancelInstallmentPlan } from "@/lib/actions/installments"
import { useToast } from "@/components/ui/use-toast"

interface InstallmentData {
  id: string
  installmentNumber: number
  amount: number
  dueDate: string
  paidDate: string | null
  status: string
}

interface PlanData {
  id: string
  invoiceId: string
  studentId: string
  totalAmount: number
  numberOfInstallments: number
  frequency: string
  startDate: string
  status: string
  notes: string | null
  installments: InstallmentData[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function statusBadge(status: string) {
  switch (status) {
    case "PAID": return <Badge variant="success">Paid</Badge>
    case "OVERDUE": return <Badge variant="destructive">Overdue</Badge>
    case "PENDING": return <Badge variant="outline">Pending</Badge>
    case "WAIVED": return <Badge variant="secondary">Waived</Badge>
    case "ACTIVE": return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Active</Badge>
    case "COMPLETED": return <Badge variant="success">Completed</Badge>
    case "DEFAULTED": return <Badge variant="destructive">Defaulted</Badge>
    case "CANCELLED": return <Badge variant="secondary">Cancelled</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}

export function InstallmentClient({ plans: initialPlans }: { plans: PlanData[] }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [plans, setPlans] = useState(initialPlans)

  const handleMarkPaid = (installmentId: string) => {
    startTransition(async () => {
      try {
        await markInstallmentPaid(installmentId)
        toast({ title: "Payment Recorded" })
        window.location.reload()
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" })
      }
    })
  }

  const handleCancel = (planId: string) => {
    if (!confirm("Cancel this installment plan?")) return
    startTransition(async () => {
      try {
        await cancelInstallmentPlan(planId)
        setPlans((prev) => prev.map((p) => p.id === planId ? { ...p, status: "CANCELLED" } : p))
        toast({ title: "Plan Cancelled" })
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" })
      }
    })
  }

  const activePlans = plans.filter((p) => p.status === "ACTIVE").length
  const completedPlans = plans.filter((p) => p.status === "COMPLETED").length
  const totalOwed = plans
    .filter((p) => p.status === "ACTIVE")
    .reduce((sum, p) => sum + p.installments.filter((i) => i.status !== "PAID").reduce((s, i) => s + i.amount, 0), 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{activePlans}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{completedPlans}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(totalOwed)}</div></CardContent>
        </Card>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No installment plans</h3>
            <p className="text-sm text-muted-foreground">Installment plans will appear here when created from invoices.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const paid = plan.installments.filter((i) => i.status === "PAID").length
            return (
              <Card key={plan.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {formatCurrency(plan.totalAmount)} in {plan.numberOfInstallments} installments
                        {statusBadge(plan.status)}
                      </CardTitle>
                      <CardDescription>
                        {plan.frequency} · Started {formatDate(plan.startDate)} · {paid}/{plan.numberOfInstallments} paid
                      </CardDescription>
                    </div>
                    {plan.status === "ACTIVE" && (
                      <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => handleCancel(plan.id)} disabled={isPending}>
                        Cancel Plan
                      </Button>
                    )}
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(paid / plan.numberOfInstallments) * 100}%` }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Paid Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plan.installments.map((inst) => (
                        <TableRow key={inst.id}>
                          <TableCell className="font-mono text-sm">{inst.installmentNumber}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(inst.amount)}</TableCell>
                          <TableCell>{formatDate(inst.dueDate)}</TableCell>
                          <TableCell>{inst.paidDate ? formatDate(inst.paidDate) : "—"}</TableCell>
                          <TableCell>{statusBadge(inst.status)}</TableCell>
                          <TableCell className="text-right">
                            {inst.status === "PENDING" || inst.status === "OVERDUE" ? (
                              <Button size="sm" onClick={() => handleMarkPaid(inst.id)} disabled={isPending}>
                                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                                Mark Paid
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

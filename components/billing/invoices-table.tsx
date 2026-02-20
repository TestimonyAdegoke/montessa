"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search, DollarSign } from "lucide-react"
import ConfirmDeleteButton from "@/components/common/confirm-delete-button"
import { formatDistance } from "date-fns"

export default function InvoicesTable({ invoices }: { invoices: any[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const filteredInvoices = invoices.filter((inv) => {
    const query = searchQuery.toLowerCase()
    return inv.invoiceNumber.toLowerCase().includes(query) || inv.billedTo.toLowerCase().includes(query)
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PAID: "success",
      UNPAID: "destructive",
      PARTIALLY_PAID: "secondary",
      OVERDUE: "destructive",
      CANCELLED: "default",
    }
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">No invoices found</TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => {
                const totalPaid = invoice.payments?.reduce((sum: number, p: any) => sum + (p.status === "COMPLETED" ? p.amount : 0), 0) || 0
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{invoice.billedTo}</div>
                      <div className="text-xs text-muted-foreground">{invoice.billedToEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {invoice.totalAmount.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {totalPaid.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistance(new Date(invoice.dueDate), new Date(), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Link href={`/dashboard/billing/${invoice.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <ConfirmDeleteButton
                        resourceName="invoice"
                        onConfirm={async () => {
                          const res = await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" })
                          if (!res.ok) throw new Error("Failed to delete invoice")
                          startTransition(() => router.refresh())
                        }}
                        variant="ghost"
                        size="sm"
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

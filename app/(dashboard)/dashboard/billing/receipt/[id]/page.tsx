import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDate } from "@/lib/utils"

interface ReceiptPageProps {
  params: { id: string }
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const rawPayment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: {
      Invoice: {
        include: {
          Tenant: { select: { name: true, subdomain: true } },
        },
      },
    },
  })

  if (!rawPayment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Payment not found</h2>
        <p className="text-muted-foreground">The receipt you are looking for does not exist.</p>
      </div>
    )
  }

  const payment = { ...rawPayment, invoice: { ...rawPayment.Invoice, tenant: rawPayment.Invoice.Tenant } }
  const invoice = payment.invoice
  const items = (invoice.items as any[]) || []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-3xl font-bold tracking-tight">Payment Receipt</h1>
        <button
          onClick={() => {}}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          data-print-button
        >
          Print Receipt
        </button>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="text-2xl">{invoice.tenant.name}</CardTitle>
          <p className="text-sm text-muted-foreground">Payment Receipt</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Receipt Header */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Receipt Number</p>
              <p className="font-medium">RCT-{payment.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">
                {payment.paidAt ? formatDate(payment.paidAt) : formatDate(payment.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Invoice Number</p>
              <p className="font-medium">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Payment Method</p>
              <p className="font-medium">{payment.method.replace(/_/g, " ")}</p>
            </div>
          </div>

          <Separator />

          {/* Billed To */}
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Billed To</p>
            <p className="font-medium">{invoice.billedTo}</p>
            {invoice.billedToEmail && (
              <p className="text-muted-foreground">{invoice.billedToEmail}</p>
            )}
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <h4 className="font-semibold mb-3">Items</h4>
            <div className="space-y-2">
              {items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <span>{item.description || item.name || `Item ${i + 1}`}</span>
                    {item.quantity && item.quantity > 1 && (
                      <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                    )}
                  </div>
                  <span className="font-medium">{formatCurrency(item.amount || item.total || 0)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-semibold text-green-600">{formatCurrency(payment.amount)}</span>
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment Status</span>
            <Badge variant={payment.status === "COMPLETED" ? "success" : "outline"}>
              {payment.status}
            </Badge>
          </div>

          {payment.reference && (
            <div className="text-sm">
              <span className="text-muted-foreground">Reference: </span>
              <span className="font-mono">{payment.reference}</span>
            </div>
          )}

          {payment.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notes: </span>
              <span>{payment.notes}</span>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <p>Thank you for your payment!</p>
            <p>This is a computer-generated receipt.</p>
          </div>
        </CardContent>
      </Card>

      {/* Print Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelector('[data-print-button]')?.addEventListener('click', function() {
              window.print();
            });
          `,
        }}
      />
    </div>
  )
}

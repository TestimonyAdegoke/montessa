import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(date)
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const rawPayment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        Invoice: {
          include: {
            Tenant: { select: { name: true, logo: true, primaryColor: true } },
          },
        },
      },
    })

    if (!rawPayment) return NextResponse.json({ error: "Payment not found" }, { status: 404 })

    const payment = { ...rawPayment, invoice: { ...rawPayment.Invoice, tenant: rawPayment.Invoice.Tenant } }
    const invoice = payment.invoice
    const items = (invoice.items as any[]) || []
    const primaryColor = invoice.tenant.primaryColor || "#2563eb"
    const receiptNumber = `RCT-${payment.id.slice(0, 8).toUpperCase()}`
    const paymentDate = payment.paidAt ? formatDate(payment.paidAt) : formatDate(payment.createdAt)

    const itemsHtml = items.map((item: any, i: number) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${item.description || item.name || `Item ${i + 1}`}${item.quantity && item.quantity > 1 ? ` <span style="color:#888">x${item.quantity}</span>` : ""}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:500">${formatCurrency(item.amount || item.total || 0)}</td>
      </tr>
    `).join("")

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt ${receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; background: #fff; }
    .receipt { max-width: 600px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; padding-bottom: 24px; border-bottom: 2px solid ${primaryColor}; margin-bottom: 24px; }
    .header h1 { font-size: 24px; color: ${primaryColor}; margin-bottom: 4px; }
    .header p { color: #666; font-size: 14px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
    .meta-item { }
    .meta-item .label { color: #888; margin-bottom: 2px; }
    .meta-item .value { font-weight: 600; }
    .billed-to { margin-bottom: 20px; font-size: 13px; }
    .billed-to .label { color: #888; margin-bottom: 2px; }
    .billed-to .value { font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    .totals { font-size: 13px; margin-bottom: 20px; }
    .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
    .totals .row.total { font-size: 16px; font-weight: 700; border-top: 2px solid #1a1a1a; padding-top: 8px; margin-top: 8px; }
    .totals .row.paid { color: #16a34a; font-weight: 600; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .status.completed { background: #dcfce7; color: #16a34a; }
    .status.pending { background: #fef3c7; color: #d97706; }
    .footer { text-align: center; color: #888; font-size: 11px; border-top: 1px solid #e5e5e5; padding-top: 16px; margin-top: 24px; }
    @media print { body { padding: 0; } .receipt { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="no-print" style="text-align:right;margin-bottom:16px">
      <button onclick="window.print()" style="padding:8px 16px;background:${primaryColor};color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">Print / Save PDF</button>
    </div>
    
    <div class="header">
      ${invoice.tenant.logo ? `<img src="${invoice.tenant.logo}" alt="" style="height:48px;margin-bottom:8px">` : ""}
      <h1>${invoice.tenant.name}</h1>
      <p>Payment Receipt</p>
    </div>

    <div class="meta">
      <div class="meta-item"><div class="label">Receipt Number</div><div class="value">${receiptNumber}</div></div>
      <div class="meta-item" style="text-align:right"><div class="label">Date</div><div class="value">${paymentDate}</div></div>
    </div>
    <div class="meta">
      <div class="meta-item"><div class="label">Invoice Number</div><div class="value">${invoice.invoiceNumber}</div></div>
      <div class="meta-item" style="text-align:right"><div class="label">Payment Method</div><div class="value">${payment.method.replace(/_/g, " ")}</div></div>
    </div>

    <div class="billed-to">
      <div class="label">Billed To</div>
      <div class="value">${invoice.billedTo}</div>
      ${invoice.billedToEmail ? `<div style="color:#888">${invoice.billedToEmail}</div>` : ""}
    </div>

    <table>
      <thead>
        <tr style="border-bottom:2px solid #e5e5e5">
          <th style="text-align:left;padding:8px 0;color:#888;font-weight:500">Description</th>
          <th style="text-align:right;padding:8px 0;color:#888;font-weight:500">Amount</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${formatCurrency(invoice.subtotal)}</span></div>
      ${invoice.taxAmount > 0 ? `<div class="row"><span>Tax</span><span>${formatCurrency(invoice.taxAmount)}</span></div>` : ""}
      ${invoice.discount > 0 ? `<div class="row"><span>Discount</span><span style="color:#16a34a">-${formatCurrency(invoice.discount)}</span></div>` : ""}
      <div class="row total"><span>Total</span><span>${formatCurrency(invoice.totalAmount)}</span></div>
      <div class="row paid"><span>Amount Paid</span><span>${formatCurrency(payment.amount)}</span></div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <span style="color:#888;font-size:13px">Payment Status</span>
      <span class="status ${payment.status === "COMPLETED" ? "completed" : "pending"}">${payment.status}</span>
    </div>

    ${payment.reference ? `<div style="font-size:12px;color:#888;margin-bottom:8px">Reference: <span style="font-family:monospace">${payment.reference}</span></div>` : ""}
    ${payment.notes ? `<div style="font-size:12px;color:#888;margin-bottom:8px">Notes: ${payment.notes}</div>` : ""}

    <div class="footer">
      <p>Thank you for your payment!</p>
      <p>This is a computer-generated receipt.</p>
    </div>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  } catch (error) {
    console.error("Receipt generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

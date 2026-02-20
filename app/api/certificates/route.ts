import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HOD"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { studentId, type, title, description, issueDate } = await req.json()
  if (!studentId || !type || !title) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: session.user.tenantId } })
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

  const certId = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${certId}`

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: 'Georgia', serif; margin: 0; padding: 40px; background: #fafafa; }
  .cert { max-width: 800px; margin: 0 auto; background: white; border: 3px double #1a1a2e; padding: 60px; text-align: center; position: relative; }
  .cert::before { content: ''; position: absolute; inset: 8px; border: 1px solid #d4af37; pointer-events: none; }
  .logo { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 3px; }
  .title { font-size: 36px; color: #1a1a2e; margin: 20px 0 10px; font-weight: normal; }
  .subtitle { font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; }
  .name { font-size: 28px; color: #1a1a2e; border-bottom: 2px solid #d4af37; display: inline-block; padding: 0 40px 5px; margin: 20px 0; }
  .desc { font-size: 16px; color: #555; max-width: 500px; margin: 20px auto; line-height: 1.6; }
  .date { font-size: 14px; color: #888; margin-top: 30px; }
  .footer { display: flex; justify-content: space-between; margin-top: 50px; font-size: 12px; color: #999; }
  .sig { border-top: 1px solid #ccc; padding-top: 5px; min-width: 150px; }
  .verify { font-size: 10px; color: #aaa; margin-top: 20px; }
  @media print { body { background: white; padding: 0; } .cert { border: none; } }
</style></head><body>
<div class="cert">
  <div class="logo">${tenant?.name || "OnebitMS"}</div>
  <h1 class="title">${title}</h1>
  <div class="subtitle">${type.replace(/_/g, " ")}</div>
  <p class="desc">This is to certify that</p>
  <div class="name">${student.legalName}</div>
  <p class="desc">${description || "has successfully completed the requirements and is hereby awarded this certificate."}</p>
  <div class="date">${new Date(issueDate || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
  <div class="footer">
    <div class="sig">Principal</div>
    <div class="sig">Certificate ID: ${certId}</div>
  </div>
  <div class="verify">Verify at: ${verifyUrl}</div>
</div>
<script>window.onload=()=>window.print()</script>
</body></html>`

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  })
}

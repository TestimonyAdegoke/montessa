import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import QRCode from "qrcode"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, type } = await req.json()
  if (!data) return NextResponse.json({ error: "Missing data" }, { status: 400 })

  try {
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
      type: type || "guardian_pickup",
      id: data,
      tenantId: session.user.tenantId,
      generated: new Date().toISOString(),
    }), {
      width: 300,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
    })

    return NextResponse.json({ qrCode: qrDataUrl })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

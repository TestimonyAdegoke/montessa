import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id
    const tenantId = session.user.tenantId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const auditLogs = await prisma.auditLog.findMany({
      where: { userId },
      select: { action: true, entity: true, entityId: true, timestamp: true },
      orderBy: { timestamp: "desc" },
      take: 500,
    })

    const sessions = await prisma.userSession.findMany({
      where: { userId },
      select: {
        deviceName: true,
        browser: true,
        os: true,
        ipAddress: true,
        lastActive: true,
        createdAt: true,
      },
    })

    const exportData = {
      exportDate: new Date().toISOString(),
      user,
      activityLog: auditLogs,
      sessions,
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="data-export-${userId.slice(0, 8)}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Data export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

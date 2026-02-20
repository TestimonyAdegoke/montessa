import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id
    if (!userId) return NextResponse.json({ error: "No user ID found" }, { status: 400 })

    // Verify user exists
    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { name, phone, image, themePreference } = await request.json()

    const allowedTheme = themePreference && ["LIGHT", "DARK", "SYSTEM"].includes(themePreference)
      ? (themePreference as "LIGHT" | "DARK" | "SYSTEM")
      : undefined

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ?? undefined,
        phone: phone ?? undefined,
        image: image ?? undefined,
        themePreference: allowedTheme ?? undefined,
      },
      select: { id: true, name: true, email: true, phone: true, image: true, themePreference: true },
    })

    // Audit log — non-blocking
    try {
      if (session.user.tenantId) {
        await prisma.auditLog.create({
          data: {
            tenantId: session.user.tenantId,
            userId: userId,
            action: "UPDATE",
            entity: "User",
            entityId: userId,
            oldValues: { name: existingUser.name, phone: existingUser.phone, image: existingUser.image, themePreference: existingUser.themePreference } as any,
            newValues: updated as any,
          },
        })
      }
    } catch (auditErr) {
      console.error("Audit log creation failed:", auditErr)
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

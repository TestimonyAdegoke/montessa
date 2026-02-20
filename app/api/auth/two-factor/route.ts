import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSecret, generateTOTPUri, verifyTOTP, generateBackupCodes } from "@/lib/two-factor"

// GET — Generate a new 2FA secret + QR URI
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const secret = generateSecret()
    const uri = generateTOTPUri(secret, session.user.email || "user@example.com")

    return NextResponse.json({ secret, uri })
  } catch (error) {
    console.error("2FA setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST — Enable 2FA (verify token + save secret)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { secret, token, action } = await request.json()

    if (action === "enable") {
      if (!secret || !token) {
        return NextResponse.json({ error: "Secret and token are required" }, { status: 400 })
      }

      const isValid = verifyTOTP(token, secret)
      if (!isValid) {
        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
      }

      const backupCodes = generateBackupCodes()

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorSecret: secret,
          twoFactorEnabled: true,
          backupCodes: backupCodes,
        } as any,
      })

      return NextResponse.json({ success: true, backupCodes })
    }

    if (action === "disable") {
      if (!token) {
        return NextResponse.json({ error: "Verification code required" }, { status: 400 })
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { twoFactorSecret: true } as any,
      })

      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

      const userSecret = (user as any).twoFactorSecret
      if (!userSecret || !verifyTOTP(token, userSecret)) {
        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorSecret: null,
          twoFactorEnabled: false,
          backupCodes: [],
        } as any,
      })

      return NextResponse.json({ success: true })
    }

    if (action === "verify") {
      if (!token) {
        return NextResponse.json({ error: "Verification code required" }, { status: 400 })
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { twoFactorSecret: true, backupCodes: true } as any,
      })

      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

      const userSecret = (user as any).twoFactorSecret
      const userBackupCodes = (user as any).backupCodes as string[] || []

      // Try TOTP first
      if (userSecret && verifyTOTP(token, userSecret)) {
        return NextResponse.json({ valid: true })
      }

      // Try backup codes
      const codeIndex = userBackupCodes.indexOf(token)
      if (codeIndex !== -1) {
        // Remove used backup code
        const updatedCodes = [...userBackupCodes]
        updatedCodes.splice(codeIndex, 1)
        await prisma.user.update({
          where: { id: session.user.id },
          data: { backupCodes: updatedCodes } as any,
        })
        return NextResponse.json({ valid: true, backupCodeUsed: true })
      }

      return NextResponse.json({ valid: false, error: "Invalid code" }, { status: 400 })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("2FA error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

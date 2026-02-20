import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const tenantId = session.user.tenantId
        if (!tenantId) return NextResponse.json({ error: "No tenant ID" }, { status: 400 })

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                id: true, name: true, subdomain: true, domain: true,
                logo: true, tagline: true, plan: true,
            },
        })

        if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
        return NextResponse.json(tenant)
    } catch (error) {
        console.error("Get tenant details error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const tenantId = session.user.tenantId
        if (!tenantId) return NextResponse.json({ error: "No tenant ID" }, { status: 400 })

        // Check admin access
        if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
            return NextResponse.json({ error: "Requires admin access" }, { status: 403 })
        }

        const existingTenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
        if (!existingTenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

        const body = await request.json()
        const { name, tagline, logo } = body

        const updated = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
                ...(typeof tagline === "string" ? { tagline } : {}),
                ...(typeof logo === "string" ? { logo } : {}),
            },
            select: { id: true, name: true, subdomain: true, logo: true, tagline: true },
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error("Update tenant details error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

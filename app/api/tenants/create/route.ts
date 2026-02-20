import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { tenantSetupSchema } from "@/lib/validations/auth"
import QRCode from "qrcode"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate input
    const validatedData = tenantSetupSchema.parse({
      ...body,
      plan: body.plan || "free",
    })

    // Check if subdomain already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain: validatedData.subdomain },
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: "Subdomain already taken" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.adminEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.adminPassword, 10)

    // Create tenant and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.name,
          subdomain: validatedData.subdomain,
          plan: validatedData.plan,
          status: "TRIAL",
          enabledModules: JSON.stringify([
            "students",
            "attendance",
            "guardians",
            "classes",
            "assessments",
            "messaging",
            "analytics",
          ]),
          settings: JSON.stringify({
            theme: "light",
            timezone: "UTC",
            dateFormat: "MM/DD/YYYY",
          }),
        },
      })

      // Create admin user
      const adminUser = await tx.user.create({
        data: {
          name: validatedData.adminName,
          email: validatedData.adminEmail,
          password: hashedPassword,
          role: "TENANT_ADMIN",
          tenantId: tenant.id,
          isActive: true,
        },
      })

      return { tenant, adminUser }
    })

    return NextResponse.json({
      message: "Tenant created successfully",
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        subdomain: result.tenant.subdomain,
      },
    })
  } catch (error: any) {
    console.error("Tenant creation error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create tenant" },
      { status: 500 }
    )
  }
}

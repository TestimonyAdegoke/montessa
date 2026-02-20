"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function getUsers(filters?: {
  role?: string
  search?: string
  isActive?: boolean
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const where: any = { tenantId: session.user.tenantId }

  if (filters?.role && filters.role !== "ALL") {
    where.role = filters.role
  }
  if (typeof filters?.isActive === "boolean") {
    where.isActive = filters.isActive
  }
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      image: true,
      phone: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return users
}

export async function getUser(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const user = await prisma.user.findFirst({
    where: { id, tenantId: session.user.tenantId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      image: true,
      phone: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      twoFactorEnabled: true,
    },
  })

  if (!user) throw new Error("User not found")
  return user
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: string
  phone?: string
  isActive?: boolean
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  // TENANT_ADMIN cannot create SUPER_ADMIN
  if (session.user.role === "TENANT_ADMIN" && data.role === "SUPER_ADMIN") {
    throw new Error("Insufficient permissions to create Super Admin users")
  }

  // Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error("A user with this email already exists")

  const hashedPassword = await bcrypt.hash(data.password, 12)

  const user = await (prisma.user.create as any)({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      phone: data.phone || null,
      isActive: data.isActive ?? true,
      tenantId: session.user.tenantId,
    },
  })

  // Audit log
  await (prisma.auditLog.create as any)({
    data: {
      tenantId: session.user.tenantId,
      userId: session.user.id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      newValues: { name: data.name, email: data.email, role: data.role },
    },
  })

  return user
}

export async function updateUser(
  id: string,
  data: {
    name?: string
    email?: string
    role?: string
    phone?: string
    isActive?: boolean
  }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  // Verify user belongs to same tenant
  const existing = await prisma.user.findFirst({
    where: { id, tenantId: session.user.tenantId },
  })
  if (!existing) throw new Error("User not found")

  // TENANT_ADMIN cannot promote to SUPER_ADMIN
  if (session.user.role === "TENANT_ADMIN" && data.role === "SUPER_ADMIN") {
    throw new Error("Insufficient permissions to assign Super Admin role")
  }

  // Prevent demoting yourself
  if (id === session.user.id && data.role && data.role !== session.user.role) {
    throw new Error("You cannot change your own role")
  }

  // Prevent deactivating yourself
  if (id === session.user.id && data.isActive === false) {
    throw new Error("You cannot deactivate your own account")
  }

  // Check email uniqueness if changing
  if (data.email && data.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: data.email } })
    if (emailTaken) throw new Error("A user with this email already exists")
  }

  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.role !== undefined) updateData.role = data.role
  if (data.phone !== undefined) updateData.phone = data.phone || null
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  })

  await (prisma.auditLog.create as any)({
    data: {
      tenantId: session.user.tenantId,
      userId: session.user.id,
      action: "UPDATE",
      entity: "User",
      entityId: id,
      newValues: updateData,
    },
  })

  return user
}

export async function resetUserPassword(id: string, newPassword: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const existing = await prisma.user.findFirst({
    where: { id, tenantId: session.user.tenantId },
  })
  if (!existing) throw new Error("User not found")

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  })

  await (prisma.auditLog.create as any)({
    data: {
      tenantId: session.user.tenantId,
      userId: session.user.id,
      action: "UPDATE",
      entity: "User",
      entityId: id,
      newValues: { passwordReset: true },
    },
  })

  return { success: true }
}

export async function deleteUser(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  if (id === session.user.id) {
    throw new Error("You cannot delete your own account")
  }

  const existing = await prisma.user.findFirst({
    where: { id, tenantId: session.user.tenantId },
  })
  if (!existing) throw new Error("User not found")

  // Soft delete - deactivate instead of hard delete
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  })

  await (prisma.auditLog.create as any)({
    data: {
      tenantId: session.user.tenantId,
      userId: session.user.id,
      action: "DELETE",
      entity: "User",
      entityId: id,
      newValues: { deactivated: true, name: existing.name, email: existing.email },
    },
  })

  return { success: true }
}

export async function bulkUpdateRole(userIds: string[], role: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  if (session.user.role === "TENANT_ADMIN" && role === "SUPER_ADMIN") {
    throw new Error("Insufficient permissions")
  }

  // Filter out self
  const ids = userIds.filter((uid) => uid !== session.user.id)

  await prisma.user.updateMany({
    where: { id: { in: ids }, tenantId: session.user.tenantId },
    data: { role: role as any },
  })

  return { success: true, count: ids.length }
}

export async function bulkToggleActive(userIds: string[], isActive: boolean) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const ids = userIds.filter((uid) => uid !== session.user.id)

  await prisma.user.updateMany({
    where: { id: { in: ids }, tenantId: session.user.tenantId },
    data: { isActive },
  })

  return { success: true, count: ids.length }
}

export async function getUserStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  const tenantId = session.user.tenantId

  const [total, active, inactive, byRole] = await Promise.all([
    prisma.user.count({ where: { tenantId } }),
    prisma.user.count({ where: { tenantId, isActive: true } }),
    prisma.user.count({ where: { tenantId, isActive: false } }),
    prisma.user.groupBy({
      by: ["role"],
      where: { tenantId },
      _count: { role: true },
    }),
  ])

  const roleCounts: Record<string, number> = {}
  for (const r of byRole) {
    roleCounts[r.role] = r._count.role
  }

  return { total, active, inactive, roleCounts }
}

"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getStaffRecords(filters?: { department?: string; status?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(session.user.role)) {
    throw new Error("Forbidden")
  }

  const where: any = { tenantId: session.user.tenantId }
  if (filters?.department) where.department = filters.department
  if (filters?.status) where.status = filters.status

  const staff = await prisma.staffRecord.findMany({
    where,
    orderBy: { fullName: "asc" },
  })

  return staff
}

export async function getStaffRecord(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const record = await prisma.staffRecord.findUnique({
    where: { id },
    include: {
      LeaveRequest: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  return record
}

export async function createStaffRecord(data: {
  userId: string
  fullName: string
  employeeNumber: string
  department: string
  designation: string
  employmentType?: string
  joinDate: string
  salary?: number
  dateOfBirth?: string
  gender?: string
  nationalId?: string
  emergencyName?: string
  emergencyPhone?: string
  emergencyRelation?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(session.user.role)) {
    throw new Error("Forbidden")
  }

  const record = await prisma.staffRecord.create({
    data: {
      tenantId: session.user.tenantId,
      userId: data.userId,
      fullName: data.fullName,
      employeeNumber: data.employeeNumber,
      department: data.department,
      designation: data.designation,
      employmentType: (data.employmentType as any) || "FULL_TIME",
      joinDate: new Date(data.joinDate),
      salary: data.salary,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender as any,
      nationalId: data.nationalId,
      emergencyName: data.emergencyName,
      emergencyPhone: data.emergencyPhone,
      emergencyRelation: data.emergencyRelation,
    },
  })

  revalidatePath("/dashboard/staff")
  return record
}

export async function updateStaffRecord(id: string, data: Record<string, any>) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(session.user.role)) {
    throw new Error("Forbidden")
  }

  const record = await prisma.staffRecord.update({
    where: { id },
    data,
  })

  revalidatePath("/dashboard/staff")
  return record
}

export async function getLeaveRequests(filters?: { status?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const where: any = { tenantId: session.user.tenantId }
  if (filters?.status) where.status = filters.status

  // If not admin/HR, only show own leave requests
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(session.user.role)) {
    const staffRecord = await prisma.staffRecord.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (staffRecord) where.staffId = staffRecord.id
    else return []
  }

  const requests = await prisma.leaveRequest.findMany({
    where,
    include: {
      StaffRecord: { select: { fullName: true, department: true, designation: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return requests
}

export async function createLeaveRequest(data: {
  leaveType: string
  startDate: string
  endDate: string
  reason: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const staffRecord = await prisma.staffRecord.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  if (!staffRecord) throw new Error("No staff record found for this user")

  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  const request = await prisma.leaveRequest.create({
    data: {
      staffId: staffRecord.id,
      tenantId: session.user.tenantId,
      leaveType: data.leaveType as any,
      startDate: start,
      endDate: end,
      totalDays,
      reason: data.reason,
    },
  })

  // Notify admins
  const admins = await prisma.user.findMany({
    where: {
      tenantId: session.user.tenantId,
      role: { in: ["TENANT_ADMIN", "HR"] },
      isActive: true,
    },
    select: { id: true },
  })

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        tenantId: session.user.tenantId,
        recipientId: admin.id,
        title: "New Leave Request",
        body: `${session.user.name || "A staff member"} has requested ${data.leaveType.toLowerCase()} leave from ${data.startDate} to ${data.endDate}.`,
        type: "INFO" as any,
        category: "SYSTEM" as any,
        channels: ["IN_APP"] as any[],
        actionUrl: "/dashboard/staff",
      })),
    })
  }

  revalidatePath("/dashboard/staff")
  return request
}

export async function approveLeaveRequest(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(session.user.role)) {
    throw new Error("Forbidden")
  }

  const request = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedBy: session.user.id,
      approvedAt: new Date(),
    },
    include: { StaffRecord: { select: { userId: true, fullName: true } } },
  })

  // Notify staff member
  await prisma.notification.create({
    data: {
      tenantId: session.user.tenantId,
      recipientId: request.StaffRecord.userId,
      title: "Leave Request Approved",
      body: `Your ${request.leaveType.toLowerCase()} leave request has been approved.`,
      type: "SUCCESS" as any,
      category: "SYSTEM" as any,
      channels: ["IN_APP", "EMAIL"] as any[],
      actionUrl: "/dashboard/staff",
    },
  })

  revalidatePath("/dashboard/staff")
  return request
}

export async function rejectLeaveRequest(id: string, reason: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(session.user.role)) {
    throw new Error("Forbidden")
  }

  const request = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: "REJECTED",
      approvedBy: session.user.id,
      approvedAt: new Date(),
      rejectionReason: reason,
    },
    include: { StaffRecord: { select: { userId: true } } },
  })

  await prisma.notification.create({
    data: {
      tenantId: session.user.tenantId,
      recipientId: request.StaffRecord.userId,
      title: "Leave Request Rejected",
      body: `Your leave request was rejected. Reason: ${reason}`,
      type: "WARNING" as any,
      category: "SYSTEM" as any,
      channels: ["IN_APP"] as any[],
      actionUrl: "/dashboard/staff",
    },
  })

  revalidatePath("/dashboard/staff")
  return request
}

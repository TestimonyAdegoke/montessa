"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { studentSchema } from "@/lib/validations/student"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function createStudent(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    // Parse form data
    const data = {
      legalName: formData.get("legalName") as string,
      preferredName: formData.get("preferredName") as string || undefined,
      dateOfBirth: new Date(formData.get("dateOfBirth") as string),
      gender: formData.get("gender") as string,
      admissionNumber: formData.get("admissionNumber") as string,
      email: formData.get("email") as string || undefined,
      phone: formData.get("phone") as string || undefined,
      address: formData.get("address") as string || undefined,
      city: formData.get("city") as string || undefined,
      state: formData.get("state") as string || undefined,
      zipCode: formData.get("zipCode") as string || undefined,
      emergencyContact: formData.get("emergencyContact") as string || undefined,
      emergencyPhone: formData.get("emergencyPhone") as string || undefined,
      bloodGroup: formData.get("bloodGroup") as string || undefined,
      allergies: formData.get("allergies") ? JSON.parse(formData.get("allergies") as string) : [],
      medicalConditions: formData.get("medicalConditions") ? JSON.parse(formData.get("medicalConditions") as string) : [],
      medications: formData.get("medications") ? JSON.parse(formData.get("medications") as string) : [],
      doctorName: formData.get("doctorName") as string || undefined,
      doctorPhone: formData.get("doctorPhone") as string || undefined,
      currentClassId: formData.get("currentClassId") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    }

    // Validate
    const validated = studentSchema.parse(data)

    // Generate default email if not provided
    const studentEmail = validated.email || 
      `${validated.legalName.toLowerCase().replace(/\s+/g, '.')}@student.${session.user.tenantId}.com`

    // Create user account
    const password = await bcrypt.hash("Student123!", 10)
    const user = await prisma.user.create({
      data: {
        email: studentEmail,
        password,
        name: validated.legalName,
        phone: validated.phone,
        role: "STUDENT",
        tenantId: session.user.tenantId,
        isActive: true,
      },
    })

    // Create student
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        tenantId: session.user.tenantId,
        legalName: validated.legalName,
        preferredName: validated.preferredName,
        dateOfBirth: validated.dateOfBirth,
        gender: validated.gender as any,
        admissionNumber: validated.admissionNumber,
        admissionDate: new Date(),
        currentClassId: validated.currentClassId,
        studentStatus: "ACTIVE",
        address: validated.address,
        city: validated.city,
        state: validated.state,
        zipCode: validated.zipCode,
        emergencyContact: validated.emergencyContact,
        emergencyPhone: validated.emergencyPhone,
        bloodGroup: validated.bloodGroup,
        allergies: validated.allergies,
        medicalConditions: validated.medicalConditions,
        medications: validated.medications,
        doctorName: validated.doctorName,
        doctorPhone: validated.doctorPhone,
        notes: validated.notes,
      },
    })

    // Enroll in class if provided
    if (validated.currentClassId) {
      await prisma.classEnrollment.create({
        data: {
          studentId: student.id,
          classId: validated.currentClassId,
          status: "ACTIVE",
        },
      })
    }

    revalidatePath("/dashboard/students")
    return { success: true, data: student }
  } catch (error: any) {
    console.error("Create student error:", error)
    return { success: false, error: error.message || "Failed to create student" }
  }
}

export async function updateStudent(studentId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    // Parse form data
    const data = {
      legalName: formData.get("legalName") as string,
      preferredName: formData.get("preferredName") as string || undefined,
      dateOfBirth: new Date(formData.get("dateOfBirth") as string),
      gender: formData.get("gender") as string,
      phone: formData.get("phone") as string || undefined,
      address: formData.get("address") as string || undefined,
      city: formData.get("city") as string || undefined,
      state: formData.get("state") as string || undefined,
      zipCode: formData.get("zipCode") as string || undefined,
      emergencyContact: formData.get("emergencyContact") as string || undefined,
      emergencyPhone: formData.get("emergencyPhone") as string || undefined,
      bloodGroup: formData.get("bloodGroup") as string || undefined,
      allergies: formData.get("allergies") ? JSON.parse(formData.get("allergies") as string) : [],
      medicalConditions: formData.get("medicalConditions") ? JSON.parse(formData.get("medicalConditions") as string) : [],
      medications: formData.get("medications") ? JSON.parse(formData.get("medications") as string) : [],
      doctorName: formData.get("doctorName") as string || undefined,
      doctorPhone: formData.get("doctorPhone") as string || undefined,
      currentClassId: formData.get("currentClassId") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    }

    // Get existing student
    const existingStudent = await prisma.student.findFirst({
      where: { id: studentId, tenantId: session.user.tenantId },
      include: { User: true },
    })

    if (!existingStudent) {
      return { success: false, error: "Student not found" }
    }

    // Update user
    await prisma.user.update({
      where: { id: existingStudent.userId },
      data: {
        name: data.legalName,
        phone: data.phone,
      },
    })

    // Update student
    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        legalName: data.legalName,
        preferredName: data.preferredName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender as any,
        currentClassId: data.currentClassId,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        bloodGroup: data.bloodGroup,
        allergies: data.allergies,
        medicalConditions: data.medicalConditions,
        medications: data.medications,
        doctorName: data.doctorName,
        doctorPhone: data.doctorPhone,
        notes: data.notes,
      },
    })

    // Update class enrollment if changed
    if (data.currentClassId && data.currentClassId !== existingStudent.currentClassId) {
      // Mark old enrollment as inactive
      await prisma.classEnrollment.updateMany({
        where: {
          studentId: student.id,
          status: "ACTIVE",
        },
        data: {
          status: "WITHDRAWN",
        },
      })

      // Create new enrollment
      await prisma.classEnrollment.create({
        data: {
          studentId: student.id,
          classId: data.currentClassId,
          status: "ACTIVE",
        },
      })
    }

    revalidatePath("/dashboard/students")
    revalidatePath(`/dashboard/students/${studentId}`)
    return { success: true, data: student }
  } catch (error: any) {
    console.error("Update student error:", error)
    return { success: false, error: error.message || "Failed to update student" }
  }
}

export async function deleteStudent(studentId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId: session.user.tenantId },
    })

    if (!student) {
      return { success: false, error: "Student not found" }
    }

    // Soft delete - mark as inactive
    await prisma.student.update({
      where: { id: studentId },
      data: { studentStatus: "INACTIVE" },
    })

    await prisma.user.update({
      where: { id: student.userId },
      data: { isActive: false },
    })

    revalidatePath("/dashboard/students")
    return { success: true }
  } catch (error: any) {
    console.error("Delete student error:", error)
    return { success: false, error: error.message || "Failed to delete student" }
  }
}

export async function getAvailableClasses() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return []
    }

    const classes = await prisma.class.findMany({
      where: {
        tenantId: session.user.tenantId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        grade: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return classes
  } catch (error) {
    console.error("Get classes error:", error)
    return []
  }
}

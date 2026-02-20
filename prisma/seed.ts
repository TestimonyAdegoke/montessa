import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import QRCode from "qrcode"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create a demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: "demo" },
    update: {},
    create: {
      name: "Lincoln Elementary School",
      subdomain: "demo",
      status: "ACTIVE",
      plan: "premium",
      maxUsers: 100,
      enabledModules: JSON.stringify([
        "students",
        "attendance",
        "guardians",
        "classes",
        "assessments",
        "messaging",
        "analytics",
        "billing",
      ]),
      settings: JSON.stringify({
        theme: "light",
        timezone: "America/New_York",
        dateFormat: "MM/DD/YYYY",
        academicYear: "2024-2025",
      }),
    },
  })
  console.log("✓ Created tenant:", tenant.name)

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: adminPassword,
      name: "Admin User",
      role: "TENANT_ADMIN",
      tenantId: tenant.id,
      isActive: true,
    },
  })
  console.log("✓ Created admin:", admin.email)

  // Create teachers
  const teachersData = [
    { name: "Sarah Johnson", email: "sarah.johnson@demo.com", department: "Early Childhood" },
    { name: "Michael Chen", email: "michael.chen@demo.com", department: "Elementary" },
    { name: "Emily Rodriguez", email: "emily.rodriguez@demo.com", department: "Montessori" },
  ]

  const teachers = []
  for (const teacherData of teachersData) {
    const password = await bcrypt.hash("Teacher123!", 10)
    const teacherUser = await prisma.user.upsert({
      where: { email: teacherData.email },
      update: {},
      create: {
        email: teacherData.email,
        password,
        name: teacherData.name,
        role: "TEACHER",
        tenantId: tenant.id,
        isActive: true,
      },
    })

    const teacher = await prisma.teacher.upsert({
      where: { userId: teacherUser.id },
      update: {},
      create: {
        userId: teacherUser.id,
        employeeId: `T${Math.random().toString().substring(2, 7)}`,
        department: teacherData.department,
        qualification: "M.Ed",
        experience: Math.floor(Math.random() * 10) + 5,
        status: "ACTIVE",
      },
    })
    teachers.push(teacher)
  }
  console.log("✓ Created teachers:", teachers.length)

  // Create classes
  const classesData = [
    { name: "Kindergarten A", grade: "K", capacity: 20 },
    { name: "Grade 1-A", grade: "1", capacity: 25 },
    { name: "Grade 2-B", grade: "2", capacity: 25 },
    { name: "Grade 3-A", grade: "3", capacity: 30 },
  ]

  const classes = []
  for (let i = 0; i < classesData.length; i++) {
    const classData = classesData[i]
    const cls = await prisma.class.create({
      data: {
        tenantId: tenant.id,
        name: classData.name,
        grade: classData.grade,
        academicYear: "2024-2025",
        capacity: classData.capacity,
        roomNumber: `${100 + i}`,
        status: "ACTIVE",
      },
    })

    // Assign teacher to class
    await prisma.classTeacher.create({
      data: {
        classId: cls.id,
        teacherId: teachers[i % teachers.length].id,
        isPrimary: true,
      },
    })

    classes.push(cls)
  }
  console.log("✓ Created classes:", classes.length)

  // Create guardians and students
  const studentsData = [
    {
      student: {
        legalName: "Emma Williams",
        preferredName: "Emmy",
        dateOfBirth: new Date("2017-03-15"),
        gender: "FEMALE",
        allergies: ["Peanuts"],
        medicalConditions: [],
      },
      guardian: {
        name: "Jennifer Williams",
        email: "jennifer.williams@example.com",
        phone: "+1-555-0101",
        relationship: "MOTHER",
      },
    },
    {
      student: {
        legalName: "Noah Anderson",
        preferredName: "Noah",
        dateOfBirth: new Date("2016-07-22"),
        gender: "MALE",
        allergies: [],
        medicalConditions: ["Asthma"],
      },
      guardian: {
        name: "David Anderson",
        email: "david.anderson@example.com",
        phone: "+1-555-0102",
        relationship: "FATHER",
      },
    },
    {
      student: {
        legalName: "Olivia Martinez",
        preferredName: "Liv",
        dateOfBirth: new Date("2017-11-08"),
        gender: "FEMALE",
        allergies: ["Dairy"],
        medicalConditions: [],
      },
      guardian: {
        name: "Maria Martinez",
        email: "maria.martinez@example.com",
        phone: "+1-555-0103",
        relationship: "MOTHER",
      },
    },
    {
      student: {
        legalName: "Liam Thompson",
        preferredName: null,
        dateOfBirth: new Date("2018-01-30"),
        gender: "MALE",
        allergies: [],
        medicalConditions: [],
      },
      guardian: {
        name: "Robert Thompson",
        email: "robert.thompson@example.com",
        phone: "+1-555-0104",
        relationship: "FATHER",
      },
    },
    {
      student: {
        legalName: "Sophia Lee",
        preferredName: "Sophie",
        dateOfBirth: new Date("2016-05-12"),
        gender: "FEMALE",
        allergies: [],
        medicalConditions: [],
      },
      guardian: {
        name: "Lisa Lee",
        email: "lisa.lee@example.com",
        phone: "+1-555-0105",
        relationship: "MOTHER",
      },
    },
  ]

  for (let i = 0; i < studentsData.length; i++) {
    const data = studentsData[i]
    const admissionNumber = `ADM${new Date().getFullYear()}${String(i + 1).padStart(4, "0")}`

    // Create student user
    const studentEmail = `${data.student.legalName.toLowerCase().replace(" ", ".")}@demo.com`
    const studentPassword = await bcrypt.hash("Student123!", 10)
    const studentUser = await prisma.user.upsert({
      where: { email: studentEmail },
      update: {},
      create: {
        email: studentEmail,
        password: studentPassword,
        name: data.student.legalName,
        role: "STUDENT",
        tenantId: tenant.id,
        isActive: true,
      },
    })

    // Create student
    const student = await prisma.student.upsert({
      where: { userId: studentUser.id },
      update: {},
      create: {
        userId: studentUser.id,
        tenantId: tenant.id,
        legalName: data.student.legalName,
        preferredName: data.student.preferredName,
        dateOfBirth: data.student.dateOfBirth,
        gender: data.student.gender as any,
        admissionNumber,
        admissionDate: new Date("2024-09-01"),
        currentClassId: classes[i % classes.length].id,
        studentStatus: "ACTIVE",
        allergies: data.student.allergies,
        medicalConditions: data.student.medicalConditions,
      },
    })

    // Enroll in class
    const existingEnrollment = await prisma.classEnrollment.findFirst({
      where: { studentId: student.id, classId: classes[i % classes.length].id },
    })
    if (!existingEnrollment) {
      await prisma.classEnrollment.create({
        data: {
          studentId: student.id,
          classId: classes[i % classes.length].id,
          status: "ACTIVE",
        },
      })
    }

    // Create guardian user
    const guardianPassword = await bcrypt.hash("Guardian123!", 10)
    const guardianUser = await prisma.user.upsert({
      where: { email: data.guardian.email },
      update: {},
      create: {
        email: data.guardian.email,
        password: guardianPassword,
        name: data.guardian.name,
        phone: data.guardian.phone,
        role: "GUARDIAN",
        tenantId: tenant.id,
        isActive: true,
      },
    })

    // Generate QR code
    const qrData = `guardian:${guardianUser.id}:${tenant.id}`
    const qrCode = await QRCode.toDataURL(qrData)

    // Create guardian
    const guardian = await prisma.guardian.upsert({
      where: { userId: guardianUser.id },
      update: {},
      create: {
        userId: guardianUser.id,
        tenantId: tenant.id,
        qrCode: qrData,
        isVerified: true,
        verifiedAt: new Date(),
      },
    })

    // Link guardian to student
    const existingLink = await prisma.studentGuardian.findFirst({
      where: { studentId: student.id, guardianId: guardian.id },
    })
    if (!existingLink) {
      await prisma.studentGuardian.create({
        data: {
          studentId: student.id,
          guardianId: guardian.id,
          relationship: data.guardian.relationship as any,
          isPrimary: true,
          canPickup: true,
        },
      })
    }

    // Create attendance records for the past 10 days
    const existingAttendance = await prisma.attendanceRecord.findFirst({
      where: { studentId: student.id, tenantId: tenant.id },
    })
    if (!existingAttendance) {
      for (let j = 0; j < 10; j++) {
        const date = new Date()
        date.setDate(date.getDate() - j)
        const isPresent = Math.random() > 0.1 // 90% attendance rate

        await prisma.attendanceRecord.create({
          data: {
            studentId: student.id,
            tenantId: tenant.id,
            date,
            status: isPresent ? "PRESENT" : "ABSENT",
            checkInTime: isPresent ? new Date(date.setHours(8, 0, 0)) : null,
            checkInMethod: isPresent ? "QR_CODE" : null,
          },
        })
      }
    }
  }
  console.log("✓ Created students and guardians:", studentsData.length)

  // Create assessments
  const existingAssessments = await prisma.assessment.findFirst({
    where: { teacherId: teachers[0].id },
  })
  if (!existingAssessments) {
    for (const cls of classes) {
      const assessment = await prisma.assessment.create({
        data: {
          classId: cls.id,
          teacherId: teachers[0].id,
          title: `${cls.name} - Math Assessment`,
          description: "Mid-term mathematics assessment",
          subject: "Mathematics",
          totalMarks: 100,
          passingMarks: 50,
          duration: 60,
          type: "TEST",
          status: "COMPLETED",
          scheduledDate: new Date("2025-01-15"),
          questions: JSON.stringify([
            { id: 1, type: "mcq", question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4", marks: 10 },
            { id: 2, type: "mcq", question: "What is 5 x 3?", options: ["15", "10", "20", "25"], answer: "15", marks: 10 },
          ]),
        },
      })

      // Create results for students in this class
      const studentsInClass = await prisma.student.findMany({
        where: { currentClassId: cls.id },
      })

      for (const student of studentsInClass) {
        const obtainedMarks = Math.floor(Math.random() * 40) + 60 // 60-100
        const percentage = obtainedMarks
        const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : "C"

        await prisma.assessmentResult.create({
          data: {
            assessmentId: assessment.id,
            studentId: student.id,
            obtainedMarks,
            totalMarks: 100,
            percentage,
            grade,
            status: "GRADED",
            answers: JSON.stringify({ 1: "4", 2: "15" }),
            submittedAt: new Date("2025-01-15"),
          },
        })
      }
    }
  }
  console.log("✓ Created assessments and results")

  // Create some invoices
  const existingInvoice = await prisma.invoice.findFirst({
    where: { tenantId: tenant.id },
  })
  if (!existingInvoice) {
    const allStudents = await prisma.student.findMany({ 
      where: { tenantId: tenant.id },
      include: { User: true }
    })
    for (let i = 0; i < 3; i++) {
      const student = allStudents[i]
      const invoice = await prisma.invoice.create({
        data: {
          tenantId: tenant.id,
          invoiceNumber: `INV-2025-${String(i + 1).padStart(4, "0")}`,
          billedTo: student.legalName,
          billedToEmail: (student as any).User?.email ?? "",
          subtotal: 500,
          taxAmount: 50,
          totalAmount: 550,
          status: i === 0 ? "PAID" : "PENDING",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paidAt: i === 0 ? new Date() : null,
          items: JSON.stringify([
            { description: "Tuition Fee", amount: 500 },
          ]),
        },
      })

      await prisma.billingRecord.create({
        data: {
          studentId: student.id,
          invoiceId: invoice.id,
          description: "Tuition Fee - January 2025",
          amount: 550,
          dueDate: invoice.dueDate,
          type: "TUITION",
          status: i === 0 ? "PAID" : "PENDING",
        },
      })
    }
  }
  console.log("✓ Created invoices")

  // Create announcements
  const existingAnnouncement = await prisma.announcement.findFirst({
    where: { tenantId: tenant.id },
  })
  if (!existingAnnouncement) {
    await prisma.announcement.create({
      data: {
        tenantId: tenant.id,
        authorId: admin.id,
        title: "Welcome to the New Academic Year!",
        content: "We are excited to start the 2024-2025 academic year. Please check your class schedules and prepare for an amazing year of learning!",
        audience: "ALL",
        targetGroups: [],
        priority: "HIGH",
        isPinned: true,
        publishedAt: new Date(),
      },
    })
  }
  console.log("✓ Created announcements")

  console.log("\n🎉 Database seeding completed successfully!\n")
  console.log("📝 Demo Credentials:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("Admin:")
  console.log("  Email: admin@demo.com")
  console.log("  Password: Admin123!")
  console.log("\nTeacher:")
  console.log("  Email: sarah.johnson@demo.com")
  console.log("  Password: Teacher123!")
  console.log("\nGuardian:")
  console.log("  Email: jennifer.williams@example.com")
  console.log("  Password: Guardian123!")
  console.log("\nStudent:")
  console.log("  Email: emma.williams@demo.com")
  console.log("  Password: Student123!")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

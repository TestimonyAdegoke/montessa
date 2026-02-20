import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { answers } = await request.json()

    // Find the student record
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    })

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

    // Get the assessment to calculate score
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
    })

    if (!assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 })

    const questions = Array.isArray(assessment.questions) ? assessment.questions as any[] : []
    const totalMarks = assessment.totalMarks || questions.length
    let obtainedMarks = 0

    // Auto-grade MCQ and TRUE_FALSE questions
    for (const q of questions) {
      if ((q.type === "MCQ" || q.type === "TRUE_FALSE") && q.correctAnswer && answers[q.id]) {
        if (answers[q.id] === q.correctAnswer) {
          obtainedMarks += q.points || 1
        }
      }
    }

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0
    const passingMarks = assessment.passingMarks || Math.ceil(totalMarks * 0.4)

    // Check for existing result
    const existing = await prisma.assessmentResult.findFirst({
      where: { assessmentId: params.id, studentId: student.id },
    })

    if (existing) {
      // Update existing result
      const result = await prisma.assessmentResult.update({
        where: { id: existing.id },
        data: {
          answers: answers as any,
          obtainedMarks,
          totalMarks,
          percentage,
          submittedAt: new Date(),
          status: "SUBMITTED",
        },
      })
      return NextResponse.json(result)
    }

    // Create new result
    const result = await prisma.assessmentResult.create({
      data: {
        assessmentId: params.id,
        studentId: student.id,
        answers: answers as any,
        obtainedMarks,
        totalMarks,
        percentage,
        startedAt: new Date(),
        submittedAt: new Date(),
        status: "SUBMITTED",
      },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Submit assessment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

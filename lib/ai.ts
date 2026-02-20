// AI-powered features for learning narratives and copilot suggestions
// Uses OpenAI API when configured, falls back to template-based generation

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"

interface NarrativeInput {
  studentName: string
  subjects: { name: string; score: number; grade: string }[]
  attendance: { present: number; total: number }
  strengths: string[]
  areasForImprovement: string[]
  teacherNotes?: string
}

async function callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error("OpenAI not configured")

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || "OpenAI API error")
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ""
}

function generateTemplateNarrative(input: NarrativeInput): string {
  const avgScore = input.subjects.length > 0
    ? input.subjects.reduce((s, sub) => s + sub.score, 0) / input.subjects.length
    : 0
  const attendanceRate = input.attendance.total > 0
    ? ((input.attendance.present / input.attendance.total) * 100).toFixed(1)
    : "N/A"

  const topSubjects = input.subjects
    .filter((s) => s.score >= 80)
    .map((s) => s.name)
  const needsWork = input.subjects
    .filter((s) => s.score < 60)
    .map((s) => s.name)

  let narrative = `${input.studentName} has demonstrated `
  if (avgScore >= 80) narrative += "excellent academic performance"
  else if (avgScore >= 65) narrative += "good academic progress"
  else if (avgScore >= 50) narrative += "satisfactory academic effort"
  else narrative += "areas requiring additional support"
  narrative += ` this term with an average score of ${avgScore.toFixed(1)}%. `

  narrative += `Attendance stands at ${attendanceRate}% (${input.attendance.present}/${input.attendance.total} days). `

  if (topSubjects.length > 0) {
    narrative += `Notable strengths are evident in ${topSubjects.join(", ")}. `
  }
  if (input.strengths.length > 0) {
    narrative += `Key strengths include ${input.strengths.join(", ")}. `
  }
  if (needsWork.length > 0) {
    narrative += `Additional support is recommended in ${needsWork.join(", ")}. `
  }
  if (input.areasForImprovement.length > 0) {
    narrative += `Areas for growth: ${input.areasForImprovement.join(", ")}. `
  }
  if (input.teacherNotes) {
    narrative += input.teacherNotes
  }

  return narrative.trim()
}

export async function generateLearningNarrative(input: NarrativeInput): Promise<string> {
  if (OPENAI_API_KEY) {
    try {
      const prompt = `Generate a professional, warm learning narrative for a student report card based on this data:
Student: ${input.studentName}
Subjects: ${input.subjects.map((s) => `${s.name}: ${s.score}% (${s.grade})`).join(", ")}
Attendance: ${input.attendance.present}/${input.attendance.total} days
Strengths: ${input.strengths.join(", ") || "None specified"}
Areas for Improvement: ${input.areasForImprovement.join(", ") || "None specified"}
Teacher Notes: ${input.teacherNotes || "None"}

Write 2-3 paragraphs that are encouraging, specific, and actionable.`

      return await callOpenAI(prompt, "You are an experienced educator writing student report card narratives. Be professional, warm, and constructive.")
    } catch {
      // Fall back to template
    }
  }

  return generateTemplateNarrative(input)
}

export async function generateCopilotSuggestion(context: {
  type: "lesson_plan" | "assessment" | "feedback" | "iep_goal"
  subject: string
  gradeLevel: string
  additionalContext?: string
}): Promise<string> {
  if (OPENAI_API_KEY) {
    try {
      const prompts: Record<string, string> = {
        lesson_plan: `Suggest a lesson plan outline for ${context.subject} at ${context.gradeLevel} level. ${context.additionalContext || ""}`,
        assessment: `Suggest 5 assessment questions for ${context.subject} at ${context.gradeLevel} level. Include a mix of difficulty levels. ${context.additionalContext || ""}`,
        feedback: `Write constructive feedback for a student in ${context.subject} at ${context.gradeLevel} level. ${context.additionalContext || ""}`,
        iep_goal: `Suggest 3 SMART IEP goals for a student in ${context.subject} at ${context.gradeLevel} level. ${context.additionalContext || ""}`,
      }

      return await callOpenAI(
        prompts[context.type] || prompts.lesson_plan,
        "You are an AI teaching assistant. Provide practical, curriculum-aligned suggestions."
      )
    } catch {
      // Fall back
    }
  }

  const templates: Record<string, string> = {
    lesson_plan: `Lesson Plan Outline for ${context.subject} (${context.gradeLevel}):\n1. Learning Objectives\n2. Materials Needed\n3. Introduction (10 min)\n4. Main Activity (25 min)\n5. Practice/Application (15 min)\n6. Assessment/Closure (10 min)\n\nConfigure OPENAI_API_KEY for AI-generated suggestions.`,
    assessment: `Assessment Suggestions for ${context.subject} (${context.gradeLevel}):\n1. Multiple choice question (Easy)\n2. Short answer question (Medium)\n3. Application problem (Medium)\n4. Analysis question (Hard)\n5. Essay/Extended response (Hard)\n\nConfigure OPENAI_API_KEY for AI-generated questions.`,
    feedback: `Student Feedback Template for ${context.subject}:\n- Acknowledge effort and progress\n- Highlight specific strengths\n- Identify 1-2 areas for improvement\n- Provide actionable next steps\n- End with encouragement\n\nConfigure OPENAI_API_KEY for personalized feedback.`,
    iep_goal: `IEP Goal Suggestions for ${context.subject} (${context.gradeLevel}):\n1. By [date], student will [skill] with [accuracy]% accuracy as measured by [method].\n2. Given [support], student will [behavior] in [frequency] of opportunities.\n3. Student will independently [task] within [timeframe].\n\nConfigure OPENAI_API_KEY for personalized goals.`,
  }

  return templates[context.type] || templates.lesson_plan
}

export function isAIConfigured(): boolean {
  return !!OPENAI_API_KEY
}

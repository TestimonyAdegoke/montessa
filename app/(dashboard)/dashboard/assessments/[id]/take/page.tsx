"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Clock, CheckCircle, ArrowLeft, ArrowRight, Send } from "lucide-react"

interface Question {
  id: string
  text: string
  type: "MCQ" | "SHORT_ANSWER" | "ESSAY" | "TRUE_FALSE"
  options?: string[]
  points: number
}

export default function TakeAssessmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [assessment, setAssessment] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/assessments/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setAssessment(data)
        const qs = Array.isArray(data.questions) ? data.questions : []
        setQuestions(qs)
        if (data.duration) setTimeLeft(data.duration * 60)
        setLoading(false)
      })
      .catch(() => {
        toast({ title: "Error", description: "Failed to load assessment", variant: "destructive" })
        setLoading(false)
      })
  }, [params.id, toast])

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted])

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/assessments/${params.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })

      if (!res.ok) throw new Error("Failed to submit")

      setSubmitted(true)
      toast({ title: "Assessment submitted successfully!" })
    } catch {
      toast({ title: "Error", description: "Failed to submit assessment", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-20">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Assessment Submitted!</h2>
            <p className="text-muted-foreground">
              Your answers have been recorded. You answered {Object.keys(answers).length} of {questions.length} questions.
            </p>
            <Button onClick={() => router.push("/dashboard/my-learning")}>Back to My Learning</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!assessment || questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto mt-20">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <p className="text-muted-foreground">Assessment not found or has no questions.</p>
            <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = questions[currentQ]
  const progress = ((currentQ + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{assessment.title}</h1>
          <p className="text-muted-foreground">{assessment.subject}</p>
        </div>
        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <Badge variant={timeLeft < 300 ? "destructive" : "outline"} className="text-lg px-3 py-1">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
          )}
          <Badge variant="secondary">
            {answeredCount}/{questions.length} answered
          </Badge>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Question {currentQ + 1} of {questions.length}</CardTitle>
            <Badge variant="outline">{question.points || 1} pts</Badge>
          </div>
          <CardDescription className="text-base mt-2 text-foreground">{question.text}</CardDescription>
        </CardHeader>
        <CardContent>
          {(question.type === "MCQ" || question.type === "TRUE_FALSE") && question.options && (
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(val: string) => setAnswers({ ...answers, [question.id]: val })}
              className="space-y-3"
            >
              {question.options.map((opt, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                  <RadioGroupItem value={opt} id={`opt-${i}`} />
                  <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {(question.type === "SHORT_ANSWER" || question.type === "ESSAY") && (
            <Textarea
              value={answers[question.id] || ""}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
              rows={question.type === "ESSAY" ? 8 : 3}
              placeholder={question.type === "ESSAY" ? "Write your essay here..." : "Type your answer..."}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />Previous
        </Button>

        <div className="flex gap-1">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                i === currentQ
                  ? "bg-primary text-primary-foreground"
                  : answers[questions[i]?.id]
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentQ < questions.length - 1 ? (
          <Button onClick={() => setCurrentQ(currentQ + 1)}>
            Next<ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} variant="default">
            <Send className="h-4 w-4 mr-2" />{submitting ? "Submitting..." : "Submit"}
          </Button>
        )}
      </div>

      {/* Question overview */}
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground mb-2">Question Overview</p>
          <div className="flex flex-wrap gap-1">
            {questions.map((q, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded text-xs flex items-center justify-center cursor-pointer ${
                  answers[q.id] ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                }`}
                onClick={() => setCurrentQ(i)}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

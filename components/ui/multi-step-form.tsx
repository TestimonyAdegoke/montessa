"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

interface Step {
  title: string
  description?: string
  content: React.ReactNode
  isValid?: () => boolean
}

interface MultiStepFormProps {
  steps: Step[]
  onComplete: () => void | Promise<void>
  completeLabel?: string
  className?: string
}

export function MultiStepForm({ steps, onComplete, completeLabel = "Submit", className }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canGoNext = () => {
    const step = steps[currentStep]
    return step.isValid ? step.isValid() : true
  }

  const goNext = () => {
    if (!canGoNext()) return
    setCompletedSteps((prev) => Array.from(new Set([...prev, currentStep])))
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleComplete = async () => {
    if (!canGoNext()) return
    setIsSubmitting(true)
    try {
      await onComplete()
      setCompletedSteps((prev) => Array.from(new Set([...prev, currentStep])))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLastStep = currentStep === steps.length - 1

  return (
    <div className={cn("space-y-6", className)}>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            <button
              onClick={() => i < currentStep && setCurrentStep(i)}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                i === currentStep && "bg-primary text-primary-foreground",
                completedSteps.includes(i) && i !== currentStep && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                !completedSteps.includes(i) && i !== currentStep && "bg-muted text-muted-foreground",
                i < currentStep && "cursor-pointer hover:opacity-80"
              )}
            >
              {completedSteps.includes(i) && i !== currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </button>
            {i < steps.length - 1 && (
              <div className={cn(
                "w-12 h-0.5 mx-1",
                completedSteps.includes(i) ? "bg-green-500" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex justify-center">
        <div className="text-center">
          <p className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</p>
          <p className="text-xs text-muted-foreground">{steps[currentStep].title}</p>
        </div>
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{steps[currentStep].title}</CardTitle>
          {steps[currentStep].description && (
            <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
          )}
        </CardHeader>
        <CardContent>{steps[currentStep].content}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={goBack} disabled={currentStep === 0}>
          Back
        </Button>
        <div className="flex gap-2">
          {!isLastStep ? (
            <Button onClick={goNext} disabled={!canGoNext()}>Next</Button>
          ) : (
            <Button onClick={handleComplete} disabled={!canGoNext() || isSubmitting}>
              {isSubmitting ? "Submitting..." : completeLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

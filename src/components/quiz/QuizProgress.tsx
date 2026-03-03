"use client"

import { Progress } from "@/components/ui/progress"

interface QuizProgressProps {
  currentStep: number
  totalSteps: number
}

export function QuizProgress({ currentStep, totalSteps }: QuizProgressProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          Question {currentStep} sur {totalSteps}
        </span>
        <span className="font-medium text-muted-foreground">{percentage}%</span>
      </div>
      <Progress
        value={percentage}
        className="h-2 bg-[#0066CC]/15 [&>[data-slot=progress-indicator]]:bg-[#0066CC]"
      />
    </div>
  )
}

"use client"

import { cn } from "@/lib/utils"
import type { QuizQuestion } from "@/data/quiz-questions"

interface QuizCardProps {
  question: QuizQuestion
  selectedValue: string | null
  onSelect: (value: string, points: number, painPoint?: string) => void
}

export function QuizCard({ question, selectedValue, onSelect }: QuizCardProps) {
  if (question.type === "calculator") {
    return null
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold leading-tight tracking-tight">
          {question.question}
        </h2>
        {question.description && (
          <p className="text-sm text-muted-foreground">{question.description}</p>
        )}
      </div>

      <div className="grid gap-3">
        {question.options?.map((option) => {
          const isSelected = selectedValue === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value, option.points, option.painPoint)}
              className={cn(
                "w-full rounded-lg border p-4 text-left shadow-sm transition-all duration-200",
                "hover:border-[#0066CC]/50 hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC]/50",
                isSelected
                  ? "border-[#0066CC] bg-[#0066CC]/5 shadow-md"
                  : "border-border bg-card"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  isSelected ? "text-[#0066CC]" : "text-foreground"
                )}
              >
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

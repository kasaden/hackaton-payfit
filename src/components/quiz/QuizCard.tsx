"use client";

import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/data/quiz-questions";

interface QuizCardProps {
  question: QuizQuestion;
  selectedValue: string | null;
  onSelect: (value: string, points: number, painPoint?: string) => void;
}

export function QuizCard({ question, selectedValue, onSelect }: QuizCardProps) {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold leading-tight tracking-tight text-[#152330]">
          {question.question}
        </h2>
        {question.description && (
          <p className="text-sm text-gray-500">{question.description}</p>
        )}
      </div>

      <div className="grid gap-3">
        {question.options.map((option) => {
          const isSelected = selectedValue === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onSelect(option.value, option.points, option.painPoint)
              }
              className={cn(
                "w-full rounded-xl border p-5 text-left transition-all duration-200 cursor-pointer",
                "hover:border-[#0066CC] hover:bg-blue-50/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC]/50",
                isSelected
                  ? "border-[#0066CC] bg-blue-50 shadow-sm ring-1 ring-[#0066CC]"
                  : "border-gray-200 bg-white",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-[15px] font-medium transition-colors duration-200",
                    isSelected ? "text-[#0066CC]" : "text-gray-700",
                  )}
                >
                  {option.label}
                </span>

                {/* Petit cercle radio pour montrer que c'est une sélection */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                    isSelected
                      ? "border-[#0066CC] bg-[#0066CC]"
                      : "border-gray-300",
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

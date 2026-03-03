"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { quizQuestions } from "@/data/quiz-questions";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizCard } from "@/components/quiz/QuizCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Answer {
  value: string;
  points: number;
  painPoint?: string;
}

export default function QuizPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = quizQuestions[currentStep];
  const totalSteps = quizQuestions.length;

  const handleSelect = useCallback(
    (value: string, points: number, painPoint?: string) => {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { value, points, painPoint },
      }));
    },
    [currentQuestion.id],
  );

  const canGoNext = answers[currentQuestion.id] !== undefined;

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsSubmitting(true);

      const scoredQuestions = quizQuestions.filter((q) => q.id !== "q12");
      const totalPoints = scoredQuestions.reduce((sum, q) => {
        const answer = answers[q.id];
        return sum + (answer?.points || 0);
      }, 0);

      const maxPoints = scoredQuestions.length * 3;
      const score = Math.round((totalPoints / maxPoints) * 100);

      let lead_category: string;
      if (score >= 70) lead_category = "cold";
      else if (score >= 40) lead_category = "warm";
      else lead_category = "hot";

      const pain_points = Object.values(answers)
        .filter((a) => a.painPoint)
        .map((a) => a.painPoint!);

      const company_size = answers["q12"]?.value || "unknown";

      const answersSimple: Record<string, string> = {};
      Object.entries(answers).forEach(([key, val]) => {
        answersSimple[key] = val.value;
      });

      try {
        await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: answersSimple,
            score,
            lead_category,
            pain_points,
            company_size,
          }),
        });
      } catch (e) {
        console.error("Erreur sauvegarde quiz:", e);
      }

      const params = new URLSearchParams({
        score: score.toString(),
        category: lead_category,
        size: company_size,
        pains: pain_points.join(","),
      });
      router.push(`/quiz/results?${params.toString()}`);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-seo-copilot.png"
              alt="Logo"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="font-semibold text-sm">
              PayFit <span className="text-[#0066CC]">SEO Copilot</span>
            </span>
          </Link>
          <span className="text-sm text-gray-500">Quiz de conformité paie</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <QuizProgress currentStep={currentStep + 1} totalSteps={totalSteps} />

        <div className="mt-8 mb-8">
          <QuizCard
            question={currentQuestion}
            selectedValue={answers[currentQuestion.id]?.value || null}
            onSelect={handleSelect}
          />
        </div>

        <div className="flex justify-between items-center mt-12">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0 || isSubmitting}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          <span className="text-sm text-gray-400 font-medium">
            {currentStep + 1} / {totalSteps}
          </span>

          <Button
            onClick={handleNext}
            disabled={!canGoNext || isSubmitting}
            className="bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer px-6"
          >
            {isSubmitting
              ? "Calcul en cours..."
              : currentStep === totalSteps - 1
                ? "Voir mes résultats"
                : "Suivant"}
            {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { quizQuestions } from "@/data/quiz-questions";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizCard } from "@/components/quiz/QuizCard";
import { MiniCalculator } from "@/components/quiz/MiniCalculator";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Zap } from "lucide-react";
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
    [currentQuestion.id]
  );

  const handleCalculatorComplete = useCallback(
    (points: number) => {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { value: "calculator_done", points },
      }));
    },
    [currentQuestion.id]
  );

  const canGoNext = answers[currentQuestion.id] !== undefined;

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Calcul final
      setIsSubmitting(true);

      // Questions notées (toutes sauf q12 qui est la taille)
      const scoredQuestions = quizQuestions.filter(
        (q) => q.id !== "q12"
      );
      const totalPoints = scoredQuestions.reduce((sum, q) => {
        const answer = answers[q.id];
        return sum + (answer?.points || 0);
      }, 0);
      const maxPoints = scoredQuestions.length * 3;
      const score = Math.round((totalPoints / maxPoints) * 100);

      // Lead category
      let lead_category: string;
      if (score >= 70) lead_category = "cold";
      else if (score >= 40) lead_category = "warm";
      else lead_category = "hot";

      // Pain points
      const pain_points = Object.values(answers)
        .filter((a) => a.painPoint)
        .map((a) => a.painPoint!);

      // Company size
      const company_size = answers["q12"]?.value || "unknown";

      // Sauvegarder en BDD
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

      // Encoder les pain points pour l'URL
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
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0066CC] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm">
              PayFit <span className="text-[#0066CC]">SEO Copilot</span>
            </span>
          </Link>
          <span className="text-sm text-gray-500">Quiz de conformité paie</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <QuizProgress currentStep={currentStep + 1} totalSteps={totalSteps} />

        {/* Question */}
        <div className="mt-8 mb-8">
          {currentQuestion.type === "calculator" && currentQuestion.calculator ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {currentQuestion.question}
              </h2>
              {currentQuestion.description && (
                <p className="text-gray-500 text-sm mb-6">
                  {currentQuestion.description}
                </p>
              )}
              <MiniCalculator
                type={currentQuestion.calculator.type}
                onComplete={handleCalculatorComplete}
              />
              {answers[currentQuestion.id] && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center">
                  Calcul validé !
                </div>
              )}
            </div>
          ) : (
            <QuizCard
              question={currentQuestion}
              selectedValue={answers[currentQuestion.id]?.value || null}
              onSelect={handleSelect}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>
          <span className="text-sm text-gray-400">
            {currentStep + 1} / {totalSteps}
          </span>
          <Button
            onClick={handleNext}
            disabled={!canGoNext || isSubmitting}
            className="bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer"
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

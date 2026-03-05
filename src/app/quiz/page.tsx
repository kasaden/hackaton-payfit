"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { quizQuestions, quizThemes, getQuestionsForTheme } from "@/data/quiz-questions";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizCard } from "@/components/quiz/QuizCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Answer {
  value: string;
  points: number;
  painPoint?: string;
}

interface PublishedArticle {
  slug: string;
  title: string;
  keyword_primary: string | null;
}

function findRelatedArticle(
  topics: string[],
  articles: PublishedArticle[]
): PublishedArticle | null {
  if (!topics.length || !articles.length) return null;
  let best: PublishedArticle | null = null;
  let bestScore = 0;
  for (const article of articles) {
    const haystack = `${article.title} ${article.keyword_primary || ""}`.toLowerCase();
    let score = 0;
    for (const topic of topics) {
      if (haystack.includes(topic.toLowerCase())) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = article;
    }
  }
  return best;
}

export default function QuizPage() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [articles, setArticles] = useState<PublishedArticle[]>([]);

  const activeQuestions = selectedTheme
    ? getQuestionsForTheme(selectedTheme)
    : quizQuestions;

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("articles")
      .select("slug, title, keyword_primary")
      .eq("is_published", true)
      .then(({ data }) => {
        if (data) setArticles(data);
      });
  }, []);

  const currentQuestion = activeQuestions[currentStep];
  const totalSteps = activeQuestions.length;

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

      const scoredQuestions = activeQuestions.filter((q) => q.id !== "q12");
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
        const res = await fetch("/api/quiz", {
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
        if (!res.ok) {
          console.error("Erreur sauvegarde quiz:", res.status);
        }
      } catch (e) {
        console.error("Erreur sauvegarde quiz:", e);
      }

      const params = new URLSearchParams({
        score: score.toString(),
        category: lead_category,
        size: company_size,
        pains: pain_points.join(","),
        ...(selectedTheme && selectedTheme !== "all" ? { theme: selectedTheme } : {}),
      });
      router.push(`/quiz/results?${params.toString()}`);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    setCurrentStep(0);
    setAnswers({});
  };

  const handleBackToThemes = () => {
    setSelectedTheme(null);
    setCurrentStep(0);
    setAnswers({});
  };

  const currentTheme = quizThemes.find((t) => t.id === selectedTheme);

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
          <span className="text-sm text-gray-500">
            {currentTheme ? currentTheme.title : "Quiz de conformité paie"}
          </span>
        </div>
      </header>

      {!selectedTheme ? (
        <main className="max-w-2xl mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#152330] mb-2">
              Testez votre conformité paie 2026
            </h1>
            <p className="text-gray-500">
              Choisissez un thème ou lancez le quiz complet
            </p>
          </div>

          <div className="grid gap-4">
            {quizThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className="w-full text-left p-5 bg-white rounded-xl border border-gray-200 hover:border-[#0066CC] hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${theme.color}10` }}
                  >
                    {theme.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#152330] group-hover:text-[#0066CC] transition-colors">
                        {theme.title}
                      </h3>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {theme.questionIds.length + (theme.questionIds.includes("q12") ? 0 : 1)} questions
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {theme.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#0066CC] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </main>
      ) : (
        <main className="max-w-2xl mx-auto px-4 py-8">
          <QuizProgress currentStep={currentStep + 1} totalSteps={totalSteps} />

          <div className="mt-8 mb-8">
            <QuizCard
              question={currentQuestion}
              selectedValue={answers[currentQuestion.id]?.value || null}
              onSelect={handleSelect}
            />

            {answers[currentQuestion.id] && currentQuestion.relatedTopics && (() => {
              const related = findRelatedArticle(currentQuestion.relatedTopics!, articles);
              if (!related) return null;
              return (
                <div className="mt-4 p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
                  <Link
                    href={`/articles/${related.slug}`}
                    target="_blank"
                    className="flex items-center gap-2 text-sm text-[#0066CC] hover:underline"
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>En savoir plus : {related.title}</span>
                  </Link>
                </div>
              );
            })()}
          </div>

          <div className="flex justify-between items-center mt-12">
            <Button
              variant="ghost"
              onClick={currentStep === 0 ? handleBackToThemes : handlePrev}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 0 ? "Thèmes" : "Précédent"}
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
      )}
    </div>
  );
}

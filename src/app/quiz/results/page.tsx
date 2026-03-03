"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { painPointLabels } from "@/data/quiz-questions";

function ResultsContent() {
  const searchParams = useSearchParams();
  const score = parseInt(searchParams.get("score") || "0");
  const category = searchParams.get("category") || "warm";
  const size = searchParams.get("size") || "unknown";
  const pains = searchParams.get("pains")?.split(",").filter(Boolean) || [];

  const getScoreConfig = () => {
    if (score >= 70) {
      return {
        icon: CheckCircle,
        color: "text-[#2E7D32]",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        ringColor: "stroke-[#2E7D32]",
        title: "Votre paie est bien gérée !",
        subtitle:
          "Bravo, vous maîtrisez les principales obligations paie 2026. Quelques optimisations sont possibles.",
      };
    }
    if (score >= 40) {
      return {
        icon: AlertTriangle,
        color: "text-[#E65100]",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        ringColor: "stroke-[#E65100]",
        title: "Quelques points à vérifier",
        subtitle:
          "Votre gestion de paie présente des zones de risque. Nous vous recommandons de vérifier les points ci-dessous.",
      };
    }
    return {
      icon: XCircle,
      color: "text-[#C62828]",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      ringColor: "stroke-[#C62828]",
      title: "Attention, risques de non-conformité",
      subtitle:
        "Plusieurs aspects critiques de votre paie nécessitent une mise à jour urgente pour être conforme en 2026.",
    };
  };

  const config = getScoreConfig();
  const Icon = config.icon;

  // Jauge circulaire SVG
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-seo-copilot.png" alt="Logo" width={28} height={28} className="rounded-lg" />
            <span className="font-semibold text-sm">
              PayFit <span className="text-[#0066CC]">SEO Copilot</span>
            </span>
          </Link>
          <span className="text-sm text-gray-500">Résultats du quiz</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Score */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <svg width="180" height="180" className="-rotate-90">
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                className={config.ringColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 1s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${config.color}`}>
                {score}
              </span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-2 ${config.bgColor} ${config.borderColor} border px-4 py-2 rounded-full mb-4`}
          >
            <Icon className={`w-5 h-5 ${config.color}`} />
            <span className={`font-medium ${config.color}`}>
              {config.title}
            </span>
          </div>
          <p className="text-gray-600 max-w-md mx-auto">{config.subtitle}</p>
        </div>

        {/* Taille entreprise */}
        {size !== "unknown" && (
          <div className="text-center mb-8">
            <Badge variant="secondary" className="text-sm">
              Entreprise : {size} salariés
            </Badge>
          </div>
        )}

        {/* Pain points */}
        {pains.length > 0 && (
          <Card className="p-6 mb-8">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#E65100]" />
              Points de vigilance identifiés
            </h3>
            <div className="space-y-3">
              {pains.map((pain) => (
                <div
                  key={pain}
                  className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg"
                >
                  <div className="w-2 h-2 rounded-full bg-[#E65100] mt-2 shrink-0" />
                  <p className="text-sm text-gray-700">
                    {painPointLabels[pain] || pain}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recommandation */}
        <Card className="p-6 mb-8 border-[#0066CC]/20 bg-blue-50/50">
          <h3 className="font-semibold text-lg mb-2 text-[#0066CC]">
            Notre recommandation
          </h3>
          {category === "hot" && (
            <p className="text-gray-700 text-sm leading-relaxed">
              Votre gestion de paie présente des risques significatifs de
              non-conformité. Avec les nombreux changements 2026 (RGDU,
              transparence salariale, nouveaux congés), il est crucial de vous
              équiper d&apos;un outil de paie automatisé qui intègre ces
              évolutions en continu. PayFit met à jour automatiquement vos
              bulletins à chaque changement légal.
            </p>
          )}
          {category === "warm" && (
            <p className="text-gray-700 text-sm leading-relaxed">
              Vous avez de bonnes bases mais certains changements 2026 vous ont
              échappé. Un logiciel de paie comme PayFit vous permettrait
              d&apos;automatiser votre veille réglementaire et de garantir la
              conformité de vos bulletins sans effort supplémentaire.
            </p>
          )}
          {category === "cold" && (
            <p className="text-gray-700 text-sm leading-relaxed">
              Excellente maîtrise ! Pour aller encore plus loin, PayFit vous
              permet d&apos;automatiser vos rapports de transparence salariale et
              de préparer sereinement la directive européenne 2023/970.
            </p>
          )}
        </Card>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://payfit.com/fr/demo/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              className="bg-[#0066CC] hover:bg-[#004C99] text-white px-8 rounded-xl w-full cursor-pointer"
            >
              Simplifiez votre paie avec PayFit
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
          <Link href="/quiz">
            <Button
              variant="outline"
              size="lg"
              className="px-8 rounded-xl w-full cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Refaire le quiz
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function QuizResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066CC]" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}

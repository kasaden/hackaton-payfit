import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  ArrowRight,
  Shield,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-seo-copilot.png"
              alt="PayFit SEO Copilot"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-semibold text-lg">
              PayFit <span className="text-[#0066CC]">SEO Copilot</span>
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/quiz"
              className="text-sm text-gray-600 hover:text-[#0066CC] transition-colors"
            >
              Quiz conformité
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0066CC] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Conformité paie 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Gérez-vous correctement
            <br />
            <span className="text-[#0066CC]">votre paie ?</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            SMIC, RGDU, transparence salariale, congés maladie... Les règles de
            paie changent en 2026. Testez votre conformité en 3 minutes et
            découvrez vos points de vigilance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz">
              <Button
                size="lg"
                className="bg-[#0066CC] hover:bg-[#004C99] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-200 cursor-pointer"
              >
                Testez votre conformité paie
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg rounded-xl cursor-pointer"
              >
                Accéder au dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Un copilote SEO complet pour votre stratégie contenu
          </h2>
          <p className="text-gray-600 text-center max-w-xl mx-auto mb-12">
            Détection de tendances, génération d&apos;articles, benchmark
            concurrentiel — tout piloté par l&apos;IA.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Veille IA automatisée",
                desc: "Détection en continu des questions RH/paie émergentes via N8N + ChatGPT. Scoring automatique par pertinence PayFit.",
                color: "bg-blue-50 text-[#0066CC]",
              },
              {
                icon: FileText,
                title: "Content Engine",
                desc: "Génération d'articles SEO conformes en un clic. Grille de compliance intégrée. Optimisé GEO pour les AI Overviews.",
                color: "bg-green-50 text-[#2E7D32]",
              },
              {
                icon: CheckCircle,
                title: "Quiz de conformité",
                desc: "12 questions interactives avec mini-calculateurs. Qualification des leads et identification des pain points.",
                color: "bg-orange-50 text-[#E65100]",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-8 border shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "20", label: "Tendances détectées" },
              { value: "12", label: "Questions quiz" },
              { value: "3", label: "Concurrents analysés" },
              { value: "2026", label: "Données à jour" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-[#0066CC]">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Image
              src="/logo-seo-copilot.png"
              alt="Logo"
              width={24}
              height={24}
              className="rounded"
            />
            PayFit SEO Copilot — Hackathon Eugenia School 2026
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/quiz" className="hover:text-[#0066CC]">
              Quiz
            </Link>
            <Link href="/login" className="hover:text-[#0066CC]">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

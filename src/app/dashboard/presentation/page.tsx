"use client";

import {
  AlertTriangle,
  Search,
  Code2,
  TrendingUp,
  FileText,
  Gamepad2,
  Workflow,
  Bot,
  Blocks,
  Database,
  Globe,
  CheckCircle,
  ArrowRight,
  Target,
  Zap,
  Shield,
  PenTool,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/* ---------- Data ---------- */

const problems = [
  {
    icon: FileText,
    number: "01",
    title: "Contenu SEO de masse sans sacrifier la qualité",
    desc: "Produire du contenu IA en volume tout en conservant l'image d'expert paie/RH de PayFit. Chaque article doit être juridiquement fiable, sourcé, et aligné avec le tone of voice de la marque.",
  },
  {
    icon: Search,
    number: "02",
    title: "Détecter les tendances avant la concurrence",
    desc: "Identifier automatiquement les questions et sujets émergents en RH/paie pour publier du contenu SEO avant Factorial, Lucca, Cegid et Sage.",
  },
  {
    icon: Code2,
    number: "03",
    title: "Outils interactifs sans dépendance dev",
    desc: "Créer des simulateurs, calculateurs et quiz qui répondent à des intentions de recherche, en utilisant le no-code et le vibecoding pour ne pas mobiliser les équipes de développement.",
  },
];

const results = [
  "Créer du contenu de masse avec l'IA, sans perdre en crédibilité sur le sujet paie et RH.",
  "Détecter les questions émergentes avant la concurrence sur le sujet paie et RH.",
  "Utiliser des outils no-code pour réduire la dépendance aux équipes de développement.",
];

const solutions = [
  {
    icon: TrendingUp,
    title: "Veille IA automatisée",
    subtitle: "N8N + ChatGPT API",
    desc: "Un workflow qui détecte les tendances émergentes en RH/paie via le scraping de sources stratégiques (People Also Ask, forums RH, Légifrance, Journal Officiel) et les score par potentiel SEO.",
    color: "border-l-[#0066CC]",
  },
  {
    icon: Zap,
    title: "Content Engine",
    subtitle: "ChatGPT API + grille compliance",
    desc: "Un générateur d'articles SEO avec prompt documenté, optimisé pour le tone of voice PayFit, avec vérification compliance/légal intégrée et structure GEO-ready (FAQ, données structurées, définitions claires).",
    color: "border-l-[#0066CC]",
  },
  {
    icon: Gamepad2,
    title: "Quiz interactif de conformité paie",
    subtitle: "Next.js + Supabase",
    desc: "Un outil public qui agit comme pièce centrale d'un cluster SEO, lead magnet, et outil de qualification de prospects. Intègre des mini-calculateurs (congés payés, heures de travail).",
    color: "border-l-[#0066CC]",
  },
];

const stack = [
  { icon: Workflow, name: "N8N", role: "Automatisation & workflows" },
  { icon: Bot, name: "ChatGPT API", role: "Génération & scoring IA" },
  { icon: Blocks, name: "Next.js", role: "Application web & quiz" },
  { icon: Database, name: "Supabase", role: "Base de données & auth" },
  { icon: Globe, name: "Vercel", role: "Déploiement & hosting" },
];

/* ---------- Component ---------- */

export default function PresentationPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-16">
      {/* ===== HERO ===== */}
      <section className="text-center pt-8">
        <div className="inline-flex items-center gap-2 bg-[#0066CC]/5 text-[#0066CC] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Shield className="w-4 h-4" />
          Hackathon PayFit — Eugenia School 2026
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
          PayFit <span className="text-[#0066CC]">SEO Copilot</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Un copilote IA pour dominer le SEO paie/RH. Détection de tendances,
          génération d'articles conformes, et quiz interactif de conformité — le
          tout automatisé.
        </p>
      </section>

      {/* ===== PROBLÉMATIQUES ===== */}
      <section>
        <div className="mb-10">
          <p className="text-sm font-medium text-[#0066CC] mb-2 tracking-wide uppercase">
            Problématiques
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Les défis à résoudre
          </h2>
        </div>

        <div className="grid gap-5">
          {problems.map((p) => (
            <div
              key={p.number}
              className="flex gap-5 bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#0066CC]/20 hover:shadow-md transition-all duration-300"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#0066CC]/5 text-[#0066CC] flex items-center justify-center">
                <p.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-mono text-[#0066CC]/60">
                    {p.number}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900">
                    {p.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== RÉSULTATS ATTENDUS ===== */}
      <section>
        <div className="mb-10">
          <p className="text-sm font-medium text-[#0066CC] mb-2 tracking-wide uppercase">
            Résultats attendus
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Ce que la solution apporte
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="space-y-4">
            {results.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#0066CC] mt-0.5 shrink-0" />
                <p className="text-gray-700 leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOLUTIONS ===== */}
      <section>
        <div className="mb-10">
          <p className="text-sm font-medium text-[#0066CC] mb-2 tracking-wide uppercase">
            Solutions
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Les 3 briques du SEO Copilot
          </h2>
        </div>

        <div className="grid gap-5">
          {solutions.map((s) => (
            <div
              key={s.title}
              className={`bg-white rounded-2xl p-6 border border-gray-100 border-l-4 ${s.color} hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#0066CC]/5 text-[#0066CC] flex items-center justify-center">
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-0.5">
                    {s.title}
                  </h3>
                  <p className="text-xs font-medium text-[#0066CC]/70 mb-2">
                    {s.subtitle}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== STACK ===== */}
      <section>
        <div className="mb-10">
          <p className="text-sm font-medium text-[#0066CC] mb-2 tracking-wide uppercase">
            Stack technique
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Technologies utilisées
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stack.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-5 border border-gray-100 text-center hover:border-[#0066CC]/20 hover:shadow-md transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0066CC]/5 text-[#0066CC] flex items-center justify-center mx-auto mb-3">
                <t.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MOTEUR D'AUTOMATISATION ===== */}
      <section>
        <div className="mb-10">
          <p className="text-sm font-medium text-violet-600 mb-2 tracking-wide uppercase">
            Moteur d&apos;automatisation
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Du signal faible{" "}
            <span className="text-violet-600">à l&apos;article publié</span>,
            automatiquement
          </h2>
          <p className="text-gray-500 max-w-2xl">
            Notre moteur N8N surveille en continu les sources juridiques et
            détecte les questions émergentes RH/paie. Chaque tendance est scorée
            par IA puis transformée en article SEO prêt à publier.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-300 text-center">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Veille automatique
            </h3>
            <p className="text-sm text-gray-500">
              Scraping Légifrance, PAA Google, forums RH. Chaque jour, de
              nouvelles questions sont détectées.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-300 text-center">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Scoring IA</h3>
            <p className="text-sm text-gray-500">
              Chaque question est scorée sur 3 critères : nouveauté, pertinence
              PayFit et volume de recherche.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-300 text-center">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
              <PenTool className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Génération SEO
            </h3>
            <p className="text-sm text-gray-500">
              Un article de ~1000 mots est généré avec structure H1/H2, FAQ,
              sources juridiques et CTA PayFit.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-300 text-center">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Publication</h3>
            <p className="text-sm text-gray-500">
              Review compliance, puis publication en un clic. Optimisé GEO pour
              les AI Overviews.
            </p>
          </div>
        </div>

        {/* Pipeline visual */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-violet-600 font-medium">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              Légifrance + PAA
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 hidden md:block" />
            <div className="flex items-center gap-2 text-violet-600 font-medium">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              Scoring (3 critères)
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 hidden md:block" />
            <div className="flex items-center gap-2 text-violet-600 font-medium">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <PenTool className="w-4 h-4" />
              </div>
              Brief + Article SEO
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 hidden md:block" />
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              Publié sur le blog
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-gradient-to-br from-[#004C99] to-[#0066CC] rounded-2xl p-10 text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/[0.05] blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/[0.05] blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Voir la solution en action
          </h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Explorez le dashboard, testez la veille IA, générez un article ou
            lancez le quiz de conformité.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-[#0066CC] hover:bg-blue-50 px-6 rounded-xl font-semibold cursor-pointer"
              >
                Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/quiz">
              <Button
                size="lg"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-6 rounded-xl cursor-pointer"
              >
                Tester le quiz public
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

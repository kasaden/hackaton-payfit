"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Code2,
  FileText,
  Workflow,
  Bot,
  Zap,
  PenTool,
  ExternalLink,
  ImageIcon,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Terminal,
  Target,
  BarChart3,
  Gamepad2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { CountUp } from "@/components/landing/CountUp";

/* ================================================================
   HELPERS
   ================================================================ */

function useImageExists(src: string) {
  const [exists, setExists] = useState(false);
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setExists(true);
    img.onerror = () => setExists(false);
    img.src = src;
  }, [src]);
  return exists;
}

function Screenshot({
  src,
  label,
  className = "",
}: {
  src: string;
  label: string;
  className?: string;
}) {
  const exists = useImageExists(src);
  if (exists) {
    return (
      <div
        className={`relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl ${className}`}
      >
        <Image src={src} alt={label} fill className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center ${className}`}
    >
      <ImageIcon className="w-8 h-8 text-white/20" />
    </div>
  );
}

/* ================================================================
   SECTION 1 — HERO
   ================================================================ */

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-[#0A0E1A]">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#0066CC]/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#8B5CF6]/15 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-4xl">
        <AnimatedSection variant="fadeDown">
          <p className="text-sm font-semibold text-[#0066CC] mb-8 tracking-widest uppercase">
            Hackathon PayFit &mdash; Eugenia School 2026
          </p>
        </AnimatedSection>

        <AnimatedSection variant="fadeUp" delay={100}>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
            SEO Copilot
          </h1>
        </AnimatedSection>

        <AnimatedSection variant="fadeUp" delay={200}>
          <p className="text-2xl md:text-3xl text-white/50 font-medium mb-12">
            Detecter. Generer. Publier.{" "}
            <span className="text-white font-bold">Avant la concurrence.</span>
          </p>
        </AnimatedSection>

        <AnimatedSection variant="scaleUp" delay={300}>
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-14">
            {[
              { n: 8, s: "/jour", l: "articles" },
              { n: 3, s: "h", l: "economisees", p: "~" },
              { n: 7, s: "$", l: "/mois d'IA", p: "~" },
              { n: 20, s: "+", l: "tendances/sem" },
            ].map((k) => (
              <div key={k.l} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-white">
                  <CountUp end={k.n} prefix={k.p} suffix={k.s} />
                </p>
                <p className="text-xs text-white/40 mt-1">{k.l}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection variant="fadeUp" delay={400}>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-[#0066CC] hover:bg-[#004C99] text-white rounded-xl cta-glow cursor-pointer gap-2 text-base px-8 h-13"
              >
                Voir le dashboard live
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="/quiz" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-[#FFFFFF] hover:bg-[#CCCCCC] text-[#0066CC] rounded-xl cta-glow cursor-pointer gap-2 text-base px-8 h-13"
              >
                Tester le quiz
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </AnimatedSection>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-white/30" />
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 2 — LE PROBLEME (3 cartes, phrases courtes)
   ================================================================ */

function Problem() {
  const items = [
    {
      icon: FileText,
      num: "01",
      title: "Volume vs Qualite",
      hook: "Publier en masse sans perdre l'expertise paie & RH",
      color: "#F59E0B",
    },
    {
      icon: Search,
      num: "02",
      title: "Veille trop lente",
      hook: "Les concurrents publient. PayFit reagit des semaines plus tard.",
      color: "#EF4444",
    },
    {
      icon: Code2,
      num: "03",
      title: "Dependance tech",
      hook: "Quiz, simulateurs = devs necessaires. L'equipe SEO est bloquee.",
      color: "#8B5CF6",
    },
  ];

  return (
    <section className="py-28 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <p className="text-sm font-bold text-[#EF4444] tracking-widest uppercase mb-4 text-center">
            Le probleme
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-16">
            3 freins, 1 solution
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((p, i) => (
            <AnimatedSection key={p.num} variant="fadeUp" delay={i * 120}>
              <div
                className="rounded-2xl p-8 h-full border-t-4 bg-gray-50"
                style={{ borderTopColor: p.color }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${p.color}15` }}
                >
                  <p.icon className="w-6 h-6" style={{ color: p.color }} />
                </div>
                <p
                  className="text-xs font-mono mb-2"
                  style={{ color: p.color }}
                >
                  {p.num}
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {p.title}
                </h3>
                <p className="text-base text-gray-500 leading-relaxed">
                  {p.hook}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 3 — LA SOLUTION (pipeline visuel)
   ================================================================ */

function Solution() {
  const steps = [
    { icon: Search, title: "Veille", sub: "N8N, 6h", color: "#F59E0B" },
    { icon: Bot, title: "Scoring IA", sub: "GPT-4o-mini", color: "#0066CC" },
    {
      icon: PenTool,
      title: "Generation",
      sub: "GPT-4.1, 3 passes",
      color: "#10B981",
    },
    { icon: Zap, title: "Publication", sub: "SEO-ready", color: "#8B5CF6" },
  ];

  return (
    <section className="py-28 px-6 bg-[#0A0E1A] text-white">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <p className="text-sm font-bold text-[#0066CC] tracking-widest uppercase mb-4 text-center">
            Notre solution
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-6">
            De la tendance au contenu publie
          </h2>
          <p className="text-lg text-white/40 text-center mb-16 max-w-xl mx-auto">
            Pipeline 100% automatise. Zero intervention humaine requise.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-4 gap-4 md:gap-6 mb-16">
          {steps.map((s, i) => (
            <AnimatedSection key={s.title} variant="scaleUp" delay={i * 100}>
              <div className="relative text-center">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10"
                  style={{ backgroundColor: `${s.color}15` }}
                >
                  <s.icon
                    className="w-7 h-7 md:w-8 md:h-8"
                    style={{ color: s.color }}
                  />
                </div>
                <p className="text-sm md:text-base font-bold text-white mb-1">
                  {s.title}
                </p>
                <p className="text-xs text-white/30">{s.sub}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 -right-4 z-10">
                    <ArrowRight className="w-4 h-4 text-white/20" />
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Key differentiator */}
        <AnimatedSection variant="scaleUp" delay={400}>
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-lg font-bold text-white flex items-center justify-center gap-3">
              <Terminal className="w-5 h-5 text-[#0066CC]" />
              Construit en grande partie avec Claude Code
              <span className="text-white/30">|</span>
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 4 — DEMO SCREENSHOTS (grille visuelle, peu de texte)
   ================================================================ */

function Demo() {
  const screens = [
    {
      src: "/screenshots/scoring-trends.png",
      label: "Veille & scoring IA",
      tag: "Tendances",
      color: "#F59E0B",
    },
    {
      src: "/screenshots/generateur-articles.png",
      label: "Génération du texte en 3 passes : structure, contenu, SEO",
      tag: "Génération",
      color: "#10B981",
    },
    {
      src: "/screenshots/article-publie-seo.png",
      label: "Article SEO complet : netlinking, legal, structuration, json-ld",
      tag: "Publication",
      color: "#0066CC",
    },
    {
      src: "/screenshots/quiz-resultats.png",
      label: "Quiz lead magnet",
      tag: "Conversion",
      color: "#8B5CF6",
    },
  ];

  return (
    <section className="py-28 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <p className="text-sm font-bold text-emerald-600 tracking-widest uppercase mb-4 text-center">
            Demo
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-16">
            Ca tourne. En vrai.
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6">
          {screens.map((s, i) => (
            <AnimatedSection key={s.tag} variant="scaleUp" delay={i * 100}>
              <div className="group relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 hover:shadow-xl transition-all duration-300">
                <Screenshot
                  src={s.src}
                  label={s.label}
                  className="h-[260px] md:h-[300px]"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5">
                  <span
                    className="text-xs font-bold text-white/70 px-2 py-0.5 rounded-md inline-block mb-2"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.tag}
                  </span>
                  <p className="text-base font-bold text-white">{s.label}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* N8N + Veille concurrentielle row */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <AnimatedSection variant="scaleUp" delay={100}>
            <div className="group relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <Screenshot
                src="/screenshots/n8n-dashboard.png"
                label="Workflows N8N"
                className="h-[220px]"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5">
                <span className="text-xs font-bold text-white/70 px-2 py-0.5 rounded-md inline-block mb-2 bg-[#F59E0B]">
                  Automation
                </span>
                <p className="text-base font-bold text-white">Workflows N8N</p>
              </div>
            </div>
          </AnimatedSection>
          <AnimatedSection variant="scaleUp" delay={200}>
            <div className="group relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <Screenshot
                src="/screenshots/veille-concurrentielle.png"
                label="Veille concurrents"
                className="h-[220px]"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5">
                <span className="text-xs font-bold text-white/70 px-2 py-0.5 rounded-md inline-block mb-2 bg-[#EF4444]">
                  Concurrence
                </span>
                <p className="text-base font-bold text-white">
                  Benchmark : Factorial, Lucca, Cegid, Sage
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 5 — IMPACT (gros chiffres)
   ================================================================ */

function Impact() {
  return (
    <section className="py-28 px-6 bg-[#0A0E1A] text-white">
      <div className="max-w-5xl mx-auto text-center">
        <AnimatedSection variant="fadeUp">
          <p className="text-sm font-bold text-[#10B981] tracking-widest uppercase mb-4">
            Impact business
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-20">
            Ce que ca change pour PayFit
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {[
            {
              n: 8,
              s: "",
              l: "articles/jour",
              sub: "generes automatiquement",
              c: "#0066CC",
            },
            {
              n: 3,
              s: "h",
              l: "economisees",
              sub: "par article (vs manuel)",
              c: "#10B981",
              p: "~",
            },
            {
              n: 20,
              s: "+",
              l: "tendances/sem",
              sub: "detectees avant la concurrence",
              c: "#8B5CF6",
            },
            {
              n: 7,
              s: "$",
              l: "/mois",
              sub: "cout total IA",
              c: "#F59E0B",
              p: "~",
            },
          ].map((k, i) => (
            <AnimatedSection key={k.l} variant="scaleUp" delay={i * 100}>
              <div>
                <p
                  className="text-5xl md:text-6xl font-extrabold mb-2"
                  style={{ color: k.c }}
                >
                  <CountUp end={k.n} prefix={k.p} suffix={k.s} />
                </p>
                <p className="text-base font-bold text-white mb-1">{k.l}</p>
                <p className="text-xs text-white/30">{k.sub}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection variant="fadeUp" delay={300}>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/40">
            {[
              "Multi-pays",
              "Multi-langue",
              "Zero hallucination juridique",
              "Securite production (RLS, CSRF, rate limit)",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 6 — SYNTHESE JURY (la fameuse slide unique)
   ================================================================ */

function Synthesis() {
  return (
    <section className="py-28 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <p className="text-sm font-bold text-[#0066CC] tracking-widest uppercase mb-4 text-center">
            Synthese
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-16">
            En 1 slide
          </h2>
        </AnimatedSection>

        <AnimatedSection variant="scaleUp" delay={100}>
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
            {/* Header gradient */}
            <div className="bg-gradient-to-r from-[#004C99] to-[#0066CC] p-8 md:p-10">
              <p className="text-white/60 text-sm font-semibold mb-2">
                Hackathon PayFit 2026
              </p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                SEO Copilot
              </h3>
              <p className="text-white/60 text-lg">
                Pipeline IA : tendance &rarr; contenu publie, en automatique
              </p>
            </div>

            {/* 3 columns */}
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {/* Probleme */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-[#EF4444]" />
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Probleme
                  </h4>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Contenu expert a grande echelle, veille trop lente, dependance
                  aux devs pour les outils interactifs.
                </p>
              </div>

              {/* Solution */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-[#0066CC]" />
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Solution
                  </h4>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  SaaS complet. Quiz lead magnet. Veille N8N, scoring IA,
                  generation en 3 étapes, publication SEO-ready.
                </p>
              </div>

              {/* Impact */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-[#10B981]" />
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Impact
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    8 articles/jour
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    ~3h economisees/article
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    20+ tendances/semaine
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    ~7$/mois de cout IA
                  </li>
                </ul>
              </div>
            </div>

            {/* Tech bar */}
            <div className="bg-gray-50 px-8 py-4 flex flex-wrap justify-center gap-4 text-xs font-bold">
              <span className="text-[#0066CC]">Next.js 16</span>
              <span className="text-gray-300">|</span>
              <span className="text-[#10B981]">Supabase</span>
              <span className="text-gray-300">|</span>
              <span className="text-[#F59E0B]">GPT-4.1</span>
              <span className="text-gray-300">|</span>
              <span className="text-[#8B5CF6]">N8N</span>
              <span className="text-gray-300">|</span>
              <span className="text-[#EF4444]">Claude Code</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-700">Vercel</span>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 7 — ENSUITE (roadmap V2)
   ================================================================ */

function NextSteps() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Agents Dust",
      desc: "Generation et fact-checking par des agents IA specialises paie/RH. Plus fiables et contextuels que ChatGPT.",
      tag: "V2",
      color: "#0066CC",
    },
    {
      icon: Gamepad2,
      title: "Quiz Builder self-service",
      desc: "L'equipe SEO cree ses propres quiz sans dev. Nouveaux themes, questions, scoring — en quelques clics.",
      tag: "V2",
      color: "#8B5CF6",
    },
    {
      icon: Zap,
      title: "Content Refresh automatique",
      desc: "Detection des articles obsoletes quand la loi change (taux, plafonds, dispositifs). Mise a jour ou alerte instantanee.",
      tag: "V2",
      color: "#10B981",
    },
    {
      icon: Workflow,
      title: "Cocon semantique automatise",
      desc: "Construction automatique de topic clusters : pages piliers, articles satellites, maillage interne optimise.",
      tag: "V2",
      color: "#F59E0B",
    },
    {
      icon: Target,
      title: "Answer Engine Optimization",
      desc: "Optimisation pour les featured snippets, People Also Ask et AI Overviews. Capter le trafic zero-click.",
      tag: "V3",
      color: "#EF4444",
    },
    {
      icon: BarChart3,
      title: "Calculateur ROI externalisation",
      desc: "Outil interactif : combien coute votre paie en interne vs un logiciel ? Funnel direct vers PayFit.",
      tag: "V3",
      color: "#8B5CF6",
    },
  ];

  return (
    <section className="py-28 px-6 bg-[#0A0E1A] text-white">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <p className="text-sm font-bold text-[#F59E0B] tracking-widest uppercase mb-4 text-center">
            Ensuite
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-6">
            Et ce n&apos;est que le debut.
          </h2>
          <p className="text-lg text-white/30 text-center mb-16 max-w-lg mx-auto">
            La V1 tourne. Voici ce qui arrive.
          </p>
        </AnimatedSection>

        <AnimatedSection variant="scaleUp" delay={100}>
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur divide-y divide-white/5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="flex items-center gap-5 px-6 py-5 hover:bg-white/5 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${f.color}20` }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white">{f.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed mt-0.5">
                    {f.desc}
                  </p>
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                  style={{ color: f.color, backgroundColor: `${f.color}15` }}
                >
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 8 — CTA FINAL
   ================================================================ */

function CTA() {
  return (
    <section className="py-32 px-6 bg-white text-center">
      <div className="max-w-3xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
            SEO Copilot
          </h2>
          <p className="text-2xl md:text-3xl font-bold text-[#0066CC] mb-12">
            Prêt pour la production.
          </p>
        </AnimatedSection>

        <AnimatedSection variant="scaleUp" delay={100}>
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-[#0066CC] hover:bg-[#004C99] text-white rounded-xl cta-glow cursor-pointer gap-2 text-lg px-10 h-14"
              >
                Dashboard live
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="/quiz" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl cursor-pointer gap-2 text-lg px-10 h-14 border-[#0066CC]/30 text-[#0066CC] hover:bg-[#0066CC]/5"
              >
                Tester le quiz
                <ExternalLink className="w-5 h-5" />
              </Button>
            </a>
          </div>
        </AnimatedSection>

        <AnimatedSection variant="fadeIn" delay={200}>
          <div className="w-16 h-0.5 bg-[#0066CC] rounded-full mx-auto mb-8" />
          <p className="text-3xl font-bold text-gray-900 mb-3">Merci.</p>
          <p className="text-base text-gray-400">Questions ?</p>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ================================================================
   PAGE
   ================================================================ */

export default function PresentationPage() {
  return (
    <main className="overflow-x-hidden">
      <Hero />
      <Problem />
      <Solution />
      <Demo />
      <Impact />
      <Synthesis />
      <NextSteps />
      <CTA />
    </main>
  );
}

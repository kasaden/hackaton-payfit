"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Code2,
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
  ExternalLink,
  ImageIcon,
  BarChart3,
  Eye,
  DollarSign,
  Sparkles,
  Lock,
  Languages,
  Clock,
  TrendingUp,
  ChevronDown,
  Play,
  BookOpen,
  Download,
  Terminal,
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

function SmartScreenshot({ src, label, className = "" }: { src: string; label: string; className?: string }) {
  const exists = useImageExists(src);
  if (exists) {
    return (
      <div className={`relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg ${className}`}>
        <Image src={src} alt={label} fill className="object-contain" />
      </div>
    );
  }
  return (
    <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-gray-200/60 flex items-center justify-center">
        <ImageIcon className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
    </div>
  );
}

const SCREENSHOTS = {
  n8n: "/screenshots/n8n-dashboard.png",
  scoring: "/screenshots/scoring-trends.png",
  generateur: "/screenshots/generateur-articles.png",
  article: "/screenshots/article-publie-seo.png",
  quiz: "/screenshots/quiz-resultats.png",
  veille: "/screenshots/veille-concurrentielle.png",
};

/* ================================================================
   SECTIONS
   ================================================================ */

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern" />

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-[10%] w-16 h-16 bg-[#0066CC]/5 rounded-2xl rotate-12 animate-float" />
      <div className="absolute top-40 right-[15%] w-12 h-12 bg-[#F59E0B]/10 rounded-full animate-float-delayed" />
      <div className="absolute bottom-32 left-[20%] w-10 h-10 bg-[#8B5CF6]/8 rounded-xl -rotate-12 animate-float-slow" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <AnimatedSection variant="fadeDown" delay={0}>
          <div className="inline-flex items-center gap-2 bg-[#0066CC]/8 text-[#0066CC] px-5 py-2 rounded-full text-sm font-semibold mb-8 border border-[#0066CC]/15">
            <Shield className="w-4 h-4" />
            Hackathon PayFit &mdash; Eugenia School 2026
          </div>
        </AnimatedSection>

        <AnimatedSection variant="fadeUp" delay={100}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-3 tracking-tight">
            SEO Copilot
          </h1>
        </AnimatedSection>

        <AnimatedSection variant="fadeUp" delay={200}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0066CC] leading-[1.1] mb-8 tracking-tight">
            for PayFit
          </h2>
        </AnimatedSection>

        <AnimatedSection variant="fadeUp" delay={300}>
          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-4 leading-relaxed">
            De la <span className="font-semibold text-gray-700">tendance</span> au{" "}
            <span className="font-semibold text-gray-700">contenu publie</span>, en automatique.
          </p>
          <p className="text-lg text-gray-400 mb-10">
            Un SaaS complet, construit de A a Z avec Claude Code.
          </p>
        </AnimatedSection>

        <AnimatedSection variant="scaleUp" delay={400}>
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            <Link href="/dashboard">
              <Button size="lg" className="bg-[#0066CC] hover:bg-[#004C99] text-white rounded-xl cta-glow cursor-pointer gap-2 text-base px-8 h-12">
                Voir le dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="/quiz" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="rounded-xl cursor-pointer gap-2 text-base px-8 h-12 border-[#0066CC]/30 text-[#0066CC] hover:bg-[#0066CC]/5">
                Tester le quiz
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </AnimatedSection>

        {/* Hero KPIs */}
        <AnimatedSection variant="fadeUp" delay={500}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: 8, suffix: "/jour", label: "Articles generes", color: "#0066CC" },
              { value: 3, suffix: "h", prefix: "~", label: "Economisees / article", color: "#10B981" },
              { value: 7, suffix: "$/mois", prefix: "~", label: "Cout infrastructure IA", color: "#F59E0B" },
              { value: 20, suffix: "+/sem", label: "Tendances detectees", color: "#8B5CF6" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-2xl md:text-3xl font-bold" style={{ color: kpi.color }}>
                  <CountUp end={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} />
                </p>
                <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-gray-300" />
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    {
      icon: FileText,
      number: "01",
      title: "Volume vs Qualite",
      question: "Comment creer du contenu en masse tout en gardant un niveau expert en paie et RH ?",
      items: [
        "Equilibre volume / qualite impossible a maintenir manuellement",
        "References legales obligatoires, ton de marque a respecter",
        "L'IA generique produit du contenu generique — pas suffisant pour PayFit",
      ],
      accent: "#F59E0B",
    },
    {
      icon: Search,
      number: "02",
      title: "Veille trop lente",
      question: "Comment detecter les questions emergentes RH/paie et publier avant la concurrence ?",
      items: [
        "Factorial, Lucca, Cegid, Sage publient sur les memes mots-cles",
        "Les tendances emergent en heures, les equipes reagissent en semaines",
        "Pas de systeme automatise de detection et priorisation",
      ],
      accent: "#EF4444",
    },
    {
      icon: Code2,
      number: "03",
      title: "Dependance technique",
      question: "Comment l'equipe SEO peut deployer des outils interactifs sans devs ?",
      items: [
        "Quiz, simulateurs, calculateurs = ressources dev necessaires",
        "L'equipe SEO attend des sprints pour deployer du contenu interactif",
        "Les nouveaux formats SEO (calculateurs) restent bloques",
      ],
      accent: "#8B5CF6",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gray-50/50" id="probleme">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#EF4444] mb-3 tracking-wide uppercase">Le constat</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              3 problemes, 1 seule reponse
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Les problematiques identifiees par David, SEO Manager chez PayFit
            </p>
          </div>
        </AnimatedSection>

        <div className="space-y-6">
          {problems.map((p, i) => (
            <AnimatedSection key={p.number} variant="fadeUp" delay={i * 150}>
              <div
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                style={{ borderLeftWidth: 4, borderLeftColor: p.accent }}
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${p.accent}12` }}>
                    <p.icon className="w-7 h-7" style={{ color: p.accent }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ color: p.accent, backgroundColor: `${p.accent}10` }}>{p.number}</span>
                      <h3 className="text-lg font-bold text-gray-900">{p.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 font-medium italic">{p.question}</p>
                    <ul className="space-y-2">
                      {p.items.map((item, j) => (
                        <li key={j} className="text-sm text-gray-500 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: p.accent }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const steps = [
    { icon: Search, title: "Veille auto", sub: "N8N — cycle 6h", desc: "5 sources en parallele : Legifrance, URSSAF, BOFIP, People Also Ask, blogs concurrents", accent: "#F59E0B" },
    { icon: Bot, title: "Scoring IA", sub: "GPT-4o-mini", desc: "3 axes : nouveaute, pertinence PayFit, volume recherche. Score >= 4 = auto-generation", accent: "#0066CC" },
    { icon: PenTool, title: "Generation", sub: "GPT-4.1 — 3 passes", desc: "Article SEO complet + netlinking IA + references legales verifiees + meta auto-extraites", accent: "#10B981" },
    { icon: Zap, title: "Publication", sub: "SEO-ready", desc: "JSON-LD, sitemap dynamique, canonical, OpenGraph, quiz lead magnet integre", accent: "#8B5CF6" },
  ];

  return (
    <section className="py-24 px-6" id="solution">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#0066CC] mb-3 tracking-wide uppercase">Notre solution</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Un pipeline SEO entierement automatise
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              De la detection d&apos;une tendance a la publication d&apos;un article optimise, en quelques minutes
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {steps.map((s, i) => (
            <AnimatedSection key={s.title} variant="fadeUp" delay={i * 100}>
              <div className="relative">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all h-full" style={{ borderTopWidth: 3, borderTopColor: s.accent }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${s.accent}12` }}>
                    <s.icon className="w-6 h-6" style={{ color: s.accent }} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded-md" style={{ backgroundColor: s.accent }}>{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-sm font-bold text-gray-900">{s.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{s.desc}</p>
                  <p className="text-[10px] font-semibold" style={{ color: s.accent }}>{s.sub}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Key differentiator banner */}
        <AnimatedSection variant="scaleUp" delay={400}>
          <div className="bg-gradient-to-r from-[#004C99] to-[#0066CC] rounded-2xl p-6 text-center">
            <p className="text-white font-bold text-lg mb-1">
              <Terminal className="w-5 h-5 inline mr-2" />
              Pas de Lovable &mdash; Un vrai SaaS, construit avec Claude Code
            </p>
            <p className="text-white/80 text-sm">
              Architecture production-ready : Next.js 16 + Supabase + N8N &bull; Cout total IA : ~7$/mois &bull; Reproductible &bull; Scalable
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function DemoSection() {
  const demos = [
    {
      label: "Veille & Trends",
      title: "Detection automatique des tendances",
      desc: "Workflow N8N 6h : Legifrance, URSSAF, BOFIP, People Also Ask, gaps concurrents. Scoring IA 3 axes avec generation auto si score >= 4/5.",
      screenshot: SCREENSHOTS.scoring,
      screenshotLabel: "Scoring IA des tendances",
      link: "/dashboard/trends",
      linkLabel: "Ouvrir les tendances",
      accent: "#F59E0B",
      features: ["5 sources en parallele", "Deduplication Jaccard (0.6)", "Rate limit 30/h/user", "Score >= 4 = auto-gen"],
    },
    {
      label: "Generateur",
      title: "Pipeline de generation 3 passes",
      desc: "Pass 1 : contenu GPT-4.1 (t=0.3) avec references legales. Pass 2 : netlinking IA (2-4 liens internes). Pass 3 : meta + slug + detection doublons.",
      screenshot: SCREENSHOTS.generateur,
      screenshotLabel: "Generateur d'articles",
      link: "/dashboard/generator",
      linkLabel: "Ouvrir le generateur",
      accent: "#10B981",
      features: ["Templates editables en BDD", "References legales verifiees", "Netlinking intelligent", "Zero hallucination juridique"],
    },
    {
      label: "Articles SEO",
      title: "Publication SEO complete",
      desc: "JSON-LD (Article, FAQ, BreadcrumbList, Organization), table des matieres sticky, auto-linking, articles lies par scoring 4 signaux.",
      screenshot: SCREENSHOTS.article,
      screenshotLabel: "Article publie SEO",
      link: "/dashboard/articles",
      linkLabel: "Voir les articles",
      accent: "#0066CC",
      features: ["4 schemas JSON-LD", "Sitemap dynamique", "Canonical + OpenGraph", "Markdown securise"],
    },
    {
      label: "Quiz Lead Magnet",
      title: "Quiz de conformite paie 2026",
      desc: "12 questions, scoring 0-100, lead scoring automatique (HOT/WARM/COLD), 20 pain points auto-detectes, segmentation ICP.",
      screenshot: SCREENSHOTS.quiz,
      screenshotLabel: "Quiz resultats",
      link: "/quiz",
      linkLabel: "Tester le quiz",
      accent: "#8B5CF6",
      features: ["Zero inscription", "Scoring auto HOT/WARM/COLD", "20 pain points detectes", "CTA PayFit personnalises"],
      external: true,
    },
  ];

  return (
    <section className="py-24 px-6 bg-gray-50/50" id="demo">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 mb-3 tracking-wide uppercase">Demonstration</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Chaque brique, en action
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              4 modules fonctionnels, accessibles depuis le dashboard
            </p>
          </div>
        </AnimatedSection>

        <div className="space-y-16">
          {demos.map((demo, i) => (
            <AnimatedSection key={demo.label} variant="fadeUp" delay={100}>
              <div className={`grid md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? "md:direction-rtl" : ""}`}>
                {/* Text */}
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <span className="text-xs font-bold text-white px-3 py-1 rounded-full mb-4 inline-block" style={{ backgroundColor: demo.accent }}>
                    {demo.label}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{demo.title}</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">{demo.desc}</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {demo.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: demo.accent }} />
                        {f}
                      </div>
                    ))}
                  </div>
                  {demo.external ? (
                    <a href={demo.link} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="rounded-xl cursor-pointer gap-2" style={{ backgroundColor: demo.accent }}>
                        {demo.linkLabel}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  ) : (
                    <Link href={demo.link}>
                      <Button size="sm" className="rounded-xl cursor-pointer gap-2" style={{ backgroundColor: demo.accent }}>
                        {demo.linkLabel}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
                {/* Screenshot */}
                <div className={i % 2 === 1 ? "md:order-1" : ""}>
                  <SmartScreenshot
                    src={demo.screenshot}
                    label={demo.screenshotLabel}
                    className="h-[300px] md:h-[350px]"
                  />
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Veille concurrentielle - bonus */}
        <AnimatedSection variant="fadeUp" delay={200}>
          <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-white px-3 py-1 rounded-full mb-4 inline-block bg-[#EF4444]">
                  Veille concurrentielle
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Monitoring automatique des concurrents</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  Workflow N8N toutes les 12h : scraping RSS blogs concurrents, analyse IA de leur strategie, detection des content gaps = opportunites pour PayFit.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {["Factorial", "Lucca", "Cegid", "Sage"].map((c) => (
                    <div key={c} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-gray-700">{c}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard/veille">
                    <Button size="sm" className="bg-[#EF4444] hover:bg-[#DC2626] rounded-xl cursor-pointer gap-2">
                      Ouvrir la veille
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/benchmark">
                    <Button size="sm" variant="outline" className="rounded-xl cursor-pointer gap-2 border-[#EF4444]/30 text-[#EF4444]">
                      Benchmark
                    </Button>
                  </Link>
                </div>
              </div>
              <SmartScreenshot
                src={SCREENSHOTS.veille}
                label="Veille concurrentielle"
                className="h-[280px]"
              />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function ImpactSection() {
  return (
    <section className="py-24 px-6" id="impact">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#0066CC] mb-3 tracking-wide uppercase">Impact business</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Des resultats concrets pour PayFit
            </h2>
          </div>
        </AnimatedSection>

        {/* Big KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: FileText, value: 8, suffix: " articles/jour", label: "Generes automatiquement", accent: "#0066CC" },
            { icon: Clock, value: 3, suffix: "h economisees", prefix: "~", label: "Par article (vs manuel)", accent: "#10B981" },
            { icon: DollarSign, value: 7, suffix: "$/mois", prefix: "~", label: "Cout total infrastructure IA", accent: "#F59E0B" },
            { icon: TrendingUp, value: 20, suffix: "+ tendances/sem", label: "Detectees automatiquement", accent: "#8B5CF6" },
          ].map((kpi, i) => (
            <AnimatedSection key={kpi.label} variant="scaleUp" delay={i * 100}>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center" style={{ borderTopWidth: 3, borderTopColor: kpi.accent }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${kpi.accent}12` }}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.accent }} />
                </div>
                <p className="text-3xl md:text-4xl font-extrabold mb-1" style={{ color: kpi.accent }}>
                  <CountUp end={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} />
                </p>
                <p className="text-xs text-gray-500">{kpi.label}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Scalability */}
        <AnimatedSection variant="fadeUp" delay={200}>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0066CC]" />
              Scalabilite & Securite
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Languages, title: "Multi-pays", desc: "References legales par pays dans Supabase. Prompts parametrables par marche." },
                { icon: Globe, title: "Multi-langue", desc: "Templates editables, ton de voix configurable. Deployable pour UK, Espagne, Allemagne." },
                { icon: Lock, title: "Securite production", desc: "RLS Supabase, CSRF, rate limiting, webhook secret, auth middleware SSR." },
              ].map((s) => (
                <div key={s.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0066CC]/5 flex items-center justify-center shrink-0">
                    <s.icon className="w-5 h-5 text-[#0066CC]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">{s.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function StackSection() {
  const techs = [
    { icon: Blocks, name: "Next.js 16", desc: "App Router, SSR, React 19", accent: "#0066CC" },
    { icon: Database, name: "Supabase", desc: "PostgreSQL, Auth SSR, RLS", accent: "#10B981" },
    { icon: Bot, name: "OpenAI", desc: "GPT-4.1 + GPT-4o-mini", accent: "#F59E0B" },
    { icon: Workflow, name: "N8N Cloud", desc: "3 workflows automatises", accent: "#8B5CF6" },
    { icon: Terminal, name: "Claude Code", desc: "SaaS construit de A a Z", accent: "#EF4444" },
    { icon: Globe, name: "Vercel", desc: "Deploy continu, edge", accent: "#000000" },
  ];

  return (
    <section className="py-24 px-6 bg-gray-50/50" id="stack">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#8B5CF6] mb-3 tracking-wide uppercase">Stack technique</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Architecture & parti pris
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Un SaaS production-ready, pas un prototype Lovable
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {techs.map((t, i) => (
            <AnimatedSection key={t.name} variant="scaleUp" delay={i * 80}>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all text-center" style={{ borderTopWidth: 3, borderTopColor: t.accent }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${t.accent}12` }}>
                  <t.icon className="w-5 h-5" style={{ color: t.accent }} />
                </div>
                <p className="text-sm font-bold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400 mt-1">{t.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection variant="fadeUp" delay={300}>
          <div className="bg-[#0A1E5E] rounded-2xl p-6 text-center">
            <p className="text-white font-bold text-sm mb-2">
              <Shield className="w-4 h-4 inline mr-2 text-[#0066CC]" />
              Zero hallucination juridique
            </p>
            <p className="text-white/70 text-xs">
              References legales verifiees (Legifrance, URSSAF, EUR-Lex) stockees en base avant injection. Templates de prompt editables sans code.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function DeliverablesSection() {
  const deliverables = [
    {
      icon: Globe,
      title: "Solution finalisee",
      desc: "URL live deployee sur Vercel, dashboard complet, quiz fonctionnel",
      status: "Live",
      statusColor: "#10B981",
    },
    {
      icon: Terminal,
      title: "SaaS construit avec Claude Code",
      desc: "Pas de Lovable : un vrai SaaS Next.js de A a Z, code source disponible",
      status: "Production",
      statusColor: "#0066CC",
    },
    {
      icon: Workflow,
      title: "Workflows N8N exportables",
      desc: "3 workflows : veille 6h, generation auto, monitoring concurrents 12h",
      status: "Configurable",
      statusColor: "#F59E0B",
    },
    {
      icon: Play,
      title: "Demo video",
      desc: "Video de demonstration 3-5 min du pipeline complet",
      status: "Pret",
      statusColor: "#8B5CF6",
    },
    {
      icon: BookOpen,
      title: "Documentation technique",
      desc: "Comment reutiliser et dupliquer la solution pour d'autres marches",
      status: "Inclus",
      statusColor: "#EF4444",
    },
  ];

  return (
    <section className="py-24 px-6" id="livrables">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 mb-3 tracking-wide uppercase">Livrables</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tout est pret
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Chaque livrable attendu est couvert et fonctionnel
            </p>
          </div>
        </AnimatedSection>

        <div className="space-y-4">
          {deliverables.map((d, i) => (
            <AnimatedSection key={d.title} variant="fadeUp" delay={i * 100}>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <d.icon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">{d.title}</h3>
                  <p className="text-sm text-gray-500">{d.desc}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full shrink-0" style={{ color: d.statusColor, backgroundColor: `${d.statusColor}12` }}>
                  {d.status}
                </span>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function SynthesisSection() {
  return (
    <section className="py-24 px-6 bg-gray-50/50" id="synthese">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#0066CC] mb-3 tracking-wide uppercase">Slide de synthese</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Resume pour le jury
            </h2>
          </div>
        </AnimatedSection>

        <AnimatedSection variant="scaleUp" delay={100}>
          <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#004C99] to-[#0066CC] p-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Hackathon PayFit 2026
                </div>
              </div>
              <h3 className="text-3xl font-extrabold mb-2">SEO Copilot for PayFit</h3>
              <p className="text-white/80 text-lg">Pipeline IA automatise : de la tendance au contenu publie</p>
            </div>

            {/* Body */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {/* Probleme */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-[#EF4444]" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Probleme cible</h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    PayFit doit produire du contenu SEO expert en volume, detecter les tendances avant la concurrence, et deployer des outils interactifs sans dependre des devs.
                  </p>
                </div>

                {/* Solution */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#0066CC]/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[#0066CC]" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Solution</h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Un SaaS complet construit avec Claude Code : veille auto N8N, scoring IA, generation 3 passes, publication SEO-ready, quiz lead magnet.
                  </p>
                </div>

                {/* Impact */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Impact business</h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      4-8 articles/jour generes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      ~3h economisees par article
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      20+ mots-cles couverts / semaine
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      ~7$/mois de cout IA total
                    </li>
                  </ul>
                </div>
              </div>

              {/* Tech bar */}
              <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-500">
                <span className="text-[#0066CC]">Next.js 16</span>
                <span className="text-gray-300">|</span>
                <span className="text-[#10B981]">Supabase</span>
                <span className="text-gray-300">|</span>
                <span className="text-[#F59E0B]">OpenAI GPT-4.1</span>
                <span className="text-gray-300">|</span>
                <span className="text-[#8B5CF6]">N8N</span>
                <span className="text-gray-300">|</span>
                <span className="text-[#EF4444]">Claude Code</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-700">Vercel</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-6" id="cta">
      <div className="max-w-4xl mx-auto text-center">
        <AnimatedSection variant="fadeUp">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            SEO Copilot
          </h2>
          <p className="text-2xl md:text-3xl font-bold text-[#0066CC] mb-8">
            Pret pour la production.
          </p>
        </AnimatedSection>

        <AnimatedSection variant="fadeUp" delay={100}>
          <div className="space-y-4 mb-12 text-left max-w-lg mx-auto">
            {[
              "URL live deployee sur Vercel + code source disponible",
              "SaaS complet construit avec Claude Code, pas Lovable",
              "Documentation technique complete et reproductible",
              "Workflows N8N exportables et configurables",
              "Scalable a l'international (multi-pays, multi-langue)",
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-600">{b}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection variant="scaleUp" delay={200}>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link href="/dashboard">
              <Button size="lg" className="bg-[#0066CC] hover:bg-[#004C99] text-white rounded-xl cta-glow cursor-pointer gap-2 text-base px-8 h-12">
                Explorer le dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="/quiz" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="rounded-xl cursor-pointer gap-2 text-base px-8 h-12 border-[#0066CC]/30 text-[#0066CC] hover:bg-[#0066CC]/5">
                Tester le quiz
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </AnimatedSection>

        <AnimatedSection variant="fadeIn" delay={300}>
          <div className="w-20 h-0.5 bg-[#0066CC] rounded-full mx-auto mb-8" />
          <p className="text-2xl font-bold text-gray-900 mb-2">Merci &mdash; Questions ?</p>
          <p className="text-sm text-gray-400">Hackathon PayFit x Eugenia School x Paatch &mdash; 2026</p>
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
    <div className="bg-white -m-6 -mt-4">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <DemoSection />
      <ImpactSection />
      <StackSection />
      <SynthesisSection />
      <DeliverablesSection />
      <CTASection />
    </div>
  );
}

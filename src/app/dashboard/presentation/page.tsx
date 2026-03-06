"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ImageIcon,
  BarChart3,
  Eye,
  DollarSign,
  Sparkles,
  Lock,
  Languages,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/* ================================================================
   HELPERS
   ================================================================ */

function SectionLabel({ children, color = "text-[#0066CC]" }: { children: React.ReactNode; color?: string }) {
  return <p className={`text-sm font-medium ${color} mb-2 tracking-wide uppercase`}>{children}</p>;
}

function SlideTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{children}</h2>;
}

function ScreenshotPlaceholder({ label = "Ajouter une capture d'écran", className = "", src }: { label?: string; className?: string; src?: string }) {
  if (src) {
    return (
      <div className={`relative rounded-xl overflow-hidden border border-gray-200 ${className}`}>
        <Image src={src} alt={label} fill className="object-contain" />
      </div>
    );
  }
  return (
    <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-gray-200/60 flex items-center justify-center">
        <ImageIcon className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
    </div>
  );
}

function DemoLink({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Button size="sm" className="bg-[#0066CC] hover:bg-[#004C99] text-white rounded-xl cursor-pointer gap-2">
          {children}
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </a>
    );
  }
  return (
    <Link href={href}>
      <Button size="sm" className="bg-[#0066CC] hover:bg-[#004C99] text-white rounded-xl cursor-pointer gap-2">
        {children}
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </Link>
  );
}

function MiniCard({
  icon: Icon,
  title,
  items,
  accent = "#0066CC",
  number,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  accent?: string;
  number?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all duration-300" style={{ borderTopColor: accent, borderTopWidth: 3 }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
          <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
        </div>
        {number && <span className="text-xs font-mono" style={{ color: `${accent}99` }}>{number}</span>}
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
            <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: accent }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================================================================
   SCREENSHOTS — Placez vos images dans /public/screenshots/
   Noms attendus :
     - n8n-dashboard.png
     - scoring-trends.png
     - generateur-articles.png
     - article-publie-seo.png
     - quiz-resultats.png
     - veille-concurrentielle.png
   ================================================================ */

const SCREENSHOTS = {
  n8n: "/screenshots/n8n-dashboard.png",
  scoring: "/screenshots/scoring-trends.png",
  generateur: "/screenshots/generateur-articles.png",
  article: "/screenshots/article-publie-seo.png",
  quiz: "/screenshots/quiz-resultats.png",
  veille: "/screenshots/veille-concurrentielle.png",
};

/* On vérifie coté client si l'image existe, sinon on affiche le placeholder */
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
  return <ScreenshotPlaceholder label={label} className={className} src={exists ? src : undefined} />;
}

/* ================================================================
   SLIDES
   ================================================================ */

function Slide1() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <div className="inline-flex items-center gap-2 bg-[#0066CC]/5 text-[#0066CC] px-4 py-1.5 rounded-full text-sm font-medium mb-8">
        <Shield className="w-4 h-4" />
        Hackathon PayFit — Eugenia School 2026
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-2">
        SEO Copilot
      </h1>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0066CC] leading-tight mb-6">
        for PayFit
      </h1>
      <p className="text-xl text-gray-500 max-w-xl mx-auto mb-8">
        Détecter. Générer. Publier.<br />
        <span className="font-semibold text-gray-700">Avant la concurrence.</span>
      </p>
      <div className="w-24 h-1 bg-[#0066CC] rounded-full" />
    </div>
  );
}

function Slide2() {
  const problems = [
    {
      icon: FileText,
      number: "01",
      title: "Volume vs Qualité",
      desc: "Créer du contenu expert en masse sans nuire à la marque PayFit. Références légales obligatoires, ton pédagogique à maintenir.",
      accent: "#F59E0B",
    },
    {
      icon: Search,
      number: "02",
      title: "Veille trop lente",
      desc: "Factorial, Lucca, Cegid publient sur les mêmes mots-clés. Les tendances émergent vite — il faut réagir en heures, pas en semaines.",
      accent: "#EF4444",
    },
    {
      icon: Code2,
      number: "03",
      title: "Dépendance technique",
      desc: "Quiz, simulateurs = dév nécessaire. L'équipe SEO doit être autonome. Outils no-code = rapidité de déploiement.",
      accent: "#8B5CF6",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <SectionLabel>Le constat</SectionLabel>
        <SlideTitle>3 problèmes, 1 seule réponse</SlideTitle>
      </div>
      <div className="grid gap-5 flex-1 content-center">
        {problems.map((p) => (
          <div
            key={p.number}
            className="flex gap-5 bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300"
            style={{ borderLeftWidth: 4, borderLeftColor: p.accent }}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.accent}12` }}>
              <p.icon className="w-6 h-6" style={{ color: p.accent }} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-mono" style={{ color: `${p.accent}99` }}>{p.number}</span>
                <h3 className="text-base font-semibold text-gray-900">{p.title}</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide3() {
  const steps = [
    { icon: Search, title: "Veille auto", sub: "N8N — cycle 6h", items: ["5 sources en parallèle", "Légifrance, URSSAF, BOFIP", "People Also Ask", "Analyse gaps concurrents"], accent: "#F59E0B" },
    { icon: Bot, title: "Scoring IA", sub: "GPT-4o-mini", items: ["3 axes : nouveauté, pertinence, volume", "Signal & source identifiés", "Score ≥ 4 = auto-génération"], accent: "#0066CC" },
    { icon: PenTool, title: "Génération", sub: "GPT-4.1 — 3 passes", items: ["Article SEO complet", "Netlinking IA (pass 2)", "Références légales injectées", "Meta auto-extraites"], accent: "#10B981" },
    { icon: Zap, title: "Publication", sub: "SEO-ready", items: ["JSON-LD (Article, FAQ, Org)", "Sitemap & robots dynamiques", "Canonical + OpenGraph", "Quiz lead magnet intégré"], accent: "#8B5CF6" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <SectionLabel>La solution</SectionLabel>
        <SlideTitle>Un pipeline SEO entièrement automatisé</SlideTitle>
      </div>
      <div className="grid md:grid-cols-4 gap-4 flex-1 content-center">
        {steps.map((s, i) => (
          <div key={s.title} className="relative">
            <MiniCard icon={s.icon} title={s.title} items={s.items} accent={s.accent} />
            <p className="text-[10px] font-medium mt-1.5 ml-1" style={{ color: s.accent }}>{s.sub}</p>
            {i < 3 && (
              <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 items-center justify-center">
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <DemoLink href="/dashboard">Voir le dashboard</DemoLink>
      </div>
    </div>
  );
}

function Slide4() {
  const techs = [
    { icon: Blocks, title: "Frontend", sub: "Next.js 16 + React 19", items: ["Tailwind CSS + shadcn/ui", "App Router (SSR)", "Déployé sur Vercel"], accent: "#0066CC" },
    { icon: Database, title: "Backend", sub: "Supabase", items: ["PostgreSQL + RLS", "Auth SSR + Middleware", "Webhook sécurisé"], accent: "#10B981" },
    { icon: Bot, title: "Intelligence Artificielle", sub: "OpenAI", items: ["GPT-4.1 (génération, t=0.3)", "GPT-4o-mini (scoring)", "Templates éditables en BDD"], accent: "#F59E0B" },
    { icon: Workflow, title: "Automation No-Code", sub: "N8N Cloud", items: ["3 workflows automatisés", "Cycles 6h / 12h", "Webhooks + triggers"], accent: "#8B5CF6" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <SectionLabel>Architecture</SectionLabel>
        <SlideTitle>Stack technique & parti pris</SlideTitle>
      </div>
      <div className="grid md:grid-cols-4 gap-4 flex-1 content-center">
        {techs.map((t) => (
          <div key={t.title}>
            <MiniCard icon={t.icon} title={t.title} items={t.items} accent={t.accent} />
            <p className="text-[10px] font-medium mt-1.5 ml-1" style={{ color: t.accent }}>{t.sub}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-gradient-to-r from-[#004C99] to-[#0066CC] rounded-xl p-4 text-center">
        <p className="text-white font-semibold text-sm">
          Coût total IA : <span className="text-lg">~7$/mois</span> &nbsp;•&nbsp; Reproductible &nbsp;•&nbsp; Scalable à l&apos;international
        </p>
      </div>
    </div>
  );
}

function Slide5() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionLabel color="text-emerald-600">Demo live</SectionLabel>
          <SlideTitle>Veille automatisée & Détection de tendances</SlideTitle>
        </div>
        <DemoLink href="/dashboard/trends">Ouvrir les tendances</DemoLink>
      </div>

      <div className="grid md:grid-cols-2 gap-5 flex-1">
        {/* Left — N8N */}
        <div className="flex flex-col gap-4">
          <MiniCard
            icon={Workflow}
            title="Workflow N8N — Cycle de 6h"
            accent="#F59E0B"
            items={[
              "Légifrance JO RSS — nouvelles lois & décrets",
              "BOFIP / URSSAF RSS — mises à jour fiscales",
              "People Also Ask — questions émergentes Google",
              "Analyse concurrents — gaps de contenu",
              "Fusion multi-source + déduplication Jaccard (0.6)",
            ]}
          />
          <SmartScreenshot src={SCREENSHOTS.n8n} label="Capture du dashboard N8N → n8n-dashboard.png" className="flex-1 min-h-[140px]" />
        </div>

        {/* Right — Scoring */}
        <div className="flex flex-col gap-4">
          <MiniCard
            icon={Bot}
            title="Scoring IA — 3 axes"
            accent="#0066CC"
            items={[
              "Nouveauté (1-5) — le sujet est-il déjà couvert ?",
              "Pertinence PayFit (1-5) — correspond à l'ICP ?",
              "Volume recherche (1-5) — potentiel SEO",
              "Score ≥ 4/5 → génération auto déclenchée",
              "Rate limit : 30 scorings / heure / utilisateur",
            ]}
          />
          <SmartScreenshot src={SCREENSHOTS.scoring} label="Capture du scoring → scoring-trends.png" className="flex-1 min-h-[140px]" />
        </div>
      </div>
    </div>
  );
}

function Slide6() {
  const passes = [
    {
      num: "1",
      icon: PenTool,
      title: "Génération",
      items: ["GPT-4.1, température 0.3", "Template de prompt éditable", "Variables : mot-clé, ICP, secondaires", "Références légales injectées", "Ton PayFit (vouvoiement)"],
      accent: "#0066CC",
    },
    {
      num: "2",
      icon: Target,
      title: "Netlinking IA",
      items: ["GPT-4o-mini, température 0.1", "Insère 2-4 liens internes", "Contexte : 50 articles existants", "Garde-fou : ratio 80-130%"],
      accent: "#F59E0B",
    },
    {
      num: "3",
      icon: CheckCircle,
      title: "Meta & Publication",
      items: ["Meta description auto-extraite", "Slug généré automatiquement", "Détection doublons (Jaccard 3 axes)", "Seuil de blocage à 25%"],
      accent: "#10B981",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionLabel color="text-emerald-600">Demo live</SectionLabel>
          <SlideTitle>Génération d&apos;article — Pipeline 3 passes</SlideTitle>
        </div>
        <div className="flex gap-2">
          <DemoLink href="/dashboard/generator">Ouvrir le générateur</DemoLink>
          <DemoLink href="/dashboard/prompts">Voir les prompts</DemoLink>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {passes.map((p) => (
          <MiniCard key={p.num} icon={p.icon} title={p.title} items={p.items} accent={p.accent} number={`Pass ${p.num}`} />
        ))}
      </div>

      <div className="bg-[#0A1E5E] rounded-xl p-4 text-center mb-4">
        <p className="text-white font-semibold text-sm">
          <Shield className="w-4 h-4 inline mr-2 text-[#0066CC]" />
          Zéro hallucination juridique : références vérifiées (Légifrance, URSSAF, EUR-Lex) stockées en base
        </p>
      </div>

      <SmartScreenshot src={SCREENSHOTS.generateur} label="Capture du générateur → generateur-articles.png" className="flex-1 min-h-[120px]" />
    </div>
  );
}

function Slide7() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionLabel color="text-emerald-600">Demo live</SectionLabel>
          <SlideTitle>Article publié — SEO complet</SlideTitle>
        </div>
        <DemoLink href="/dashboard/articles">Voir les articles</DemoLink>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <MiniCard
          icon={BarChart3}
          title="Optimisation on-page"
          accent="#0066CC"
          items={[
            "JSON-LD Article (headline, date, wordCount, author)",
            "JSON-LD FAQPage — auto-extrait de ## FAQ",
            "JSON-LD BreadcrumbList (3 niveaux)",
            "JSON-LD Organization (sameAs LinkedIn & Twitter)",
            "Canonical + OpenGraph + Twitter Card",
            "Sitemap dynamique (home 1.0, quiz 0.9, articles 0.8)",
          ]}
        />
        <MiniCard
          icon={Eye}
          title="Expérience article"
          accent="#10B981"
          items={[
            "Table des matières sticky (générée depuis H2)",
            "Blocs interleavés (Trustpilot, carousel, articles liés)",
            "Articles liés intelligents (scoring 4 signaux)",
            "Auto-linking au rendu (max 5 liens / article)",
            "Slug fuzzy correction (Jaccard ≥60%)",
            "Markdown sécurisé (rendu React custom)",
          ]}
        />
      </div>

      <SmartScreenshot src={SCREENSHOTS.article} label="Capture d'un article publié → article-publie-seo.png" className="flex-1 min-h-[140px]" />
    </div>
  );
}

function Slide8() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionLabel color="text-emerald-600">Demo live</SectionLabel>
          <SlideTitle>Quiz de conformité — Lead magnet</SlideTitle>
        </div>
        <div className="flex gap-2">
          <DemoLink href="/quiz" external>Tester le quiz</DemoLink>
          <DemoLink href="/dashboard/quiz-analytics">Quiz analytics</DemoLink>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <MiniCard
          icon={Gamepad2}
          title="Fonctionnement"
          accent="#8B5CF6"
          items={[
            "12 questions — paie, congés, conformité 2026",
            "4 variantes thématiques (full, congés, conformité, obligations)",
            "Zéro inscription — anonyme, sauvegarde Supabase",
            "Score 0-100 — jauge SVG circulaire animée",
            "Recommandations personnalisées + CTA PayFit",
          ]}
        />
        <MiniCard
          icon={DollarSign}
          title="Lead scoring automatique"
          accent="#F59E0B"
          items={[
            "Lead HOT — score bas = non-conforme = besoin urgent",
            "Lead WARM — score moyen = optimisation nécessaire",
            "Lead COLD — score haut = déjà bien équipé",
            "20 pain points auto-détectés des mauvaises réponses",
            "Segmentation ICP : TPE (1-9) vs PME (10-50)",
          ]}
        />
      </div>

      <SmartScreenshot src={SCREENSHOTS.quiz} label="Capture du quiz résultats → quiz-resultats.png" className="flex-1 min-h-[140px]" />
    </div>
  );
}

function Slide9() {
  const competitors = [
    { name: "Factorial", focus: "Blog RH généraliste • Onboarding", accent: "#EF4444" },
    { name: "Lucca", focus: "Congés & absences • Outils gestion", accent: "#F59E0B" },
    { name: "Cegid", focus: "Expert-comptable • Conformité fiscale", accent: "#0066CC" },
    { name: "Sage", focus: "PME historique • Comptabilité & paie", accent: "#8B5CF6" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionLabel>Avantage compétitif</SectionLabel>
          <SlideTitle>Veille concurrentielle automatisée</SlideTitle>
        </div>
        <div className="flex gap-2">
          <DemoLink href="/dashboard/veille">Ouvrir la veille</DemoLink>
          <DemoLink href="/dashboard/benchmark">Benchmark</DemoLink>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {competitors.map((c) => (
          <div key={c.name} className="bg-white rounded-xl p-4 border border-gray-100 text-center" style={{ borderTopWidth: 3, borderTopColor: c.accent }}>
            <p className="text-sm font-bold text-gray-900">{c.name}</p>
            <p className="text-[11px] text-gray-400 mt-1">{c.focus}</p>
          </div>
        ))}
      </div>

      <MiniCard
        icon={Workflow}
        title="Monitoring automatique (N8N Workflow 3 — toutes les 12h)"
        accent="#0066CC"
        items={[
          "Scraping RSS blogs — détection nouveaux contenus concurrents",
          "Analyse IA stratégique — identification stratégie de contenu par concurrent",
          "Content gaps prioritaires — sujets non couverts par PayFit = opportunités",
          "Position tracking — classement couleur : vert (top 3), jaune (top 6), rouge (>6)",
        ]}
      />

      <SmartScreenshot src={SCREENSHOTS.veille} label="Capture de la veille → veille-concurrentielle.png" className="flex-1 min-h-[110px] mt-4" />
    </div>
  );
}

function Slide10() {
  const kpis = [
    { value: "4-8/jour", label: "Articles générés automatiquement", accent: "#0066CC" },
    { value: "~3h", label: "Économisées par article", accent: "#10B981" },
    { value: "7$/mois", label: "Coût total infrastructure IA", accent: "#F59E0B" },
    { value: "20+/sem", label: "Tendances émergentes détectées", accent: "#8B5CF6" },
  ];

  const scalability = [
    { icon: Languages, title: "Multi-pays", desc: "Références légales par pays dans Supabase, prompts paramétrables" },
    { icon: Globe, title: "Multi-langue", desc: "Templates éditables, ton de voix configurable par marché" },
    { icon: Lock, title: "Sécurité", desc: "RLS Supabase, CSRF, rate limiting, webhook secret, auth middleware" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <SectionLabel>Impact</SectionLabel>
        <SlideTitle>Impact concret pour PayFit</SlideTitle>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <div key={k.value} className="bg-white rounded-2xl p-5 border border-gray-100 text-center" style={{ borderTopWidth: 3, borderTopColor: k.accent }}>
            <p className="text-2xl md:text-3xl font-bold mb-1" style={{ color: k.accent }}>{k.value}</p>
            <p className="text-xs text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0066CC]" />
          Scalabilité
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {scalability.map((s) => (
            <div key={s.title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0066CC]/5 flex items-center justify-center shrink-0">
                <s.icon className="w-4 h-4 text-[#0066CC]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Slide11() {
  const bullets = [
    "URL live déployée sur Vercel + code source disponible",
    "Documentation technique complète et reproductible",
    "Workflows N8N exportables et configurables",
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">SEO Copilot</h1>
      <p className="text-2xl md:text-3xl text-[#0066CC] mb-10">Prêt pour la production.</p>

      <div className="space-y-4 mb-10 text-left max-w-lg mx-auto">
        {bullets.map((b, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-600">{b}</p>
          </div>
        ))}
      </div>

      <div className="w-20 h-0.5 bg-[#0066CC] rounded-full mb-8" />

      <p className="text-xl font-semibold text-gray-900 mb-6">Merci — Questions ?</p>

      <div className="flex gap-3">
        <DemoLink href="/dashboard">Dashboard</DemoLink>
        <DemoLink href="/quiz" external>Tester le quiz</DemoLink>
      </div>
    </div>
  );
}

/* ================================================================
   SLIDE DECK CONTAINER
   ================================================================ */

const SLIDES = [
  { component: Slide1, label: "Titre" },
  { component: Slide2, label: "Le constat" },
  { component: Slide3, label: "Pipeline" },
  { component: Slide4, label: "Stack" },
  { component: Slide5, label: "Veille & Trends" },
  { component: Slide6, label: "Génération" },
  { component: Slide7, label: "Article SEO" },
  { component: Slide8, label: "Quiz" },
  { component: Slide9, label: "Concurrence" },
  { component: Slide10, label: "Impact" },
  { component: Slide11, label: "Closing" },
];

export default function PresentationPage() {
  const [current, setCurrent] = useState(0);
  const total = SLIDES.length;

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent((c) => Math.min(total - 1, c + 1)), [total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const CurrentSlide = SLIDES[current].component;

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* ── Slide content ── */}
      <div className="flex-1 max-w-6xl w-full mx-auto py-6">
        <CurrentSlide />
      </div>

      {/* ── Navigation bar ── */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-200 py-3 px-6 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Prev */}
          <Button
            variant="outline"
            size="sm"
            onClick={prev}
            disabled={current === 0}
            className="rounded-xl cursor-pointer gap-1.5 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Précédent</span>
          </Button>

          {/* Center: dots + label */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === current ? "w-6 bg-[#0066CC]" : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-[#0066CC]">{current + 1}</span>
              <span className="mx-1">/</span>
              <span>{total}</span>
              <span className="mx-2 text-gray-300">|</span>
              <span>{SLIDES[current].label}</span>
            </p>
          </div>

          {/* Next */}
          <Button
            variant="outline"
            size="sm"
            onClick={next}
            disabled={current === total - 1}
            className="rounded-xl cursor-pointer gap-1.5 disabled:opacity-30"
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  ArrowRight,
  TrendingUp,
  FileText,
  CheckCircle,
  Eye,
  Calendar,
  AlertTriangle,
  Heart,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { FadeInStagger } from "@/components/landing/FadeInStagger";
import { CountUp } from "@/components/landing/CountUp";
import { FAQItem } from "@/components/landing/FAQItem";
import "./landing-animations.css";

/* ---------- FAQ Data ---------- */
const faqItems = [
  {
    question: "Quels sont les principaux changements de paie en 2026 ?",
    answer:
      "Les changements majeurs incluent la hausse du SMIC à 12,02\u00a0€/h, le nouveau plafond de sécurité sociale à 4\u00a0005\u00a0€/mois, la mise en place du RGDU (Registre Général et Durable Unifié), l'application de la directive européenne sur la transparence salariale, et le passage du forfait social sur les ruptures conventionnelles de 30\u00a0% à 40\u00a0%.",
  },
  {
    question:
      "Qu'est-ce que le RGDU et comment impacte-t-il la gestion de paie ?",
    answer:
      "Le RGDU (Registre Général et Durable Unifié) remplace plusieurs anciens dispositifs administratifs. Il simplifie certaines obligations déclaratives mais nécessite une mise à jour de vos processus de paie et de votre logiciel pour intégrer les nouvelles codifications.",
  },
  {
    question:
      "La transparence salariale est-elle obligatoire pour les TPE/PME ?",
    answer:
      "Oui. La directive européenne 2023/970 s'applique progressivement à toutes les entreprises. Dès 2026, les offres d'emploi doivent mentionner des fourchettes de rémunération, et les salariés peuvent demander des informations sur les écarts salariaux au sein de leur catégorie.",
  },
  {
    question: "Les salariés en arrêt maladie acquièrent-ils des congés payés ?",
    answer:
      "Oui, depuis la loi du 22 avril 2024. Les salariés en arrêt maladie non professionnel acquièrent 2 jours ouvrables de congés par mois d'absence. Cette règle doit être intégrée dans votre logiciel de paie pour éviter les litiges.",
  },
  {
    question: "Quel est le nouveau montant du SMIC en 2026 ?",
    answer:
      "Le SMIC horaire brut est fixé à 12,02\u00a0€ au 1er janvier 2026, soit un SMIC mensuel brut de 1\u00a0823,07\u00a0€ pour 35 heures hebdomadaires. Vérifiez que tous vos bulletins de paie respectent ce minimum.",
  },
  {
    question: "Le quiz de conformité paie est-il gratuit ?",
    answer:
      "Oui, le quiz est entièrement gratuit et ne nécessite aucune inscription. Il comporte 12 questions et 2 mini-calculateurs. Vous obtenez un score de conformité et des recommandations personnalisées en moins de 3 minutes.",
  },
  {
    question:
      "Comment PayFit aide-t-il à rester conforme aux changements de paie ?",
    answer:
      "PayFit met à jour automatiquement vos bulletins de paie à chaque changement légal. Le logiciel intègre les nouveaux taux (SMIC, plafond SS, cotisations), les nouvelles obligations déclaratives (DSN, RGDU), et vous alerte des changements impactant votre entreprise.",
  },
];

/* ---------- JSON-LD Structured Data ---------- */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PayFit SEO Copilot",
  description:
    "Outil de veille et de conformité paie 2026. Quiz gratuit, génération d'articles SEO, benchmark concurrentiel.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  inLanguage: "fr",
};

/* ---------- Pain Points Data ---------- */
const painPoints = [
  {
    icon: TrendingUp,
    title: "SMIC et plafond sécu en hausse",
    desc: "SMIC à 12,02\u00a0€/h, plafond SS à 4\u00a0005\u00a0€. Vos bulletins sont-ils à jour ?",
    color: "bg-[#0066CC]/8 text-[#0066CC]",
  },
  {
    icon: FileText,
    title: "RGDU : nouveau regroupement des dispositifs",
    desc: "Le Registre Général et Durable Unifié remplace plusieurs anciens dispositifs. Savez-vous lesquels ?",
    color: "bg-[#0066CC]/8 text-[#0066CC]",
  },
  {
    icon: Eye,
    title: "Transparence salariale obligatoire",
    desc: "Directive UE 2023/970 : fourchettes dans les offres, accès des salariés aux écarts. Êtes-vous prêt ?",
    color: "bg-[#0066CC]/8 text-[#0066CC]",
  },
  {
    icon: Calendar,
    title: "Congés payés pendant l'arrêt maladie",
    desc: "Depuis la loi du 22 avril 2024, vos salariés en arrêt acquièrent des congés. C'est intégré dans votre paie ?",
    color: "bg-[#0066CC]/8 text-[#0066CC]",
  },
  {
    icon: AlertTriangle,
    title: "Rupture conventionnelle plus coûteuse",
    desc: "Forfait social passé de 30\u00a0% à 40\u00a0%. Le coût pour votre entreprise a augmenté.",
    color: "bg-[#0066CC]/8 text-[#0066CC]",
  },
  {
    icon: Heart,
    title: "Nouveau congé de naissance",
    desc: "LFSS 2026 : un congé supplémentaire pour les naissances et adoptions. Il est dans vos process ?",
    color: "bg-[#0066CC]/8 text-[#0066CC]",
  },
];

/* ---------- Steps Data ---------- */
const steps = [
  {
    num: "1",
    title: "Répondez au quiz",
    desc: "12 questions sur les changements paie 2026 : SMIC, RGDU, transparence salariale, congés. Incluant 2 mini-calculateurs.",
  },
  {
    num: "2",
    title: "Obtenez votre score",
    desc: "Évaluation de 0 à 100 avec un diagnostic personnalisé selon la taille de votre entreprise.",
  },
  {
    num: "3",
    title: "Identifiez vos risques",
    desc: "Découvrez vos points de vigilance concrets et nos recommandations pour vous mettre en conformité.",
  },
];

/* ========== PAGE COMPONENT ========== */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />

      {/* ===== HEADER ===== */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo-seo-copilot.png"
              alt="PayFit SEO Copilot"
              width={32}
              height={32}
              className="rounded-lg"
              priority
            />
            <span className="font-semibold text-lg">
              PayFit <span className="text-[#0066CC]">SEO Copilot</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#enjeux"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Enjeux 2026
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Comment ça marche
              </a>
              <a
                href="#faq"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                FAQ
              </a>
            </div>
            <Link href="/quiz">
              <Button
                size="sm"
                className="bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer"
              >
                Tester ma conformité
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ===== HERO ===== */}
        <section className="hero-gradient relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 grid-pattern" />
          <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-[#0066CC]/[0.04] blur-3xl animate-float" />
          <div className="absolute bottom-10 right-[10%] w-80 h-80 rounded-full bg-[#0066CC]/[0.03] blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#0066CC]/[0.02] blur-3xl animate-float-slow" />

          <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-36 text-center">
            <AnimatedSection variant="fadeIn">
              <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-[#0066CC] px-4 py-1.5 rounded-full text-sm font-medium border border-[#0066CC]/10 shadow-sm mb-8">
                <Shield className="w-4 h-4" />
                Conformité paie 2026
              </span>
            </AnimatedSection>

            <AnimatedSection variant="fadeUp" delay={100}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
                Votre paie est-elle conforme
                <br />
                <span className="text-[#0066CC]">
                  aux règles de 2026&nbsp;?
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection variant="fadeUp" delay={200}>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
                SMIC, RGDU, transparence salariale, congés maladie&hellip; Les
                obligations paie évoluent vite. Évaluez votre niveau de
                conformité en{" "}
                <strong className="text-gray-900">3 minutes</strong> avec notre
                quiz expert gratuit.
              </p>
            </AnimatedSection>

            <AnimatedSection variant="fadeUp" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Link href="/quiz">
                  <Button
                    size="lg"
                    className="bg-[#0066CC] hover:bg-[#004C99] text-white px-8 py-6 text-lg rounded-xl cta-glow cursor-pointer"
                  >
                    Tester ma conformité paie
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a
                  href="https://payfit.com/fr/demo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 text-[#0066CC] hover:text-[#004C99] font-medium px-6 py-3 transition-colors"
                >
                  Découvrir PayFit
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </AnimatedSection>

            <AnimatedSection variant="fadeIn" delay={450}>
              <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#0066CC]" />
                  Gratuit
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#0066CC]" />
                  Sans inscription
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#0066CC]" />
                  Résultat immédiat
                </span>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ===== STATS BAR ===== */}
        <section
          className="py-14 border-b border-gray-100 bg-white"
          aria-label="Chiffres clés"
        >
          <div className="max-w-5xl mx-auto px-4">
            <FadeInStagger
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
              staggerDelay={150}
            >
              <div>
                <CountUp
                  end={20}
                  suffix="+"
                  className="text-3xl md:text-4xl font-bold text-[#0066CC]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  changements légaux 2026
                </p>
              </div>
              <div>
                <CountUp
                  end={12}
                  className="text-3xl md:text-4xl font-bold text-[#0066CC]"
                />
                <p className="text-sm text-gray-500 mt-1">questions ciblées</p>
              </div>
              <div>
                <CountUp
                  end={3}
                  suffix=" min"
                  className="text-3xl md:text-4xl font-bold text-[#0066CC]"
                />
                <p className="text-sm text-gray-500 mt-1">de quiz</p>
              </div>
              <div>
                <span className="text-3xl md:text-4xl font-bold text-[#0066CC]">
                  100%
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  gratuit, sans inscription
                </p>
              </div>
            </FadeInStagger>
          </div>
        </section>

        {/* ===== PAIN POINTS ===== */}
        <section id="enjeux" className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection className="text-center mb-14">
              <p className="text-sm font-medium text-[#0066CC] mb-3 tracking-wide uppercase">
                Enjeux 2026
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Les règles de paie changent.
                <br className="hidden md:block" /> Êtes-vous prêt ?
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Chaque année apporte son lot de modifications. 2026 est
                particulièrement chargée. Voici les points clés à vérifier.
              </p>
            </AnimatedSection>

            <FadeInStagger
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
              staggerDelay={100}
            >
              {painPoints.map((pain) => (
                <article
                  key={pain.title}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#0066CC]/20 hover:shadow-lg transition-all duration-300 group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${pain.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}
                  >
                    <pain.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {pain.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {pain.desc}
                  </p>
                </article>
              ))}
            </FadeInStagger>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="how-it-works" className="py-20 md:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <p className="text-sm font-medium text-[#0066CC] mb-3 tracking-wide uppercase">
                Comment ça marche
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Évaluez votre conformité en 3 étapes
              </h2>
            </AnimatedSection>

            <div className="relative">
              {/* Connecting line (desktop) */}
              <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-[#0066CC]/20 via-[#0066CC]/30 to-[#0066CC]/20" />

              <FadeInStagger
                className="grid md:grid-cols-3 gap-10 md:gap-8"
                staggerDelay={200}
              >
                {steps.map((step) => (
                  <div key={step.num} className="text-center relative">
                    <div className="relative z-10 w-16 h-16 rounded-full bg-[#0066CC] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200/50">
                      {step.num}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </FadeInStagger>
            </div>

            <AnimatedSection
              variant="fadeUp"
              delay={600}
              className="text-center mt-12"
            >
              <Link href="/quiz">
                <Button
                  size="lg"
                  className="bg-[#0066CC] hover:bg-[#004C99] text-white px-8 rounded-xl cursor-pointer"
                >
                  Commencer le quiz
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </AnimatedSection>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className="py-20 md:py-28 bg-[#FAFBFC]">
          <div className="max-w-3xl mx-auto px-4">
            <AnimatedSection className="text-center mb-12">
              <p className="text-sm font-medium text-[#0066CC] mb-3 tracking-wide uppercase">
                Questions fréquentes
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Tout savoir sur la conformité paie 2026
              </h2>
            </AnimatedSection>

            <AnimatedSection variant="fadeUp" delay={150}>
              <div className="bg-white rounded-2xl border border-gray-100 px-6 md:px-8 shadow-sm">
                {faqItems.map((item) => (
                  <FAQItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section
          className="py-20 md:py-28 bg-gradient-to-br from-[#004C99] to-[#0066CC] relative overflow-hidden"
          aria-label="Appel à l'action"
        >
          {/* Decorative */}
          <div className="absolute inset-0 opacity-[0.04]">
            <div
              className="absolute inset-0 grid-pattern"
              style={{ filter: "invert(1)" }}
            />
          </div>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/[0.05] blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/[0.05] blur-3xl" />

          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <AnimatedSection variant="fadeUp">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ne laissez pas les changements 2026
                <br className="hidden md:block" /> vous surprendre
              </h2>
              <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto leading-relaxed">
                Évaluez votre conformité paie en 3 minutes. Gratuit, sans
                inscription, résultat immédiat.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/quiz">
                  <Button
                    size="lg"
                    className="bg-white text-[#0066CC] hover:bg-blue-50 px-8 py-6 text-lg rounded-xl font-semibold shadow-lg cursor-pointer"
                  >
                    Tester ma conformité maintenant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a
                  href="https://payfit.com/fr/demo/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl cursor-pointer"
                  >
                    Découvrir PayFit
                  </Button>
                </a>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image
                  src="/logo-seo-copilot.png"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="rounded"
                />
                <span className="font-semibold text-sm">
                  PayFit <span className="text-[#0066CC]">SEO Copilot</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Outil de veille et de conformité paie 2026.
                <br />
                Hackathon Eugenia School 2026.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-3">
                Navigation
              </h4>
              <div className="flex flex-col gap-2">
                <Link
                  href="/quiz"
                  className="text-sm text-gray-500 hover:text-[#0066CC] transition-colors"
                >
                  Quiz de conformité
                </Link>
                <a
                  href="#enjeux"
                  className="text-sm text-gray-500 hover:text-[#0066CC] transition-colors"
                >
                  Enjeux 2026
                </a>
                <a
                  href="#faq"
                  className="text-sm text-gray-500 hover:text-[#0066CC] transition-colors"
                >
                  FAQ
                </a>
              </div>
            </div>

            {/* External */}
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-3">PayFit</h4>
              <div className="flex flex-col gap-2">
                <a
                  href="https://payfit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-[#0066CC] transition-colors"
                >
                  PayFit.com
                </a>
                <a
                  href="https://payfit.com/fr/demo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-[#0066CC] transition-colors"
                >
                  Demander une démo
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 text-center">
            <p className="text-xs text-gray-400">
              PayFit SEO Copilot &mdash; ©Equipe13-Eugenia2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

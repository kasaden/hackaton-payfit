import { notFound } from "next/navigation";
import { createServerComponentClient } from "@/lib/supabase/server";
import {
  Star,
  CheckCircle,
  ChevronRight,
  FileText,
  Calendar,
  Receipt,
  Calculator,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FeaturesCarousel } from "@/components/article/FeaturesCarousel";

// --- PARSEUR MARKDOWN BASIQUE ---
// Transforme le texte de l'IA en HTML stylisé avec des ancres (id) pour le sommaire
function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-blue max-w-none text-gray-700">
      {content.split("\n").map((line, i) => {
        // Titre H1
        if (line.startsWith("# ")) return null; // Géré dans le Hero

        // Titre H2
        if (line.startsWith("## ")) {
          const text = line.slice(3);
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return (
            <h2
              key={i}
              id={id}
              className="text-2xl font-bold mt-12 mb-6 text-[#152330] scroll-mt-24"
            >
              {text}
            </h2>
          );
        }

        // Titre H3
        if (line.startsWith("### ")) {
          return (
            <h3
              key={i}
              className="text-xl font-semibold mt-8 mb-4 text-[#152330]"
            >
              {line.slice(4)}
            </h3>
          );
        }

        // Liste à puces
        if (line.startsWith("- ")) {
          return (
            <li key={i} className="ml-6 mb-2 list-disc pl-2">
              <span
                dangerouslySetInnerHTML={{ __html: formatBold(line.slice(2)) }}
              />
            </li>
          );
        }

        // Sauts de ligne
        if (line.trim() === "") return <div key={i} className="h-4" />;

        // Paragraphes normaux
        return (
          <p key={i} className="mb-4 leading-relaxed text-[17px]">
            <span dangerouslySetInnerHTML={{ __html: formatBold(line) }} />
          </p>
        );
      })}
    </div>
  );
}

function formatBold(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

// --- PAGE PRINCIPALE ---
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 1. LA CORRECTION DU 404 EST ICI : Await params pour Next.js 15+
  const { slug } = await params;

  const supabase = await createServerComponentClient();

  // Vérifier si l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Chercher l'article par slug
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!article) {
    notFound();
  }

  // Si l'article est un brouillon, seuls les utilisateurs connectés peuvent le voir
  if (!article.is_published && !user) {
    notFound();
  }

  // 2. Extraire les titres H2 pour construire le Sommaire
  const h2Regex = /^##\s+(.+)$/gm;
  const sommaire: { id: string; text: string }[] = [];
  let match;
  while ((match = h2Regex.exec(article.content_markdown)) !== null) {
    const text = match[1];
    sommaire.push({
      id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      text: text.replace(/\*\*/g, ""),
    });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header original conservé */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
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
          <Link href="/quiz">
            <Button variant="outline" size="sm" className="cursor-pointer">
              Testez votre conformité
            </Button>
          </Link>
        </div>
      </header>

      {/* Navigation / Breadcrumb style PayFit */}
      <div className="bg-[#F4F7F9] py-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 text-sm text-gray-500 flex items-center gap-2">
          <Link
            href="/"
            className="hover:text-[#0066CC] flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Accueil
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/dashboard" className="hover:text-[#0066CC]">
            Articles
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 truncate">{article.title}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#F4F7F9] pt-12 pb-16">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-[#0066CC] rounded-full text-sm font-medium">
            <FileText className="w-4 h-4" />
            Conseils RH & Paie
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#152330] tracking-tight leading-tight">
            {article.title}
          </h1>
          {article.meta_description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {article.meta_description}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 pt-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {article.published_at
                ? new Date(article.published_at).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Brouillon"}
            </span>
            <span>•</span>
            <span>{Math.ceil(article.word_count / 250)} min de lecture</span>
            <span>•</span>
            <span className="font-medium text-gray-900">
              Par les experts PayFit
            </span>
          </div>
        </div>
      </div>

      {/* Contenu principal (Grid : Sommaire + Article) */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* COLONNE GAUCHE : Sommaire (Sticky) */}
          <div className="hidden lg:block w-1/4">
            <div className="sticky top-24 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                Sommaire
              </h3>
              <nav className="flex flex-col gap-3">
                {sommaire.map((item, index) => (
                  <a
                    key={index}
                    href={`#${item.id}`}
                    className="text-sm text-gray-600 hover:text-[#0066CC] hover:translate-x-1 transition-transform"
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* COLONNE DROITE : Contenu de l'article */}
          <div className="w-full lg:w-3/4">
            <MarkdownRenderer content={article.content_markdown} />

            {/* BLOC TRUSTPILOT */}
            <div className="mt-16 bg-[#152330] rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">
                  Rejoignez plus de 20 000 TPE et PME
                </h3>
                <p className="text-gray-300">
                  PayFit est noté <strong className="text-white">4.5/5</strong>{" "}
                  sur Trustpilot.
                </p>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-[#00B67A] flex items-center justify-center rounded-sm"
                    >
                      <Star className="w-5 h-5 text-white fill-white" />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium">TrustScore 4.5</span>
              </div>
            </div>

            {/* CTA original intégré à la fin */}
            <div className="mt-12 p-8 bg-blue-50 rounded-2xl border border-blue-100 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Vous souhaitez automatiser votre paie ?
              </h3>
              <p className="text-gray-600 mb-6">
                PayFit intègre automatiquement les évolutions légales 2026.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/quiz">
                  <Button className="bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer h-11 px-6">
                    Testez votre conformité paie
                  </Button>
                </Link>
                <a
                  href="https://payfit.com/fr/demo/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="cursor-pointer h-11 px-6"
                  >
                    Demander une démo PayFit
                  </Button>
                </a>
              </div>
            </div>

            {/* REMPLACEMENT ICI PAR LE COMPOSANT INTERACTIF */}
            <FeaturesCarousel />
          </div>
        </div>
      </div>
    </div>
  );
}

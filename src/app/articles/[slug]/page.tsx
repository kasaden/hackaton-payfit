import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Zap, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

// Simple markdown to HTML conversion for basic formatting
function markdownToHtml(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-gray-900">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 text-gray-900">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Lists
    .replace(/^- (.+$)/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+$)/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Paragraphs (lines not already wrapped)
    .replace(/^(?!<[hlou])(.*\S.*)$/gm, '<p class="mb-4 text-gray-700 leading-relaxed">$1</p>')
    // Clean up
    .replace(/<\/li>\n<li/g, "</li><li")
    .replace(new RegExp('(<li.*<\\/li>)', 'gs'), '<ul class="mb-4 space-y-1">$1</ul>');

  return html;
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!article) {
    notFound();
  }

  const contentHtml =
    article.content_html || markdownToHtml(article.content_markdown);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0066CC] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
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

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[#0066CC] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        {/* Meta */}
        {article.published_at && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Calendar className="w-4 h-4" />
            {new Date(article.published_at).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {article.word_count && (
              <span className="ml-2">· {article.word_count} mots</span>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* CTA */}
        <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Vous souhaitez automatiser votre paie ?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            PayFit intègre automatiquement les évolutions légales 2026.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/quiz">
              <Button
                className="bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer"
              >
                Testez votre conformité paie
              </Button>
            </Link>
            <a
              href="https://payfit.com/fr/demo/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="cursor-pointer">
                Demander une démo PayFit
              </Button>
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}

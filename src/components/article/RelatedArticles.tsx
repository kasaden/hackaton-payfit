import Link from "next/link";
import { createServerComponentClient } from "@/lib/supabase/server";
import { titleSimilarity } from "@/lib/similarity";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";

// --- Types ---

interface RelatedArticlesProps {
  currentArticleId: string;
  currentTrendId: string | null;
  currentTitle: string;
  currentKeywordPrimary: string;
  currentKeywordsSecondary: string[];
}

interface CandidateArticle {
  id: string;
  trend_id: string | null;
  title: string;
  slug: string;
  meta_description: string | null;
  keyword_primary: string | null;
  keywords_secondary: string[] | null;
  word_count: number | null;
  published_at: string | null;
  trends: { icp_target: string }[] | { icp_target: string } | null;
}

// --- Scoring ---

/** Tokenise un texte en mots normalisés (minuscules, sans accents) */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((w) => w.length > 2)
  );
}

/** Jaccard sur deux ensembles de mots */
function wordOverlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) {
    if (b.has(w)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function computeRelatedScore(
  current: {
    trendId: string | null;
    title: string;
    keywordPrimary: string;
    keywordsSecondary: string[];
    icpTarget: string | null;
  },
  candidate: CandidateArticle
): number {
  let score = 0;

  // Signal 1 : même trend_id (30 pts)
  if (current.trendId && candidate.trend_id === current.trendId) {
    score += 30;
  }

  // Signal 2 : similarité keywords par mots (40 pts)
  // On tokenise keyword_primary + keywords_secondary en mots individuels
  const kwWordsA = tokenize(
    [current.keywordPrimary, ...current.keywordsSecondary].join(" ")
  );
  const kwWordsB = tokenize(
    [
      candidate.keyword_primary || "",
      ...(candidate.keywords_secondary || []),
    ].join(" ")
  );
  score += Math.round(wordOverlap(kwWordsA, kwWordsB) * 40);

  // Signal 3 : similarité titre (15 pts)
  const tScore = titleSimilarity(current.title, candidate.title);
  score += Math.round(tScore * 15);

  // Signal 4 : même icp_target (15 pts max)
  const trends = candidate.trends;
  const candidateIcp = trends
    ? Array.isArray(trends)
      ? trends[0]?.icp_target || null
      : trends.icp_target
    : null;
  if (current.icpTarget && candidateIcp) {
    if (current.icpTarget === candidateIcp) {
      score += 15;
    } else if (
      current.icpTarget === "ICP 1+2" ||
      candidateIcp === "ICP 1+2"
    ) {
      score += 10;
    }
  }

  return Math.min(score, 100);
}

// --- Composant ---

export async function RelatedArticles({
  currentArticleId,
  currentTrendId,
  currentTitle,
  currentKeywordPrimary,
  currentKeywordsSecondary,
}: RelatedArticlesProps) {
  try {
    const supabase = await createServerComponentClient();

    // Récupérer l'icp_target de l'article courant via sa trend
    let currentIcpTarget: string | null = null;
    if (currentTrendId) {
      const { data: trend } = await supabase
        .from("trends")
        .select("icp_target")
        .eq("id", currentTrendId)
        .single();
      currentIcpTarget = trend?.icp_target || null;
    }

    // Récupérer les articles candidats avec join sur trends
    const { data: candidates } = await supabase
      .from("articles")
      .select(
        `
        id, trend_id, title, slug, meta_description,
        keyword_primary, keywords_secondary, word_count, published_at,
        trends ( icp_target )
      `
      )
      .eq("is_published", true)
      .neq("id", currentArticleId)
      .order("published_at", { ascending: false })
      .limit(50);

    if (!candidates || candidates.length === 0) return null;

    // Scorer et trier
    const currentData = {
      trendId: currentTrendId,
      title: currentTitle,
      keywordPrimary: currentKeywordPrimary,
      keywordsSecondary: currentKeywordsSecondary,
      icpTarget: currentIcpTarget,
    };

    const scored = (candidates as CandidateArticle[])
      .map((c) => ({
        ...c,
        relevanceScore: computeRelatedScore(currentData, c),
      }))
      .filter((c) => c.relevanceScore >= 10)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 4);

    // Ne pas afficher si < 2 résultats pertinents
    if (scored.length < 2) return null;

    return (
      <section className="mt-16 border-t border-gray-200 pt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#152330]">
            Articles similaires
          </h2>
          <p className="text-gray-500 mt-2">
            Poursuivez votre lecture sur des sujets connexes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scored.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group block"
            >
              <div className="p-6 border border-gray-200 rounded-xl hover:border-[#0066CC] transition-colors hover:shadow-sm bg-white h-full flex flex-col">
                {article.keyword_primary && (
                  <Badge
                    variant="secondary"
                    className="mb-3 w-fit bg-blue-50 text-[#0066CC] border-blue-100 text-xs"
                  >
                    {article.keyword_primary}
                  </Badge>
                )}

                <h3 className="font-semibold text-lg text-[#152330] group-hover:text-[#0066CC] transition-colors mb-2 line-clamp-2">
                  {article.title}
                </h3>

                {article.meta_description && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2 flex-grow">
                    {article.meta_description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-400 mt-auto pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {Math.ceil((article.word_count || 500) / 250)} min de
                    lecture
                  </span>
                  <span className="flex items-center gap-1 text-[#0066CC] opacity-0 group-hover:opacity-100 transition-opacity">
                    Lire <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    console.error("RelatedArticles error:", error);
    return null;
  }
}

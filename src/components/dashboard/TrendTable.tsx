"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sparkles,
  Bot,
  Loader2,
  Zap,
  ChevronDown,
  Copy,
  AlertTriangle,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { titleSimilarity, keywordSimilarity } from "@/lib/similarity";
import {
  SimilarityPanel,
  type SimilarItem,
} from "@/components/dashboard/SimilarityPanel";

interface Trend {
  id: string;
  question: string;
  source: string;
  signal: string;
  score_novelty: number;
  score_payfit_relevance: number;
  score_volume: number;
  score_total: number;
  icp_target: string;
  suggested_format: string;
  status: string;
  created_at: string;
  user_id: string | null;
}

interface SimpleArticle {
  id: string;
  title: string;
  slug: string;
  keyword_primary: string | null;
  keywords_secondary: string[] | null;
}

interface TrendTableProps {
  trends: Trend[];
  onTrendUpdated?: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "Nouvelle", className: "bg-blue-100 text-blue-700" },
  in_progress: { label: "En cours", className: "bg-yellow-100 text-yellow-700" },
  article_generated: { label: "Article généré", className: "bg-green-100 text-green-700" },
  published: { label: "Publiée", className: "bg-purple-100 text-purple-700" },
  archived: { label: "Archivée", className: "bg-gray-100 text-gray-500" },
};

/** Calcule un score de similarité simplifié entre deux textes (titre/question) */
function computeTrendSimilarity(
  questionA: string,
  questionB: string
): { score: number; level: "duplicate" | "high" | "medium" | "low" | "unique" } {
  const score = Math.round(titleSimilarity(questionA, questionB) * 100);
  let level: "duplicate" | "high" | "medium" | "low" | "unique";
  if (score >= 80) level = "duplicate";
  else if (score >= 60) level = "high";
  else if (score >= 40) level = "medium";
  else if (score >= 20) level = "low";
  else level = "unique";
  return { score, level };
}

export function TrendTable({ trends, onTrendUpdated }: TrendTableProps) {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [articles, setArticles] = useState<SimpleArticle[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<SimilarItem[]>([]);

  // Charger les articles pour comparer
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("articles")
      .select("id, title, slug, keyword_primary, keywords_secondary")
      .then(({ data }) => {
        if (data) setArticles(data);
      });
  }, []);

  /** Trouve les contenus similaires (autres tendances + articles existants) */
  function getSimilarItems(trendId: string): SimilarItem[] {
    const trend = trends.find((t) => t.id === trendId);
    if (!trend) return [];

    const items: SimilarItem[] = [];

    // Comparer avec les autres tendances
    for (const other of trends) {
      if (other.id === trendId) continue;
      const sim = computeTrendSimilarity(trend.question, other.question);
      if (sim.score >= 25) {
        items.push({
          id: other.id,
          title: other.question,
          score: sim.score,
          level: sim.level,
          details: { title: sim.score, keywords: 0, content: 0 },
          type: "trend",
        });
      }
    }

    // Comparer avec les articles existants
    for (const article of articles) {
      const titleScore = titleSimilarity(trend.question, article.title);
      const kwScore = article.keyword_primary
        ? titleSimilarity(trend.question, article.keyword_primary)
        : 0;
      const compositeScore = Math.round(
        Math.max(titleScore, kwScore) * 100
      );
      let level: SimilarItem["level"];
      if (compositeScore >= 80) level = "duplicate";
      else if (compositeScore >= 60) level = "high";
      else if (compositeScore >= 40) level = "medium";
      else if (compositeScore >= 25) level = "low";
      else continue;

      items.push({
        id: article.id,
        title: article.title,
        slug: article.slug,
        score: compositeScore,
        level,
        details: {
          title: Math.round(titleScore * 100),
          keywords: Math.round(kwScore * 100),
          content: 0,
        },
        type: "article",
      });
    }

    return items.sort((a, b) => b.score - a.score);
  }

  /** Meilleur score de similarité pour l'indicateur inline */
  function getBestMatch(
    trendId: string
  ): { score: number; level: string } | null {
    const trend = trends.find((t) => t.id === trendId);
    if (!trend) return null;

    let best = 0;

    for (const other of trends) {
      if (other.id === trendId) continue;
      const sim = computeTrendSimilarity(trend.question, other.question);
      if (sim.score > best) best = sim.score;
    }
    for (const article of articles) {
      const s = Math.round(titleSimilarity(trend.question, article.title) * 100);
      if (s > best) best = s;
    }

    if (best < 25) return null;
    let level: string;
    if (best >= 80) level = "duplicate";
    else if (best >= 60) level = "high";
    else if (best >= 40) level = "medium";
    else level = "low";

    return { score: best, level };
  }

  function toggleExpand(trendId: string) {
    if (expandedId === trendId) {
      setExpandedId(null);
      setExpandedItems([]);
    } else {
      setExpandedId(trendId);
      setExpandedItems(getSimilarItems(trendId));
    }
  }

  async function handleArchive(trendId: string, restore: boolean) {
    const supabase = createClient();
    await supabase
      .from("trends")
      .update({ status: restore ? "new" : "archived" })
      .eq("id", trendId);
    onTrendUpdated?.();
  }

  async function handleAutoGenerate(trend: Trend) {
    setGeneratingId(trend.id);
    try {
      const res = await fetch("/api/auto-generate-from-trend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trend_id: trend.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Erreur ${res.status}`);
      }
      alert(`Article généré : "${data.article.title}" (${data.article.word_count} mots)`);
      onTrendUpdated?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur lors de la génération");
    } finally {
      setGeneratingId(null);
    }
  }

  if (trends.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
        Aucune tendance trouvée.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Score</TableHead>
            <TableHead>Question</TableHead>
            <TableHead className="w-28">Source</TableHead>
            <TableHead className="w-20">ICP</TableHead>
            <TableHead className="w-36">Format</TableHead>
            <TableHead className="w-32">Statut</TableHead>
            <TableHead className="w-28">Similarité</TableHead>
            <TableHead className="w-40">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trends.map((trend) => {
            const scoreNum = Number(trend.score_total);
            const scoreColor =
              scoreNum >= 4
                ? "bg-green-100 text-green-700"
                : scoreNum >= 3
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700";
            const status = statusConfig[trend.status] || statusConfig.new;
            const isAutoDetected = !trend.user_id;

            return (
              <><TableRow key={trend.id}>
                <TableCell>
                  <Badge className={scoreColor}>
                    {scoreNum.toFixed(1)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-sm" title={trend.question}>
                      {trend.question.length > 60
                        ? trend.question.slice(0, 60) + "..."
                        : trend.question}
                    </span>
                    {isAutoDetected && (
                      <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 border-violet-200 bg-violet-50 text-violet-600 gap-1">
                        <Bot className="w-3 h-3" />
                        N8N
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {trend.source}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {trend.icp_target}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {trend.suggested_format}
                </TableCell>
                <TableCell>
                  <Badge className={status.className}>{status.label}</Badge>
                </TableCell>
                <TableCell>
                  {(() => {
                    const match = getBestMatch(trend.id);
                    if (!match) {
                      return (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Unique
                        </Badge>
                      );
                    }
                    return (
                      <button
                        onClick={() => toggleExpand(trend.id)}
                        className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                        title="Voir les sujets similaires"
                      >
                        {match.level === "duplicate" ? (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 gap-1">
                            <Copy className="w-3 h-3" />
                            {match.score}%
                          </Badge>
                        ) : match.level === "high" ? (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {match.score}%
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 gap-1">
                            {match.score}%
                          </Badge>
                        )}
                        <ChevronDown
                          className={`w-3 h-3 text-gray-400 transition-transform ${
                            expandedId === trend.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  {(trend.status === "new" ||
                    trend.status === "in_progress") && (
                    <div className="flex gap-1">
                      <Link
                        href={`/dashboard/generator?trend_id=${trend.id}`}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#0066CC] hover:text-[#004C99] cursor-pointer"
                          title="Ouvrir dans le générateur"
                        >
                          <Sparkles className="w-4 h-4 mr-1" />
                          Éditer
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-violet-600 hover:text-violet-800 hover:bg-violet-50 cursor-pointer"
                        title="Générer automatiquement un article"
                        onClick={() => handleAutoGenerate(trend)}
                        disabled={generatingId === trend.id}
                      >
                        {generatingId === trend.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-1" />
                        )}
                        Auto
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer"
                        title="Archiver cette tendance"
                        onClick={() => handleArchive(trend.id, false)}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {trend.status === "archived" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#0066CC] hover:text-[#004C99] cursor-pointer"
                      title="Désarchiver cette tendance"
                      onClick={() => handleArchive(trend.id, true)}
                    >
                      <ArchiveRestore className="w-4 h-4 mr-1" />
                      Restaurer
                    </Button>
                  )}
                </TableCell>
              </TableRow>
              {expandedId === trend.id && (
                <TableRow key={`${trend.id}-sim`}>
                  <TableCell colSpan={8} className="bg-gray-50/50 p-4">
                    <div className="max-w-2xl">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Copy className="w-4 h-4 text-gray-400" />
                        Sujets similaires à &ldquo;{trend.question.length > 50 ? trend.question.slice(0, 50) + "…" : trend.question}&rdquo;
                      </h4>
                      <SimilarityPanel
                        items={expandedItems}
                        emptyMessage="Cette tendance est unique — aucune similarité détectée."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

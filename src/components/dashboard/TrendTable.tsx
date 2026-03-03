"use client";

import Link from "next/link";
import { useState } from "react";
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
import { Sparkles, Bot, Loader2, Zap } from "lucide-react";

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

interface TrendTableProps {
  trends: Trend[];
  onTrendUpdated?: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "Nouvelle", className: "bg-blue-100 text-blue-700" },
  in_progress: { label: "En cours", className: "bg-yellow-100 text-yellow-700" },
  article_generated: { label: "Article généré", className: "bg-green-100 text-green-700" },
  published: { label: "Publiée", className: "bg-purple-100 text-purple-700" },
};

export function TrendTable({ trends, onTrendUpdated }: TrendTableProps) {
  const [generatingId, setGeneratingId] = useState<string | null>(null);

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
    <div className="bg-white rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Score</TableHead>
            <TableHead>Question</TableHead>
            <TableHead className="w-28">Source</TableHead>
            <TableHead className="w-20">ICP</TableHead>
            <TableHead className="w-36">Format</TableHead>
            <TableHead className="w-32">Statut</TableHead>
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
              <TableRow key={trend.id}>
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
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

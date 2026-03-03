"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Eye,
  Lightbulb,
  Shield,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface Benchmark {
  id: string;
  competitor: string;
  keyword: string;
  position: number | null;
  url: string | null;
  content_type: string;
  notes: string;
  checked_at: string;
}

interface ContentGapData {
  topic?: string;
  opportunity?: string;
  priority?: string;
  content_strategy?: string;
  threats?: string[];
}

interface CompetitorInsight {
  competitor: string;
  totalGaps: number;
  highPriorityGaps: number;
  gaps: Array<{
    id: string;
    keyword: string;
    data: ContentGapData;
    checked_at: string;
  }>;
  threats: string[];
  strategy: string;
}

export default function VeillePage() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [trends, setTrends] = useState<{ question: string; source: string; score_total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"overview" | "gaps" | "threats">("overview");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [benchRes, trendRes] = await Promise.all([
        supabase
          .from("benchmarks")
          .select("*")
          .order("checked_at", { ascending: false }),
        supabase
          .from("trends")
          .select("question, source, score_total")
          .ilike("source", "%concurrentielle%")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      setBenchmarks(benchRes.data ?? []);
      setTrends(trendRes.data ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Parse content gaps from benchmarks
  const contentGaps = benchmarks.filter((b) => b.content_type === "content_gap");
  const positionBenchmarks = benchmarks.filter((b) => b.content_type !== "content_gap");

  // Group gaps by competitor
  const competitorInsights: CompetitorInsight[] = (() => {
    const map = new Map<string, CompetitorInsight>();

    for (const gap of contentGaps) {
      let data: ContentGapData = {};
      try {
        data = JSON.parse(gap.notes || "{}");
      } catch {
        data = { topic: gap.notes };
      }

      if (!map.has(gap.competitor)) {
        map.set(gap.competitor, {
          competitor: gap.competitor,
          totalGaps: 0,
          highPriorityGaps: 0,
          gaps: [],
          threats: [],
          strategy: "",
        });
      }

      const insight = map.get(gap.competitor)!;
      insight.totalGaps++;
      if (data.priority === "high") insight.highPriorityGaps++;
      insight.gaps.push({
        id: gap.id,
        keyword: gap.keyword,
        data,
        checked_at: gap.checked_at,
      });

      if (data.content_strategy && !insight.strategy) {
        insight.strategy = data.content_strategy;
      }
      if (data.threats) {
        for (const t of data.threats) {
          if (!insight.threats.includes(t)) insight.threats.push(t);
        }
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => b.highPriorityGaps - a.highPriorityGaps
    );
  })();

  const totalGaps = contentGaps.length;
  const highPriorityGaps = contentGaps.filter((g) => {
    try {
      return JSON.parse(g.notes || "{}").priority === "high";
    } catch {
      return false;
    }
  }).length;
  const allThreats = competitorInsights.flatMap((c) => c.threats);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Veille Concurrentielle</h1>
        <div className="h-96 bg-white rounded-xl border animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="w-6 h-6 text-[#0066CC]" />
            Veille Concurrentielle
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Analyse automatique des concurrents via N8N Workflow 3
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {competitorInsights.length} concurrents suivis
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalGaps}</p>
              <p className="text-xs text-gray-500">Content Gaps</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{highPriorityGaps}</p>
              <p className="text-xs text-gray-500">Haute priorité</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{allThreats.length}</p>
              <p className="text-xs text-gray-500">Menaces SEO</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{trends.length}</p>
              <p className="text-xs text-gray-500">Trends générées</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeView === "overview" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveView("overview")}
          className={activeView === "overview" ? "bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer" : "cursor-pointer"}
        >
          <Lightbulb className="w-4 h-4 mr-1" />
          Vue d&apos;ensemble
        </Button>
        <Button
          variant={activeView === "gaps" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveView("gaps")}
          className={activeView === "gaps" ? "bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer" : "cursor-pointer"}
        >
          <Target className="w-4 h-4 mr-1" />
          Content Gaps
          {highPriorityGaps > 0 && (
            <Badge className="ml-2 bg-red-100 text-red-700 text-xs">{highPriorityGaps}</Badge>
          )}
        </Button>
        <Button
          variant={activeView === "threats" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveView("threats")}
          className={activeView === "threats" ? "bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer" : "cursor-pointer"}
        >
          <Shield className="w-4 h-4 mr-1" />
          Menaces &amp; Positions
        </Button>
      </div>

      {/* Content */}
      {activeView === "overview" && (
        <div className="space-y-6">
          {/* Competitor Cards */}
          {competitorInsights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitorInsights.map((insight) => (
                <div key={insight.competitor} className="bg-white rounded-xl border p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{insight.competitor}</h3>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-50 text-blue-700">
                        {insight.totalGaps} gaps
                      </Badge>
                      {insight.highPriorityGaps > 0 && (
                        <Badge className="bg-red-50 text-red-700">
                          {insight.highPriorityGaps} urgents
                        </Badge>
                      )}
                    </div>
                  </div>

                  {insight.strategy && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Stratégie contenu</p>
                      <p className="text-sm text-gray-700">{insight.strategy}</p>
                    </div>
                  )}

                  {/* Top gaps */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase">Opportunités PayFit</p>
                    {insight.gaps.slice(0, 3).map((gap) => (
                      <div
                        key={gap.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            gap.data.priority === "high"
                              ? "text-red-500"
                              : "text-blue-500"
                          }`}
                        />
                        <div>
                          <span className="font-medium">{gap.keyword}</span>
                          {gap.data.opportunity && (
                            <p className="text-xs text-gray-500">{gap.data.opportunity}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Threats */}
                  {insight.threats.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Menaces</p>
                      {insight.threats.slice(0, 2).map((threat, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
                          <span className="text-gray-700">{threat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Aucune analyse concurrentielle
              </h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Les données de veille concurrentielle apparaîtront ici une fois le Workflow 3 N8N activé.
                Il analyse automatiquement les blogs de Factorial, Lucca, Cegid et Sage toutes les 12h.
              </p>
            </div>
          )}

          {/* Trends from competitive intelligence */}
          {trends.length > 0 && (
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0066CC]" />
                  Tendances issues de la veille concurrentielle
                </h3>
                <Link href="/dashboard/trends">
                  <Button variant="ghost" size="sm" className="text-[#0066CC] cursor-pointer">
                    Voir toutes les tendances
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead className="w-40">Source</TableHead>
                    <TableHead className="w-24">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trends.slice(0, 10).map((t, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium">{t.question}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {t.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            t.score_total >= 4
                              ? "bg-green-100 text-green-700"
                              : t.score_total >= 3
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {Number(t.score_total).toFixed(1)}/5
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {activeView === "gaps" && (
        <div className="bg-white rounded-xl border overflow-hidden">
          {contentGaps.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Concurrent</TableHead>
                  <TableHead>Mot-clé / Sujet</TableHead>
                  <TableHead className="w-24">Priorité</TableHead>
                  <TableHead>Opportunité</TableHead>
                  <TableHead className="w-32">Détecté le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contentGaps.map((gap, i) => {
                  let data: ContentGapData = {};
                  try {
                    data = JSON.parse(gap.notes || "{}");
                  } catch {
                    data = { topic: gap.notes };
                  }

                  return (
                    <TableRow key={gap.id} className={i % 2 === 0 ? "" : "bg-gray-50/50"}>
                      <TableCell className="font-medium text-sm">{gap.competitor}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{gap.keyword}</p>
                          {data.topic && data.topic !== gap.keyword && (
                            <p className="text-xs text-gray-500">{data.topic}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            data.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }
                        >
                          {data.priority === "high" ? "Haute" : "Moyenne"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs">
                        {data.opportunity || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-gray-400">
                        {new Date(gap.checked_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>Aucun content gap détecté pour le moment.</p>
              <p className="text-sm text-gray-400 mt-1">
                Activez le Workflow 3 N8N pour détecter les opportunités.
              </p>
            </div>
          )}
        </div>
      )}

      {activeView === "threats" && (
        <div className="space-y-6">
          {/* Threats list */}
          {allThreats.length > 0 && (
            <div className="bg-white rounded-xl border p-6 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Menaces SEO identifiées
              </h3>
              <div className="space-y-2">
                {allThreats.map((threat, i) => {
                  const competitor = competitorInsights.find((c) =>
                    c.threats.includes(threat)
                  );
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg"
                    >
                      <Shield className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm">{threat}</p>
                        {competitor && (
                          <p className="text-xs text-amber-600 mt-1">
                            via {competitor.competitor}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Position benchmarks */}
          {positionBenchmarks.length > 0 ? (
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Positions Google des concurrents</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Concurrent</TableHead>
                    <TableHead>Mot-clé</TableHead>
                    <TableHead className="w-24">Position</TableHead>
                    <TableHead className="w-28">Type</TableHead>
                    <TableHead>URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positionBenchmarks.map((b, i) => {
                    const posColor =
                      b.position && b.position <= 3
                        ? "bg-green-100 text-green-700"
                        : b.position && b.position <= 6
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700";

                    return (
                      <TableRow key={b.id} className={i % 2 === 0 ? "" : "bg-gray-50/50"}>
                        <TableCell className="font-medium text-sm">{b.competitor}</TableCell>
                        <TableCell className="text-sm">{b.keyword}</TableCell>
                        <TableCell>
                          {b.position ? (
                            <Badge className={posColor}>#{b.position}</Badge>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {b.content_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {b.url ? (
                            <a
                              href={b.url.startsWith("http") ? b.url : `https://${b.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#0066CC] hover:underline truncate block max-w-[240px]"
                            >
                              {b.url.length > 50 ? b.url.slice(0, 50) + "..." : b.url}
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
              {allThreats.length === 0 && (
                <>
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>Aucune menace ou position concurrente détectée.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

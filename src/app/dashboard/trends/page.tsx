"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrendTable } from "@/components/dashboard/TrendTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Sparkles, Loader2 } from "lucide-react";

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
}

interface ScoreResult {
  score_novelty: number;
  score_payfit_relevance: number;
  score_volume: number;
  source: string;
  signal: string;
  icp_target: string;
  suggested_format: string;
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTrends();
  }, []);

  async function fetchTrends() {
    const supabase = createClient();
    const { data } = await supabase
      .from("trends")
      .select("*")
      .order("score_total", { ascending: false });
    setTrends((data as Trend[]) || []);
    setLoading(false);
  }

  async function handleScore() {
    if (!newQuestion.trim()) return;
    setScoring(true);
    setScoreResult(null);

    try {
      const res = await fetch("/api/score-trend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion }),
      });
      const data = await res.json();
      setScoreResult(data);
    } catch {
      alert("Erreur lors de l'analyse");
    } finally {
      setScoring(false);
    }
  }

  async function handleSaveTrend() {
    if (!scoreResult) return;
    setSaving(true);

    const supabase = createClient();
    await supabase.from("trends").insert({
      question: newQuestion,
      source: scoreResult.source,
      signal: scoreResult.signal,
      score_novelty: scoreResult.score_novelty,
      score_payfit_relevance: scoreResult.score_payfit_relevance,
      score_volume: scoreResult.score_volume,
      icp_target: scoreResult.icp_target,
      suggested_format: scoreResult.suggested_format,
      status: "new",
    });

    setDialogOpen(false);
    setNewQuestion("");
    setScoreResult(null);
    setSaving(false);
    fetchTrends();
  }

  const filteredTrends =
    filter === "all" ? trends : trends.filter((t) => t.status === filter);

  const statusCounts = {
    all: trends.length,
    new: trends.filter((t) => t.status === "new").length,
    in_progress: trends.filter((t) => t.status === "in_progress").length,
    article_generated: trends.filter((t) => t.status === "article_generated")
      .length,
    published: trends.filter((t) => t.status === "published").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Tendances détectées</h1>
        <div className="h-96 bg-white rounded-xl border animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tendances détectées</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une tendance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Analyser une nouvelle tendance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Question / Thématique à analyser</Label>
                <Input
                  placeholder="Ex: Télétravail 2026 : nouvelles règles d'exonération..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                />
              </div>
              <Button
                onClick={handleScore}
                disabled={scoring || !newQuestion.trim()}
                className="w-full bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer"
              >
                {scoring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyser avec l&apos;IA
                  </>
                )}
              </Button>

              {scoreResult && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-3 border">
                  <h4 className="font-medium text-sm">Résultat de l&apos;analyse</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-2xl font-bold text-[#0066CC]">
                        {scoreResult.score_novelty}
                      </div>
                      <div className="text-xs text-gray-500">Nouveauté</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#0066CC]">
                        {scoreResult.score_payfit_relevance}
                      </div>
                      <div className="text-xs text-gray-500">Pertinence</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#0066CC]">
                        {scoreResult.score_volume}
                      </div>
                      <div className="text-xs text-gray-500">Volume</div>
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Source :</strong> {scoreResult.source}
                    </p>
                    <p>
                      <strong>Signal :</strong> {scoreResult.signal}
                    </p>
                    <p>
                      <strong>ICP :</strong> {scoreResult.icp_target}
                    </p>
                    <p>
                      <strong>Format :</strong> {scoreResult.suggested_format}
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveTrend}
                    disabled={saving}
                    className="w-full cursor-pointer"
                  >
                    {saving ? "Enregistrement..." : "Confirmer et ajouter"}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            ["all", "Toutes"],
            ["new", "Nouvelles"],
            ["in_progress", "En cours"],
            ["article_generated", "Article généré"],
            ["published", "Publiées"],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key)}
            className={
              filter === key
                ? "bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer"
                : "cursor-pointer"
            }
          >
            {label}
            <Badge variant="secondary" className="ml-2 text-xs">
              {statusCounts[key]}
            </Badge>
          </Button>
        ))}
      </div>

      <TrendTable trends={filteredTrends} />
    </div>
  );
}

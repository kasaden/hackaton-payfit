"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Check, Loader2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { painPointLabels } from "@/data/quiz-questions";

interface QuizResult {
  id: string;
  score: number;
  lead_category: string;
  pain_points: string[];
  company_size: string;
  created_at: string;
}

interface QuizAnalyticsChartsProps {
  quizResults: QuizResult[];
}

const LEAD_COLORS: Record<string, string> = {
  hot: "#C62828",
  warm: "#E65100",
  cold: "#2E7D32",
};

const LEAD_LABELS: Record<string, string> = {
  hot: "Leads chauds",
  warm: "Leads tièdes",
  cold: "Leads froids",
};

const painPointSuggestions: Record<string, { question: string; format: string }> = {
  paie_manuelle: { question: "Comment automatiser sa gestion de paie en 2026 ?", format: "Article + comparatif" },
  paie_confusion: { question: "Quel logiciel de paie choisir pour sa PME ?", format: "Article + checklist" },
  miseajour_retard: { question: "Changements paie 2026 : taux, SMIC et RGDU à mettre à jour", format: "Article + FAQ" },
  veille_absente: { question: "Veille légale paie 2026 : les changements à ne pas rater", format: "Article + checklist" },
  transparence_nonpret: { question: "Directive transparence salariale 2026 : comment se préparer ?", format: "Article + FAQ" },
  transparence_meconnaissance: { question: "Transparence salariale : quelles obligations pour les TPE-PME ?", format: "Article + FAQ" },
  transparence_inconnu: { question: "Comprendre la directive européenne sur la transparence des salaires", format: "Article + FAQ" },
  conges_confusion: { question: "Comment calculer les congés payés de ses salariés en 2026 ?", format: "Article + calculateur" },
  conges_maladie_manuel: { question: "Acquisition de congés payés pendant un arrêt maladie : la règle 2026", format: "Article + FAQ" },
  conges_maladie_inconnu: { question: "Arrêt maladie et congés payés : obligations employeur 2026", format: "Article + FAQ" },
  conges_10eme_manuel: { question: "Maintien de salaire vs règle du 10ème : quelle méthode appliquer ?", format: "Article + calculateur" },
  conges_10eme_inconnu: { question: "Indemnité de congés payés : comparaison maintien vs 10ème", format: "Article + calculateur" },
  rupture_conv_erreur: { question: "Rupture conventionnelle 2026 : nouveau forfait social à 40%", format: "Article + FAQ" },
  titres_resto_verif: { question: "Titres-restaurant 2026 : plafond d'exonération et règles", format: "Article + FAQ" },
  conge_naissance_flou: { question: "Congé de naissance 2026 : durée, conditions et mise en place", format: "Article + FAQ" },
  conge_naissance_inconnu: { question: "Le nouveau congé de naissance : ce que les employeurs doivent savoir", format: "Article + FAQ" },
  tepa_complexe: { question: "Déduction forfaitaire TEPA sur heures supplémentaires : mode d'emploi", format: "Article + calculateur" },
  tepa_inconnu: { question: "Heures supplémentaires : comment bénéficier de la réduction TEPA ?", format: "Article + FAQ" },
  dsn_erreurs: { question: "Éviter les erreurs DSN : guide complet pour les PME", format: "Article + checklist" },
  dsn_incertitude: { question: "DSN mensuelle : obligations et bonnes pratiques 2026", format: "Article + FAQ" },
};

export function QuizAnalyticsCharts({ quizResults }: QuizAnalyticsChartsProps) {
  const [createdTrends, setCreatedTrends] = useState<Set<string>>(new Set());
  const [loadingPain, setLoadingPain] = useState<string | null>(null);

  async function handleCreateTrend(painKey: string, count: number) {
    const suggestion = painPointSuggestions[painKey];
    if (!suggestion) return;

    setLoadingPain(painKey);
    try {
      const supabase = createClient();

      // Vérifier qu'une tendance similaire n'existe pas déjà
      const { data: existing } = await supabase
        .from("trends")
        .select("id")
        .eq("source", "Quiz Analytics")
        .ilike("question", `%${suggestion.question.slice(0, 30)}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        setCreatedTrends((prev) => new Set(prev).add(painKey));
        return;
      }

      const volumeScore = count >= 10 ? 5 : count >= 7 ? 4 : count >= 4 ? 3 : count >= 2 ? 2 : 1;

      await supabase.from("trends").insert({
        question: suggestion.question,
        source: "Quiz Analytics",
        signal: `Pain point détecté chez ${count} répondant${count > 1 ? "s" : ""} (${Math.round((count / quizResults.length) * 100)}% des quiz)`,
        score_novelty: 3,
        score_payfit_relevance: 4,
        score_volume: volumeScore,
        icp_target: "ICP 1+2",
        suggested_format: suggestion.format,
        status: "new",
      });

      setCreatedTrends((prev) => new Set(prev).add(painKey));
    } catch (e) {
      console.error("Erreur création tendance:", e);
    } finally {
      setLoadingPain(null);
    }
  }

  if (quizResults.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
        Aucune réponse au quiz pour le moment. Les graphiques apparaîtront dès
        que des utilisateurs auront complété le quiz.
      </div>
    );
  }

  // Lead distribution for pie chart
  const leadData = ["hot", "warm", "cold"].map((cat) => ({
    name: LEAD_LABELS[cat],
    value: quizResults.filter((r) => r.lead_category === cat).length,
    color: LEAD_COLORS[cat],
  }));

  // Company size distribution for bar chart
  const sizeOrder = ["1-9", "10-19", "20-49", "50+"];
  const sizeData = sizeOrder.map((size) => ({
    size,
    count: quizResults.filter((r) => r.company_size === size).length,
  }));

  // Top pain points
  const painCounts: Record<string, number> = {};
  quizResults.forEach((r) => {
    if (r.pain_points) {
      r.pain_points.forEach((p) => {
        painCounts[p] = (painCounts[p] || 0) + 1;
      });
    }
  });
  const topPains = Object.entries(painCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie - Lead distribution */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Répartition des leads</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={leadData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {leadData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Bar - Company size */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Taille d&apos;entreprise</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sizeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="size" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#0066CC" radius={[4, 4, 0, 0]} name="Répondants" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Pain points table */}
      {topPains.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">
            Pain points les plus fréquents
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Créez automatiquement des tendances à partir des problèmes les plus courants pour alimenter votre stratégie de contenu.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Problème identifié</TableHead>
                <TableHead className="w-24 text-right">Occurrences</TableHead>
                <TableHead className="w-44 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPains.map(([pain, count], i) => (
                <TableRow key={pain}>
                  <TableCell>
                    <Badge variant="secondary">{i + 1}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {painPointLabels[pain] || pain}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={
                        count >= 5
                          ? "bg-red-100 text-red-700"
                          : count >= 3
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {painPointSuggestions[pain] ? (
                      createdTrends.has(pain) ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <Check className="w-3.5 h-3.5" />
                          Tendance créée
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 cursor-pointer"
                          disabled={loadingPain === pain}
                          onClick={() => handleCreateTrend(pain, count)}
                        >
                          {loadingPain === pain ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                          ) : (
                            <TrendingUp className="w-3.5 h-3.5 mr-1" />
                          )}
                          Créer tendance
                        </Button>
                      )
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

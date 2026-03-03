"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { QuizAnalyticsCharts } from "@/components/dashboard/QuizAnalyticsCharts";
import { Card } from "@/components/ui/card";
import { Users, Target, Flame } from "lucide-react";

interface QuizResult {
  id: string;
  score: number;
  lead_category: string;
  pain_points: string[];
  company_size: string;
  created_at: string;
}

export default function QuizAnalyticsPage() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data } = await supabase
        .from("quiz_results")
        .select("*")
        .order("created_at", { ascending: false });
      setResults((data as QuizResult[]) || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
      : 0;
  const hotPercent =
    results.length > 0
      ? Math.round(
          (results.filter((r) => r.lead_category === "hot").length /
            results.length) *
            100
        )
      : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Quiz Analytics</h1>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quiz Analytics</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#0066CC]" />
          </div>
          <div>
            <div className="text-2xl font-bold">{results.length}</div>
            <div className="text-sm text-gray-500">Total réponses</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Target className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <div className="text-2xl font-bold">{avgScore}/100</div>
            <div className="text-sm text-gray-500">Score moyen</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#C62828]" />
          </div>
          <div>
            <div className="text-2xl font-bold">{hotPercent}%</div>
            <div className="text-sm text-gray-500">Leads chauds</div>
          </div>
        </Card>
      </div>

      <QuizAnalyticsCharts quizResults={results} />
    </div>
  );
}

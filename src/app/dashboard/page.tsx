"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatsCards } from "@/components/dashboard/StatsCards";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";

interface Stats {
  trendsCount: number;
  articlesCount: number;
  publishedCount: number;
  quizCount: number;
  hotLeadsCount: number;
}

interface QuizResult {
  id: string;
  lead_category: string;
  created_at: string;
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

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    trendsCount: 0,
    articlesCount: 0,
    publishedCount: 0,
    quizCount: 0,
    hotLeadsCount: 0,
  });
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [trendsRes, articlesRes, publishedRes, quizRes, hotRes] =
        await Promise.allSettled([
          supabase
            .from("trends")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("articles")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("articles")
            .select("id", { count: "exact", head: true })
            .eq("is_published", true),
          supabase.from("quiz_results").select("id, lead_category, created_at"),
          supabase
            .from("quiz_results")
            .select("id", { count: "exact", head: true })
            .eq("lead_category", "hot"),
        ]);

      const quizData =
        quizRes.status === "fulfilled" ? quizRes.value.data : null;

      setStats({
        trendsCount: (trendsRes.status === "fulfilled" ? trendsRes.value.count : 0) || 0,
        articlesCount: (articlesRes.status === "fulfilled" ? articlesRes.value.count : 0) || 0,
        publishedCount: (publishedRes.status === "fulfilled" ? publishedRes.value.count : 0) || 0,
        quizCount: quizData?.length || 0,
        hotLeadsCount: (hotRes.status === "fulfilled" ? hotRes.value.count : 0) || 0,
      });

      setQuizResults((quizData as QuizResult[]) || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  // Données pour le pie chart
  const leadDistribution = ["hot", "warm", "cold"].map((cat) => ({
    name: LEAD_LABELS[cat],
    value: quizResults.filter((r) => r.lead_category === cat).length,
    color: LEAD_COLORS[cat],
  }));

  // Données pour le line chart (réponses par jour)
  const quizByDay = quizResults.reduce<Record<string, number>>((acc, r) => {
    const day = new Date(r.created_at).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  const lineData = Object.entries(quizByDay)
    .map(([date, count]) => ({ date, count }))
    .slice(-14);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Vue d&apos;ensemble</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-xl border animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Vue d&apos;ensemble</h1>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Réponses par jour */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Réponses quiz par jour</h3>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0066CC"
                  strokeWidth={2}
                  name="Réponses"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
              Aucune donnée quiz disponible
            </div>
          )}
        </Card>

        {/* Répartition leads */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Répartition des leads</h3>
          {quizResults.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={leadDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {leadDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
              Aucune donnée quiz disponible
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

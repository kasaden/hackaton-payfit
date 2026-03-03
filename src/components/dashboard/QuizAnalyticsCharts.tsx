"use client";

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

export function QuizAnalyticsCharts({ quizResults }: QuizAnalyticsChartsProps) {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Problème identifié</TableHead>
                <TableHead className="w-24 text-right">Occurrences</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

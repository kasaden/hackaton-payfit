"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, FileText, Users, Flame } from "lucide-react";

interface StatsCardsProps {
  stats: {
    trendsCount: number;
    articlesCount: number;
    publishedCount: number;
    quizCount: number;
    hotLeadsCount: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      icon: TrendingUp,
      title: "Tendances détectées",
      value: stats.trendsCount.toString(),
      iconBg: "bg-blue-50",
      iconColor: "text-[#0066CC]",
    },
    {
      icon: FileText,
      title: "Articles",
      value: `${stats.publishedCount} / ${stats.articlesCount}`,
      subtitle: "publiés",
      iconBg: "bg-green-50",
      iconColor: "text-[#2E7D32]",
    },
    {
      icon: Users,
      title: "Réponses quiz",
      value: stats.quizCount.toString(),
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: Flame,
      title: "Leads chauds",
      value: stats.hotLeadsCount.toString(),
      subtitle: "ce mois",
      iconBg: "bg-orange-50",
      iconColor: "text-[#E65100]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="p-5 flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}
          >
            <card.icon className={`w-5 h-5 ${card.iconColor}`} />
          </div>
          <div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-sm text-gray-500">
              {card.title}
              {card.subtitle && (
                <span className="text-xs ml-1">({card.subtitle})</span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

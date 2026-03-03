"use client";

import { Badge } from "@/components/ui/badge";
import {
  Copy,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  FileText,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export interface SimilarItem {
  id: string;
  title: string;
  slug?: string;
  score: number;
  level: "duplicate" | "high" | "medium" | "low" | "unique";
  details: { title: number; keywords: number; content: number };
  type: "article" | "trend";
}

interface SimilarityPanelProps {
  items: SimilarItem[];
  emptyMessage?: string;
}

const levelConfig = {
  duplicate: {
    label: "Doublon",
    badge: "bg-red-50 text-red-700 border-red-200",
    bar: "bg-red-500",
  },
  high: {
    label: "Forte",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    bar: "bg-orange-500",
  },
  medium: {
    label: "Moyenne",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    bar: "bg-amber-500",
  },
  low: {
    label: "Faible",
    badge: "bg-gray-50 text-gray-600 border-gray-200",
    bar: "bg-gray-400",
  },
  unique: {
    label: "Unique",
    badge: "bg-green-50 text-green-700 border-green-200",
    bar: "bg-green-500",
  },
};

export function SimilarityPanel({
  items,
  emptyMessage = "Aucun contenu similaire détecté.",
}: SimilarityPanelProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg">
        <CheckCircle className="w-4 h-4 shrink-0" />
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const config = levelConfig[item.level];
        return (
          <div
            key={`${item.type}-${item.id}`}
            className="p-3 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
          >
            {/* Header : type + titre + score */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                {item.type === "article" ? (
                  <FileText className="w-3.5 h-3.5 text-[#0066CC] shrink-0" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                )}
                <span className="text-sm text-gray-800 font-medium truncate">
                  {item.title}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className={`text-xs ${config.badge}`}>
                  {item.level === "duplicate" && (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  {item.level === "high" && (
                    <AlertTriangle className="w-3 h-3 mr-1" />
                  )}
                  {item.score}%
                </Badge>
                {item.slug && (
                  <Link
                    href={
                      item.type === "article"
                        ? `/articles/${item.slug}`
                        : `/dashboard/generator?trend_id=${item.id}`
                    }
                    target={item.type === "article" ? "_blank" : undefined}
                    className="text-[#0066CC] hover:text-[#004C99]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Barres de détail */}
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  ["Titre", item.details.title],
                  ["Mots-clés", item.details.keywords],
                  ["Contenu", item.details.content],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {label}
                    </span>
                    <span className="text-[10px] font-medium text-gray-500">
                      {value}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        value >= 70
                          ? "bg-red-500"
                          : value >= 40
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

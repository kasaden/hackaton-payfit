"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BenchmarkTable } from "@/components/dashboard/BenchmarkTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Benchmark {
  id: string;
  competitor: string;
  keyword: string;
  position: number;
  url: string;
  content_type: string;
  notes: string;
  checked_at: string;
}

export default function BenchmarkPage() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data } = await supabase
        .from("benchmarks")
        .select("*")
        .order("position", { ascending: true });
      setBenchmarks(data ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const competitors = ["all", ...new Set(benchmarks.map((b) => b.competitor))];
  const filtered =
    activeFilter === "all"
      ? benchmarks
      : benchmarks.filter((b) => b.competitor === activeFilter);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Benchmark concurrentiel</h1>
        <div className="h-96 bg-white rounded-xl border animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Benchmark concurrentiel</h1>
        <Badge variant="secondary">
          {benchmarks.length} entrées
        </Badge>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {competitors.map((c) => (
          <Button
            key={c}
            variant={activeFilter === c ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(c)}
            className={
              activeFilter === c
                ? "bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer"
                : "cursor-pointer"
            }
          >
            {c === "all" ? "Tous" : c}
            <Badge variant="secondary" className="ml-2 text-xs">
              {c === "all"
                ? benchmarks.length
                : benchmarks.filter((b) => b.competitor === c).length}
            </Badge>
          </Button>
        ))}
      </div>

      <BenchmarkTable benchmarks={filtered} activeFilter={activeFilter} />
    </div>
  );
}

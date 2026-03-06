"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface BenchmarkTableProps {
  benchmarks: Benchmark[];
  activeFilter: string;
}

export function BenchmarkTable({ benchmarks }: BenchmarkTableProps) {
  if (benchmarks.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
        Aucune donnée benchmark trouvée.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">Concurrent</TableHead>
            <TableHead>Mot-clé</TableHead>
            <TableHead className="w-24">Position</TableHead>
            <TableHead className="w-28">Type</TableHead>
            <TableHead className="w-64">URL</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {benchmarks.map((b, i) => {
            const posColor =
              b.position <= 3
                ? "bg-green-100 text-green-700"
                : b.position <= 6
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700";

            return (
              <TableRow
                key={b.id}
                className={i % 2 === 0 ? "" : "bg-gray-50/50"}
              >
                <TableCell className="font-medium text-sm">
                  {b.competitor}
                </TableCell>
                <TableCell className="text-sm">{b.keyword}</TableCell>
                <TableCell>
                  <Badge className={posColor}>#{b.position}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {b.content_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <a
                    href={`https://${b.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#0066CC] hover:underline truncate block max-w-[240px]"
                    title={b.url || ''}
                  >
                    {b.url ? (b.url.length > 50 ? b.url.slice(0, 50) + "..." : b.url) : '—'}
                  </a>
                </TableCell>
                <TableCell className="text-xs text-gray-500 max-w-xs">
                  {b.notes}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, ExternalLink, Trash2, RefreshCw, Pencil, RotateCw } from "lucide-react";
import Link from "next/link";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setArticles(data);
    } else {
      console.error("Erreur lors de la récupération des articles:", error);
    }
    setLoading(false);
  }

  // UPDATE : Basculer entre Publié et Brouillon
  async function togglePublishStatus(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    const { error } = await supabase
      .from("articles")
      .update({
        is_published: newStatus,
        published_at: newStatus ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (!error) {
      setArticles(
        articles.map((a) =>
          a.id === id ? { ...a, is_published: newStatus } : a,
        ),
      );
    } else {
      alert("Erreur lors de la mise à jour du statut.");
    }
  }

  // DELETE : Supprimer un article
  async function handleDelete(id: string) {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer définitivement cet article ?",
      )
    ) {
      return;
    }

    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (!error) {
      setArticles(articles.filter((a) => a.id !== id));
    } else {
      alert("Erreur lors de la suppression de l'article.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#152330]">
            Gestion des articles
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Retrouvez ici tous les articles générés par l&apos;IA.
          </p>
        </div>
        <Link href="/dashboard/generator">
          <Button className="bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Créer un article
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <RefreshCw className="w-6 h-6 animate-spin mb-2" />
            Chargement des articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-[#152330]">
              Aucun article
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Vous n&apos;avez pas encore généré d&apos;article.
            </p>
            <Link href="/dashboard/generator">
              <Button variant="outline" className="cursor-pointer">
                Générer mon premier article
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[40%]">Titre</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Mots</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[300px] text-[#152330]">
                        {article.title}
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-[300px]">
                        /articles/{article.slug}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`cursor-pointer transition-colors ${
                          article.is_published
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                        }`}
                        onClick={() =>
                          togglePublishStatus(article.id, article.is_published)
                        }
                      >
                        {article.is_published ? "Publié" : "Brouillon"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(article.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {article.word_count || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <a
                          href={`/articles/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-[#0066CC]"
                            title="Voir l'article"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                        <Link href={`/dashboard/generator?article_id=${article.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-[#0066CC]"
                            title="Modifier l'article"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/generator?article_id=${article.id}&regenerate=true`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                            title="Re-générer l'article"
                          >
                            <RotateCw className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(article.id)}
                          title="Supprimer l'article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

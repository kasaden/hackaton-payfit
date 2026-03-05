"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ComplianceGrid } from "@/components/dashboard/ComplianceGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Loader2,
  Check,
  FileText,
  Eye,
  CheckCircle,
  PenTool,
  ExternalLink,
  AlertTriangle,
  Copy,
  Search,
} from "lucide-react";
import Link from "next/link";

interface DuplicateMatch {
  article_id: string;
  article_title: string;
  article_slug: string;
  similarity: {
    score: number;
    details: { title: number; keywords: number; content: number };
    level: "duplicate" | "high" | "medium" | "low" | "unique";
  };
}

interface PromptTemplate {
  id: string;
  slug: string;
  name: string;
  system_prompt: string;
  user_prompt_template: string;
  variables: string[];
  is_default: boolean;
}

function GeneratorContent() {
  const searchParams = useSearchParams();
  const trendId = searchParams.get("trend_id");
  const articleId = searchParams.get("article_id");
  const isRegenerate = searchParams.get("regenerate") === "true";

  const [step, setStep] = useState(1);
  const [keywordPrimary, setKeywordPrimary] = useState("");
  const [keywordsSecondary, setKeywordsSecondary] = useState("");
  const [icpTarget, setIcpTarget] = useState("ICP 2");

  // --- PROMPT TEMPLATES FROM DB ---
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  // --- DUPLICATE CHECK ---
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [article, setArticle] = useState<{
    id: string;
    title: string;
    slug: string;
    content_markdown: string;
    word_count: number;
  } | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [allCompliant, setAllCompliant] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);

  // Fetch prompt templates from Supabase
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("prompt_templates")
      .select("*")
      .order("is_default", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPromptTemplates(data);
          const defaultTemplate = data.find((t: PromptTemplate) => t.is_default) || data[0];
          setSelectedTemplateSlug(defaultTemplate.slug);
          setCustomPrompt(defaultTemplate.user_prompt_template);
        }
      });
  }, []);

  // Mode édition : charger un article existant
  useEffect(() => {
    if (articleId) {
      setLoadingArticle(true);
      const supabase = createClient();
      supabase
        .from("articles")
        .select("*")
        .eq("id", articleId)
        .single()
        .then(({ data }) => {
          if (data) {
            setKeywordPrimary(data.keyword_primary || "");
            setKeywordsSecondary(
              (data.keywords_secondary || []).join(", "),
            );
            setIcpTarget(data.icp_target || "ICP 2");
            setArticle({
              id: data.id,
              title: data.title,
              slug: data.slug,
              content_markdown: data.content_markdown,
              word_count: data.word_count,
            });
            setEditedContent(data.content_markdown);
            // Mode édition directe : aller à l'étape 2
            // Mode re-génération : rester à l'étape 1
            if (!isRegenerate) {
              setStep(2);
            }
          }
          setLoadingArticle(false);
        });
    }
  }, [articleId, isRegenerate]);

  // Pré-remplir depuis la tendance
  useEffect(() => {
    if (trendId && !articleId) {
      const supabase = createClient();
      supabase
        .from("trends")
        .select("*")
        .eq("id", trendId)
        .single()
        .then(({ data }) => {
          if (data) {
            setKeywordPrimary(data.question);
            setIcpTarget(data.icp_target || "ICP 2");
          }
        });
    }
  }, [trendId, articleId]);

  // Mettre à jour le texte du prompt quand on change de template
  const handleTemplateChange = (slug: string) => {
    setSelectedTemplateSlug(slug);
    const template = promptTemplates.find((t) => t.slug === slug);
    if (template) {
      setCustomPrompt(template.user_prompt_template);
    }
  };

  const wordCount = editedContent
    .split(/\s+/)
    .filter((w: string) => w.length > 0).length;

  /** Vérifie les doublons avant de générer */
  async function checkDuplicates(): Promise<DuplicateMatch[]> {
    setCheckingDuplicates(true);
    try {
      const res = await fetch("/api/check-duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: keywordPrimary,
          keyword_primary: keywordPrimary,
          keywords_secondary: keywordsSecondary
            .split(",")
            .map((k: string) => k.trim())
            .filter(Boolean),
          exclude_id: article?.id,
        }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      setDuplicates(data.duplicates || []);
      setDuplicateChecked(true);
      return data.duplicates || [];
    } catch {
      return [];
    } finally {
      setCheckingDuplicates(false);
    }
  }

  /** Gère le clic sur Générer : check doublons d'abord, puis génère */
  async function handleGenerate() {
    if (!keywordPrimary.trim()) return;

    // Check doublons si pas encore fait
    if (!duplicateChecked) {
      const found = await checkDuplicates();
      const hasHighRisk = found.some((d) =>
        ["duplicate", "high"].includes(d.similarity.level)
      );
      if (hasHighRisk) {
        setShowDuplicateWarning(true);
        return; // On bloque, l'utilisateur doit confirmer
      }
    }

    // Lancer la génération
    setShowDuplicateWarning(false);
    setGenerating(true);

    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword_primary: keywordPrimary,
          keywords_secondary: keywordsSecondary
            .split(",")
            .map((k: string) => k.trim())
            .filter(Boolean),
          icp_target: icpTarget,
          trend_id: trendId || undefined,
          custom_prompt: customPrompt,
          template_slug: selectedTemplateSlug || undefined,
          article_id: isRegenerate && article ? article.id : undefined,
        }),
      });

      if (!res.ok) throw new Error("Erreur génération");

      const data = await res.json();
      setArticle(data);
      setEditedContent(data.content_markdown);
      setPublished(false);
      setDuplicateChecked(false);
      setStep(2);
    } catch {
      alert("Erreur lors de la génération. Vérifiez votre clé API OpenAI.");
    } finally {
      setGenerating(false);
    }
  }

  /** Forcer la génération malgré les doublons */
  function handleForceGenerate() {
    setDuplicateChecked(true); // skip le re-check
    setShowDuplicateWarning(false);
    handleGenerate();
  }

  // Reset le check quand les inputs changent
  useEffect(() => {
    setDuplicateChecked(false);
    setDuplicates([]);
    setShowDuplicateWarning(false);
  }, [keywordPrimary, keywordsSecondary]);

  async function handlePublish(isDraft: boolean) {
    if (!article) return;
    setPublishing(true);

    const supabase = createClient();
    await supabase
      .from("articles")
      .update({
        content_markdown: editedContent,
        word_count: wordCount,
        is_published: !isDraft,
        published_at: isDraft ? null : new Date().toISOString(),
        compliance_status: allCompliant ? "verified" : "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id);

    if (!isDraft && trendId) {
      await supabase
        .from("trends")
        .update({ status: "published" })
        .eq("id", trendId);
    }

    setPublishing(false);
    setPublished(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {articleId
            ? isRegenerate
              ? "Re-générer un article"
              : "Modifier un article"
            : "Générateur d\u0027articles"}
        </h1>
        <div className="flex gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-1.5 text-sm ${
                step >= s ? "text-[#0066CC] font-medium" : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step > s
                    ? "bg-[#0066CC] text-white"
                    : step === s
                      ? "bg-blue-100 text-[#0066CC]"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {step > s ? <Check className="w-3 h-3" /> : s}
              </div>
              <span className="hidden sm:inline">
                {s === 1 ? "Configuration" : "Relecture & Compliance"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chargement d'un article existant */}
      {loadingArticle && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-[#0066CC]" />
          <span className="text-gray-500">Chargement de l&apos;article...</span>
        </div>
      )}

      {/* Étape 1 — Configuration */}
      {step === 1 && !loadingArticle && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonne de gauche : Champs basiques */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-2">
              Paramètres de l&apos;article
            </h3>
            <div className="space-y-2">
              <Label>Mot-clé principal</Label>
              <Input
                placeholder="Ex: transparence des salaires 2026"
                value={keywordPrimary}
                onChange={(e) => setKeywordPrimary(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Mots-clés secondaires (séparés par des virgules)</Label>
              <Input
                placeholder="Ex: directive européenne, égalité salariale..."
                value={keywordsSecondary}
                onChange={(e) => setKeywordsSecondary(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>ICP cible</Label>
              <Select value={icpTarget} onValueChange={setIcpTarget}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ICP 1">
                    ICP 1 — Dirigeants TPE (1-9 salariés)
                  </SelectItem>
                  <SelectItem value="ICP 2">
                    ICP 2 — Responsables RH PME (10-50 salariés)
                  </SelectItem>
                  <SelectItem value="ICP 1+2">
                    ICP 1+2 — Les deux profils
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {trendId && (
              <Badge variant="secondary" className="text-xs">
                Lié à la tendance : {trendId.slice(0, 8)}...
              </Badge>
            )}
            {/* Bouton vérifier doublons */}
            <Button
              variant="outline"
              onClick={checkDuplicates}
              disabled={checkingDuplicates || !keywordPrimary.trim()}
              className="w-full cursor-pointer mt-4"
            >
              {checkingDuplicates ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vérification des doublons...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Vérifier les doublons
                </>
              )}
            </Button>

            {/* Résultat du check doublons */}
            {duplicateChecked && duplicates.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Aucun doublon détecté. Vous pouvez générer.
              </div>
            )}

            {duplicates.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {duplicates.length} article{duplicates.length > 1 ? "s" : ""}{" "}
                  similaire{duplicates.length > 1 ? "s" : ""} détecté
                  {duplicates.length > 1 ? "s" : ""}
                </div>
                <div className="space-y-2">
                  {duplicates.slice(0, 5).map((d) => (
                    <div
                      key={d.article_id}
                      className="flex items-center justify-between gap-2 p-2 bg-white rounded-md border border-amber-100"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Copy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-sm text-gray-700 truncate">
                          {d.article_title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            d.similarity.level === "duplicate"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : d.similarity.level === "high"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : d.similarity.level === "medium"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {d.similarity.score}%
                        </Badge>
                        <Link
                          href={`/articles/${d.article_slug}`}
                          target="_blank"
                          className="text-[#0066CC] hover:text-[#004C99]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                {showDuplicateWarning && (
                  <p className="text-xs text-amber-700">
                    Des articles très similaires existent déjà. Voulez-vous
                    quand même générer ?
                  </p>
                )}
              </div>
            )}

            {/* Bouton Générer */}
            <Button
              onClick={
                showDuplicateWarning ? handleForceGenerate : handleGenerate
              }
              disabled={generating || checkingDuplicates || !keywordPrimary.trim()}
              className={`w-full text-white cursor-pointer ${
                showDuplicateWarning
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-[#0066CC] hover:bg-[#004C99]"
              }`}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération en cours (10-30s)...
                </>
              ) : showDuplicateWarning ? (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Générer quand même
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer l&apos;article
                </>
              )}
            </Button>
          </Card>

          {/* Colonne de droite : Gestion du Prompt */}
          <Card className="p-6 flex flex-col space-y-4 bg-gray-50 border-dashed">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Prompt IA
              </h3>
            </div>
            <div className="space-y-2">
              <Label>Modèle de prompt</Label>
              <Select
                value={selectedTemplateSlug}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Chargement..." />
                </SelectTrigger>
                <SelectContent>
                  {promptTemplates.map((template) => (
                    <SelectItem key={template.slug} value={template.slug}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-grow flex flex-col">
              <div className="flex justify-between items-center">
                <Label>Éditeur du prompt</Label>
                <span className="text-xs text-gray-500">
                  Les balises {"{{variable}}"} seront remplacées
                  automatiquement.
                </span>
              </div>
              <Textarea
                className="font-mono text-xs flex-grow min-h-[300px] bg-white"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Étape 2 — Relecture & Compliance */}
      {step === 2 && article && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Colonne gauche : Article (2/3) */}
            <div className="xl:col-span-2 space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {article.title}
                    </h3>
                    <Link
                      href={`/articles/${article.slug}`}
                      target="_blank"
                      className="text-sm text-[#0066CC] hover:underline inline-flex items-center gap-1"
                    >
                      /articles/{article.slug}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <Badge
                    variant={
                      wordCount >= 800 && wordCount <= 1200
                        ? "default"
                        : "destructive"
                    }
                  >
                    {wordCount} mots
                  </Badge>
                </div>
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={24}
                  className="font-mono text-xs leading-relaxed"
                />
              </Card>

              {/* Preview */}
              <Card className="p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4" />
                  Aperçu
                </h3>
                <div className="max-w-none text-sm leading-relaxed">
                  {editedContent.split("\n").map((line, i) => {
                    if (line.startsWith("# "))
                      return (
                        <h1 key={i} className="text-lg font-bold mb-2">
                          {line.slice(2)}
                        </h1>
                      );
                    if (line.startsWith("## "))
                      return (
                        <h2 key={i} className="text-base font-semibold mt-5 mb-1.5">
                          {line.slice(3)}
                        </h2>
                      );
                    if (line.startsWith("### "))
                      return (
                        <h3 key={i} className="text-sm font-semibold mt-3 mb-1">
                          {line.slice(4)}
                        </h3>
                      );
                    if (line.startsWith("- "))
                      return (
                        <li key={i} className="ml-4 text-sm">
                          {line.slice(2)}
                        </li>
                      );
                    if (line.trim() === "") return <br key={i} />;
                    return (
                      <p key={i} className="mb-1.5 text-gray-700 text-sm">
                        {line}
                      </p>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Colonne droite : Compliance (1/3) */}
            <div className="space-y-4">
              <Card className="p-6 sticky top-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4" />
                  Grille compliance
                </h3>
                <ComplianceGrid onStatusChange={setAllCompliant} />

                <div className="mt-6 space-y-2">
                  {published ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <CheckCircle className="w-8 h-8 text-[#2E7D32] mx-auto mb-2" />
                      <p className="font-semibold text-[#2E7D32] text-sm">
                        Article publié !
                      </p>
                      <Link
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        className="text-xs text-[#0066CC] hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        Voir l&apos;article
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={() => handlePublish(false)}
                        disabled={publishing || !allCompliant}
                        className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white cursor-pointer"
                      >
                        {publishing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Publication...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Publier l&apos;article
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePublish(true)}
                        disabled={publishing}
                        className="w-full cursor-pointer"
                      >
                        Sauvegarder en brouillon
                      </Button>
                    </>
                  )}
                </div>
              </Card>

              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="w-full cursor-pointer"
              >
                Retour à la configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Générateur d&apos;articles</h1>
          <div className="h-96 bg-white rounded-xl border animate-pulse" />
        </div>
      }
    >
      <GeneratorContent />
    </Suspense>
  );
}

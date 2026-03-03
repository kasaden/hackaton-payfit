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
} from "lucide-react";

// --- DÉFINITION DES TEMPLATES DE PROMPTS ---
const PROMPT_TEMPLATES = [
  {
    id: "standard-seo",
    name: "Article SEO Standard (Long format)",
    content: `Rédige un article SEO de 800 à 1200 mots sur le sujet suivant :
**Mot-clé principal** : {{keyword_primary}}
**Mots-clés secondaires** : {{keywords_secondary}}
**ICP cible** : {{icp_target}}

Structure obligatoire :
1. Un titre H1 (en # markdown) incluant le mot-clé principal et l'année 2026
2. Une introduction de 2-3 phrases posant le problème et les enjeux
3. Une définition claire du concept (optimisée pour Google Featured Snippet / AI Overview)
4. 3-4 sous-parties H2 (en ## markdown) avec du contenu actionnable et des impacts paie concrets
5. Une section "Comment PayFit vous accompagne" (CTA soft, pas commercial agressif)
6. Une FAQ avec 3-4 questions en format ## FAQ puis **Q:** / R: (optimisées pour les PAA Google)
7. Chaque affirmation juridique doit citer la source entre parenthèses
8. Intègre des données chiffrées quand disponibles (seuils, taux, dates)

Règles GEO (Generative Engine Optimization) :
- Commence chaque section par une réponse directe
- Fournis des données chiffrées sourcées
- Termine la FAQ par une question qui ramène vers PayFit

Réponds uniquement avec l'article en markdown. Pas d'introduction ni de commentaire autour.`,
  },
  {
    id: "news-breve",
    name: "Brève Actualité Paie (Format court)",
    content: `Rédige une actualité "Flash Paie" de 400 mots maximum sur le sujet suivant :
**Sujet principal** : {{keyword_primary}}
**Mots-clés secondaires** : {{keywords_secondary}}
**Cible** : {{icp_target}}

Structure :
1. Titre H1 percutant incluant la date ou l'année
2. L'essentiel de l'information en gras (Quoi, quand, pour qui)
3. Un H2 "Impacts concrets sur la paie"
4. Un H2 "Ce qu'il faut faire dans PayFit"
5. Cite les sources légales.

Ton ton doit être direct et urgent. Réponds uniquement en markdown sans intro.`,
  },
];

function GeneratorContent() {
  const searchParams = useSearchParams();
  const trendId = searchParams.get("trend_id");

  const [step, setStep] = useState(1);
  const [keywordPrimary, setKeywordPrimary] = useState("");
  const [keywordsSecondary, setKeywordsSecondary] = useState("");
  const [icpTarget, setIcpTarget] = useState("ICP 2");

  // --- NOUVEAUX STATES POUR LES PROMPTS ---
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    PROMPT_TEMPLATES[0].id,
  );
  const [customPrompt, setCustomPrompt] = useState(PROMPT_TEMPLATES[0].content);

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

  // Pré-remplir depuis la tendance
  useEffect(() => {
    if (trendId) {
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
  }, [trendId]);

  // Mettre à jour le texte du prompt quand on change de template
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = PROMPT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setCustomPrompt(template.content);
    }
  };

  const wordCount = editedContent
    .split(/\s+/)
    .filter((w: string) => w.length > 0).length;

  async function handleGenerate() {
    if (!keywordPrimary.trim()) return;
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
          custom_prompt: customPrompt, // Envoi du prompt customisé à l'API
        }),
      });

      if (!res.ok) throw new Error("Erreur génération");

      const data = await res.json();
      setArticle(data);
      setEditedContent(data.content_markdown);
      setStep(2);
    } catch {
      alert("Erreur lors de la génération. Vérifiez votre clé API OpenAI.");
    } finally {
      setGenerating(false);
    }
  }

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
        <h1 className="text-2xl font-bold">Générateur d&apos;articles</h1>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
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
                {s === 1
                  ? "Configuration"
                  : s === 2
                    ? "Génération"
                    : "Compliance"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Étape 1 — Configuration */}
      {step === 1 && (
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
            <Button
              onClick={handleGenerate}
              disabled={generating || !keywordPrimary.trim()}
              className="w-full bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer mt-4"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération en cours (10-30s)...
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
                value={selectedTemplateId}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROMPT_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
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

      {/* Étape 2 — Génération */}
      {step === 2 && article && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Slug : /articles/{article.slug}
                </p>
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
              rows={20}
              className="font-mono text-sm"
            />
          </Card>

          {/* Preview */}
          <Card className="p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4" />
              Aperçu
            </h3>
            <div className="prose prose-sm max-w-none">
              {editedContent.split("\n").map((line, i) => {
                if (line.startsWith("# "))
                  return (
                    <h1 key={i} className="text-2xl font-bold mb-2">
                      {line.slice(2)}
                    </h1>
                  );
                if (line.startsWith("## "))
                  return (
                    <h2 key={i} className="text-xl font-semibold mt-6 mb-2">
                      {line.slice(3)}
                    </h2>
                  );
                if (line.startsWith("### "))
                  return (
                    <h3 key={i} className="text-lg font-medium mt-4 mb-1">
                      {line.slice(4)}
                    </h3>
                  );
                if (line.startsWith("- "))
                  return (
                    <li key={i} className="ml-4">
                      {line.slice(2)}
                    </li>
                  );
                if (line.trim() === "") return <br key={i} />;
                return (
                  <p key={i} className="mb-2 text-gray-700">
                    {line}
                  </p>
                );
              })}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="cursor-pointer"
            >
              Retour
            </Button>
            <Button
              onClick={() => setStep(3)}
              className="bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer"
            >
              Vérification compliance
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Étape 3 — Compliance */}
      {step === 3 && article && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">
              Grille de vérification compliance
            </h3>
            <ComplianceGrid onStatusChange={setAllCompliant} />
          </Card>

          {published ? (
            <Card className="p-6 bg-green-50 border-green-200 text-center">
              <CheckCircle className="w-10 h-10 text-[#2E7D32] mx-auto mb-2" />
              <h3 className="font-semibold text-[#2E7D32]">
                Article publié avec succès !
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Accessible sur /articles/{article.slug}
              </p>
            </Card>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="cursor-pointer"
              >
                Retour
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePublish(true)}
                disabled={publishing}
                className="cursor-pointer"
              >
                Sauvegarder en brouillon
              </Button>
              <Button
                onClick={() => handlePublish(false)}
                disabled={publishing || !allCompliant}
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white cursor-pointer"
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
            </div>
          )}
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

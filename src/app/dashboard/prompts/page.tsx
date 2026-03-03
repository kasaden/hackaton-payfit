"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Save, Loader2, Check } from "lucide-react";

interface PromptTemplate {
  id: string;
  slug: string;
  name: string;
  system_prompt: string;
  user_prompt_template: string;
  variables: string[];
  is_default: boolean;
}

export default function PromptsPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("prompt_templates")
      .select("*")
      .order("is_default", { ascending: false })
      .then(({ data }) => {
        if (data) setTemplates(data);
        setLoading(false);
      });
  }, []);

  const handleFieldChange = (
    id: string,
    field: keyof PromptTemplate,
    value: string,
  ) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  };

  const handleSave = async (template: PromptTemplate) => {
    setSavingId(template.id);
    setSavedId(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("prompt_templates")
      .update({
        name: template.name,
        system_prompt: template.system_prompt,
        user_prompt_template: template.user_prompt_template,
        updated_at: new Date().toISOString(),
      })
      .eq("id", template.id);

    setSavingId(null);
    if (!error) {
      setSavedId(template.id);
      setTimeout(() => setSavedId(null), 2000);
    } else {
      alert("Erreur lors de la sauvegarde : " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ScrollText className="w-6 h-6" />
          Prompt Templates
        </h1>
        <div className="h-96 bg-white rounded-xl border animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ScrollText className="w-6 h-6" />
          Prompt Templates
        </h1>
        <Badge variant="secondary">{templates.length} templates</Badge>
      </div>

      <p className="text-sm text-gray-500">
        Modifiez les prompts utilisés par le générateur d&apos;articles et les
        workflows N8N. Les variables entre {"{{accolades}}"} sont remplacées
        automatiquement.
      </p>

      {templates.map((template) => (
        <Card key={template.id} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {template.slug}
              </Badge>
              {template.is_default && (
                <Badge className="bg-[#0066CC] text-white text-xs">
                  Par défaut
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => handleSave(template)}
              disabled={savingId === template.id}
              className="bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer"
            >
              {savingId === template.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Sauvegarde...
                </>
              ) : savedId === template.id ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Sauvegardé
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Nom du template</Label>
            <Input
              value={template.name}
              onChange={(e) =>
                handleFieldChange(template.id, "name", e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label>System Prompt</Label>
            <Textarea
              className="font-mono text-xs min-h-[120px]"
              value={template.system_prompt}
              onChange={(e) =>
                handleFieldChange(
                  template.id,
                  "system_prompt",
                  e.target.value,
                )
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>User Prompt Template</Label>
              <div className="flex gap-1">
                {template.variables.map((v) => (
                  <Badge
                    key={v}
                    variant="secondary"
                    className="font-mono text-xs"
                  >
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
            </div>
            <Textarea
              className="font-mono text-xs min-h-[280px]"
              value={template.user_prompt_template}
              onChange={(e) =>
                handleFieldChange(
                  template.id,
                  "user_prompt_template",
                  e.target.value,
                )
              }
            />
          </div>
        </Card>
      ))}
    </div>
  );
}

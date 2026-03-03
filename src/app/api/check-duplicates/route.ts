import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, createRouteClient } from "@/lib/supabase/server";
import { isValidOrigin } from "@/lib/csrf";
import { findDuplicates, type DuplicateMatch } from "@/lib/similarity";

export async function POST(request: NextRequest) {
  try {
    // CSRF
    if (!isValidOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Auth
    const authClient = createRouteClient(request);
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, keyword_primary, keywords_secondary, exclude_id } = body;

    if (!title && !keyword_primary) {
      return NextResponse.json(
        { error: "Au moins un titre ou mot-clé principal requis" },
        { status: 400 }
      );
    }

    // Récupérer tous les articles existants
    const supabase = createServiceClient();
    const { data: articles, error } = await supabase
      .from("articles")
      .select(
        "id, title, slug, keyword_primary, keywords_secondary, content_markdown"
      );

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des articles" },
        { status: 500 }
      );
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ duplicates: [], count: 0 });
    }

    // Trouver les doublons
    const duplicates: DuplicateMatch[] = findDuplicates(
      {
        title: title || "",
        keyword_primary: keyword_primary || "",
        keywords_secondary: keywords_secondary || [],
      },
      articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        keyword_primary: a.keyword_primary || "",
        keywords_secondary: a.keywords_secondary || [],
        content_markdown: a.content_markdown || undefined,
      })),
      { threshold: 25, excludeId: exclude_id }
    );

    return NextResponse.json({
      duplicates,
      count: duplicates.length,
      has_high_risk: duplicates.some((d) =>
        ["duplicate", "high"].includes(d.similarity.level)
      ),
    });
  } catch (error) {
    console.error("Check duplicates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

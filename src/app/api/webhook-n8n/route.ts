import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { getPromptTemplate, interpolateTemplate } from '@/lib/prompts'
import { getLegalReferences, buildLegalReferencesPromptSection } from '@/lib/legal-references'
import { getPublishedArticlesForLinking, buildNetlinkingPromptSection } from '@/lib/netlinking'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Webhook endpoint for N8N automations.
 *
 * Accepts POST requests with:
 * - Header: X-Webhook-Secret (validated against WEBHOOK_SECRET env var)
 * - Body: { type: 'trend' | 'benchmark' | 'generate_article', data: object }
 *
 * Actions:
 * - type 'trend'            -> inserts data into the `trends` table
 * - type 'benchmark'        -> inserts data into the `benchmarks` table
 * - type 'generate_article' -> generates an SEO article via OpenAI and inserts into `articles`
 *       data: { keyword_primary, keywords_secondary[], icp_target, trend_id? }
 */
export async function POST(request: NextRequest) {
  try {
    // Validate webhook secret (mandatory)
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('WEBHOOK_SECRET environment variable is not configured')
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      )
    }

    const headerSecret = request.headers.get('X-Webhook-Secret')
    if (headerSecret !== webhookSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, data' },
        { status: 400 }
      )
    }

    const validTypes = ['trend', 'benchmark', 'generate_article', 'legal_reference']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Handle article generation from N8N
    if (type === 'generate_article') {
      return handleGenerateArticle(supabase, data)
    }

    const tableMap: Record<string, string> = {
      trend: 'trends',
      benchmark: 'benchmarks',
      legal_reference: 'legal_references',
    }
    const tableName = tableMap[type]

    const { error } = await supabase
      .from(tableName)
      .insert(data)

    if (error) {
      console.error(`Supabase insert into ${tableName} error:`, error)
      return NextResponse.json(
        { error: `Failed to insert into ${tableName}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook N8N API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleGenerateArticle(supabase: any, data: any) {
  const { keyword_primary, keywords_secondary, icp_target, trend_id, template_slug } = data

  if (!keyword_primary || !keywords_secondary || !icp_target) {
    return NextResponse.json(
      { error: 'generate_article requires: keyword_primary, keywords_secondary, icp_target' },
      { status: 400 }
    )
  }

  // Fetch prompt template from DB (fallback to hardcoded if DB fails)
  const FALLBACK_SYSTEM_PROMPT = `Tu es un rédacteur expert en droit social, paie et RH françaises, intégré à l'équipe Content de PayFit — la solution de paie et RH automatisée n°1 en France pour les TPE et PME.

TONE OF VOICE PAYFIT :
- Clarté et pédagogie : tu vulgarises le droit social sans le simplifier à l'excès.
- Expertise de confiance : chaque affirmation est sourcée, chaque conseil est actionnable.
- Proximité professionnelle : vouvoiement chaleureux. Tu parles de "vos salariés", "votre entreprise".
- Posture de partenaire : PayFit accompagne, ne vend pas. "PayFit vous accompagne" plutôt que "PayFit propose".

COMPLIANCE :
- Cite systématiquement les sources légales (Code du travail, CSS, directives EU, URSSAF, décrets).
- N'invente JAMAIS de données chiffrées. Formulations conditionnelles si incertain.
- Précise les dates d'application. Distingue : en projet / voté / en vigueur.`

  const FALLBACK_USER_PROMPT = `Rédige un article SEO de 800 à 1200 mots sur le sujet suivant :
**Mot-clé principal** : {{keyword_primary}}
**Mots-clés secondaires** : {{keywords_secondary}}
**ICP cible** : {{icp_target}}

Structure obligatoire :
1. Titre H1 (# markdown) incluant le mot-clé principal et l'année 2026 (max 65 caractères)
2. Introduction (2-3 phrases) avec le mot-clé principal dès la première phrase
3. Définition / Contexte légal (H2) optimisée Featured Snippet
4. 2-3 sous-parties H2 avec contenu actionnable et impacts paie concrets
5. Section "Comment PayFit vous accompagne" (H2) — CTA soft, ton partenaire
6. FAQ (H2 "Questions fréquentes") avec 3-4 questions au format ### Question ?
7. Note de compliance en fin d'article

Réponds uniquement avec l'article en markdown. Pas d'introduction ni de commentaire autour.`

  const secondaryKw = Array.isArray(keywords_secondary)
    ? keywords_secondary.join(', ')
    : keywords_secondary

  const template = await getPromptTemplate(template_slug || 'seo_standard')
  const systemPrompt = template?.system_prompt || FALLBACK_SYSTEM_PROMPT

  // Fetch legal references for the topic
  const secondaryArray = Array.isArray(keywords_secondary)
    ? keywords_secondary
    : keywords_secondary.split(',').map((k: string) => k.trim())
  const legalRefs = await getLegalReferences(keyword_primary, secondaryArray)
  const legalRefsSection = buildLegalReferencesPromptSection(legalRefs)

  // Fetch existing articles for internal linking
  const existingArticles = await getPublishedArticlesForLinking()
  const netlinkingSection = buildNetlinkingPromptSection(existingArticles)

  const userPrompt = interpolateTemplate(template?.user_prompt_template || FALLBACK_USER_PROMPT, {
    keyword_primary,
    keywords_secondary: secondaryKw,
    icp_target,
  }) + legalRefsSection + netlinkingSection

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  const content_markdown = completion.choices[0]?.message?.content
  if (!content_markdown) {
    return NextResponse.json(
      { error: 'OpenAI returned empty content' },
      { status: 500 }
    )
  }

  const firstLine = content_markdown.split('\n')[0]
  const title = firstLine.replace(/^#\s*/, '').trim()
  const slug = slugify(title)
  const word_count = content_markdown.split(/\s+/).filter((w: string) => w.length > 0).length

  // SEO meta description: extract intro, strip markdown, limit to 155 chars
  const nonEmptyLines = content_markdown.split('\n').filter((l: string) => l.trim() !== '')
  const introLines = nonEmptyLines
    .filter((l: string) => !l.startsWith('#') && !l.startsWith('-') && !l.startsWith('*'))
    .slice(0, 2)
  const rawIntro = introLines.join(' ')
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
  const meta_description = rawIntro.length > 155
    ? rawIntro.substring(0, 152) + '...'
    : rawIntro || title

  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      title,
      slug,
      keyword_primary,
      keywords_secondary: Array.isArray(keywords_secondary)
        ? keywords_secondary
        : keywords_secondary.split(',').map((k: string) => k.trim()),
      content_markdown,
      meta_description,
      word_count,
      is_published: false,
      compliance_status: 'pending',
      ...(trend_id ? { trend_id } : {}),
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase insert article error:', error)
    return NextResponse.json(
      { error: 'Failed to insert article' },
      { status: 500 }
    )
  }

  // Update trend status if linked
  if (trend_id) {
    await supabase
      .from('trends')
      .update({ status: 'article_generated' })
      .eq('id', trend_id)
  }

  return NextResponse.json({
    success: true,
    article: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      word_count: article.word_count,
    },
  })
}

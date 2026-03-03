import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'

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

    const validTypes = ['trend', 'benchmark', 'generate_article']
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

    const tableName = type === 'trend' ? 'trends' : 'benchmarks'

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
  const { keyword_primary, keywords_secondary, icp_target, trend_id } = data

  if (!keyword_primary || !keywords_secondary || !icp_target) {
    return NextResponse.json(
      { error: 'generate_article requires: keyword_primary, keywords_secondary, icp_target' },
      { status: 400 }
    )
  }

  const systemPrompt = `Tu es un rédacteur SEO expert en droit social et paie française, travaillant pour PayFit, le leader français de la gestion de paie automatisée pour TPE/PME. Tu rédiges des articles de blog destinés au site payfit.com/fr/fiches-pratiques/.
Ton style est : professionnel mais accessible, pédagogique sans être condescendant, concret et actionnable. Tu t'adresses à des dirigeants de TPE (1-9 salariés) et des responsables RH de PME (10-50 salariés). Tu cites toujours tes sources légales (articles du Code du travail, directives européennes, textes URSSAF). Tu n'inventes jamais de donnée chiffrée.`

  const secondaryKw = Array.isArray(keywords_secondary)
    ? keywords_secondary.join(', ')
    : keywords_secondary

  const userPrompt = `Rédige un article SEO de 800 à 1200 mots sur le sujet suivant :
**Mot-clé principal** : ${keyword_primary}
**Mots-clés secondaires** : ${secondaryKw}
**ICP cible** : ${icp_target}

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

Réponds uniquement avec l'article en markdown. Pas d'introduction ni de commentaire autour.`

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
  const lines = content_markdown.split('\n').filter((l: string) => l.trim() !== '')
  const introLine = lines.length > 1 ? lines[1] : title
  const meta_description = introLine.substring(0, 160)

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

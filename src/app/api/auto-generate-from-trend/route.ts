import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createRouteClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { isValidOrigin } from '@/lib/csrf'
import { checkRateLimit } from '@/lib/rate-limit'

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
 * Auto-generate an article from a trend.
 * Authenticated endpoint (uses user session, no webhook secret needed).
 * Called from the "Auto" button in the TrendTable.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isValidOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const authClient = createRouteClient(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { allowed } = checkRateLimit(`autogen:${user.id}`, { limit: 10, windowSeconds: 3600 })
    if (!allowed) {
      return NextResponse.json({ error: 'Trop de requêtes. Réessayez plus tard.' }, { status: 429 })
    }

    const { trend_id } = await request.json()
    if (!trend_id) {
      return NextResponse.json({ error: 'trend_id is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Fetch the trend
    const { data: trend, error: trendError } = await supabase
      .from('trends')
      .select('*')
      .eq('id', trend_id)
      .single()

    if (trendError || !trend) {
      return NextResponse.json({ error: 'Trend not found' }, { status: 404 })
    }

    // Generate keyword from question
    const keyword_primary = trend.question.split(':')[0]?.trim() || trend.question
    const keywords_secondary = [trend.source, trend.icp_target, 'paie 2026', 'obligations employeur']

    const systemPrompt = `Tu es un rédacteur SEO expert en droit social et paie française, travaillant pour PayFit, le leader français de la gestion de paie automatisée pour TPE/PME. Tu rédiges des articles de blog destinés au site payfit.com/fr/fiches-pratiques/.
Ton style est : professionnel mais accessible, pédagogique sans être condescendant, concret et actionnable. Tu t'adresses à des dirigeants de TPE (1-9 salariés) et des responsables RH de PME (10-50 salariés). Tu cites toujours tes sources légales (articles du Code du travail, directives européennes, textes URSSAF). Tu n'inventes jamais de donnée chiffrée.`

    const userPrompt = `Rédige un article SEO de 800 à 1200 mots sur le sujet suivant :
**Mot-clé principal** : ${keyword_primary}
**Mots-clés secondaires** : ${keywords_secondary.join(', ')}
**ICP cible** : ${trend.icp_target || 'ICP 1+2'}

Contexte : ${trend.signal || ''}

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
      return NextResponse.json({ error: 'OpenAI returned empty content' }, { status: 500 })
    }

    const firstLine = content_markdown.split('\n')[0]
    const title = firstLine.replace(/^#\s*/, '').trim()
    const slug = slugify(title)
    const word_count = content_markdown.split(/\s+/).filter((w: string) => w.length > 0).length
    const lines = content_markdown.split('\n').filter((l: string) => l.trim() !== '')
    const introLine = lines.length > 1 ? lines[1] : title
    const meta_description = introLine.substring(0, 160)

    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        keyword_primary,
        keywords_secondary,
        content_markdown,
        meta_description,
        word_count,
        user_id: user.id,
        trend_id,
        is_published: false,
        compliance_status: 'pending',
      })
      .select()
      .single()

    if (articleError) {
      console.error('Supabase insert article error:', articleError)
      return NextResponse.json({ error: 'Failed to insert article' }, { status: 500 })
    }

    // Update trend status
    await supabase
      .from('trends')
      .update({ status: 'article_generated' })
      .eq('id', trend_id)

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        word_count: article.word_count,
      },
    })
  } catch (error) {
    console.error('Auto-generate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

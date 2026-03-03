import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createRouteClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { checkRateLimit } from '@/lib/rate-limit'
import { isValidOrigin } from '@/lib/csrf'
import { getPromptTemplate, interpolateTemplate } from '@/lib/prompts'

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

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'origin (CSRF)
    if (!isValidOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Vérifier l'authentification
    const authClient = createRouteClient(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting : max 10 générations par utilisateur par heure
    const { allowed, remaining } = checkRateLimit(`generate:${user.id}`, { limit: 10, windowSeconds: 3600 })
    if (!allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez plus tard.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      )
    }

    const body = await request.json()
    const { keyword_primary, keywords_secondary, icp_target, trend_id, custom_prompt, article_id, template_slug } = body

    if (!keyword_primary || !keywords_secondary || !icp_target) {
      return NextResponse.json(
        { error: 'Missing required fields: keyword_primary, keywords_secondary, icp_target' },
        { status: 400 }
      )
    }

    // Validation des inputs
    if (typeof keyword_primary !== 'string' || keyword_primary.length > 200) {
      return NextResponse.json({ error: 'keyword_primary must be a string under 200 chars' }, { status: 400 })
    }
    if (!Array.isArray(keywords_secondary) || keywords_secondary.length > 20) {
      return NextResponse.json({ error: 'keywords_secondary must be an array of max 20 items' }, { status: 400 })
    }
    if (typeof icp_target !== 'string' || !['ICP 1', 'ICP 2', 'ICP 1+2'].includes(icp_target)) {
      return NextResponse.json({ error: 'icp_target must be "ICP 1", "ICP 2", or "ICP 1+2"' }, { status: 400 })
    }
    if (custom_prompt && (typeof custom_prompt !== 'string' || custom_prompt.length > 5000)) {
      return NextResponse.json({ error: 'custom_prompt must be a string under 5000 chars' }, { status: 400 })
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (article_id && !uuidRegex.test(article_id)) {
      return NextResponse.json({ error: 'article_id must be a valid UUID' }, { status: 400 })
    }
    if (trend_id && !uuidRegex.test(trend_id)) {
      return NextResponse.json({ error: 'trend_id must be a valid UUID' }, { status: 400 })
    }

    // Fetch prompt template from DB (fallback to hardcoded if DB fails)
    const FALLBACK_SYSTEM_PROMPT = `Tu es un rédacteur SEO expert en droit social et paie française, travaillant pour PayFit, le leader français de la gestion de paie automatisée pour TPE/PME. Tu rédiges des articles de blog destinés au site payfit.com/fr/fiches-pratiques/.
Ton style est : professionnel mais accessible, pédagogique sans être condescendant, concret et actionnable. Tu t'adresses à des dirigeants de TPE (1-9 salariés) et des responsables RH de PME (10-50 salariés). Tu cites toujours tes sources légales (articles du Code du travail, directives européennes, textes URSSAF). Tu n'inventes jamais de donnée chiffrée.`

    const template = await getPromptTemplate(template_slug || 'seo_standard')
    const systemPrompt = template?.system_prompt || FALLBACK_SYSTEM_PROMPT

    // custom_prompt from the generator UI overrides the DB template
    const userPromptTemplate = custom_prompt || template?.user_prompt_template || custom_prompt
    const userPrompt = interpolateTemplate(userPromptTemplate || '', {
      keyword_primary,
      keywords_secondary: keywords_secondary.join(', '),
      icp_target,
    })

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

    const word_count = content_markdown
      .split(/\s+/)
      .filter((word: string) => word.length > 0).length

    const lines = content_markdown.split('\n').filter((l: string) => l.trim() !== '')
    const introLine = lines.length > 1 ? lines[1] : title
    const meta_description = introLine.substring(0, 160)

    const supabase = createServiceClient()

    let data, error

    if (article_id) {
      // Mode re-génération : UPDATE l'article existant (vérifie que l'user est propriétaire)
      const result = await supabase
        .from('articles')
        .update({
          title,
          slug,
          keyword_primary,
          keywords_secondary,
          content_markdown,
          meta_description,
          word_count,
          updated_at: new Date().toISOString(),
        })
        .eq('id', article_id)
        .eq('user_id', user.id)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // Mode création : INSERT un nouvel article avec user_id
      const result = await supabase
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
          ...(trend_id ? { trend_id } : {}),
        })
        .select()
        .single()
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save article' },
        { status: 500 }
      )
    }

    if (trend_id) {
      const { error: updateError } = await supabase
        .from('trends')
        .update({ status: 'article_generated' })
        .eq('id', trend_id)

      if (updateError) {
        console.error('Failed to update trend status:', updateError)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Generate article API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
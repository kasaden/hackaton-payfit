import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '')   // Remove special chars
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-|-$/g, '')          // Trim leading/trailing hyphens
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyword_primary, keywords_secondary, icp_target, trend_id } = body

    if (!keyword_primary || !keywords_secondary || !icp_target) {
      return NextResponse.json(
        { error: 'Missing required fields: keyword_primary, keywords_secondary, icp_target' },
        { status: 400 }
      )
    }

    const systemPrompt = `Tu es un rédacteur SEO expert en droit social et paie française, travaillant pour PayFit, le leader français de la gestion de paie automatisée pour TPE/PME. Tu rédiges des articles de blog destinés au site payfit.com/fr/fiches-pratiques/.
Ton style est : professionnel mais accessible, pédagogique sans être condescendant, concret et actionnable. Tu t'adresses à des dirigeants de TPE (1-9 salariés) et des responsables RH de PME (10-50 salariés). Tu cites toujours tes sources légales (articles du Code du travail, directives européennes, textes URSSAF). Tu n'inventes jamais de donnée chiffrée.`

    const userPrompt = `Rédige un article SEO de 800 à 1200 mots sur le sujet suivant :
**Mot-clé principal** : ${keyword_primary}
**Mots-clés secondaires** : ${keywords_secondary.join(', ')}
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

    // Extract title from first line (# Title)
    const firstLine = content_markdown.split('\n')[0]
    const title = firstLine.replace(/^#\s*/, '').trim()

    // Generate slug from title
    const slug = slugify(title)

    // Count words
    const word_count = content_markdown
      .split(/\s+/)
      .filter((word: string) => word.length > 0).length

    // Extract meta description from intro (first paragraph after title)
    const lines = content_markdown.split('\n').filter((l: string) => l.trim() !== '')
    const introLine = lines.length > 1 ? lines[1] : title
    const meta_description = introLine.substring(0, 160)

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        keyword_primary,
        keywords_secondary,
        content_markdown,
        meta_description,
        word_count,
        ...(trend_id ? { trend_id } : {}),
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save article' },
        { status: 500 }
      )
    }

    // If trend_id provided, update the trend status
    if (trend_id) {
      const { error: updateError } = await supabase
        .from('trends')
        .update({ status: 'article_generated' })
        .eq('id', trend_id)

      if (updateError) {
        console.error('Failed to update trend status:', updateError)
        // Non-blocking: article was still created successfully
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

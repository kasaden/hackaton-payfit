import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { checkRateLimit } from '@/lib/rate-limit'
import { isValidOrigin } from '@/lib/csrf'

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

    // Rate limiting : max 30 scorings par utilisateur par heure
    const { allowed, remaining } = checkRateLimit(`score:${user.id}`, { limit: 30, windowSeconds: 3600 })
    if (!allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez plus tard.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      )
    }

    const body = await request.json()
    const { question } = body

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: question' },
        { status: 400 }
      )
    }

    if (question.length > 500) {
      return NextResponse.json(
        { error: 'question must be under 500 characters' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert SEO spécialisé en paie et RH françaises.',
        },
        {
          role: 'user',
          content: `Analyse cette question/thématique et donne un score de 1 à 5 sur trois critères :
- Nouveauté (la question est-elle liée à un changement récent ou imminent ?)
- Pertinence PayFit (est-ce en lien direct avec la gestion de paie PME/TPE ?)
- Volume potentiel (combien d'employeurs français pourraient chercher cette info ?)

Question : "${question}"

Réponds UNIQUEMENT en JSON valide :
{
  "score_novelty": X,
  "score_payfit_relevance": X,
  "score_volume": X,
  "source": "source probable",
  "signal": "explication en 1 phrase",
  "icp_target": "ICP 1" ou "ICP 2" ou "ICP 1+2",
  "suggested_format": "format de contenu recommandé"
}`,
        },
      ],
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: 'OpenAI returned empty content' },
        { status: 500 }
      )
    }

    // Parse JSON from response (handle potential markdown code blocks)
    const jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let scores
    try {
      scores = JSON.parse(jsonString)
    } catch {
      console.error('Failed to parse OpenAI response as JSON:', jsonString)
      return NextResponse.json(
        { error: 'Invalid JSON response from AI model' },
        { status: 502 }
      )
    }

    return NextResponse.json(scores)
  } catch (error) {
    console.error('Score trend API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

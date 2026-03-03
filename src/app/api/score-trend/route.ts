import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question } = body

    if (!question) {
      return NextResponse.json(
        { error: 'Missing required field: question' },
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
    const scores = JSON.parse(jsonString)

    return NextResponse.json(scores)
  } catch (error) {
    console.error('Score trend API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

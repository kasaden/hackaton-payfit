import { createServiceClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'

export interface InternalLink {
  slug: string
  title: string
  keyword_primary: string
}

/**
 * Fetch all published articles to provide as internal linking context
 * for the AI article generation prompt.
 * Excludes the article being regenerated (if any).
 */
export async function getPublishedArticlesForLinking(excludeArticleId?: string): Promise<InternalLink[]> {
  const supabase = createServiceClient()

  let query = supabase
    .from('articles')
    .select('slug, title, keyword_primary')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(50)

  if (excludeArticleId) {
    query = query.neq('id', excludeArticleId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch articles for netlinking:', error)
    return []
  }

  return (data || []).filter((a) => a.slug && a.title && a.keyword_primary)
}

/**
 * Build a prompt section listing existing articles for internal linking.
 * Returns an empty string if no articles exist.
 */
export function buildNetlinkingPromptSection(articles: InternalLink[]): string {
  if (articles.length === 0) return ''

  const articleList = articles
    .map((a) => `- "${a.title}" (mot-clé : ${a.keyword_primary}) → slug exact : /articles/${a.slug}`)
    .join('\n')

  return `

=== MAILLAGE INTERNE — OBLIGATOIRE ===
⚠️ Tu DOIS insérer entre 2 et 4 liens internes vers les articles ci-dessous. C'est une exigence SEO non négociable.

Syntaxe EXACTE : [texte ancre](/articles/slug-exact)
⚠️ Utilise UNIQUEMENT les slugs exacts listés ci-dessous. N'INVENTE JAMAIS un slug.
⚠️ N'utilise JAMAIS d'URL complète (https://...) pour les liens internes. Utilise uniquement le format /articles/slug.

EXEMPLES DE BONNE INTÉGRATION (naturelle, fluide) :
✅ "Ces changements impactent directement votre [bulletin de paie](/articles/bulletin-de-paie-2026) dès le mois prochain."
✅ "L'articulation de ces droits avec les arrêts de travail étant complexe, la question de la [gestion des congés payés](/articles/conges-payes-2026) mérite une attention particulière."
✅ "Pour sécuriser vos fiches de paie et éviter les litiges, il est essentiel de maîtriser les règles de [calcul des heures supplémentaires](/articles/heures-supplementaires-2026)."

CE QU'IL NE FAUT JAMAIS FAIRE :
❌ "Pour en savoir plus, consultez notre article sur [les congés payés](/articles/conges-payes-2026)."
❌ "Pour plus de détails, découvrez notre article sur [le bulletin de paie](/articles/bulletin-de-paie-2026)."
❌ "Consultez également notre guide sur [...]."
❌ Ajouter un lien en fin de paragraphe avec une formule d'incitation
❌ Créer un paragraphe ou une section dédiée aux liens internes
❌ Utiliser des URLs complètes : [texte](https://payfit.com/articles/...)

Règles :
1. Le lien doit être TISSÉ dans la phrase, comme une partie naturelle du propos — pas ajouté comme un appel à l'action
2. Le texte ancre = mot-clé de l'article cible ou variante naturelle, intégré dans la syntaxe de la phrase
3. Le lecteur ne doit pas sentir que le lien a été inséré artificiellement — il doit enrichir le sens de la phrase
4. Répartis les liens sur différentes sections H2
5. JAMAIS de lien dans les titres (H1/H2/H3), dans la FAQ, ou dans un bloc séparé
6. Ne lie que vers des articles thématiquement proches du sujet traité

Articles existants (choisis-en 2 à 4, utilise les slugs EXACTS) :
${articleList}`
}

/**
 * 2ème passe IA : injecter des liens internes naturellement dans un article existant.
 *
 * Cette fonction prend un article markdown déjà généré et demande à l'IA
 * d'y insérer 2-4 liens internes de manière fluide et naturelle.
 *
 * Contrairement au prompt de génération (où le netlinking est noyé parmi
 * d'autres instructions), ici l'IA a une SEULE mission : insérer des liens.
 *
 * @param contentMarkdown - Le contenu markdown de l'article
 * @param availableArticles - Les articles publiés vers lesquels créer des liens
 * @returns Le markdown avec les liens internes insérés
 */
export async function injectNetlinkingWithAI(
  contentMarkdown: string,
  availableArticles: InternalLink[]
): Promise<string> {
  if (availableArticles.length === 0) return contentMarkdown

  // Vérifier s'il y a déjà suffisamment de liens internes
  const existingLinks = (contentMarkdown.match(/\]\(\/articles\/[^)]+\)/g) || []).length
  if (existingLinks >= 3) return contentMarkdown

  const articleList = availableArticles
    .map((a) => `- "${a.title}" (mot-clé : ${a.keyword_primary}) → [texte ancre](/articles/${a.slug})`)
    .join('\n')

  const linksToAdd = Math.max(2, 4 - existingLinks)

  const systemPrompt = `Tu es un expert SEO spécialisé dans le maillage interne. Ta SEULE mission est d'insérer des liens internes dans un article existant.

RÈGLES STRICTES :
1. Tu reçois un article markdown et une liste d'articles cibles
2. Tu dois insérer entre 2 et ${linksToAdd} liens internes vers ces articles cibles
3. Les liens doivent être TISSÉS naturellement dans les phrases existantes
4. Tu dois retourner l'article COMPLET avec les liens insérés — ne supprime rien, ne réécris rien d'autre
5. Utilise la syntaxe exacte : [texte ancre](/articles/slug-exact)

COMMENT INSÉRER UN LIEN :
- Trouve une phrase qui mentionne un concept lié à un article cible
- Transforme le mot ou groupe de mots pertinent en lien
- Le texte ancre doit être le mot-clé de l'article cible ou une variante naturelle

EXEMPLE :
Phrase originale : "Les salariés ont droit à des congés payés chaque année."
Article cible : "Congés payés 2026" → slug : conges-payes-2026
Résultat : "Les salariés ont droit à des [congés payés](/articles/conges-payes-2026) chaque année."

INTERDICTIONS :
- NE JAMAIS ajouter de phrases comme "Pour en savoir plus, consultez..."
- NE JAMAIS créer un paragraphe ou bloc dédié aux liens
- NE JAMAIS modifier le sens ou la structure de l'article
- NE JAMAIS inventer de slug — utilise UNIQUEMENT ceux fournis
- NE JAMAIS mettre de lien dans un titre (H1/H2/H3) ou dans la section FAQ
- NE JAMAIS utiliser d'URL complète (https://...)
- NE JAMAIS ajouter de texte qui n'existait pas dans l'article original

Tu dois retourner UNIQUEMENT le markdown modifié, sans commentaire ni explication.`

  const userPrompt = `Voici l'article à enrichir avec des liens internes :

---
${contentMarkdown}
---

Articles cibles disponibles (choisis les plus pertinents thématiquement, insère ${linksToAdd} liens) :
${articleList}

Retourne l'article COMPLET avec les liens insérés. Rien d'autre.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.1, // Très bas pour minimiser les modifications non souhaitées
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const result = completion.choices[0]?.message?.content
    if (!result || result.trim().length === 0) {
      console.error('Netlinking AI pass returned empty content, keeping original')
      return contentMarkdown
    }

    // Vérification de sécurité : le résultat doit contenir au moins 80% du contenu original
    // (protection contre une IA qui réécrirait tout)
    const originalWordCount = contentMarkdown.split(/\s+/).length
    const resultWordCount = result.split(/\s+/).length
    const ratio = resultWordCount / originalWordCount

    if (ratio < 0.8 || ratio > 1.3) {
      console.error(`Netlinking AI pass returned suspicious content (word ratio: ${ratio.toFixed(2)}), keeping original`)
      return contentMarkdown
    }

    // Vérifier que des liens ont bien été ajoutés
    const newLinks = (result.match(/\]\(\/articles\/[^)]+\)/g) || []).length
    if (newLinks <= existingLinks) {
      console.error('Netlinking AI pass did not add any links, keeping original')
      return contentMarkdown
    }

    return result
  } catch (error) {
    console.error('Netlinking AI pass failed:', error)
    return contentMarkdown
  }
}

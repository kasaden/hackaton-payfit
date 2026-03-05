import { createServiceClient } from '@/lib/supabase/server'

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
    .map((a) => `- "${a.title}" (mot-clé : ${a.keyword_primary}) -> [texte ancre](/articles/${a.slug})`)
    .join('\n')

  return `

=== MAILLAGE INTERNE (IMPORTANT pour le SEO) ===
Voici les articles déjà publiés sur le blog PayFit. Tu DOIS insérer entre 2 et 4 liens internes vers ces articles.

Règles de maillage :
1. **Placement naturel** : insère les liens dans le corps des sections H2, de manière fluide dans le texte. PAS dans la FAQ, PAS dans un bloc séparé, PAS dans l'introduction.
2. **Texte ancre optimisé SEO** : utilise comme texte ancre le mot-clé principal de l'article lié ou une variante naturelle (PAS "cliquez ici", PAS "en savoir plus", PAS le titre complet).
3. **Pertinence thématique** : ne lie que vers des articles thématiquement proches. Un article sur le SMIC peut lier vers un article sur le bulletin de paie, mais pas vers un article sur les congés payés sans raison.
4. **Syntaxe markdown** : [texte ancre](/articles/slug-de-larticle)
5. **Répartition** : répartis les liens sur différentes sections, pas tous au même endroit.

Articles existants :
${articleList}`
}

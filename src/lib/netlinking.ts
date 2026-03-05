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

Maillage interne (IMPORTANT pour le SEO) :
Voici les articles déjà publiés sur le blog. Tu DOIS insérer entre 2 et 4 liens internes vers ces articles, de manière naturelle dans le corps du texte (PAS dans la FAQ, PAS dans un bloc séparé).
Utilise la syntaxe markdown pour les liens : [texte ancre pertinent](/articles/slug-de-larticle)
Le texte ancre doit être naturel et contextuel (pas "cliquez ici", mais une expression qui s'intègre dans la phrase).
Ne lie que vers des articles réellement pertinents par rapport au sujet traité.

Articles existants :
${articleList}`
}

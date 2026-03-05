import { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://payfit-seo-copilot.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  const articleEntries: MetadataRoute.Sitemap = (articles || []).map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: article.updated_at || article.published_at || new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    {
      url: SITE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/quiz`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...articleEntries,
  ]
}

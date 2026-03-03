import { createServiceClient } from '@/lib/supabase/server'

export interface PromptTemplate {
  id: string
  slug: string
  name: string
  system_prompt: string
  user_prompt_template: string
  variables: string[]
  is_default: boolean
  created_at: string
  updated_at: string
}

/**
 * Fetch a prompt template by slug (uses service role, bypasses RLS).
 */
export async function getPromptTemplate(slug: string): Promise<PromptTemplate | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Failed to fetch prompt template:', slug, error)
    return null
  }
  return data
}

/**
 * Fetch the default template (is_default = true).
 */
export async function getDefaultPromptTemplate(): Promise<PromptTemplate | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('is_default', true)
    .limit(1)
    .single()

  if (error) {
    console.error('Failed to fetch default prompt template:', error)
    return null
  }
  return data
}

/**
 * Replace {{variable}} placeholders in a template string.
 */
export function interpolateTemplate(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return result
}

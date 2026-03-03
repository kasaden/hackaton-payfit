import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} environment variable`)
  return value
}

// Client avec service_role pour les API routes (bypass RLS)
export function createServiceClient() {
  return createSupabaseClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  )
}

// Client pour API routes — lit les cookies depuis le NextRequest pour vérifier l'auth
export function createRouteClient(request: NextRequest) {
  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // API routes: pas besoin de set les cookies ici
        },
      },
    }
  )
}

// Client pour Server Components avec cookies
export async function createServerComponentClient() {
  const cookieStore = await cookies()
  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  )
}

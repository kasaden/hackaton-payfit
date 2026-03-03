/**
 * Simple in-memory rate limiter.
 * Pour la production, utiliser un store Redis (ex: @upstash/ratelimit).
 */

const requests = new Map<string, { count: number; resetAt: number }>()

// Nettoyage périodique des entrées expirées (toutes les 60s)
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of requests) {
    if (now > value.resetAt) {
      requests.delete(key)
    }
  }
}, 60_000)

interface RateLimitOptions {
  /** Nombre max de requêtes dans la fenêtre */
  limit: number
  /** Durée de la fenêtre en secondes */
  windowSeconds: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const windowMs = options.windowSeconds * 1000
  const entry = requests.get(key)

  if (!entry || now > entry.resetAt) {
    // Nouvelle fenêtre
    const resetAt = now + windowMs
    requests.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: options.limit - 1, resetAt }
  }

  if (entry.count >= options.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: options.limit - entry.count, resetAt: entry.resetAt }
}

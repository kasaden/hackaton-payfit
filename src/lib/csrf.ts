import { NextRequest } from 'next/server'

/**
 * Vérifie que la requête provient bien du même origin (protection CSRF).
 * Retourne true si la requête est sûre, false sinon.
 */
export function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  // Pas d'origin header = requête same-origin depuis le navigateur ou appel serveur
  if (!origin) return true

  try {
    const originUrl = new URL(origin)
    // Vérifie que l'origin correspond au host
    return originUrl.host === host
  } catch {
    return false
  }
}

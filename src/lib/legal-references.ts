import { createServiceClient } from '@/lib/supabase/server'

export interface LegalReference {
  id: string
  reference_code: string
  reference_type: string
  title: string
  content_excerpt: string
  url: string | null
  theme: string
  keywords: string[]
  applicable_date: string | null
  status: string
}

/**
 * Thème mapping: associe des mots-clés courants à des thèmes legal_references.
 * Permet un matching même quand le keyword_primary ne correspond pas exactement.
 */
const KEYWORD_TO_THEMES: Record<string, string[]> = {
  // SMIC
  'smic': ['smic'],
  'salaire minimum': ['smic'],
  'revalorisation': ['smic'],
  // Bulletin de paie
  'bulletin de paie': ['bulletin_paie'],
  'fiche de paie': ['bulletin_paie'],
  'bulletin simplifié': ['bulletin_paie'],
  // Congés
  'congés payés': ['conges_payes'],
  'congé': ['conges_payes'],
  'jours de repos': ['conges_payes', 'temps_travail'],
  'arrêt maladie': ['conges_payes'],
  // DSN
  'dsn': ['dsn'],
  'déclaration sociale': ['dsn'],
  // Temps de travail
  'temps de travail': ['temps_travail'],
  'heures supplémentaires': ['temps_travail'],
  '35 heures': ['temps_travail'],
  'durée légale': ['temps_travail'],
  // Cotisations
  'cotisations': ['cotisations'],
  'charges sociales': ['cotisations'],
  'urssaf': ['cotisations'],
  'réduction fillon': ['cotisations'],
  'allègement': ['cotisations'],
  'exonération': ['cotisations'],
  // Transparence salariale
  'transparence salariale': ['transparence_salariale'],
  'égalité salariale': ['transparence_salariale'],
  'index égalité': ['transparence_salariale'],
  'écart de rémunération': ['transparence_salariale'],
  // Rupture
  'licenciement': ['rupture_contrat'],
  'rupture conventionnelle': ['rupture_contrat'],
  'préavis': ['rupture_contrat'],
  'indemnité': ['rupture_contrat'],
  // Embauche
  'embauche': ['embauche'],
  'dpae': ['embauche'],
  'contrat de travail': ['embauche'],
  // Télétravail
  'télétravail': ['teletravail'],
  'travail à distance': ['teletravail'],
  'remote': ['teletravail'],
  // Formation
  'cpf': ['formation'],
  'formation': ['formation'],
  'compte personnel de formation': ['formation'],
}

/**
 * Normalise un texte pour le matching (minuscules, sans accents).
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Identifie les thèmes pertinents à partir du keyword_primary
 * et des keywords_secondary.
 */
export function matchThemes(keywordPrimary: string, keywordsSecondary: string[] = []): string[] {
  const allKeywords = [keywordPrimary, ...keywordsSecondary]
  const themes = new Set<string>()

  for (const keyword of allKeywords) {
    const normalizedKw = normalize(keyword)

    // Match exact et partiel sur le mapping
    for (const [pattern, mappedThemes] of Object.entries(KEYWORD_TO_THEMES)) {
      const normalizedPattern = normalize(pattern)
      if (normalizedKw.includes(normalizedPattern) || normalizedPattern.includes(normalizedKw)) {
        for (const theme of mappedThemes) {
          themes.add(theme)
        }
      }
    }
  }

  return Array.from(themes)
}

/**
 * Récupère les références légales pertinentes pour un sujet donné.
 * Utilise un double matching : par thème (via mapping) + par keywords GIN (overlap).
 */
export async function getLegalReferences(
  keywordPrimary: string,
  keywordsSecondary: string[] = []
): Promise<LegalReference[]> {
  const supabase = createServiceClient()

  // 1. Matching par thèmes
  const themes = matchThemes(keywordPrimary, keywordsSecondary)

  // 2. Query: chercher par thème OU par overlap de keywords
  //    On priorise les refs "en_vigueur" et on exclut les abrogées
  let query = supabase
    .from('legal_references')
    .select('id, reference_code, reference_type, title, content_excerpt, url, theme, keywords, applicable_date, status')
    .in('status', ['en_vigueur', 'vote', 'en_projet'])
    .order('theme')
    .limit(15)

  if (themes.length > 0) {
    // Match par thèmes identifiés
    query = query.in('theme', themes)
  } else {
    // Fallback: match par overlap de keywords avec la colonne keywords[]
    query = query.overlaps('keywords', [keywordPrimary, ...keywordsSecondary])
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch legal references:', error)
    return []
  }

  return data || []
}

/**
 * Construit la section du prompt qui injecte les sources légales vérifiées.
 * Format optimisé pour que le LLM cite correctement.
 */
export function buildLegalReferencesPromptSection(references: LegalReference[]): string {
  if (references.length === 0) return ''

  const refsByTheme = new Map<string, LegalReference[]>()
  for (const ref of references) {
    const existing = refsByTheme.get(ref.theme) || []
    existing.push(ref)
    refsByTheme.set(ref.theme, existing)
  }

  let section = `

=== SOURCES LÉGALES VÉRIFIÉES (OBLIGATOIRE) ===
Voici les textes de loi et références légales vérifiées et applicables au sujet traité.
Tu DOIS t'appuyer sur ces sources pour rédiger l'article. Cite-les entre parenthèses dans le texte.

RÈGLES D'UTILISATION :
1. Cite le code de référence exact tel qu'indiqué et crée un lien markdown vers l'URL officielle fournie (ex: "[article L.3231-2 du Code du travail](https://www.legifrance.gouv.fr/...)")
2. Si aucune URL n'est fournie pour une référence, cite-la entre parenthèses sans lien (ex: "(article L.3231-2 du Code du travail)")
3. Utilise les extraits fournis comme base factuelle — ne modifie PAS les chiffres ou les dates
4. Indique le statut quand ce n'est pas "en vigueur" (ex: "en projet", "voté, transposition avant le...")
5. N'invente PAS d'autres références légales ni d'autres URLs au-delà de celles fournies ici. Si tu as besoin d'une source que tu ne trouves pas dans cette liste, utilise une formulation conditionnelle ("conformément aux dispositions en vigueur")
6. IMPORTANT : ces règles concernent uniquement les sources LÉGALES. Les liens internes vers d'autres articles du blog ([texte](/articles/slug)) sont une consigne SÉPARÉE et DOIVENT être insérés normalement dans le texte
7. N'invente JAMAIS une URL. Utilise UNIQUEMENT les URLs fournies ci-dessous

`

  for (const [theme, refs] of refsByTheme) {
    section += `--- ${theme.toUpperCase().replace(/_/g, ' ')} ---\n`
    for (const ref of refs) {
      const statusLabel = ref.status !== 'en_vigueur' ? ` [${ref.status.toUpperCase()}]` : ''
      const dateLabel = ref.applicable_date ? ` (applicable depuis le ${ref.applicable_date})` : ''
      const urlLabel = ref.url ? `\n  URL officielle : ${ref.url}` : ''
      section += `• ${ref.reference_code} (${ref.reference_type.replace(/_/g, ' ')})${statusLabel}${dateLabel}\n`
      section += `  "${ref.title}"${urlLabel}\n`
      section += `  ${ref.content_excerpt}\n\n`
    }
  }

  return section
}
